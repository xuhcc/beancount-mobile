import { Component, OnInit, OnDestroy, ViewChild, ElementRef, NgZone } from '@angular/core';
import { RouterExtensions, PageRoute } from 'nativescript-angular/router';
import { registerElement } from 'nativescript-angular/element-registry';

import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Page } from 'tns-core-modules/ui/page';
import { Fab } from '@nstudio/nativescript-floatingactionbutton';
import { PullToRefresh } from '@nstudio/nativescript-pulltorefresh';
import { Toasty, ToastPosition, ToastDuration } from 'nativescript-toasty';

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
    styleUrls: ['./plaintext.component.scss'],
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

    private show(content: BeancountFileContent) {
        if (!content) {
            return;
        }
        this.fileText = content.text;
        this.fileTitle = content.getTitle();
    }

    private fileSubscribe() {
        this.fileSubscription = this.beancountFile.contentStream.subscribe((content: BeancountFileContent) => {
            if (this.fileText) {
                const toast = new Toasty({
                    text: 'File reloaded',
                    position: ToastPosition.BOTTOM,
                    duration: ToastDuration.LONG,
                });
                toast.show();
            }
            this.show(content);
        });
    }

    private fileUnsubscribe() {
        this.fileSubscription.unsubscribe();
    }

    ngOnInit() {
        this.show(this.beancountFile.content);
        this.page.on('navigatedTo', () => {
            // Re-subscribe each time because
            // ngOnInit is not called after back-navigation
            this.fileSubscribe();
            // Ask for content if initial show() call was too early
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

    onFileTextChanged() {
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
        const bitmap = textToBitmap(
            '+',
            fab.style.fontSize,
            fab.style.color.hex,
            fab.style.fontFamily,
        );
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

    addCommodity() {
        this.routerExtensions.navigate(['/add-commodity']);
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
