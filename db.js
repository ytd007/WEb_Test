/* ==========================================================================
   DualLink Hub & Generator - Database & Authentication Module (db.js)
   ========================================================================== */

const DB_KEY = 'duallink_database_v2';
const SESSION_KEY = 'duallink_session_v2';

// Default Database Seed
const DEFAULT_DB = {
    settings: {
        siteName: 'DualLink Hub',
        version: '2.0.0',
        telegramBotToken: '789654123:AAExampleTokenForTelegramBotAPI' // Default template token
    },
    users: [
        {
            id: 'usr-admin-1',
            name: 'System Admin',
            telegram: '@admin',
            username: 'admin',
            password: '123',
            verified: true,
            role: 'superadmin',
            createdAt: new Date().toISOString()
        }
    ],
    links: [
        {
            id: 'link-default-1',
            title: 'FitGirl Repacks - Direct',
            btnText: 'Go Video',
            adLink: 'https://www.profitableratecpmnetwork.com/czrmue86hu?key=d557ae6027ae3964917e57058fc35af0',
            mainLink: 'https://fitgirl-repacks.site',
            theme: 'crimson',
            createdAt: new Date().toLocaleDateString()
        }
    ]
};

class DatabaseManager {
    constructor() {
        this.init();
    }

    // Initialize database in localStorage
    init() {
        if (!localStorage.getItem(DB_KEY)) {
            localStorage.setItem(DB_KEY, JSON.stringify(DEFAULT_DB));
        }
    }

    // Get complete raw database object
    getRawData() {
        try {
            const data = localStorage.getItem(DB_KEY);
            return data ? JSON.parse(data) : DEFAULT_DB;
        } catch (e) {
            console.error('Error reading database:', e);
            return DEFAULT_DB;
        }
    }

    // Save complete raw database object
    saveRawData(data) {
        localStorage.setItem(DB_KEY, JSON.stringify(data));
    }

