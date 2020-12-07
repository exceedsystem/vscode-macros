import * as vscode from 'vscode';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('vscode-macros.run', () => {
    // Load configuration of an extension
    const configuration = vscode.workspace.getConfiguration('vscodemacros');
    // Get the macro module file path from the configuration
    const macroModulePath: string = configuration.macroFilePath;

    if (macroModulePath.length === 0) {
      // Macro path not set in configuration
      vscode.window.showErrorMessage('The macro file is not set in the configuration.');
      return;
    }
    if (!fs.existsSync(macroModulePath)) {
      // Macro file not found
      vscode.window.showErrorMessage(`The macro file '${macroModulePath}' not found.`);
      return;
    }

    // Delete the cached macro module from NodeRequire cache
    delete require.cache[macroModulePath];

    // Load the macro script module from file
    let macroModule;
    try {
      macroModule = require(macroModulePath);
    } catch (e) {
      vscode.window.showErrorMessage(`An error occurred while loading the macro file (${e}).`);
      return;
    }
    const macroCommands: { [name: string]: { no: number; func: () => string | undefined } } = macroModule.macroCommands;
    if (macroCommands === undefined) {
      vscode.window.showErrorMessage('Invalid macro command definition in the macro file.');
      return;
    }
    // Get macro names in a user defined order
    var macroNames = Object.keys(macroCommands).sort((a, b) => macroCommands[a].no - macroCommands[b].no);
    // Select the macro name to run
    vscode.window.showQuickPick(macroNames, { canPickMany: false }).then((selection) => {
      if (selection === undefined) {
        // Cancelled
        return;
      }
      try {
        // Run a selected macro.
        const ret = macroCommands[selection].func();
        if (ret === undefined) {
          // Successful
          vscode.window.setStatusBarMessage(`Macro '${selection}' completed.`, 5000);
        } else {
          // Failed
          if (ret.length > 0) {
            vscode.window.showWarningMessage(`${selection}:${ret}`);
          }
        }
      } catch (e) {
        // An uncaught exception occurred
        vscode.window.showErrorMessage(`An uncaught exception occurred in the macro '${selection}'(${e}).`);
      }
    });
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
