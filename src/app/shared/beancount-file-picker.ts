import { ImageAsset } from '@nativescript/core/image-asset'
import { alert } from '@nativescript/core/ui/dialogs'
import { ImagePicker, ImagePickerMediaType } from '@nativescript/imagepicker'

class FilePicker extends ImagePicker {

    get mimeTypes() {
        const mimeTypes = Array.create(java.lang.String, 1) // eslint-disable-line no-undef
        mimeTypes[0] = '*/*'
        return mimeTypes
    }
}

export function openFilePicker(): Promise<string> {
    const filePicker = new FilePicker({
        mode: 'single',
        mediaType: ImagePickerMediaType.Any,
        showAdvanced: true,
    })
    return filePicker.authorize()
        .then(() => filePicker.present())
        .then((selection: ImageAsset[]) => {
            const filePath = selection[0].android
            if (!filePath) {
                alert('Failed to access the selected file.')
            }
            return filePath
        })
        .catch((error) => {
            if (error.message === 'Image picker activity result code 0') {
                // Picker has been cancelled
                return null
            } else {
                throw error
            }
        })
}
