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
// 1. تحميل الإعدادات (سريع مع التخزين المؤقت)
// ==========================================
async function loadSiteSettings() {
    // ✅ التخزين المؤقت أصبح "عرض فوري" فقط — يتم دائمًا جلب أحدث بيانات من Firestore
    // بحيث أي تغيير من لوحة التحكم يظهر فورًا عند إعادة تحميل الصفحة.
    const cachedSettings = sessionStorage.getItem('siteSettings');
    if (cachedSettings) {
        applySettingsToDOM(JSON.parse(cachedSettings));
    }
    try {
        const snap = await getDoc(doc(db, 'settings', 'general'));
        if (snap.exists()) {
            const data = snap.data();
            sessionStorage.setItem('siteSettings', JSON.stringify(data));
            applySettingsToDOM(data);
        }
    } catch (error) {
        if (!cachedSettings) {
            console.warn("⚠️ تعذر تحميل الإعدادات:", error);
        }
    }
}

// ✅ تنسيق رقم الهاتف للعرض مثل: +20 106 713 1398
function formatPhoneDisplay(phone) {
    const p = String(phone || '').replace(/\D/g, '');
    if (!p) return '';
    if (p.length === 12 && p.startsWith('20')) {
        return `+${p.slice(0, 2)} ${p.slice(2, 5)} ${p.slice(5, 8)} ${p.slice(8)}`;
    }
    return `+${p}`;
}

function applySettingsToDOM(data) {
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

    // ==========================================
    // ✅ 1. أرقام الهاتف / واتساب القادمة من لوحة التحكم
    // ==========================================
    const waMain = String(data.whatsappMain || '').replace(/\D/g, '');
    const waSecondary = String(data.whatsappSecondary || '').replace(/\D/g, '');

    // زر الواتساب العائم في كل الصفحات
    document.querySelectorAll('.whatsapp-float').forEach(a => {
        a.href = `https://wa.me/${waMain || '201096413175'}`;
    });

    // روابط tel: داخل بطاقات الاتصال (الرئيسية / من نحن)
    const telLinks = document.querySelectorAll('.phone-numbers a[href^="tel:"]');
    telLinks.forEach((a, i) => {
        const num = (i === 0 ? waMain : waSecondary) || a.getAttribute('href').replace(/\D/g, '');
        a.href = `tel:+${num}`;
        a.textContent = formatPhoneDisplay(num);
    });

    // روابط wa.me داخل بطاقة الهاتف في صفحة اتصل بنا
    const waCardLinks = document.querySelectorAll('.info-card a[href^="https://wa.me/"]');
    waCardLinks.forEach((a, i) => {
        const num = (i === 0 ? waMain : waSecondary) || a.getAttribute('href').replace(/\D/g, '');
        a.href = `https://wa.me/${num}`;
        a.textContent = formatPhoneDisplay(num);
    });

    // رابط واتساب في صفحة تفاصيل المنتج
    const productWa = document.getElementById('whatsappLink');
    if (productWa && waMain) {
        productWa.dataset.waNumber = waMain; // يستخدمه كود الصفحة لبناء رابط الاستفسار
    }

    // ==========================================
    // ✅ 2. البريد الإلكتروني القادم من لوحة التحكم
    // ==========================================
    const email = (data.email || '').trim();
    if (email) {
        document.querySelectorAll('a[href^="mailto:"]').forEach(a => {
            a.href = `mailto:${email}`;
            // تحديث النص المعروض فقط إذا كان بريدًا وليس نصًا آخر (مثل رابط "رد")
            if (a.textContent.includes('@')) a.textContent = email;
        });
    }

    // ==========================================
    // ✅ 3. روابط التواصل الاجتماعي (فيسبوك / إنستجرام / لينكدإن)
    // تُضاف تلقائيًا بجانب أيقونة الواتساب العائمة، وفي الفوتر أيضًا.
    // ==========================================
    const social = data.social || {};
    // ملاحظة: تُستخدم أيقونات SVG مدمجة بدل مكتبة الأيقونات لضمان ظهورها دائمًا
    const SOCIAL_ICONS_SVG = {
        facebook: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M13.5 21.9v-7.4h2.5l.4-2.9h-2.9V9.9c0-.85.23-1.43 1.45-1.43H16.6V5.9c-.3-.04-1.3-.12-2.46-.12-2.44 0-4.1 1.49-4.1 4.22v2.36H7.5v2.9h2.54v7.4H13.5z"/></svg>',
        instagram: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="2.5" width="19" height="19" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.8" cy="6.2" r="1.2" fill="currentColor" stroke="none"/></svg>',
        linkedin: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3.2 9.2h3.6V21H3.2V9.2zm6.3 0h3.45v1.62h.05c.48-.9 1.65-1.86 3.4-1.86 3.63 0 4.3 2.38 4.3 5.48V21h-3.6v-5.9c0-1.4-.03-3.22-1.96-3.22-1.97 0-2.27 1.53-2.27 3.13V21H9.5V9.2z"/></svg>'
    };
    const socialDefs = [
        { key: 'facebook', label: 'Facebook' },
        { key: 'instagram', label: 'Instagram' },
        { key: 'linkedin', label: 'LinkedIn' }
    ];

    function buildSocialHtml() {
        return socialDefs
            .filter(s => (social[s.key] || '').trim())
            .map(s => `<a href="${social[s.key].trim()}" target="_blank" rel="noopener noreferrer" class="social-link social-${s.key}" title="${s.label}" aria-label="${s.label}">${SOCIAL_ICONS_SVG[s.key]}</a>`)
            .join('');
    }

    const socialHtml = buildSocialHtml();

    // أ) شريط أيقونات عائم مستقل — يُنشأ دائمًا في body ويظهر فقط إذا وُجدت روابط في لوحة التحكم
    let floatStack = document.querySelector('.social-float-stack');
    if (!floatStack) {
        floatStack = document.createElement('div');
        floatStack.className = 'social-float-stack';
        document.body.appendChild(floatStack);
    }
    floatStack.innerHTML = socialHtml;
    floatStack.style.display = socialHtml ? 'flex' : 'none';
    // محاذاة الشريط تلقائيًا مع زر الواتساب في نفس الصفحة (يمينًا أو يسارًا)
    const waBtn = document.querySelector('.whatsapp-float');
    if (waBtn) {
        const waLeft = parseFloat(getComputedStyle(waBtn).left) || 0;
        const waRight = getComputedStyle(waBtn).right;
        if ((isNaN(waLeft) || waLeft === 0) && waRight !== 'auto') {
            floatStack.classList.add('stack-right');
        } else {
            floatStack.classList.remove('stack-right');
        }
    }

    // ب) قسم تواصل اجتماعي داخل الفوتر في كل الصفحات
    document.querySelectorAll('footer').forEach(f => {
        const c = f.querySelector('.container') || f;
        let box = c.querySelector('.footer-social');
        if (!box) {
            box = document.createElement('div');
            box.className = 'footer-social';
            c.appendChild(box);
        }
        box.innerHTML = socialHtml;
        box.style.display = socialHtml ? 'flex' : 'none';
    });

    // ج) قسم تواصل اجتماعي في صفحة اتصل بنا (بطاقات المعلومات)
    document.querySelectorAll('.contact-info-cards, .contact-info').forEach(c => {
        let box = c.querySelector('.footer-social');
        if (!box) {
            box = document.createElement('div');
            box.className = 'footer-social';
            c.appendChild(box);
        }
        box.innerHTML = socialHtml;
        box.style.display = socialHtml ? 'flex' : 'none';
    });
}

