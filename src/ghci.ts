import { ChildProcess, spawn } from 'child_process';
import { Config } from './config';
import { ILogger } from './logging';
import * as vscode from 'vscode';
import * as split2 from 'split2';
import { EOL } from 'os';

/**
 * Provides an interface for sending commands to a GHCi session.
 */
export interface IGhci {
    writeLn(command: string): Promise<void>;
}

export class MockGhci implements IGhci {
    private logger: ILogger;

    constructor(logger: ILogger) {
        this.logger = logger;
    }

    public async writeLn(command: string): Promise<void> {
        this.logger.log(command);
        return;
    }
}

export class Ghci {
    private ghciProcess: ChildProcess | null = null;
    private logger: ILogger;
    private config: Config;

    constructor(logger: ILogger, config: Config) {
        this.logger = logger;
        this.config = config;
    }

    private async getGhciProcess(): Promise<ChildProcess> {
        if (this.ghciProcess !== null) {
            return this.ghciProcess;
        }

        if (this.config.useStackGhci()) {
            this.ghciProcess =
                spawn('stack', ['--silent', 'ghci', '--ghci-options', '-XOverloadedStrings', '--ghci-options', '-v0'], {
                    cwd: vscode.workspace.rootPath
                });
        } else {
            this.ghciProcess = spawn(this.config.ghciPath(), ['-XOverloadedStrings', '-v0']);
        }

        this.ghciProcess.stderr.pipe(split2()).on('data', (data : any) => {
            this.logger.warning(`GHCi: ${data.toString('utf8')}`);
        });
        this.ghciProcess.stdin.pipe(split2()).on('data', (data: any) => {
            if (this.config.showGhciOutput()) {
                this.logger.log(`GHCi: ${data.toString('utf8')}`);
            }
        });
        return this.ghciProcess;
    }
    
    public async write(command: string) {
        try {
            let ghciProcess = await this.getGhciProcess();
            ghciProcess.stdin.write(command);
        } catch (e) {
            this.logger.error(`Failed to get GHCi process: ${e}`);
            return;
        }
    }

    public async writeLn(command: string) {
        return await this.write(`${command}${EOL}`);
    }
}