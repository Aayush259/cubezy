"use client"
import Image from "next/image"
import { H1, P } from "../ui/Text"
import { Button } from "../ui/Button"
import { IoStar } from "react-icons/io5"
import { useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import { RootState } from "@/lib/store/store"

export default function Hero() {
    const router = useRouter()
    const { isLoggedIn, user } = useSelector((state: RootState) => state.user)

    return (
        <section className="relative min-h-fit h-[600px] lg:h-[875px] max-h-[calc(100vh-90px)] flex items-center justify-center bg-whit">
            <div className="px-6 min-h-fit h-screen max-h-[700px] lg:px-20 grid lg:grid-cols-2 items-center gap-12 py-10">
                <div className="space-y-6 relative z-10">
                    <H1>
                        {"Effortless task management and communication with "}
                        <span>{"Cubezy"}</span>
                    </H1>
                    <P className="max-w-[85%]">
                        {"Manage tasks and projects easily with an all-in-one platform designed for seamless communication and collaboration."}
                    </P>

                    {isLoggedIn && user ? (
                        <Button onClick={() => router.push("/chat")}>
                            {"Go to chat"}
                        </Button>
                    ) : (
                        <Button onClick={() => router.push("/login")}>
                            {"Get started"}
                        </Button>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-8 pt-6">
                        <div className="flex -space-x-3 relative">
                            {["/images/avatar1.webp", "/images/avatar2.webp", "/images/avatar3.webp", "/images/avatar4.webp"].map((avatar, idx, arr) => (
                                <Image
                                    key={idx}
                                    src={avatar}
                                    alt={`Avatar ${idx}`}
                                    width={50}
                                    height={50}
                                    priority={true}
                                    className="rounded-full border-2 border-white"
                                    style={{ zIndex: arr.length - idx }}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <span className="text-2xl tracking-wide font-semibold">4.8/5</span>
                        <span className="flex items-center gap-1 mt-1">
                            <IoStar className="text-yellow-400" />
                            <IoStar className="text-yellow-400" />
                            <IoStar className="text-yellow-400" />
                            <IoStar className="text-yellow-400" />
                            <IoStar />
                        </span>
                    </div>
                </div>

                {/* Right Content - Image + Chat Bubbles */}
                <div className="relative flex justify-center [@media(max-width:550px)]: opacity-40 lg:opacity-100">
                    <div className="relative w-full">
                        <Image
                            src="/images/hero.webp"
                            alt="Girl using phone"
                            width={667}
                            height={747}
                            priority={true}
                            className="!w-full !h-auto sm:!w-[60vw] lg:max-h-none lg:!min-h-[50vh] [@media(min-width:1900px)]:!min-h-[calc(100vh-130px)] block lg:static absolute left-1/2 -translate-x-1/2 lg:translate-x-0 bottom-0"
                        />

                        <div className="absolute bottom-5 lg:bottom-20 2xl:bottom-40 left-0 lg:-left-12 rotate-12 bg-white shadow-lg rounded-xl p-2 lg:px-4 lg:py-3 w-60 lg:w-80 flex items-center gap-2">
                            <Image
                                src="/images/avatar4.webp"
                                alt="Ronald"
                                width={60}
                                height={60}
                                priority={true}
                                className="rounded-full"
                            />
                            <p className="text-sm lg:text-lg text-gray-800 lg:text-gray-600">
                                {"One of the best platform I have ever used."}
                            </p>
                        </div>

                        {/* Chat Bubble 2 */}
                        <div className="absolute bottom-40 lg:bottom-50 2xl:bottom-80 right-0 lg:-right-10 -rotate-6 bg-white shadow-lg rounded-xl p-2 lg:px-4 lg:py-3 w-72 lg:w-96 flex items-center gap-2">
                            <Image
                                src="/images/avatar3.webp"
                                alt="Jenny"
                                width={60}
                                height={60}
                                priority={true}
                                className="rounded-full"
                            />
                            <p className="text-sm lg:text-lg text-gray-800 lg:text-gray-600">
                                {"I commented on Figma, I want to add some fancy icons. Do you have any icon set?"}
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    )
}
