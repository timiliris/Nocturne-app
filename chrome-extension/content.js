const backendUrl = "http://localhost:3000";

// Check if user is authenticated via background script
async function isAuthenticated() {
    try {
        // First, try to get from extension storage (faster)
        const stored = await chrome.storage.local.get(['isAuthenticated', 'lastCheck']);

        // If we have recent data (less than 5 minutes old), use it
        if (stored.lastCheck && Date.now() - stored.lastCheck < 5 * 60 * 1000) {
            return stored.isAuthenticated || false;
        }

        // Otherwise, check via background script
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
    const button = document.getElementById("nocturne-download-btn");
    const originalText = button.textContent;

    try {
        button.textContent = "Downloading...";
        button.disabled = true;

        const result = await new Promise((resolve) => {
            chrome.runtime.sendMessage({ action: 'download', url }, resolve);
        });

        if (!result.success) {
            showNotification("Error: " + (result.error || "An error occurred."), "error");
            return;
        }

        showNotification("Download completed: " + result.song.title, "success");
    } catch (err) {
        console.error("Download error:", err);
        showNotification("Download failed: Network error", "error");
    } finally {
        button.textContent = originalText;
        button.disabled = false;
    }
}

// Show notification
function showNotification(message, type = "info") {
    // Remove existing notification
    const existing = document.getElementById("nocturne-notification");
    if (existing) existing.remove();

    const notification = document.createElement("div");
    notification.id = "nocturne-notification";
    notification.className = `nocturne-notification nocturne-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Handle login via background script
async function handleLogin() {
    const username = prompt("Username:");
    const password = prompt("Password:");

    if (!username || !password) {
        showNotification("Credentials required!", "error");
        return false;
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
            showNotification("Login failed: " + (result.error || "Error"), "error");
            return false;
        }

        showNotification("Successfully logged in!", "success");
        return true;
    } catch (err) {
        console.error("Login error:", err);
        showNotification("Login error: Network issue", "error");
        return false;
    }
}

// Create download button
function createDownloadButton() {
    const button = document.createElement("button");
    button.id = "nocturne-download-btn";
    button.className = "nocturne-download-button";
    button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 16l-6-6h4V4h4v6h4l-6 6zm6 4H6v2h12v-2z"/>
        </svg>
        ADD TO NOCTURNE
    `;

    button.addEventListener("click", async () => {
        const url = window.location.href;

        if (!url.includes("youtube.com/watch")) {
            showNotification("You must be on a YouTube video!", "error");
            return;
        }

        const loggedIn = await isAuthenticated();

        if (!loggedIn) {
            const loginSuccess = await handleLogin();
            if (!loginSuccess) return;
        }

        await downloadMp3(url);
    });

    return button;
}

// Find the best place to insert the button
function insertDownloadButton() {
    // Supprimer l'ancien bouton si présent
    const existing = document.getElementById("nocturne-download-btn");
    if (existing) existing.remove();

    const player = document.getElementById("movie_player");
    if (!player) return;

    // Créer le bouton
    const button = createDownloadButton();
    button.id = "nocturne-download-btn";

    // Appliquer les styles de base
    Object.assign(button.style, {
        position: "absolute",
        top: "12px",
        right: "12px",
        zIndex: "9999",
        padding: "6px 10px",
        borderRadius: "6px",
        background: "rgba(198,160,246,0.7)",
        color: "#24273a",
        fontWeight: "bold",
        fontSize: "13px",
        border: "none",
        cursor: "pointer",
        opacity: "0",
        transition: "opacity 0.3s ease",
        pointerEvents: "none", // important pour ne pas gêner les contrôles quand caché
    });

    // Ajouter le bouton au lecteur
    player.appendChild(button);

    // Créer ou injecter le style pour rendre visible le bouton au hover
    const styleId = "nocturne-download-style";
    if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = `
            #movie_player:hover #nocturne-download-btn {
                opacity: 1 !important;
                pointer-events: auto !important;
            }
        `;
        document.head.appendChild(style);
    }
}


// Initialize the extension
function init() {
    // Only run on video pages
    if (!window.location.href.includes("/watch")) return;

    // Wait a bit for YouTube to load
    setTimeout(() => {
        insertDownloadButton();
    }, 2000);
}

// Handle YouTube's dynamic navigation
let currentUrl = window.location.href;

function checkForUrlChange() {
    if (currentUrl !== window.location.href) {
        currentUrl = window.location.href;
        setTimeout(init, 1000); // Re-initialize when URL changes
    }
}

// Monitor for navigation changes
setInterval(checkForUrlChange, 1000);

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Also listen for YouTube's navigation events
window.addEventListener('yt-navigate-finish', init);
window.addEventListener('yt-page-data-updated', init);