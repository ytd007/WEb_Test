/* ==========================================================================
   DualLink Hub & Generator - Core Application Script
   ========================================================================== */

// GitHub Pages compatible URL helper
(function cleanURL() {
    // Disabled replaceState to preserve exact relative path navigation on GitHub Pages and static hosts
})();

// Open 4 Adsterra popup ad links + 1 Main Destination link
function openFourAdsterraLinks(adLinks, targetUrl) {
    let ads = [];
    if (Array.isArray(adLinks)) {
        ads = adLinks.filter(u => u && u.trim() !== '');
    } else if (typeof adLinks === 'string' && adLinks.trim() !== '') {
        ads = [adLinks];
    }

    if (ads.length === 0 && (!targetUrl || targetUrl.trim() === '')) {
        alert("⚠️ Invalid URLs provided.");
        return;
    }

    // Ensure 4 Adsterra links are present (reuse primary ad link if fewer than 4 distinct links provided)
    const primaryAd = ads[0] || targetUrl;
    while (ads.length < 4) {
        ads.push(primaryAd);
    }

    const allUrls = [...ads, targetUrl].filter(u => u && u.trim() !== '');

    let blockedCount = 0;
    allUrls.forEach((url, idx) => {
        setTimeout(() => {
            let win = window.open(url, '_blank');
            if (!win || win.closed || typeof win.closed === 'undefined') {
                blockedCount++;
            }
        }, idx * 120);
    });

    setTimeout(() => {
        if (blockedCount > 0) {
            alert("🚫 ඔබගේ බ්‍රව්සරයේ Popup-blocker සක්‍රීය වී ඇති නිසා Adsterra Popups 4 එකවර විවෘත නොවනු ඇත. කරුණාකර Popup-blocker අක්‍රිය (Allow Popups) කරන්න.\n\n(Popup blocker detected. Please allow popups for this site to open all 4 Adsterra popup ads.)");
        }
    }, (allUrls.length + 1) * 120);
}

// Backward compatibility wrapper
function openTwoLinks(adUrl, targetUrl) {
    openFourAdsterraLinks([adUrl], targetUrl);
}

// URL Encoder & Decoder for universal shareable web pages (works for all users on all devices)
function encodeItemToURL(item) {
    try {
        const jsonStr = JSON.stringify({
            t: item.title || '',
            b: item.btnText || '',
            a1: item.adLink1 || item.adLink || '',
            a2: item.adLink2 || '',
            a3: item.adLink3 || '',
            a4: item.adLink4 || '',
            m: item.mainLink || '',
            c: item.theme || 'crimson'
        });
        return encodeURIComponent(btoa(unescape(encodeURIComponent(jsonStr))));
    } catch (e) {
        return '';
    }
}

function decodeItemFromURL(param) {
    if (!param) return null;
    try {
        const jsonStr = decodeURIComponent(escape(atob(decodeURIComponent(param))));
        const obj = JSON.parse(jsonStr);
        if (obj && (obj.a1 || obj.a) && obj.m) {
            const ad1 = obj.a1 || obj.a;
            return {
                title: obj.t || 'Direct Link Portal',
                btnText: obj.b || 'Go Video',
                adLink1: ad1,
                adLink2: obj.a2 || ad1,
                adLink3: obj.a3 || ad1,
                adLink4: obj.a4 || ad1,
                adLink: ad1,
                mainLink: obj.m,
                theme: obj.c || 'crimson'
            };
        }
    } catch (e) {
        console.error('Error decoding item from URL:', e);
    }
    return null;
}

function getShareableURL(item) {
    const dir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
    const origin = window.location.origin + dir;
    const dataStr = encodeItemToURL(item);
    return `${origin}view.html?id=${item.id || 'page'}&data=${dataStr}`;
}

// Generate standalone HTML template code like new.html
function generateStandaloneHTMLCode(pageTitle, btnText, adLinks, mainLink, btnTheme = 'crimson') {
    let adsArray = [];
    if (Array.isArray(adLinks)) {
        adsArray = adLinks.filter(u => u && u.trim() !== '');
    } else if (typeof adLinks === 'string' && adLinks.trim() !== '') {
        adsArray = [adLinks];
    }
    
    const themeColors = {
        crimson: { bg: '#ef4444', hover: '#dc2626' },
        indigo: { bg: '#6366f1', hover: '#4f46e5' },
        cyan: { bg: '#06b6d4', hover: '#0891b2' },
        emerald: { bg: '#10b981', hover: '#059669' }
    };
    const color = themeColors[btnTheme] || themeColors.crimson;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHTML(pageTitle)}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #0b0f19;
            background-image: radial-gradient(circle at center, #1e293b 0%, #0b0f19 100%);
            font-family: 'Outfit', sans-serif;
            color: #ffffff;
        }
        .card {
            background: rgba(30, 41, 59, 0.7);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 3rem 2rem;
            border-radius: 24px;
            text-align: center;
            max-width: 440px;
            width: 90%;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        }
        h2 { font-size: 1.8rem; margin-bottom: 0.5rem; }
        p { color: #94a3b8; font-size: 0.95rem; margin-bottom: 2rem; }
        button {
            padding: 16px 36px;
            font-size: 1.1rem;
            font-weight: 700;
            cursor: pointer;
            border: none;
            border-radius: 12px;
            background: ${color.bg};
            color: white;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 20px ${color.bg}66;
            width: 100%;
        }
        button:hover {
            background: ${color.hover};
            transform: translateY(-2px);
            box-shadow: 0 6px 25px ${color.bg}aa;
        }
    </style>
</head>
<body>

<div class="card">
    <h2>${escapeHTML(pageTitle)}</h2>
    <p>Click the button below to open destination and 4 Adsterra sponsor ads.</p>
    <button id="actionBtn">${escapeHTML(btnText)}</button>
</div>

<script>
    function openFourAdsterraLinks(adLinks, targetUrl) {
        let ads = Array.isArray(adLinks) ? adLinks.filter(u => u && u.trim() !== '') : [adLinks];
        const primaryAd = ads[0] || targetUrl;
        while (ads.length < 4) { ads.push(primaryAd); }
        const allUrls = [...ads, targetUrl].filter(u => u && u.trim() !== '');

        let blockedCount = 0;
        allUrls.forEach((url, idx) => {
            setTimeout(() => {
                let win = window.open(url, '_blank');
                if (!win || win.closed || typeof win.closed === 'undefined') { blockedCount++; }
            }, idx * 120);
        });

        setTimeout(() => {
            if (blockedCount > 0) {
                alert("🚫 Popup blocker detected. Please allow popups for this site to open all 4 Adsterra ad links.");
            }
        }, (allUrls.length + 1) * 120);
    }

    document.getElementById('actionBtn').addEventListener('click', function() {
        let adLinks = ${JSON.stringify(adsArray)};
        let mainLink = "${mainLink}";
        openFourAdsterraLinks(adLinks, mainLink);
    });
</script>

</body>
</html>`;
}

// Utility HTML escaper
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// Database Helpers (Wrapper for DB instance in db.js)
function getStoredLinks() {
    if (window.DB) {
        return DB.links.getAll();
    }
    return [];
}

// Toast notification trigger
function showToast(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.innerHTML = `<span>✨ ${escapeHTML(message)}</span>`;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
