// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { spawn } from 'child_process';

let _copy: { command: string, args: string[] };

switch (process.platform) {
	case "darwin":
		_copy = { command: 'pbcopy', args: [] };
		break;
	case "win32":
		_copy = { command: 'clip', args: [] };
		break;
	case "linux":
		_copy = { command: 'xclip', args: ["-selection", "clipboard"] };
		break;
	default:
		throw new Error(`Unknown platform: '${process.platform}'.`);
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "hewkawstation" is now active!');

	const generateUUID = vscode.commands.registerCommand('hewkawstation.generateUUID', async () => {
		const { v4: uuidv4 } = await import('uuid');
		const editor = vscode.window.activeTextEditor;

		if (editor === undefined || editor.selection === undefined) {
			copyUuid(uuidv4());
			return;
		}

		let uuid: string = uuidv4();

		editor.edit(editBuilder => {
			for (const selection of editor.selections) {
				editBuilder.replace(selection, uuid);
			}
		});
	});

	context.subscriptions.push(generateUUID);
}

// This method is called when your extension is deactivated
export function deactivate() { }

function showMessage(uuid: string) {
	if (isNullOrWhiteSpace(uuid)) {
		return;
	}

	vscode.window.showInformationMessage(uuid);
}

function copyUuid(uuid: string) {
	copy(uuid, () => {
		showMessage(uuid + ' is copied.');
	});
}

function isNullOrWhiteSpace(text: string | null | undefined) {
	return typeof text === 'string' && !text.trim() || typeof text === undefined || text === null;
}

const copy = function (text:string, callback: () => void) {
  const child = spawn(_copy.command, _copy.args);

  child.stdin.end(text);

  callback();
};
