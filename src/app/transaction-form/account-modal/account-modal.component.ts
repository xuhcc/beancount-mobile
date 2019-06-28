import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

import { ModalDialogParams } from 'nativescript-angular/modal-dialog';

import { showKeyboard } from '../../shared/misc';

@Component({
    selector: 'bc-account-modal',
    templateUrl: './account-modal.component.html',
    styleUrls: ['./account-modal.component.css'],
})
export class AccountModalComponent implements AfterViewInit {

    @ViewChild('accountField', {static: false})
    accountField: ElementRef;

    accounts: string[];
    search: string;
    selectedIndex: number;

    constructor(private modalParams: ModalDialogParams) {
        this.accounts = modalParams.context;
    }

    ngAfterViewInit(): void {
        showKeyboard(this.accountField);
    }

    filterAccounts(): void {
        const regexp = new RegExp(this.search, 'iu');
        this.accounts = this.modalParams.context.filter((account) => {
            return account.search(regexp) !== -1;
        });
    }

    onCancel(): void {
        this.modalParams.closeCallback(null);
    }

    onSelect(): void {
        const account = this.accounts[this.selectedIndex];
        this.modalParams.closeCallback(account);
    }

}
