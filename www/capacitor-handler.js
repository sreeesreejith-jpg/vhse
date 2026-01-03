(function () {
    // Listen for the native back button event
    document.addEventListener('backbutton', function (e) {
        e.preventDefault();
        handleBack();
    }, false);

    async function handleBack() {
        // If we are on the main portal page
        const isHomePage = window.location.pathname.endsWith('index.html') &&
            !window.location.pathname.includes('/salary/') &&
            !window.location.pathname.includes('/emi/') &&
            !window.location.pathname.includes('/pay-revision/') &&
            !window.location.pathname.includes('/dcrg/') &&
            !window.location.pathname.includes('/housing/') &&
            !window.location.pathname.includes('/sip/') &&
            !window.location.pathname.includes('/calculator/');

        const path = window.location.pathname;
        const isRoot = path === '/' || path.endsWith('/index.html') && !(path.split('/').length > 3);

        // Simple check: if we can go back in browser history, do it
        if (window.history.length > 1) {
            window.history.back();
        } else {
            // If no history, and we are not on root, go to root
            if (!isRoot) {
                window.location.href = '../index.html';
            } else {
                // If on root and no history, try to exit app if Capacitor is available
                if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
                    window.Capacitor.Plugins.App.exitApp();
                }
            }
        }
    }

    // Capacitor App Plugin Listener
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
        const App = window.Capacitor.Plugins.App;
        App.addListener('backButton', ({ canGoBack }) => {
            if (canGoBack) {
                window.history.back();
            } else {
                // If we are in a sub-directory, go to root index.html
                const currentPath = window.location.pathname;
                if (currentPath.includes('/salary/') ||
                    currentPath.includes('/emi/') ||
                    currentPath.includes('/pay-revision/') ||
                    currentPath.includes('/dcrg/') ||
                    currentPath.includes('/housing/') ||
                    currentPath.includes('/sip/') ||
                    currentPath.includes('/calculator/')) {
                    window.location.href = '../index.html';
                } else {
                    App.exitApp();
                }
            }
        });
    }
})();
