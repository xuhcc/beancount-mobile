import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { RouterExtensions } from 'nativescript-angular/router';

import { Account } from '../shared/account.model';
import { BeancountFileService } from '../shared/beancount-file.service';
import { ACCOUNT_NAME_REGEXP } from '../shared/beancount-file-content';
import { ACTION_BAR_BUTTON_COLOR, ACTION_BAR_BUTTON_DISABLED_COLOR } from '../shared/constants';
import { getTodayStr, setIconColor, configureSaveButton } from '../shared/misc';
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
        this.form = this.formBuilder.group({
            date: [
                getTodayStr(),
                Validators.required,
            ],
            name: [
                '',
                [
                    Validators.required,
                    Validators.pattern(ACCOUNT_NAME_REGEXP),
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
