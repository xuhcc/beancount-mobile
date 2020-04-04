import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterExtensions } from 'nativescript-angular/router';

import { TextField } from 'tns-core-modules/ui/text-field';

import { Commodity } from '../shared/commodity.model';
import { COMMODITY_NAME_REGEXP } from '../shared/beancount-file-content';
import { BeancountFileService } from '../shared/beancount-file.service';
import { showDatePicker } from '../shared/date-picker';
import { getTodayStr, getDateStr, showKeyboard, configureSaveButton } from '../shared/misc';
import { UniqueValidator } from '../shared/validators';

@Component({
    selector: 'bc-commodity-form',
    templateUrl: './commodity-form.component.html',
    styleUrls: ['./commodity-form.component.scss'],
})
export class CommodityFormComponent implements OnInit {

    form: FormGroup;
    commodities: string[];

    showValidationErrors = false;

    constructor(
        private formBuilder: FormBuilder,
        private router: RouterExtensions,
        private beancountFile: BeancountFileService,
    ) {
        this.commodities = this.beancountFile.content.getCommodities();
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
                    Validators.pattern(COMMODITY_NAME_REGEXP),
                    UniqueValidator(this.commodities),
                ],
            ],
        });
    }

    onActionBarLoaded(args) {
        const actionBar = args.object;
        configureSaveButton(actionBar, this.form.statusChanges)
    }

    onNameFieldLoaded(args) {
        const nameField = <TextField>args.object;
        showKeyboard(nameField);
    }

    hasError(fieldName: string): boolean {
        const field = this.form.get(fieldName);
        return this.showValidationErrors && field.invalid;
    }

    showDatePicker(): void {
        showDatePicker().then((date: Date) => {
            this.form.controls.date.setValue(getDateStr(date));
        }).catch((error) => {
            console.warn(error);
        });
    }

    goBack() {
        this.router.backToPreviousPage();
    }

    save(): void {
        if (!this.form.valid) {
            this.showValidationErrors = true;
            return;
        }
        const commodity = new Commodity(this.form.value);
        const beancountCommodity = commodity.toBeancount();
        this.beancountFile.append(beancountCommodity);
        this.router.navigate(['/plaintext', {scroll: 'bottom'}]);
    }

}
