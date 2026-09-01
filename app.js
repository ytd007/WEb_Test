/* ==========================================================================
   DualLink Hub & Generator - Core Application Script (Mobile Optimized)
   ========================================================================== */

// GitHub Pages වලදී URL එකේ .html කොටස ඉවත් කර පිරිසිදු URL එකක් පෙන්වීමට:
(function cleanURL() {
    try {
        if (window.location.pathname.endsWith('.html')) {
            let cleanPath = window.location.pathname.replace(/\.html$/, '');
            if (cleanPath.endsWith('/index')) {
                cleanPath = cleanPath.substring(0, cleanPath.lastIndexOf('/index') + 1);
            }
            window.history.replaceState(null, '', cleanPath + window.location.search + window.location.hash);
        }
    } catch (e) {
        console.error('cleanURL error:', e);
    }
})();

// Relative Links නිවැරදිව Resolve වීමට Dynamic <base> tag එකක් සෑදීම:
(function setDynamicBaseURL() {
    try {
        let baseEl = document.querySelector('base');
        if (!baseEl) {
            baseEl = document.createElement('base');
            document.head.prepend(baseEl);
        }
        let path = window.location.pathname;
        let dir = path.substring(0, path.lastIndexOf('/') + 1);
        if (!dir) dir = '/';
        baseEl.href = window.location.origin + dir;
    } catch (e) {
        console.error('setDynamicBaseURL error:', e);
    }
})();

/**
 * ප්‍රධාන Function එක (Mobile Optimized): Adsterra Popup Links 4ක් සහ Main Destination Link එක එකවර Open කිරීම.
 * @param {Array|String} adLinks - Adsterra Ad URLs 4
 * @param {String} targetUrl - Main Destination URL එක
 */
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

    // Ads 4කට වඩා අඩුනම් Primary ad එක නැවත යොදාගනිමින් Ad Links 4ක් සාදයි
    const primaryAd = ads[0] || targetUrl;
    while (ads.length < 4) {
        ads.push(primaryAd);
    }

    // Ad Links 4 සහ Main Target URL එක එකතු කරයි
    const allUrls = [...ads, targetUrl].filter(u => u && u.trim() !== '');

    let blockedCount = 0;
    
    // Mobile browsers වල Popup blockers දැඩි වන බැවින් පරතරය තවත් සුදුසු පරිදි (මිලිසෙකන්ඩ් 200ක් ලෙස) සකස් කර ඇත
    allUrls.forEach((url, idx) => {
        setTimeout(() => {
            let win = window.open(url, '_blank');
            if (!win || win.closed || typeof win.closed === 'undefined') {
                blockedCount++;
            }
        }, idx * 200);
    });

    // Browser Popup Blocker එක සක්‍රීය නම් පරිශීලකයාට Mobile Friendly Alert එකක් පෙන්වයි
    setTimeout(() => {
        if (blockedCount > 0) {
            alert("🚫 ඔබගේ ජංගම දුරකථන බ්‍රව්සරයේ (Mobile Browser) Popup-blocker සක්‍රීය වී ඇත. කරුණාකර බ්‍රව්සර් සැකසුම් වෙත ගොස් Popups සඳහා ඉඩ ලබා දෙන්න (Allow Popups).");
        }
    }, (allUrls.length + 1) * 200);
}

// පැරණි Code සමඟ Compatibility එක තබා ගැනීමට Wrapper Function එකක්
function openTwoLinks(adUrl, targetUrl) {
    openFourAdsterraLinks([adUrl], targetUrl);
}

// URL Encoder: Portal එකක සියලු විස්තර Base64 කේතයක් බවට පත් කරයි (Universal Sharing)
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

// URL Decoder: Base64 String එකක් නැවත Object එකක් බවට පත් කරයි
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

// ඕනෑම අයෙකුට Share කළ හැකි සම්පූර්ණ Web URL එක සෑදීම
function getShareableURL(item) {
    const dir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
    const origin = window.location.origin + dir;
    const dataStr = encodeItemToURL(item);
    return `${origin}view.html?id=${item.id || 'page'}&data=${dataStr}`;
}

// Standalone HTML Code Generator (Mobile Responsive ලෙස සකස් කර ඇත)
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
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>${escapeHTML(pageTitle)}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #0b0f19;
            background-image: radial-gradient(circle at center, #1e293b 0%, #0b0f19 100%);
            font-family: 'Outfit', sans-serif;
            color: #ffffff;
            padding: 1rem;
        }
        .card {
            background: rgba(30, 41, 59, 0.75);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 2.5rem 1.5rem;
            border-radius: 20px;
            text-align: center;
            max-width: 440px;
            width: 100%;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        }
        h2 { font-size: 1.5rem; margin-bottom: 0.75rem; word-break: break-word; }
        p { color: #94a3b8; font-size: 0.9rem; margin-bottom: 1.75rem; line-height: 1.5; }
        button {
            padding: 16px 24px;
            font-size: 1.05rem;
            font-weight: 700;
            cursor: pointer;
            border: none;
            border-radius: 12px;
            background: ${color.bg};
            color: white;
            transition: transform 0.1s ease, background 0.2s ease;
            box-shadow: 0 4px 20px ${color.bg}66;
            width: 100%;
            touch-action: manipulation;
        }
        button:active {
            transform: scale(0.97);
            background: ${color.hover};
        }
    </style>
</head>
<body>

<div class="card">
    <h2>${escapeHTML(pageTitle)}</h2>
    <p>Click the button below to open destination and sponsor ads.</p>
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
            }, idx * 200);
        });

        setTimeout(() => {
            if (blockedCount > 0) {
                alert("🚫 Popup blocker detected. Please allow popups for this site in your browser settings.");
            }
        }, (allUrls.length + 1) * 200);
    }

    document.getElementById('actionBtn').addEventListener('click', function() {
        let adLinks = ${JSON.stringify(adsArray)};
        let mainLink = "${mainLink}";
        openFourAdsterraLinks(adLinks, mainLink);
    });
<\/script>

</body>
</html>`;
}

// Security: HTML Characters escape කර XSS Attacks වැළැක්වීමේ Helper Function එක
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// Database Helpers
function getStoredLinks() {
    if (window.DB) {
        return DB.links.getAll();
    }
    return [];
}

// Screen එක මත Toast Notifications පෙන්වීම (Mobile Friendly Placement සමඟ)
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