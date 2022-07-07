"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.deactivate = exports.activate = void 0;
var vscode = require("vscode");
var fs = require("fs");
var path = require("path");
var configManager_1 = require("./configManager");
var CFG_MACRO_MODULE_PATH = 'macroFilePath';
var CFG_RUN_MACRO_AFTER_FILE_SELECTION = 'runMacroAfterMacroFileSelection';
var CFG_USER_MACRO_COMMANDS = 'userMacroCommands';
var LABEL_OPEN_SETTINGS = 'Open settings';
var CMD_PREFERENCE_OPEN_SETTINGS = 'workbench.action.openSettings';
var VSCODEMACROS_SETTINGS = '@ext:EXCEEDSYSTEM.vscode-macros';
var USER_MACRO_NUMBER_DIGITS = 2;
/**
 * Activate
 */
function activate(context) {
    var _this = this;
    /**
     * SelectMacroFile Command
     */
    var disSelectMacroFileCommand = vscode.commands.registerCommand('vscode-macros.selectMacroFile', function () { return __awaiter(_this, void 0, void 0, function () {
        var macroModDirPathInfo, selectedMacroModule, runMacroFlag;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getMacroModuleDirectoryPathInfo()];
                case 1:
                    macroModDirPathInfo = _a.sent();
                    if (!macroModDirPathInfo)
                        return [2 /*return*/];
                    return [4 /*yield*/, selectMacroModule(macroModDirPathInfo.expanded)];
                case 2:
                    selectedMacroModule = _a.sent();
                    if (!selectedMacroModule)
                        return [2 /*return*/];
                    // Update a macro module path to the selected one
                    return [4 /*yield*/, configManager_1.ConfigManager.updateConfigValue(CFG_MACRO_MODULE_PATH, path.join(macroModDirPathInfo.original, selectedMacroModule))];
                case 3:
                    // Update a macro module path to the selected one
                    _a.sent();
                    return [4 /*yield*/, getRunMacroAfterFileSelectionFlag()];
                case 4:
                    runMacroFlag = _a.sent();
                    if (!runMacroFlag) return [3 /*break*/, 6];
                    return [4 /*yield*/, vscode.commands.executeCommand('vscode-macros.run')];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6: return [2 /*return*/];
            }
        });
    }); });
    context.subscriptions.push(disSelectMacroFileCommand);
    /**
     * OpenMacroDirectory Command
     */
    var disOpenMacroDirectoryCommand = vscode.commands.registerCommand('vscode-macros.openMacroDirectory', function () { return __awaiter(_this, void 0, void 0, function () {
        var macroModDirPathInfo, macroDirUri;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getMacroModuleDirectoryPathInfo()];
                case 1:
                    macroModDirPathInfo = _a.sent();
                    if (!macroModDirPathInfo)
                        return [2 /*return*/];
                    macroDirUri = vscode.Uri.file(macroModDirPathInfo.expanded);
                    return [4 /*yield*/, vscode.commands.executeCommand('vscode.openFolder', macroDirUri, true)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    context.subscriptions.push(disOpenMacroDirectoryCommand);
    /**
     * RunMacro Command
     */
    var disRunCommand = vscode.commands.registerCommand('vscode-macros.run', function () { return __awaiter(_this, void 0, void 0, function () {
        var configInfo, macroModPath, macroModPathInfo;
        var _this = this;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    configInfo = configManager_1.ConfigManager.getConfigInfo();
                    if (!configInfo)
                        return [2 /*return*/];
                    return [4 /*yield*/, getMacroModulePathFromConfig(configInfo)];
                case 1:
                    macroModPath = _c.sent();
                    if (!macroModPath)
                        return [2 /*return*/];
                    macroModPathInfo = makeMacroModulePathInfo((_b = (_a = configInfo.resource) === null || _a === void 0 ? void 0 : _a.fsPath) !== null && _b !== void 0 ? _b : '', macroModPath);
                    if (!!fs.existsSync(macroModPathInfo.expanded)) return [3 /*break*/, 3];
                    return [4 /*yield*/, vscode.window.showErrorMessage("The macro file '" + macroModPathInfo.expanded + "' not found.")];
                case 2:
                    _c.sent();
                    return [2 /*return*/];
                case 3: 
                // Load a macro module and run a command
                return [4 /*yield*/, loadAndRunMacro(macroModPathInfo.expanded, function (macroCommands) { return __awaiter(_this, void 0, void 0, function () {
                        var commandName;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, selectMacroCommand(macroCommands)];
                                case 1:
                                    commandName = _a.sent();
                                    if (!commandName)
                                        return [2 /*return*/];
                                    return [4 /*yield*/, runMacroCommand(macroCommands, commandName)];
                                case 2:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
                case 4:
                    // Load a macro module and run a command
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    context.subscriptions.push(disRunCommand);
    /**
     * DebugMacro Command
     */
    var disDebugCommand = vscode.commands.registerCommand('vscode-macros.debug', function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Launch a development extension host
                return [4 /*yield*/, vscode.debug.startDebugging(undefined, {
                        name: 'Debug a macro',
                        type: 'extensionHost',
                        request: 'launch',
                        args: ['--extensionDevelopmentPath=${cwd}']
                    })];
                case 1:
                    // Launch a development extension host
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    context.subscriptions.push(disDebugCommand);
    /**
     * UserMacro Commands(1 to 10)
     */
    var disUserCommands = (function () {
        var disCmds = [];
        var _loop_1 = function (i) {
            var disCmd = vscode.commands.registerCommand("vscode-macros.user" + (i + 1), function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, runUserMacro(i)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            disCmds.push(disCmd);
            context.subscriptions.push(disCmd);
        };
        for (var i = 0; i < 10; ++i) {
            _loop_1(i);
        }
        return disCmds;
    })();
    /**
     * ShowMacroList Command
     */
    var disShowMacroList = vscode.commands.registerCommand('vscode-macros.runUserMacro', function () { return __awaiter(_this, void 0, void 0, function () {
        var configInfo, userMacros, selectedItem, userMacroPickItems, selectedUserMacroPickItem;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    configInfo = configManager_1.ConfigManager.getConfigInfo();
                    if (!configInfo)
                        return [2 /*return*/];
                    userMacros = configManager_1.ConfigManager.getConfigValue(configInfo, CFG_USER_MACRO_COMMANDS);
                    if (!userMacros)
                        return [2 /*return*/];
                    if (!(userMacros.length === 0)) return [3 /*break*/, 4];
                    return [4 /*yield*/, vscode.window.showErrorMessage('User Macro not set in the configuration.', LABEL_OPEN_SETTINGS)];
                case 1:
                    selectedItem = _a.sent();
                    if (!(selectedItem === LABEL_OPEN_SETTINGS)) return [3 /*break*/, 3];
                    return [4 /*yield*/, vscode.commands.executeCommand(CMD_PREFERENCE_OPEN_SETTINGS, VSCODEMACROS_SETTINGS)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/];
                case 4:
                    userMacroPickItems = userMacros
                        .map(function (userMacroInfo, i) {
                        return {
                            index: i,
                            label: userMacroInfo.name && userMacroInfo.path ? LeftPadWithZeros(i + 1, USER_MACRO_NUMBER_DIGITS) + ": " + userMacroInfo.name + "(" + userMacroInfo.path + ")" : ''
                        };
                    })
                        .filter(function (userMacroInfo) {
                        return userMacroInfo.label;
                    });
                    return [4 /*yield*/, vscode.window.showQuickPick(userMacroPickItems, {
                            canPickMany: false,
                            placeHolder: 'Select a User Macro command to run.'
                        })];
                case 5:
                    selectedUserMacroPickItem = _a.sent();
                    if (!selectedUserMacroPickItem) return [3 /*break*/, 7];
                    return [4 /*yield*/, runUserMacro(selectedUserMacroPickItem.index)];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7: return [2 /*return*/];
            }
        });
    }); });
    context.subscriptions.push(disShowMacroList);
}
exports.activate = activate;
/**
 * Deactivate
 */
function deactivate() { }
exports.deactivate = deactivate;
/**
 * Get the path of the macro module from configuration
 * @param configInfo The source of the configuration
 * @returns A macro module path
 */
function getMacroModulePathFromConfig(configInfo) {
    return __awaiter(this, void 0, void 0, function () {
        var macroModPath, selectedItem;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    macroModPath = configManager_1.ConfigManager.getConfigValue(configInfo, CFG_MACRO_MODULE_PATH);
                    if (!!macroModPath) return [3 /*break*/, 4];
                    return [4 /*yield*/, vscode.window.showErrorMessage('The macro file is not set in the configuration.', LABEL_OPEN_SETTINGS)];
                case 1:
                    selectedItem = _a.sent();
                    if (!(selectedItem === LABEL_OPEN_SETTINGS)) return [3 /*break*/, 3];
                    return [4 /*yield*/, vscode.commands.executeCommand(CMD_PREFERENCE_OPEN_SETTINGS, VSCODEMACROS_SETTINGS)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/];
                case 4: return [2 /*return*/, macroModPath];
            }
        });
    });
}
/**
 * Get the path of the macro module directory from configuration
 * @returns A macro module directory path
 */
function getMacroModuleDirectoryPathInfo() {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
        var configInfo, macroModPath, macroModPathInfo, macroModDirPath;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    configInfo = configManager_1.ConfigManager.getConfigInfo();
                    if (!configInfo)
                        return [2 /*return*/];
                    return [4 /*yield*/, getMacroModulePathFromConfig(configInfo)];
                case 1:
                    macroModPath = _c.sent();
                    if (!macroModPath)
                        return [2 /*return*/];
                    macroModPathInfo = makeMacroModulePathInfo((_b = (_a = configInfo.resource) === null || _a === void 0 ? void 0 : _a.fsPath) !== null && _b !== void 0 ? _b : '', macroModPath);
                    macroModDirPath = path.dirname(macroModPathInfo.expanded);
                    if (!(macroModDirPath === '.' || !fs.existsSync(macroModDirPath))) return [3 /*break*/, 3];
                    return [4 /*yield*/, vscode.window.showErrorMessage("The macro directory '" + macroModDirPath + "' not found.")];
                case 2:
                    _c.sent();
                    return [2 /*return*/];
                case 3: return [2 /*return*/, {
                        original: path.dirname(macroModPath),
                        expanded: macroModDirPath
                    }];
            }
        });
    });
}
/**
 * Get the setting of whether or not to run macro after selecting a macro module
 * @returns 'true' if run macro after selecting a macro module
 */
function getRunMacroAfterFileSelectionFlag() {
    return __awaiter(this, void 0, void 0, function () {
        var configInfo, runMacroFlag;
        return __generator(this, function (_a) {
            configInfo = configManager_1.ConfigManager.getConfigInfo();
            if (!configInfo)
                return [2 /*return*/];
            runMacroFlag = configManager_1.ConfigManager.getConfigValue(configInfo, CFG_RUN_MACRO_AFTER_FILE_SELECTION);
            return [2 /*return*/, runMacroFlag !== null && runMacroFlag !== void 0 ? runMacroFlag : false];
        });
    });
}
/**
 * Select a macro module from the macro directory
 * @param macroDirPath Full path to the directory where the macros are stored
 * @returns A name of the macro module
 */
function selectMacroModule(macroDirPath) {
    return __awaiter(this, void 0, void 0, function () {
        var macroModules, sortedMacroModules, selectedMacroModule;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    macroModules = fs.readdirSync(macroDirPath).filter(function (fileName) {
                        var filePath = path.join(macroDirPath, fileName);
                        return fs.statSync(filePath).isFile() && path.extname(fileName) === '.js';
                    });
                    if (!(!macroModules || macroModules.length === 0)) return [3 /*break*/, 2];
                    return [4 /*yield*/, vscode.window.showErrorMessage("There are no macro files in the macro directory '" + macroDirPath + "'.")];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
                case 2:
                    sortedMacroModules = macroModules.map(function (fileName) { return fileName; }).sort();
                    return [4 /*yield*/, vscode.window.showQuickPick(sortedMacroModules, {
                            canPickMany: false,
                            placeHolder: 'Select a macro file.'
                        })];
                case 3:
                    selectedMacroModule = _a.sent();
                    return [2 /*return*/, selectedMacroModule];
            }
        });
    });
}
/**
 * Select a macro command and run it
 * @param macroCommands The MacroCommands object
 */
