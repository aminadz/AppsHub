import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Translations Object
const translations = {
    en: {
        searchPlaceholder: "Search apps and games...",
        adminLogin: "Admin Login",
        adminLogout: "Logout",
        uploadApp: "Upload App",
        heroTitle: "Discover Your Digital World",
        heroSubtitle: "Best apps and games in your hands. Download, enjoy, and share your creativity.",
        exploreBtn: "Explore Now",
        popularSection: "Most Popular",
        uploadModalTitle: "Upload New App",
        appNameLabel: "App Name",
        devNameLabel: "Developer",
        descLabel: "Description",
        iconLabel: "App Icon",
        fileLabel: "App File (APK)",
        publishBtn: "Publish App",
        loginModalTitle: "Admin Login",
        emailLabel: "Email",
        passwordLabel: "Password",
        loginBtn: "Login",
        downloadBtn: "Download",
        installing: "Downloading",
        installed: "Download Complete",
        noApps: "No apps to display currently.",
        successUpload: "App published successfully!",
        errorUpload: "Error publishing app: ",
        needLogin: "You must login first!",
        successLogout: "Logged out successfully",
        errorLogout: "Logout Error",
        welcome: "Welcome",
        loginError: "Login Error: ",
        uploading: "Uploading...",
        uploadComplete: "Upload Complete",
        catAll: "All",
        catGames: "Games",
        catSocial: "Social",
        catPoductivity: "Productivity",
        catEducation: "Education",
        deleteBtn: "Delete App",
        confirmDelete: "Are you sure you want to delete this app?",
        successDelete: "App deleted successfully!",
        errorDelete: "Error deleting app: "
    },
    ar: {
        searchPlaceholder: "ابحث عن تطبيقات وألعاب...",
        catAll: "الكل",
        catGames: "ألعاب",
        catSocial: "تواصل اجتماعي",
        catPoductivity: "إنتاجية",
        catEducation: "تعليم",
        deleteBtn: "حذف التطبيق",
        confirmDelete: "هل أنت متأكد من حذف هذا التطبيق؟",
        successDelete: "تم حذف التطبيق بنجاح!",
        errorDelete: "خطأ في حذف التطبيق: ",
        adminLogin: "دخول مسؤول",
        adminLogout: "خروج",
        uploadApp: "رفع تطبيق",
        heroTitle: "اكتشف عالمك الرقمي",
        heroSubtitle: "أفضل التطبيقات والألعاب بين يديك. حمّل، استمتع، وشارك إبداعك معنا.",
        exploreBtn: "تصفح الآن",
        popularSection: "الأكثر رواجاً",
        uploadModalTitle: "رفع تطبيق جديد",
        appNameLabel: "اسم التطبيق",
        devNameLabel: "المطور",
        descLabel: "الوصف",
        iconLabel: "أيقونة التطبيق",
        fileLabel: "ملف التطبيق (APK)",
        publishBtn: "نشر التطبيق",
        loginModalTitle: "تسجيل دخول مسؤول",
        emailLabel: "البريد الإلكتروني",
        passwordLabel: "كلمة المرور",
        loginBtn: "دخول",
        downloadBtn: "تحميل",
        installing: "جارٍ التحميل",
        installed: "اكتمل التحميل",
        noApps: "لا توجد تطبيقات لعرضها حالياً.",
        successUpload: "تم نشر التطبيق بنجاح!",
        errorUpload: "حدث خطأ أثناء النشر: ",
        needLogin: "يجب عليك تسجيل الدخول أولاً!",
        successLogout: "تم تسجيل الخروج بنجاح",
        errorLogout: "خطأ في تسجيل الخروج",
        welcome: "أهلاً بك",
        loginError: "خطأ في تسجيل الدخول: ",
        uploading: "جارٍ الرفع...",
        uploadComplete: "تم الرفع بنجاح"
    }
};

// Current Language State
let currentLang = localStorage.getItem('appLang') || 'en';

