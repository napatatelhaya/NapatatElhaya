import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

let allProducts = [];

document.addEventListener('DOMContentLoaded', async () => {
    const productsContainer = document.querySelector('.products-grid');
    if (!productsContainer) return;

    const currentLang = document.documentElement.lang || 'en';
    const isArabic = currentLang === 'ar';

    try {
        productsContainer.innerHTML = isArabic 
            ? '<p style="text-align:center; width:100%; grid-column: 1 / -1;">جاري تحميل المنتجات... 🌿</p>' 
            : '<p style="text-align:center; width:100%; grid-column: 1 / -1;">Loading products... 🌿</p>';

        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            productsContainer.innerHTML = isArabic 
                ? '<p style="text-align:center; width:100%; grid-column: 1 / -1;">لا توجد منتجات حالياً.</p>' 
                : '<p style="text-align:center; width:100%; grid-column: 1 / -1;">No products available currently.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            data.docId = doc.id; 
            allProducts.push(data);
        });

        const urlParams = new URLSearchParams(window.location.search);
        const urlCategory = urlParams.get('category') || 'all';

        if (typeof window.updateActiveButton === 'function') {
            window.updateActiveButton(urlCategory);
        }

        renderProducts(urlCategory, isArabic);

    } catch (error) {
        console.error("Error fetching products:", error);
        productsContainer.innerHTML = isArabic 
            ? '<p style="text-align:center; width:100%; grid-column: 1 / -1;">حدث خطأ في تحميل البيانات.</p>' 
            : '<p style="text-align:center; width:100%; grid-column: 1 / -1;">Error loading data.</p>';
    }
});

function renderProducts(category, isArabic) {
    const productsContainer = document.querySelector('.products-grid');
    if (!productsContainer) return;

    productsContainer.innerHTML = '';
    
    const filteredProducts = category === 'all' 
        ? allProducts 
        : allProducts.filter(p => p.category === category);

    if (filteredProducts.length === 0) {
        productsContainer.innerHTML = isArabic 
            ? '<p style="text-align:center; width:100%; grid-column: 1 / -1;">لا توجد منتجات في هذا القسم.</p>' 
            : '<p style="text-align:center; width:100%; grid-column: 1 / -1;">No products in this category.</p>';
        return;
    }

    filteredProducts.forEach(product => {
        const productName = isArabic ? product.name.ar : product.name.en;
        const productDesc = isArabic ? product.description.ar : product.description.en;
        const whatsappMsg = isArabic ? `أريد الاستفسار عن منتج: ${productName}` : `I would like to inquire about: ${productName}`;
        
        let catName = '';
        if (product.category === 'herbs') catName = isArabic ? 'أعشاب' : 'Herbs';
        else if (product.category === 'spices') catName = isArabic ? 'توابل' : 'Spices';
        else if (product.category === 'seeds') catName = isArabic ? 'بذور' : 'Seeds';
        else catName = product.category;

        const originText = isArabic ? 'المنشأ: <strong>مصر</strong>' : 'Origin: <strong>Egypt</strong>';
        const linkText = isArabic ? 'استفسار ←' : 'Inquire →';
        const viewText = isArabic ? 'عرض التفاصيل' : 'View Details';

        // ✅ الحل: اختيار صفحة التفاصيل بناءً على لغة الصفحة الحالية
        const detailPage = isArabic ? 'product-detail.html' : 'product-detail-en.html';
        const detailUrl = `${detailPage}?id=${product.docId}`;

        const productCard = `
            <div class="product-card fade-in visible">
                <div class="product-image">
                    <img src="${product.image}" alt="${productName}">
                    <div class="product-overlay">
                        <a href="${detailUrl}" class="view-details-btn" title="${viewText}">
                            <i class="bi bi-eye-fill"></i>
                        </a>
                    </div>
                </div>
                <div class="product-info">
                    <div class="product-category">${catName}</div>
                    <h3 class="product-name">${productName}</h3>
                    <p class="product-desc">${productDesc}</p>
                    <div class="product-footer">
                        <div class="product-origin">${originText}</div>
                        <a href="https://wa.me/201067131398?text=${encodeURIComponent(whatsappMsg)}" target="_blank" class="product-link">${linkText}</a>
                    </div>
                </div>
            </div>
        `;
        productsContainer.innerHTML += productCard;
    });
}

window.filterProducts = function(category) {
    const isArabic = (document.documentElement.lang || 'en') === 'ar';
    renderProducts(category, isArabic);
    updateActiveButton(category);
    
    const newUrl = window.location.pathname + '?category=' + category;
    window.history.pushState({path:newUrl}, '', newUrl);
};

window.updateActiveButton = function(category) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    const activeBtn = Array.from(buttons).find(btn => btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(category));
    if (activeBtn) activeBtn.classList.add('active');
};
