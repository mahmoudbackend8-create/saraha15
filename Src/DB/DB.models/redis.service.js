import { client } from "../Radis.connection.js";

export async function set({ key, value, EXtype = "EX", EXvalue = 50 }) {
  return await client.set(key, value, {
    expiration: { type: EXtype, value: Math.floor(EXvalue) }, // Math.floor(EXvalue) تقريب حتي لا تكون decimal
  });
}
export async function incr(key) {
  return await client.incr(key);
}
export async function decr(key) {
  return await client.decr(key);
}

export async function update({ key, value }) {
  const existFiled = await client.exists(key);
  if (!existFiled) {
    return 0;
  }
  return await client.set(key, value);
}

export async function remove(keys) {
  return await client.del(keys);
}
export async function hSet(fileds) {
  return await client.hSet(fileds);
}
export async function ttl(key) {
  return await client.ttl(key);
}
export async function setExpire(key, second) {
  return await client.expire(key, second);
}
export async function removeExpire(key) {
  return await client.persist(key);
}
export async function get(key) {
  return await client.get(key);
}
export async function mget(key) {
  return await client.mget(key);
}
export function BlackListKeys({ userID, TokenID }) {
  return `blackListTokens :: ${userID}::${TokenID}`;
}
export function getOTPKey({ email, emailType }) {
  return `OTP::${email}::${emailType}`;
}
export function getOTPKeyAtempsNum({ email, emailType }) {
  return `OTP::${email}::${emailType}::NUM`;
}
export function getOTPKeyBlocked({ email, emailType }) {
  return `OTP::${email}::${emailType}::BLOCKED`;
}






