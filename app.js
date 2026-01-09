import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-storage.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

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

// Local state
let allApps = [];

// --- Auth Login / Logout ---

// Listen to auth state
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        console.log("Admin Logged In:", user.email);
        openUploadModalBtn.style.display = "flex"; // Show upload button
        openLoginModalBtn.innerHTML = '<ion-icon name="log-out-outline"></ion-icon> خروج';
        openLoginModalBtn.classList.remove('btn-secondary');
        openLoginModalBtn.classList.add('btn-outline-danger'); // Add a red outline style if defined, or stick to secondary

        // Change login button behavior to logout
        openLoginModalBtn.onclick = handleLogout;
    } else {
        // User is signed out
        console.log("User Logged Out");
        openUploadModalBtn.style.display = "none"; // Hide upload button
        openLoginModalBtn.innerHTML = '<ion-icon name="log-in-outline"></ion-icon> دخول مسؤول';
        openLoginModalBtn.classList.add('btn-secondary');
        openLoginModalBtn.classList.remove('btn-outline-danger');

        // Change login button behavior to open modal
        openLoginModalBtn.onclick = () => window.openModal(loginModal);
    }
});

function handleLogout() {
    signOut(auth).then(() => {
        alert('تم تسجيل الخروج بنجاح');
    }).catch((error) => {
        console.error('Logout Error:', error);
    });
}

// Login Form Submit
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            window.closeModal(loginModal);
            loginForm.reset();
            alert(`أهلاً بك يا ${userCredential.user.email}`);
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert('خطأ في تسجيل الدخول: ' + errorMessage);
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
    appsGrid.innerHTML = '';

    if (appsList.length === 0) {
        appsGrid.innerHTML = '<p style="text-align:center; width:100%; color: var(--text-muted);">لا توجد تطبيقات لعرضها حالياً.</p>';
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
                <span class="download-pill">${app.downloads || 0} تحميل</span>
                <button class="btn-primary" style="padding: 5px 15px; font-size: 0.8rem;">تثبيت</button>
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

    // Check if user is auth (double check)
    if (!auth.currentUser) {
        alert("يجب عليك تسجيل الدخول أولاً!");
        return;
    }

    const submitBtn = uploadForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerText;
    submitBtn.disabled = true;
    submitBtn.innerText = "جارٍ الرفع...";

    try {
        const name = document.getElementById('appName').value;
        const developer = document.getElementById('appDeveloper').value;
        const desc = document.getElementById('appDesc').value;
        const iconUrl = document.getElementById('appIcon').value;

        // Add to Firestore
        await addDoc(appsCol, {
            name: name,
            developer: developer,
            desc: desc,
            icon: iconUrl,
            rating: 5.0,
            downloads: 0,
            createdAt: serverTimestamp(),
            uploadedBy: auth.currentUser.uid // Track who uploaded
        });

        window.closeModal(uploadModal);
        uploadForm.reset();
        alert('تم رفع التطبيق وحفظه في قاعدة البيانات بنجاح!');

    } catch (error) {
        console.error("Error adding document: ", error);
        alert('حدث خطأ أثناء الرفع: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = originalBtnText;
    }
});


// App Details & Mock Download
function openDetails(app) {
    document.getElementById('detailIcon').src = app.icon;
    document.getElementById('detailIcon').onerror = function () { this.src = 'https://via.placeholder.com/100?text=App'; };

    document.getElementById('detailName').innerText = app.name;
    document.getElementById('detailDeveloper').innerText = app.developer;
    document.getElementById('detailDesc').innerText = app.desc;

    const downloadBtn = document.getElementById('downloadBtn');
    downloadBtn.innerText = "تحميل";
    downloadBtn.onclick = () => simulateDownload(downloadBtn);

    window.openModal(detailsModal);
}

function simulateDownload(btn) {
    btn.disabled = true;
    let progress = 0;
    btn.innerText = `جارٍ التحميل ${progress}%`;

    const interval = setInterval(() => {
        progress += 5; // Slower for realism
        btn.innerText = `جارٍ التحميل ${progress}%`;

        if (progress >= 100) {
            clearInterval(interval);
            btn.innerText = "تم التثبيت";
            btn.style.backgroundColor = "#10b981";
            setTimeout(() => {
                btn.disabled = false;
                btn.style.backgroundColor = "";
                window.closeModal(detailsModal);
            }, 1000);
        }
    }, 100);
}
