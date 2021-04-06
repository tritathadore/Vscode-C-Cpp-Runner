"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStatusBarItem = exports.filterOnString = exports.disposeItem = exports.getDirectories = exports.getLanguage = exports.isCSourceFile = exports.isCppSourceFile = exports.isHeaderFile = exports.isSourceFile = exports.getArchitecture = exports.commandExists = exports.getOperatingSystem = exports.writeJsonFile = exports.readJsonFile = exports.mkdirRecursive = exports.pathExists = exports.replaceBackslashes = void 0;
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const child_process_1 = require("child_process");
const lookpath_1 = require("lookpath");
const os_1 = require("os");
const STATUS_BAR_ALIGN = vscode.StatusBarAlignment.Left;
const STATUS_BAR_PRIORITY = 50;
function replaceBackslashes(text) {
    return text.replace(/\\/g, '/');
}
exports.replaceBackslashes = replaceBackslashes;
function pathExists(filePath) {
    try {
        fs.accessSync(filePath);
    }
    catch (err) {
        return false;
    }
    return true;
}
exports.pathExists = pathExists;
function mkdirRecursive(filePath) {
    fs.mkdirSync(filePath, { recursive: true });
}
exports.mkdirRecursive = mkdirRecursive;
function readJsonFile(filePath) {
    let configJson;
    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        configJson = JSON.parse(fileContent);
    }
    catch (err) {
        return undefined;
    }
    return configJson;
}
exports.readJsonFile = readJsonFile;
function writeJsonFile(outputFilePath, jsonContent) {
    const jsonString = JSON.stringify(jsonContent, null, 2);
    fs.writeFileSync(outputFilePath, jsonString);
}
exports.writeJsonFile = writeJsonFile;
function getOperatingSystem() {
    const plattformName = os_1.platform();
    let operatingSystem;
    if (plattformName === 'win32' || plattformName === 'cygwin') {
        operatingSystem = OperatingSystems.windows;
    }
    else if (plattformName === 'darwin') {
        operatingSystem = OperatingSystems.mac;
    }
    else {
        operatingSystem = OperatingSystems.linux;
    }
    return operatingSystem;
}
exports.getOperatingSystem = getOperatingSystem;
async function commandExists(command) {
    let commandPath = await lookpath_1.lookpath(command);
    if (!commandPath) {
        return { found: false, path: commandPath };
    }
    if (commandPath.includes('.EXE')) {
        commandPath = commandPath.replace('.EXE', '.exe');
    }
    return { found: true, path: commandPath };
}
exports.commandExists = commandExists;
function getArchitecture(compiler) {
    const command = `${compiler} -dumpmachine`;
    try {
        const byteArray = child_process_1.execSync(command);
        const str = String.fromCharCode(...byteArray);
        if (str.includes('64')) {
            return Architectures.x64;
        }
        else {
            return Architectures.x86;
        }
    }
    catch (err) {
        return Architectures.x86;
    }
}
exports.getArchitecture = getArchitecture;
function isSourceFile(fileExt) {
    const fileExtLower = fileExt.toLowerCase();
    if (isHeaderFile(fileExtLower)) {
        return false;
    }
    if (!(isCSourceFile(fileExtLower) || isCppSourceFile(fileExtLower))) {
        return false;
    }
    return true;
}
exports.isSourceFile = isSourceFile;
function isHeaderFile(fileExtLower) {
    return ['.hpp', '.hh', '.hxx', '.h'].some((ext) => fileExtLower === ext);
}
exports.isHeaderFile = isHeaderFile;
function isCppSourceFile(fileExtLower) {
    return ['.cpp', '.cc', '.cxx'].some((ext) => fileExtLower === ext);
}
exports.isCppSourceFile = isCppSourceFile;
function isCSourceFile(fileExtLower) {
    return fileExtLower === '.c';
}
exports.isCSourceFile = isCSourceFile;
function getLanguage(fileDirName) {
    const fileDirents = fs.readdirSync(fileDirName, { withFileTypes: true });
    const files = fileDirents
        .filter((file) => file.isFile())
        .map((file) => file.name);
    const anyCppFile = files.some((file) => isCppSourceFile(path.extname(file)));
    if (anyCppFile) {
        return Languages.cpp;
    }
    else {
        return Languages.c;
    }
}
exports.getLanguage = getLanguage;
function getDirectories(folder) {
    const fileDirents = fs.readdirSync(folder, {
        withFileTypes: true,
    });
    let directories = fileDirents
        .filter((dir) => dir.isDirectory())
        .map((dir) => path.join(folder.toString(), dir.name));
    directories = directories.filter((dir) => !dir.includes('.vscode'));
    directories = directories.filter((dir) => !dir.includes('build'));
    if (directories.length === 0) {
        return;
    }
    directories.forEach((dir) => { var _a; return (_a = getDirectories(dir)) === null || _a === void 0 ? void 0 : _a.forEach((newDir) => directories.push(newDir)); });
    return directories;
}
exports.getDirectories = getDirectories;
function disposeItem(disposableItem) {
    if (disposableItem) {
        disposableItem.dispose();
    }
}
exports.disposeItem = disposeItem;
function filterOnString(names, filterName) {
    return names.filter((name) => !name.includes(filterName));
}
exports.filterOnString = filterOnString;
function createStatusBarItem() {
    return vscode.window.createStatusBarItem(STATUS_BAR_ALIGN, STATUS_BAR_PRIORITY);
}
exports.createStatusBarItem = createStatusBarItem;
//# sourceMappingURL=utils.js.map