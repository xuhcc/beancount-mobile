import { fakeAsync } from '@angular/core/testing';

import * as appSettings from 'tns-core-modules/application-settings';
import { File } from 'tns-core-modules/file-system';

import { ACCOUNT_NAME_REGEXP, BeancountFileService } from '../app/shared/beancount-file.service';

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

describe('beancount file service', () => {
    const fileMock = <any>{
        writeText: () => Promise.resolve(),
    };
    const filePath = '/path/to/file';
    let service;

    beforeEach(() => {
        spyOn(appSettings, 'getString').and.callFake((key) => {
            return filePath;
        });
        spyOn(File, 'fromPath').and.returnValue(fileMock);

        service = new BeancountFileService();
    });

    it('should be initialized with path', () => {
        expect(service).toBeTruthy();
        expect(service.path).toEqual(filePath);
    });

    it('should save file', () => {
        spyOn(fileMock, 'writeText').and.callThrough();
        service.content = 'test-content';
        service.save();
        expect(fileMock.writeText).toHaveBeenCalledWith(service.content);
    });

    it('should append to file', () => {
        spyOn(service, 'save');
        service.content = '2019-01-01 txn "test1"\n';
        service.append('2019-01-02 txn "test2"');
        expect(service.content).toBe(
            '2019-01-01 txn "test1"\n\n' +
            '2019-01-02 txn "test2"')
        expect(service.save).toHaveBeenCalled();
    });

    it('should append to file with no linebreak at the end', () => {
        service.content = '2019-01-01 txn "test1"';
        service.append('2019-01-02 txn "test2"');
        expect(service.content).toBe(
            '2019-01-01 txn "test1"\n\n' +
            '2019-01-02 txn "test2"')
    });
});
