import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterExtensions } from 'nativescript-angular/router';
import { ModalDialogOptions, ModalDialogService } from 'nativescript-angular/modal-dialog';

import { isAndroid } from 'tns-core-modules/platform';
import { TextField } from 'tns-core-modules/ui/text-field';
import { ad as androidUtils } from 'tns-core-modules/utils/utils';

import { showDatePicker } from '../shared/date-picker';
import { Transaction } from '../shared/transaction.model';
import { BeancountFileService } from '../shared/beancount-file.service';
import { AccountModalComponent } from './account-modal/account-modal.component';
import { CommodityModalComponent } from './commodity-modal/commodity-modal.component';
import { PayeeModalComponent } from './payee-modal/payee-modal.component';
import { getDateStr, getTodayStr, showKeyboard, configureSaveButton } from '../shared/misc';
import { AFTERVIEWINIT_DELAY } from '../shared/constants';
import { ListValidator } from '../shared/validators';

@Component({
    selector: 'bc-transaction-form',
    templateUrl: './transaction-form.component.html',
    styleUrls: ['./transaction-form.component.scss'],
})
export class TransactionFormComponent implements OnInit, AfterViewInit {

    form: FormGroup;
    flags: string[] = [];
    accounts: string[] = [];
    commodities: string[] = [];
    payees: string[] = [];

    @ViewChild('descriptionField', {static: false})
    descriptionField: ElementRef;

    constructor(
        private formBuilder: FormBuilder,
        private modalService: ModalDialogService,
        private viewContainerRef: ViewContainerRef,
        private routerExtensions: RouterExtensions,
        private beancountFile: BeancountFileService,
    ) {
        this.flags = this.beancountFile.content.getTransactionFlags();
        this.accounts = this.beancountFile.content.getAccounts();
        this.commodities = this.beancountFile.content.getCommodities();
        this.payees = this.beancountFile.content.getPayees();
    }

    ngOnInit() {
        const defaultCurrency = this.beancountFile.content.getOperatingCurrency();
        this.form = this.formBuilder.group({
            date: [
                getTodayStr(),
                Validators.required,
            ],
            flag: [
                this.flags[0],
                ListValidator(this.flags),
            ],
            amount: [
                '',
                [Validators.required, Validators.min(0)],
            ],
            commodity: [
                defaultCurrency,
                Validators.required,
            ],
            accountFrom: [
                '',
                Validators.required,
            ],
            accountTo: [
                '',
                Validators.required,
            ],
            payee: [
                '',
                Validators.maxLength(50),
            ],
            narration: [
                '',
                Validators.maxLength(100),
            ],
        });
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            if (isAndroid) {
                // Fix autosuggestion
                const descriptionField = this.descriptionField.nativeElement.android;
                const inputType = descriptionField.getInputType();
                descriptionField.setInputType(
                    inputType ^ android.text.InputType.TYPE_TEXT_FLAG_AUTO_COMPLETE,
                );
            }
        }, AFTERVIEWINIT_DELAY);
    }

    onActionBarLoaded(args) {
        const actionBar = args.object;
        // Set initial color of the 'save' button
        // and use workaround to change its color on form updates
        // because CSS styling of action bar is very limited
        configureSaveButton(actionBar, this.form.statusChanges);
    }

    onAmountFieldLoaded(args) {
        const amountField = <TextField>args.object;
        showKeyboard(amountField);
    }

    hideKeyboard() {
        androidUtils.dismissSoftInput();
    }

    changeTransactionFlag() {
        const index = this.flags.indexOf(this.form.controls.flag.value);
        const nextIndex = index < this.flags.length - 1 ? index + 1 : 0;
        const nextFlag = this.flags[nextIndex];
        this.form.controls.flag.setValue(nextFlag);
    }

    showDatePicker(): void {
        showDatePicker().then((date: Date) => {
            this.form.controls.date.setValue(getDateStr(date));
        });
    }

    showAccountPicker(fieldName: string): void {
        const options: ModalDialogOptions = {
            viewContainerRef: this.viewContainerRef,
            context: this.accounts,
        };
        this.modalService.showModal(AccountModalComponent, options).then((account: string) => {
            if (account) {
                this.form.controls[fieldName].setValue(account);
            }
        });
    }

    showCommodityPicker(): void {
        const options: ModalDialogOptions = {
            viewContainerRef: this.viewContainerRef,
            context: this.commodities,
        };
        this.modalService.showModal(CommodityModalComponent, options).then((commodity: string) => {
            if (commodity) {
                this.form.controls.commodity.setValue(commodity);
            }
        });
    }

    showPayeePicker(): void {
        const options: ModalDialogOptions = {
            viewContainerRef: this.viewContainerRef,
            context: this.payees,
        };
        this.modalService.showModal(PayeeModalComponent, options).then((payee: string) => {
            if (payee) {
                this.form.controls.payee.setValue(payee);
            }
        });
    }

    goBack() {
        this.routerExtensions.backToPreviousPage();
    }

    save() {
        if (!this.form.valid) {
            return;
        }
        const transaction = new Transaction(this.form.value);
        const beancountTxn = transaction.toBeancount();
        this.beancountFile.append(beancountTxn);
        this.routerExtensions.navigate(['/plaintext', {scroll: 'bottom'}]);
    }

}