function selectMacroCommand(macroCommands) {
    return __awaiter(this, void 0, void 0, function () {
        var macroNames, selectedCommand;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    macroNames = Object.keys(macroCommands).sort(function (a, b) { return macroCommands[a].no - macroCommands[b].no; });
                    return [4 /*yield*/, vscode.window.showQuickPick(macroNames, {
                            canPickMany: false,
                            placeHolder: 'Select a command to run.'
                        })];
                case 1:
                    selectedCommand = _a.sent();
                    return [2 /*return*/, selectedCommand];
            }
        });
    });
}
/**
 * Load the macro module, and then run the macro command
 * @param macroModPath Full path to the macro module file
 * @param runCommandCallback Callback for the macro run
 */
function loadAndRunMacro(macroModPath, runCommandCallback) {
    return __awaiter(this, void 0, void 0, function () {
        var loadedMacroModulePath, macroMod, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!macroModPath.length) return [3 /*break*/, 2];
                    return [4 /*yield*/, vscode.window.showErrorMessage('The macro file is not set.')];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
                case 2:
                    if (!!fs.existsSync(macroModPath)) return [3 /*break*/, 4];
                    return [4 /*yield*/, vscode.window.showErrorMessage("The macro file '" + macroModPath + "' does not exist.")];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
                case 4:
                    loadedMacroModulePath = macroModPath;
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 9, 11, 12]);
                    // Load the macro module into NodeRequire
                    delete require.cache[loadedMacroModulePath];
                    macroMod = require(macroModPath);
                    loadedMacroModulePath = macroModPath;
                    if (!!isMacroCommands(macroMod.macroCommands)) return [3 /*break*/, 7];
                    return [4 /*yield*/, vscode.window.showErrorMessage('Invalid macro command definition in the macro file.')];
                case 6:
                    _a.sent();
                    return [2 /*return*/];
                case 7: 
                // return macroMod.macroCommands as IMacroCommands;
                return [4 /*yield*/, runCommandCallback(macroMod.macroCommands)];
                case 8:
                    // return macroMod.macroCommands as IMacroCommands;
                    _a.sent();
                    return [3 /*break*/, 12];
                case 9:
                    e_1 = _a.sent();
                    return [4 /*yield*/, vscode.window.showErrorMessage("An error occurred while loading the macro file (" + e_1 + ").")];
                case 10:
                    _a.sent();
                    return [3 /*break*/, 12];
                case 11:
                    // Remove the cached macro module from the NodeRequire cache when the command is completed.
                    delete require.cache[loadedMacroModulePath];
                    return [7 /*endfinally*/];
                case 12: return [2 /*return*/];
            }
        });
    });
}
/**
 * Run a user macro command
 * @param index Macro index number(0 to 9)
 */
