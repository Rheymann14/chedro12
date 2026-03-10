import { useCallback, useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

const prefersDark = () => {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const applyTheme = (appearance: Appearance) => {
    // Force light mode - ignore all dark mode preferences
    const isDark = false; // Always false to force light mode

    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = 'light'; // Always light
};

const mediaQuery = () => {
    if (typeof window === 'undefined') {
        return null;
    }

    return window.matchMedia('(prefers-color-scheme: dark)');
};

const handleSystemThemeChange = () => {
    const currentAppearance = localStorage.getItem('appearance') as Appearance;
    applyTheme(currentAppearance || 'system');
};

export function initializeTheme() {
    // Force light mode - ignore saved preferences and system settings
    applyTheme('light');

    // Remove system theme change listener since we're forcing light mode
    // mediaQuery()?.addEventListener('change', handleSystemThemeChange);
}

export function useAppearance() {
    const [appearance, setAppearance] = useState<Appearance>('light');

    const updateAppearance = useCallback((mode: Appearance) => {
        // Force light mode regardless of what the user tries to set
        setAppearance('light');

        // Store light mode in localStorage
        localStorage.setItem('appearance', 'light');

        // Store light mode in cookie for SSR
        setCookie('appearance', 'light');

        // Always apply light theme
        applyTheme('light');
    }, []);

    useEffect(() => {
        // Always set to light mode on mount
        updateAppearance('light');

        // No need to clean up listeners since we're not using them
        // return () => mediaQuery()?.removeEventListener('change', handleSystemThemeChange);
    }, [updateAppearance]);

    return { appearance: 'light', updateAppearance } as const;
}
