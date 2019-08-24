// Currently there is no support for \p{L}, so we use [^\s]
// https://github.com/microsoft/TypeScript/issues/32214
export const ACCOUNT_NAME_REGEXP = /^[^\s:]+:[^\s]+$/;

const ACCOUNT_REGEXP = /^[\d-]{10} open ([^\s]+)/umg;
const COMMODITY_REGEXP = /^[\d-]{10} commodity ([A-Z]+)$/umg;
const PAYEE_REGEXP = /^[\d-]{10} (txn|\*) "([^"]+)" ".*/umg;

function getOptionRegexp(name: string): RegExp {
    return new RegExp(`^option "${name}"\\s+"(.+)"`, 'um');
}

function getCustomOptionRegexp(name: string): RegExp {
    return new RegExp(
        `^[\\d-]{10} custom "bcm_option" "${name}" "(.+)"`,
        'um',
    );
}

function parseOptionArrayValue(value: string): any[] {
    const result = JSON.parse(value.replace(/'/g, '"'));
    if (!Array.isArray(result)) {
        throw new Error('Invalid option value.');
    }
    return result;
}

export class BeancountFileContent {

    text: string;

    constructor(text: string) {
        this.text = text;
    }

    getTitle(): string {
        const regexp = getOptionRegexp('title');
        const match = this.text.match(regexp);
        return match ? match[1] : 'Untitled';
    }

    getOperatingCurrency(): string {
        const regexp = getOptionRegexp('operating_currency');
        const match = this.text.match(regexp);
        return match ? match[1] : '';
    }

    getTransactionFlags(): string[] {
        const regexp = getCustomOptionRegexp('transaction_flags');
        const match = this.text.match(regexp);
        if (match) {
            try {
                return parseOptionArrayValue(match[1]);
            } catch {
            }
        }
        return ['*', '!'];
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
