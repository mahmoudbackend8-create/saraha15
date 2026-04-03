import CryptoJS from "crypto-js";
import { ENCRYPTION_KEY } from "../../../Config/Config.service.js";

export function encreption({ value, key = ENCRYPTION_KEY }) {
  return CryptoJS.AES.encrypt(value, key).toString();
}

export function decreyption({ ciphertext, key = ENCRYPTION_KEY }) {
  const bytes = CryptoJS.AES.decrypt(ciphertext, key);
  const originalText = bytes.toString(CryptoJS.enc.Utf8);
  return originalText
}
