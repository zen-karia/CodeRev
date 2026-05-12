// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "coderev" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('coderev.indexWorkspace', async () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Indexing workspace...');
		const files = await vscode.workspace.findFiles('**/*', '**/{node_modules,.git}/**');

		const allowedExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.java', '.cpp', '.c', '.cs', '.rb', '.rs'];
		const filteredFiles = files.filter(file => allowedExtensions.includes(path.extname(file.fsPath)));

		console.log(filteredFiles);
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
