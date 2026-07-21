import { type RefObject, useEffect, useState } from "react"


/**
 * hook para detectar breakpoints
 * @param query min-width: px; max-width: px
 * @returns true si el breakpoint se cumple
 */
export const useBreakpoint = (query: string): boolean => {
    const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

    useEffect(() => {
        const mediaQuery = window.matchMedia(query)
        const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
        mediaQuery.addEventListener('change', handler)
        return () => mediaQuery.removeEventListener('change', handler)
    }, [query])

    return matches
}

// Tailwind CSS default breakpoints
const screens = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
};

/**
 * Hook para detectar breakpoints de Tailwind CSS
 * @returns un objeto con booleanos de los breakpoints detectados (sm, md, lg, xl, 2xl).
 */
export const useTwBreakpoint = () => {
    const [matches, setMatches] = useState({
        sm: window.matchMedia(`(min-width: ${screens.sm})`).matches,
        md: window.matchMedia(`(min-width: ${screens.md})`).matches,
        lg: window.matchMedia(`(min-width: ${screens.lg})`).matches,
        xl: window.matchMedia(`(min-width: ${screens.xl})`).matches,
        '2xl': window.matchMedia(`(min-width: ${screens['2xl']})`).matches,
    });

    useEffect(() => {
        const mediaQueries = {
            sm: window.matchMedia(`(min-width: ${screens.sm})`),
            md: window.matchMedia(`(min-width: ${screens.md})`),
            lg: window.matchMedia(`(min-width: ${screens.lg})`),
            xl: window.matchMedia(`(min-width: ${screens.xl})`),
            '2xl': window.matchMedia(`(min-width: ${screens['2xl']})`),
        };

        const handler = () => {
            setMatches({
                sm: mediaQueries.sm.matches,
                md: mediaQueries.md.matches,
                lg: mediaQueries.lg.matches,
                xl: mediaQueries.xl.matches,
                '2xl': mediaQueries['2xl'].matches,
            });
        };

        Object.values(mediaQueries).forEach(mq => mq.addEventListener('change', handler));

        return () => {
            Object.values(mediaQueries).forEach(mq => mq.removeEventListener('change', handler));
        };
    }, []);

    return matches;
};

export function useIsVisible<T extends Element>(ref: RefObject<T>, options?: IntersectionObserverInit): boolean {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry])=>{
                setIsVisible(entry.isIntersecting);
            },
            options
        )
        observer.observe(element);
        return () => {
            observer.unobserve(element);
            observer.disconnect();
        };
    }, [ref, options]);

    return isVisible;
}