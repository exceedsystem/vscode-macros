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

    // Load macro and run command
    await loadAndRunMacro(macroModPath, async (macroCommands) => {
      const commandName = await selectMacroCommand(macroCommands);
      if (!commandName) return;
      await runMacroCommand(macroCommands, commandName);
    });
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

  // UserMacro1
  const disUserCommand1 = vscode.commands.registerCommand('vscode-macros.user1', async () => {
    await runUserMacro(0);
  });
  context.subscriptions.push(disUserCommand1);

  // UserMacro2
  const disUserCommand2 = vscode.commands.registerCommand('vscode-macros.user2', async () => {
    await runUserMacro(1);
  });
  context.subscriptions.push(disUserCommand2);

  // UserMacro3
  const disUserCommand3 = vscode.commands.registerCommand('vscode-macros.user3', async () => {
    await runUserMacro(2);
  });
  context.subscriptions.push(disUserCommand3);

  // UserMacro4
  const disUserCommand4 = vscode.commands.registerCommand('vscode-macros.user4', async () => {
    await runUserMacro(3);
  });
  context.subscriptions.push(disUserCommand4);

  // UserMacro5
  const disUserCommand5 = vscode.commands.registerCommand('vscode-macros.user5', async () => {
    await runUserMacro(4);
  });
  context.subscriptions.push(disUserCommand5);
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
  const macroFilePath = cfg.get<string>(CFG_MACRO_MODULE_PATH);
  if (!macroFilePath) {
    // Path not set in the configuration
    await vscode.window.showErrorMessage('The macro file is not set in the configuration.');
    return;
  }
  const macroModPath = GetMacroModPath(macroFilePath);
  if (!fs.existsSync(macroModPath)) {
    // Macro file not found
    await vscode.window.showErrorMessage(`The macro file '${macroModPath}' not found.`);
    return;
  }
  return macroModPath;
}

/**
 * Set the macro module path to the configuration
 * @param macroModPath Path to the macro module file
 */
async function setMacroModulePathConf(macroModPath: string) {
  const cfg = getConfiguration();
  let processedPath = macroModPath;
  if (VSCODE_PORTABLE) {
    // If vscode is running as a portable mode, convert an absolute path to a relative path
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
 * Load macro and run command
 * @param macroModPath Path to the macro module file
 * @param runCommandCallback Callback to run a macro
 */
async function loadAndRunMacro(macroModPath: string, runCommandCallback: (macroCommands: IMacroCommands) => Promise<void>) {
  if (!macroModPath.length) {
    await vscode.window.showErrorMessage('The macro file is not set.');
    return;
  }
  if (!fs.existsSync(macroModPath)) {
    await vscode.window.showErrorMessage(`The macro file '${macroModPath}' does not exist.`);
    return;
  }

  // Load the macro script module from file
  try {
    // Before execute a command, remove the cached macro module from a NodeRequire cache
    delete require.cache[macroModPath];
    // Load macro module to NodeRequire
    const macroMod = require(macroModPath);
    // Check commands
    if (!isMacroCommands(macroMod.macroCommands)) {
      await vscode.window.showErrorMessage('Invalid macro command definition in the macro file.');
      return;
    }
    // return macroMod.macroCommands as IMacroCommands;
    await runCommandCallback(macroMod.macroCommands);
  } catch (e) {
    await vscode.window.showErrorMessage(`An error occurred while loading the macro file (${e}).`);
    return;
  } finally {
    // After execute a command, remove the cached macro module from a NodeRequire cache.
    delete require.cache[macroModPath];
  }
}

/**
 * Run the user macro command
 * @param userMacroIndex User macro index(0 to 4)
 */
async function runUserMacro(userMacroIndex: number) {
  const cfg = getConfiguration();
  const userMacros = cfg.get<IUserMacro[]>('userMacroCommands');
  if (!userMacros || userMacroIndex >= userMacros.length) {
    await vscode.window.showErrorMessage(`The 'User Macro${userMacroIndex + 1}' is not set in the 'setting.json'.`);
    return;
  }

  // Load user macro
  const userMacro = userMacros[userMacroIndex];

  // Load macro and run command
  const macroModPath = GetMacroModPath(userMacro.path);
  await loadAndRunMacro(macroModPath, async (macroCommands) => {
    await runMacroCommand(macroCommands, userMacro.name);
  });
}

/**
 * Run the macro command
 * @param macroCommands The MacroCommands object
 * @param macroName The macro name to run
 */
async function runMacroCommand(macroCommands: IMacroCommands, macroName: string) {
  try {
    if (!macroName.length) {
      vscode.window.showErrorMessage(`The macro command name is empty.`);
      return;
    }
    if (!(macroName in macroCommands)) {
      vscode.window.showErrorMessage(`The macro command name '${macroName}' is not defined.`);
      return;
    }
    // Run the selected macro.
    const ret = await macroCommands[macroName].func();
    if (ret === undefined) {
      // Successful
      vscode.window.setStatusBarMessage(`Macro '${macroName}' completed.`, 5000);
      return;
    } else {
      // Failed
      if (ret.length > 0) {
        await vscode.window.showWarningMessage(`${macroName}:${ret}`);
      }
    }
  } catch (e) {
    // An uncaught exception occurred
    await vscode.window.showErrorMessage(`An uncaught exception occurred in the macro '${macroName}'(${e}).`);
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
 * Get the path of the macro module considering the portable mode
 * @param orgMacroModPath original macro module path
 */
function GetMacroModPath(orgMacroModPath: string): string {
  let macroModPath = orgMacroModPath;
  if (VSCODE_PORTABLE && !path.isAbsolute(macroModPath)) {
    // If vscode is running as a portable mode and the macro file path is a relative path, prepend a path to the data directory
    macroModPath = path.join(VSCODE_PORTABLE, orgMacroModPath);
  }
  return macroModPath;
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

/**
 * User macro
 */
interface IUserMacro {
  path: string,
  name: string
}