import { Component } from '@angular/core'

import { BeancountFileService } from './shared/beancount-file.service'

@Component({
    moduleId: module.id,
    selector: 'bc-app',
    templateUrl: 'app.component.html',
})
export class AppComponent {

    constructor(
        private beancountFile: BeancountFileService,
    ) { }

    get isLoading(): boolean {
        return this.beancountFile.isLoading
    }

}
