import { Component } from '@angular/core'

import { openUrl } from 'tns-core-modules/utils/utils'

import { APP_NAME } from '../shared/constants'
import { getAppVersion } from '../shared/misc'
import { SideDrawerService } from '../shared/sidedrawer.service'

const APP_BUGTRACKER = 'https://github.com/xuhcc/beancount-mobile/issues'

@Component({
    selector: 'bc-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.scss'],
})
export class AboutComponent {

    constructor(private sideDrawer: SideDrawerService) { }

    get appName(): string {
        return `${APP_NAME} v${getAppVersion()}`
    }

    openDrawer() {
        this.sideDrawer.open()
    }

    openBugTracker() {
        openUrl(APP_BUGTRACKER)
    }

}
