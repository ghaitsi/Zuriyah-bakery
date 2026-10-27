document.addEventListener('DOMContentLoaded', () => {

    // ==========================
    // 1. THEME TOGGLE
    // ==========================
    const themeToggle = document.getElementById('themeToggle');
    const htmlEl = document.documentElement;

    if (localStorage.getItem('theme') === 'dark') {
        htmlEl.setAttribute('data-theme', 'dark');
        themeToggle.setAttribute('aria-pressed', 'true');
    }

    themeToggle?.addEventListener('click', () => {
        const isDark = htmlEl.getAttribute('data-theme') === 'dark';
        if (isDark) {
            htmlEl.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            themeToggle.setAttribute('aria-pressed', 'false');
        } else {
            htmlEl.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeToggle.setAttribute('aria-pressed', 'true');
        }
    });

    // ==========================
    // 2. MOBILE MENU TOGGLE
    // ==========================
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('nav-menu');

    menuToggle?.addEventListener('click', () => {
        const isOpen = navMenu.classList.toggle('is-open');
        menuToggle.setAttribute('aria-expanded', isOpen);
        document.body.classList.toggle('menu-open', isOpen);
    });

    navMenu?.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('is-open');
            menuToggle.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('menu-open');
        });
    });

    // ==========================
    // 3. SCROLL TOP & YEAR
    // ==========================
    const scrollTop = document.getElementById('scrollTop');
    window.addEventListener('scroll', () => {
        scrollTop.classList.toggle('is-visible', window.scrollY > 400);
    }, { passive: true });
    scrollTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // ==========================
    // 4. TOAST NOTIFICATION
    // ==========================
    const toast = document.getElementById('toast');
    let toastTimeout;

    function showToast(message, type = 'success') {
        clearTimeout(toastTimeout);
        toast.innerHTML = `
            <div class="toast-icon ${type === 'error' ? 'error' : ''}">${type === 'error' ? '!' : '✓'}</div>
            <span>${message}</span>
        `;
        toast.classList.add('is-visible');
        toastTimeout = setTimeout(() => {
            toast.classList.remove('is-visible');
        }, 2500);
    }

    // ==========================
    // 5. CART SYSTEM (Fitur Baru)
    // ==========================
    let cart = JSON.parse(localStorage.getItem('zuriyahCart')) || [];

    const cartBtn = document.getElementById('cartBtn');
    const cartCount = document.getElementById('cartCount');
    const cartDrawer = document.getElementById('cartDrawer');
    const cartBackdrop = document.getElementById('cartBackdrop');
    const cartClose = document.getElementById('cartClose');
    const cartItemsEl = document.getElementById('cartItems');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartTotalEl = document.getElementById('cartTotal');
    const btnCheckout = document.getElementById('btnCheckout');

    function formatRupiah(num) {
        return 'Rp ' + num.toLocaleString('id-ID');
    }

    function updateCartCount() {
        const total = cart.reduce((sum, item) => sum + item.qty, 0);
        cartCount.textContent = total;
        cartCount.classList.toggle('is-visible', total > 0);
    }

    function renderCart() {
        updateCartCount();
        cartItemsEl.innerHTML = '';

        if (cart.length === 0) {
            cartEmpty.style.display = 'flex';
            cartItemsEl.style.display = 'none';
            cartTotalEl.textContent = 'Rp 0';
            btnCheckout.disabled = true;
            return;
        }

        cartEmpty.style.display = 'none';
        cartItemsEl.style.display = 'flex';
        btnCheckout.disabled = false;

        let total = 0;

        cart.forEach(item => {
            const subtotal = item.price * item.qty;
            total += subtotal;

            const el = document.createElement('div');
            el.className = 'cart-item';
            el.innerHTML = `
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${formatRupiah(item.price)}</div>
                    <div class="cart-item-controls">
                        <button class="qty-btn" data-action="decrease" data-id="${item.id}">−</button>
                        <span class="qty-value">${item.qty}</span>
                        <button class="qty-btn" data-action="increase" data-id="${item.id}">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" data-action="remove" data-id="${item.id}" aria-label="Hapus item">×</button>
            `;
            cartItemsEl.appendChild(el);
        });

        cartTotalEl.textContent = formatRupiah(total);
    }

    function addToCart(product) {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            existing.qty++;
        } else {
            cart.push({ ...product, qty: 1 });
        }
        localStorage.setItem('zuriyahCart', JSON.stringify(cart));
        renderCart();
        showToast(`${product.name} ditambahkan ke keranjang!`);
    }

    // Open/Close Cart
    function openCart() {
        cartDrawer.classList.add('is-open');
        cartBackdrop.classList.add('is-visible');
        cartDrawer.setAttribute('aria-hidden', 'false');
        document.body.classList.add('cart-open');
    }

    function closeCart() {
        cartDrawer.classList.remove('is-open');
        cartBackdrop.classList.remove('is-visible');
        cartDrawer.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('cart-open');
    }

    cartBtn?.addEventListener('click', openCart);
    cartClose?.addEventListener('click', closeCart);
    cartBackdrop?.addEventListener('click', closeCart);

    // Cart controls (event delegation)
    cartItemsEl?.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;

        const id = parseInt(btn.dataset.id);
        const action = btn.dataset.action;
        const item = cart.find(i => i.id === id);
        if (!item) return;

        if (action === 'increase') item.qty++;
        else if (action === 'decrease') {
            item.qty--;
            if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
        } else if (action === 'remove') {
            cart = cart.filter(i => i.id !== id);
            showToast('Item dihapus dari keranjang', 'error');
        }

        localStorage.setItem('zuriyahCart', JSON.stringify(cart));
        renderCart();
    });

    // Checkout via WhatsApp
    btnCheckout?.addEventListener('click', () => {
        if (cart.length === 0) return;

        let message = 'Halo ZURIYAH Bakery, saya mau pesan:%0A%0A';
        let total = 0;

        cart.forEach((item, index) => {
            const subtotal = item.price * item.qty;
            total += subtotal;
            message += `${index + 1}. ${item.name} (${item.qty}x) - ${formatRupiah(subtotal)}%0A`;
        });

        message += `%0A*Total: ${formatRupiah(total)}*%0A%0AMohon info ketersediaan dan ongkirnya ya. Terima kasih!`;

        window.open(`https://wa.me/6281554016406?text=${message}`, '_blank');
    });

    // Add to Cart buttons
    document.querySelectorAll('[data-add-cart]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            if (!card) return;
            addToCart({
                id: parseInt(card.dataset.id),
                name: card.dataset.name,
                price: parseInt(card.dataset.price),
                image: card.dataset.image
            });
        });
    });

    // ==========================
    // 6. QUICK VIEW MODAL (Fitur Baru)
    // ==========================
    const quickviewModal = document.getElementById('quickviewModal');
    const quickviewClose = document.getElementById('quickviewClose');
    const qvImage = document.getElementById('qvImage');
    const qvTag = document.getElementById('qvTag');
    const qvTitle = document.getElementById('qvTitle');
    const qvDesc = document.getElementById('qvDesc');
    const qvPrice = document.getElementById('qvPrice');
    const qvAddCart = document.getElementById('qvAddCart');
    const qvWaLink = document.getElementById('qvWaLink');

    let currentProduct = null;

    function openQuickview(card) {
        currentProduct = {
            id: parseInt(card.dataset.id),
            name: card.dataset.name,
            price: parseInt(card.dataset.price),
            image: card.dataset.image
        };

        qvImage.src = card.dataset.image;
        qvImage.alt = card.dataset.name;
        qvTag.textContent = card.querySelector('.product-tag')?.textContent || 'Signature';
        qvTitle.textContent = card.dataset.name;
        qvDesc.textContent = card.querySelector('.product-content p').textContent;
        qvPrice.textContent = formatRupiah(card.dataset.price);
        qvWaLink.href = `https://wa.me/6281554016406?text=Halo,%20saya%20mau%20pesan%20${encodeURIComponent(card.dataset.name)}`;

        quickviewModal.classList.add('is-open');
        quickviewModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    }

    function closeQuickview() {
        quickviewModal.classList.remove('is-open');
        quickviewModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        currentProduct = null;
    }

    document.querySelectorAll('[data-open-quickview]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = e.target.closest('.product-card');
            if (card) openQuickview(card);
        });
    });

    quickviewClose?.addEventListener('click', closeQuickview);
    quickviewModal?.querySelector('[data-close-quickview]')?.addEventListener('click', closeQuickview);

    qvAddCart?.addEventListener('click', () => {
        if (currentProduct) {
            addToCart(currentProduct);
            closeQuickview();
        }
    });

    // ESC to close all modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (quickviewModal.classList.contains('is-open')) closeQuickview();
            if (cartDrawer.classList.contains('is-open')) closeCart();
        }
    });

    // ==========================
    // 7. SEARCH, FILTER, SORT (dengan Highlight)
    // ==========================
    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');
    const filterGroup = document.getElementById('filterGroup');
    const sortSelect = document.getElementById('sortSelect');
    const productGrid = document.getElementById('productGrid');
    const productCards = Array.from(document.querySelectorAll('.product-card'));
    const resultInfo = document.getElementById('resultInfo');
    const emptyState = document.getElementById('emptyState');

    let activeFilter = localStorage.getItem('menuFilter') || 'all';
    let searchQuery = '';
    let activeSort = 'default';

    // Simpan teks asli nama produk untuk highlight
    const originalNames = new Map();
    productCards.forEach(card => {
        const h3 = card.querySelector('.product-content h3');
        originalNames.set(card, h3.textContent);
    });

    // Set filter dari localStorage
    if (activeFilter !== 'all') {
        filterGroup.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('is-active');
            btn.setAttribute('aria-selected', 'false');
            if (btn.dataset.filter === activeFilter) {
                btn.classList.add('is-active');
                btn.setAttribute('aria-selected', 'true');
            }
        });
    }

    function highlightText(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<mark class="search-highlight">$1</mark>');
    }

    function applyFilters() {
        let visibleCount = 0;
        const visibleCards = [];

        productCards.forEach(card => {
            const category = card.dataset.category;
            const name = card.dataset.name.toLowerCase();
            const matchCategory = (activeFilter === 'all' || category === activeFilter);
            const matchSearch = name.includes(searchQuery.toLowerCase());

            // Highlight nama produk
            const h3 = card.querySelector('.product-content h3');
            if (matchSearch && searchQuery) {
                h3.innerHTML = highlightText(originalNames.get(card), searchQuery);
            } else {
                h3.textContent = originalNames.get(card);
            }

            if (matchCategory && matchSearch) {
                card.classList.remove('hidden');
                visibleCards.push(card);
                visibleCount++;
            } else {
                card.classList.add('hidden');
            }
        });

        // Sort
        if (activeSort !== 'default') {
            visibleCards.sort((a, b) => {
                const nameA = a.dataset.name.toLowerCase();
                const nameB = b.dataset.name.toLowerCase();
                const priceA = parseInt(a.dataset.price) || 0;
                const priceB = parseInt(b.dataset.price) || 0;

                switch (activeSort) {
                    case 'name-asc': return nameA.localeCompare(nameB);
                    case 'name-desc': return nameB.localeCompare(nameA);
                    case 'price-asc': return priceA - priceB;
                    case 'price-desc': return priceB - priceA;
                    default: return 0;
                }
            });
            visibleCards.forEach(card => productGrid.appendChild(card));
        } else {
            productCards.forEach(card => productGrid.appendChild(card));
        }

        // Result info
        if (visibleCount === 0) {
            emptyState.hidden = false;
            resultInfo.hidden = true;
            productGrid.style.display = 'none';
        } else {
            emptyState.hidden = true;
            productGrid.style.display = 'grid';

            if (activeFilter !== 'all' || searchQuery !== '' || activeSort !== 'default') {
                resultInfo.hidden = false;
                resultInfo.innerHTML = `Menampilkan <strong>${visibleCount}</strong> produk`;
            } else {
                resultInfo.hidden = true;
            }
        }
    }

    searchInput?.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        searchClear.hidden = searchQuery.length === 0;
        applyFilters();
    });

    searchClear?.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        searchClear.hidden = true;
        searchInput.focus();
        applyFilters();
    });

    filterGroup?.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
            filterGroup.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('is-active');
                btn.setAttribute('aria-selected', 'false');
            });
            e.target.classList.add('is-active');
            e.target.setAttribute('aria-selected', 'true');
            activeFilter = e.target.dataset.filter;
            localStorage.setItem('menuFilter', activeFilter);
            applyFilters();
        }
    });

    sortSelect?.addEventListener('change', (e) => {
        activeSort = e.target.value;
        applyFilters();
    });

    // ==========================
    // INIT
    // ==========================
    renderCart();
    applyFilters();
});