// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import { spawn } from "child_process";
import * as http from 'http';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "coderev" is now active!');

	const backendPath = path.join(context.extensionPath, "..", "backend");
	const program = path.join(backendPath, 'venv', 'Scripts', 'python.exe');
	const args = ["-m", "uvicorn", "main:app", "--reload"];

	spawn(program, args, { cwd: backendPath});
	await waitForServer();

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

		const body = JSON.stringify({ files: filteredFiles.map(f => f.fsPath) });

		const options = {
    		hostname: 'localhost',
    		port: 8000,
    		path: '/index',
    		method: 'POST',
    		headers: {
        		'Content-Type': 'application/json',
        		'Content-Length': Buffer.byteLength(body)
    		}
		};

		const req = http.request(options, (res) => {
    		console.log("Index response:", res.statusCode);
		});

		req.write(body);
		req.end();
	});

	context.subscriptions.push(disposable);
}

function waitForServer(): Promise<void> {
    return new Promise((resolve, reject) => {
        http.get('http://localhost:8000/health', (res) => { 
			if (res.statusCode === 200 ) {
				resolve(); 
			} else {
				setTimeout(() => waitForServer().then(resolve), 500);
			}
    	}).on('error', () => { setTimeout(() => waitForServer().then(resolve), 500); });
	});
}

// This method is called when your extension is deactivated
export function deactivate() {}
