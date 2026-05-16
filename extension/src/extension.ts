import * as vscode from 'vscode';
import * as path from 'path';
import { spawn } from "child_process";
import * as http from 'http';
import * as https from 'https';

export async function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "coderev" is now active!');

	const backendPath = path.join(context.extensionPath, "..", "backend");
	const program = path.join(backendPath, 'venv', 'Scripts', 'python.exe');
	const args = ["-m", "uvicorn", "main:app", "--reload"];

	spawn(program, args, { cwd: backendPath });
	await waitForServer();

	const disposable = vscode.commands.registerCommand('coderev.indexWorkspace', async () => {
		vscode.window.showInformationMessage('Indexing workspace...');
		const files = await vscode.workspace.findFiles('**/*', '**/{node_modules,.git}/**');

		const allowedExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.java', '.cpp', '.c', '.cs', '.rb', '.rs'];
		const filteredFiles = files.filter(file => allowedExtensions.includes(path.extname(file.fsPath)));

		for (let i = 0; i < filteredFiles.length; i += 100) {
			const batch = filteredFiles.slice(i, i + 100);
			const body = JSON.stringify({ files: batch.map(f => f.fsPath) });

			await new Promise<void>((resolve) => {
				const options = {
					hostname: '127.0.0.1',
					port: 8000,
					path: '/index',
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Content-Length': Buffer.byteLength(body)
					}
				};

				const req = http.request(options, (res) => {
					console.log(`Batch ${i / 100 + 1} response:`, res.statusCode);
					res.resume();
					res.on('end', resolve);
				});

				req.write(body);
				req.end();
			});
		}
	});

	const reviewPR = vscode.commands.registerCommand('coderev.reviewPR', async () => {
		const config = vscode.workspace.getConfiguration('coderev');
		const token = config.get<string>('githubToken');
		const owner = config.get<string>('repoOwner');
		const repo = config.get<string>('repoName');

		if (!token || !owner || !repo) {
			vscode.window.showErrorMessage('Please set coderev.githubToken, coderev.repoOwner, and coderev.repoName in settings.');
			return;
		}

		const prNumber = await vscode.window.showInputBox({ prompt: 'Enter PR number' });
		if (!prNumber) {return;}

		const diffData = await new Promise<string>((resolve, reject) => {
			const options = {
				hostname: 'api.github.com',
				path: `/repos/${owner}/${repo}/pulls/${prNumber}/files`,
				headers: {
					'Authorization': `Bearer ${token}`,
					'User-Agent': 'CodeRev'
				}
			};
			
			https.request(options, (res) => {
				let data = '';
				res.on('data', chunk => data += chunk);
				res.on('end', () => resolve(data));
			}).on('error', reject).end();
		});

		const files = JSON.parse(diffData);
		const diff = files.map((f: any) => `### ${f.filename}\n${f.patch || ''}`).join('\n\n');

	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(reviewPR);
}

function waitForServer(): Promise<void> {
	return new Promise((resolve) => {
		http.get('http://127.0.0.1:8000/health', (res) => {
			if (res.statusCode === 200) {
				resolve();
			} else {
				setTimeout(() => waitForServer().then(resolve), 500);
			}
		}).on('error', () => { setTimeout(() => waitForServer().then(resolve), 500); });
	});
}

export function deactivate() {}
