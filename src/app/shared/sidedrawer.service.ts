import { Injectable, NgZone } from '@angular/core';
import { RouterExtensions } from 'nativescript-angular/router';

import { android as androidApplication } from 'tns-core-modules/application';
import { Color } from 'tns-core-modules/color';
import { TnsSideDrawerClass } from 'nativescript-foss-sidedrawer';

import { APP_NAME } from './constants';
import { getAppVersion } from './misc';

// https://developer.android.com/reference/android/support/v4/widget/DrawerLayout.html
const LOCK_MODE_LOCKED_CLOSED = 1;
const LOCK_MODE_UNDEFINED = 3;

declare let com: any;

class CustomSideDrawerClass extends TnsSideDrawerClass {

    drawer: any;

    build(opts: any) {
        const activity: android.app.Activity = androidApplication.foregroundActivity;

        const profile = new com.mikepenz.materialdrawer.model.ProfileDrawerItem();
        profile.withName(opts.title);
        profile.withEmail(opts.subtitle);

        const bg = android.graphics.Bitmap.createBitmap(8, 8, android.graphics.Bitmap.Config.ARGB_8888);
        bg.eraseColor(opts.headerBackgroundColor.android);

        const header = new com.mikepenz.materialdrawer.AccountHeaderBuilder();
        header.withActivity(activity);
        header.withHeaderBackground(new com.mikepenz.materialdrawer.holder.ImageHolder(bg));
        header.addProfiles([profile]);
        header.withProfileImagesVisible(false);
        header.withSelectionListEnabledForSingleProfile(false);
        header.withProfileImagesClickable(false);
        header.withTextColor(opts.headerTextColor.android);

        const items = opts.templates.map((template, index) => {
            const item = new com.mikepenz.materialdrawer.model.PrimaryDrawerItem();
            item.withIdentifier(index);
            item.withName(template.title);
            item.withTextColor(opts.textColor.android);
            item.withSelectedColor(opts.selectedColor.android);
            item.withSelectedTextColor(opts.selectedTextColor.android);
            return item;
        });

        const drawer = new com.mikepenz.materialdrawer.DrawerBuilder();
        drawer.withActivity(activity);
        drawer.withAccountHeader(header.build());
        drawer.withSliderBackgroundColor(opts.backgroundColor.android);
        drawer.addDrawerItems(items);
        drawer.withSelectedItem(-1);
        drawer.withOnDrawerItemClickListener(new com.mikepenz.materialdrawer.Drawer.OnDrawerItemClickListener({
            onItemClick: (view: android.view.View, index: number): boolean => {
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
            title: APP_NAME,
            subtitle: `v${getAppVersion()}`,
            headerBackgroundColor: new Color('#255C8C'), // $main-color
            backgroundColor: new Color('#255C8C'), // $main-color
            headerTextColor: new Color('#E2E9F0'), // $main-text-color
            textColor: new Color('#E2E9F0'), // $main-text-color
            selectedColor: new Color('#255C8C'), // $main-color
            selectedTextColor: new Color('#F49D96'), // $secondary-color
            listener: (index: number) => {
                const url = this.navigationMenu[index].url;
                // Use NgZone because this is a callback from external JS library
                this.ngZone.run(() => {
                    this.routerExtensions.navigateByUrl(url);
                });
            },
        };
        this.loaded = new Promise((resolve) => {
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
