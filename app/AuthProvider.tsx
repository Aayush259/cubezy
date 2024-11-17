"use client";
import { RootState } from "@/src/store/store";
import { login, logout } from "@/src/store/userSlice";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const AuthProvider: React.FC<{
    children: React.ReactNode
}> = ({
    children
}) => {
        const { isLoggedIn } = useSelector((state: RootState) => state.user);
        const dispatch = useDispatch();
        const [loading, setLoading] = useState(true);
        const router = useRouter();
        const pathname = usePathname();

        const getUser = async () => {
            setLoading(true);
            const token = localStorage.getItem("token");

            if (!token) {
                dispatch(logout());
                localStorage.removeItem("token");
                if (pathname !== "/signup") {
                    router.push("/login");
                }
                setLoading(false);
                return;
            }

            try {
                const response = await fetch('/api/auth/getUser', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    dispatch(login(data.user));
                    localStorage.setItem("token", data.token);
                    router.push("/");
                } else {
                    dispatch(logout());
                    localStorage.removeItem("token");
                    router.push("/login");
                }
            } catch (error) {
                console.log(error);
                dispatch(logout());
                localStorage.removeItem("token");
                router.push("/login");
            } finally {
                setLoading(false);
            }
        };

        useEffect(() => {
            getUser();
        }, []);

        return (
            <>
                {
                    loading ? <div>Loading...</div> : children
                }
            </>
        );
    };

export default AuthProvider;
