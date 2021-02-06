import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const CONFIG_NAME = 'vscodemacros';
const CFG_MACRO_MODULE_PATH = 'macroFilePath';
const CFG_RUN_MACRO_AFTER_FILE_SELECTION = 'runMacroAfterMacroFileSelection';
const VSCODE_PORTABLE = process.env.VSCODE_PORTABLE;

export function activate(context: vscode.ExtensionContext) {
  // SelectMacroFileCommand
  const disSelectMacroFileCommand = vscode.commands.registerCommand('vscode-macros.selectMacroFile', async () => {
    const macroModPath = await getMacroModulePathConf();
    if (!macroModPath) return;

    const macroDirPath = path.dirname(macroModPath);
    const selection = await selectMacroFile(macroDirPath);
    if (!selection) return;

    // Delete the current cached macro module from a NodeRequire cache
    delete require.cache[macroModPath];
    // Update the macro module path to the selected one
    await setMacroModulePathConf(path.join(macroDirPath, selection));

    // Run the macro according to the configuration setting
    const runMacroFlag = await getRunMacroAfterFileSelectionConf();
    if (runMacroFlag) {
      await vscode.commands.executeCommand('vscode-macros.run');
    }
  });
  context.subscriptions.push(disSelectMacroFileCommand);

  // OpenMacroDirectoryCommand
  const disOpenMacroDirectoryCommand = vscode.commands.registerCommand('vscode-macros.openMacroDirectory', async () => {
    const macroModPath = await getMacroModulePathConf();
    if (!macroModPath) return;

    const macroDirPath = path.dirname(macroModPath);
    const macroDirUri = vscode.Uri.file(macroDirPath);
    // Open a macro directory in a new editor window
    await vscode.commands.executeCommand('vscode.openFolder', macroDirUri, true);
  });
  context.subscriptions.push(disOpenMacroDirectoryCommand);

  // RunMacroCommand
  const disRunCommand = vscode.commands.registerCommand('vscode-macros.run', async () => {
    const macroModPath = await getMacroModulePathConf();
    if (!macroModPath) return;

    // Delete the cached macro module from a NodeRequire cache
    delete require.cache[macroModPath];

    // Load the macro script module from file
    let macroMod;
    try {
      macroMod = require(macroModPath);
    } catch (e) {
      await vscode.window.showErrorMessage(`An error occurred while loading the macro file (${e}).`);
      return;
    }

    // Check commands
    if (!isMacroCommands(macroMod.macroCommands)) {
      await vscode.window.showErrorMessage('Invalid macro command definition in the macro file.');
      return;
    }

    // Select & Run the command
    const macroCommands: IMacroCommands = macroMod.macroCommands;
    const commandName = await selectMacroCommand(macroCommands);
    if (!commandName) {
      // Cancelled
      return;
    }
    await runMacroCommand(macroCommands, commandName);
  });
  context.subscriptions.push(disRunCommand);

  // DebugMacroCommand
  const disDebugCommand = vscode.commands.registerCommand('vscode-macros.debug', async () => {
    // Launch a development extension host
    await vscode.debug.startDebugging(undefined, {
      name: 'Debug a macro',
      type: 'extensionHost',
      request: 'launch',
      args: ['--extensionDevelopmentPath=${cwd}'],
    });
  });
  context.subscriptions.push(disDebugCommand);
}

export function deactivate() { }

/**
 * Get configuration settings of the extension
 */
function getConfiguration(): vscode.WorkspaceConfiguration {
  return vscode.workspace.getConfiguration(CONFIG_NAME);
}

/**
 * Get the macro module path from the macro configuration
 * @returns Full path to the macro module file
 */
async function getMacroModulePathConf() {
  const cfg = getConfiguration();
  const macroModPath = cfg.get<string>(CFG_MACRO_MODULE_PATH);
  if (!macroModPath) {
    // Path not set in the configuration
    await vscode.window.showErrorMessage('The macro file is not set in the configuration.');
    return;
  }
  let processedPath = macroModPath;
  if (VSCODE_PORTABLE && !path.isAbsolute(processedPath)) {
    // If vscode is running as a portable version and the macro file path is a relative path, prepend a path to the data directory
    processedPath = path.join(VSCODE_PORTABLE, macroModPath);
  }
  if (!fs.existsSync(processedPath)) {
    // Macro file not found
    await vscode.window.showErrorMessage(`The macro file '${processedPath}' not found.`);
    return;
  }
  return processedPath;
}

