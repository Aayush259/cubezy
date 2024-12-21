"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import Loader from "./Loader";
import { useToast } from "../contexts/ToastContext";
import { login } from "../store/userSlice";

export default function SignupForm() {

    const dispatch = useDispatch();

    const { addToast } = useToast();
    const { isLoggedIn, user } = useSelector((state: RootState) => state.user);
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        if (isLoggedIn && user) {
            router.push("/");
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!formData.name || !formData.email || !formData.password) {
            setError(true);
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const res = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                });

                if (res.ok) {
                    const { token, user } = await res.json();
                    localStorage.setItem("token", token);
                    dispatch(login(user));
                } else {
                    router.push("/login");
                }
            } else {
                console.log("Signup failed");
                addToast("Something went wrong", false);
            }
        } catch (error) {
            console.log(error);
            addToast("Something went wrong", false);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoggedIn && user) return (
        <div className="w-full h-full">
            <Loader />
        </div>
    );

    return (
        <form className="w-full flex flex-col gap-6" onSubmit={handleSubmit}>
            <label htmlFor="name" className="flex flex-col gap-2 text-lg">
                <p className="flex items-center justify-between">
                    <span>Username:</span>
                    {
                        error && !formData.name && <span className="text-sm text-red-500 font-semibold">Required*</span>
                    }
                </p>
                <input
                    type="text"
                    id="name"
                    placeholder="Enter your name"
                    className="w-full px-4 py-2 bg-transparent border border-white/80 rounded-lg"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
            </label>

            <label htmlFor="email" className="flex flex-col gap-2 text-lg">
                <p className="flex items-center justify-between">
                    <span>Email:</span>
                    {
                        error && !formData.email && <span className="text-sm text-red-500 font-semibold">Required*</span>
                    }
                </p>
                <input
                    type="email"
                    id="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 bg-transparent border border-white/80 rounded-lg"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
            </label>

            <label htmlFor="name" className="flex flex-col gap-2 text-lg">
                <p className="flex items-center justify-between">
                    <span>Password:</span>
                    {
                        error && !formData.password && <span className="text-sm text-red-500 font-semibold">Required*</span>
                    }
                </p>
                <input
                    type="password"
                    id="password"
                    placeholder="Enter your password"
                    className="w-full px-4 py-2 bg-transparent border border-white/80 rounded-lg"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
            </label>

            <button type="submit" className={`px-4 py-2 my-2 w-full bg-orange-700 rounded-lg mx-auto ${isSubmitting ? "opacity-50" : "opacity-100"}`}>
                Sign Up
            </button>
        </form>
    );
}
