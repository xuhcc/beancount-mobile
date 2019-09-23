import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterExtensions } from 'nativescript-angular/router';

import { TextField } from 'tns-core-modules/ui/text-field';
import { ModalDatetimepicker } from 'nativescript-modal-datetimepicker';

import { Commodity } from '../shared/commodity.model';
import { COMMODITY_NAME_REGEXP } from '../shared/beancount-file-content';
import { BeancountFileService } from '../shared/beancount-file.service';
import { ACTION_BAR_BUTTON_COLOR } from '../shared/constants';
import { getTodayStr, getDateStr, showKeyboard, setIconColor, configureSaveButton } from '../shared/misc';
import { UniqueValidator } from '../shared/validators';

@Component({
    selector: 'bc-commodity-form',
    templateUrl: './commodity-form.component.html',
    styleUrls: ['./commodity-form.component.scss'],
})
export class CommodityFormComponent implements OnInit {

    form: FormGroup;
    commodities: string[];

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

    goBack() {
        this.router.backToPreviousPage();
    }

    save() {
        if (!this.form.valid) {
            return;
        }
        const commodity = new Commodity(this.form.value);
        const beancountCommodity = commodity.toBeancount();
        this.beancountFile.append(beancountCommodity);
        this.router.navigate(['/plaintext', {scroll: 'bottom'}]);
    }

}