/**
 * Set the macro module path to the configuration
 * @param macroModPath Path to the macro module file
 */
async function setMacroModulePathConf(macroModPath: string) {
  const cfg = getConfiguration();
  let processedPath = macroModPath;
  if (VSCODE_PORTABLE) {
    // If vscode is running as a portable version, convert an absolute path to a relative path
    processedPath = path.relative(VSCODE_PORTABLE, processedPath);
  }
  // Update global configuration
  await cfg.update(CFG_MACRO_MODULE_PATH, processedPath, vscode.ConfigurationTarget.Global);
}

/**
 * Get a setting from the configuration that to run a macro after the file selection
 */
async function getRunMacroAfterFileSelectionConf() {
  const cfg = getConfiguration();
  const runMacroFlag = cfg.get<boolean>(CFG_RUN_MACRO_AFTER_FILE_SELECTION);
  return runMacroFlag ? true : false;
}

/**
 * Select the macro file from the macro directory
 * @param macroDirPath Full path to the macro directory
 */
async function selectMacroFile(macroDirPath: string) {
  const macroFiles = fs.readdirSync(macroDirPath).filter((fileName) => {
    const filePath = path.join(macroDirPath, fileName);
    return fs.statSync(filePath).isFile() && path.extname(fileName) === '.js';
  });
  if (!macroFiles) {
    await vscode.window.showErrorMessage('There are no macro files in the macro directory.');
    return;
  }

  // Select the macro file
  const fileNames = macroFiles.map((fileName) => fileName).sort();
  const selection = await vscode.window.showQuickPick(fileNames, {
    canPickMany: false,
    placeHolder: 'Select a macro file.',
  });
  return selection;
}

/**
 * Select the macro command and run it
 * @param macroCommands The MacroCommands object
 */
async function selectMacroCommand(macroCommands: IMacroCommands) {
  // Get macro names in a user defined order
  const macroNames = Object.keys(macroCommands).sort((a, b) => macroCommands[a].no - macroCommands[b].no);
  // Select the macro name to run
  const selection = await vscode.window.showQuickPick(macroNames, {
    canPickMany: false,
    placeHolder: 'Select a command to run.',
  });
  return selection;
}

/**
 * Run the macro command
 * @param macroCommands The MacroCommands object
 * @param selection The macro name to run
 */
async function runMacroCommand(macroCommands: IMacroCommands, selection: string) {
  try {
    // Run the selected macro.
    const ret = await macroCommands[selection].func();
    if (ret === undefined) {
      // Successful
      vscode.window.setStatusBarMessage(`Macro '${selection}' completed.`, 5000);
      return;
    } else {
      // Failed
      if (ret.length > 0) {
        await vscode.window.showWarningMessage(`${selection}:${ret}`);
      }
    }
  } catch (e) {
    // An uncaught exception occurred
    await vscode.window.showErrorMessage(`An uncaught exception occurred in the macro '${selection}'(${e}).`);
  }
}

/**
 *  Check if the object is a macro command object
 * @param arg Subject to be inspected
 * @returns If arg is the macro command, return true
 */
function isMacroCommands(arg: unknown): arg is IMacroCommands {
  if (typeof arg !== 'object' || arg === null) {
    return false;
  }
  for (const command of Object.entries(arg)) {
    if (command.length !== 2 || typeof command[0] !== 'string' || typeof command[1] !== 'object') {
      return false;
    }
    if (typeof (command[1] as IMacroCommand).no !== 'number' || typeof (command[1] as IMacroCommand).func !== 'function') {
      return false;
    }
  }
  return true;
}

/**
 * Macro commands
 */
interface IMacroCommands {
  [name: string]: IMacroCommand;
}

/**
 * Macro command
 */
interface IMacroCommand {
  no: number;
  func: () => string | undefined;
}
