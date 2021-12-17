import { Component, OnInit, ViewContainerRef } from '@angular/core'
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms'
import { ModalDialogOptions, ModalDialogService, RouterExtensions } from '@nativescript/angular'

import { TextField } from '@nativescript/core/ui/text-field'
import { ad as androidUtils } from '@nativescript/core/utils/utils'

import { showDatePicker } from '../shared/date-picker'
import { Balance, evaluateArithmeticExpression } from '../shared/balance.model'
import { BeancountFileService } from '../shared/beancount-file.service'
import { AccountModalComponent } from '../transaction-form/account-modal/account-modal.component'
import { CommodityModalComponent } from '../transaction-form/commodity-modal/commodity-modal.component'
import { getDateStr, getTodayStr, showKeyboard, configureSaveButton } from '../shared/misc'
import { validateDate } from '../shared/validators'

function validateAmount(control: AbstractControl): {[key: string]: any} | null {
    const error = {invalidExpression: {value: control.value}}
    let amount
    try {
        amount = evaluateArithmeticExpression(control.value)
    } catch {
        return error
    }
    if (isNaN(amount) || amount <= 0) {
        return error
    }
}

@Component({
    selector: 'bc-balance-form',
    templateUrl: './balance-form.component.html',
    styleUrls: ['./balance-form.component.scss'],
})
export class BalanceFormComponent implements OnInit {

    form: FormGroup;
    accounts: string[] = [];
    commodities: string[] = [];

    showValidationErrors = false;

    amountFieldKeyboardType = 'number';

    constructor(
        private formBuilder: FormBuilder,
        private modalService: ModalDialogService,
        private viewContainerRef: ViewContainerRef,
        private routerExtensions: RouterExtensions,
        private beancountFile: BeancountFileService,
    ) {
        this.accounts = this.beancountFile.content.getAccounts()
        this.commodities = this.beancountFile.content.getCommodities()
    }

    ngOnInit() {
        this.form = this.formBuilder.group({
            date: [
                getTodayStr(),
                [Validators.required, validateDate],
            ],
            account: [
                '',
                Validators.required,
            ],
            commodity: [
                '',
                Validators.required,
            ],
            amount: [
                '',
                [Validators.required, validateAmount],
            ],
        })
    }

    onActionBarLoaded(event) {
        const actionBar = event.object
        configureSaveButton(actionBar, this.form.statusChanges)
    }

    onAmountFieldLoaded(event) {
        const amountField = event.object as TextField
        showKeyboard(amountField)
    }

    hasError(fieldName: string): boolean {
        const field = this.form.get(fieldName)
        return this.showValidationErrors && field.invalid
    }

    enableArithmeticExpressions() {
        this.amountFieldKeyboardType = 'phone'
    }

    hideKeyboard() {
        androidUtils.dismissSoftInput()
    }

    showDatePicker(): void {
        showDatePicker().then((date: Date) => {
            this.form.controls.date.setValue(getDateStr(date))
        }).catch((error) => {
            console.warn(error)
        })
    }

    showAccountPicker(): void {
        const options: ModalDialogOptions = {
            viewContainerRef: this.viewContainerRef,
            context: this.accounts,
        }
        this.modalService.showModal(AccountModalComponent, options).then((account: string) => {
            if (account) {
                this.form.controls.account.setValue(account)
            }
        })
    }

    showCommodityPicker(): void {
        const options: ModalDialogOptions = {
            viewContainerRef: this.viewContainerRef,
            context: this.commodities,
        }
        this.modalService.showModal(CommodityModalComponent, options).then((commodity: string) => {
            if (commodity) {
                this.form.controls.commodity.setValue(commodity)
            }
        })
    }

    goBack() {
        this.routerExtensions.backToPreviousPage()
    }

    save(): void {
        if (!this.form.valid) {
            this.showValidationErrors = true
            return
        }
        const balance = new Balance(this.form.value)
        const beancountBalance = balance.toBeancount()
        this.beancountFile.append(beancountBalance)
        this.routerExtensions.navigate(['/plaintext', {scroll: 'bottom'}])
    }

}
