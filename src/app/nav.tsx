import SignInButton from "@/components/buttons/SignInButton";
import SignOutButton from "@/components/buttons/SignOutButton";
import { auth } from "@/lib/auth";
import Link from "next/link";

export default async function Nav() {
    const session = await auth();

    return (
        <nav className="fixed top-0 w-full flex justify-between items-center h-20 px-48 border-b-2 border-[#94afc4]  bg-white">
            <Link href={"/"}>
                <div className="text-lg font-bold">Setlistt</div>
            </Link>
            <div className="flex items-center space-x-4">
                <ul className="flex space-x-4">
                    <li>
                        <Link href={"/dashboard"}>Dashboard</Link>
                    </li>
                    <p>|</p>
                    <li>
                        {session?.user ? <SignOutButton /> : <SignInButton />}
                    </li>
                </ul>
            </div>
        </nav>
    );
}
