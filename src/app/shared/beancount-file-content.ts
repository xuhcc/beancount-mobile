// Currently there is no support for \p{L}, so we use [^\s]
// https://github.com/microsoft/TypeScript/issues/32214
export const ACCOUNT_NAME_REGEXP = /^[^\s:]+:[^\s]+$/;

const TITLE_REGEXP = /^option "title" "(.+)"/um;
const OPERATING_CURRENCY_REGEXP = /^option "operating_currency" "([^\s]+)"/um;
const ACCOUNT_REGEXP = /^[\d-]{10} open ([^\s]+)/umg;
const COMMODITY_REGEXP = /^[\d-]{10} commodity ([A-Z]+)$/umg;
const PAYEE_REGEXP = /^[\d-]{10} (txn|\*) "([^"]+)" ".*/umg;

export class BeancountFileContent {

    text: string;

    constructor(text: string) {
        this.text = text;
    }

    getTitle(): string {
        const match = this.text.match(TITLE_REGEXP);
        if (match) {
            return match[1];
        } else {
            return 'Untitled';
        }
    }

    getOperatingCurrency(): string {
        const match = this.text.match(OPERATING_CURRENCY_REGEXP);
        if (match) {
            return match[1];
        } else {
            return '';
        }
    }

    getAccounts(): string[] {
        // No support for matchAll in TypeScript
        // https://stackoverflow.com/questions/55499555/
        const matches = this.text['matchAll'](ACCOUNT_REGEXP);
        const accounts = Array.from(matches).map((match) => {
            return match[1];
        }).sort();
        return accounts;
    }

    getCommodities(): string[] {
        const matches = this.text['matchAll'](COMMODITY_REGEXP);
        const commodities = Array.from(matches).map((match) => {
            return match[1];
        }).sort();
        return commodities;
    }

    getPayees(): string[] {
        const matches = this.text['matchAll'](PAYEE_REGEXP);
        const payees = Array.from(matches)
            .map((match) => match[2])
            // Remove duplicates
            .filter((payee, index, self) => self.indexOf(payee) === index)
            .sort(); // TODO: Sort by frequency
        return payees;
    }

    append(text: string) {
        const numLineBreaks = this.text.endsWith('\n') ? 1 : 2;
        this.text += `${'\n'.repeat(numLineBreaks)}${text}`;
    }
}
