import { ImageAsset } from 'tns-core-modules/image-asset';
import { create, ImagePickerMediaType } from 'nativescript-imagepicker';

export function openFilePicker(): Promise<string> {
    const imagePicker = create({
        mode: 'single',
        mediaType: ImagePickerMediaType.Any,
    });
    return imagePicker.authorize()
        .then(() => imagePicker.present())
        .then((selection: ImageAsset[]) => selection[0].android);
}
