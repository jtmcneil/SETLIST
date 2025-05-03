import { prisma } from "@/lib/prisma";

export default async function PostList({ userId }: { userId: string }) {
    const posts = await prisma.post.findMany({ where: { userId } });
    return (
        <div>
            {posts.map((post) => (
                <div key={post.id}>
                    <h2>{post.caption}</h2>
                    <p>{post.postedAt.toString()}</p>
                </div>
            ))}
        </div>
    );
}
