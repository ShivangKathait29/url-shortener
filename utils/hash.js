import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export async function hashPasswordWithSalt(password, userSalt = undefined) {
  const salt = userSalt ?? randomBytes(16).toString("hex");
  const hashedPassword = (await scryptAsync(password, salt, 64)).toString("hex");

  return { password: hashedPassword, salt };
}