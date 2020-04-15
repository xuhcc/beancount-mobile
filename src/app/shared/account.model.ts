import { getDateStr } from './misc'

export class Account {

    date: Date;
    name: string;

    constructor(options: any) {
        this.date = new Date(options.date)
        this.name = options.name
    }

    toBeancount(): string {
        const dateStr = getDateStr(this.date)
        return `${dateStr} open ${this.name}\n`
    }
}
