module.exports = {
    browsers: ['chromium'],
    launchOptions: {
        headless: process.env.HEADLESS !== 'false',
        slowMo: process.env.HEADLESS === 'false' ? 100 : 0, // Slow down interactions only when NOT headless
    },
    contextOptions: {
        viewport: {
            width: 1280,
            height: 720,
        },
    },
    serverOptions: {
        command: 'npm run dev',
        port: 3000,
        launchTimeout: 30000,
        usedPortAction: 'ignore', // Use the existing server if it's already running
    },
}
