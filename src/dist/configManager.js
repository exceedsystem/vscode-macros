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
exports.ConfigManager = void 0;
var vscode = require("vscode");
/**
 * The configuration name of this extension
 */
var CONFIG_NAME = 'vscodemacros';
/**
 * Configuration manager
 */
var ConfigManager = /** @class */ (function () {
    function ConfigManager() {
    }
    /**
     * Get the configuration information
     * @returns A configuration information considering workspace and folders
     */
    ConfigManager.getConfigInfo = function () {
        var configResource = this.getWorkspaceFolderUri();
        var config = vscode.workspace.getConfiguration(CONFIG_NAME, configResource !== null && configResource !== void 0 ? configResource : null);
        if (!config)
            return;
        return { resource: configResource, config: config };
    };
    ;
    /**
     * Get the configuration value
     * @param configInfo Source of the configuration information
     * @param section The configuration name to get the value
     * @returns A value of the configuration
     */
    ConfigManager.getConfigValue = function (configInfo, section) {
        return configInfo.config.get(section);
    };
    /**
     * Update the configuration value to a new value
     * @param section The name of the configuration to be updated
     * @param value The new value
     */
    ConfigManager.updateConfigValue = function (section, value) {
        return __awaiter(this, void 0, void 0, function () {
            var cfg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cfg = ConfigManager.getConfigInfo();
                        if (!cfg)
                            return [2 /*return*/];
                        if (!!cfg.resource) return [3 /*break*/, 2];
                        return [4 /*yield*/, cfg.config.update(section, value, true)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, cfg.config.update(section, value)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get the uri of the workspace folder
     * @returns An uri of the workspace folder
     */
    ConfigManager.getWorkspaceFolderUri = function () {
        var _a, _b, _c;
        var activeDocumentUri = (_b = (_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document) === null || _b === void 0 ? void 0 : _b.uri;
        if (activeDocumentUri) {
            return (_c = vscode.workspace.getWorkspaceFolder(activeDocumentUri)) === null || _c === void 0 ? void 0 : _c.uri;
        }
    };
    return ConfigManager;
}());
exports.ConfigManager = ConfigManager;
