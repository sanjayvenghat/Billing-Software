import { Injectable } from '@angular/core';
import { KEYSSTORAGE } from './LocalStorage';
import { TAMIL_DICTIONARY } from './tamil.translations';

@Injectable({
  providedIn: 'root'
})
export class TranslateService {
  private currentLang = 'English';

  constructor(private keysStorage: KEYSSTORAGE) {
    this.initLang();
  }

  private initLang() {
    const saved = this.keysStorage.getItem('APP_SETTINGS');
    if (saved && saved.systemLanguage) {
      this.currentLang = saved.systemLanguage;
    } else {
      this.currentLang = 'English';
    }
  }

  public getLanguage(): string {
    return this.currentLang;
  }

  public setLanguage(lang: string) {
    this.currentLang = lang;
  }

  public translate(key: string): string {
    if (!key) return key;
    if (this.currentLang === 'English') {
      return key;
    }
    // Try exact lookup first
    const trimmedKey = key.trim();
    if (TAMIL_DICTIONARY[trimmedKey]) {
      return TAMIL_DICTIONARY[trimmedKey];
    }
    // Case insensitive/partial lookups if needed, but exact is cleanest
    return TAMIL_DICTIONARY[key] || key;
  }
}
