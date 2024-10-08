// app/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import conn from "@/app/lib/db";

const getUserGoogle = async (email) => {
  try {
    const lowerEmail = email.toLowerCase().trim();
    const { rows: result } = await conn.query(
      "SELECT * FROM users WHERE email=$1",
      [lowerEmail],
    );

    if (result.length === 0) {
      return null;
    }

    const user = result[0];

    return user;
  } catch (error) {
    return null;
  }
};

const getUser = async (username, password) => {
  const lowerEmail = username.toLowerCase().trim();

  try {
    const { rows: result } = await conn.query(
      "SELECT * FROM users WHERE username=$1 OR email=$2",
      [lowerEmail, lowerEmail],
    );

    if (result.length === 0) {
      return null;
    }

    const user = result[0];
    const isPasswordMatch = await bcrypt.compare(password, user.password_hash);

    if (isPasswordMatch) {
      return user;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "jsmith@mail.com" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (credentials) {
          const user = await getUser(
            credentials.username,
            credentials.password,
          );

          if (user) {
            return user;
          }
        }
        throw new Error("Invalid credentials");
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile, credentials }) {
      if (account.provider === "google") {
        const user = await getUserGoogle(profile.email);

        return !!user;
      } else if (account.provider === "credentials") {
        const user = await getUser(credentials.username, credentials.password);

        return !!user;
      }

      return false;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/",
    error: "/login?error=Credenciales invalidas",
  },
  url: process.env.NEXTAUTH_URL,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
