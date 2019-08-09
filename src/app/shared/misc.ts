import { ElementRef } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Observable } from 'rxjs';
import { getNativeApplication } from 'tns-core-modules/application';
import { ActionBar } from 'tns-core-modules/ui/action-bar';
import { TextField } from 'tns-core-modules/ui/text-field';
import { Color } from 'tns-core-modules/color';
import { ad } from 'tns-core-modules/utils/utils';
import { Font, FontStyle, FontWeight } from 'tns-core-modules/ui/styling/font';

import { ACTION_BAR_BUTTON_COLOR, ACTION_BAR_BUTTON_DISABLED_COLOR } from '../shared/constants';

export function getTodayStr(): string {
    return new Date().toISOString().split('T')[0];
}

export function showKeyboard(textField: TextField): void {
    // Show keyboard on init (this function must be called in ngAfterViewInit hook)
    // Timeout is required:
    // https://discourse.nativescript.org/t/having-trouble-getting-focus-to-work-on-textfield/1098/3
    // https://stackoverflow.com/a/52008858/1868395
    setTimeout(() => {
        textField.focus();
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

export function setIconColor(
    icon: any,
    color: string | null,
) {
    // https://github.com/NativeScript/NativeScript/issues/5536#issuecomment-373284855
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
    const saveButton = actionBar.actionItems.getItemAt(0);
    saveButton.style.color = new Color(ACTION_BAR_BUTTON_DISABLED_COLOR);
    statusChanges.subscribe((status: string) => {
        const saveIcon = actionBar.nativeView
            .getChildAt(1).getChildAt(0).getItemData().getIcon();
        if (status === 'VALID') {
            setIconColor(saveIcon, ACTION_BAR_BUTTON_COLOR);
        } else {
            setIconColor(saveIcon, ACTION_BAR_BUTTON_DISABLED_COLOR);
        }
    });
}

export function textToBitmap(
    text: string,
    fontSize: number,
    fontColor: string,
    fontFamily: string,
) {
    const nsFont = new Font(fontFamily, 0, FontStyle.NORMAL, FontWeight.NORMAL);
    // Adapted from https://stackoverflow.com/a/39965170/1868395
    const paint = new android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG);
    paint.setTextSize(fontSize);
    paint.setColor(android.graphics.Color.parseColor(fontColor));
    paint.setTextAlign(android.graphics.Paint.Align.LEFT);
    paint.setTypeface(nsFont.getAndroidTypeface());
    const baseline = -paint.ascent();
    const width = paint.measureText(text);
    const height = baseline + paint.descent();
    const image = android.graphics.Bitmap.createBitmap(
        width,
        height,
        android.graphics.Bitmap.Config.ARGB_8888,
    );
    const canvas = new android.graphics.Canvas(image);
    canvas.drawText(text, 0, baseline, paint);
    return image;
}
