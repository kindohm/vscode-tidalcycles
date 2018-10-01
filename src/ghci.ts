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
    writeLn(command: string): void;
}

export class Ghci implements IGhci {
    private ghciProcess: ChildProcess | null = null;
    public readonly stdout: Stream = new Stream();
    public readonly stderr: Stream = new Stream();

    constructor(private logger: ILogger, private useStack: boolean, private ghciPath: string) {
        this.logger = logger;
    }

    private getGhciProcess(): ChildProcess {
        if (this.ghciProcess !== null) {
            return this.ghciProcess;
        }

        if (this.useStack) {
            this.ghciProcess =
                spawn('stack', ['--silent', 'ghci', '--ghci-options', '-XOverloadedStrings', '--ghci-options', '-v0'],
                    {
                        cwd: vscode.workspace.rootPath
                    });
        } else {
            this.ghciProcess = spawn(this.ghciPath, ['-XOverloadedStrings', '-v0'],
                {
                    cwd: vscode.workspace.rootPath
                });
        }

        this.ghciProcess.stderr.pipe(split2()).on('data', (data: any) => {
            this.stderr.emit('data', data);
        });
        this.ghciProcess.stdout.pipe(split2()).on('data', (data: any) => {
            this.stdout.emit('data', data);
        });
        return this.ghciProcess;
    }

    private write(command: string) {
        try {
            let ghciProcess = this.getGhciProcess();
            ghciProcess.stdin.write(command);
        } catch (e) {
            this.logger.error(`Failed to get GHCi process: ${e}`);
            return;
        }
    }

    public writeLn(command: string) {
        this.write(`${command}${EOL}`);
    }
}