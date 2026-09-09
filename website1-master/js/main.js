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

// ==========================================
// 1. تحميل الإعدادات (اللوجو والاسم)
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
// 2. قائمة الجوال (Burger Menu) - تعمل في كل الصفحات
// ==========================================
function initMobileMenu() {
    const toggle = document.getElementById('mobileToggle');
    const nav = document.getElementById('mainNav');
    
    if (!toggle || !nav) {
        console.log("⚠️ عناصر القائمة غير موجودة:", { toggle: !!toggle, nav: !!nav });
        return;
    }
    
    console.log("✅ تم العثور على عناصر القائمة");
    
    // فتح/إغلاق عند النقر على الزر
    toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle.classList.toggle('active');
        nav.classList.toggle('active');
        console.log("🍔 القائمة:", nav.classList.contains('active') ? 'مفتوحة' : 'مغلقة');
    });
    
    // إغلاق عند النقر على أي رابط
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            nav.classList.remove('active');
            console.log("🔒 أُغلقت القائمة عند النقر على رابط");
        });
    });
    
    // إغلاق عند النقر خارج القائمة
    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && !toggle.contains(e.target)) {
            toggle.classList.remove('active');
            nav.classList.remove('active');
        }
    });
}


// ==========================================
// 3. القائمة المنسدلة (Dropdown)
// ==========================================
function initDropdowns() {
    document.querySelectorAll('.dropdown').forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        if (toggle) {
            toggle.addEventListener('click', function(e) {
                if (window.innerWidth <= 968) {
                    e.preventDefault();
                    e.stopPropagation();
                    dropdown.classList.toggle('active');
                }
            });
        }
    });
}

// ==========================================
// 4. تصغير الهيدر عند التمرير
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
// 5. التمرير الناعم للروابط الداخلية
// ==========================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId.length < 2) return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const header = document.getElementById('mainHeader');
                const offset = header ? header.offsetHeight + 20 : 100;
                const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });
}

// ==========================================
// 6. نموذج الاتصال (Contact Form) - يعمل 100%
// ==========================================

// ==========================================
// 6. نموذج الاتصال (Contact Form) - نسخة مضمونة
// ==========================================
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) {
        console.log("⚠️ نموذج الاتصال غير موجود في هذه الصفحة");
        return;
    }
    
    console.log("✅ تم العثور على نموذج الاتصال");
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.innerHTML : '';
        
        // البحث عن الحقول
        const nameInput = form.querySelector('#clientName, input[name="name"], input[type="text"]');
        const emailInput = form.querySelector('#clientEmail, input[name="email"], input[type="email"]');
        const messageInput = form.querySelector('#clientMessage, textarea[name="message"], textarea');
        
        const name = nameInput ? nameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const message = messageInput ? messageInput.value.trim() : '';
        
        console.log("📝 البيانات:", { name, email, message });
        
        if (!name || !email || !message) {
            alert('يرجى ملء جميع الحقول');
            return;
        }
        
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> جاري الإرسال...';
        }
        
        try {
            // 1. الحفظ في Firebase
            await addDoc(collection(db, 'inquiries'), {
                name: name,
                email: email,
                message: message,
                createdAt: serverTimestamp()
            });
            
            console.log("✅ تم الحفظ في Firebase");
            
            // 2. فتح mailto
            const receiverEmail = 'alsayed0852.as@gmail.com';
            const subject = `طلب تواصل جديد من ${name}`;
            const body = `الاسم: ${name}\nالبريد: ${email}\n\nالرسالة:\n${message}`;
            
            const mailtoLink = `mailto:${encodeURIComponent(receiverEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            
            // استخدام window.location لضمان الفتح
            window.location.href = mailtoLink;
            
            // 3. تحديث الواجهة
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="bi bi-check-circle"></i> ✓ تم الإرسال بنجاح';
                submitBtn.style.backgroundColor = '#28a745';
                
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.backgroundColor = '';
                    submitBtn.disabled = false;
                    form.reset();
                }, 4000);
            }
            
        } catch (error) {
            console.error("❌ خطأ مفصل:", error);
            console.error("Error code:", error.code);
            console.error("Error message:", error.message);
            
            // محاولة فتح mailto حتى لو فشل Firebase
            const receiverEmail = 'alsayed0852.as@gmail.com';
            const subject = `طلب تواصل جديد من ${name}`;
            const body = `الاسم: ${name}\nالبريد: ${email}\n\nالرسالة:\n${message}`;
            window.location.href = `mailto:${encodeURIComponent(receiverEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            
            alert('تم فتح برنامج الإيميل. ملاحظة: لم يتم الحفظ في قاعدة البيانات.');
            
            if (submitBtn) {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        }
    });
}


// ==========================================
// 7. Scroll Reveal (الأنيميشن)
// ==========================================
function initScrollReveal() {
    document.querySelectorAll('.fade-up, .fade-in').forEach(el => {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });
        observer.observe(el);
    });
}

// ==========================================
// 8. تبديل اللغة في صفحة تفاصيل المنتج
// ==========================================
// ==========================================
// 8. تبديل اللغة الذكي - يعمل في كل الصفحات
// ==========================================
// ==========================================
// 8. تبديل اللغة الذكي - يعمل مع أو بدون .html
// ==========================================
// ==========================================
// 8. تبديل اللغة الذكي - تطابق تام في نهاية المسار
// ==========================================
function initLanguageSwitcher() {
    const langSwitcher = document.getElementById('langSwitcher');
    if (!langSwitcher) return;
    
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    const baseUrl = window.location.origin;
    
    // نزيل .html للتعامل الموحد
    const pathClean = currentPath.replace('.html', '');
    
    console.log("🔍 المسار الحالي:", pathClean);
    
    // خريطة التحويل - الترتيب مهم: الأطول أولاً
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
    
    let matched = null;
    
    // نبحث عن التطابق التام في نهاية المسار
    for (const { from, to } of pageMap) {
        if (pathClean.endsWith('/' + from) || pathClean === '/' + from) {
            matched = { from, to };
            break;
        }
    }
    
    if (!matched) {
        console.warn("⚠️ لم يتم العثور على تطابق");
        return;
    }
    
    // نستبدل فقط الجزء المطابق في النهاية
    const newPath = pathClean.replace(new RegExp(matched.from + '$'), matched.to) + '.html';
    const newUrl = baseUrl + newPath + currentSearch;
    
    langSwitcher.href = newUrl;
    console.log(`🔄 ${matched.from} → ${matched.to}`);
    console.log("✅ الرابط الجديد:", newUrl);
}
// ==========================================
// التشغيل - ننتظر حتى يصبح DOM جاهزاً تماماً
// ==========================================
function initAll() {
    console.log("🚀 بدء تهيئة الموقع...");
    loadSiteSettings();
    initMobileMenu();
    initDropdowns();
    initHeaderScroll();
    initSmoothScroll();
    initContactForm();
    initScrollReveal();
    initLanguageSwitcher();
    console.log("✅ اكتملت التهيئة");
}

// نستخدم window.onload لضمان تحميل كل شيء
window.addEventListener('load', initAll);
// احتياطي: DOMContentLoaded أيضاً
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
} else {
    initAll();
}
