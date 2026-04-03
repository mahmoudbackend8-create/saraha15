import { compare, hash } from "bcrypt";
import { SALT_ROUND } from "../../../Config/Config.service.js";
export async function hashing({ PlainText, round = SALT_ROUND }) {
  return await hash(String(PlainText), round);
}

export async function comparing({ plainValue, hashValue }) {
  return await compare(plainValue, hashValue);
}
