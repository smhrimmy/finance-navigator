import { Currency, Country } from '@/types/finance';

export const currencies: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', decimals: 2 },
  { code: 'EUR', symbol: '€', name: 'Euro', decimals: 2 },
  { code: 'GBP', symbol: '£', name: 'British Pound', decimals: 2 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', decimals: 0 },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', decimals: 2 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', decimals: 2 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', decimals: 2 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', decimals: 2 },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', decimals: 2 },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', decimals: 2 },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso', decimals: 2 },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', decimals: 0 },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', decimals: 2 },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', decimals: 2 },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', decimals: 2 },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', decimals: 2 },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone', decimals: 2 },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', decimals: 2 },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', decimals: 2 },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', decimals: 2 },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', decimals: 2 },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', decimals: 2 },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', decimals: 2 },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', decimals: 0 },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', decimals: 2 },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', decimals: 2 },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', decimals: 0 },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', decimals: 2 },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble', decimals: 2 },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', decimals: 2 },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', decimals: 2 },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', decimals: 2 },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', decimals: 2 },
  { code: 'COP', symbol: 'COL$', name: 'Colombian Peso', decimals: 0 },
  { code: 'ARS', symbol: 'AR$', name: 'Argentine Peso', decimals: 2 },
  { code: 'CLP', symbol: 'CL$', name: 'Chilean Peso', decimals: 0 },
  { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol', decimals: 2 },
  { code: 'ILS', symbol: '₪', name: 'Israeli Shekel', decimals: 2 },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', decimals: 2 },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', decimals: 0 },
  { code: 'RON', symbol: 'lei', name: 'Romanian Leu', decimals: 2 },
  { code: 'BGN', symbol: 'лв', name: 'Bulgarian Lev', decimals: 2 },
  { code: 'HRK', symbol: 'kn', name: 'Croatian Kuna', decimals: 2 },
  { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia', decimals: 2 },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', decimals: 2 },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', decimals: 2 },
  { code: 'TWD', symbol: 'NT$', name: 'Taiwan Dollar', decimals: 0 },
];

