import { ChildProcess, spawn } from 'child_process';
import { Config } from './config';
import { Logger } from './logging';

export class Ghci {
    private ghciProcess: ChildProcess | null = null;
    private logger: Logger;
    private config: Config;

    constructor(logger: Logger, config: Config) {
        this.logger = logger;
        this.config = config;
    }

    private getGhciProcess(): Promise<ChildProcess> {
        return new Promise((resolve, reject) => {
            // First, try to return existing GHCi process
            if (this.ghciProcess !== null) {
                resolve(this.ghciProcess);
                return;
            }

            // Second, try to spawn a new GHCi process
            try {
                this.ghciProcess = spawn(this.config.ghciPath(), ['-XOverloadedStrings']);
                this.ghciProcess.on('data', (data: any) => {
                    if (this.config.showGhciOutput()) { this.logger.log(data.toString('utf8')); }
                });
                resolve();
                return;
            } catch (e) {
                reject(e);
                return;
            }
        });
    }

    public write(command: string) {
        this.getGhciProcess().then(ghci => {
            ghci.stdin.write(command);
        },
        err => {
            this.logger.error(err);
        });
    }

    public writeLn(command: string) {
        this.write(`${command}\n`);
    }
}