    // Send Real OTP via Telegram Bot API
    async sendTelegramOTP(telegramUser, otpCode, verifyLink) {
        const db = this.getRawData();
        const botToken = db.settings.telegramBotToken;

        if (!botToken || botToken.includes('ExampleToken')) {
            console.log('Telegram Bot Token not configured yet. OTP code:', otpCode);
            return { 
                success: false, 
                message: 'Telegram Bot Token not configured in Admin Settings. Please set your Telegram Bot Token from @BotFather.' 
            };
        }

        const cleanChatId = telegramUser.trim();
        const messageText = `🔒 *DualLink Hub - Verification OTP*\n\nHello! Your OTP code to complete registration is:\n\n🔑 *${otpCode}*\n\nOr click to verify instantly:\n${verifyLink}\n\nValid for 10 minutes.`;

        try {
            const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: cleanChatId,
                    text: messageText,
                    parse_mode: 'Markdown'
                })
            });

            const resData = await response.json();
            if (resData.ok) {
                return { success: true, message: `OTP message sent to Telegram account ${cleanChatId}!` };
            } else {
                return { success: false, message: `Telegram API error: ${resData.description}` };
            }
        } catch (e) {
            return { success: false, message: `Network error sending Telegram message: ${e.message}` };
        }
    }

    // Settings Management
    settings = {
        getBotToken: () => {
            const db = this.getRawData();
            return db.settings ? db.settings.telegramBotToken || '' : '';
        },
        setBotToken: (token) => {
            const db = this.getRawData();
            if (!db.settings) db.settings = {};
            db.settings.telegramBotToken = token.trim();
            this.saveRawData(db);
            return { success: true };
        }
    };

    // Authentication Engine
    auth = {
        login: (identifier, password) => {
            const db = this.getRawData();
            const cleanId = identifier.trim().toLowerCase();
            
            const user = db.users.find(u => 
                (u.username && u.username.toLowerCase() === cleanId) ||
                (u.telegram && u.telegram.toLowerCase() === cleanId) ||
                (u.telegram && u.telegram.replace(/\s+/g, '').toLowerCase() === cleanId)
            );

            if (!user) {
                return { success: false, message: 'User account not found.' };
            }

            if (user.password !== password) {
                return { success: false, message: 'Invalid password!' };
            }

            // Verification Check
            if (user.verified === false) {
                return { 
                    success: false, 
                    message: `Account (${user.telegram || user.username}) is pending Telegram verification! Please enter OTP sent to your Telegram.` 
                };
            }

            const session = {
                userId: user.id,
                username: user.username || user.telegram,
                telegram: user.telegram || user.username,
                name: user.name || user.username,
                token: 'token-' + Math.random().toString(36).substring(2) + Date.now(),
                loginTime: new Date().toISOString()
            };
            localStorage.setItem(SESSION_KEY, JSON.stringify(session));
            return { success: true, session };
        },

        register: ({ name, telegram, password }) => {
            const db = this.getRawData();
            const cleanTelegram = telegram.trim();

            // Check duplicate
            const existing = db.users.find(u => 
                (u.telegram && u.telegram.toLowerCase() === cleanTelegram.toLowerCase()) ||
                (u.username && u.username.toLowerCase() === cleanTelegram.toLowerCase())
            );

            if (existing) {
                if (existing.verified === false) {
                    // Re-issue verification token for unverified existing user
                    existing.verifyToken = 'ver_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
                    existing.verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
                    this.saveRawData(db);
                    return { success: true, user: existing };
                }
                return { success: false, message: 'This Telegram username/phone is already registered!' };
            }

            const verifyToken = 'ver_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
            const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

            const newUser = {
                id: 'usr-' + Date.now(),
                name: name.trim(),
                telegram: cleanTelegram,
                username: cleanTelegram.replace(/[@+]/g, ''),
                password: password,
                verified: false,
                verifyToken: verifyToken,
                verifyCode: verifyCode,
                role: 'admin',
                createdAt: new Date().toISOString()
            };

            db.users.push(newUser);
            this.saveRawData(db);
            return { success: true, user: newUser };
        },

        verifyAccount: (tokenOrCode) => {
            const db = this.getRawData();
            const cleanInput = tokenOrCode.trim();

            const user = db.users.find(u => 
                (u.verifyToken && u.verifyToken === cleanInput) ||
                (u.verifyCode && u.verifyCode === cleanInput)
            );

            if (user) {
                user.verified = true;
                user.verifyToken = null;
                user.verifyCode = null;
                this.saveRawData(db);
                return { success: true, user };
            }

            return { success: false, message: 'Invalid or expired verification link/code.' };
        },

        logout: () => {
            localStorage.removeItem(SESSION_KEY);
            window.location.href = 'login';
        },

        getSession: () => {
            try {
                const session = localStorage.getItem(SESSION_KEY);
                return session ? JSON.parse(session) : null;
            } catch (e) {
                return null;
            }
        },

        isAuthenticated: () => {
            const session = localStorage.getItem(SESSION_KEY);
            return !!session;
        },

        requireAuth: () => {
            if (!localStorage.getItem(SESSION_KEY)) {
                window.location.href = 'login';
            }
        },

        updateCredentials: (newUsername, newPassword) => {
            const db = this.getRawData();
            const session = this.auth.getSession();
            
            if (session && db.users.length > 0) {
                const user = db.users.find(u => u.id === session.userId) || db.users[0];
                user.username = newUsername.trim();
                user.telegram = newUsername.trim();
                user.password = newPassword;
                this.saveRawData(db);
                
                session.username = newUsername.trim();
                session.telegram = newUsername.trim();
                localStorage.setItem(SESSION_KEY, JSON.stringify(session));
                return { success: true };
            }
            return { success: false, message: 'User record not found.' };
        }
    };

    // Links Collection Manager
    links = {
        getAll: () => {
            const db = this.getRawData();
            return db.links || [];
        },

        getById: (id) => {
            const links = this.links.getAll();
            return links.find(l => l.id === id);
        },

        add: (item) => {
            const db = this.getRawData();
            if (!db.links) db.links = [];
            const newItem = {
                id: 'link-' + Date.now(),
                title: item.title,
                btnText: item.btnText,
                adLink: item.adLink,
                mainLink: item.mainLink,
                theme: item.theme || 'crimson',
                createdAt: new Date().toLocaleDateString()
            };
            db.links.unshift(newItem);
            this.saveRawData(db);
            return newItem;
        },

        update: (id, updatedFields) => {
            const db = this.getRawData();
            const index = db.links.findIndex(l => l.id === id);
            if (index !== -1) {
                db.links[index] = { ...db.links[index], ...updatedFields };
                this.saveRawData(db);
                return { success: true, item: db.links[index] };
            }
            return { success: false, message: 'Item not found' };
        },

        delete: (id) => {
            const db = this.getRawData();
            db.links = db.links.filter(l => l.id !== id);
            this.saveRawData(db);
            return { success: true };
        }
    };

    // Database Backup & Restore Engine
    exportDatabase() {
        const data = this.getRawData();
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `duallink-database-backup-${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importDatabase(jsonString) {
        try {
            const parsed = JSON.parse(jsonString);
            if (parsed && parsed.users && parsed.links) {
                this.saveRawData(parsed);
                return { success: true };
            } else {
                return { success: false, message: 'Invalid database structure format.' };
            }
        } catch (e) {
            return { success: false, message: 'Invalid JSON format.' };
        }
    }
}

// Global Database Instance
window.DB = new DatabaseManager();
