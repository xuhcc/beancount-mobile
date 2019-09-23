import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterExtensions } from 'nativescript-angular/router';

import { TextField } from 'tns-core-modules/ui/text-field';

import { Account } from '../shared/account.model';
import { BeancountFileService } from '../shared/beancount-file.service';
import { ACTION_BAR_BUTTON_COLOR } from '../shared/constants';
import { showDatePicker } from '../shared/date-picker';
import { getTodayStr, getDateStr, showKeyboard, setIconColor, configureSaveButton } from '../shared/misc';
import { UniqueValidator } from '../shared/validators';

@Component({
    selector: 'bc-account-form',
    templateUrl: './account-form.component.html',
    styleUrls: ['./account-form.component.scss'],
})
export class AccountFormComponent implements OnInit {

    form: FormGroup;
    accounts: string[];

    constructor(
        private formBuilder: FormBuilder,
        private routerExtensions: RouterExtensions,
        private beancountFile: BeancountFileService,
    ) {
        this.accounts = this.beancountFile.content.getAccounts();
    }

    ngOnInit() {
        const nameRegexp = this.beancountFile.content.getAccountNameRegexp();
        this.form = this.formBuilder.group({
            date: [
                getTodayStr(),
                Validators.required,
            ],
            name: [
                '',
                [
                    Validators.required,
                    Validators.pattern(nameRegexp),
                    UniqueValidator(this.accounts),
                ],
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
        configureSaveButton(actionBar, this.form.statusChanges)
    }

    onNameFieldLoaded(args) {
        const nameField = <TextField>args.object;
        showKeyboard(nameField);
    }

    showDatePicker(): void {
        showDatePicker().then((date: Date) => {
            this.form.controls.date.setValue(getDateStr(date));
        });
    }

    goBack() {
        this.routerExtensions.backToPreviousPage();
    }

    save() {
        if (!this.form.valid) {
            return;
        }
        const account = new Account(this.form.value);
        const beancountAccount = account.toBeancount();
        this.beancountFile.append(beancountAccount);
        this.routerExtensions.navigate(['/plaintext', {scroll: 'bottom'}]);
    }

}
