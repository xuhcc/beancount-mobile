import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { RouterExtensions } from 'nativescript-angular/router';

import { Account } from '../shared/account.model';
import { BeancountFileService } from '../shared/beancount-file.service';
import { ACCOUNT_NAME_REGEXP } from '../shared/beancount-file-content';
import { getTodayStr } from '../shared/misc';
import { UniqueValidator } from '../shared/validators';

@Component({
    selector: 'bc-account-form',
    templateUrl: './account-form.component.html',
    styleUrls: ['./account-form.component.css'],
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
            name: [
                '',
                [
                    Validators.required,
                    Validators.pattern(ACCOUNT_NAME_REGEXP),
                    UniqueValidator(this.accounts),
                ],
            ],
            date: [
                getTodayStr(),
                Validators.required,
            ],
        });
    }

    goBack() {
        this.routerExtensions.backToPreviousPage();
    }

    save() {
        const account = new Account(this.form.value);
        const beancountAccount = account.toBeancount();
        this.beancountFile.append(beancountAccount);
        this.routerExtensions.navigate(['/plaintext']);
    }

}
