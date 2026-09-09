import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, doc, getDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBB9Jdg4J_onUAR2rFieAAnyf29plxNWVo",
    authDomain: "napataelhaya.firebaseapp.com",
    projectId: "napataelhaya",
    storageBucket: "napataelhaya.firebasestorage.app",
    messagingSenderId: "4297790604",
    appId: "1:4297790604:web:df023add20dfc543e5d7a9",
    measurementId: "G-8X853PE60X"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// تحميل الإعدادات
async function loadSiteSettings() {
    try {
        const snap = await getDoc(doc(db, 'settings', 'general'));
        if (snap.exists()) {
            const data = snap.data();
            if (data.logo) {
                document.querySelectorAll('.logo-icon').forEach(el => {
                    el.innerHTML = `<img src="${data.logo}" alt="Logo" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;">`;
                });
            }
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

// قائمة الجوال
function initMobileMenu() {
    const toggle = document.getElementById('mobileToggle');
    const nav = document.getElementById('mainNav');
    
    if (!toggle || !nav) return;
    
    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggle.classList.toggle('active');
        nav.classList.toggle('active');
    });
    
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            nav.classList.remove('active');
        });
    });
}

// نموذج الاتصال - mailto فقط
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('clientName').value.trim();
        const email = document.getElementById('clientEmail').value.trim();
        const message = document.getElementById('clientMessage').value.trim();
        
        if (!name || !email || !message) {
            alert('يرجى ملء جميع الحقول');
            return;
        }
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'جاري الفتح...';
        
        const receiverEmail = 'alsayed0852.as@gmail.com';
        const subject = encodeURIComponent(`طلب تواصل جديد من: ${name}`);
        const body = encodeURIComponent(`الاسم: ${name}\nالبريد: ${email}\n\nالرسالة:\n${message}`);
        
        window.location.href = `mailto:${receiverEmail}?subject=${subject}&body=${body}`;
        
        submitBtn.innerHTML = '✓ تم الفتح';
        submitBtn.style.backgroundColor = '#28a745';
        
        setTimeout(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.style.backgroundColor = '';
            submitBtn.disabled = false;
            form.reset();
        }, 3000);
    });
}

// Scroll Reveal
function initScrollReveal() {
    document.querySelectorAll('.fade-up').forEach(el => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        observer.observe(el);
    });
}

// تصغير الهيدر
function initHeaderScroll() {
    const header = document.getElementById('mainHeader');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        });
    }
}

// التشغيل
function initAll() {
    console.log("🚀 بدء تهيئة الموقع...");
    loadSiteSettings();
    initMobileMenu();
    initContactForm();
    initScrollReveal();
    initHeaderScroll();
    console.log("✅ اكتملت التهيئة");
}

// انتظر تحميل الصفحة
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
} else {
    initAll();
}
