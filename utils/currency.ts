import { getLocales } from 'expo-localization';

export const getCurrency = () => {
  const locales = getLocales();
  const locale = locales[0];
  
  if (!locale) {
    return { code: 'USD', symbol: '$' };
  }

  const currencyCode = locale.currencyCode || 'USD';
  const currencySymbol = locale.currencySymbol || '$';

  return {
    code: currencyCode,
    symbol: currencySymbol,
  };
};
