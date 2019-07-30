#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const FONT_FIR = 'src/fonts';
const FONTS = [
    'node_modules/material-design-icons-iconfont/dist/fonts/MaterialIcons-Regular.ttf',
];

if (!fs.existsSync(FONT_FIR)){
    fs.mkdirSync(FONT_FIR);
}

FONTS.forEach((filePath) => {
    let fileName = path.basename(filePath);
    fs.copyFile(filePath, path.join(FONT_FIR, fileName), (error) => {
        if (error) {
            throw error;
        }
    });
});
