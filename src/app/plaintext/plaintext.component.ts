import { Component, OnInit } from '@angular/core';
import { RouterExtensions } from 'nativescript-angular/router';
import { registerElement } from 'nativescript-angular/element-registry';

import { PullToRefresh } from 'nativescript-pulltorefresh';

import { BeancountFileService } from '../shared/beancount-file.service';
import { SideDrawerService } from '../shared/sidedrawer.service';

registerElement('PullToRefresh', () => PullToRefresh);

@Component({
    selector: 'bc-plaintext',
    templateUrl: './plaintext.component.html',
    styleUrls: ['./plaintext.component.css'],
})
export class PlainTextComponent implements OnInit {

    title: string;
    fileContent: string;

    constructor(
        private routerExtensions: RouterExtensions,
        private beancountFile: BeancountFileService,
        private sideDrawer: SideDrawerService,
    ) { }

    ngOnInit() {
        this.loadFile();
    }

    loadFile() {
        this.beancountFile.read().then((fileContent: string) => {
            this.fileContent = fileContent;
            this.title = this.beancountFile.getTitle();
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

}