export const countries: Country[] = [
  { code: 'US', name: 'United States', currency: currencies.find(c => c.code === 'USD')!, taxSystem: 'progressive', fiscalYearStart: 1 },
  { code: 'GB', name: 'United Kingdom', currency: currencies.find(c => c.code === 'GBP')!, taxSystem: 'progressive', vatRate: 20, fiscalYearStart: 4 },
  { code: 'CA', name: 'Canada', currency: currencies.find(c => c.code === 'CAD')!, taxSystem: 'progressive', fiscalYearStart: 1 },
  { code: 'AU', name: 'Australia', currency: currencies.find(c => c.code === 'AUD')!, taxSystem: 'progressive', vatRate: 10, fiscalYearStart: 7 },
  { code: 'DE', name: 'Germany', currency: currencies.find(c => c.code === 'EUR')!, taxSystem: 'progressive', vatRate: 19, fiscalYearStart: 1 },
  { code: 'FR', name: 'France', currency: currencies.find(c => c.code === 'EUR')!, taxSystem: 'progressive', vatRate: 20, fiscalYearStart: 1 },
  { code: 'JP', name: 'Japan', currency: currencies.find(c => c.code === 'JPY')!, taxSystem: 'progressive', vatRate: 10, fiscalYearStart: 4 },
  { code: 'CN', name: 'China', currency: currencies.find(c => c.code === 'CNY')!, taxSystem: 'progressive', vatRate: 13, fiscalYearStart: 1 },
  { code: 'IN', name: 'India', currency: currencies.find(c => c.code === 'INR')!, taxSystem: 'progressive', vatRate: 18, fiscalYearStart: 4 },
  { code: 'BR', name: 'Brazil', currency: currencies.find(c => c.code === 'BRL')!, taxSystem: 'progressive', fiscalYearStart: 1 },
  { code: 'MX', name: 'Mexico', currency: currencies.find(c => c.code === 'MXN')!, taxSystem: 'progressive', vatRate: 16, fiscalYearStart: 1 },
  { code: 'KR', name: 'South Korea', currency: currencies.find(c => c.code === 'KRW')!, taxSystem: 'progressive', vatRate: 10, fiscalYearStart: 1 },
  { code: 'SG', name: 'Singapore', currency: currencies.find(c => c.code === 'SGD')!, taxSystem: 'progressive', vatRate: 9, fiscalYearStart: 4 },
  { code: 'HK', name: 'Hong Kong', currency: currencies.find(c => c.code === 'HKD')!, taxSystem: 'progressive', fiscalYearStart: 4 },
  { code: 'AE', name: 'United Arab Emirates', currency: currencies.find(c => c.code === 'AED')!, taxSystem: 'flat', vatRate: 5, fiscalYearStart: 1 },
  { code: 'SA', name: 'Saudi Arabia', currency: currencies.find(c => c.code === 'SAR')!, taxSystem: 'flat', vatRate: 15, fiscalYearStart: 1 },
  { code: 'CH', name: 'Switzerland', currency: currencies.find(c => c.code === 'CHF')!, taxSystem: 'progressive', vatRate: 8.1, fiscalYearStart: 1 },
  { code: 'SE', name: 'Sweden', currency: currencies.find(c => c.code === 'SEK')!, taxSystem: 'progressive', vatRate: 25, fiscalYearStart: 1 },
  { code: 'NO', name: 'Norway', currency: currencies.find(c => c.code === 'NOK')!, taxSystem: 'progressive', vatRate: 25, fiscalYearStart: 1 },
  { code: 'NL', name: 'Netherlands', currency: currencies.find(c => c.code === 'EUR')!, taxSystem: 'progressive', vatRate: 21, fiscalYearStart: 1 },
  { code: 'ES', name: 'Spain', currency: currencies.find(c => c.code === 'EUR')!, taxSystem: 'progressive', vatRate: 21, fiscalYearStart: 1 },
  { code: 'IT', name: 'Italy', currency: currencies.find(c => c.code === 'EUR')!, taxSystem: 'progressive', vatRate: 22, fiscalYearStart: 1 },
  { code: 'PL', name: 'Poland', currency: currencies.find(c => c.code === 'PLN')!, taxSystem: 'progressive', vatRate: 23, fiscalYearStart: 1 },
  { code: 'ZA', name: 'South Africa', currency: currencies.find(c => c.code === 'ZAR')!, taxSystem: 'progressive', vatRate: 15, fiscalYearStart: 3 },
  { code: 'NZ', name: 'New Zealand', currency: currencies.find(c => c.code === 'NZD')!, taxSystem: 'progressive', vatRate: 15, fiscalYearStart: 4 },
  { code: 'ID', name: 'Indonesia', currency: currencies.find(c => c.code === 'IDR')!, taxSystem: 'progressive', vatRate: 11, fiscalYearStart: 1 },
  { code: 'TH', name: 'Thailand', currency: currencies.find(c => c.code === 'THB')!, taxSystem: 'progressive', vatRate: 7, fiscalYearStart: 1 },
  { code: 'MY', name: 'Malaysia', currency: currencies.find(c => c.code === 'MYR')!, taxSystem: 'progressive', fiscalYearStart: 1 },
  { code: 'PH', name: 'Philippines', currency: currencies.find(c => c.code === 'PHP')!, taxSystem: 'progressive', vatRate: 12, fiscalYearStart: 1 },
  { code: 'VN', name: 'Vietnam', currency: currencies.find(c => c.code === 'VND')!, taxSystem: 'progressive', vatRate: 10, fiscalYearStart: 1 },
  { code: 'NG', name: 'Nigeria', currency: currencies.find(c => c.code === 'NGN')!, taxSystem: 'progressive', vatRate: 7.5, fiscalYearStart: 1 },
  { code: 'EG', name: 'Egypt', currency: currencies.find(c => c.code === 'EGP')!, taxSystem: 'progressive', vatRate: 14, fiscalYearStart: 7 },
  { code: 'PK', name: 'Pakistan', currency: currencies.find(c => c.code === 'PKR')!, taxSystem: 'progressive', vatRate: 17, fiscalYearStart: 7 },
  { code: 'BD', name: 'Bangladesh', currency: currencies.find(c => c.code === 'BDT')!, taxSystem: 'progressive', vatRate: 15, fiscalYearStart: 7 },
  { code: 'TR', name: 'Turkey', currency: currencies.find(c => c.code === 'TRY')!, taxSystem: 'progressive', vatRate: 18, fiscalYearStart: 1 },
  { code: 'RU', name: 'Russia', currency: currencies.find(c => c.code === 'RUB')!, taxSystem: 'flat', vatRate: 20, fiscalYearStart: 1 },
  { code: 'IL', name: 'Israel', currency: currencies.find(c => c.code === 'ILS')!, taxSystem: 'progressive', vatRate: 17, fiscalYearStart: 1 },
  { code: 'CO', name: 'Colombia', currency: currencies.find(c => c.code === 'COP')!, taxSystem: 'progressive', vatRate: 19, fiscalYearStart: 1 },
  { code: 'AR', name: 'Argentina', currency: currencies.find(c => c.code === 'ARS')!, taxSystem: 'progressive', vatRate: 21, fiscalYearStart: 1 },
  { code: 'CL', name: 'Chile', currency: currencies.find(c => c.code === 'CLP')!, taxSystem: 'progressive', vatRate: 19, fiscalYearStart: 1 },
  { code: 'PE', name: 'Peru', currency: currencies.find(c => c.code === 'PEN')!, taxSystem: 'progressive', vatRate: 18, fiscalYearStart: 1 },
  { code: 'IE', name: 'Ireland', currency: currencies.find(c => c.code === 'EUR')!, taxSystem: 'progressive', vatRate: 23, fiscalYearStart: 1 },
  { code: 'PT', name: 'Portugal', currency: currencies.find(c => c.code === 'EUR')!, taxSystem: 'progressive', vatRate: 23, fiscalYearStart: 1 },
  { code: 'AT', name: 'Austria', currency: currencies.find(c => c.code === 'EUR')!, taxSystem: 'progressive', vatRate: 20, fiscalYearStart: 1 },
  { code: 'BE', name: 'Belgium', currency: currencies.find(c => c.code === 'EUR')!, taxSystem: 'progressive', vatRate: 21, fiscalYearStart: 1 },
  { code: 'DK', name: 'Denmark', currency: currencies.find(c => c.code === 'DKK')!, taxSystem: 'progressive', vatRate: 25, fiscalYearStart: 1 },
  { code: 'FI', name: 'Finland', currency: currencies.find(c => c.code === 'EUR')!, taxSystem: 'progressive', vatRate: 24, fiscalYearStart: 1 },
  { code: 'GR', name: 'Greece', currency: currencies.find(c => c.code === 'EUR')!, taxSystem: 'progressive', vatRate: 24, fiscalYearStart: 1 },
  { code: 'CZ', name: 'Czech Republic', currency: currencies.find(c => c.code === 'CZK')!, taxSystem: 'progressive', vatRate: 21, fiscalYearStart: 1 },
  { code: 'RO', name: 'Romania', currency: currencies.find(c => c.code === 'RON')!, taxSystem: 'flat', vatRate: 19, fiscalYearStart: 1 },
  { code: 'HU', name: 'Hungary', currency: currencies.find(c => c.code === 'HUF')!, taxSystem: 'flat', vatRate: 27, fiscalYearStart: 1 },
  { code: 'UA', name: 'Ukraine', currency: currencies.find(c => c.code === 'UAH')!, taxSystem: 'progressive', vatRate: 20, fiscalYearStart: 1 },
  { code: 'KE', name: 'Kenya', currency: currencies.find(c => c.code === 'KES')!, taxSystem: 'progressive', vatRate: 16, fiscalYearStart: 7 },
  { code: 'GH', name: 'Ghana', currency: currencies.find(c => c.code === 'GHS')!, taxSystem: 'progressive', vatRate: 15, fiscalYearStart: 1 },
  { code: 'TW', name: 'Taiwan', currency: currencies.find(c => c.code === 'TWD')!, taxSystem: 'progressive', vatRate: 5, fiscalYearStart: 1 },
];

