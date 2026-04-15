// Simple wrapper for Google Analytics (GA4)

const GA_MEASUREMENT_ID = (process.env as any).GOOGLE_ANALYTICS_ID;
const isDev = (process.env as any).NODE_ENV === 'development' || (typeof window !== 'undefined' && window.location.hostname.startsWith('dev.'));

declare global {
    interface Window {
        dataLayer: any[];
        gtag: (...args: any[]) => void;
    }
}

/**
 * Initialize GA (call once on app startup)
 */
export function initAnalytics(): void {
    if (isDev) {
        console.log("Analytics initialization skipped (Development Mode)");
        return;
    }
    // Load gtag script dynamically
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag as any;

    // @ts-ignore
    gtag("js", new Date());
    // @ts-ignore
    gtag("config", GA_MEASUREMENT_ID);
}

/**
 * Track page views (works great for SPA route changes)
 */
export function trackPageView(path: string = window.location.pathname): void {
    if (isDev || !window.gtag) return;

    window.gtag("config", GA_MEASUREMENT_ID, {
        page_path: path,
        page_title: document.title
    });
}

/**
 * Track user actions (clicks, form submits, etc.)
 */
export function gAnalyticsTrackEvent(eventName: string, params: object = {}): void {
    if (isDev || !window.gtag) return;

    window.gtag("event", eventName, params);
}

/**
 * Optionally attach user ID after login
 */
export function setUserId(userId: string): void {
    if (isDev || !window.gtag) return;

    window.gtag("set", {
        user_id: userId
    });
}
