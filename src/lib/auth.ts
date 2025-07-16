import { betterAuth } from "better-auth"
import { createAuthClient } from "@better-auth/react"

export const auth = betterAuth({
  database: {
    provider: "sqlite",
    url: ":memory:", // We'll use Blink SDK for persistence
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
})

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000", // Will be updated for production
})

export type Session = typeof authClient.$Infer.Session