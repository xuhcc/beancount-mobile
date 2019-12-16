import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NativeScriptModule } from 'nativescript-angular/nativescript.module';
import { NativeScriptFormsModule } from 'nativescript-angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { WelcomeComponent } from './welcome/welcome.component';
import { PlainTextComponent } from './plaintext/plaintext.component';
import { TransactionFormComponent } from './transaction-form/transaction-form.component';
import { AccountModalComponent } from './transaction-form/account-modal/account-modal.component';
import { CommodityModalComponent } from './transaction-form/commodity-modal/commodity-modal.component';
import { PayeeModalComponent } from './transaction-form/payee-modal/payee-modal.component';
import { SettingsComponent } from './settings/settings.component';
import { AccountFormComponent } from './account-form/account-form.component';
import { CommodityFormComponent } from './commodity-form/commodity-form.component';
import { AboutComponent } from './about/about.component';

@NgModule({
    bootstrap: [
        AppComponent,
    ],
    imports: [
        NativeScriptModule,
        ReactiveFormsModule,
        NativeScriptFormsModule,
        AppRoutingModule,
    ],
    declarations: [
        AppComponent,
        WelcomeComponent,
        PlainTextComponent,
        TransactionFormComponent,
        AccountModalComponent,
        CommodityModalComponent,
        PayeeModalComponent,
        SettingsComponent,
        AccountFormComponent,
        CommodityFormComponent,
        AboutComponent,
    ],
    entryComponents: [
        AccountModalComponent,
        CommodityModalComponent,
        PayeeModalComponent,
    ],
    schemas: [
        NO_ERRORS_SCHEMA,
    ],
})
export class AppModule { }
