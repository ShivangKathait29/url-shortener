const CHARSET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BASE = CHARSET.length; // 62

export function base62Encode(num) {
  if (num === 0) return CHARSET[0];
  let result = '';
  while (num > 0) {
    result = CHARSET[num % BASE] + result;
    num = Math.floor(num / BASE);
  }
  return result;
}

export function base62Decode(str) {
  let num = 0;
  for (const char of str) {
    num = num * BASE + CHARSET.indexOf(char);
  }
  return num;
}
