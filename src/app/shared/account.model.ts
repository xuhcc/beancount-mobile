export class Account {

    date: Date;
    name: string;

    constructor(options: any) {
        this.date = new Date(options.date);
        this.name = options.name;
    }

    toBeancount(): string {
        const dateStr = this.date.toISOString().split('T')[0];
        return `${dateStr} open ${this.name}\n`;
    }
}
