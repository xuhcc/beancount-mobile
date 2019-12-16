import { ModalDatetimepicker } from 'nativescript-modal-datetimepicker';

export function showDatePicker(): Promise<Date> {
    const picker = new ModalDatetimepicker();
    return picker.pickDate({
        title: 'Select date',
        theme: 'light',
        maxDate: new Date(),
    }).then((result) => {
        if (!result) {
            throw new Error('Picker cancelled');
        }
        const date = new Date(Date.UTC(result.year, result.month - 1, result.day));
        return date;
    });
}
