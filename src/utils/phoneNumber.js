const DEFAULT_COUNTRY_CODE = '+91';

export function formatPhoneE164(digits, countryCode = DEFAULT_COUNTRY_CODE) {
  const normalized = String(digits).replace(/\D/g, '');
  if (!normalized) {
    return '';
  }
  return `${countryCode}${normalized}`;
}

export function formatPhoneDisplay(digits, countryCode = DEFAULT_COUNTRY_CODE) {
  return `${countryCode} ${digits}`;
}