export function getCurrencySymbol(code: string): string {
  return currencies.find(c => c.code === code)?.symbol || code;
}

export function formatCurrency(amount: number, currencyCode: string, locale?: string): string {
  const currency = currencies.find(c => c.code === currencyCode);
  if (!currency) return `${currencyCode} ${amount.toFixed(2)}`;
  
  try {
    return new Intl.NumberFormat(locale || 'en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: currency.decimals,
      maximumFractionDigits: currency.decimals,
    }).format(amount);
  } catch {
    return `${currency.symbol}${amount.toFixed(currency.decimals)}`;
  }
}

export function formatCompactCurrency(amount: number, currencyCode: string): string {
  const currency = currencies.find(c => c.code === currencyCode);
  if (!currency) return `${currencyCode} ${amount}`;
  
  const absAmount = Math.abs(amount);
  let formatted: string;
  
  if (absAmount >= 1_000_000_000) {
    formatted = `${(amount / 1_000_000_000).toFixed(1)}B`;
  } else if (absAmount >= 1_000_000) {
    formatted = `${(amount / 1_000_000).toFixed(1)}M`;
  } else if (absAmount >= 1_000) {
    formatted = `${(amount / 1_000).toFixed(1)}K`;
  } else {
    formatted = amount.toFixed(currency.decimals);
  }
  
  return `${currency.symbol}${formatted}`;
}
