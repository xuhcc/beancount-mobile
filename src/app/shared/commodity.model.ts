import { getDateStr } from './misc'

export class Commodity {

    date: Date;
    name: string;

    constructor(options: any) {
        this.date = new Date(options.date)
        this.name = options.name
    }

    toBeancount(): string {
        const dateStr = getDateStr(this.date)
        return `${dateStr} commodity ${this.name}\n`
    }
}
