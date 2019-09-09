import {
    ACCOUNT_NAME_REGEXP,
    BeancountFileContent,
} from '../app/shared/beancount-file-content';

describe('regexp tests', () => {
    describe('account name regexp', () => {
        it('should allow valid account name', () => {
            const result = ACCOUNT_NAME_REGEXP.test('Assets:Test-Account');
            expect(result).toBe(true);
        });
        it('should allow unicode account name', () => {
            const result = ACCOUNT_NAME_REGEXP.test('Активы:Тест-Счёт');
            expect(result).toBe(true);
        });
        it('should not allow account name with whitespace', () => {
            const result = ACCOUNT_NAME_REGEXP.test('Assets:Test Account');
            expect(result).toBe(false);
        });
        it('should not allow top level accounts', () => {
            const result = ACCOUNT_NAME_REGEXP.test('Assets');
            expect(result).toBe(false);
        });
    });
});

describe('beancount file content tests', () => {
    it('should initialize successfully', () => {
        const text = 'test text';
        const content = new BeancountFileContent(text);
        expect(content.text).toBe(text);
    });

    it('should parse title', () => {
        const content = new BeancountFileContent(
            'option "title" "BeanTest"\n' +
            'option "operating_currency" "USD"\n');
        expect(content.getTitle()).toBe('BeanTest');
        expect(content.getOperatingCurrency()).toBe('USD');
        expect(content.getTransactionFlags()).toEqual(['*', '!']);
    });

    it('should parse transaction flags option', () => {
        const content = new BeancountFileContent(
            '2019-01-01 custom "bcm_option" "transaction_flags" "[\'!\', \'?\']"\n' +
            '2019-01-02 commodity USD\n');
        expect(content.getTransactionFlags()).toEqual(['!', '?']);
    });

    it('should parse payees', () => {
        const content = new BeancountFileContent(
            '2019-09-07 txn "Payee1" "Tx1"\n' +
            '2019-09-07 txn "Payee2" "Tx2"\n' +
            '2019-09-07 txn "Payee2" "Tx3"\n' +
            '2019-09-07 txn "Payee3" "Tx4"\n' +
            '2019-09-07 txn "Payee3" "Tx5"\n' +
            '2019-09-07 txn "Payee2" "Tx6"\n');
        expect(content.getPayees()).toEqual([
            'Payee2',
            'Payee3',
            'Payee1',
        ]);
    });
});
