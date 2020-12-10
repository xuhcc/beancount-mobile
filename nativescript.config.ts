import { NativeScriptConfig } from '@nativescript/core'

export default {
    id: 'link.beancount.mobile',
    appResourcesPath: 'App_Resources',
    android: {
        v8Flags: '--expose_gc',
        markingMode: 'none',
        codeCache: true,
    },
    appPath: 'src',
} as NativeScriptConfig
