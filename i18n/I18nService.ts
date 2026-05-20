import * as Localization from "expo-localization";
import { I18n } from "i18n-js";
import en from "./locales/en";
import fr from "./locales/fr";
import AsyncStorage from "@react-native-async-storage/async-storage";

export class I18nService {
  private static i18nService: I18nService;
  private i18n: I18n;

  private constructor() {
    this.i18n = new I18n({ 
      en,
      fr
    });

    this.i18n.enableFallback = true;

    this.i18n.defaultLocale = "en";
  }

  static getInstance() {
    if (!I18nService.i18nService) {
      I18nService.i18nService = new I18nService();
    }

    return I18nService.i18nService;
  }

  async initLanguage() {
    const savedLang = await AsyncStorage.getItem("app_lang"); // Language from Local AsyncStorage at first

    if (savedLang) {
      this.i18n.locale = savedLang;
    } else {
      const deviceLang = Localization.getLocales()[0]?.languageCode || "en"; // Otherwise, Language from Device

      this.i18n.locale = deviceLang;
    }

    return this.i18n.locale;
  }

  async setLanguage(lang: "en" | "fr") {
    this.i18n.locale = lang;
    await AsyncStorage.setItem("app_lang", lang);
  }

  t(key: string, options?: any) {
    return this.i18n.t(key, options);
  }
}
