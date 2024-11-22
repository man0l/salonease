import i18n from "i18next";
import { useTranslation, initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      navigation: require('./locale/en/navigation.json'),
      salon: require('./locale/en/salon.json'),
      auth: require('./locale/en/auth.json'),
      service: require('./locale/en/service.json'),
      clients: require('./locale/en/clients.json'),
      common: require('./locale/en/common.json'),
      bookings: require('./locale/en/bookings.json'),
      dashboard: require('./locale/en/dashboard.json'),
      legal: require('./locale/en/legal.json'),
      staff: require('./locale/en/staff.json'),
      reports: require('./locale/en/reports.json'),
      modals: require('./locale/en/modals.json')
    }
  },
  lng: "en", // default language
  fallbackLng: "en",
  interpolation: {
    escapeValue: false
  }
});
