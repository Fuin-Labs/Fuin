"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface HeaderContextType {
    title: string | null;
    setTitle: (title: string | null) => void;
    subtitle: string | null;
    setSubtitle: (subtitle: string | null) => void;
    action: ReactNode | null;
    setAction: (action: ReactNode | null) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: ReactNode }) {
    const [title, setTitle] = useState<string | null>(null);
    const [subtitle, setSubtitle] = useState<string | null>(null);
    const [action, setAction] = useState<ReactNode | null>(null);

    return (
        <HeaderContext.Provider value={{ title, setTitle, subtitle, setSubtitle, action, setAction }}>
            {children}
        </HeaderContext.Provider>
    );
}

export function useHeader() {
    const context = useContext(HeaderContext);
    if (context === undefined) {
        throw new Error("useHeader must be used within a HeaderProvider");
    }
    return context;
}
