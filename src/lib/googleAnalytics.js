// Simple wrapper for Google Analytics (GA4)

const GA_MEASUREMENT_ID = process.env.GOOGLE_ANALYTICS_ID;
console.log(GA_MEASUREMENT_ID);

/**
 * Initialize GA (call once on app startup)
 */
export function initAnalytics() {
    // Load gtag script dynamically
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;

    gtag("js", new Date());
    gtag("config", GA_MEASUREMENT_ID);
}

/**
 * Track page views (works great for SPA route changes)
 */
export function trackPageView(path = window.location.pathname) {
    if (!window.gtag) return;

    window.gtag("config", GA_MEASUREMENT_ID, {
        page_path: path,
        page_title: document.title
    });
}

/**
 * Track user actions (clicks, form submits, etc.)
 */
export function gAnalyticsTrackEvent(eventName, params = {}) {
    if (!window.gtag) return;

    window.gtag("event", eventName, params);
}

/**
 * Optionally attach user ID after login
 */
export function setUserId(userId) {
    if (!window.gtag) return;

    window.gtag("set", {
        user_id: userId
    });
}
