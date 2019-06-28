import { ElementRef } from '@angular/core';

import { getNativeApplication } from 'tns-core-modules/application';
import { Color } from 'tns-core-modules/color';

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
