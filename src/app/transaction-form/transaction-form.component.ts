import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterExtensions } from 'nativescript-angular/router';
import { ModalDialogOptions, ModalDialogService } from 'nativescript-angular/modal-dialog';

import { TextField } from 'tns-core-modules/ui/text-field';
import { ModalDatetimepicker } from 'nativescript-modal-datetimepicker';

import { Transaction } from '../shared/transaction.model';
import { BeancountFileService } from '../shared/beancount-file.service';
import { AccountModalComponent } from './account-modal/account-modal.component';
import { CommodityModalComponent } from './commodity-modal/commodity-modal.component';
import { PayeeModalComponent } from './payee-modal/payee-modal.component';
import { getDateStr, getTodayStr, showKeyboard, setIconColor, configureSaveButton } from '../shared/misc';
import { ACTION_BAR_BUTTON_COLOR, ACTION_BAR_BUTTON_DISABLED_COLOR } from '../shared/constants';

@Component({
    selector: 'bc-transaction-form',
    templateUrl: './transaction-form.component.html',
    styleUrls: ['./transaction-form.component.scss'],
})
export class TransactionFormComponent implements OnInit {

    form: FormGroup;
    accounts: string[] = [];
    commodities: string[] = [];
    payees: string[] = [];

    constructor(
        private formBuilder: FormBuilder,
        private modalService: ModalDialogService,
        private viewContainerRef: ViewContainerRef,
        private routerExtensions: RouterExtensions,
        private beancountFile: BeancountFileService,
    ) {
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

    onActionBarLoaded(args) {
        const actionBar = args.object;
        // Set color of the 'back' button
        const closeIcon = actionBar.nativeView.getNavigationIcon();
        setIconColor(closeIcon, ACTION_BAR_BUTTON_COLOR);
        // Set initial color of the 'save' button
        // and use workaround to change its color on form updates
        // because CSS styling of action bar is very limited
        configureSaveButton(actionBar, this.form.statusChanges);
    }

    onAmountFieldLoaded(args) {
        const amountField = <TextField>args.object;
        showKeyboard(amountField);
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

    showDatePicker(): void {
        const picker = new ModalDatetimepicker();
        picker.pickDate({
            title: 'Select date',
            theme: 'light',
            maxDate: new Date(),
        }).then((result) => {
            const date = new Date(Date.UTC(result.year, result.month - 1, result.day));
            this.form.controls.date.setValue(getDateStr(date));
        });
    }

    showPayeeModal(): void {
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
