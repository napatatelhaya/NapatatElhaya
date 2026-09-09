import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, doc, getDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// ==========================================
// 1. تهيئة Firebase (تم إصلاح الهيكل المقطوع)
// ==========================================
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

// ==========================================
// 2. تحميل إعدادات الموقع (اللوجو والاسم)
// ==========================================
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

// ==========================================
// 3. قائمة الجوال (مع رسائل تتبع لتشخيص مشكلة صفحات المنتجات)
// ==========================================
function initMobileMenu() {
    const toggle = document.getElementById('mobileToggle');
    const nav = document.getElementById('mainNav');
    
    if (!toggle || !nav) {
        console.warn("⚠️ عناصر القائمة غير موجودة! تأكد من وجود id='mobileToggle' و id='mainNav' في الهيدر.");
        return;
    }
    
    console.log("✅ تم تهيئة البرجر منيو بنجاح");
    
    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggle.classList.toggle('active');
        nav.classList.toggle('active');
        console.log("🍔 حالة القائمة:", nav.classList.contains('active') ? 'مفتوحة' : 'مغلقة');
    });
    
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            nav.classList.remove('active');
        });
    });
}

// ==========================================
// 4. نموذج الاتصال (نسخة مضمونة 100% - mailto فقط)
// ==========================================
function initContactForm() {
    const form = document.getElementById('contactForm');
    
    if (!form) {
        console.log("ℹ️ نموذج الاتصال غير موجود في هذه الصفحة (طبيعي في الصفحات غير صفحة التواصل)");
        return;
    }
    
    console.log("✅ تم العثور على نموذج الاتصال بنجاح");
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log("📝 تم الضغط على زر الإرسال");
        
        const nameInput = document.getElementById('clientName');
        const emailInput = document.getElementById('clientEmail');
        const messageInput = document.getElementById('clientMessage');
        
        if (!nameInput || !emailInput || !messageInput) {
            console.error("❌ أحد الحقول مفقود:", {
                name: !!nameInput,
                email: !!emailInput,
                message: !!messageInput
            });
            alert('خطأ في الحقول. يرجى تحديث الصفحة.');
            return;
        }
        
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const message = messageInput.value.trim();
        
        console.log("📋 البيانات:", { name, email, message });
        
        if (!name || !email || !message) {
            alert('⚠️ يرجى ملء جميع الحقول المطلوبة');
            return;
        }
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.innerHTML : 'إرسال الرسالة';
        
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> جاري الفتح...';
        }
        
        const receiverEmail = 'alsayed0852.as@gmail.com';
        const subject = encodeURIComponent(`طلب تواصل جديد من: ${name}`);
        const body = encodeURIComponent(`الاسم: ${name}\nالبريد الإلكتروني: ${email}\n\nالرسالة:\n${message}`);
        const mailtoLink = `mailto:${receiverEmail}?subject=${subject}&body=${body}`;
        
        console.log("📧 رابط mailto:", mailtoLink);
        
        try {
            window.location.href = mailtoLink;
            console.log("✅ تم فتح mailto بنجاح");
        } catch (error) {
            console.error("❌ فشل فتح mailto:", error);
            alert('حدث خطأ. يرجى إرسال الإيميل يدوياً إلى: ' + receiverEmail);
        }
        
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="bi bi-check-circle-fill"></i> تم الفتح ✓';
            submitBtn.style.backgroundColor = '#28a745';
            submitBtn.style.color = '#fff';
            
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.style.backgroundColor = '';
                submitBtn.style.color = '';
                submitBtn.disabled = false;
                form.reset();
                console.log("🔄 تم إعادة تعيين النموذج");
            }, 3000);
        }
    });
}

// ==========================================
// 5. مراقب التمرير (Scroll Reveal)
// ==========================================
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

// ==========================================
// 6. تصغير الهيدر عند التمرير
// ==========================================
function initHeaderScroll() {
    const header = document.getElementById('mainHeader');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        });
    }
}

// ==========================================
// 7. تبديل اللغة الذكي (يعمل مع/بدون .html)
// ==========================================
function initLanguageSwitcher() {
    const langSwitcher = document.getElementById('langSwitcher');
    if (!langSwitcher) {
        console.log("ℹ️ لا يوجد زر لغة في هذه الصفحة");
        return;
    }
    
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    const baseUrl = window.location.origin;
    
    console.log("🔍 المسار الحالي:", currentPath);
    
    const pageMap = [
        { from: 'product-detail-en', to: 'product-detail' },
        { from: 'product-detail', to: 'product-detail-en' },
        { from: 'products-en', to: 'products' },
        { from: 'products', to: 'products-en' },
        { from: 'about-en', to: 'about' },
        { from: 'about', to: 'about-en' },
        { from: 'contact-en', to: 'contact' },
        { from: 'contact', to: 'contact-en' },
        { from: 'en', to: 'index' },
        { from: 'index', to: 'en' }
    ];
    
    let newPath = null;
    let matchedPage = null;
    
    const pathParts = currentPath.split('/');
    const lastPart = pathParts[pathParts.length - 1].replace('.html', '');
    
    console.log("📄 الجزء الأخير من المسار:", lastPart);
    
    for (const { from, to } of pageMap) {
        if (lastPart === from || lastPart.includes(from)) {
            newPath = currentPath.replace(from, to);
            matchedPage = from;
            console.log(`✅ تم العثور على تطابق: ${from} → ${to}`);
            break;
        }
    }
    
    if (!newPath) {
        console.warn("⚠️ لم يتم العثور على صفحة مطابقة");
        return;
    }
    
    if (!newPath.endsWith('.html')) {
        newPath += '.html';
    }
    
    const newUrl = baseUrl + newPath + currentSearch;
    langSwitcher.href = newUrl;
    console.log(`🔄 ${matchedPage} → الرابط الجديد:`, newUrl);
}

// ==========================================
// 8. تشغيل كل الوظائف عند جاهزية الصفحة
// ==========================================
function initAll() {
    console.log("🚀 بدء تهيئة الموقع...");
    loadSiteSettings();
    initMobileMenu();
    initContactForm();
    initScrollReveal();
    initHeaderScroll();
    initLanguageSwitcher(); // تم إضافة دالة تبديل اللغة هنا
    console.log("✅ اكتملت التهيئة بنجاح");
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
} else {
    initAll();
}
