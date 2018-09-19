'use strict';
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

    public randomMessages(): string[] {
        return this.getConfiguration(this.configSection).get('randomMessages', []);
    }

    public randomMessageProbability() {
        return this.getConfiguration(this.configSection).get('randomMessageProbability', 0);
    }

    public showEvalCount() {
        return this.getConfiguration(this.configSection).get('showEvalCount', false);
    }

    public evalCountPrefix() {
        return this.getConfiguration(this.configSection).get('evalCountPrefix', 'evals: ');
    }

    public showGhciOutput() {
        return this.getConfiguration(this.configSection).get('showGhciOutput', false);
    }

    public showOutputInConsoleChannel() {
        return this.getConfiguration(this.configSection).get('showOutputInConsoleChannel', false);
    }

    public useBootFileInCurrentDirectory() {
        return this.getConfiguration(this.configSection).get('useBootFileInCurrentDirectory') === true;
    }
}