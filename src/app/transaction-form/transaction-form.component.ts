import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ViewContainerRef } from '@angular/core'
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms'
import { ModalDialogOptions, ModalDialogService, RouterExtensions } from '@nativescript/angular'

import { isAndroid } from '@nativescript/core/platform'
import { TextField } from '@nativescript/core/ui/text-field'
import { ad as androidUtils } from '@nativescript/core/utils/utils'

import { showDatePicker } from '../shared/date-picker'
import { Transaction, evaluateArithmeticExpression } from '../shared/transaction.model'
import { BeancountFileService } from '../shared/beancount-file.service'
import { AccountModalComponent } from './account-modal/account-modal.component'
import { CommodityModalComponent } from './commodity-modal/commodity-modal.component'
import { PayeeModalComponent } from './payee-modal/payee-modal.component'
import { getDateStr, getTodayStr, showKeyboard, configureSaveButton } from '../shared/misc'
import { AFTERVIEWINIT_DELAY } from '../shared/constants'
import { ListValidator, validateDate } from '../shared/validators'

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

    swapFromToAccounts: boolean;
    showValidationErrors = false;

    amountFieldKeyboardType = 'number';

    @ViewChild('descriptionField', {static: false})
    descriptionField: ElementRef;

    constructor(
        private formBuilder: FormBuilder,
        private modalService: ModalDialogService,
        private viewContainerRef: ViewContainerRef,
        private routerExtensions: RouterExtensions,
        private beancountFile: BeancountFileService,
    ) {
        this.flags = this.beancountFile.content.getTransactionFlags()
        this.swapFromToAccounts = this.beancountFile.content.getAccountOrder() === 'to_from'

        this.accounts = this.beancountFile.content.getAccounts()
        this.commodities = this.beancountFile.content.getCommodities()
        this.payees = this.beancountFile.content.getPayees()
    }

    ngOnInit() {
        const defaultCurrency = this.beancountFile.content.getOperatingCurrency()
        this.form = this.formBuilder.group({
            date: [
                getTodayStr(),
                [Validators.required, validateDate],
            ],
            flag: [
                this.flags[0],
                ListValidator(this.flags),
            ],
            amount: [
                '',
                [Validators.required, validateAmount],
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
        })
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            if (isAndroid) {
                // Fix autosuggestion
                const descriptionField = this.descriptionField.nativeElement.android
                const inputType = descriptionField.getInputType()
                descriptionField.setInputType(
                    inputType ^ android.text.InputType.TYPE_TEXT_FLAG_AUTO_COMPLETE,
                )
            }
        }, AFTERVIEWINIT_DELAY)
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

    changeTransactionFlag() {
        const index = this.flags.indexOf(this.form.controls.flag.value)
        const nextIndex = index < this.flags.length - 1 ? index + 1 : 0
        const nextFlag = this.flags[nextIndex]
        this.form.controls.flag.setValue(nextFlag)
    }

    showDatePicker(): void {
        showDatePicker().then((date: Date) => {
            this.form.controls.date.setValue(getDateStr(date))
        }).catch((error) => {
            console.warn(error)
        })
    }

    get account1Name(): string {
        return this.swapFromToAccounts ? 'accountTo' : 'accountFrom'
    }

    get account2Name(): string {
        return this.swapFromToAccounts ? 'accountFrom' : 'accountTo'
    }

    get account1Label(): string {
        return this.swapFromToAccounts ? 'To account' : 'From account'
    }

    get account2Label(): string {
        return this.swapFromToAccounts ? 'From account' : 'To account'
    }

    showAccountPicker(fieldName: string): void {
        const options: ModalDialogOptions = {
            viewContainerRef: this.viewContainerRef,
            context: this.accounts,
        }
        this.modalService.showModal(AccountModalComponent, options).then((account: string) => {
            if (account) {
                this.form.controls[fieldName].setValue(account)
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

    showPayeePicker(): void {
        const options: ModalDialogOptions = {
            viewContainerRef: this.viewContainerRef,
            context: this.payees,
        }
        this.modalService.showModal(PayeeModalComponent, options).then((payee: string) => {
            if (payee) {
                this.form.controls.payee.setValue(payee)
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
        const transaction = new Transaction({
            ...this.form.value,
            swapFromToAccounts: this.swapFromToAccounts,
        })
        const beancountTxn = transaction.toBeancount()
        this.beancountFile.append(beancountTxn)
        this.routerExtensions.navigate(['/plaintext', {scroll: 'bottom'}])
    }

}
