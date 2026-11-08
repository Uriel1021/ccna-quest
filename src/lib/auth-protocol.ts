/** Contrato de /api/auth/* compartido entre cliente y servidor. */
import { z } from "zod";

export const Email = z.string().trim().toLowerCase().pipe(z.email({ message: "Escribe un correo válido." })).pipe(z.string().max(120));
export const Password = z.string()
  .min(8, { message: "La contraseña debe tener al menos 8 caracteres." })
  .max(128, { message: "La contraseña es demasiado larga." });
export const DisplayName = z.string().trim().min(1, { message: "Escribe tu nombre." }).max(40, { message: "Máximo 40 caracteres." });

export const RegisterBody = z.object({ userId: z.uuid(), email: Email, password: Password, displayName: DisplayName });
export const LoginBody = z.object({ email: Email, password: z.string().min(1).max(128) });
export const RecoverBody = z.object({ email: Email, recoveryCode: z.string().min(16).max(40), newPassword: Password });
export const ChangePasswordBody = z.object({ currentPassword: z.string().min(1).max(128), newPassword: Password });
export const NewRecoveryBody = z.object({ password: z.string().min(1).max(128) });

export type AccountUser = { id: string; email: string; displayName: string; isAdmin?: boolean };
export type AuthOk = { token: string; user: AccountUser; recoveryCode?: string };
export type AuthError = { error: string; field?: string };
