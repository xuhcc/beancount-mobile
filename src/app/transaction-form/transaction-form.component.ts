import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterExtensions } from 'nativescript-angular/router';
import { ModalDialogOptions, ModalDialogService } from 'nativescript-angular/modal-dialog';

import { TextField } from 'tns-core-modules/ui/text-field';

import { Transaction } from '../shared/transaction.model';
import { BeancountFileService } from '../shared/beancount-file.service';
import { AccountModalComponent } from './account-modal/account-modal.component';
import { CommodityModalComponent } from './commodity-modal/commodity-modal.component';
import { PayeeModalComponent } from './payee-modal/payee-modal.component';
import { getTodayStr, configureSaveButton } from '../shared/misc';

@Component({
    selector: 'bc-transaction-form',
    templateUrl: './transaction-form.component.html',
    styleUrls: ['./transaction-form.component.css'],
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
            accountFrom: [
                '',
                Validators.required,
            ],
            accountTo: [
                '',
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
            date: [
                getTodayStr(),
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

    onSaveButtonLoaded(args) {
        const actionBar = args.object.actionBar;
        configureSaveButton(actionBar, this.form.statusChanges);
    }

    onAmountFieldLoaded(args) {
        const amountField = <TextField>args.object;
        amountField.focus();
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
