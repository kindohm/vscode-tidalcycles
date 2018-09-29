import * as vscode from 'vscode';

export class Config {
    getConfiguration = vscode.workspace.getConfiguration;
    configSection: string = 'tidalcycles';

    public bootTidalPath(): string | null {
        return this.getConfiguration(this.configSection).get('bootTidalPath', null);
    }

    public feedbackColor(): string {
        return this.getConfiguration(this.configSection).get('feedbackColor', 'rgba(100,250,100,0.3)');
    }

    public ghciPath(): string {
        return this.getConfiguration(this.configSection).get('ghciPath', 'ghci');
    }

    public showEvalCount(): boolean {
        return this.getConfiguration(this.configSection).get('showEvalCount', false);
    }

    public showGhciOutput(): boolean {
        return this.getConfiguration(this.configSection).get('showGhciOutput', false);
    }

    public showOutputInConsoleChannel(): boolean {
        return this.getConfiguration(this.configSection).get('showOutputInConsoleChannel', false);
    }

    public useBootFileInCurrentDirectory(): boolean {
        return this.getConfiguration(this.configSection).get('useBootFileInCurrentDirectory', false);
    }

    public useStackGhci(): boolean {
        return this.getConfiguration(this.configSection).get('useStackGhci', false);
    }
}