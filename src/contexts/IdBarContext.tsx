"use client";
import { createContext, useContext, useState } from "react";

const IdBarContext = createContext<{ idBarOpen: boolean; setIdBarOpen: React.Dispatch<React.SetStateAction<boolean>> }>({
    idBarOpen: false,
    setIdBarOpen: () => {}
});

const IdBarContextProvider = ({ children }: { children: React.ReactNode }) => {

    const [idBarOpen, setIdBarOpen] = useState<boolean>(false);     // State to control the visibility of the ID bar.

    return (
        <IdBarContext.Provider value={{ idBarOpen, setIdBarOpen }}>
            {children}
        </IdBarContext.Provider>
    )
}

const useIdBarContext = () => useContext(IdBarContext);

export { IdBarContextProvider, useIdBarContext };
