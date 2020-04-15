import { BeancountFileContent } from '../app/shared/beancount-file-content'

describe('beancount file content tests', () => {
    it('should initialize successfully', () => {
        const text = 'test text'
        const content = new BeancountFileContent(text)
        expect(content.text).toBe(text)
    })

    it('should parse title', () => {
        const content = new BeancountFileContent(
            'option "title" "BeanTest"\n' +
            'option "operating_currency" "USD"\n')
        expect(content.getTitle()).toBe('BeanTest')
        expect(content.getOperatingCurrency()).toBe('USD')
        expect(content.getTransactionFlags()).toEqual(['*', '!'])
    })

    it('should parse transaction flags option', () => {
        const content = new BeancountFileContent(
            '2019-01-01 custom "bcm_option" "transaction_flags" "[\'!\', \'?\']"\n' +
            '2019-01-02 commodity USD\n')
        expect(content.getTransactionFlags()).toEqual(['!', '?'])
    })

    describe('account name regexp tests', () => {
        let regexp
        beforeEach(() => {
            const content = new BeancountFileContent('')
            regexp = content.getAccountNameRegexp()
        })

        it('should allow valid account names', () => {
            expect(regexp.test('Assets:Test-Account')).toBe(true)
            expect(regexp.test('Assets:Cash:Test-Account')).toBe(true)
        })

        it('should not allow account name with whitespace', () => {
            expect(regexp.test('Assets:Test Account')).toBe(false)
        })
        it('should not allow top level accounts', () => {
            expect(regexp.test('Assets')).toBe(false)
        })
        it('should not allow invalid top level account', () => {
            expect(regexp.test('Test:Test-Account')).toBe(false)
        })
        it('should not allow colon at the end', () => {
            expect(regexp.test('Assets:Test-Account:')).toBe(false)
        })

        it('should allow unicode account name', () => {
            const content = new BeancountFileContent(
                'option "name_assets" "Активы"\n')
            regexp = content.getAccountNameRegexp()
            expect(regexp.test('Активы:Тест-Счёт')).toBe(true)
        })
    })

    it('should parse accounts', () => {
        const content = new BeancountFileContent(
            '2019-09-07 open Assets:Account1\n' +
            '2019-09-07 open Assets:Account2\n' +
            '2019-09-07 open Assets:Account3\n' +
            '2019-09-07 txn "Tx1"\n' +
            '  Assets:Account1 -100 USD\n' +
            '  Assets:Account2 +100 USD\n' +
            '2019-09-07 txn "Tx2"\n' +
            '  Assets:Account1 -100 USD\n' +
            '  Assets:Account2 +50 USD\n' +
            '  Assets:Account2 +50 USD\n')
        expect(content.getAccounts()).toEqual([
            'Assets:Account2',
            'Assets:Account1',
            'Assets:Account3',
        ])
    })

    it('should parse payees', () => {
        const content = new BeancountFileContent(
            '2019-09-07 txn "Payee1" "Tx1"\n' +
            '2019-09-07 txn "Payee2" "Tx2"\n' +
            '2019-09-07 txn "Payee2" "Tx3"\n' +
            '2019-09-07 txn "Payee3" "Tx4"\n' +
            '2019-09-07 txn "Payee3" "Tx5"\n' +
            '2019-09-07 txn "Payee2" "Tx6"\n')
        expect(content.getPayees()).toEqual([
            'Payee2',
            'Payee3',
            'Payee1',
        ])
    })
})
