import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDTZfOOSxaWFlAc_smFxGKb3Sv3HH8tEAw",
    authDomain: "napatatelhaya-98cb9.firebaseapp.com",
    projectId: "napatatelhaya-98cb9",
    storageBucket: "napatatelhaya-98cb9.firebasestorage.app",
    messagingSenderId: "794316862369",
    appId: "1:794316862369:web:592fF5ce4e867c97bc91e0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function loadSiteSettings() {
    try {
        const snap = await getDoc(doc(db, 'settings', 'general'));
        if (snap.exists()) {
            const data = snap.data();
            
            // 1. تحديث اللوجو
            if (data.logo) {
                document.querySelectorAll('.logo-icon').forEach(el => {
                    el.innerHTML = `<img src="${data.logo}" alt="Logo" style="width:100%; height:100%; object-fit:cover; border-radius:50%; display:block;">`;
                });
            }
            
            // 2. تحديث الاسم
            const isAr = document.documentElement.lang === 'ar';
            const name = isAr ? data.companyNameAr : data.companyNameEn;
            if (name) {
                document.querySelectorAll('.logo-text').forEach(el => {
                    const parts = name.trim().split(' ');
                    el.innerHTML = `${parts[0]} <span>${parts.slice(1).join(' ')}</span>`;
                });
            }
        }
    } catch (error) {
        console.error("خطأ في تحميل الإعدادات:", error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadSiteSettings(); // استدعاء فوري

    // تأثير تصغير الهيدر
    const header = document.getElementById('mainHeader');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    // قائمة الجوال
    const mobileToggle = document.getElementById('mobileToggle');
    const mainNav = document.getElementById('mainNav');
    if (mobileToggle && mainNav) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            mainNav.classList.toggle('active');
        });
        mainNav.querySelectorAll('a:not(.dropdown-toggle)').forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle.classList.remove('active');
                mainNav.classList.remove('active');
            });
        });
    }
    
    // Scroll Reveal
    document.querySelectorAll('.fade-up').forEach(el => {
        new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 }).observe(el);
    });
});