import * as fs from 'fs';
import * as path from 'path';
import { register, Service } from 'ts-node';
import * as vscode from 'vscode';
import { ConfigInfo, ConfigManager } from './configManager';

const CFG_MACRO_MODULE_PATH = 'macroFilePath';
const CFG_RUN_MACRO_AFTER_FILE_SELECTION = 'runMacroAfterMacroFileSelection';
const CFG_USER_MACRO_COMMANDS = 'userMacroCommands';
const LABEL_OPEN_SETTINGS = 'Open settings';
const CMD_PREFERENCE_OPEN_SETTINGS = 'workbench.action.openSettings';
const VSCODEMACROS_SETTINGS = '@ext:EXCEEDSYSTEM.vscode-macros';
const USER_MACRO_NUMBER_DIGITS = 2;
const TSCONFIG_FILE_NAME = 'tsconfig.json';
const TYPESCRIPT_EXTENSION = '.ts';

const vscmGlobal: NodeJS.Global = global;

/**
 * Activate
 */
export function activate(context: vscode.ExtensionContext) {
  /**
   * SelectMacroFile Command
   */
  const disSelectMacroFileCommand = vscode.commands.registerCommand('vscode-macros.selectMacroFile', async () => {
    const macroModDirPathInfo = await getMacroModuleDirectoryPathInfo();
    if (!macroModDirPathInfo) return;

    const selectedMacroModule = await selectMacroModule(macroModDirPathInfo.expanded);
    if (!selectedMacroModule) return;

    // Update a macro module path to the selected one
    await ConfigManager.updateConfigValue(CFG_MACRO_MODULE_PATH, path.join(macroModDirPathInfo.original, selectedMacroModule));

    // Run a macro according to the configuration setting
    const runMacroFlag = await getRunMacroAfterFileSelectionFlag();
    if (runMacroFlag) {
      await vscode.commands.executeCommand('vscode-macros.run');
    }
  });
  context.subscriptions.push(disSelectMacroFileCommand);

  /**
   * OpenMacroDirectory Command
   */
  const disOpenMacroDirectoryCommand = vscode.commands.registerCommand('vscode-macros.openMacroDirectory', async () => {
    const macroModDirPathInfo = await getMacroModuleDirectoryPathInfo();
    if (!macroModDirPathInfo) return;

    // Open a macro directory in a new editor window
    const macroDirUri = vscode.Uri.file(macroModDirPathInfo.expanded);
    await vscode.commands.executeCommand('vscode.openFolder', macroDirUri, true);
  });
  context.subscriptions.push(disOpenMacroDirectoryCommand);

  /**
   * RunMacro Command
   */
  const disRunCommand = vscode.commands.registerCommand('vscode-macros.run', async () => {
    const configInfo = ConfigManager.getConfigInfo();
    if (!configInfo) return;

    const macroModPath = await getMacroModulePathFromConfig(configInfo);
    if (!macroModPath) return;

    const macroModPathInfo = makeMacroModulePathInfo(configInfo.resource?.fsPath ?? '', macroModPath);
    if (!fs.existsSync(macroModPathInfo.expanded)) {
      await vscode.window.showErrorMessage(`The macro file '${macroModPathInfo.expanded}' not found.`);
      return;
    }

    // Load a macro module and run a command
    await loadAndRunMacro(macroModPathInfo.expanded, async (macroCommands) => {
      const commandName = await selectMacroCommand(macroCommands);
      if (!commandName) return;

      await runMacroCommand(macroCommands, commandName);
    });
  });
  context.subscriptions.push(disRunCommand);

  /**
   * DebugMacro Command
   */
  const disDebugCommand = vscode.commands.registerCommand('vscode-macros.debug', async () => {
    // Launch a development extension host
    await vscode.debug.startDebugging(undefined, {
      name: 'Debug a macro',
      type: 'extensionHost',
      request: 'launch',
      args: ['--extensionDevelopmentPath=${cwd}'],
      outFiles: ['${cwd}/*.js'],
    });
  });
  context.subscriptions.push(disDebugCommand);

  /**
   * UserMacro Commands(1 to 10)
   */
  const disUserCommands = (() => {
    const disCmds: vscode.Disposable[] = [];
    for (let i = 0; i < 10; ++i) {
      const disCmd = vscode.commands.registerCommand(`vscode-macros.user${i + 1}`, async () => {
        await runUserMacro(i);
      });
      disCmds.push(disCmd);
      context.subscriptions.push(disCmd);
    }
    return disCmds;
  })();

  /**
   * ShowMacroList Command
   */
  const disShowMacroList = vscode.commands.registerCommand('vscode-macros.runUserMacro', async () => {
    const configInfo = ConfigManager.getConfigInfo();
    if (!configInfo) return;

    const userMacros = ConfigManager.getConfigValue<UserMacroInfo[]>(configInfo, CFG_USER_MACRO_COMMANDS);
    if (!userMacros) return;

    if (userMacros.length === 0) {
      const selectedItem = await vscode.window.showErrorMessage('User Macro not set in the configuration.', LABEL_OPEN_SETTINGS);
      if (selectedItem === LABEL_OPEN_SETTINGS)
        await vscode.commands.executeCommand(CMD_PREFERENCE_OPEN_SETTINGS, VSCODEMACROS_SETTINGS);
      return;
    }

    interface UserMacroPickItem extends vscode.QuickPickItem {
      index: number;
    }

    // Extract only the commands that are set.
    const userMacroPickItems = userMacros
      .map((userMacroInfo, i) => {
        return <UserMacroPickItem>{
          index: i,
          label: userMacroInfo.name && userMacroInfo.path ? `${LeftPadWithZeros(i + 1, USER_MACRO_NUMBER_DIGITS)}: ${userMacroInfo.name}(${userMacroInfo.path})` : '',
        };
      })
      .filter((userMacroInfo) => {
        return userMacroInfo.label;
      });

    var selectedUserMacroPickItem = await vscode.window.showQuickPick(userMacroPickItems, {
      canPickMany: false,
      placeHolder: 'Select a User Macro command to run.',
    });
    if (selectedUserMacroPickItem) {
      await runUserMacro(selectedUserMacroPickItem.index);
    }
  });
  context.subscriptions.push(disShowMacroList);
}

