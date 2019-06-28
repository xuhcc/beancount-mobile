import { Component, OnInit } from '@angular/core';

import { ModalDialogParams } from 'nativescript-angular/modal-dialog';

@Component({
    selector: 'bc-commodity-modal',
    templateUrl: './commodity-modal.component.html',
    styleUrls: ['./commodity-modal.component.css'],
})
export class CommodityModalComponent implements OnInit {

    commodities: string[];
    selectedIndex: number;

    constructor(private modalParams: ModalDialogParams) {
        this.commodities = modalParams.context;
    }

    ngOnInit(): void {
    }

    onCancel(): void {
        this.modalParams.closeCallback(null);
    }

    onSelect(): void {
        const commodity = this.commodities[this.selectedIndex];
        this.modalParams.closeCallback(commodity);
    }

}
