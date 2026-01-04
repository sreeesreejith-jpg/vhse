(function () {
    /**
     * Capacitor Hardware Back Button Handler
     * Optimized for Nithara Apps to ensure Home Screen Exit behavior.
     */
    function setupBackButton() {
        const App = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;

        if (!App) {
            setTimeout(setupBackButton, 200);
            return;
        }

        // Clean up any old listeners
        if (App.removeAllListeners) {
            App.removeAllListeners();
        }

        App.addListener('backButton', function (data) {
            const path = window.location.pathname;
            const href = window.location.href;

            // Log for debugging (visible in Android Studio / Chrome Inspect)
            console.log("Back button pressed. Path:", path);

            // HOMEPAGE DETECTION
            // We consider it the home page if:
            // 1. It's the root path (/)
            // 2. It ends with index.html but DOES NOT contain any sub-app folder names
            // 3. It's explicitly the nithara root
            const subAppFolders = ['salary', 'pay-revision', 'dcrg', 'emi', 'sip', 'housing', 'calculator'];
            const isSubApp = subAppFolders.some(folder => path.includes('/' + folder + '/'));

            // If it's not a sub-app, it's likely the home page
            const isHomePage = !isSubApp;

            if (isHomePage) {
                // CASE: At Home Screen -> Exit/Minimize App
                console.log("On Home Page, exiting app...");
                try {
                    // Try minimize first for better UX, fallback to exit
                    if (App.minimizeApp) {
                        App.minimizeApp();
                    } else {
                        App.exitApp();
                    }
                } catch (e) {
                    // Native Fallbacks
                    if (navigator.app && navigator.app.exitApp) {
                        navigator.app.exitApp();
                    } else if (navigator.device && navigator.device.exitApp) {
                        navigator.device.exitApp();
                    }
                }
            } else {
                // CASE: Inside a Sub-App -> Navigate Back
                console.log("Inside Sub-App, navigating back...");
                // Check if we can go back in history
                if (window.history.length > 1) {
                    window.history.back();
                } else {
                    // If no history, force redirect to main index
                    window.location.href = '../index.html';
                }
            }
        });
    }

    // Initialize on load
    if (document.readyState === 'complete') {
        setupBackButton();
    } else {
        window.addEventListener('load', setupBackButton);
    }
})();
