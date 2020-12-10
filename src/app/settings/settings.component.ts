import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { RouterExtensions } from '@nativescript/angular'

import { BeancountFileService, BeancountFilePathValidator } from '../shared/beancount-file.service'
import { openFilePicker } from '../shared/beancount-file-picker'
import { SideDrawerService } from '../shared/sidedrawer.service'

@Component({
    selector: 'bc-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {

    form: FormGroup;

    constructor(
        private formBuilder: FormBuilder,
        private routerExtensions: RouterExtensions,
        private beancountFile: BeancountFileService,
        private sideDrawer: SideDrawerService,
    ) { }

    ngOnInit() {
        this.form = this.formBuilder.group({
            filePath: [
                this.beancountFile.path,
                [Validators.required, BeancountFilePathValidator()],
            ],
        })
    }

    openDrawer() {
        this.sideDrawer.open()
    }

    openFilePicker() {
        openFilePicker().then((filePath) => {
            this.form.controls.filePath.setValue(filePath)
        })
    }

    canSave(): boolean {
        return this.form.valid && !this.form.pristine
    }

    save() {
        const filePath = this.form.value.filePath
        this.beancountFile.setPath(filePath)
        this.routerExtensions.navigate(['/plaintext'])
    }

    reset() {
        this.beancountFile.reset()
        this.routerExtensions.navigate(['/welcome'], {
            clearHistory: true,
        })
    }

}
