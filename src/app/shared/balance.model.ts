import { getDateStr } from './misc'

export function evaluateArithmeticExpression(expression: string): number {
    return Number(eval(expression)) // eslint-disable-line no-eval
}

export class Balance {
    date: Date;
    account: string;
    amount: number;
    commodity: string;

    constructor(options: any) {
        this.date = new Date(options.date)
        this.account = options.account
        this.amount = evaluateArithmeticExpression(options.amount)
        this.commodity = options.commodity
    }

    toBeancount(): string {
        const dateStr = getDateStr(this.date)
        return `${dateStr} balance ${this.account} ${this.amount} ${this.commodity}\n`
    }
}

// export class Pad {
//     date: Date;
//     account: string;
//     accountPad: string;
//
//     constructor(options: any) {
//         this.date = new Date(options.date)
//         this.account = options.account
//         this.accountPad = options.accountPad
//     }
//
//     toBeancount(): string {
//         const dateStr = getDateStr(this.date)
//         return `${dateStr} pad ${this.account} ${this.accountPad}\n`
//     }
// }