/**
 * Deactivate
 */
export function deactivate() { }

/**
 * Get the path of the macro module from configuration
 * @param configInfo The source of the configuration
 * @returns A macro module path
 */
async function getMacroModulePathFromConfig(configInfo: ConfigInfo) {
  const macroModPath = ConfigManager.getConfigValue<string>(configInfo, CFG_MACRO_MODULE_PATH);
  if (!macroModPath) {
    const selectedItem = await vscode.window.showErrorMessage('The macro file is not set in the configuration.', LABEL_OPEN_SETTINGS);
    if (selectedItem === LABEL_OPEN_SETTINGS)
      await vscode.commands.executeCommand(CMD_PREFERENCE_OPEN_SETTINGS, VSCODEMACROS_SETTINGS);
    return;
  }

  return macroModPath;
}

/**
 * Get the path of the macro module directory from configuration
 * @returns A macro module directory path
 */
async function getMacroModuleDirectoryPathInfo() {
  const configInfo = ConfigManager.getConfigInfo();
  if (!configInfo) return;

  const macroModPath = await getMacroModulePathFromConfig(configInfo);
  if (!macroModPath) return;

  const macroModPathInfo = makeMacroModulePathInfo(configInfo.resource?.fsPath ?? '', macroModPath);
  const macroModDirPath = path.dirname(macroModPathInfo.expanded);
  if (macroModDirPath === '.' || !fs.existsSync(macroModDirPath)) {
    await vscode.window.showErrorMessage(`The macro directory '${macroModDirPath}' not found.`);
    return;
  }

  return <PathInfo>{
    original: path.dirname(macroModPath),
    expanded: macroModDirPath,
  };
}

/**
 * Get the setting of whether or not to run macro after selecting a macro module
 * @returns 'true' if run macro after selecting a macro module
 */
async function getRunMacroAfterFileSelectionFlag() {
  const configInfo = ConfigManager.getConfigInfo();
  if (!configInfo) return;

  const runMacroFlag = ConfigManager.getConfigValue<boolean>(configInfo, CFG_RUN_MACRO_AFTER_FILE_SELECTION);

  return runMacroFlag ?? false;
}

