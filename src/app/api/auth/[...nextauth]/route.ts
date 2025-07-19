// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const res = await fetch("https://maestro-api-dev.secil.biz/Auth/Login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "YOUR_SECRET_TOKEN", // Eğer gerekiyorsa
          },
          body: JSON.stringify({
            username: credentials?.username,
            password: credentials?.password,
          }),
        });

        const data = await res.json();

        if (res.ok && data.data?.accessToken) {
          return {
            id: "user",
            name: data.data.name ?? "Kullanıcı",
            email: credentials?.username,
            accessToken: data.data.accessToken, // ✅ burada değişiklik
          };
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken; // ✅
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken; // ✅
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
