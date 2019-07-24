// Currently there is no support for \p{L}, so we use [^\s]
// https://github.com/microsoft/TypeScript/issues/32214
export const ACCOUNT_NAME_REGEXP = /^[^\s:]+:[^\s]+$/;

export const TITLE_REGEXP = /^option "title" "(.+)"/um;
export const OPERATING_CURRENCY_REGEXP = /^option "operating_currency" "([^\s]+)"/um;
export const ACCOUNT_REGEXP = /^[\d-]{10} open ([^\s]+)/umg;
export const COMMODITY_REGEXP = /^[\d-]{10} commodity ([A-Z]+)$/umg;
export const PAYEE_REGEXP = /^[\d-]{10} (txn|\*) "([^"]+)" ".*/umg;
