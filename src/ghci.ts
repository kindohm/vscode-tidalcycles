import { ChildProcess, spawn } from 'child_process';
import { Config } from './config';
import { Logger } from './logging';

export interface IGhci {
    writeLn(command: string): Promise<void>;
}

export class FakeGhci implements IGhci {
    private logger: Logger;

    constructor(logger: Logger) {
        this.logger = logger;
    }
    
    public async writeLn(command: string): Promise<void> {
        this.logger.log(command);
        return;
    }
}

export class Ghci {
    private ghciProcess: ChildProcess | null = null;
    private logger: Logger;
    private config: Config;

    constructor(logger: Logger, config: Config) {
        this.logger = logger;
        this.config = config;
    }

    private async getGhciProcess(): Promise<ChildProcess> {
        if (this.ghciProcess !== null) {
            return this.ghciProcess;
        }

        this.ghciProcess = spawn('stack', [this.config.ghciPath(), '--ghci-options', '-XOverloadedStrings']);
        this.ghciProcess.stderr.on('data', (data: any) => {
            if (this.config.showGhciOutput()) { 
                this.logger.error(`GHCi reports an error: ${data.toString('utf8')}`); 
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
        return await this.write(`${command}\n`);
    }
}