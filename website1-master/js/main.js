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
    const socialDefs = [
        { key: 'facebook', icon: 'bi-facebook', label: 'Facebook' },
        { key: 'instagram', icon: 'bi-instagram', label: 'Instagram' },
        { key: 'linkedin', icon: 'bi-linkedin', label: 'LinkedIn' }
    ];

    function buildSocialHtml() {
        return socialDefs
            .filter(s => (social[s.key] || '').trim())
            .map(s => `<a href="${social[s.key].trim()}" target="_blank" rel="noopener noreferrer" class="social-link" title="${s.label}" aria-label="${s.label}"><i class="bi ${s.icon}"></i></a>`)
            .join('');
    }

    const socialHtml = buildSocialHtml();

    // أ) إضافة الأيقونات مع زر الواتساب العائم (شريط عمودي واحد)
    document.querySelectorAll('.whatsapp-float').forEach(btn => {
        if (btn.parentElement.querySelector('.social-float-stack')) return;
        if (!socialHtml) return;
        btn.classList.add('float-stack-item');
        const stack = document.createElement('div');
        stack.className = 'social-float-stack';
        stack.innerHTML = socialHtml;
        btn.insertAdjacentElement('afterend', stack);
    });

    // ب) قسم تواصل اجتماعي في الفوتر (صفحات index / en)
    document.querySelectorAll('footer .container').forEach(c => {
        if (c.querySelector('.footer-social') || !socialHtml) return;
        const div = document.createElement('div');
        div.className = 'footer-social';
        div.innerHTML = socialHtml;
        c.appendChild(div);
    });

    // ج) قسم تواصل اجتماعي في بطاقات صفحة اتصل بنا
    document.querySelectorAll('.contact-info-cards, .contact-info').forEach(c => {
        if (c.querySelector('.footer-social') || !socialHtml) return;
        const div = document.createElement('div');
        div.className = 'footer-social';
        div.style.cssText = 'display:flex;gap:12px;margin-top:15px;justify-content:center;width:100%;';
        div.innerHTML = socialHtml;
        c.appendChild(div);
    });
}

// ==========================================
// 2. قائمة الجوال (البرجر منيو)
// ==========================================
function initMobileMenu() {
    const toggle = document.getElementById('mobileToggle');
    const nav = document.getElementById('mainNav');
    if (!toggle || !nav) return;
    
    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggle.classList.toggle('active');
        nav.classList.toggle('active');
    });
    
    // إغلاق القائمة عند النقر على أي رابط
    nav.querySelectorAll('a:not(.dropdown-toggle)').forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            nav.classList.remove('active');
        });
    });
}

// ==========================================
// 3. القائمة المنسدلة في الهاتف (الحل الجديد)
// ==========================================
function initMobileDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        if (toggle) {
            toggle.addEventListener('click', function(e) {
                // تفعيل هذا السلوك فقط على شاشات الهاتف (أقل من 968px)
                if (window.innerWidth <= 968) {
                    e.preventDefault(); // منع الانتقال للرابط
                    e.stopPropagation(); // منع إغلاق القائمة الرئيسية فوراً
                    
                    // إغلاق أي قوائم منسدلة أخرى مفتوحة
                    dropdowns.forEach(d => {
                        if (d !== dropdown) d.classList.remove('active');
                    });
                    
                    // تبديل حالة القائمة الحالية (فتح/إغلاق)
                    dropdown.classList.toggle('active');
                }
            });
        }
    });

    // إغلاق القوائم المنسدلة عند النقر في أي مكان خارجها
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('active'));
        }
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
        
        const receiverEmail = 'info@napatatelhaya.com';
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
