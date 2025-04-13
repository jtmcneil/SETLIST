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
    callbacks: {
        async session({ session }) {
            const accounts = await prisma.account.findMany({
                where: { userId: session.user.id },
                select: {
                    provider: true,
                    avi_url: true,
                    username: true,
                },
            });
            const userSession = (({
                expires,
                user: { email, name, image },
            }) => ({ expires, user: { email, name, image, accounts } }))(
                session
            );
            return userSession;
        },
    },
});

export const checkAuth = async () => {
    const session = await auth();
    if (!session) {
        redirect("/api/auth/signin");
    }
};
