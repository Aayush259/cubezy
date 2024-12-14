"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { IProfileInfo } from "../../utils/interfaces/interfaces";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useToast } from "./ToastContext";

const ProfileContext = createContext<{
    isProfileOpen: boolean;
    setIsProfileOpen: (isOpen: boolean) => void;
    profileId: string | null;
    setProfileId: (id: string) => void;
    isLoading: boolean;
    openProfile: (id: string) => void;
    profileInfo: IProfileInfo | null;
    closeProfile: () => void;
}>({
    isProfileOpen: false,
    setIsProfileOpen: () => { },
    profileId: null,
    setProfileId: () => { },
    isLoading: true,
    openProfile: () => { },
    profileInfo: null,
    closeProfile: () => { },
})

const ProfileContextProvider = ({ children }: { children: React.ReactNode }) => {

    // User state from store.
    const { user } = useSelector((state: RootState) => state.user);

    const { addToast } = useToast();

    const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);     // Whether the profile is open or not.
    const [profileId, setProfileId] = useState<string | null>(null);    // The id of the profile to be opened.
    const [isLoading, setIsLoading] = useState<boolean>(true);      // Whether the profile is loading or not.
    const [profileInfo, setProfileInfo] = useState<IProfileInfo | null>(null);     // The profile info to be displayed.

    // Function to fetch the profile info.
    const fetchProfileInfo = async (id: string) => {
        setIsLoading(true);
        if (!id) {
            return;
        };

        // Getting token from local storage.
        const token = localStorage.getItem("token");

        const res = await fetch(`/api/auth/getProfileInfo?id=${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });
        const data = await res.json();
        if (data.message) {
            addToast("Something went wrong", false);
            return;
        }
        setProfileInfo(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchProfileInfo(profileId as string);
    }, [profileId]);

    useEffect(() => {
        if (user && profileInfo?._id === user._id) {
            setProfileInfo({
                ...profileInfo,
                dp: user.dp,
            });
        }
    }, [user]);

    // Function to open the profile.
    const openProfile = (id: string) => {
        console.log(id);
        setProfileId(id);
        setIsProfileOpen(true);
    };

    // Function to close the profile.
    const closeProfile = () => {
        setIsProfileOpen(false);
    };

    return (
        <ProfileContext.Provider value={{ isProfileOpen, setIsProfileOpen, profileId, setProfileId, isLoading, openProfile, profileInfo, closeProfile }}>
            {children}
        </ProfileContext.Provider>
    )
}

const useProfileContext = () => useContext(ProfileContext);

export { ProfileContextProvider, useProfileContext };

