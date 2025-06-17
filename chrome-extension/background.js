// Background script to handle authentication state synchronization
const backendUrl = "https://nocturne-api.3de-scs.be";

// Check auth status and store in extension storage
async function updateAuthStatus() {
    try {
        const response = await fetch(`${backendUrl}/auth/status`, {
            credentials: 'include',
            mode: 'cors'
        });
        const data = await response.json();

        // Store auth status in extension storage
        await chrome.storage.local.set({
            isAuthenticated: data.authenticated,
            user: data.user || null,
            lastCheck: Date.now()
        });

        return data.authenticated;
    } catch (error) {
        console.error('Auth check failed:', error);
        await chrome.storage.local.set({
            isAuthenticated: false,
            user: null,
            lastCheck: Date.now()
        });
        return false;
    }
}

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'checkAuth') {
        updateAuthStatus().then(sendResponse);
        return true; // Will respond asynchronously
    }

    if (request.action === 'login') {
        handleLogin(request.username, request.password).then(sendResponse);
        return true;
    }

    if (request.action === 'download') {
        handleDownload(request.url).then(sendResponse);
        return true;
    }
});

// Handle login request
async function handleLogin(username, password) {
    try {
        const response = await fetch(`${backendUrl}/auth`, {
            method: 'POST',
            credentials: 'include',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            await updateAuthStatus(); // Update stored auth status
            return { success: true, message: 'Login successful' };
        } else {
            return { success: false, error: data.error || 'Login failed' };
        }
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Network error during login' };
    }
}

// Handle download request
async function handleDownload(url) {
    try {
        const response = await fetch(`${backendUrl}/api/download`, {
            method: 'POST',
            credentials: 'include',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });

        const data = await response.json();

        if (response.ok) {
            return { success: true, song: data.song };
        } else {
            return { success: false, error: data.error || 'Download failed' };
        }
    } catch (error) {
        console.error('Download error:', error);
        return { success: false, error: 'Network error during download' };
    }
}

// Check auth status periodically
setInterval(updateAuthStatus, 5 * 60 * 1000); // Every 5 minutes

// Initial auth check
updateAuthStatus();