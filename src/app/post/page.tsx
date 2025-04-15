"use client";

import { useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import UploadPicsForm from "@/components/forms/UploadPicsForm";
import UploadVidForm from "@/components/forms/UploadVidForm";
import { SessionProvider } from "next-auth/react";

export default function PostPage() {
    const [type, setType] = useState("");

    return (
        <div className="flex flex-col m-10 p-10 shadow-lg bg-white justify-between gap-4">
            <div className="flex flex-col gap-4 mb-4 pb-4 border-b-2">
                <h1 className="text-3xl font-bold">Post up‼️</h1>
                <p>
                    Select the type of content you want to upload, then go
                    bananas 🍌🍌🍌
                </p>
                <Select onValueChange={setType} defaultValue={type}>
                    <SelectTrigger>
                        <SelectValue placeholder="Content Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="vid">Vid</SelectItem>
                        <SelectItem value="pics">Pics</SelectItem>
                        <SelectItem value="story" disabled>
                            Story (coming soon)
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <SessionProvider>
                {type === "vid" && <UploadVidForm />}
                {type === "pics" && <UploadPicsForm />}
            </SessionProvider>
        </div>
    );
}
