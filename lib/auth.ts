import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const fallbackEmail = process.env.ADMIN_EMAIL;
        const fallbackPassword = process.env.ADMIN_PASSWORD;
        if (fallbackEmail && fallbackPassword && parsed.data.email === fallbackEmail) {
          const isPlainMatch = parsed.data.password === fallbackPassword;
          const isHashMatch = fallbackPassword.startsWith("$2")
            ? await bcrypt.compare(parsed.data.password, fallbackPassword)
            : false;
          if (isPlainMatch || isHashMatch) {
            return { id: "admin", name: "Akhil", email: fallbackEmail, role: "admin" };
          }
        }

        await connectDB();
        const user = await User.findOne({ email: parsed.data.email }).select("+password");
        if (!user) return null;
        const valid = await bcrypt.compare(parsed.data.password, user.password);
        if (!valid) return null;
        return { id: user.id, name: user.name, email: user.email, role: user.role };
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = (user as { role?: string }).role;
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || "";
        session.user.role = token.role as string;
      }
      return session;
    },
    authorized({ auth: session, request }) {
      if (request.nextUrl.pathname.startsWith("/admin/login")) return true;
      if (request.nextUrl.pathname.startsWith("/admin")) return Boolean(session?.user);
      return true;
    }
  }
});
