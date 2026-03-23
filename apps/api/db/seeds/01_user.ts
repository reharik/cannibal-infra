import type { Knex } from "knex";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const seed = async (knex: Knex): Promise<void> => {
  await knex("user").del();

  const userId = crypto.randomUUID();
  const passwordHash = await bcrypt.hash("123123123", 12);

  await knex("user").insert({
    id: userId,
    email: "harik.raif@gmail.com",
    first_name: "Raif",
    last_name: "Harik",
    password_hash: passwordHash,
    email_verified: true,
    created_by: userId,
    updated_by: userId,
  });
};
