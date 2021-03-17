# Beancount Mobile App

[![GitHub release](https://img.shields.io/github/release/xuhcc/beancount-mobile)](https://github.com/xuhcc/beancount-mobile/releases)
[![License: GPL v3](https://img.shields.io/github/license/xuhcc/beancount-mobile)](https://github.com/xuhcc/beancount-mobile/blob/HEAD/LICENSE)

This is a companion mobile application for [Beancount](http://furius.ca/beancount/) plain-text accounting system.

**Currently available only on Android.** Version 6.0 (Marshmallow) or later is recommended.

<a href="https://play.google.com/store/apps/details?id=link.beancount.mobile"><img width="200" alt="Get it on Google Play" src="https://play.google.com/intl/en_gb/badges/images/generic/en_badge_web_generic.png" /></a>

## Features

* Add transactions
* Open accounts
* Declare currencies
* View beancount file as plain text
* Switch between files

<img src="metadata/en-US/images/phoneScreenshots/screenshot_text.png" width="360"> <img src="metadata/en-US/images/phoneScreenshots/screenshot_new_txn.png" width="360">

Note: Beancount Mobile currently has no file synchronization functionality, but it's possible to use software like [Syncthing](https://syncthing.net/) to sync Beancount file across multiple devices.

## Configuration

Beancount Mobile makes use of these configuration options:

* `option "title" "..."` - the title of ledger file.
* `option "operating_currency" "..."` - default currency for transactions.
* `1970-01-01 custom "bcm_option" "transaction_flags" "['*', '!']"` - allowed transaction flags.
* `1970-01-01 custom "bcm_option" "account_order" "to_from"` - show "to" account before "from" account in transaction form.

## Change log

See [CHANGELOG](CHANGELOG.md).

## Development

Prerequisites:

* Node.js & NPM
* [NativeScript CLI](https://docs.nativescript.org/angular/start/quick-setup#step-2-install-the-nativescript-cli) 7.0

Install required packages:

```
npm install
```

### Android

Run on emulator:

```
npm run android
```

Build APK:

```
npm run android-debug
```

### Testing

```
npm run lint
npm run test
```
