import { Injectable } from "@angular/core";
import * as CryptoJS from 'crypto-js';
import { environment } from '../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class KEYSSTORAGE {

    private encryptionKey = environment.EncryptionKey;

    constructor() { }
    setItem(key: string, value: any): void {
        try {
            const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
            const encryptedValue = CryptoJS.AES.encrypt(stringValue, this.encryptionKey).toString();
            localStorage.setItem(key, encryptedValue);
        } catch (error) {
            console.error(`Error encrypting and setting item ${key}:`, error);
        }
    }
    getItem(key: string): any {
        try {
            const encryptedValue = localStorage.getItem(key);
            if (!encryptedValue) return null;
            const decryptedValue = CryptoJS.AES.decrypt(encryptedValue, this.encryptionKey).toString(CryptoJS.enc.Utf8);
            try {
                return JSON.parse(decryptedValue);
            } catch (e) {
                return decryptedValue;
            }
        } catch (error) {
            console.error(`Error decrypting item ${key}:`, error);
            return null;
        }
    }
    removeItem(key: string): void {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing item ${key}:`, error);
        }
    }
    clear(): void {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error clearing local storage:', error);
        }
    }

    // Check if item exists
    hasItem(key: string): boolean {
        return localStorage.getItem(key) !== null;
    }
}
