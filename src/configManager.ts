import * as vscode from 'vscode';

/**
 * The configuration name of this extension
 */
const CONFIG_NAME = 'vscodemacros';

/**
 * Configuration manager
 */
export class ConfigManager {

  /**
   * Get the configuration information
   * @returns A configuration information considering workspace and folders
   */
  static getConfigInfo() {
    const configResource = this.getWorkspaceFolderUri();
    const config = vscode.workspace.getConfiguration(CONFIG_NAME, configResource ?? null);
    if (!config) {return;}
    return <ConfigInfo>{ resource: configResource, config: config };
  };

  /**
   * Get the configuration value
   * @param configInfo Source of the configuration information
   * @param section The configuration name to get the value
   * @returns A value of the configuration
   */
  static getConfigValue<T>(configInfo: ConfigInfo, section: string) {
    return configInfo.config.get<T>(section);
  }

  /**
   * Update the configuration value to a new value
   * @param section The name of the configuration to be updated
   * @param value The new value
   */
  static async updateConfigValue<T>(section: string, value: T | undefined) {
    const cfg = ConfigManager.getConfigInfo();
    if (!cfg) {return;}

    if (!cfg.resource) {
      await cfg.config.update(section, value, true);
    }
    else {
      await cfg.config.update(section, value);
    }
  }

  /**
   * Get the uri of the workspace folder
   * @returns An uri of the workspace folder
   */
  private static getWorkspaceFolderUri(): vscode.Uri | undefined {
    const activeDocumentUri = vscode.window.activeTextEditor?.document?.uri;
    if (activeDocumentUri) {
      return vscode.workspace.getWorkspaceFolder(activeDocumentUri)?.uri;
    }
  }
}

/**
 * Configuration information
 */
export interface ConfigInfo {
  /**
   * Path to the workspace folder
   */
  resource: vscode.Uri | undefined;

  /**
   * Configuration object
   */
  config: vscode.WorkspaceConfiguration;
}

