import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import Resend from "next-auth/providers/resend";
import { redirect } from "next/navigation";

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Resend({
            from: "noreply@updates.setlistt.com",
        }),
    ],
});

export const checkAuth = async () => {
    const session = await auth();
    if (!session) {
        redirect("/api/auth/signin");
    }
};
