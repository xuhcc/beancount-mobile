import { Component, OnInit, NgZone } from '@angular/core';
import { RouterExtensions } from 'nativescript-angular/router';

import { openUrl } from 'tns-core-modules/utils/utils';
import { TextField } from 'tns-core-modules/ui/text-field';
import * as appSettings from 'tns-core-modules/application-settings';
import { File, Folder } from 'tns-core-modules/file-system';

import { BEANCOUNT_PATH_SETTING } from '../shared/constants';
import { BeancountFileService } from '../shared/beancount-file.service';
import { openFilePicker } from '../shared/beancount-file-picker';
import { SideDrawerService } from '../shared/sidedrawer.service';

@Component({
    selector: 'bc-welcome',
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.css'],
})
export class WelcomeComponent implements OnInit {

    filePath: string;

    constructor(
        private ngZone: NgZone,
        private routerExtensions: RouterExtensions,
        private sideDrawer: SideDrawerService,
        private beancountFile: BeancountFileService,
    ) { }

    ngOnInit() {
        this.sideDrawer.lock();
        this.filePath = this.beancountFile.path;
    }

    openBeancountWebsite() {
        openUrl('http://furius.ca/beancount/');
    }

    openFilePicker() {
        openFilePicker().then((filePath) => {
            this.filePath = filePath;
        });
    }

    isValidPath(): boolean {
        return BeancountFileService.isValidPath(this.filePath);
    }

    onContinueTap() {
        this.beancountFile.setPath(this.filePath);
        // Can't use async/await with angular
        // https://github.com/angular/zone.js/issues/740
        this.beancountFile.load().then(() => {
            this.sideDrawer.unlock();
            this.routerExtensions.navigate(['/plaintext'], {
                clearHistory: true,
            });
        });
    }

}