/**
 * Select a macro module from the macro directory
 * @param macroDirPath Full path to the directory where the macros are stored
 * @returns A name of the macro module
 */
async function selectMacroModule(macroDirPath: string) {
  const macroModules = fs.readdirSync(macroDirPath).filter((fileName) => {
    const filePath = path.join(macroDirPath, fileName);
    return isSupportedMacroFile(filePath);
  });

  if (!macroModules || macroModules.length === 0) {
    await vscode.window.showErrorMessage(`There are no macro files in the macro directory '${macroDirPath}'.`);
    return;
  }

  // Select the macro module
  const sortedMacroModules = macroModules.map((fileName) => fileName).sort();
  const selectedMacroModule = await vscode.window.showQuickPick(sortedMacroModules, {
    canPickMany: false,
    placeHolder: 'Select a macro file.',
  });

  return selectedMacroModule;
}

/**
 * Select a macro command and run it
 * @param macroCommands The MacroCommands object
 */
async function selectMacroCommand(macroCommands: MacroCommands) {
  // Get macro names in a user defined order
  const macroNames = Object.keys(macroCommands).sort((a, b) => macroCommands[a].no - macroCommands[b].no);
  // Select a macro name to run
  const selectedCommand = await vscode.window.showQuickPick(macroNames, {
    canPickMany: false,
    placeHolder: 'Select a command to run.',
  });

  return selectedCommand;
}

/**
 * Load the macro module, and then run the macro command
 * @param macroModPath Full path to the macro module file
 * @param runCommandCallback Callback for the macro run
 */
async function loadAndRunMacro(macroModPath: string, runCommandCallback: (macroCommands: MacroCommands) => Promise<void>) {
  if (!macroModPath.length) {
    await vscode.window.showErrorMessage('The macro file is not set.');
    return;
  }

  if (!fs.existsSync(macroModPath)) {
    await vscode.window.showErrorMessage(`The macro file '${macroModPath}' does not exist.`);
    return;
  }

  try {
    // Enable TypeScript if tsconfig.json exists
    const tsConfigFilePath = path.join(path.dirname(macroModPath), TSCONFIG_FILE_NAME);
    if (fs.existsSync(tsConfigFilePath)) {
      if (vscmGlobal.tsnService) {
        vscmGlobal.tsnService.enabled(false);
      }
      vscmGlobal.tsnService = register({ project: tsConfigFilePath });
    } else if (path.extname(macroModPath).toLowerCase() === TYPESCRIPT_EXTENSION) {
      await vscode.window.showErrorMessage(`${TSCONFIG_FILE_NAME} does not exist.`);
      return;
    }

    // Load macro module
    const macroMod: MacroCommands = require(macroModPath) as MacroCommands;

    // Verify commands
    if (!isMacroCommands(macroMod.macroCommands)) {
      await vscode.window.showErrorMessage('Invalid macro command definition in the macro file.');
      return;
    }

    // return macroMod.macroCommands as IMacroCommands
    await runCommandCallback(macroMod.macroCommands);
  } catch (e) {
    await vscode.window.showErrorMessage(`An error occurred while loading the macro file (${e}).`);
  } finally {
    if (vscmGlobal.tsnService) {
      vscmGlobal.tsnService.enabled(false);
    }
    // Unload macro module
    delete require.cache[macroModPath];
  }
}

/**
 * Run a user macro command
 * @param index Macro index number(0 to 9)
 */
