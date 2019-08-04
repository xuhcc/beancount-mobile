import { Injectable, NgZone } from '@angular/core';
import { RouterExtensions } from 'nativescript-angular/router';

import { android as androidApplication } from 'tns-core-modules/application';
import { fromResource as imageFromResource } from 'tns-core-modules/image-source';
import { TnsSideDrawerClass, TnsSideDrawerOptions } from 'nativescript-foss-sidedrawer';

import { APP_NAME } from './constants';
import { getColor, getAppVersion } from './misc';

// https://developer.android.com/reference/android/support/v4/widget/DrawerLayout.html
const LOCK_MODE_LOCKED_CLOSED = 1;
const LOCK_MODE_UNDEFINED = 3;

declare var com: any;

class CustomSideDrawerClass extends TnsSideDrawerClass {

    drawer: any;

    build(opts: any) {
        const activity: android.app.Activity = androidApplication.foregroundActivity;

        let profile = new com.mikepenz.materialdrawer.model.ProfileDrawerItem();
        profile.withIcon(opts.logoImage.android);
        profile.withName(opts.title);

        let bg = android.graphics.Bitmap.createBitmap(8, 8, android.graphics.Bitmap.Config.ARGB_8888);
        bg.eraseColor(opts.headerBackgroundColor.android);

        let header = new com.mikepenz.materialdrawer.AccountHeaderBuilder();
        header.withActivity(activity);
        header.withHeaderBackground(new com.mikepenz.materialdrawer.holder.ImageHolder(bg));
        header.addProfiles([profile]);
        header.withSelectionListEnabledForSingleProfile(false);
        header.withProfileImagesClickable(false);
        header.withSelectionSecondLineShown(false);
        header.withTextColor(opts.headerTextColor.android);

        const items = opts.templates.map((template, index) => {
            let item = new com.mikepenz.materialdrawer.model.PrimaryDrawerItem();
            item.withIdentifier(index);
            item.withName(template.title);
            item.withSelectable(false);
            item.withTextColor(opts.textColor.android);
            return item;
        });

        let drawer = new com.mikepenz.materialdrawer.DrawerBuilder();
        drawer.withActivity(activity);
        drawer.withAccountHeader(header.build());
        drawer.withSliderBackgroundColor(opts.backgroundColor.android);
        drawer.addDrawerItems(items);
        drawer.withSelectedItem(-1);
        drawer.withOnDrawerItemClickListener(new com.mikepenz.materialdrawer.Drawer.OnDrawerItemClickListener({
            onItemClick: (view: android.view.View, index: number, item: any): boolean => {
                opts.listener(index - 1);
                return false;
            },
        }));
        this.drawer = drawer.build();
    }
}

@Injectable({
    providedIn: 'root',
})
export class SideDrawerService {

    private navigationMenu = [
        {
            title: 'File content',
            url: '/plaintext',
        }, {
            title: 'Settings',
            url: '/settings',
        },
    ];
    private drawer: CustomSideDrawerClass;
    loaded: Promise<any>;

    constructor(
        private ngZone: NgZone,
        private routerExtensions: RouterExtensions,
    ) {
        this.drawer = new CustomSideDrawerClass();

        const config = {
            templates: this.navigationMenu,
            title: `${APP_NAME} v${getAppVersion()}`,
            logoImage: imageFromResource('icon'),
            headerBackgroundColor: getColor('ns_blue'),
            backgroundColor: getColor('ns_primary'),
            headerTextColor: getColor('ns_primary'),
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
