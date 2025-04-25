"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(require("vscode"));
// import { exec } from 'child_process';
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "autodocx" is now active!');
    // const workspaceFolders = vscode.workspace.workspaceFolders;
    // if (!workspaceFolders) {
    // 	vscode.window.showErrorMessage("No folder or workspace opened.");
    // 	return;
    // 	}
    // const rootPath = workspaceFolders[0].uri.fsPath;
    // vscode.window.showInformationMessage(`Analyzing repo at: ${rootPath}`);
    let openWebsiteCmd1 = vscode.window.registerWebviewViewProvider('myWebsiteView', {
        resolveWebviewView() {
            vscode.env.openExternal(vscode.Uri.parse('http://localhost:3000'));
        }
    });
    let openWebsiteCmd2 = vscode.commands.registerCommand('autodocx.openWebsite', () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage("No folder or workspace opened.");
            return;
        }
        const rootPath = workspaceFolders[0].uri.fsPath;
        vscode.window.showInformationMessage(`Analyzing repo at: ${rootPath}`);
        vscode.window.showInformationMessage(`${__dirname}`);
        const outputChannel = vscode.window.createOutputChannel('AutoDocX Logs');
        outputChannel.show(true); // show the panel when script runs
        // const pythonScript = 'C:\\Users\\havis\\autodocx\\main.py';
        const pythonScript = path.resolve(__dirname, '..', 'main.py');
        outputChannel.appendLine(`Running: python ${pythonScript} --source_folder ${rootPath}`);
        const pythonProcess = (0, child_process_1.spawn)('python', [pythonScript, '--source_folder', rootPath]);
        pythonProcess.stdout.on('data', (data) => {
            outputChannel.append(data.toString());
        });
        pythonProcess.stderr.on('data', (data) => {
            outputChannel.appendLine(`[stderr] ${data.toString()}`);
        });
        pythonProcess.on('close', (code) => {
            if (code === 0) {
                outputChannel.appendLine('✅ Python script finished successfully.');
                vscode.env.openExternal(vscode.Uri.parse('http://localhost:3000'));
                outputChannel.append('Redirecting to http://localhost:3000');
            }
            else {
                outputChannel.appendLine(`❌ Python script exited with code ${code}`);
            }
        });
    });
    context.subscriptions.push(openWebsiteCmd2);
}
// This method is called when your extension is deactivated
function deactivate() { }
//# sourceMappingURL=extension.js.map