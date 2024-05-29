import NextAuth from 'next-auth';

import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials";
import conn from '@/app/lib/db';
import bcrypt from 'bcryptjs'

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text", placeholder: "jsmith@mail.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                const user = await getUser(credentials.username, credentials.password)
                console.log("🚀 ~ authorize ~ user:", user)
                if (user) {
                    return user
                } else {
                    return null
                }
            }
        })
    ],
    callbacks: {
        async signIn({ account, profile, credentials }) {
            if (credentials) {
                const user = await getUser(credentials.username, credentials.password)
                if (user) {
                    return user
                } else {
                    return null
                }
            }
            return null
        },
        async redirect({ url, baseUrl }) {
            if (url.startsWith("/")) return `${baseUrl}${url}`
            else if (new URL(url).origin === baseUrl) return url
            return baseUrl
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
    // pages: {
    //     signIn: '/login',
    //     error: '/login'
    // },
    url: process.env.NEXTAUTH_URL,
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

const getUser = async (username, password) => {
    try {
        const { rows: result } = await conn.query(
            'SELECT * FROM users WHERE username=$1 or email=$2',
            [username, username]
        );
        if (result.length === 0) {
            return null;
        }

        const user = result[0];
        const isPasswordMatch = await bcrypt.compare(password, user.password_hash);

        if (isPasswordMatch) {
            /* await conn.query(
                'UPDATE users set last_connection = now() where id = $1',
                [user.id]
            ); */
            return user;
        } else {
            return null;
        }

    } catch (error) {
        console.log(error);
        return null;
    }
};