// --- Supabase Configuration ---
const supabaseUrl = 'https://vdosrxhnamrttjeqzbjq.supabase.co';
// WARNING: The key provided looks short, usually it starts with 'eyJ'. 
// If it fails, we will ask the user to check 'anon public' key again.
const supabaseKey = 'sb_publishable_fQ5mLjjsM2-mXxPnhUT5BA_lPv0JjVM';
const supabase = createClient(supabaseUrl, supabaseKey);

// DOM Elements
const appsGrid = document.getElementById('appsGrid');
const searchInput = document.getElementById('searchInput');
const uploadModal = document.getElementById('uploadModal');
const openUploadModalBtn = document.getElementById('openUploadModalBtn');
const closeUploadModalBtn = document.getElementById('closeUploadModalBtn');
const uploadForm = document.getElementById('uploadForm');
const publishBtn = document.getElementById('publishBtn');
const appIconInput = document.getElementById('appIcon');
const appFileInput = document.getElementById('appFile');
const iconProgress = document.getElementById('iconProgress');
const fileProgress = document.getElementById('fileProgress');
const loginModal = document.getElementById('loginModal');
const openLoginModalBtn = document.getElementById('openLoginModalBtn');
const closeLoginModalBtn = document.getElementById('closeLoginModalBtn');
const loginForm = document.getElementById('loginForm');
const detailsModal = document.getElementById('detailsModal');
const closeDetailsModalBtn = document.getElementById('closeDetailsModalBtn');
const langSwitchBtn = document.getElementById('langSwitchBtn');

// Local State
let allApps = [];
let uploadedIconUrl = null;
let uploadedFileUrl = null;

// --- Internationalization ---
function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('appLang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) el.innerText = translations[lang][key];
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(input => {
        const key = input.getAttribute('data-i18n-placeholder');
        if (translations[lang][key]) input.placeholder = translations[lang][key];
    });

    const langSpan = langSwitchBtn.querySelector('span');
    langSpan.innerText = lang === 'ar' ? 'EN' : 'AR';
    renderApps(allApps);
}

langSwitchBtn.addEventListener('click', () => {
    setLanguage(currentLang === 'en' ? 'ar' : 'en');
});

document.addEventListener('DOMContentLoaded', () => {
    setLanguage(currentLang);
    fetchApps();
    checkUser();
});

// Global Error Handler for debugging
window.onerror = function (msg, url, line, col, error) {
    alert("Script Error: " + msg + "\nLine: " + line);
    console.error("Script Error:", error);
    return false;
};

// --- Auth (Supabase) ---
async function checkUser() {
    try {
        const response = await supabase.auth.getSession();
        if (response.error) {
            console.error("Auth Session Error:", response.error);
            updateUIForUser(null);
            return;
        }
        updateUIForUser(response.data?.session?.user);
    } catch (err) {
        console.error("CheckUser Unexpected Error:", err);
        updateUIForUser(null);
    }

    supabase.auth.onAuthStateChange((_event, session) => {
        updateUIForUser(session?.user);
    });
}

function updateUIForUser(user) {
    const t = translations[currentLang];
    if (user) {
        openUploadModalBtn.style.display = "flex";
        openLoginModalBtn.innerHTML = '<ion-icon name="log-out-outline"></ion-icon> <span data-i18n="adminLogout">' + t.adminLogout + '</span>';
        openLoginModalBtn.classList.remove('btn-secondary');
        openLoginModalBtn.classList.add('btn-outline-danger');
        openLoginModalBtn.onclick = handleLogout;
    } else {
        openUploadModalBtn.style.display = "none";
        openLoginModalBtn.innerHTML = '<ion-icon name="log-in-outline"></ion-icon> <span data-i18n="adminLogin">' + t.adminLogin + '</span>';
        openLoginModalBtn.classList.add('btn-secondary');
        openLoginModalBtn.classList.remove('btn-outline-danger');
        openLoginModalBtn.onclick = () => window.openModal(loginModal);
    }
}

async function handleLogout() {
    const t = translations[currentLang];
    const { error } = await supabase.auth.signOut();
    if (error) alert(t.errorLogout);
    else alert(t.successLogout);
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const t = translations[currentLang];
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        alert(t.loginError + error.message);
    } else {
        window.closeModal(loginModal);
        loginForm.reset();
        alert(`${t.welcome} ${data.user.email}`);
    }
});

