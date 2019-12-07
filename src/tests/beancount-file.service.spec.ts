import * as appSettings from 'tns-core-modules/application-settings';
import { File } from 'tns-core-modules/file-system';

import { BeancountFileService } from '../app/shared/beancount-file.service';
import { BeancountFileContent } from '../app/shared/beancount-file-content';

describe('beancount file service', () => {
    const fileMock = <any>{
        writeText: () => Promise.resolve(),
    };
    const filePath = '/path/to/file';
    let service;

    beforeEach(() => {
        spyOn(appSettings, 'getString').and.callFake(() => {
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
        const fileText = 'test-content';
        service.content = new BeancountFileContent(fileText);
        service.save();
        expect(fileMock.writeText).toHaveBeenCalledWith(fileText);
    });

    it('should append to file', () => {
        spyOn(service, 'save');
        service.content = new BeancountFileContent('2019-01-01 txn "test1"\n');
        service.append('2019-01-02 txn "test2"');
        expect(service.content.text).toBe(
            '2019-01-01 txn "test1"\n\n' +
            '2019-01-02 txn "test2"\n')
        expect(service.save).toHaveBeenCalled();
    });

    it('should append to file with no linebreak at the end', () => {
        service.content = new BeancountFileContent('2019-01-01 txn "test1"');
        service.append('2019-01-02 txn "test2"');
        expect(service.content.text).toBe(
            '2019-01-01 txn "test1"\n\n' +
            '2019-01-02 txn "test2"\n')
    });
});
