import { PrismaClient } from "@prisma/client";

const now = new Date();
const posts = [
    {
        type: "PICS",
        caption: "tomorrow at 2pm",
        postedAt: new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1, // tomorrow
            14, // 2 PM in 24-hour format
            0, // minutes
            0, // seconds
            0 // milliseconds
        ),
    },
    {
        type: "VID",
        caption: "at midnight",
        postedAt: new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1,
            0,
            0,
            0,
            0
        ),
    },
    {
        type: "VID",
        caption: "in 1 hour",
        postedAt: new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            now.getHours() + 1,
            now.getMinutes(),
            0,
            0
        ),
    },
    {
        type: "PICS",
        caption: "5 min ago",
        postedAt: new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            now.getHours(),
            now.getMinutes() - 5,
            0,
            0
        ),
    },
    {
        type: "PICS",
        caption: "2 hours ago",
        postedAt: new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            now.getHours() - 2,
            now.getMinutes(),
            0,
            0
        ),
    },
    {
        type: "VID",
        caption: "yesterday",
        postedAt: new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - 1,
            now.getHours(),
            now.getMinutes(),
            0,
            0
        ),
    },
];

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findUnique({
        where: { email: "jtgizzmo@gmail.com" },
    });

    if (!user?.id) {
        throw new Error("User not found");
    }

    for (const post of posts) {
        await prisma.post.create({
            data: {
                userId: user.id,
                type: "PICS",
                caption: post.caption,
                postedAt: post.postedAt,
            },
        });
    }

    console.log("Database seeded successfully!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
