import { Component, OnInit, NgZone, ViewChild, ElementRef } from '@angular/core';
import { RouterExtensions } from 'nativescript-angular/router';

import { openUrl } from 'tns-core-modules/utils/utils';
import { Page } from 'tns-core-modules/ui/page';
import { Color } from 'tns-core-modules/color';

import { BeancountFileService } from '../shared/beancount-file.service';
import { openFilePicker } from '../shared/beancount-file-picker';
import { SideDrawerService } from '../shared/sidedrawer.service';

const BEANCOUNT_WEBSITE = 'http://furius.ca/beancount/';

@Component({
    selector: 'bc-welcome',
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent implements OnInit {

    welcomeText = 'Beancount is a plain-text accounting system. ' +
        'You can read more about it at the ' +
        `<a href="${BEANCOUNT_WEBSITE}">Beancount website</a>.`;
    filePath: string;

    @ViewChild('welcomeTextView', {static: false})
    welcomeTextView: ElementRef;

    constructor(
        private ngZone: NgZone,
        private page: Page,
        private routerExtensions: RouterExtensions,
        private sideDrawer: SideDrawerService,
        private beancountFile: BeancountFileService,
    ) {
        page.actionBarHidden = true;
    }

    ngOnInit() {
        this.sideDrawer.lock();
        this.filePath = this.beancountFile.path;
    }

    onWelcomeTextLoaded() {
        // https://github.com/NativeScript/NativeScript/issues/4746#issuecomment-475841566
        const element = this.welcomeTextView.nativeElement.android;
        // See welcome-text class in component CSS
        element.setTextSize(16);
        element.setLetterSpacing(0.04);
        const textColor = new Color(255 * 0.6, 255, 255, 255).android;
        element.setTextColor(textColor);
        element.setLinkTextColor(textColor);
    }

    openBeancountWebsite() {
        openUrl(BEANCOUNT_WEBSITE);
    }

    openFilePicker() {
        openFilePicker().then((filePath: string) => {
            if (filePath) {
                this.filePath = filePath;
            }
        });
    }

    isValidPath(): boolean {
        return BeancountFileService.isValidPath(this.filePath);
    }

    onContinueTap() {
        this.beancountFile.setPath(this.filePath);
        // Can't use async/await with angular
        // https://github.com/angular/zone.js/issues/740
        this.beancountFile.load()
            .then(() => {
                this.sideDrawer.unlock();
                this.routerExtensions.navigate(['/plaintext'], {
                    clearHistory: true,
                });
            })
            .catch((error) => {
                this.beancountFile.reset();
                console.warn(error);
            });
    }

}
