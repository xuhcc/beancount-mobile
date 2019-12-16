import { getDateStr } from './misc';

export function evaluateArithmeticExpression(expression: string): number {
    return Number(eval(expression)); // eslint-disable-line no-eval
}

export class Transaction {

    date: Date;
    flag: string;
    payee: string;
    narration: string;
    postings: {
        account: string;
        amount: number;
        commodity: string;
    }[];

    constructor(options: any) {
        this.date = new Date(options.date);
        this.flag = options.flag || 'txn';
        this.payee = options.payee;
        this.narration = options.narration;
        const amount = evaluateArithmeticExpression(options.amount);
        this.postings = [{
            account: options.accountFrom,
            amount: -amount,
            commodity: options.commodity,
        }, {
            account: options.accountTo,
            amount: amount,
            commodity: options.commodity,
        }];
    }

    toBeancount(): string {
        const dateStr = getDateStr(this.date);
        let result = `${dateStr} ${this.flag}`;
        if (this.payee) {
            result += ` "${this.payee}"`;
        }
        result += ` "${this.narration}"\n`;
        for (const posting of this.postings) {
            result += `    ${posting.account}  ${posting.amount} ${posting.commodity}\n`;
        }
        return result;
    }
}
