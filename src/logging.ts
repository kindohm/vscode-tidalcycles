import * as vscode from 'vscode';

export interface ILogger {
    /**
     * A simple logging interface.
     */

    log(message: string): void;
    warning(message: string): void;
    error(message: string): void;
}

export class Logger implements ILogger {
    channel: vscode.OutputChannel;

    constructor(channel: vscode.OutputChannel) {
        this.channel = channel;
        this.channel.show(true);
    }

    public log(message: string): void {
        this.channel.appendLine(message);
    }

    public warning(message: string): void {
        this.channel.appendLine(`Warning: ${message}`);
    }

    public error(message: string): void {
        this.channel.appendLine(`Error: ${message}`);
        vscode.window.showErrorMessage(message);
    }
}