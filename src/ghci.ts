import { ChildProcess, spawn } from 'child_process';
import { ILogger } from './logging';
import * as vscode from 'vscode';
import * as split2 from 'split2';
import { EOL } from 'os';
import { Stream } from 'stream';

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
    public readonly stdout: Stream = new Stream();
    public readonly stderr: Stream = new Stream();

    constructor(private logger: ILogger, private useStack: boolean, private ghciPath: string) {
        this.logger = logger;
    }

    private async getGhciProcess(): Promise<ChildProcess> {
        if (this.ghciProcess !== null) {
            return this.ghciProcess;
        }

        if (this.useStack) {
            this.ghciProcess =
                spawn('stack', ['--silent', 'ghci', '--ghci-options', '-XOverloadedStrings', '--ghci-options', '-v0'], {
                    cwd: vscode.workspace.rootPath
                });
        } else {
            this.ghciProcess = spawn(this.ghciPath, ['-XOverloadedStrings', '-v0']);
        }

        this.ghciProcess.stderr.pipe(split2()).on('data', (data : any) => {
            this.stderr.emit('data', data);
        });
        this.ghciProcess.stdout.pipe(split2()).on('data', (data: any) => {
            this.stdout.emit('data', data);
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