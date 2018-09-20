'use strict';
import * as vscode from 'vscode';

export class Logger {
    postChannel: vscode.OutputChannel;

    constructor(channel: string) {
        this.postChannel = vscode.window.createOutputChannel(channel);
        this.postChannel.show(true);
    }

    public log(message: string) {
        this.postChannel.appendLine(message);
    }

    public error(message: string) {
        this.postChannel.appendLine(`Error: ${message}`);
        vscode.window.showErrorMessage(message);
    }
}