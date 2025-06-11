const backendUrl = "http://localhost:3000";

// Check if user is authenticated via background script
async function isAuthenticated() {
    try {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage({ action: 'checkAuth' }, (response) => {
                resolve(response || false);
            });
        });
    } catch (err) {
        console.error("Auth check failed:", err);
        return false;
    }
}

// Function to send download request via background script
async function downloadMp3(url) {
    const result = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: 'download', url }, resolve);
    });

    if (!result.success) {
        showStatus("Error: " + (result.error || "An error occurred."), "error");
        return;
    }

    showStatus("Download completed: " + result.song.title, "success");
}

// Show status message
function showStatus(message, type = "success") {
    const statusEl = document.getElementById("status-message");
    statusEl.textContent = message;
    statusEl.className = `status ${type}`;
    statusEl.style.display = "block";

    // Hide after 5 seconds
    setTimeout(() => {
        statusEl.style.display = "none";
    }, 5000);
}

// Handle download button click
document.getElementById("download").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = tab.url;

    if (!url.includes("youtube.com/watch")) {
        showStatus("You must be on a YouTube video page!", "error");
        return;
    }

    const loggedIn = await isAuthenticated();

    if (!loggedIn) {
        const username = prompt("Username:");
        const password = prompt("Password:");

        if (!username || !password) {
            showStatus("Credentials required!", "error");
            return;
        }

        try {
            const result = await new Promise((resolve) => {
                chrome.runtime.sendMessage({
                    action: 'login',
                    username,
                    password
                }, resolve);
            });

            if (!result.success) {
                showStatus("Login failed: " + (result.error || "Error"), "error");
                return;
            }

            showStatus("Successfully logged in!", "success");
        } catch (err) {
            console.error("Login error:", err);
            showStatus("Connection error during login", "error");
            return;
        }
    }

    // If logged in, proceed with download
    await downloadMp3(url);
});

// Handle status check button
document.getElementById("status").addEventListener("click", async () => {
    const loggedIn = await isAuthenticated();

    if (loggedIn) {
        showStatus("You are logged in and ready to download!", "success");
    } else {
        showStatus("Not logged in. Click 'Download Current' to login.", "error");
    }
});

// Check initial status when popup opens
document.addEventListener("DOMContentLoaded", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = tab.url;

    if (url.includes("youtube.com/watch")) {
        const loggedIn = await isAuthenticated();
        if (loggedIn) {
            showStatus("Ready to download from this YouTube video!", "success");
        }
    } else {
        showStatus("Navigate to a YouTube video to use this extension", "error");
    }
});