import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ModalDialogParams } from 'nativescript-angular/modal-dialog';

import { ListPicker } from 'tns-core-modules/ui/list-picker';

import { showKeyboard } from '../../shared/misc';

@Component({
    selector: 'bc-payee-modal',
    templateUrl: './payee-modal.component.html',
    styleUrls: ['./payee-modal.component.css'],
})
export class PayeeModalComponent implements AfterViewInit {

    @ViewChild('payeeField', {static: false})
    payeeField: ElementRef;

    payee: FormControl;
    payees: string[];
    selectedIndex: number;

    constructor(private modalParams: ModalDialogParams) {
        this.payee = new FormControl('');
        this.payees = modalParams.context;
    }

    ngAfterViewInit(): void {
        showKeyboard(this.payeeField);
    }

    filterPayees(): void {
        const regexp = new RegExp(this.payee.value, 'iu');
        const filtered = this.modalParams.context.filter((payee) => {
            return payee.search(regexp) !== -1;
        });
        this.payees = filtered;
    }

    onPayeeSelected(args): void {
        const picker = <ListPicker>args.object;
        if (picker.selectedIndex === -1) {
            // Empty list
            return;
        }
        this.payee.setValue(this.payees[picker.selectedIndex]);
    }

    onCancel(): void {
        this.modalParams.closeCallback();
    }

    onSelect(): void {
        this.modalParams.closeCallback(this.payee.value);
    }

}
