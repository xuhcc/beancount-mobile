import { Component } from '@angular/core'

import { ModalDialogParams } from '@nativescript/angular'

@Component({
    selector: 'bc-commodity-modal',
    templateUrl: './commodity-modal.component.html',
    styleUrls: ['./commodity-modal.component.scss'],
})
export class CommodityModalComponent {

    commodities: string[]; selectedIndex: number;

    constructor(private modalParams: ModalDialogParams) {
        this.commodities = modalParams.context
    }

    select(commodity: string): void {
        this.modalParams.closeCallback(commodity)
    }

}
