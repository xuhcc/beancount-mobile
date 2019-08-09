import { Component, OnInit, OnDestroy, ViewChild, ElementRef, NgZone } from '@angular/core';
import { RouterExtensions, PageRoute } from 'nativescript-angular/router';
import { registerElement } from 'nativescript-angular/element-registry';

import { Subscription } from 'rxjs';
import { switchMap, filter } from 'rxjs/operators';
import { Page } from 'tns-core-modules/ui/page';
import { Fab } from '@nstudio/nativescript-floatingactionbutton';
import { PullToRefresh } from '@nstudio/nativescript-pulltorefresh';
import { makeText as makeToast } from 'nativescript-toast';

import { BeancountFileService } from '../shared/beancount-file.service';
import { BeancountFileContent } from '../shared/beancount-file-content';
import { SideDrawerService } from '../shared/sidedrawer.service';
import { ACTION_BAR_BUTTON_COLOR } from '../shared/constants';
import { setIconColor, textToBitmap } from '../shared/misc';

registerElement('PullToRefresh', () => PullToRefresh);
registerElement('Fab', () => Fab);

@Component({
    selector: 'bc-plaintext',
    templateUrl: './plaintext.component.html',
    styleUrls: ['./plaintext.component.css'],
})
export class PlainTextComponent implements OnInit, OnDestroy {

    fileTitle: string;
    fileText: string;
    private fileSubscription: Subscription;

    @ViewChild('fileTextView', {static: false})
    fileTextView: ElementRef;

    private scrollOnLoad: string;

    constructor(
        private ngZone: NgZone,
        private routerExtensions: RouterExtensions,
        private page: Page,
        private pageRoute: PageRoute,
        private beancountFile: BeancountFileService,
        private sideDrawer: SideDrawerService,
    ) { }

    private fileSubscribe() {
        this.fileSubscription = this.beancountFile.contentStream.subscribe((fileContent: BeancountFileContent) => {
            if (this.fileText) {
                const toast = makeToast('File reloaded', 'long');
                toast.show();
            }
            this.fileText = fileContent.text;
            this.fileTitle = fileContent.getTitle();
        });
    }

    private fileUnsubscribe() {
        this.fileSubscription.unsubscribe();
    }

    ngOnInit() {
        this.page.on('navigatedTo', () => {
            // Re-subscribe each time because
            // ngOnInit is not called after back-navigation
            this.fileSubscribe();
            // Load file only on first run
            if (this.fileText === undefined) {
                this.ngZone.run(() => {
                    this.beancountFile.load();
                });
            }
        });
        this.page.on('navigatingFrom', () => {
            // ngOnDestroy is not called by default when leaving page
            // https://github.com/NativeScript/nativescript-angular/issues/1049
            this.fileUnsubscribe();
        });
        this.pageRoute.activatedRoute
            .pipe(
                switchMap(activatedRoute => activatedRoute.params),
            )
            .forEach((params) => {
                // Scroll to bottom after init when 'scroll' route parameter is present
                if ('scroll' in params) {
                    this.scrollOnLoad = params.scroll;
                }
            });
    }

    onActionBarLoaded(args) {
        const actionBar = args.object;
        // Set color of the 'menu' button
        const menuIcon = actionBar.nativeView.getNavigationIcon();
        setIconColor(menuIcon, ACTION_BAR_BUTTON_COLOR);
        // Set color of the 'overflow' button
        const overflowIcon = actionBar.nativeView.getOverflowIcon();
        setIconColor(overflowIcon, ACTION_BAR_BUTTON_COLOR);
    }

    onFileTextChanged(args) {
        if (this.scrollOnLoad === 'bottom') {
            delete this.scrollOnLoad;
            // Use timeout to make it run on the next angular cycle
            // Otherwise scrollableHeight will be 0
            setTimeout(() => {
                this.scrollToBottom();
            }, 0);
        }
    }

    onAddButtonLoaded(args) {
        // Set FAB icon
        const fab = args.object;
        const bitmap = textToBitmap('+', 100, fab.style.color.hex, 'normal');
        fab.android.setImageBitmap(bitmap);
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

    scrollToTop() {
        const element = this.fileTextView.nativeElement;
        element.scrollToVerticalOffset(0);
    }

    scrollToBottom() {
        const element = this.fileTextView.nativeElement;
        element.scrollToVerticalOffset(element.scrollableHeight);
    }

    ngOnDestroy() {
        this.fileUnsubscribe();
    }

}
