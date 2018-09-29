import { TidalExpression } from './editor';
import { ILogger } from './logging';

/**
 * Logs the history of a Tidal session.
 */
export interface IHistory {
    getEvalCount(): number;
    log(expression: TidalExpression): void;
}

export class History implements IHistory {
    private evalCount: number = 0;

    constructor(private logger: ILogger, private logEvalCount: boolean) {
    }

    public log(expression: TidalExpression): void {
        this.evalCount++;
        if (this.logEvalCount) {
            this.logger.log(`Evals: ${this.evalCount}`);
        }
    }

    public getEvalCount(): number {
        return this.evalCount;
    }
}