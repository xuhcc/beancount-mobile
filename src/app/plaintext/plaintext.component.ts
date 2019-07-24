import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { RouterExtensions } from 'nativescript-angular/router';
import { registerElement } from 'nativescript-angular/element-registry';

import { Subscription } from 'rxjs';
import { Page } from 'tns-core-modules/ui/page';
import { PullToRefresh } from 'nativescript-pulltorefresh';

import { BeancountFileService } from '../shared/beancount-file.service';
import { BeancountFileContent } from '../shared/beancount-file-content';
import { SideDrawerService } from '../shared/sidedrawer.service';

registerElement('PullToRefresh', () => PullToRefresh);

@Component({
    selector: 'bc-plaintext',
    templateUrl: './plaintext.component.html',
    styleUrls: ['./plaintext.component.css'],
})
export class PlainTextComponent implements OnInit, OnDestroy {

    fileTitle: string;
    fileText: string;
    fileSubscription: Subscription;

    @ViewChild('fileTextView', {static: false})
    fileTextView: ElementRef;

    constructor(
        private page: Page,
        private routerExtensions: RouterExtensions,
        private beancountFile: BeancountFileService,
        private sideDrawer: SideDrawerService,
    ) { }

    ngOnInit() {
        this.fileSubscription = this.beancountFile.contentStream.subscribe((fileContent: BeancountFileContent) => {
            this.fileText = fileContent.text;
            this.fileTitle = fileContent.getTitle();
            console.info('text view updated');
        });
        this.beancountFile.load();
        this.page.on('navigatingFrom', () => {
            // ngOnDestroy is not called by default when leaving page
            // https://github.com/NativeScript/nativescript-angular/issues/1049
            this.ngOnDestroy();
        });
    }

    reloadFile(args) {
        const pullRefresh = <PullToRefresh>args.object;
        setTimeout(() => {
            // Force reload
            this.beancountFile.load(true).then(() => {
                pullRefresh.refreshing = false;
            });
        }, 0);
    }

    openDrawer() {
        this.sideDrawer.open();
    }

    addTransaction() {
        this.routerExtensions.navigate(['/add-transaction']);
    }

    addAccount() {
        this.routerExtensions.navigate(['/add-account']);
    }

    scrollToBottom() {
        const element = this.fileTextView.nativeElement;
        element.scrollToVerticalOffset(element.scrollableHeight);
    }

    ngOnDestroy() {
        this.fileSubscription.unsubscribe();
    }

}