// --- Data Fetching (Supabase DB) ---
async function fetchApps() {
    const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false }); // Assuming default created_at col exists or needs to be added

    if (error) {
        console.error("Error fetching apps", error);
        return;
    }
    allApps = data || [];
    renderApps(allApps);
}

// --- Upload Logic (Supabase Storage) ---
appIconInput.addEventListener('change', (e) => handleFileUpload(e.target.files[0], 'icon'));
appFileInput.addEventListener('change', (e) => handleFileUpload(e.target.files[0], 'file'));

async function handleFileUpload(file, type) {
    if (!file) return;
    const t = translations[currentLang];
    const progressEl = type === 'icon' ? iconProgress : fileProgress;

    // Check Auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        alert(t.needLogin);
        if (type === 'icon') appIconInput.value = '';
        if (type === 'file') appFileInput.value = '';
        return;
    }

    progressEl.innerHTML = `<span style="color: var(--primary-color)">${t.uploading}</span>`;

    // Unique name
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `${type}s/${fileName}`; // icons/name.png or files/name.apk

    const { data, error } = await supabase.storage
        .from('files')
        .upload(filePath, file);

    if (error) {
        console.error("Upload Error", error);
        progressEl.innerHTML = `<span style="color: red; font-size:0.8rem">❌ ${error.message}</span>`;
        if (type === 'icon') appIconInput.value = '';
        if (type === 'file') appFileInput.value = '';
    } else {
        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('files')
            .getPublicUrl(filePath);

        progressEl.innerHTML = `<span style="color: #10b981">✔ ${t.uploadComplete}</span>`;

        if (type === 'icon') uploadedIconUrl = publicUrl;
        if (type === 'file') uploadedFileUrl = publicUrl;

        checkPublishEnable();
    }
}

function checkPublishEnable() {
    if (uploadedIconUrl && uploadedFileUrl) {
        publishBtn.disabled = false;
        publishBtn.style.opacity = "1";
        publishBtn.style.cursor = "pointer";
    } else {
        publishBtn.disabled = true;
        publishBtn.style.opacity = "0.5";
        publishBtn.style.cursor = "not-allowed";
    }
}

function resetUploadForm() {
    uploadForm.reset();
    iconProgress.innerHTML = '';
    fileProgress.innerHTML = '';
    uploadedIconUrl = null;
    uploadedFileUrl = null;
    checkPublishEnable();
}


// --- Publish App (Insert into DB) ---
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const t = translations[currentLang];

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        alert(t.needLogin);
        return;
    }

    if (!uploadedIconUrl || !uploadedFileUrl) {
        alert("Please wait for upload.");
        return;
    }

    const submitBtn = uploadForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerText = "Publishing...";

    const name = document.getElementById('appName').value;
    const developer = document.getElementById('appDeveloper').value;
    const desc = document.getElementById('appDesc').value;

    const { error } = await supabase
        .from('applications')
        .insert({
            name: name,
            developer: developer,
            desc: desc,
            icon: uploadedIconUrl,
            fileUrl: uploadedFileUrl,
            rating: 5.0,
            downloads: 0,
            uploaded_by: user.id // Supabase user ID
        });

    if (error) {
        console.error("Db Error", error);
        alert(t.errorUpload + error.message);
    } else {
        window.closeModal(uploadModal);
        resetUploadForm();
        alert(t.successUpload);
        fetchApps(); // Refresh list
    }

    submitBtn.disabled = false;
    submitBtn.innerText = translations[currentLang].publishBtn;
});

