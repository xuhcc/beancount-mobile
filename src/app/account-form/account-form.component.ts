import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { RouterExtensions } from '@nativescript/angular'

import { TextField } from '@nativescript/core/ui/text-field'

import { Account } from '../shared/account.model'
import { BeancountFileService } from '../shared/beancount-file.service'
import { showDatePicker } from '../shared/date-picker'
import { getTodayStr, getDateStr, showKeyboard, configureSaveButton } from '../shared/misc'
import { UniqueValidator, validateDate } from '../shared/validators'

@Component({
    selector: 'bc-account-form',
    templateUrl: './account-form.component.html',
    styleUrls: ['./account-form.component.scss'],
})
export class AccountFormComponent implements OnInit {

    form: FormGroup;
    accounts: string[];

    showValidationErrors = false;

    constructor(
        private formBuilder: FormBuilder,
        private routerExtensions: RouterExtensions,
        private beancountFile: BeancountFileService,
    ) {
        this.accounts = this.beancountFile.content.getAccounts()
    }

    ngOnInit() {
        const nameRegexp = this.beancountFile.content.getAccountNameRegexp()
        this.form = this.formBuilder.group({
            date: [
                getTodayStr(),
                [Validators.required, validateDate],
            ],
            name: [
                '',
                [
                    Validators.required,
                    Validators.pattern(nameRegexp),
                    UniqueValidator(this.accounts),
                ],
            ],
        })
    }

    onActionBarLoaded(event) {
        const actionBar = event.object
        configureSaveButton(actionBar, this.form.statusChanges)
    }

    onNameFieldLoaded(event) {
        const nameField = event.object as TextField
        showKeyboard(nameField)
    }

    hasError(fieldName: string): boolean {
        const field = this.form.get(fieldName)
        return this.showValidationErrors && field.invalid
    }

    showDatePicker(): void {
        showDatePicker().then((date: Date) => {
            this.form.controls.date.setValue(getDateStr(date))
        }).catch((error) => {
            console.warn(error)
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
        const account = new Account(this.form.value)
        const beancountAccount = account.toBeancount()
        this.beancountFile.append(beancountAccount)
        this.routerExtensions.navigate(['/plaintext', {scroll: 'bottom'}])
    }

}
