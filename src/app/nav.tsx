import SignInButton from "@/components/ui/signInButton";
import SignOutButton from "@/components/ui/signOutButton";
import { auth } from "@/lib/auth";
import Link from "next/link";

export default async function Nav() {
    const session = await auth();

    return (
        <nav className="flex justify-between items-center py-4 px-40 bg-gray-800 text-white">
            <Link href={"/"}>
                <div className="text-lg font-bold">Setlist</div>
            </Link>
            <ul className="flex space-x-4">
                <li>{session?.user ? <SignOutButton /> : <SignInButton />}</li>
            </ul>
        </nav>
    );
}
