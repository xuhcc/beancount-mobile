export class Transaction {

    date: Date;
    flag: string;
    payee: string;
    narration: string;
    postings: {
        account: string,
        amount: number,
        commodity: string,
    }[];

    constructor(options: any) {
        this.date = new Date(options.date);
        this.flag = options.flag || 'txn';
        this.payee = options.payee;
        this.narration = options.narration;
        this.postings = [{
            account: options.accountFrom,
            amount: -Number(options.amount),
            commodity: options.commodity,
        }, {
            account: options.accountTo,
            amount: Number(options.amount),
            commodity: options.commodity,
        }];
    }

    toBeancount(): string {
        const dateStr = this.date.toISOString().split('T')[0];
        let result = `${dateStr} ${this.flag}`;
        if (this.payee) {
            result += ` "${this.payee}"`;
        }
        result += ` "${this.narration}"\n`;
        for (let posting of this.postings) {
            result += `    ${posting.account}  ${posting.amount} ${posting.commodity}\n`;
        }
        return result;
    }
}
