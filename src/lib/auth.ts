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

            return {
                ...session,
                user: {
                    id: session.user.id,
                    name: session.user.name,
                    email: session.user.email,
                    image: session.user.image,
                    accounts: accounts, // Add your custom field
                },
            };
        },
    },
});

export const checkAuth = async () => {
    const session = await auth();
    if (!session) {
        redirect("/api/auth/signin");
    } else return session;
};
