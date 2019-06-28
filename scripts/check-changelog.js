#!/usr/bin/env node

const { exec } = require('child_process');

exec(`grep ${process.env.npm_package_version} CHANGELOG.md`, (error, stdout) => {
    if (error) {
        throw error;
    }
});
