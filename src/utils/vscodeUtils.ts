import * as path from 'path';
import * as vscode from 'vscode';

import { extensionState } from '../extension';
import { filesInDir, pathExists, readJsonFile } from './fileUtils';
import { JsonLaunchConfig, JsonSettings, OperatingSystems } from './types';

const STATUS_BAR_ALIGN = vscode.StatusBarAlignment.Left;
const STATUS_BAR_PRIORITY = 50;

export function disposeItem(disposableItem: vscode.Disposable | undefined) {
  disposableItem?.dispose();
}

export function createStatusBarItem() {
  return vscode.window.createStatusBarItem(
    STATUS_BAR_ALIGN,
    STATUS_BAR_PRIORITY,
  );
}

export function setContextValue(key: string, value: any) {
  return vscode.commands.executeCommand('setContext', key, value);
}

export function getLaunchConfigIndex(
  configJson: JsonLaunchConfig,
  configName: string,
) {
  let configIdx = 0;

  if (configJson) {
    for (const config of configJson.configurations) {
      if (config.name !== configName) {
        configIdx++;
      } else {
        return configIdx;
      }
    }
  }

  return undefined;
}

export function updateActivationState(newState: boolean) {
  extensionState?.update('activatedExtension', newState);
}

export function getActivationState() {
  if (extensionState) {
    return <boolean>extensionState.get('activatedExtension');
  }

  return false;
}

export function isCmakeProject() {
  let cmakeFileFound = false;

  const workspaceFodlers = vscode.workspace.workspaceFolders;
  const cmakeExtensionName = 'cmake';
  const cmakeSettingName = 'sourceDirectory';

  if (workspaceFodlers) {
    workspaceFodlers.forEach((folder) => {
      if (!cmakeFileFound) {
        const files = filesInDir(folder.uri.fsPath);
        files.forEach((file) => {
          if (file.toLowerCase().includes('CMakeLists.txt'.toLowerCase())) {
            cmakeFileFound = true;
          }
        });

        const settingsPath = path.join(
          folder.uri.fsPath,
          '.vscode',
          'settings.json',
        );

        if (pathExists(settingsPath)) {
          const configLocal: JsonSettings | undefined =
            readJsonFile(settingsPath);

          if (
            configLocal &&
            configLocal[`${cmakeExtensionName}.${cmakeSettingName}`]
          ) {
            cmakeFileFound = true;
          }
        }
      }
    });
  }

  if (!cmakeFileFound) {
    const config = vscode.workspace.getConfiguration(cmakeExtensionName);
    const cmakeSetting = config.get(cmakeSettingName);

    if (cmakeSetting && cmakeSetting !== '${workspaceFolder}') {
      cmakeFileFound = true;
    }
  }

  return cmakeFileFound;
}

export function getProcessExecution(
  operatingSystem: OperatingSystems,
  isMsvcBuildTask: boolean,
  commandLine: string,
  activeFolder: string,
) {
  const options = {
    cwd: activeFolder,
  };

  if (operatingSystem === OperatingSystems.windows) {
    return winProcessExecution(isMsvcBuildTask, commandLine, options);
  } else {
    return unixProcessExecution(commandLine, options);
  }
}

function winProcessExecution(
  isMsvcBuildTask: boolean,
  commandLine: string,
  options: { cwd: string },
) {
  const drive = process.env['SystemDrive'] ? process.env['SystemDrive'] : 'C:';
  if (isMsvcBuildTask) {
    const shellOptions: vscode.ShellExecutionOptions = {
      executable: drive + '/Windows/System32/cmd.exe',
      shellArgs: ['/d', '/c'],
    };
    return new vscode.ShellExecution(commandLine, shellOptions);
  } else {
    return new vscode.ProcessExecution(
      drive + '/Windows/System32/cmd.exe',
      ['/d', '/c', commandLine],
      options,
    );
  }
}

function unixProcessExecution(commandLine: string, options: { cwd: string }) {
  const standard_shell = process.env['SHELL']
    ? process.env['SHELL']
    : '/bin/bash';
  return new vscode.ProcessExecution(
    standard_shell,
    ['-c', commandLine],
    options,
  );
}
