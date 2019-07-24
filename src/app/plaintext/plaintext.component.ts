import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { RouterExtensions } from 'nativescript-angular/router';
import { registerElement } from 'nativescript-angular/element-registry';

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
export class PlainTextComponent implements OnInit {

    fileTitle: string;
    fileText: string;

    @ViewChild('fileTextView', {static: false})
    fileTextView: ElementRef;

    constructor(
        private routerExtensions: RouterExtensions,
        private beancountFile: BeancountFileService,
        private sideDrawer: SideDrawerService,
    ) { }

    ngOnInit() {
        this.loadFile();
    }

    loadFile() {
        this.beancountFile.read().then((fileContent: BeancountFileContent) => {
            this.fileText = fileContent.text;
            this.fileTitle = fileContent.getTitle();
        });
    }

    reloadFile(args) {
        const pullRefresh = <PullToRefresh>args.object;
        setTimeout(() => {
            this.beancountFile.clearCache();
            this.loadFile();
            pullRefresh.refreshing = false;
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

}
