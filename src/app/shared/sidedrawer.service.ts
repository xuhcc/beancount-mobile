import { Injectable, NgZone } from '@angular/core';
import { RouterExtensions } from 'nativescript-angular/router';

import { fromResource as imageFromResource } from 'tns-core-modules/image-source';
import { TnsSideDrawer, TnsSideDrawerClass } from 'nativescript-foss-sidedrawer';

import { getColor } from './misc';

// https://developer.android.com/reference/android/support/v4/widget/DrawerLayout.html
const LOCK_MODE_LOCKED_CLOSED = 1;
const LOCK_MODE_UNDEFINED = 3;

@Injectable({
    providedIn: 'root',
})
export class SideDrawerService {

    title: string = 'Beancount Mobile';
    private navigationMenu = [
        {
            title: 'File content',
            url: '/plaintext',
        }, {
            title: 'Settings',
            url: '/settings',
        },
    ];
    private drawer: TnsSideDrawerClass;
    loaded: Promise<any>;

    constructor(
        private ngZone: NgZone,
        private routerExtensions: RouterExtensions,
    ) {
        this.drawer = TnsSideDrawer;

        const config = {
            templates: this.navigationMenu,
            title: this.title,
            logoImage: imageFromResource('icon'),
            headerBackgroundColor: getColor('ns_blue'),
            backgroundColor: getColor('ns_primary'),
            textColor: getColor('ns_primaryDark'),
            listener: (index: number) => {
                const url = this.navigationMenu[index].url;
                // Use NgZone because this is a callback from external JS library
                this.ngZone.run(() => {
                    this.routerExtensions.navigateByUrl(url);
                });
            },
        };
        this.loaded = new Promise((resolve, reject) => {
            // https://gitlab.com/burke-software/nativescript-foss-sidedrawer/issues/2
            setTimeout(() => {
                this.drawer.build(config);
                resolve();
            }, 0);
        });
    }

    private get nativeDrawer(): any {
        return (<any>this.drawer).drawer; // eslint-disable-line keyword-spacing
    }

    open() {
        this.drawer.open();
    }

    async lock() {
        await this.loaded;
        const layout = this.nativeDrawer.getDrawerLayout();
        layout.setDrawerLockMode(LOCK_MODE_LOCKED_CLOSED);
    }

    async unlock() {
        await this.loaded;
        const layout = this.nativeDrawer.getDrawerLayout();
        layout.setDrawerLockMode(LOCK_MODE_UNDEFINED);
    }

}