// ==========================================
// 4. نموذج الاتصال (mailto فقط)
// ==========================================
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const nameInput = document.getElementById('clientName');
        const emailInput = document.getElementById('clientEmail');
        const messageInput = document.getElementById('clientMessage');
        
        if (!nameInput || !emailInput || !messageInput) return;
        
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const message = messageInput.value.trim();
        
        if (!name || !email || !message) {
            alert('يرجى ملء جميع الحقول المطلوبة');
            return;
        }
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.innerHTML : 'إرسال الرسالة';
        
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'جاري الفتح...';
        }
        
        // ✅ بريد المستلم قادم من لوحة التحكم (settings/general → email)
        const cached = sessionStorage.getItem('siteSettings');
        let receiverEmail = 'info@napatatelhaya.com';
        try {
            if (cached) {
                const s = JSON.parse(cached);
                if ((s.email || '').trim()) receiverEmail = s.email.trim();
            }
        } catch (e) { /* تجاهل */ }
        const subject = encodeURIComponent(`طلب تواصل جديد من: ${name}`);
        const body = encodeURIComponent(`الاسم: ${name}\nالبريد الإلكتروني: ${email}\n\nالرسالة:\n${message}`);
        
        window.location.href = `mailto:${receiverEmail}?subject=${subject}&body=${body}`;
        
        if (submitBtn) {
            submitBtn.innerHTML = '✓ تم الفتح';
            submitBtn.style.backgroundColor = '#28a745';
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.style.backgroundColor = '';
                submitBtn.disabled = false;
                form.reset();
            }, 3000);
        }
    });
}

// ==========================================
// 5. الأنيميشن وتصغير الهيدر
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
        }, { threshold: 0.1 });
        observer.observe(el);
    });
}

function initHeaderScroll() {
    const header = document.getElementById('mainHeader');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        }, { passive: true });
    }
}

// ==========================================
// 6. تبديل اللغة الذكي
// ==========================================
function initLanguageSwitcher() {
    const langSwitcher = document.getElementById('langSwitcher');
    if (!langSwitcher) return;
    
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    const baseUrl = window.location.origin;
    
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
    const pathParts = currentPath.split('/');
    const lastPart = pathParts[pathParts.length - 1].replace('.html', '');
    
    for (const { from, to } of pageMap) {
        if (lastPart === from || lastPart.includes(from)) {
            newPath = currentPath.replace(from, to);
            break;
        }
    }
    
    if (newPath) {
        if (!newPath.endsWith('.html')) newPath += '.html';
        langSwitcher.href = baseUrl + newPath + currentSearch;
    }
}

// ==========================================
// 7. التشغيل
// ==========================================
function initAll() {
    loadSiteSettings();
    initMobileMenu();
    initMobileDropdowns(); // تفعيل منطق القائمة المنسدلة للهاتف
    initContactForm();
    initScrollReveal();
    initHeaderScroll();
    initLanguageSwitcher();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => requestAnimationFrame(initAll));
} else {
    requestAnimationFrame(initAll);
}
