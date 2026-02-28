import { randomBytes, scryptSync } from "crypto";
 
 export function hashPasswordWithSalt(password, userSalt = undefined) {

  const salt = userSalt ?? randomBytes(16).toString("hex");
  const hashedPassword = scryptSync(password, salt, 64).toString("hex");
 
   return { password: hashedPassword, salt };
 }