import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const serviceCommands: { [key: string]: string } = {
	'Java 17': `# Install OpenJDK 17\nRUN apt install -y openjdk-17-jdk\n`,
	'MySQL 8.0': `# Install MySQL Server8.0\nRUN apt install -y mysql-server-8.0\nCMD ["service", "mysql", "start"]\n`,
	'Maven': `# Install Maven:latest 17\nRUN apt install -y maven\n`,
};


export function activate(context: vscode.ExtensionContext) {
	console.log('Your extension "Devcontainer-Generator" is now active!');

	let createDevcontainer = vscode.commands.registerCommand('Devcontainer-Generator.createDevcontainer', async () => {
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders) {
			vscode.window.showErrorMessage('No workspace folder found. Please open a workspace folder and try again.');
			return;
		}

		const workspaceFolder = workspaceFolders[0].uri.fsPath;
		const devcontainerFolderPath = path.join(workspaceFolder, '.devcontainer');

		// 收集用户输入
		const name = await vscode.window.showInputBox({ prompt: 'Enter the name for your dev container' });
		if (name === undefined) { return; }  // 用户按下 Esc，退出

		const extensionsInput = await vscode.window.showInputBox({ prompt: 'Enter the IDs of extensions to install, separated by commas' });
		if (extensionsInput === undefined) { return; }  // 用户按下 Esc，退出
		const extensions = extensionsInput ? extensionsInput.split(',').map(e => e.trim()) : [];

		const selectedServices = await vscode.window.showQuickPick(Object.keys(serviceCommands), {
			canPickMany: true,
			placeHolder: 'Select the services you want to include in your dev container'
		});
		if (selectedServices === undefined) { return; }  // 用户按下 Esc，退出

		// 延迟创建目录和文件
		if (!fs.existsSync(devcontainerFolderPath)) {
			fs.mkdirSync(devcontainerFolderPath);
		}

		// 生成 Dockerfile 内容
		let dockerfileContent = `FROM ubuntu:latest\nRUN echo 'root:123456' | chpasswd\nRUN apt-get update && apt-get upgrade -y\n`;
		if (selectedServices.length > 0) {
			selectedServices.forEach(service => {
				dockerfileContent += serviceCommands[service];
			});
		}

		fs.writeFileSync(path.join(devcontainerFolderPath, 'Dockerfile'), dockerfileContent);

		const defaultConfig = {
			name: name,
			build: {
				context: ".",
				dockerfile: "Dockerfile"
			},
			customizations: {
				vscode: {
					settings: {},
					extensions: extensions
				}
			}
		};

		fs.writeFileSync(path.join(devcontainerFolderPath, 'devcontainer.json'), JSON.stringify(defaultConfig, null, 4));

		vscode.window.showInformationMessage('Devcontainer configuration has been created or updated. Would you like to reopen in the container now?', 'Yes', 'No').then(selection => {
			if (selection === 'Yes') {
				vscode.commands.executeCommand('remote-containers.reopenInContainer');
			}
		});
	});

	context.subscriptions.push(createDevcontainer);
}

export function deactivate() { }
