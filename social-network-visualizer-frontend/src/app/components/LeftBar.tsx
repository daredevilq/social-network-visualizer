'use client';

import {useCallback, useState} from 'react';
import { useRouter } from "next/navigation";

const icons = [
    {
        id: 'home',
        default: 'home_icon.png',
        hover: 'clicked_home_icon.png',
        active: 'clicked_home_icon.png',
        alt: 'Home'
    },
    {
        id: 'graph',
        default: 'graph_icon.png',
        hover: 'clicked_graph_icon.png',
        active: 'clicked_graph_icon.png',
        alt: 'Graph'
    },
    {
        id: 'functions',
        default: 'functions_icon.png',
        hover: 'clicked_functions_icon.png',
        active: 'clicked_functions_icon.png',
        alt: 'List'
    },
    {
        id: 'filters',
        default: 'filters_icon.png',
        hover: 'clicked_filters_icon.png',
        active: 'clicked_filters_icon.png',
        alt: 'Menu'
    },
    {
        id: 'projects',
        default: 'projects_icon.png',
        hover: 'clicked_projects_icon.png',
        active: 'clicked_projects_icon.png',
        alt: 'Document'
    },
    {
        id: 'help',
        default: 'help_icon.png',
        hover: 'clicked_help_icon.png',
        active: 'clicked_help_icon.png',
        alt: 'Help'
    },
    {
        id: 'settings',
        default: 'settings_icon.png',
        hover: 'clicked_settings_icon.png',
        active: 'clicked_settings_icon.png',
        alt: 'Settings'
    },
];

interface LeftBarProps {
    setIsLeftSideBarOpen: (value: (((prevState: boolean) => boolean) | boolean)) => void;
    setSelectedLeftSideBarContent: (value: (((prevState: string) => string) | string)) => void;
}

export default function LeftBar({setIsLeftSideBarOpen, setSelectedLeftSideBarContent}: LeftBarProps) {
    const [activeIcon, setActiveIcon] = useState<string | null>(null);
    const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
    const router = useRouter();

    const handleIconClick = useCallback((id: string) => {
        if (id === "home") {
            router.push("/dashboard");
            return;
        }

        const isSame = activeIcon === id;
        if (!isSame) {
            setSelectedLeftSideBarContent(id);
        }
        setIsLeftSideBarOpen(!isSame);
        setActiveIcon(isSame ? null : id);
    }, [activeIcon, setIsLeftSideBarOpen, setSelectedLeftSideBarContent]);

    return (
        <div
            className="fixed top-0 left-0 h-screen w-[3vw] z-50 flex flex-col items-center"
            style={{backgroundColor: '#262626'}}
        >
            {icons.slice(0, 5).map((icon) => (
                <img
                    key={icon.id}
                    src={`/icons/leftBar/${
                        activeIcon === icon.id
                            ? icon.active
                            : hoveredIcon === icon.id
                                ? icon.hover
                                : icon.default
                    }`}
                    alt={icon.alt}
                    className="my-4 w-[80%] h-auto cursor-pointer transition-all duration-150"
                    onClick={() => handleIconClick(icon.id)}
                    onMouseEnter={() => setHoveredIcon(icon.id)}
                    onMouseLeave={() => setHoveredIcon(null)}
                />
            ))}

            <div className="flex-grow"></div>

            {icons.slice(5).map((icon) => (
                <img
                    key={icon.id}
                    src={`/icons/leftBar/${
                        activeIcon === icon.id
                            ? icon.active
                            : hoveredIcon === icon.id
                                ? icon.hover
                                : icon.default
                    }`}
                    alt={icon.alt}
                    className="my-4 w-[80%] h-auto cursor-pointer transition-all duration-150"
                    onClick={() => handleIconClick(icon.id)}
                    onMouseEnter={() => setHoveredIcon(icon.id)}
                    onMouseLeave={() => setHoveredIcon(null)}
                />
            ))}
        </div>
    );
}