function runUserMacro(index) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
        var configInfo, userMacros, selectedItem, userMacro, selectedItem, macroModPathInfo;
        var _this = this;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    configInfo = configManager_1.ConfigManager.getConfigInfo();
                    if (!configInfo)
                        return [2 /*return*/];
                    userMacros = configManager_1.ConfigManager.getConfigValue(configInfo, CFG_USER_MACRO_COMMANDS);
                    if (!(!userMacros || index >= userMacros.length)) return [3 /*break*/, 4];
                    return [4 /*yield*/, vscode.window.showErrorMessage("The 'User Macro " + LeftPadWithZeros(index + 1, USER_MACRO_NUMBER_DIGITS) + "' is not set in the 'settings.json'.", LABEL_OPEN_SETTINGS)];
                case 1:
                    selectedItem = _c.sent();
                    if (!(selectedItem === LABEL_OPEN_SETTINGS)) return [3 /*break*/, 3];
                    return [4 /*yield*/, vscode.commands.executeCommand(CMD_PREFERENCE_OPEN_SETTINGS, VSCODEMACROS_SETTINGS)];
                case 2:
                    _c.sent();
                    _c.label = 3;
                case 3: return [2 /*return*/];
                case 4:
                    userMacro = userMacros[index];
                    if (!!(userMacro.name && userMacro.path)) return [3 /*break*/, 8];
                    return [4 /*yield*/, vscode.window.showErrorMessage("The name or path of the 'User Macro " + LeftPadWithZeros(index + 1, USER_MACRO_NUMBER_DIGITS) + "' in the 'settings.json' is empty.", LABEL_OPEN_SETTINGS)];
                case 5:
                    selectedItem = _c.sent();
                    if (!(selectedItem === LABEL_OPEN_SETTINGS)) return [3 /*break*/, 7];
                    return [4 /*yield*/, vscode.commands.executeCommand(CMD_PREFERENCE_OPEN_SETTINGS, VSCODEMACROS_SETTINGS)];
                case 6:
                    _c.sent();
                    _c.label = 7;
                case 7: return [2 /*return*/];
                case 8:
                    macroModPathInfo = makeMacroModulePathInfo((_b = (_a = configInfo.resource) === null || _a === void 0 ? void 0 : _a.fsPath) !== null && _b !== void 0 ? _b : '', userMacro.path);
                    return [4 /*yield*/, loadAndRunMacro(macroModPathInfo.expanded, function (macroCommands) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, runMacroCommand(macroCommands, userMacro.name)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 9:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Run the macro command
 * @param macroCommands The MacroCommands object
 * @param macroName Name of the macro command to run
 */
function runMacroCommand(macroCommands, macroName) {
    return __awaiter(this, void 0, void 0, function () {
        var ret, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 7]);
                    if (!macroName.length) {
                        vscode.window.showErrorMessage("The macro command name is empty.");
                        return [2 /*return*/];
                    }
                    if (!(macroName in macroCommands)) {
                        vscode.window.showErrorMessage("The macro command name '" + macroName + "' is not defined.");
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, macroCommands[macroName].func()];
                case 1:
                    ret = _a.sent();
                    if (!(ret === undefined)) return [3 /*break*/, 2];
                    // Successful
                    vscode.window.setStatusBarMessage("Macro '" + macroName + "' completed.", 5000);
                    return [2 /*return*/];
                case 2:
                    if (!(ret.length > 0)) return [3 /*break*/, 4];
                    return [4 /*yield*/, vscode.window.showWarningMessage(macroName + ":" + ret)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [3 /*break*/, 7];
                case 5:
                    e_2 = _a.sent();
                    // An uncaught exception occurred
                    return [4 /*yield*/, vscode.window.showErrorMessage("An uncaught exception occurred in the macro '" + macroName + "'(" + e_2 + ").")];
                case 6:
                    // An uncaught exception occurred
                    _a.sent();
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
/**
 *  Verify if the object is a macro command object
 * @param arg Subject to be inspected
 * @returns If arg is the macro command, return true
 */
function isMacroCommands(arg) {
    if (typeof arg !== 'object' || arg === null) {
        return false;
    }
    for (var _i = 0, _a = Object.entries(arg); _i < _a.length; _i++) {
        var command = _a[_i];
        if (command.length !== 2 || typeof command[0] !== 'string' || typeof command[1] !== 'object') {
            return false;
        }
        if (typeof command[1].no !== 'number' || typeof command[1].func !== 'function') {
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
function makeMacroModulePathInfo(workspacePath, macroModulePath) {
    // Expand environment variables
    var expandedChildPath = ExpandEnvVars(macroModulePath);
    // If path is absolute then return
    if (path.isAbsolute(expandedChildPath))
        return {
            original: macroModulePath,
            expanded: expandedChildPath
        };
    return {
        original: path.join(workspacePath, macroModulePath),
        expanded: path.join(workspacePath, expandedChildPath)
    };
}
/**
 * Expand environment variables in a string
 * @param text A string containing environment variables
 * @returns String after environment variables expansion
 */
function ExpandEnvVars(text) {
    return text.replace(/{([^{}]+)}/g, function (m, p1) { var _a; return (_a = process.env[p1]) !== null && _a !== void 0 ? _a : ''; });
}
/**
 * Left padding with zeros
 * @param num A numeric value to be zero padding
 * @param digits Total digits
 * @returns  Zero padded numeric string
 */
function LeftPadWithZeros(num, digits) {
    return num.toString().padStart(digits, '0');
}
