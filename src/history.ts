import { TidalExpression } from './editor';
import { ILogger } from './logging';
import { Config } from './config';

/**
 * Logs the history of a Tidal session.
 */
export interface IHistory {
    getEvalCount(): number;
    log(expression: TidalExpression): void;
}

export class History implements IHistory {
    private evalCount: number = 0;

    constructor(private logger: ILogger, private config: Config) {
    }

    public log(expression: TidalExpression): void {
        this.evalCount++;
        if (this.config.showEvalCount()) {
            this.logger.log(`Evals: ${this.evalCount} `, false);
        }
    }

    public getEvalCount(): number {
        return this.evalCount;
    }
}