// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
// import { exec } from 'child_process';
import { spawn } from 'child_process';
import * as path from 'path';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "autodocx" is now active!');

	// const workspaceFolders = vscode.workspace.workspaceFolders;

	// if (!workspaceFolders) {
	// 	vscode.window.showErrorMessage("No folder or workspace opened.");
	// 	return;
	// 	}

	// const rootPath = workspaceFolders[0].uri.fsPath;
	// vscode.window.showInformationMessage(Analyzing repo at: ${rootPath});

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
	
		outputChannel.appendLine('Running: python ${pythonScript} --source_folder ${rootPath}');
	
		const pythonProcess = spawn('python', [pythonScript, '--source_folder', rootPath]);
	
		pythonProcess.stdout.on('data', (data) => {
			outputChannel.append(data.toString());
		});
	
		pythonProcess.stderr.on('data', (data) => {
			outputChannel.appendLine(`[stderr]: ${data.toString()}`);
		});
	
		pythonProcess.on('close', (code) => {
			if (code === 0) {
				outputChannel.appendLine('✅ Python script finished successfully.');
				vscode.env.openExternal(vscode.Uri.parse('http://localhost:3000'));
				outputChannel.append('Redirecting to http://localhost:3000')
			} else {
				outputChannel.appendLine(`Python script exited with code ${code}`);
			}
		});
	});
	

	context.subscriptions.push(openWebsiteCmd2);
}

// This method is called when your extension is deactivated
export function deactivate() {}