"use client";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "../store/userSlice";
import { useRouter } from "next/navigation";

export default function LoginForm() {

    const dispatch = useDispatch();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!formData.email || !formData.password) {
            setError(true);
            setIsSubmitting(false);
            return;
        }

        try {
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
                router.push("/");
            } else {
                console.log("Login failed");
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form className="w-full flex flex-col gap-6" onSubmit={handleSubmit}>
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
                Sign In
            </button>
        </form>
    );
}
