"use client";

import Image from "next/image";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import PhoneScreen from "../PhoneScreen";

interface Props {
    username: string;
    aviUrl: string | null;
    location: string;
    videoUrl: string | null;
    caption: string;
}

export default function InstagramReel(props: Props) {
    return (
        <PhoneScreen>
            <div className="bg-black text-white flex flex-col relative w-full h-full">
                <section className="flex-1 relative">
                    <div className="absolute w-full flex justify-between pt-10 px-4">
                        <h2 className="font-bold text-xl">Reels</h2>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                        >
                            <path d="M10.5 8.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" />
                            <path d="M2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4zm.5 2a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1m9 2.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0" />
                        </svg>
                    </div>
                    <div className="absolute bottom-0 w-full px-4 pb-2">
                        <div className="flex-1 flex w-5/6 flex-col ">
                            <div className="flex gap-2 items-center">
                                {!props.aviUrl && (
                                    <div className="h-8 w-8 rounded-full bg-gray-200" />
                                )}
                                {props.aviUrl && (
                                    <Image
                                        className="h-8 w-8 rounded-full"
                                        src={props.aviUrl}
                                        alt="your profile image"
                                        height={300} // Set the height of the image
                                        width={300} // Set the width of the image
                                    />
                                )}
                                <p className="text-sm font-bold">
                                    {props.username}{" "}
                                </p>
                            </div>
                            <p className="my-2 text-sm">{props.caption}</p>
                            <p className="text-[0.7rem] text-gray-400">
                                Liked by <span className="font-bold">SZA</span>{" "}
                                and <span className="font-bold">others</span>
                            </p>
                        </div>
                        <div className="w-[10%]">
                            <div className="absolute bottom-0 right-0 px-4 pb-2">
                                <div className="flex flex-col justify-center align-middle">
                                    <svg
                                        fill="white"
                                        height="24"
                                        viewBox="0 0 48 48"
                                        width="24"
                                        className="my-2"
                                    >
                                        <path d="M34.6 6.1c5.7 0 10.4 5.2 10.4 11.5 0 6.8-5.9 11-11.5 16S25 41.3 24 41.9c-1.1-.7-4.7-4-9.5-8.3-5.7-5-11.5-9.2-11.5-16C3 11.3 7.7 6.1 13.4 6.1c4.2 0 6.5 2 8.1 4.3 1.9 2.6 2.2 3.9 2.5 3.9.3 0 .6-1.3 2.5-3.9 1.6-2.3 3.9-4.3 8.1-4.3m0-3c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5.6 0 1.1-.2 1.6-.5 1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z"></path>
                                    </svg>
                                    <svg
                                        fill="white"
                                        height="24"
                                        viewBox="0 0 48 48"
                                        width="24"
                                        className="my-2"
                                    >
                                        <path
                                            clipRule="evenodd"
                                            d="M47.5 46.1l-2.8-11c1.8-3.3 2.8-7.1 2.8-11.1C47.5 11 37 .5 24 .5S.5 11 .5 24 11 47.5 24 47.5c4 0 7.8-1 11.1-2.8l11 2.8c.8.2 1.6-.6 1.4-1.4zm-3-22.1c0 4-1 7-2.6 10-.2.4-.3.9-.2 1.4l2.1 8.4-8.3-2.1c-.5-.1-1-.1-1.4.2-1.8 1-5.2 2.6-10 2.6-11.4 0-20.6-9.2-20.6-20.5S12.7 3.5 24 3.5 44.5 12.7 44.5 24z"
                                            fillRule="evenodd"
                                        ></path>
                                    </svg>
                                    <svg
                                        fill="white"
                                        height="24"
                                        viewBox="0 0 48 48"
                                        width="24"
                                        className="my-2"
                                    >
                                        <path d="M47.8 3.8c-.3-.5-.8-.8-1.3-.8h-45C.9 3.1.3 3.5.1 4S0 5.2.4 5.7l15.9 15.6 5.5 22.6c.1.6.6 1 1.2 1.1h.2c.5 0 1-.3 1.3-.7l23.2-39c.4-.4.4-1 .1-1.5zM5.2 6.1h35.5L18 18.7 5.2 6.1zm18.7 33.6l-4.4-18.4L42.4 8.6 23.9 39.7z"></path>
                                    </svg>
                                    <div className="w-6 h-6 text-center py-1">
                                        &#8943;
                                    </div>
                                    <div className="w-6 h-6 rounded-md bg-black border-white border-2 mt-4 mb-1 "></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="vertical-gradient w-full h-full">
                        {props.videoUrl && (
                            <video
                                className="h-full"
                                src={props.videoUrl}
                                autoPlay
                                muted
                                loop={true}
                            ></video>
                        )}
                    </div>
                </section>
                <section className="border-t-2 border-gray-400 w-full h-[8%] flex">
                    <div className="flex-1 flex justify-center items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="white"
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                        >
                            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                        </svg>
                    </div>
                    <div className="flex-1 flex justify-center items-center">
                        <svg
                            fill="white"
                            width="30"
                            height="30"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M17.545 15.467l-3.779-3.779a6.15 6.15 0 0 0 .898-3.21c0-3.417-2.961-6.377-6.378-6.377A6.185 6.185 0 0 0 2.1 8.287c0 3.416 2.961 6.377 6.377 6.377a6.15 6.15 0 0 0 3.115-.844l3.799 3.801a.953.953 0 0 0 1.346 0l.943-.943c.371-.371.236-.84-.135-1.211zM4.004 8.287a4.282 4.282 0 0 1 4.282-4.283c2.366 0 4.474 2.107 4.474 4.474a4.284 4.284 0 0 1-4.283 4.283c-2.366-.001-4.473-2.109-4.473-4.474z" />
                        </svg>
                    </div>
                    <div className="flex-1 flex justify-center items-center">
                        <div className="border-2 vorder-white rounded-md">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                viewBox="2 2 12 12"
                            >
                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                            </svg>
                        </div>
                    </div>
                    <div className="flex-1 flex justify-center items-center">
                        <div className="w-5 h-5  rounded-md bg-white"></div>
                    </div>
                    <div className="flex-1 flex justify-center items-center">
                        <div className="w-5 h-5  border-2  border-white rounded-full"></div>
                    </div>
                </section>
            </div>
            {/* <div className="bg-black w-full">
                    {props.videoUrl && (
                        <video src={props.videoUrl} autoPlay={true} />
                    )}
                </div>
                {!props.aviUrl && (
                    <div className="h-8 w-8 rounded-full bg-gray-200" />
                )}
                {props.aviUrl && (
                    <Image
                        className="h-8 w-8 rounded-full"
                        src={props.aviUrl}
                        alt="your profile image"
                        height={300} // Set the height of the image
                        width={300} // Set the width of the image
                    />
                )}

                <div className="absolute bottom-4">
                    <span className="text-sm font-semibold antialiased block leading-tight">
                        {props.username ? props.username : ""}
                    </span>
                    <span className="text-gray-600 text-xs block">
                        {props.location ? props.location : ""}
                    </span>
                </div>

                

                <div className="font-semibold text-sm mx-4 mt-2">
                    Liked by SZA and others
                </div>
                <div className="flex gap-1 mx-4 mb-4">
                    <p className="text-sm">
                        <span className="font-bold">{props.username} </span>
                        {props.caption}
                    </p>
                </div> */}
        </PhoneScreen>
    );
}
