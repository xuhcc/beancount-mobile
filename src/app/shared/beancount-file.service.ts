import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';

import * as appSettings from 'tns-core-modules/application-settings';
import { File, Folder } from 'tns-core-modules/file-system';
import { isAndroid } from 'tns-core-modules/platform';

import * as permissions from 'nativescript-permissions';

import { BEANCOUNT_PATH_SETTING } from '../shared/constants';

// Currently there is no support for \p{L}
// https://github.com/microsoft/TypeScript/issues/32214
export const ACCOUNT_NAME_REGEXP = /^[^\s:]+:[^\s]+$/;

@Injectable({
    providedIn: 'root',
})
export class BeancountFileService {

    path: string;
    content: string;

    constructor() {
        this.path = appSettings.getString(BEANCOUNT_PATH_SETTING);
    }

    static isValidPath(path: string): boolean {
        if (path && File.exists(path) && !Folder.exists(path)) {
            return true;
        }
        return false;
    }

    setPath(path: string) {
        if (!path) {
            throw Error('Path can not be empty.');
        }
        appSettings.setString(BEANCOUNT_PATH_SETTING, path);
        this.path = path;
        this.clearCache();
    }

    async checkPermission(): Promise<boolean> {
        let hasPermission = true;
        if (isAndroid) {
            // TODO: remove <uses-permission android:name="android.permission.INTERNET"/>
            const permissionName = 'android.permission.WRITE_EXTERNAL_STORAGE';
            hasPermission = permissions.hasPermission(permissionName);
            if (!hasPermission) {
                try {
                    const result = await permissions.requestPermission(
                        permissionName,
                        'Your permission is required.',
                    );
                    hasPermission = result[permissionName];
                } catch (error) {
                    console.warn('permission denied');
                    hasPermission = false;
                }
            }
        }
        return hasPermission;
    }

    clearCache() {
        delete this.content;
    }

    async read(): Promise<string> {
        if (this.content !== undefined) {
            return this.content;
        }
        let hasPermission = await this.checkPermission();
        if (hasPermission) {
            const file = File.fromPath(this.path);
            this.content = await file.readText();
        } else {
            // No permission; create empty file
            this.content = '';
        }
        return this.content;
    }

    append(text: string) {
        const numLineBreaks = this.content.endsWith('\n') ? 1 : 2;
        this.content += `${'\n'.repeat(numLineBreaks)}${text}`;
        this.save();
    }

    save() {
        const file = File.fromPath(this.path);
        file.writeText(this.content).catch((error) => { // eslint-disable-line handle-callback-err
            console.warn('file not saved');
        });
    }

    reset() {
        appSettings.remove(BEANCOUNT_PATH_SETTING);
        delete this.path;
        this.clearCache();
    }

    getTitle(): string {
        const regexp = /^option "title" "(.+)"/um;
        const match = this.content.match(regexp);
        if (match) {
            return match[1];
        } else {
            return 'Untitled';
        }
    }

    getOperatingCurrency(): string {
        const regexp = /^option "operating_currency" "([^\s]+)"/um;
        const match = this.content.match(regexp);
        if (match) {
            return match[1];
        } else {
            return '';
        }
    }

    getAccounts(): string[] {
        // Currently there is no support for \p{L}
        // https://github.com/microsoft/TypeScript/issues/32214
        const regexp = /^[\d-]{10} open ([^\s]+)/umg;
        // And poor support for matchAll
        // https://stackoverflow.com/questions/55499555/
        const matches = this.content['matchAll'](regexp);
        const accounts = Array.from(matches).map((match) => {
            return match[1];
        }).sort();
        return accounts;
    }

    getCommodities(): string[] {
        const regexp = /^[\d-]{10} commodity ([A-Z]+)$/umg;
        const matches = this.content['matchAll'](regexp);
        const commodities = Array.from(matches).map((match) => {
            return match[1];
        }).sort();
        return commodities;
    }

    getPayees(): string[] {
        // Currently there is no support for \p{L}
        // https://github.com/microsoft/TypeScript/issues/32214
        const regexp = /^[\d-]{10} (txn|\*) "([^"]+)" ".*/umg;
        const matches = this.content['matchAll'](regexp);
        const payees = Array.from(matches)
            .map((match) => match[2])
            // Remove duplicates
            .filter((payee, index, self) => self.indexOf(payee) === index)
            .sort(); // TODO: Sort by frequency
        return payees;
    }

}

export function BeancountFilePathValidator(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
        const path = control.value;
        if (!BeancountFileService.isValidPath(path)) {
            return {
                invalidPath: {
                    value: control.value,
                },
            };
        } else {
            return null;
        }
    };
}
