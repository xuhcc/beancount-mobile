import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';

import * as appSettings from 'tns-core-modules/application-settings';
import { File, Folder } from 'tns-core-modules/file-system';
import { isAndroid } from 'tns-core-modules/platform';

import * as permissions from 'nativescript-permissions';

import { BEANCOUNT_PATH_SETTING } from './constants';
import { BeancountFileContent } from './beancount-file-content';

@Injectable({
    providedIn: 'root',
})
export class BeancountFileService {

    path: string;
    content: BeancountFileContent;

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

    async read(): Promise<BeancountFileContent> {
        if (this.content !== undefined) {
            return this.content;
        }
        let hasPermission = await this.checkPermission();
        if (hasPermission) {
            const file = File.fromPath(this.path);
            const fileText = await file.readText();
            this.content = new BeancountFileContent(fileText);
        } else {
            // No permission; create empty file
            this.content = new BeancountFileContent('');
        }
        return this.content;
    }

    append(text: string) {
        this.content.append(text);
        this.save();
    }

    save() {
        const file = File.fromPath(this.path);
        file.writeText(this.content.text).catch((error) => { // eslint-disable-line handle-callback-err
            console.warn('file not saved');
        });
    }

    reset() {
        appSettings.remove(BEANCOUNT_PATH_SETTING);
        delete this.path;
        this.clearCache();
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
