import * as vscode from 'vscode';

/**
 * A simple logging interface.
 */
export interface ILogger {
    log(message: string, newLine: boolean): void;
    log(message: string): void;
    warning(message: string): void;
    error(message: string): void;
}

export class Logger implements ILogger {
    constructor(private channel: vscode.OutputChannel) {
        this.channel.show(true);
    }

    public log(message: string, newLine: boolean = true): void {
        if (newLine) {
            this.channel.appendLine(message);
        } else {
            this.channel.append(message);
        }
    }

    public warning(message: string): void {
        this.channel.appendLine(`Warning: ${message}`);
    }

    public error(message: string): void {
        this.channel.appendLine(`Error: ${message}`);
        vscode.window.showErrorMessage(message);
    }
}