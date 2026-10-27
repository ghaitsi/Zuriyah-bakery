document.addEventListener('DOMContentLoaded', () => {

    // ==========================
    // THEME TOGGLE (Dark/Light)
    // ==========================
    const themeToggle = document.getElementById('themeToggle');
    const htmlEl = document.documentElement;

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
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
    // MOBILE MENU TOGGLE
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
    // SCROLL TO TOP BUTTON
    // ==========================
    const scrollTop = document.getElementById('scrollTop');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            scrollTop.classList.add('is-visible');
        } else {
            scrollTop.classList.remove('is-visible');
        }
    }, { passive: true });

    scrollTop?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ==========================
    // YEAR FOOTER
    // ==========================
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // ==========================
    // FITUR SEARCH & FILTER
    // ==========================
    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');
    const filterGroup = document.getElementById('filterGroup');
    const productGrid = document.getElementById('productGrid');
    const productCards = document.querySelectorAll('.product-card');
    const resultInfo = document.getElementById('resultInfo');
    const emptyState = document.getElementById('emptyState');

    let activeFilter = 'all';
    let searchQuery = '';

    function filterProducts() {
        let visibleCount = 0;

        productCards.forEach(card => {
            const category = card.dataset.category;
            const name = card.dataset.name.toLowerCase();
            
            const matchCategory = (activeFilter === 'all' || category === activeFilter);
            const matchSearch = name.includes(searchQuery.toLowerCase());

            if (matchCategory && matchSearch) {
                card.classList.remove('hidden');
                visibleCount++;
            } else {
                card.classList.add('hidden');
            }
        });

        if (visibleCount === 0) {
            emptyState.hidden = false;
            resultInfo.hidden = true;
            productGrid.style.display = 'none';
        } else {
            emptyState.hidden = true;
            productGrid.style.display = 'grid';
            
            if (activeFilter !== 'all' || searchQuery !== '') {
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
        filterProducts();
    });

    searchClear?.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        searchClear.hidden = true;
        searchInput.focus();
        filterProducts();
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
            filterProducts();
        }
    });
});