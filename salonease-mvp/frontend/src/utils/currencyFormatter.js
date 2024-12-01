import appConfig from '../config/appConfig';

export const formatCurrency = (amount) => {
  const { symbol, position, decimalSeparator, thousandsSeparator, decimalPlaces } = appConfig.currency;
  if (isNaN(amount)) {
    amount = 0;
  }

  const formattedAmount = Number(amount)
    .toFixed(decimalPlaces)
    .replace('.', decimalSeparator)
    .replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);

  return position === 'before' 
    ? `${symbol}${formattedAmount}`
    : `${formattedAmount} ${symbol}`;
};
