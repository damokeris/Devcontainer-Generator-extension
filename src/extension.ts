import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const serviceCommands: { [key: string]: string } = {
	'Java 17': `# Install OpenJDK 17\nRUN apt install -y openjdk-17-jdk\n`,
	'MySQL 8.0': `# Install MySQL Server8.0\nRUN apt install -y mysql-server-8.0\nCMD ["service", "mysql", "start"]\n`,
	'Maven': `# Install Maven:latest 17\nRUN apt install -y maven\n`,
	'NVM with Node.js': `# Install NVM and Node.js\nRUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash && \\
    export NVM_DIR="$HOME/.nvm" && \\
    [ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh" && \\
    [ -s "$NVM_DIR/bash_completion" ] && \\. "$NVM_DIR/bash_completion" && \\
    nvm install node\n`  // 这里安装最新版本的Node.js，你也可以指定版本
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

		// const extensionsInput = await vscode.window.showInputBox({ prompt: 'Enter the IDs of extensions to install, separated by commas' });
		// if (extensionsInput === undefined) { return; }  // 用户按下 Esc，退出
		// const extensions = extensionsInput ? extensionsInput.split(',').map(e => e.trim()) : [];

		const selectedServices = await vscode.window.showQuickPick(Object.keys(serviceCommands), {
			canPickMany: true,
			placeHolder: 'Select the services you want to include in your dev container'
		});
		if (selectedServices === undefined) { return; }  // 用户按下 Esc，退出

		// 新增询问是否更换Ubuntu源的选项
		const changeSource = await vscode.window.showQuickPick(['Yes', 'No'], {
			placeHolder: 'Do you want to change the Ubuntu source to Aliyun mirror?'
		});

		// 获取本地安装的扩展
		const installedExtensions = vscode.extensions.all
			.filter(ext => !ext.packageJSON.isBuiltin)
			.map(ext => ({ label: ext.packageJSON.displayName || ext.packageJSON.name, id: ext.id }));

		// 让用户选择要在dev container中安装的扩展
		const selectedExtensions = await vscode.window.showQuickPick(installedExtensions, {
			canPickMany: true,
			placeHolder: 'Select extensions to include in your dev container'
		});

		// 处理用户的选择
		const extensions = selectedExtensions ? selectedExtensions.map(ext => ext.id) : [];

		// 延迟创建目录和文件
		if (!fs.existsSync(devcontainerFolderPath)) {
			fs.mkdirSync(devcontainerFolderPath);
		}

		// 生成 Dockerfile 内容
		let dockerfileContent = `FROM ubuntu:latest\n# Set password for root user\nRUN echo 'root:123456' | chpasswd\n`;

		if (changeSource === 'Yes') {
			dockerfileContent += `# Backup original sources.list and change to Aliyun source\nRUN mv /etc/apt/sources.list /etc/apt/sources.list.backup\n` +
				`RUN echo "deb http://mirrors.aliyun.com/ubuntu/ jammy main restricted universe multiverse" > /etc/apt/sources.list && \\\n` +
				`echo "deb http://mirrors.aliyun.com/ubuntu/ jammy-security main restricted universe multiverse" >> /etc/apt/sources.list && \\\n` +
				`echo "deb http://mirrors.aliyun.com/ubuntu/ jammy-updates main restricted universe multiverse" >> /etc/apt/sources.list && \\\n` +
				`echo "deb http://mirrors.aliyun.com/ubuntu/ jammy-proposed main restricted universe multiverse" >> /etc/apt/sources.list && \\\n` +
				`echo "deb http://mirrors.aliyun.com/ubuntu/ jammy-backports main restricted universe multiverse" >> /etc/apt/sources.list\n`;
		}

		dockerfileContent += `# Update and Upgrade System\nRUN apt-get update && apt-get upgrade -y\n# Install basic tools\nRUN apt-get install vim git curl wget -y\n`;

		if (selectedServices.length > 0) {
			selectedServices.forEach(service => {
				dockerfileContent += serviceCommands[service];
			});
		}

		dockerfileContent += `# Clean up to reduce image size\nRUN apt-get clean && rm -rf /var/lib/apt/lists/* && rm etc/apt/sources.list.backup\n`;

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
