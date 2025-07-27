"use client"
import { createContext, useContext, useState } from "react"

interface IIdBarContext {
    idBarOpen: boolean
    setIdBarOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const IdBarContext = createContext<IIdBarContext | null>(null)

const IdBarContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [idBarOpen, setIdBarOpen] = useState<boolean>(false)     // State to control the visibility of the ID bar.

    return (
        <IdBarContext.Provider value={{ idBarOpen, setIdBarOpen }}>
            {children}
        </IdBarContext.Provider>
    )
}

const useIdBarContext = () => {
    const context = useContext(IdBarContext)
    if (!context) {
        throw new Error("useIdBarContext must be used within a IdBarContextProvider")
    }
    return context
}

export { IdBarContextProvider, useIdBarContext }