// --- Render & Interactions ---
function renderApps(appsList) {
    const t = translations[currentLang];
    appsGrid.innerHTML = '';

    if (!appsList || appsList.length === 0) {
        appsGrid.innerHTML = `<p style="text-align:center; width:100%; color: var(--text-muted);">${t.noApps}</p>`;
        return;
    }

    appsList.forEach(app => {
        const card = document.createElement('div');
        card.className = 'app-card';
        card.onclick = () => openDetails(app);
        card.innerHTML = `
            <div class="app-header">
                <img src="${app.icon}" alt="${app.name}" class="app-icon" onerror="this.src='https://via.placeholder.com/60?text=App'">
                <div class="app-info">
                    <h3>${app.name}</h3>
                    <p>${app.developer}</p>
                    <div class="app-rating">
                        <ion-icon name="star"></ion-icon>
                        <span>${app.rating || 'New'}</span>
                    </div>
                </div>
            </div>
            <p class="app-desc">${app.desc}</p>
            <div class="app-footer">
                <span class="download-pill">${app.downloads || 0} <ion-icon name="download-outline"></ion-icon></span>
                <button class="btn-primary" style="padding: 5px 15px; font-size: 0.8rem;">${t.downloadBtn}</button>
            </div>
        `;
        appsGrid.appendChild(card);
    });
}

searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filteredApps = allApps.filter(app =>
        app.name.toLowerCase().includes(term) ||
        app.developer.toLowerCase().includes(term)
    );
    renderApps(filteredApps);
});

// Modal Logic
window.openModal = function (modal) { modal.classList.add('active'); }
window.closeModal = function (modal) { modal.classList.remove('active'); }

openUploadModalBtn.addEventListener('click', () => window.openModal(uploadModal));
closeUploadModalBtn.addEventListener('click', () => window.closeModal(uploadModal));
closeDetailsModalBtn.addEventListener('click', () => window.closeModal(detailsModal));
closeLoginModalBtn.addEventListener('click', () => window.closeModal(loginModal));
window.addEventListener('click', (e) => {
    if (e.target === uploadModal) window.closeModal(uploadModal);
    if (e.target === detailsModal) window.closeModal(detailsModal);
    if (e.target === loginModal) window.closeModal(loginModal);
});

function openDetails(app) {
    const t = translations[currentLang];
    document.getElementById('detailIcon').src = app.icon;
    document.getElementById('detailIcon').onerror = function () { this.src = 'https://via.placeholder.com/100?text=App'; };
    document.getElementById('detailName').innerText = app.name;
    document.getElementById('detailDeveloper').innerText = app.developer;
    document.getElementById('detailDesc').innerText = app.desc;

    const downloadBtn = document.getElementById('downloadBtn');
    const deleteBtn = document.getElementById('deleteBtn');

    downloadBtn.innerText = t.downloadBtn;
    if (deleteBtn) deleteBtn.innerText = t.deleteBtn;

    // Check if user is admin to show Delete button
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (deleteBtn) {
            if (session && session.user) {
                deleteBtn.style.display = 'block';
                deleteBtn.onclick = async () => {
                    if (confirm(t.confirmDelete)) {
                        // Delete from DB
                        const { error } = await supabase
                            .from('applications')
                            .delete()
                            .eq('id', app.id);

                        if (error) {
                            alert(t.errorDelete + error.message);
                        } else {
                            alert(t.successDelete);
                            window.closeModal(detailsModal);
                            fetchApps(); // Refresh Grid
                        }
                    }
                };
            } else {
                deleteBtn.style.display = 'none';
            }
        }
    });

    downloadBtn.onclick = async () => {
        if (app.fileUrl) {
            window.open(app.fileUrl, '_blank');
            const newCount = (app.downloads || 0) + 1;
            const { error } = await supabase
                .from('applications')
                .update({ downloads: newCount })
                .eq('id', app.id);
            if (!error) console.log("Download count updated");
        } else {
            alert("No file URL");
        }
    };

    window.openModal(detailsModal);
}

function simulateDownload(btn) {
    const t = translations[currentLang];
    btn.disabled = true;
    let progress = 0;
    btn.innerText = `${t.installing} ${progress}%`;

    const interval = setInterval(() => {
        progress += 10;
        btn.innerText = `${t.installing} ${progress}%`;

        if (progress >= 100) {
            clearInterval(interval);
            btn.innerText = t.installed;
            btn.style.backgroundColor = "#10b981";
            setTimeout(() => {
                btn.disabled = false;
                btn.style.backgroundColor = "";
                window.closeModal(detailsModal);
                btn.innerText = t.downloadBtn;
            }, 1000);
        }
    }, 100);
}
