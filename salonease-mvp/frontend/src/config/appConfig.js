const appConfig = {
  currency: {
    symbol: 'лв.',
    position: 'after', // 'before' or 'after'
    decimalSeparator: ',',
    thousandsSeparator: '.',
    decimalPlaces: 2
  },
  defaultCountry: 'BG', // Bulgaria as default country
  phoneNumber: {
    defaultCountry: 'BG',
    defaultCallingCode: '+359',
    length: 12,
    defaultFormat: '+359 ### ### ###',
    defaultPlaceholder: '+359 888 888 888',
    labels: {
      country: 'Phone number country',
      phone: 'Phone',
      ext: 'ext.'
    }
  }
};

export default appConfig;
