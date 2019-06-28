import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { RouterExtensions } from 'nativescript-angular/router';

import { BeancountFileService } from '../shared/beancount-file.service';

@Injectable({
    providedIn: 'root',
})
export class WelcomeGuard implements CanActivate {

    constructor(
        private beancountFile: BeancountFileService,
        private router: RouterExtensions,
    ) {}

    canActivate() {
        if (this.beancountFile.path) {
            // Skip welcome screen
            this.router.navigate(['/plaintext']);
            return false;
        } else {
            return true;
        }
    }
}
