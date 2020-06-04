import { getDateStr } from './misc'

export function evaluateArithmeticExpression(expression: string): number {
    return Number(eval(expression)) // eslint-disable-line no-eval
}

interface TransactionData {
    date: string;
    flag: string;
    amount: string;
    commodity: string;
    accountFrom: string;
    accountTo: string;
    payee: string;
    narration: string;
    swapFromToAccounts: boolean;
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

    constructor(data: TransactionData) {
        this.date = new Date(data.date)
        this.flag = data.flag || 'txn'
        this.payee = data.payee
        this.narration = data.narration
        const amount = evaluateArithmeticExpression(data.amount)
        this.postings = [{
            account: data.accountFrom,
            amount: -amount,
            commodity: data.commodity,
        }, {
            account: data.accountTo,
            amount: amount,
            commodity: data.commodity,
        }]
        if (data.swapFromToAccounts) {
            this.postings.reverse()
        }
    }

    toBeancount(): string {
        const dateStr = getDateStr(this.date)
        let result = `${dateStr} ${this.flag}`
        if (this.payee) {
            result += ` "${this.payee}"`
        }
        result += ` "${this.narration}"\n`
        for (const posting of this.postings) {
            result += `    ${posting.account}  ${posting.amount} ${posting.commodity}\n`
        }
        return result
    }
}
