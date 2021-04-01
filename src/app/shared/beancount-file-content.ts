const DEFAULT_ROOT_ACCOUNTS = [
    'Assets',
    'Liabilities',
    'Equity',
    'Income',
    'Expenses',
]
export const COMMODITY_NAME_REGEXP = /^[A-Z]+$/
const COMMODITY_REGEXP = /^[\d-]{10} commodity ([A-Z]+)$/umg
const PAYEE_REGEXP = /^[\d-]{10} (txn|\*) "([^"]+)" ".*/umg

function getOptionRegexp(name: string): RegExp {
    return new RegExp(`^option "${name}"\\s+"(.+)"`, 'um')
}

function getCustomOptionRegexp(name: string): RegExp {
    return new RegExp(
        `^[\\d-]{10} custom "bcm_option" "${name}" "(.+)"`,
        'um',
    )
}

function parseOptionArrayValue(value: string): any[] {
    const result = JSON.parse(value.replace(/'/g, '"'))
    if (!Array.isArray(result)) {
        throw new Error('Invalid option value.')
    }
    return result
}

function uniqueAndSortedByCount(items: string[]): string[] {
    // Count and remove duplicates
    const counts = items.reduce((result: {}, item: string) => {
        if (!result[item]) {
            result[item] = 1
        } else {
            result[item] += 1
        }
        return result
    }, {})
    return Object
        .keys(counts)
        .sort((v1: string, v2: string) => {
            return -(counts[v1] - counts[v2])
        })
}

export class BeancountFileContent {

    text: string;

    constructor(text: string) {
        this.text = text
    }

    private getRootAccounts(): string[] {
        return DEFAULT_ROOT_ACCOUNTS.map((name: string) => {
            const regexp = getOptionRegexp(`name_${name.toLowerCase()}`)
            const match = this.text.match(regexp)
            return match ? match[1] : name
        })
    }

    getTitle(): string {
        const regexp = getOptionRegexp('title')
        const match = this.text.match(regexp)
        return match ? match[1] : 'Untitled'
    }

    getOperatingCurrency(): string {
        const regexp = getOptionRegexp('operating_currency')
        const match = this.text.match(regexp)
        return match ? match[1] : ''
    }

    getTransactionFlags(): string[] {
        const regexp = getCustomOptionRegexp('transaction_flags')
        const match = this.text.match(regexp)
        if (match) {
            try {
                return parseOptionArrayValue(match[1])
            } catch {
            }
        }
        return ['*', '!']
    }

    getAccountOrder(): string {
        const regexp = getCustomOptionRegexp('account_order')
        const match = this.text.match(regexp)
        return match ? match[1] : 'from_to'
    }

    getAccountNameRegexp(): RegExp {
        const roots = this.getRootAccounts().join('|')
        // Currently there is no support for \p{L}, so we use [^\s]
        // https://github.com/microsoft/TypeScript/issues/32214
        return new RegExp(`^(${roots}):[^\\s]+[^\\s:]$`)
    }

    getAccounts(): string[] {
        const roots = this.getRootAccounts().join('|')
        const accountRegexp = new RegExp(
            `\\s+((${roots}):[^\\s]+[^\\s:])(\\s|$)`,
            'umg',
        )
        // No support for matchAll in TypeScript
        // https://stackoverflow.com/questions/55499555/
        const matches = this.text['matchAll'](accountRegexp)
        const accounts = Array.from(matches, (match) => match[1])
        return uniqueAndSortedByCount(accounts)
    }

    getCommodities(): string[] {
        const matches = this.text['matchAll'](COMMODITY_REGEXP)
        const commodities = Array
            .from(matches, (match) => match[1])
            .sort()
        return commodities
    }

    getPayees(): string[] {
        const matches = this.text['matchAll'](PAYEE_REGEXP)
        const payees = Array.from(matches, (match) => match[2])
        return uniqueAndSortedByCount(payees)
    }

    append(text: string): void {
        let prefix
        if (this.text.endsWith('\n\n')) {
            prefix = ''
        } else if (this.text.endsWith('\n')) {
            prefix = '\n'
        } else {
            prefix = '\n\n'
        }
        this.text += `${prefix}${text}`
    }
}
