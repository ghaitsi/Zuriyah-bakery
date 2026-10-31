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
    // 3. SCROLL TOP, FLOATING CART JUMP, & YEAR
    // ==========================
    const scrollTop = document.getElementById('scrollTop');
    const floatingCartJump = document.getElementById('floatingCartJump');
    
    window.addEventListener('scroll', () => {
        scrollTop.classList.toggle('is-visible', window.scrollY > 400);
        
        const hasItems = JSON.parse(localStorage.getItem('zuriyahCart') || '[]').length > 0;
        floatingCartJump?.classList.toggle('is-visible', window.scrollY > 600 && hasItems);
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
    // 5. CART SYSTEM
    // ==========================
    let cart = JSON.parse(localStorage.getItem('zuriyahCart')) || [];

    const cartBtn = document.getElementById('cartBtn');
    const cartCount = document.getElementById('cartCount');
    const floatingCartBadge = document.getElementById('floatingCartBadge');
    const cartDrawer = document.getElementById('cartDrawer');
    const cartBackdrop = document.getElementById('cartBackdrop');
    const cartClose = document.getElementById('cartClose');
    const cartItemsEl = document.getElementById('cartItems');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartTotalEl = document.getElementById('cartTotal');
    const btnCheckout = document.getElementById('btnCheckout');
    const btnClearAll = document.getElementById('btnClearAll');
    const btnShopAgain = document.getElementById('btnShopAgain');

    // ==========================
    // 5b. PAYMENT SYSTEM
    // ==========================
    const paymentSection = document.getElementById('paymentSection');
    const paymentOptions = document.querySelectorAll('.payment-option');
    const paymentModal = document.getElementById('paymentModal');
    const paymentModalClose = document.getElementById('paymentModalClose');
    const paymentModalTitle = document.getElementById('paymentModalTitle');
    const paymentModalSubtitle = document.getElementById('paymentModalSubtitle');
    const paymentModalAmount = document.getElementById('paymentModalAmount');
    const paymentModalMethod = document.getElementById('paymentModalMethod');
    const paymentModalNumber = document.getElementById('paymentModalNumber');
    const paymentModalSteps = document.getElementById('paymentModalSteps');
    const paymentModalIcon = document.getElementById('paymentModalIcon');
    const btnPaymentCopy = document.getElementById('btnPaymentCopy');
    const paymentWaConfirm = document.getElementById('paymentWaConfirm');

    // Nomor pembayaran ZURIYAH (bisa kamu ubah sesuai kebutuhan)
    const PAYMENT_NUMBER = '0815-5401-6406';
    const PAYMENT_NUMBER_RAW = '081554016406';

    let selectedPayment = localStorage.getItem('zuriyahPayment') || 'DANA';
    let currentPaymentTotal = 0;

    // Data metode pembayaran
    const PAYMENT_METHODS = {
        'DANA': {
            icon: '💙',
            number: PAYMENT_NUMBER,
            steps: [
                'Buka aplikasi DANA di HP kamu.',
                'Pilih menu "Kirim" atau "Transfer".',
                'Masukkan nomor tujuan yang tertera.',
                'Masukkan nominal sesuai total pembayaran.',
                'Konfirmasi dan selesaikan pembayaran.'
            ]
        },
        'GoPay': {
            icon: '💚',
            number: PAYMENT_NUMBER,
            steps: [
                'Buka aplikasi Gojek, pilih menu GoPay.',
                'Pilih "Bayar" atau "Transfer ke Bank / e-Wallet".',
                'Masukkan nomor tujuan yang tertera.',
                'Masukkan nominal sesuai total pembayaran.',
                'Konfirmasi dan selesaikan pembayaran.'
            ]
        },
        'OVO': {
            icon: '💜',
            number: PAYMENT_NUMBER,
            steps: [
                'Buka aplikasi OVO di HP kamu.',
                'Pilih menu "Transfer" atau "Kirim OVO".',
                'Masukkan nomor tujuan yang tertera.',
                'Masukkan nominal sesuai total pembayaran.',
                'Konfirmasi dan selesaikan pembayaran.'
            ]
        }
    };

    function formatRupiah(num) {
        return 'Rp ' + num.toLocaleString('id-ID');
    }

    function updateCartCount() {
        const total = cart.reduce((sum, item) => sum + item.qty, 0);
        cartCount.textContent = total;
        cartCount.classList.toggle('is-visible', total > 0);
        
        if (floatingCartBadge) {
            floatingCartBadge.textContent = total;
            if (total === 0) floatingCartJump.classList.remove('is-visible');
        }
    }

    // Update tampilan tombol pembayaran yang aktif
    function updatePaymentOptionsUI() {
        paymentOptions.forEach(btn => {
            const isActive = btn.dataset.payment === selectedPayment;
            btn.classList.toggle('is-active', isActive);
            btn.setAttribute('aria-checked', isActive);
        });
    }

    // Hitung total dari cart
    function getCartTotal() {
        return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    }

    function renderCart() {
        updateCartCount();
        cartItemsEl.innerHTML = '';

        if (cart.length === 0) {
            cartEmpty.style.display = 'flex';
            cartItemsEl.style.display = 'none';
            cartTotalEl.textContent = 'Rp 0';
            btnCheckout.disabled = true;
            btnClearAll.style.display = 'none';
            if (paymentSection) paymentSection.style.display = 'none';
            return;
        }

        cartEmpty.style.display = 'none';
        cartItemsEl.style.display = 'flex';
        btnCheckout.disabled = false;
        btnClearAll.style.display = 'inline-flex';
        if (paymentSection) paymentSection.style.display = 'block';

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
                        <input type="number" class="qty-input" data-id="${item.id}" value="${item.qty}" min="1" max="999" aria-label="Jumlah">
                        <button class="qty-btn" data-action="increase" data-id="${item.id}">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" data-action="remove" data-id="${item.id}" aria-label="Hapus item">×</button>
            `;
            cartItemsEl.appendChild(el);
        });

        cartTotalEl.textContent = formatRupiah(total);
        updatePaymentOptionsUI();
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
        
        cartBtn.classList.remove('bounce');
        void cartBtn.offsetWidth; 
        cartBtn.classList.add('bounce');
    }

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

    floatingCartJump?.addEventListener('click', openCart);
    btnShopAgain?.addEventListener('click', closeCart);

    // Pilih metode pembayaran
    paymentOptions.forEach(btn => {
        btn.addEventListener('click', () => {
            selectedPayment = btn.dataset.payment;
            localStorage.setItem('zuriyahPayment', selectedPayment);
            updatePaymentOptionsUI();
            showToast(`Metode pembayaran: ${selectedPayment}`);
        });
    });

    btnClearAll?.addEventListener('click', () => {
        if (confirm('Yakin mau hapus semua item di keranjang?')) {
            cart = [];
            localStorage.setItem('zuriyahCart', JSON.stringify(cart));
            renderCart();
            showToast('Semua item dihapus', 'error');
        }
    });

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
            if (item.qty <= 0) {
                cart = cart.filter(i => i.id !== id);
            }
        } else if (action === 'remove') {
            cart = cart.filter(i => i.id !== id);
            showToast('Item dihapus dari keranjang', 'error');
        }

        localStorage.setItem('zuriyahCart', JSON.stringify(cart));
        renderCart();
    });

    cartItemsEl?.addEventListener('input', (e) => {
        if (e.target.classList.contains('qty-input')) {
            const id = parseInt(e.target.dataset.id);
            let newQty = parseInt(e.target.value);

            if (isNaN(newQty) || newQty < 1) newQty = 1;
            if (newQty > 999) newQty = 999; 

            const item = cart.find(i => i.id === id);
            if (item) {
                item.qty = newQty;
                localStorage.setItem('zuriyahCart', JSON.stringify(cart));
                
                const newTotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
                cartTotalEl.textContent = formatRupiah(newTotal);
                updateCartCount();
            }
        }
    });

    cartItemsEl?.addEventListener('blur', (e) => {
        if (e.target.classList.contains('qty-input')) {
            let val = parseInt(e.target.value);
            if (isNaN(val) || val < 1) e.target.value = 1;
            renderCart(); 
        }
    }, true);

    // ==========================
    // CHECKOUT — Buka instruksi pembayaran
    // ==========================
    btnCheckout?.addEventListener('click', () => {
        if (cart.length === 0) return;

        currentPaymentTotal = getCartTotal();
        const method = PAYMENT_METHODS[selectedPayment];
        if (!method) return;

        // Isi modal instruksi pembayaran
        paymentModalIcon.textContent = method.icon;
        paymentModalTitle.textContent = `Pembayaran via ${selectedPayment}`;
        paymentModalSubtitle.textContent = 'Selesaikan pembayaran untuk melanjutkan pesanan';
        paymentModalAmount.textContent = formatRupiah(currentPaymentTotal);
        paymentModalMethod.textContent = selectedPayment;
        paymentModalNumber.textContent = method.number;

        // Isi langkah-langkah
        paymentModalSteps.innerHTML = '';
        method.steps.forEach(step => {
            const li = document.createElement('li');
            li.textContent = step;
            paymentModalSteps.appendChild(li);
        });

        // Siapkan pesan WhatsApp konfirmasi
        let message = `Halo ZURIYAH Bakery, saya mau pesan:%0A%0A`;
        cart.forEach((item, index) => {
            const subtotal = item.price * item.qty;
            message += `${index + 1}. ${item.name} (${item.qty}x) - ${formatRupiah(subtotal)}%0A`;
        });
        message += `%0A*Total: ${formatRupiah(currentPaymentTotal)}*`;
        message += `%0A*Metode Pembayaran: ${selectedPayment}*`;
        message += `%0ANomor Tujuan: ${PAYMENT_NUMBER_RAW}`;
        message += `%0A%0ASaya sudah melakukan pembayaran. Mohon dicek ya. Terima kasih!`;

        paymentWaConfirm.href = `https://wa.me/6281554016406?text=${message}`;

        // Buka modal
        paymentModal.classList.add('is-open');
        paymentModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    });

    function closePaymentModal() {
        paymentModal.classList.remove('is-open');
        paymentModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
    }

    paymentModalClose?.addEventListener('click', closePaymentModal);
    paymentModal?.querySelector('[data-close-payment]')?.addEventListener('click', closePaymentModal);

    // Salin nomor pembayaran
    btnPaymentCopy?.addEventListener('click', () => {
        navigator.clipboard.writeText(PAYMENT_NUMBER_RAW).then(() => {
            showToast('Nomor pembayaran disalin!');
        }).catch(() => {
            showToast('Gagal menyalin nomor', 'error');
        });
    });

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
    // 6. WISHLIST SYSTEM
    // ==========================
    let wishlist = JSON.parse(localStorage.getItem('zuriyahWishlist')) || [];

    const wishlistBtn = document.getElementById('wishlistBtn');
    const wishlistCount = document.getElementById('wishlistCount');
    const wishlistDrawer = document.getElementById('wishlistDrawer');
    const wishlistBackdrop = document.getElementById('wishlistBackdrop');
    const wishlistClose = document.getElementById('wishlistClose');
    const wishlistItemsEl = document.getElementById('wishlistItems');
    const wishlistEmpty = document.getElementById('wishlistEmpty');

    function updateWishlistCount() {
        wishlistCount.textContent = wishlist.length;
        wishlistCount.classList.toggle('is-visible', wishlist.length > 0);
    }

    function renderWishlist() {
        updateWishlistCount();
        wishlistItemsEl.innerHTML = '';

        if (wishlist.length === 0) {
            wishlistEmpty.style.display = 'flex';
            wishlistItemsEl.style.display = 'none';
            return;
        }

        wishlistEmpty.style.display = 'none';
        wishlistItemsEl.style.display = 'flex';

        wishlist.forEach(item => {
            const el = document.createElement('div');
            el.className = 'cart-item';
            el.innerHTML = `
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${formatRupiah(item.price)}</div>
                </div>
                <button class="cart-item-remove" data-action="remove-wishlist" data-id="${item.id}" aria-label="Hapus dari wishlist">×</button>
            `;
            wishlistItemsEl.appendChild(el);
        });
    }

    function toggleWishlist(product) {
        const index = wishlist.findIndex(item => item.id === product.id);
        if (index > -1) {
            wishlist.splice(index, 1);
            showToast(`${product.name} dihapus dari wishlist`, 'error');
        } else {
            wishlist.push(product);
            showToast(`${product.name} disimpan ke wishlist!`);
        }
        localStorage.setItem('zuriyahWishlist', JSON.stringify(wishlist));
        renderWishlist();
        updateWishlistButtons();
        
        if (activeFilter === 'wishlist') applyFilters();
    }

    function updateWishlistButtons() {
        document.querySelectorAll('.wishlist-toggle').forEach(btn => {
            const id = parseInt(btn.dataset.wishlistId);
            const isWishlisted = wishlist.some(item => item.id === id);
            btn.classList.toggle('is-active', isWishlisted);
        });
    }

    document.querySelectorAll('.wishlist-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.product-card');
            if (!card) return;
            toggleWishlist({
                id: parseInt(card.dataset.id),
                name: card.dataset.name,
                price: parseInt(card.dataset.price),
                image: card.dataset.image
            });
        });
    });

    function openWishlist() {
        wishlistDrawer.classList.add('is-open');
        wishlistBackdrop.classList.add('is-visible');
        wishlistDrawer.setAttribute('aria-hidden', 'false');
        document.body.classList.add('wishlist-open');
    }

    function closeWishlist() {
        wishlistDrawer.classList.remove('is-open');
        wishlistBackdrop.classList.remove('is-visible');
        wishlistDrawer.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('wishlist-open');
    }

    wishlistBtn?.addEventListener('click', openWishlist);
    wishlistClose?.addEventListener('click', closeWishlist);
    wishlistBackdrop?.addEventListener('click', closeWishlist);

    wishlistItemsEl?.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action="remove-wishlist"]');
        if (!btn) return;
        const id = parseInt(btn.dataset.id);
        wishlist = wishlist.filter(item => item.id !== id);
        localStorage.setItem('zuriyahWishlist', JSON.stringify(wishlist));
        renderWishlist();
        updateWishlistButtons();
        showToast('Item dihapus dari wishlist', 'error');
        
        if (activeFilter === 'wishlist') applyFilters();
    });

    // ==========================
    // 7. QUICK VIEW MODAL & SHARE
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
    const qvShareBtn = document.getElementById('qvShareBtn');

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

    qvShareBtn?.addEventListener('click', async () => {
        if (!currentProduct) return;

        const shareData = {
            title: `ZURIYAH Bakery - ${currentProduct.name}`,
            text: `Coba lihat roti ini: ${currentProduct.name} (${formatRupiah(currentProduct.price)})`,
            url: window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            const url = window.location.href;
            navigator.clipboard.writeText(url).then(() => {
                showToast('Link berhasil disalin ke clipboard!');
            }).catch(() => {
                showToast('Gagal menyalin link', 'error');
            });
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (quickviewModal.classList.contains('is-open')) closeQuickview();
            if (cartDrawer.classList.contains('is-open')) closeCart();
            if (wishlistDrawer.classList.contains('is-open')) closeWishlist();
            if (paymentModal.classList.contains('is-open')) closePaymentModal();
        }
    });

    // ==========================
    // 8. SEARCH, FILTER, SORT, LOAD MORE, PRICE FILTER
    // ==========================
    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');
    const voiceSearchBtn = document.getElementById('voiceSearchBtn');
    const filterGroup = document.getElementById('filterGroup');
    const sortSelect = document.getElementById('sortSelect');
    const priceFilter = document.getElementById('priceFilter'); 
    const productGrid = document.getElementById('productGrid');
    const productCards = Array.from(document.querySelectorAll('.product-card'));
    const resultInfo = document.getElementById('resultInfo');
    const emptyState = document.getElementById('emptyState');
    const btnLoadMore = document.getElementById('btnLoadMore'); 

    let activeFilter = localStorage.getItem('menuFilter') || 'all';
    let searchQuery = '';
    let activeSort = 'default';
    let activePriceFilter = 'all';
    let visibleLimit = 8; 

    const originalNames = new Map();
    productCards.forEach(card => {
        const h3 = card.querySelector('.product-content h3');
        originalNames.set(card, h3.textContent);
    });

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
            const price = parseInt(card.dataset.price) || 0;
            const id = parseInt(card.dataset.id);
            
            let matchCategory = false;
            if (activeFilter === 'all') {
                matchCategory = true;
            } else if (activeFilter === 'wishlist') {
                matchCategory = wishlist.some(item => item.id === id);
            } else {
                matchCategory = (category === activeFilter);
            }

            const matchSearch = name.includes(searchQuery.toLowerCase());
            
            let matchPrice = true;
            if (activePriceFilter === 'under5') matchPrice = price < 5000;
            else if (activePriceFilter === 'under10') matchPrice = price < 10000;
            else if (activePriceFilter === 'above10') matchPrice = price >= 10000;

            const h3 = card.querySelector('.product-content h3');
            if (matchSearch && searchQuery) {
                h3.innerHTML = highlightText(originalNames.get(card), searchQuery);
            } else {
                h3.textContent = originalNames.get(card);
            }

            if (matchCategory && matchSearch && matchPrice) {
                card.classList.remove('hidden');
                visibleCards.push(card);
                visibleCount++;
            } else {
                card.classList.add('hidden');
            }
        });

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

        visibleCards.forEach((card, index) => {
            if (index >= visibleLimit) {
                card.classList.add('hidden');
            } else {
                card.classList.remove('hidden');
            }
        });

        if (btnLoadMore) {
            btnLoadMore.style.display = (visibleCount > visibleLimit) ? 'inline-flex' : 'none';
        }

        if (visibleCount === 0) {
            emptyState.hidden = false;
            resultInfo.hidden = true;
            productGrid.style.display = 'none';
            btnLoadMore.style.display = 'none';
        } else {
            emptyState.hidden = true;
            productGrid.style.display = 'grid';

            if (activeFilter !== 'all' || searchQuery !== '' || activeSort !== 'default' || activePriceFilter !== 'all') {
                resultInfo.hidden = false;
                resultInfo.innerHTML = `Menampilkan <strong>${Math.min(visibleLimit, visibleCount)}</strong> dari <strong>${visibleCount}</strong> produk`;
            } else {
                resultInfo.hidden = true;
            }
        }
    }

    btnLoadMore?.addEventListener('click', () => {
        visibleLimit += 8;
        applyFilters();
    });

    searchInput?.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        searchClear.hidden = searchQuery.length === 0;
        visibleLimit = 8; 
        applyFilters();
    });

    searchClear?.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        searchClear.hidden = true;
        searchInput.focus();
        visibleLimit = 8;
        applyFilters();
    });

    // VOICE SEARCH
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'id-ID';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        voiceSearchBtn?.addEventListener('click', () => {
            recognition.start();
            voiceSearchBtn.classList.add('listening');
            searchInput.placeholder = "Mendengarkan...";
        });

        recognition.onresult = (event) => {
            const speechResult = event.results[0][0].transcript;
            searchInput.value = speechResult;
            searchQuery = speechResult;
            searchClear.hidden = false;
            visibleLimit = 8;
            applyFilters();
        };

        recognition.onspeechend = () => {
            recognition.stop();
            voiceSearchBtn.classList.remove('listening');
            searchInput.placeholder = "Cari roti favoritmu...";
        };

        recognition.onerror = () => {
            voiceSearchBtn.classList.remove('listening');
            searchInput.placeholder = "Cari roti favoritmu...";
            showToast("Gagal mendengar suara. Coba lagi.", "error");
        };
    } else {
        if (voiceSearchBtn) voiceSearchBtn.style.display = 'none';
    }

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
            visibleLimit = 8;
            applyFilters();
        }
    });

    sortSelect?.addEventListener('change', (e) => {
        activeSort = e.target.value;
        applyFilters();
    });

    priceFilter?.addEventListener('change', (e) => {
        activePriceFilter = e.target.value;
        visibleLimit = 8;
        applyFilters();
    });

    // ==========================
    // INIT
    // ==========================
    renderCart();
    renderWishlist();
    updateWishlistButtons();
    updatePaymentOptionsUI();
    applyFilters();
});