async function runUserMacro(index: number) {
  const configInfo = ConfigManager.getConfigInfo();
  if (!configInfo) return;

  // Get user macro command information from the configuration
  const userMacros = ConfigManager.getConfigValue<UserMacroInfo[]>(configInfo, CFG_USER_MACRO_COMMANDS);
  if (!userMacros || index >= userMacros.length) {
    const selectedItem = await vscode.window.showErrorMessage(`The 'User Macro ${LeftPadWithZeros(index + 1, USER_MACRO_NUMBER_DIGITS)}' is not set in the 'settings.json'.`, LABEL_OPEN_SETTINGS);
    if (selectedItem === LABEL_OPEN_SETTINGS)
      await vscode.commands.executeCommand(CMD_PREFERENCE_OPEN_SETTINGS, VSCODEMACROS_SETTINGS);
    return;
  }

  // Load a macro and run command
  const userMacro = userMacros[index];
  if (!(userMacro.name && userMacro.path)) {
    const selectedItem = await vscode.window.showErrorMessage(`The name or path of the 'User Macro ${LeftPadWithZeros(index + 1, USER_MACRO_NUMBER_DIGITS)}' in the 'settings.json' is empty.`, LABEL_OPEN_SETTINGS);
    if (selectedItem === LABEL_OPEN_SETTINGS)
      await vscode.commands.executeCommand(CMD_PREFERENCE_OPEN_SETTINGS, VSCODEMACROS_SETTINGS);
    return;
  }
  const macroModPathInfo = makeMacroModulePathInfo(configInfo.resource?.fsPath ?? '', userMacro.path);
  await loadAndRunMacro(macroModPathInfo.expanded, async (macroCommands) => {
    await runMacroCommand(macroCommands, userMacro.name);
  });
}

/**
 * Run the macro command
 * @param macroCommands The MacroCommands object
 * @param macroName Name of the macro command to run
 */
async function runMacroCommand(macroCommands: MacroCommands, macroName: string) {
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
      vscode.window.setStatusBarMessage(`'${macroName}' has been completed.`, 5000);
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
 * Check if the file extension is supported
 *
 * @param filePath The full path of the file to check.
 * @returns 'true' if the file is supported
 */
function isSupportedMacroFile(filePath: string): boolean {
  const extensions = ['.js', '.cjs', '.ts'];
  return fs.statSync(filePath).isFile() && extensions.includes(path.extname(filePath).toLowerCase());
}

/**
 *  Verify if the object is a macro command object
 * @param arg Subject to be inspected
 * @returns If arg is the macro command, return true
 */
function isMacroCommands(arg: unknown): arg is MacroCommands {
  if (typeof arg !== 'object' || arg === null) {
    return false;
  }
  for (const command of Object.entries(arg)) {
    if (command.length !== 2 || typeof command[0] !== 'string' || typeof command[1] !== 'object') {
      return false;
    }
    if (typeof (command[1] as MacroCommand).no !== 'number' || typeof (command[1] as MacroCommand).func !== 'function') {
      return false;
    }
  }
  return true;
}

/**
 * Get a macro module path information
 * @param workspacePath Full path to the workspace. (Workspace/WorkspaceFolder)
 * @param macroModulePath Path to the macro module
 * @returns Path information of a macro module
 */
function makeMacroModulePathInfo(workspacePath: string, macroModulePath: string): PathInfo {
  // Expand environment variables
  const expandedChildPath = ExpandEnvVars(macroModulePath);

  // If path is absolute then return
  if (path.isAbsolute(expandedChildPath))
    return <PathInfo>{
      original: macroModulePath,
      expanded: expandedChildPath,
    };

  return <PathInfo>{
    original: path.join(workspacePath, macroModulePath),
    expanded: path.join(workspacePath, expandedChildPath),
  };
}

/**
 * Expand environment variables in a string
 * @param text A string containing environment variables
 * @returns String after environment variables expansion
 */
function ExpandEnvVars(text: string): string {
  return text.replace(/{([^{}]+)}/g, (m, p1) => process.env[p1] ?? '');
}

/**
 * Left padding with zeros
 * @param num A numeric value to be zero padding
 * @param digits Total digits
 * @returns  Zero padded numeric string
 */
function LeftPadWithZeros(num: number, digits: number): string {
  return num.toString().padStart(digits, '0');
}

/**
 * Macro commands
 */
interface MacroCommands {
  [name: string]: MacroCommand;
}

/**
 * Macro command
 */
interface MacroCommand {
  no: number;
  func: () => string | undefined;
}

/**
 * User macro information
 */
interface UserMacroInfo {
  path: string;
  name: string;
}

/**
 * Path information
 */
interface PathInfo {
  original: string;
  expanded: string;
}

/**
 * Custom global class
 */
declare global {
  namespace NodeJS {
    interface Global {
      tsnService: Service | undefined;
    }
  }
}
