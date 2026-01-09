import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-storage.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

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
        publishBtn: "Publish App",
        loginModalTitle: "Admin Login",
        emailLabel: "Email",
        passwordLabel: "Password",
        loginBtn: "Login",
        downloadBtn: "Download",
        installing: "Installing",
        installed: "Installed",
        noApps: "No apps to display currently.",
        successUpload: "App uploaded successfully!",
        errorUpload: "Error uploading app: ",
        needLogin: "You must login first!",
        successLogout: "Logged out successfully",
        errorLogout: "Logout Error",
        welcome: "Welcome",
        loginError: "Login Error: "
    },
    ar: {
        searchPlaceholder: "ابحث عن تطبيقات وألعاب...",
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
        publishBtn: "نشر التطبيق",
        loginModalTitle: "تسجيل دخول مسؤول",
        emailLabel: "البريد الإلكتروني",
        passwordLabel: "كلمة المرور",
        loginBtn: "دخول",
        downloadBtn: "تحميل",
        installing: "جارٍ التحميل",
        installed: "تم التثبيت",
        noApps: "لا توجد تطبيقات لعرضها حالياً.",
        successUpload: "تم رفع التطبيق وحفظه في قاعدة البيانات بنجاح!",
        errorUpload: "حدث خطأ أثناء الرفع: ",
        needLogin: "يجب عليك تسجيل الدخول أولاً!",
        successLogout: "تم تسجيل الخروج بنجاح",
        errorLogout: "خطأ في تسجيل الخروج",
        welcome: "أهلاً بك",
        loginError: "خطأ في تسجيل الدخول: "
    }
};

// Current Language State
let currentLang = localStorage.getItem('appLang') || 'en';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAnnHpagfLMc03a2xbNYKscbQYM7CM6qhg",
    authDomain: "appshub-bfe1e.firebaseapp.com",
    projectId: "appshub-bfe1e",
    storageBucket: "appshub-bfe1e.firebasestorage.app",
    messagingSenderId: "849218444124",
    appId: "1:849218444124:web:69edb30f9bfeb9325e3f99"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Collection Reference
const appsCol = collection(db, 'applications');

// Elements
const appsGrid = document.getElementById('appsGrid');
const searchInput = document.getElementById('searchInput');

// Upload Modal
const uploadModal = document.getElementById('uploadModal');
const openUploadModalBtn = document.getElementById('openUploadModalBtn');
const closeUploadModalBtn = document.getElementById('closeUploadModalBtn');
const uploadForm = document.getElementById('uploadForm');

// Login Modal
const loginModal = document.getElementById('loginModal');
const openLoginModalBtn = document.getElementById('openLoginModalBtn');
const closeLoginModalBtn = document.getElementById('closeLoginModalBtn');
const loginForm = document.getElementById('loginForm');

// Details Modal
const detailsModal = document.getElementById('detailsModal');
const closeDetailsModalBtn = document.getElementById('closeDetailsModalBtn');

// Lang Switcher
const langSwitchBtn = document.getElementById('langSwitchBtn');

// Local state
let allApps = [];

// --- Internationalization Logic ---

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('appLang', lang);

    // Set Direction
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    // Update Text Content
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.innerText = translations[lang][key];
        }
    });

    // Update placeholders
    const inputs = document.querySelectorAll('[data-i18n-placeholder]');
    inputs.forEach(input => {
        const key = input.getAttribute('data-i18n-placeholder');
        if (translations[lang][key]) {
            input.placeholder = translations[lang][key];
        }
    });

    // Update Lang Button Text
    const langSpan = langSwitchBtn.querySelector('span');
    langSpan.innerText = lang === 'ar' ? 'EN' : 'AR';

    // Re-render apps to update dynamic parts like button text if needed
    renderApps(allApps);
}

langSwitchBtn.addEventListener('click', () => {
    const newLang = currentLang === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
});

// Initialize Language on Load
document.addEventListener('DOMContentLoaded', () => {
    setLanguage(currentLang);
});

// --- Auth Login / Logout ---

// Listen to auth state
onAuthStateChanged(auth, (user) => {
    const t = translations[currentLang];
    const loginBtnSpan = openLoginModalBtn.querySelector('span') || openLoginModalBtn; // Fallback if structure changes

    if (user) {
        // User is signed in
        console.log("Admin Logged In:", user.email);
        openUploadModalBtn.style.display = "flex"; // Show upload button

        // Update button content safely
        openLoginModalBtn.innerHTML = '<ion-icon name="log-out-outline"></ion-icon> <span data-i18n="adminLogout">' + t.adminLogout + '</span>';

        openLoginModalBtn.classList.remove('btn-secondary');
        openLoginModalBtn.classList.add('btn-outline-danger');

        // Change login button behavior to logout
        openLoginModalBtn.onclick = handleLogout;
    } else {
        // User is signed out
        console.log("User Logged Out");
        openUploadModalBtn.style.display = "none"; // Hide upload button

        openLoginModalBtn.innerHTML = '<ion-icon name="log-in-outline"></ion-icon> <span data-i18n="adminLogin">' + t.adminLogin + '</span>';

        openLoginModalBtn.classList.add('btn-secondary');
        openLoginModalBtn.classList.remove('btn-outline-danger');

        // Change login button behavior to open modal
        openLoginModalBtn.onclick = () => window.openModal(loginModal);
    }
});

