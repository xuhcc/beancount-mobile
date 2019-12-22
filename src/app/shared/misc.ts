import { Observable } from 'rxjs';
import { getNativeApplication } from 'tns-core-modules/application';
import { ActionBar } from 'tns-core-modules/ui/action-bar';
import { TextField } from 'tns-core-modules/ui/text-field';
import { Color } from 'tns-core-modules/color';
import { ad } from 'tns-core-modules/utils/utils';

import { AFTERVIEWINIT_DELAY } from '../shared/constants';

export function getDateStr(date: Date): string {
    const year = date.getFullYear();
    const month = ((date.getMonth() + 1 < 10) ? '0' : '') + (date.getMonth() + 1);
    const day = ((date.getDate() < 10) ? '0' : '') + date.getDate();
    return `${year}-${month}-${day}`;
}

export function getTodayStr(): string {
    return getDateStr(new Date());
}

export function showKeyboard(textField: TextField): void {
    // Show keyboard on init (this function must be called in ngAfterViewInit hook)
    // Timeout is required:
    // https://discourse.nativescript.org/t/having-trouble-getting-focus-to-work-on-textfield/1098/3
    // https://stackoverflow.com/a/52008858/1868395
    setTimeout(() => {
        textField.focus();
    }, AFTERVIEWINIT_DELAY);
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

export function setIconColor(
    icon: any,
    color: string | null,
) {
    // https://github.com/NativeScript/NativeScript/issues/5536#issuecomment-373284855
    if (color === null) {
        icon.setColorFilter(null);
    } else {
        icon.setColorFilter(
            android.graphics.Color.parseColor(color),
            android.graphics.PorterDuff.Mode.SRC_ATOP,
        );
    }
}

export function configureSaveButton(
    actionBar: ActionBar,
    statusChanges: Observable<string>,
) {
    // Workaround for https://github.com/NativeScript/NativeScript/issues/8211
    statusChanges.subscribe(() => {
        // Delay update so it will be done after class toggle
        setTimeout(() => {
            actionBar.update();
        }, 0);
    });
}
