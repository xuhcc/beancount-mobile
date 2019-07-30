import { ElementRef } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Observable } from 'rxjs';
import { getNativeApplication } from 'tns-core-modules/application';
import { ActionBar } from 'tns-core-modules/ui/action-bar';
import { Color } from 'tns-core-modules/color';
import { ad } from 'tns-core-modules/utils/utils';

export function getTodayStr(): string {
    return new Date().toISOString().split('T')[0];
}

export function showKeyboard(textField: ElementRef): void {
    // Show keyboard on init (this function must be called in ngAfterViewInit hook)
    // Timeout is required:
    // https://discourse.nativescript.org/t/having-trouble-getting-focus-to-work-on-textfield/1098/3
    // https://stackoverflow.com/a/52008858/1868395
    setTimeout(() => {
        textField.nativeElement.focus();
    }, 200);
}

export function getColor(name: string): Color {
    const app = getNativeApplication();
    const resources = app.getResources();
    const colorId = resources.getIdentifier(name, 'color', app.getPackageName());
    const color = new Color(resources.getColor(colorId));
    return color;
}

export function getAppVersion(): string {
    // https://github.com/EddyVerbruggen/nativescript-appversion
    const context = ad.getApplicationContext();
    const packageManager = context.getPackageManager();
    return packageManager.getPackageInfo(context.getPackageName(), 0).versionName;
}

function setIconColor(
    icon: android.graphics.drawable.BitmapDrawable,
    color: string | null,
) {
    if (color === null) {
        icon.setColorFilter(null);
    } else {
        icon.setColorFilter(
            android.graphics.Color.parseColor(color), // eslint-disable-line no-undef
            android.graphics.PorterDuff.Mode.SRC_ATOP, // eslint-disable-line no-undef
        );
    }
}

export function configureSaveButton(
    actionBar: ActionBar,
    statusChanges: Observable<string>,
) {
    // Simulate enabled/disabled behaviour for action bar icon
    // https://github.com/NativeScript/NativeScript/issues/5536#issuecomment-373284855
    const getSaveButton = () => actionBar.nativeView.getChildAt(1).getChildAt(0);
    const icon = getSaveButton().getItemData().getIcon();
    const disabledIconColor = '#E5E5E5';
    setIconColor(icon, disabledIconColor); // Initial state is 'disabled'
    statusChanges.subscribe((status: string) => {
        if (status === 'VALID') {
            setIconColor(icon, null); // Button enabled
            getSaveButton().invalidate();
        } else {
            setIconColor(icon, disabledIconColor); // Button disabled
        }
    });
}
