"use client";

import { useEffect, ReactNode } from "react";
import { useHeader } from "../_providers/HeaderProvider";

interface PageHeaderProps {
    title?: string | null;
    subtitle?: string | null;
    action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
    const { setTitle, setSubtitle, setAction } = useHeader();

    useEffect(() => {
        if (title !== undefined) setTitle(title);
        if (subtitle !== undefined) setSubtitle(subtitle);
        if (action !== undefined) setAction(action);

        return () => {
            if (title !== undefined) setTitle(null);
            if (subtitle !== undefined) setSubtitle(null);
            if (action !== undefined) setAction(null);
        };
    }, [title, subtitle, action, setTitle, setSubtitle, setAction]);

    return null;
}
