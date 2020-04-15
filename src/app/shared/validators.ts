import { AbstractControl, ValidatorFn } from '@angular/forms'

export function UniqueValidator(uniqueList: any[]): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
        if (uniqueList.indexOf(control.value) !== -1) {
            return {
                nonUnique: {
                    value: control.value,
                },
            }
        }
    }
}

export function ListValidator(allowList: any[]): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
        if (allowList.indexOf(control.value) === -1) {
            return {
                notInList: {
                    value: control.value,
                },
            }
        }
    }
}

export function validateDate(control: AbstractControl): {[key: string]: any} | null {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(control.value)) {
        return {
            invalid: {
                value: control.value,
            },
        }
    }
}
