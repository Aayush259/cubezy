"use client";
import Loader from "@/src/components/Loader";
import { RootState } from "@/src/store/store";
import { login, logout } from "@/src/store/userSlice";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const AuthProvider: React.FC<{
    children: React.ReactNode;
}> = ({ children }) => {

    const { isLoggedIn } = useSelector((state: RootState) => state.user);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const getUser = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            dispatch(logout());
            localStorage.removeItem("token");
            if (pathname !== "/signup" && pathname !== "/login") {
                router.push("/login");
            }
            setIsAuthenticated(false);
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/auth/getUser", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("token", data.token);
                dispatch(login(data.user));
                setIsAuthenticated(true);
                router.push("/");
            } else {
                dispatch(logout());
                localStorage.removeItem("token");
                router.push("/login");
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.log(error);
            dispatch(logout());
            localStorage.removeItem("token");
            router.push("/login");
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getUser();
    }, [isLoggedIn]);

    if (loading) {
        return (
            <div className="w-screen h-screen">
                <Loader />
            </div>
        );
    }

    if (!isAuthenticated && pathname !== "/signup" && pathname !== "/login") {
        return null;
    }

    return <>{children}</>;
};

export default AuthProvider;
