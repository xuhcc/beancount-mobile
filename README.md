# Beancount Mobile App

[![GitHub release](https://img.shields.io/github/release/xuhcc/beancount-mobile)](https://github.com/xuhcc/beancount-mobile/releases)
[![License: GPL v3](https://img.shields.io/github/license/xuhcc/beancount-mobile)](https://github.com/xuhcc/beancount-mobile/blob/HEAD/LICENSE)

This is a companion mobile application for [Beancount](http://furius.ca/beancount/) plain-text accounting system.

**Currently available only on Android.**

<a href="https://play.google.com/store/apps/details?id=link.beancount.mobile"><img width="200" alt="Get it on Google Play" src="https://play.google.com/intl/en_gb/badges/images/generic/en_badge_web_generic.png" /></a>

## Features

* Add transactions
* Open accounts
* View beancount file as plain text
* Switch between files

<img src="metadata/en-US/images/phoneScreenshots/screenshot_text.png" width="360"> <img src="metadata/en-US/images/phoneScreenshots/screenshot_new_txn.png" width="360">

## Configuration

Beancount Mobile makes use of these configuration options:

* `option "title" "..."` - the title of ledger file.
* `option "operating_currency" "..."` - default currency for transactions.
* `1970-01-01 custom "bcm_option" "transaction_flags" "['*', '!']"` - allowed transaction flags.

## Change log

See [CHANGELOG](CHANGELOG.md).

## Development

Prerequisites:

* Node.js & NPM
* [NativeScript CLI](https://docs.nativescript.org/angular/start/quick-setup#step-2-install-the-nativescript-cli) 6.0

Install required packages:

```
npm install
```

### Android

Run on emulator:

```
tns run android
```

Build APK:

```
tns build android
```

### Testing

```
npm run lint
npm run test
```

## Donate

Bitcoin: 3GHkLq8jRgsfzaV8N6EjX7BaoMuLdEeu51