function handleLogout() {
    const t = translations[currentLang];
    signOut(auth).then(() => {
        alert(t.successLogout);
    }).catch((error) => {
        console.error('Logout Error:', error);
        alert(t.errorLogout);
    });
}

// Login Form Submit
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const t = translations[currentLang];
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            window.closeModal(loginModal);
            loginForm.reset();
            alert(`${t.welcome} ${userCredential.user.email}`);
        })
        .catch((error) => {
            const errorMessage = error.message;
            alert(t.loginError + errorMessage);
        });
});


// --- End Auth ---

// Listen for Realtime Updates
const q = query(appsCol, orderBy('createdAt', 'desc'));
onSnapshot(q, (snapshot) => {
    allApps = [];
    snapshot.docs.forEach(doc => {
        allApps.push({ id: doc.id, ...doc.data() });
    });
    renderApps(allApps);
}, (error) => {
    console.error("Error getting documents: ", error);
});


// Render Apps Function
function renderApps(appsList) {
    const t = translations[currentLang];
    appsGrid.innerHTML = '';

    if (appsList.length === 0) {
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

// Search Functionality
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filteredApps = allApps.filter(app =>
        app.name.toLowerCase().includes(term) ||
        app.developer.toLowerCase().includes(term)
    );
    renderApps(filteredApps);
});

// Modal Logic
window.openModal = function (modal) {
    modal.classList.add('active');
}

window.closeModal = function (modal) {
    modal.classList.remove('active');
}

openUploadModalBtn.addEventListener('click', () => window.openModal(uploadModal));
closeUploadModalBtn.addEventListener('click', () => window.closeModal(uploadModal));

closeDetailsModalBtn.addEventListener('click', () => window.closeModal(detailsModal));
closeLoginModalBtn.addEventListener('click', () => window.closeModal(loginModal));

window.addEventListener('click', (e) => {
    if (e.target === uploadModal) window.closeModal(uploadModal);
    if (e.target === detailsModal) window.closeModal(detailsModal);
    if (e.target === loginModal) window.closeModal(loginModal);
});


// Handle Upload with Firebase
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const t = translations[currentLang];

    // Check if user is auth (double check)
    if (!auth.currentUser) {
        alert(t.needLogin);
        return;
    }

    const submitBtn = uploadForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerText;
    submitBtn.disabled = true;
    submitBtn.innerText = t.installing + "..."; // Reusing installing text for uploading spinner roughly

    try {
        const name = document.getElementById('appName').value;
        const developer = document.getElementById('appDeveloper').value;
        const desc = document.getElementById('appDesc').value;
        const iconFile = document.getElementById('appIcon').files[0];

        if (!iconFile) {
            alert("Please select an icon image"); // Forgot to translate this specific alert, adding fallback
            return;
        }

        // Upload Image to Firebase Storage
        const storageRef = ref(storage, `icons/${Date.now()}_${iconFile.name}`);
        const snapshot = await uploadBytes(storageRef, iconFile);
        const iconUrl = await getDownloadURL(snapshot.ref);

        // Add to Firestore using the new URL
        await addDoc(appsCol, {
            name: name,
            developer: developer,
            desc: desc,
            icon: iconUrl,
            rating: 5.0,
            downloads: 0,
            createdAt: serverTimestamp(),
            uploadedBy: auth.currentUser.uid
        });

        window.closeModal(uploadModal);
        uploadForm.reset();
        alert(t.successUpload);

    } catch (error) {
        console.error("Error adding document: ", error);
        alert(t.errorUpload + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = originalBtnText; // Resets to "Publish App"
        // Force refresh text in case language changed? No, it takes from HTML original usually.
        // Actually best to re-set the text from translation
        submitBtn.innerText = translations[currentLang].publishBtn;
    }
});


// App Details & Mock Download
function openDetails(app) {
    const t = translations[currentLang];
    document.getElementById('detailIcon').src = app.icon;
    document.getElementById('detailIcon').onerror = function () { this.src = 'https://via.placeholder.com/100?text=App'; };

    document.getElementById('detailName').innerText = app.name;
    document.getElementById('detailDeveloper').innerText = app.developer;
    document.getElementById('detailDesc').innerText = app.desc;

    const downloadBtn = document.getElementById('downloadBtn');
    downloadBtn.innerText = t.downloadBtn;
    downloadBtn.onclick = () => simulateDownload(downloadBtn);

    window.openModal(detailsModal);
}

function simulateDownload(btn) {
    const t = translations[currentLang];
    btn.disabled = true;
    let progress = 0;
    btn.innerText = `${t.installing} ${progress}%`;

    const interval = setInterval(() => {
        progress += 5; // Slower for realism
        btn.innerText = `${t.installing} ${progress}%`;

        if (progress >= 100) {
            clearInterval(interval);
            btn.innerText = t.installed;
            btn.style.backgroundColor = "#10b981";
            setTimeout(() => {
                btn.disabled = false;
                btn.style.backgroundColor = "";
                window.closeModal(detailsModal);
                // Reset text
                btn.innerText = t.downloadBtn;
            }, 1000);
        }
    }, 100);
}
