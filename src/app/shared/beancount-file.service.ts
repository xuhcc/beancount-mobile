import { Injectable, OnDestroy, NgZone } from '@angular/core'
import { AbstractControl, ValidatorFn } from '@angular/forms'

import * as appSettings from '@nativescript/core/application-settings'
import { File, Folder } from '@nativescript/core/file-system'
import { isAndroid } from '@nativescript/core/platform'

import { Subject, Subscription, interval } from 'rxjs'
import * as permissions from 'nativescript-permissions'

import { BEANCOUNT_PATH_SETTING } from './constants'
import { BeancountFileContent } from './beancount-file-content'

const BEANCOUNT_FILE_WATCH_INTERVAL = 60 * 1000

@Injectable({
    providedIn: 'root',
})
export class BeancountFileService implements OnDestroy {

    path: string;
    content: BeancountFileContent; // Cached content
    contentStream: Subject<BeancountFileContent>;
    watcher: Subscription;
    isLoading = false;

    constructor(
        private zone: NgZone,
    ) {
        this.path = appSettings.getString(BEANCOUNT_PATH_SETTING)
        this.contentStream = new Subject()
        // Initial load
        if (this.path) {
            this.load()
        }
        // Periodic reload
        this.watcher = interval(BEANCOUNT_FILE_WATCH_INTERVAL).subscribe(() => {
            if (!this.path) {
                // No path to watch
                return
            }
            this.watcherLoad()
        })
    }

    static isValidPath(path: string): boolean {
        if (path && File.exists(path) && !Folder.exists(path)) {
            return true
        }
        return false
    }

    setPath(path: string) {
        if (!path) {
            throw Error('Path can not be empty.')
        }
        appSettings.setString(BEANCOUNT_PATH_SETTING, path)
        this.path = path
        this.clearCache()
    }

    private async checkPermission(): Promise<boolean> {
        let hasPermission = true
        if (isAndroid) {
            const permissionName = 'android.permission.WRITE_EXTERNAL_STORAGE'
            hasPermission = permissions.hasPermission(permissionName)
            if (!hasPermission) {
                try {
                    const result = await permissions.requestPermission(
                        permissionName,
                        'Your permission is required.',
                    )
                    hasPermission = result[permissionName]
                } catch (error) {
                    console.warn('permission denied')
                    hasPermission = false
                }
            }
        }
        return hasPermission
    }

    private clearCache(): void {
        delete this.content
    }

    private async read(): Promise<string> {
        this.isLoading = true
        let fileText
        const hasPermission = await this.checkPermission()
        if (hasPermission) {
            const file = File.fromPath(this.path)
            fileText = await file.readText()
            if (fileText.charCodeAt(fileText.length - 1) !== 10) {
                // File.writeText may strip newline at the and of file
                // Add it on every read to avoid unnecessary reloading by watcher
                fileText += '\n'
            }
        } else {
            // No permission; return empty string
            fileText = ''
        }
        this.zone.run(() => {
            this.isLoading = false
        })
        return fileText
    }

    async load(force = false): Promise<BeancountFileContent> {
        if (force || this.content === undefined) {
            const fileText = await this.read()
            this.content = new BeancountFileContent(fileText)
        }
        this.contentStream.next(this.content)
        return this.content
    }

    private async watcherLoad() {
        const fileText = await this.read()
        if (!this.content || this.content.text !== fileText) {
            // Content changed; update cache and send to stream
            this.content = new BeancountFileContent(fileText)
            this.contentStream.next(this.content)
        }
    }

    append(text: string) {
        this.content.append(text)
        this.save()
    }

    async save(): Promise<void> {
        const file = File.fromPath(this.path)
        try {
            await file.writeText(this.content.text)
        } catch (error) {
            console.warn('file not saved:', error)
        }
    }

    reset() {
        appSettings.remove(BEANCOUNT_PATH_SETTING)
        delete this.path
        this.clearCache()
    }

    ngOnDestroy(): void {
        // Stop file watcher when service is destroyed
        this.watcher.unsubscribe()
    }

}

export function BeancountFilePathValidator(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
        const path = control.value
        if (!BeancountFileService.isValidPath(path)) {
            return {
                invalidPath: {
                    value: control.value,
                },
            }
        } else {
            return null
        }
    }
}
