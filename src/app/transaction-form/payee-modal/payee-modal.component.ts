import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { ModalDialogParams } from 'nativescript-angular/modal-dialog'

import { showKeyboard } from '../../shared/misc'

@Component({
    selector: 'bc-payee-modal',
    templateUrl: './payee-modal.component.html',
    styleUrls: ['./payee-modal.component.scss'],
})
export class PayeeModalComponent implements AfterViewInit {

    @ViewChild('payeeField', {static: false})
    payeeField: ElementRef;

    payee: FormControl;
    payees: string[];

    constructor(private modalParams: ModalDialogParams) {
        this.payee = new FormControl('', Validators.required)
        this.payees = modalParams.context
    }

    ngAfterViewInit(): void {
        showKeyboard(this.payeeField.nativeElement)
    }

    filterPayees(): void {
        const regexp = new RegExp(this.payee.value, 'iu')
        const filtered = this.modalParams.context.filter((payee) => {
            return payee.search(regexp) !== -1
        }).sort()
        this.payees = filtered
    }

    onPayeeTap(payee: string): void {
        if (payee === this.payee.value) {
            // Item already selected, close modal on second tap
            this.select()
        } else {
            this.payee.setValue(payee)
            // Move cursor to the end of string
            this.payeeField.nativeElement.android.setSelection(payee.length)
        }
    }

    select(): void {
        this.modalParams.closeCallback(this.payee.value)
    }

}
