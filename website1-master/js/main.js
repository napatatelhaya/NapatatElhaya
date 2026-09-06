// ==========================================
// 1. الاستيراد الصحيح والكامل (تمت إضافة دوال الحفظ في قاعدة البيانات)
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, doc, getDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// ==========================================
// 2. تهيئة Firebase بالمفاتيح الجديدة المحدثة
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
// 3. دالة تحميل إعدادات الموقع (اللوجو والاسم)
// ==========================================
async function loadSiteSettings() {
    try {
        const snap = await getDoc(doc(db, 'settings', 'general'));
        if (snap.exists()) {
            const data = snap.data();
            
            // تحديث اللوجو
            if (data.logo) {
                document.querySelectorAll('.logo-icon').forEach(el => {
                    el.innerHTML = `<img src="${data.logo}" alt="Logo" style="width:100%; height:100%; object-fit:cover; border-radius:50%; display:block;">`;
                });
            }
            
            // تحديث الاسم
            const isAr = document.documentElement.lang === 'ar';
            const name = isAr ? data.companyNameAr : data.companyNameEn;
            if (name) {
                document.querySelectorAll('.logo-text').forEach(el => {
                    const parts = name.trim().split(' ');
                    const firstWord = parts[0];
                    const restOfWords = parts.slice(1).join(' ');
                    el.innerHTML = `${firstWord} <span>${restOfWords}</span>`;
                });
            }
        }
    } catch (error) {
        console.error("خطأ في تحميل الإعدادات:", error);
    }
}

// ==========================================
// 4. التشغيل عند جاهزية الصفحة
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    
    // استدعاء فوري لدالة تحميل الإعدادات
    await loadSiteSettings();

    // ==========================================
    // أ: تأثير تصغير الهيدر عند التمرير
    // ==========================================
    const header = document.getElementById('mainHeader') || document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    // ==========================================
    // ب: التمرير الناعم للروابط الداخلية (Smooth Anchor Scroll)
    // ==========================================
    const headerHeight = header ? header.offsetHeight : 80;
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId.length < 2) return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ==========================================
    // ج: برمجة قائمة الجوال (Hamburger Menu)
    // ==========================================
    const mobileToggle = document.getElementById('mobileToggle') || document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav') || document.getElementById('navMenu');
    
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

    // ==========================================
    // د: برمجة القائمة المنسدلة (Dropdown) الذكية
    // ==========================================
    document.querySelectorAll('.dropdown').forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        if (toggle) {
            toggle.addEventListener('click', function(e) {
                if (window.innerWidth <= 968) {
                    e.preventDefault();
                    dropdown.classList.toggle('active');
                }
            });
        }
    });

    document.addEventListener('click', function(e) {
        document.querySelectorAll('.dropdown').forEach(dropdown => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    });

    // ==========================================
        // ==========================================
    // هـ: معالجة نموذج الاتصال (Contact Form) - [مُحسّن ومضمون]
    // ==========================================
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;

            // البحث المرن عن الحقول (بالـ ID أو بالـ name أو بنوع الحقل)
            const nameInput = document.getElementById('clientName') || contactForm.querySelector('input[name="name"], input[type="text"]');
            const emailInput = document.getElementById('clientEmail') || contactForm.querySelector('input[name="email"], input[type="email"]');
            const messageInput = document.getElementById('clientMessage') || contactForm.querySelector('textarea, input[name="message"]');

            const name = nameInput ? nameInput.value.trim() : 'غير معروف';
            const email = emailInput ? emailInput.value.trim() : 'غير معروف';
            const message = messageInput ? messageInput.value.trim() : 'لا توجد رسالة';

            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> جاري الإرسال...';

                // 1. الحفظ في قاعدة البيانات (لتظهر في لوحة التحكم)
                await addDoc(collection(db, 'inquiries'), {
                    name: name,
                    email: email,
                    message: message,
                    createdAt: serverTimestamp()
                });

                // 2. فتح تطبيق البريد (mailto)
                const receiverEmail = 'alsayed0852.as@gmail.com';
                const currentLang = document.documentElement.lang;
                const subjectTitle = currentLang === 'en' ? 'New Inquiry - ' : 'طلب تواصل جديد - ';
                const subject = encodeURIComponent(`${subjectTitle} ${name}`);
                const body = encodeURIComponent(`الاسم: ${name}\nالبريد: ${email}\n\nالرسالة:\n${message}`);
                
                // استخدام window.location لضمان التوافق مع جميع المتصفحات
                window.location.href = `mailto:${receiverEmail}?subject=${subject}&body=${body}`;

                // 3. تحديث الواجهة
                submitBtn.innerHTML = '<i class="bi bi-check-circle"></i> تم الإرسال بنجاح ✓';
                submitBtn.style.backgroundColor = 'var(--success, #28a745)';

                setTimeout(() => {
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.style.backgroundColor = '';
                    submitBtn.disabled = false;
                    contactForm.reset();
                }, 4000);

            } catch (error) {
                console.error("خطأ في إرسال نموذج الاتصال:", error);
                alert("عذراً، حدث خطأ أثناء الإرسال. يرجى المحاولة لاحقاً أو التواصل عبر واتساب.");
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }
    // ==========================================
    // و: مراقب التمرير لإظهار العناصر بنعومة (Scroll Reveal)
    // ==========================================
    const revealElements = document.querySelectorAll('.fade-up, .fade-in');
    revealElements.forEach(el => {
        new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }).observe(el);
    });
});
