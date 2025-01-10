import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: require('./locale/en/common.json'),
      navigation: require('./locale/en/navigation.json'),
      salon: require('./locale/en/salon.json'),
      auth: require('./locale/en/auth.json'),
      service: require('./locale/en/service.json'),
      clients: require('./locale/en/clients.json'),
      bookings: require('./locale/en/bookings.json'),
      dashboard: require('./locale/en/dashboard.json'),
      legal: require('./locale/en/legal.json'),
      staff: require('./locale/en/staff.json'),
      reports: require('./locale/en/reports.json'),
      modals: require('./locale/en/modals.json'),
      billing: require('./locale/en/billing.json'),
      profile: require('./locale/en/profile.json'),
      pages: require('./locale/en/pages.json')
    },
    bg: {
      common: require('./locale/bg/common.json'),
      navigation: require('./locale/bg/navigation.json'),
      salon: require('./locale/bg/salon.json'),
      auth: require('./locale/bg/auth.json'),
      service: require('./locale/bg/service.json'),
      clients: require('./locale/bg/clients.json'),
      bookings: require('./locale/bg/bookings.json'),
      dashboard: require('./locale/bg/dashboard.json'),
      legal: require('./locale/bg/legal.json'),
      staff: require('./locale/bg/staff.json'),
      reports: require('./locale/bg/reports.json'),
      modals: require('./locale/bg/modals.json'),
      billing: require('./locale/bg/billing.json'),
      profile: require('./locale/bg/profile.json'),
      pages: require('./locale/bg/pages.json')
    },
  },
  lng: "bg", // default language
  fallbackLng: "en",
  defaultNS: "common",
  ns: ["common", "navigation", "salon", "auth", "service", "clients", "bookings", "dashboard", "legal", "staff", "reports", "modals", "billing", "profile", "pages"],
  interpolation: {
    escapeValue: false
  }
});

export default i18n;