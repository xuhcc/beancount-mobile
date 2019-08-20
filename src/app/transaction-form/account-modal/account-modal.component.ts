import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ModalDialogParams } from 'nativescript-angular/modal-dialog';

import { showKeyboard } from '../../shared/misc';
import { ListValidator } from '../../shared/validators';

@Component({
    selector: 'bc-account-modal',
    templateUrl: './account-modal.component.html',
    styleUrls: ['./account-modal.component.scss'],
})
export class AccountModalComponent implements AfterViewInit {

    @ViewChild('accountField', {static: false})
    accountField: ElementRef;

    account: FormControl;
    accounts: string[];

    constructor(private modalParams: ModalDialogParams) {
        this.accounts = modalParams.context;
        this.account = new FormControl('', [
            ListValidator(this.accounts),
        ]);
    }

    ngAfterViewInit(): void {
        showKeyboard(this.accountField.nativeElement);
    }

    filterAccounts(): void {
        const regexp = new RegExp(this.account.value, 'iu');
        this.accounts = this.modalParams.context.filter((account) => {
            return account.search(regexp) !== -1;
        });
    }

    onAccountTap(account: string): void {
        if (account === this.account.value) {
            // Item already selected, close modal on second tap
            this.select();
        } else {
            this.account.setValue(account);
        }
    }

    select(): void {
        this.modalParams.closeCallback(this.account.value);
    }

}
