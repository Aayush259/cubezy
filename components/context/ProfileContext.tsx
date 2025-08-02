"use client"
import { IProfile } from "@/lib/interfaces"
import { useSelector } from "react-redux"
import { RootState } from "@/lib/store/store"
import { createContext, useContext, useMemo, useState } from "react"

interface IProfileContext {
    isProfileOpen: boolean
    setIsProfileOpen: (isOpen: boolean) => void
    profileId: string | null
    setProfileId: (id: string) => void
    openProfile: (id: string) => void
    profileInfo: IProfile | null
    closeProfile: () => void
}

const ProfileContext = createContext<IProfileContext | null>(null)

const ProfileContextProvider = ({ children }: { children: React.ReactNode }) => {
    // User state from store.
    const { user } = useSelector((state: RootState) => state.user)

    const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false)     // Whether the profile is open or not.
    const [profileId, setProfileId] = useState<string | null>(null)    // The id of the profile to be opened.

    const profileInfo = useMemo(() => {
        if (!profileId) return null
        if (profileId === user?._id) {
            return {
                _id: user._id,
                bio: user.bio,
                dp: user.dp,
                name: user.name,
                connections: user.connections,
                email: user.email,
                createdAt: user.createdAt,
            }
        } else {
            const profile = user?.connections.find(connection => connection.userId._id === profileId)
            console.log("profile", profile)
            if (!profile) return null
            return {
                _id: profile.userId._id,
                bio: profile.userId.bio,
                dp: profile.userId.dp,
                name: profile.userId.name,
                email: profile.userId.email,
                createdAt: profile.userId.createdAt,
            }
        }
    }, [profileId, user])

    // Function to open the profile.
    const openProfile = (id: string) => {
        setProfileId(id)
        setIsProfileOpen(true)
    }

    // Function to close the profile.
    const closeProfile = () => {
        setIsProfileOpen(false)
    }

    return (
        <ProfileContext.Provider value={{ isProfileOpen, setIsProfileOpen, profileId, setProfileId, openProfile, profileInfo, closeProfile }}>
            {children}
        </ProfileContext.Provider>
    )
}

const useProfileContext = () => {
    const context = useContext(ProfileContext)
    if (!context) {
        throw new Error("useProfileContext must be used within a ProfileContextProvider")
    }
    return context
}

export { ProfileContextProvider, useProfileContext }