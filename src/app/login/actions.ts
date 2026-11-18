"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, destroySession, type Role } from "@/lib/auth";

export interface LoginState {
  error?: string;
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  const [user] = await db().sql<{
    id: number; email: string; full_name: string; role: Role;
    store_id: number | null; store_name: string | null; password_hash: string;
  }>`
    SELECT u.id, u.email, u.full_name, u.role, u.store_id, s.name AS store_name, u.password_hash
    FROM users u LEFT JOIN stores s ON s.id = u.store_id
    WHERE u.email = ${email}`;

  // Same message for unknown email and wrong password, so the form doesn't reveal which accounts exist.
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return { error: "Invalid email or password." };
  }

  await createSession({
    userId: user.id,
    name: user.full_name,
    email: user.email,
    role: user.role,
    storeId: user.store_id,
    storeName: user.store_name,
  });
  redirect("/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
