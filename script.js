/* ==========================
   ZURIYAH BAKERY — Script
   ========================== */

document.documentElement.classList.add("js-enabled");

/* ==========================
   THEME TOGGLE (Light / Dark)
   ========================== */
(function initTheme() {
    const themeToggle = document.querySelector("#themeToggle");
    const root = document.documentElement;

    const STORAGE_KEY = "zuriyah-theme";
    const metaTheme = document.querySelector('meta[name="theme-color"]');

    const THEME_COLORS = {
        light: "#F8F0DF",
        dark: "#1C120B"
    };

    function getStoredTheme() {
        try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
    }

    function getSystemTheme() {
        return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    function applyTheme(theme) {
        if (theme === "dark") {
            root.setAttribute("data-theme", "dark");
        } else {
            root.removeAttribute("data-theme");
        }

        if (themeToggle) {
            themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
            themeToggle.setAttribute("aria-label", theme === "dark" ? "Aktifkan mode terang" : "Aktifkan mode gelap");
        }

        if (metaTheme) {
            metaTheme.setAttribute("content", THEME_COLORS[theme] || THEME_COLORS.light);
        }
    }

    const storedTheme = getStoredTheme();
    const initialTheme = storedTheme || getSystemTheme();
    applyTheme(initialTheme);

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const isDark = root.getAttribute("data-theme") === "dark";
            const nextTheme = isDark ? "light" : "dark";

            applyTheme(nextTheme);

            try {
                localStorage.setItem(STORAGE_KEY, nextTheme);
            } catch (e) { /* ignore */ }
        });
    }

    if (window.matchMedia) {
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = (e) => {
            if (!getStoredTheme()) {
                applyTheme(e.matches ? "dark" : "light");
            }
        };

        if (mq.addEventListener) {
            mq.addEventListener("change", handler);
        } else if (mq.addListener) {
            mq.addListener(handler);
        }
    }
})();


/* ==========================
   MOBILE NAVIGATION
   ========================== */
const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.querySelector(".nav-menu");
const navLinks = document.querySelectorAll(".nav-menu a");

function closeMenu() {
    if (!menuToggle || !navMenu) return;

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Buka menu");

    navMenu.classList.remove("is-open");
    document.body.classList.remove("menu-open");
}

if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
        const isOpen = menuToggle.getAttribute("aria-expanded") === "true";

        menuToggle.setAttribute("aria-expanded", String(!isOpen));
        menuToggle.setAttribute("aria-label", isOpen ? "Buka menu" : "Tutup menu");

        navMenu.classList.toggle("is-open", !isOpen);
        document.body.classList.toggle("menu-open", !isOpen);
    });

    navLinks.forEach((link) => {
        link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 900) closeMenu();
    });
}


/* ==========================
   FOOTER YEAR
   ========================== */
const yearElement = document.querySelector("#year");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}


/* ==========================
   REVEAL ANIMATIONS
   ========================== */
const revealElements = document.querySelectorAll(
    ".hero-content, .hero-image, .section-number, " +
    ".about-content, .section-heading, " +
    ".cert-header, .cert-card, " +
    ".location-header, .map-wrapper, .info-card, " +
    ".values-content, .value-item, .contact-box"
);

revealElements.forEach((element) => {
    element.classList.add("reveal");
});

if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
        (entries, currentObserver) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    currentObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12 }
    );

    revealElements.forEach((element) => {
        observer.observe(element);
    });
} else {
    revealElements.forEach((element) => {
        element.classList.add("is-visible");
    });
}


/* ==========================
   3D HORIZONTAL PRODUCT SLIDER
   ========================== */
(function initProductSlider() {
    const stage = document.querySelector("#sliderStage");
    const prevBtn = document.querySelector("#sliderPrev");
    const nextBtn = document.querySelector("#sliderNext");
    const dotsWrap = document.querySelector("#sliderDots");

    if (!stage || !prevBtn || !nextBtn || !dotsWrap) return;

    const allCards = Array.from(stage.querySelectorAll(".product-card"));
    if (allCards.length === 0) return;

    let visibleCards = [...allCards];
    let total = visibleCards.length;
    let current = 0;
    let autoplayTimer = null;
    const AUTOPLAY_DELAY = 5000;

    const layout3D = {
        translateX: 240,
        translateZ: 220,
        rotateY: 22,
        scaleSide: 0.82,
        maxBlur: 2,
        fadeLimit: 3
    };

    function updateSpacing() {
        const w = window.innerWidth;

        if (w <= 380) {
            layout3D.translateX = 130;
            layout3D.translateZ = 110;
            layout3D.rotateY = 18;
            layout3D.scaleSide = 0.75;
            layout3D.maxBlur = 1.4;
            layout3D.fadeLimit = 2;
        } else if (w <= 640) {
            layout3D.translateX = 150;
            layout3D.translateZ = 130;
            layout3D.rotateY = 18;
            layout3D.scaleSide = 0.78;
            layout3D.maxBlur = 1.6;
            layout3D.fadeLimit = 2;
        } else if (w <= 900) {
            layout3D.translateX = 190;
            layout3D.translateZ = 180;
            layout3D.rotateY = 20;
            layout3D.scaleSide = 0.8;
            layout3D.maxBlur = 1.8;
            layout3D.fadeLimit = 3;
        } else {
            layout3D.translateX = 240;
            layout3D.translateZ = 220;
            layout3D.rotateY = 22;
            layout3D.scaleSide = 0.82;
            layout3D.maxBlur = 2;
            layout3D.fadeLimit = 3;
        }
    }

    let dots = [];

    function buildDots() {
        dotsWrap.innerHTML = "";
        dots = visibleCards.map((_, i) => {
            const dot = document.createElement("button");
            dot.type = "button";
            dot.setAttribute("aria-label", `Ke produk ${i + 1}`);
            dot.addEventListener("click", () => {
                goTo(i);
                restartAutoplay();
            });
            dotsWrap.appendChild(dot);
            return dot;
        });
    }

    function layout() {
        allCards.forEach((c) => {
            c.style.display = "none";
            c.classList.remove("is-active");
        });

        visibleCards.forEach((card, i) => {
            card.style.display = "";

            let diff = i - current;
            if (diff > total / 2) diff -= total;
            if (diff < -total / 2) diff += total;

            const absDiff = Math.abs(diff);

            const tx = diff * layout3D.translateX;
            const tz = -absDiff * layout3D.translateZ;
            const ry = diff * -layout3D.rotateY;
            const sc = absDiff === 0 ? 1 : layout3D.scaleSide;
            const op = absDiff > layout3D.fadeLimit ? 0 : 1 - absDiff * 0.2;
            const bl = absDiff > layout3D.fadeLimit - 1
                ? layout3D.maxBlur
                : absDiff * (layout3D.maxBlur / layout3D.fadeLimit);

            card.style.transform = `
                translate(-50%, -50%)
                translateX(${tx}px)
                translateZ(${tz}px)
                rotateY(${ry}deg)
                scale(${sc})
            `;
            card.style.opacity = op;
            card.style.filter = `blur(${bl}px)`;
            card.style.zIndex = String(100 - absDiff);
            card.style.pointerEvents = absDiff > layout3D.fadeLimit ? "none" : "auto";

            card.classList.toggle("is-active", diff === 0);
        });

        dots.forEach((dot, i) => {
            dot.classList.toggle("is-active", i === current);
        });
    }

    function goTo(index) {
        if (total === 0) return;
        current = (index + total) % total;
        layout();
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    allCards.forEach((card) => {
        card.addEventListener("click", (e) => {
            if (e.target.closest("[data-open-modal]")) return;
            if (!visibleCards.includes(card)) return;

            if (!card.classList.contains("is-active")) {
                const idx = visibleCards.indexOf(card);
                if (idx >= 0) {
                    goTo(idx);
                    restartAutoplay();
                }
            }
        });
    });

    nextBtn.addEventListener("click", () => { next(); restartAutoplay(); });
    prevBtn.addEventListener("click", () => { prev(); restartAutoplay(); });

    document.addEventListener("keydown", (e) => {
        if (document.body.classList.contains("modal-open")) return;
        if (e.key === "ArrowRight") { next(); restartAutoplay(); }
        if (e.key === "ArrowLeft") { prev(); restartAutoplay(); }
    });

    let startX = 0;
    let isDown = false;
    const SWIPE_THRESHOLD = 50;

    function onDown(x) { isDown = true; startX = x; }

    function onMove(x) {
        if (!isDown) return;
        const dx = x - startX;
        stage.style.transform = `translateX(${dx * 0.15}px)`;
    }

    function onUp(x) {
        if (!isDown) return;
        isDown = false;
        stage.style.transform = "";

        const dx = x - startX;
        if (Math.abs(dx) > SWIPE_THRESHOLD) {
            if (dx < 0) next();
            else prev();
            restartAutoplay();
        }
    }

    stage.addEventListener("mousedown", (e) => onDown(e.clientX));
    window.addEventListener("mousemove", (e) => onMove(e.clientX));
    window.addEventListener("mouseup", (e) => onUp(e.clientX));

    stage.addEventListener("touchstart", (e) => {
        onDown(e.touches[0].clientX);
    }, { passive: true });

    stage.addEventListener("touchmove", (e) => {
        onMove(e.touches[0].clientX);
    }, { passive: true });

    stage.addEventListener("touchend", (e) => {
        onUp(e.changedTouches[0].clientX);
    });

    function startAutoplay() {
        stopAutoplay();
        if (total <= 1) return;
        autoplayTimer = setInterval(next, AUTOPLAY_DELAY);
    }

    function stopAutoplay() {
        if (autoplayTimer) {
            clearInterval(autoplayTimer);
            autoplayTimer = null;
        }
    }

    function restartAutoplay() {
        stopAutoplay();
        startAutoplay();
    }

    stage.addEventListener("mouseenter", stopAutoplay);
    stage.addEventListener("mouseleave", startAutoplay);

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) stopAutoplay();
        else startAutoplay();
    });

    /* ========== SEARCH & FILTER ========== */
    const searchInput = document.querySelector("#productSearch");
    const searchClear = document.querySelector("#searchClear");
    const filterBtns = Array.from(document.querySelectorAll(".filter-btn"));
    const resultInfo = document.querySelector("#productResultInfo");
    const emptyState = document.querySelector("#productEmpty");

    let activeFilter = "all";
    let activeQuery = "";

    function escapeHtml(str) {
        return String(str).replace(/[&<>"']/g, (s) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[s]));
    }

    function applyFilters() {
        const q = activeQuery.trim().toLowerCase();

        visibleCards = allCards.filter((card) => {
            const category = (card.dataset.category || "").toLowerCase();
            const name = (card.dataset.name || "").toLowerCase();
            const title = (card.querySelector("h3")?.textContent || "").toLowerCase();
            const haystack = `${name} ${title}`;

            const matchFilter = activeFilter === "all" || category === activeFilter;
            const matchSearch = !q || haystack.includes(q);

            return matchFilter && matchSearch;
        });

        total = visibleCards.length;
        current = 0;

        if (emptyState) {
            emptyState.hidden = total > 0;
        }
        if (resultInfo) {
            if (q || activeFilter !== "all") {
                resultInfo.hidden = false;
                resultInfo.innerHTML = total > 0
                    ? `Menampilkan <strong>${total}</strong> produk${q ? ` untuk "<strong>${escapeHtml(activeQuery.trim())}</strong>"` : ""}${activeFilter !== "all" ? ` kategori <strong>${activeFilter}</strong>` : ""}`
                    : "";
            } else {
                resultInfo.hidden = true;
                resultInfo.innerHTML = "";
            }
        }

        if (searchClear) {
            searchClear.hidden = activeQuery.length === 0;
        }

        buildDots();
        layout();
        restartAutoplay();
    }

    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener("input", (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                activeQuery = e.target.value || "";
                applyFilters();
            }, 180);
        });
    }

    if (searchClear) {
        searchClear.addEventListener("click", () => {
            if (searchInput) searchInput.value = "";
            activeQuery = "";
            applyFilters();
            searchInput?.focus();
        });
    }

    filterBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            filterBtns.forEach((b) => {
                b.classList.remove("is-active");
                b.setAttribute("aria-selected", "false");
            });
            btn.classList.add("is-active");
            btn.setAttribute("aria-selected", "true");

            activeFilter = btn.dataset.filter || "all";
            applyFilters();
        });
    });

    /* ========== INIT ========== */
    updateSpacing();
    buildDots();
    layout();

    const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!prefersReduced) {
        startAutoplay();
    }

    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            updateSpacing();
            layout();
        }, 150);
    });
})();


/* ==========================
   PRODUCT DETAIL MODAL
   ========================== */
(function initProductModal() {
    const modal = document.querySelector("#productModal");
    const modalImage = document.querySelector("#modalImage");
    const modalTag = document.querySelector("#modalTag");
    const modalTitle = document.querySelector("#modalTitle");
    const modalDescription = document.querySelector("#modalDescription");
    const closeBtn = document.querySelector("#modalClose");
    const backdrop = modal?.querySelector("[data-close-modal]");
    const modalOrderBtn = document.querySelector("#modalOrderBtn");

    if (!modal) return;

    const WA_NUMBER = "6281554016406";
    let lastFocused = null;

    function openModal(card) {
        const img = card.querySelector(".product-image img");
        const tag = card.querySelector(".product-image > span");
        const title = card.querySelector(".product-info h3");
        const desc = card.querySelector(".product-info p");

        if (!img || !title) return;

        const productName = title.textContent.trim();

        modalImage.src = img.src;
        modalImage.alt = img.alt || productName;

        modalTag.textContent = tag ? tag.textContent.trim() : "PRODUK";
        modalTitle.textContent = productName;
        modalDescription.textContent = desc ? desc.textContent.trim() : "";

        if (modalOrderBtn) {
            const message = `Halo ZURIYAH Bakery! 👋%0A%0ASaya ingin memesan:%0A*${encodeURIComponent(productName)}*%0A%0AApakah masih tersedia? Terima kasih 🥐`;
            modalOrderBtn.href = `https://wa.me/${WA_NUMBER}?text=${message}`;
        }

        lastFocused = document.activeElement;

        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");

        setTimeout(() => closeBtn?.focus(), 200);
    }

    function closeModal() {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");

        if (lastFocused && typeof lastFocused.focus === "function") {
            lastFocused.focus();
        }
    }

    document.addEventListener("click", (e) => {
        const trigger = e.target.closest("[data-open-modal]");
        if (!trigger) return;

        const card = trigger.closest(".product-card");
        if (!card) return;

        e.stopPropagation();
        e.preventDefault();

        openModal(card);
    }, true);

    closeBtn?.addEventListener("click", closeModal);
    backdrop?.addEventListener("click", closeModal);

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("is-open")) {
            closeModal();
        }
    });

    modal.addEventListener("keydown", (e) => {
        if (e.key !== "Tab") return;

        const focusable = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    });
})();


/* ==========================
   QNA — PUBLIC BOARD via JSONBin.io
   + REPLY SYSTEM
   + EMAIL SENSOR (PRIVACY)
   ========================== */
(function initQnA() {
    const JSONBIN_KEY = "$2a$10$hR/BpeB0os9dc332y953gOHGK9cgaRcCPTg1TiD3WsLxs4NK/nPEy";
    const JSONBIN_BIN = "6ad221bcac6210605a373689";

    const API_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN}`;
    const CACHE_KEY = "zuriyah-qna-cache";
    const MAX_ENTRIES = 100;
    const MAX_REPLIES = 20;

    const form = document.querySelector("#qnaForm");
    const listEl = document.querySelector("#qnaList");
    const emptyEl = document.querySelector("#qnaEmpty");
    const countEl = document.querySelector("#qnaCount");
    const searchInput = document.querySelector("#qnaSearch");
    const loadingEl = document.querySelector("#qnaLoading");
    const refreshBtn = document.querySelector("#qnaRefresh");

    if (!form || !listEl) return;

    /* ============ AUTO-FILL ADMIN & VALIDASI ============ */
    const ADMIN_KEY = "zuriyah2024";
    const ADMIN_EMAIL = "zuriyah@gmail.com";

    const urlParams = new URLSearchParams(window.location.search);
    const isAdmin = urlParams.get("admin") === ADMIN_KEY;

    if (isAdmin) {
        const emailInput = document.querySelector("#qnaEmail");
        const catSelect = document.querySelector("#qnaCategory");
        const nameInput = document.querySelector("#qnaName");

        if (emailInput) {
            emailInput.value = ADMIN_EMAIL;
            emailInput.readOnly = true;
            emailInput.style.opacity = "0.7";
        }
        if (catSelect) {
            catSelect.value = "Produk";
            catSelect.disabled = true;
            catSelect.style.opacity = "0.7";
        }
        if (nameInput) {
            nameInput.value = "ZURIYAH Official";
            nameInput.readOnly = true;
        }
    }

    let entries = [];
    let isLoading = false;
    let searchQuery = "";
    let activeReplyId = null;

    /* ============ TOAST ============ */
    let toastEl = null;
    let toastTimer = null;

    function showToast(message, type = "success") {
        if (!toastEl) {
            toastEl = document.createElement("div");
            toastEl.className = "qna-toast";
            toastEl.innerHTML = `
                <span class="qna-toast-icon" aria-hidden="true">${type === "error" ? "!" : "✓"}</span>
                <span class="qna-toast-text"></span>
            `;
            document.body.appendChild(toastEl);
        }

        const iconEl = toastEl.querySelector(".qna-toast-icon");
        const textEl = toastEl.querySelector(".qna-toast-text");

        iconEl.textContent = type === "error" ? "!" : "✓";
        textEl.textContent = message;

        toastEl.classList.add("is-visible");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 2600);
    }

    /* ============ HELPERS ============ */
    function escapeHtml(str) {
        return String(str).replace(/[&<>"']/g, (s) => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;",
            '"': "&quot;", "'": "&#39;"
        }[s]));
    }

    function getInitials(name) {
        const parts = String(name || "?").trim().split(/\s+/).slice(0, 2);
        return parts.map((p) => p[0]?.toUpperCase() || "").join("") || "?";
    }

    /**
     * SENSOR EMAIL — Menyembunyikan email dari publik
     * Format: "nama***@gmail.com" atau "***@gmail.com"
     * Jika admin, tampilkan email lengkap.
     */
    function maskEmail(email) {
        if (!email) return "Email tersembunyi";
        
        // Admin bisa lihat email lengkap
        if (isAdmin) return email;
        
        const str = String(email);
        const atIndex = str.indexOf("@");
        
        if (atIndex <= 0) {
            // Format tidak valid, sensor semua
            return "***@***";
        }
        
        const localPart = str.slice(0, atIndex);
        const domain = str.slice(atIndex + 1);
        
        // Sensor bagian lokal (sebelum @)
        let maskedLocal;
        if (localPart.length <= 2) {
            maskedLocal = "***";
        } else if (localPart.length <= 4) {
            maskedLocal = localPart[0] + "***";
        } else {
            maskedLocal = localPart.slice(0, 2) + "***";
        }
        
        // Sensor bagian domain (opsional, tetap tampil untuk kredibilitas)
        return `${maskedLocal}@${domain}`;
    }

    /**
     * SENSOR EMAIL — Versi ultra-privat
     * Hanya menampilkan "Email terverifikasi" atau domain saja
     */
    function maskEmailUltra(email) {
        if (!email) return "Email tersembunyi";
        
        if (isAdmin) return email;
        
        const str = String(email);
        const atIndex = str.indexOf("@");
        
        if (atIndex <= 0) {
            return "Email terverifikasi";
        }
        
        const domain = str.slice(atIndex + 1);
        
        // Hanya tampilkan domain, bukan nama email
        return `•••@${domain}`;
    }

    /**
     * Format email untuk ditampilkan:
     * - Admin: email lengkap
     * - Publik: "n***@gmail.com" (default)
     */
    function formatEmailDisplay(email) {
        if (!email) return "Email tidak tersedia";
        if (isAdmin) return email;
        return maskEmail(email);
    }

    function timeAgo(iso) {
        const now = Date.now();
        const then = new Date(iso).getTime();
        const diff = Math.floor((now - then) / 1000);

        if (diff < 60) return "Baru saja";
        if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`;

        return new Date(iso).toLocaleDateString("id-ID", {
            day: "numeric", month: "short", year: "numeric"
        });
    }

    /* ============ API ============ */
    async function fetchEntries() {
        const res = await fetch(`${API_URL}/latest`, {
            headers: {
                "X-Master-Key": JSONBIN_KEY,
                "X-Bin-Meta": "false"
            }
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.record)) return data.record;
        return [];
    }

    async function saveEntries(newEntries) {
        const res = await fetch(API_URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": JSONBIN_KEY
            },
            body: JSON.stringify(newEntries)
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    }

    /* ============ LOAD ============ */
    async function loadData(showLoading = true) {
        if (isLoading) return;
        isLoading = true;

        if (showLoading && loadingEl) {
            loadingEl.hidden = false;
            listEl.style.display = "none";
        }

        if (refreshBtn) refreshBtn.classList.add("is-loading");

        try {
            entries = await fetchEntries();

            try {
                localStorage.setItem(CACHE_KEY, JSON.stringify(entries));
            } catch (e) {}

            renderList();
        } catch (err) {
            console.error("Gagal load QnA:", err);
            showToast("Gagal memuat data. Coba refresh.", "error");

            try {
                const raw = localStorage.getItem(CACHE_KEY);
                if (raw) {
                    entries = JSON.parse(raw);
                    renderList();
                }
            } catch (e) {}
        } finally {
            isLoading = false;
            if (loadingEl) loadingEl.hidden = true;
            listEl.style.display = "";
            if (refreshBtn) refreshBtn.classList.remove("is-loading");
        }
    }

    /* ============ RENDER ============ */
    function renderList() {
        const q = searchQuery.trim().toLowerCase();

        const filtered = !q
            ? entries
            : entries.filter((e) => {
                const haystack = `${e.name} ${e.email} ${e.category} ${e.message}`.toLowerCase();
                return haystack.includes(q);
            });

        if (countEl) countEl.textContent = entries.length;

        if (filtered.length === 0) {
            listEl.innerHTML = "";
            if (emptyEl) {
                emptyEl.hidden = false;
                const emptyTitle = emptyEl.querySelector("p strong");
                const emptySub = emptyEl.querySelector("small");

                if (q) {
                    if (emptyTitle) emptyTitle.textContent = "Tidak ada hasil";
                    if (emptySub) emptySub.textContent = "Coba kata kunci lain.";
                } else {
                    if (emptyTitle) emptyTitle.textContent = "Belum ada pertanyaan";
                    if (emptySub) emptySub.textContent = "Kirim pertanyaan pertama Anda!";
                }

                listEl.appendChild(emptyEl);
            }
            return;
        }

        if (emptyEl) emptyEl.hidden = true;

        listEl.innerHTML = filtered.map((entry) => {
            const replies = Array.isArray(entry.replies) ? entry.replies : [];

            return `
            <div class="qna-item" data-id="${escapeHtml(entry.id)}">
                <div class="qna-item-header">
                    <div class="qna-item-author">
                        <span class="qna-item-avatar" aria-hidden="true">${escapeHtml(getInitials(entry.name))}</span>
                        <span class="qna-item-name">${escapeHtml(entry.name)}</span>
                        <span class="qna-item-meta">· ${escapeHtml(timeAgo(entry.createdAt))}</span>
                    </div>

                    <div style="display:flex;gap:8px;align-items:center;">
                        <span class="qna-item-category">${escapeHtml(entry.category)}</span>
                    </div>
                </div>

                <p class="qna-item-message">${escapeHtml(entry.message)}</p>

                <div class="qna-item-footer">
                    <small class="qna-item-email" title="Email disembunyikan demi privasi">
                        ${isAdmin 
                            ? escapeHtml(formatEmailDisplay(entry.email)) 
                            : `<span class="email-masked" aria-label="Email tersembunyi">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="12" height="12" style="display:inline;vertical-align:middle;margin-right:4px;">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </svg>
                                ${escapeHtml(maskEmail(entry.email))}
                            </span>`
                        }
                    </small>
                    <button
                        class="qna-item-reply-btn"
                        type="button"
                        data-reply-id="${escapeHtml(entry.id)}"
                        aria-label="Balas pertanyaan"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                        </svg>
                        Balas${replies.length > 0 ? ` (${replies.length})` : ""}
                    </button>
                </div>

                ${replies.length > 0 ? `
                    <div class="qna-replies">
                        ${replies.map((reply) => `
                            <div class="qna-reply-item">
                                <span class="qna-reply-avatar" aria-hidden="true">${escapeHtml(getInitials(reply.name))}</span>
                                <div class="qna-reply-content">
                                    <div class="qna-reply-header">
                                        <strong>${escapeHtml(reply.name)}</strong>
                                        <span>· ${escapeHtml(timeAgo(reply.createdAt))}</span>
                                    </div>
                                    <p class="qna-reply-message">${escapeHtml(reply.message)}</p>
                                </div>
                            </div>
                        `).join("")}
                    </div>
                ` : ""}

                ${activeReplyId === entry.id ? `
                    <div class="qna-reply-form" data-reply-form-id="${escapeHtml(entry.id)}">
                        <div class="form-row">
                            <div class="form-group">
                                <input type="text" class="qna-reply-name" placeholder="Nama Anda" maxlength="60" required>
                            </div>
                            <div class="form-group">
                                <input type="email" class="qna-reply-email" placeholder="Email (opsional)" maxlength="100">
                            </div>
                        </div>
                        <div class="form-group">
                            <textarea class="qna-reply-message" rows="2" placeholder="Tulis balasan Anda..." maxlength="500" required></textarea>
                        </div>
                        <div class="qna-reply-form-actions">
                            <button type="button" class="qna-reply-cancel">Batal</button>
                            <button type="button" class="qna-reply-submit btn btn-primary">Kirim Balasan ↗</button>
                        </div>
                    </div>
                ` : ""}
            </div>
            `;
        }).join("");
    }

    /* ============ SUBMIT PERTANYAAN ============ */
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nameEl = document.querySelector("#qnaName");
        const emailEl = document.querySelector("#qnaEmail");
        const catEl = document.querySelector("#qnaCategory");
        const msgEl = document.querySelector("#qnaMessage");

        const name = nameEl?.value.trim() || "";
        const email = emailEl?.value.trim() || "";
        const category = catEl?.value || "";
        const message = msgEl?.value.trim() || "";

        if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && !isAdmin) {
            showToast("Email ini sudah terdaftar. Silakan gunakan email pribadi Anda.", "error");
            emailEl?.focus();
            return;
        }

        if (!name || name.length < 2) {
            showToast("Nama minimal 2 karakter", "error"); nameEl?.focus(); return;
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showToast("Email tidak valid", "error"); emailEl?.focus(); return;
        }
        if (!category) {
            showToast("Pilih kategori dulu", "error"); catEl?.focus(); return;
        }
        if (!message || message.length < 5) {
            showToast("Pertanyaan minimal 5 karakter", "error"); msgEl?.focus(); return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn?.innerHTML || "";

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = "Mengirim...";
        }

        const entry = {
            id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            name, email, category, message,
            replies: [],
            createdAt: new Date().toISOString()
        };

        const newEntries = [entry, ...entries];
        if (newEntries.length > MAX_ENTRIES) newEntries.length = MAX_ENTRIES;

        try {
            await saveEntries(newEntries);
            entries = newEntries;

            try { localStorage.setItem(CACHE_KEY, JSON.stringify(entries)); } catch (e) {}

            renderList();
            form.reset();
            
            if (isAdmin) {
                const emailInput = document.querySelector("#qnaEmail");
                const catSelect = document.querySelector("#qnaCategory");
                const nameInput = document.querySelector("#qnaName");
                if (emailInput) emailInput.value = ADMIN_EMAIL;
                if (catSelect) catSelect.value = "Produk";
                if (nameInput) nameInput.value = "ZURIYAH Official";
            }

            showToast("Pertanyaan berhasil dikirim!");
        } catch (err) {
            console.error("Gagal kirim:", err);
            showToast("Gagal mengirim. Coba lagi.", "error");
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        }
    });

    /* ============ EVENT DELEGATION: REPLY ============ */
    listEl.addEventListener("click", (e) => {
        const replyBtn = e.target.closest(".qna-item-reply-btn");
        if (replyBtn) {
            const id = replyBtn.dataset.replyId;
            activeReplyId = activeReplyId === id ? null : id;
            renderList();

            if (activeReplyId) {
                setTimeout(() => {
                    const replyForm = listEl.querySelector(`[data-reply-form-id="${activeReplyId}"]`);
                    if (replyForm) {
                        replyForm.scrollIntoView({ behavior: "smooth", block: "nearest" });
                    }
                }, 100);
            }
            return;
        }

        const cancelBtn = e.target.closest(".qna-reply-cancel");
        if (cancelBtn) {
            activeReplyId = null;
            renderList();
            return;
        }

        const submitReplyBtn = e.target.closest(".qna-reply-submit");
        if (submitReplyBtn) {
            const formWrapper = submitReplyBtn.closest(".qna-reply-form");
            if (!formWrapper) return;

            const entryId = formWrapper.dataset.replyFormId;
            const nameInput = formWrapper.querySelector(".qna-reply-name");
            const emailInput = formWrapper.querySelector(".qna-reply-email");
            const messageInput = formWrapper.querySelector(".qna-reply-message");

            const replyName = nameInput?.value.trim() || "";
            const replyEmail = emailInput?.value.trim() || "";
            const replyMessage = messageInput?.value.trim() || "";

            if (!replyName || replyName.length < 2) {
                showToast("Nama minimal 2 karakter", "error");
                nameInput?.focus();
                return;
            }
            if (!replyMessage || replyMessage.length < 2) {
                showToast("Balasan minimal 2 karakter", "error");
                messageInput?.focus();
                return;
            }

            submitReply(entryId, replyName, replyEmail, replyMessage, submitReplyBtn);
        }
    });

    /* ============ SUBMIT REPLY ============ */
    async function submitReply(entryId, name, email, message, btn) {
        const originalText = btn?.innerHTML || "Kirim Balasan";

        if (btn) {
            btn.disabled = true;
            btn.innerHTML = "Mengirim...";
        }

        const entryIndex = entries.findIndex((en) => en.id === entryId);
        if (entryIndex === -1) {
            showToast("Pertanyaan tidak ditemukan", "error");
            return;
        }

        const reply = {
            id: `r_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            name,
            email,
            message,
            createdAt: new Date().toISOString()
        };

        const newEntries = entries.map((en) => {
            if (en.id !== entryId) return en;
            const existingReplies = Array.isArray(en.replies) ? en.replies : [];
            const newReplies = [...existingReplies, reply];
            if (newReplies.length > MAX_REPLIES) {
                newReplies.splice(0, newReplies.length - MAX_REPLIES);
            }
            return { ...en, replies: newReplies };
        });

        try {
            await saveEntries(newEntries);
            entries = newEntries;
            activeReplyId = null;

            try { localStorage.setItem(CACHE_KEY, JSON.stringify(entries)); } catch (e) {}

            renderList();
            showToast("Balasan berhasil dikirim!");
        } catch (err) {
            console.error("Gagal kirim balasan:", err);
            showToast("Gagal mengirim balasan. Coba lagi.", "error");
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        }
    }

    /* ============ SEARCH ============ */
    if (searchInput) {
        let searchTimer;
        searchInput.addEventListener("input", (e) => {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(() => {
                searchQuery = e.target.value || "";
                renderList();
            }, 150);
        });
    }

    /* ============ REFRESH ============ */
    refreshBtn?.addEventListener("click", () => {
        loadData(false);
        showToast("Memuat ulang data...");
    });

    /* ============ AUTO REFRESH ============ */
    setInterval(() => {
        if (!document.hidden && !isLoading) {
            fetchEntries()
                .then((data) => { entries = data; renderList(); })
                .catch(() => {});
        }
    }, 30000);

    /* ============ INIT ============ */
    loadData(true);
})();


/* ==========================
   QNA FLOATING PANEL
   ========================== */
(function initQnaPanel() {
    const trigger = document.querySelector("#qnaTrigger");
    const panel = document.querySelector("#qnaPanel");
    const backdrop = document.querySelector("#qnaBackdrop");
    const closeBtn = document.querySelector("#qnaClose");

    if (!trigger || !panel || !backdrop) return;

    let isOpen = false;

    function openPanel() {
        if (isOpen) return;
        isOpen = true;

        panel.classList.add("is-open");
        backdrop.classList.add("is-visible");
        trigger.classList.add("is-active");
        trigger.setAttribute("aria-expanded", "true");
        panel.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";

        setTimeout(() => closeBtn?.focus(), 350);
    }

    function closePanel() {
        if (!isOpen) return;
        isOpen = false;

        panel.classList.remove("is-open");
        backdrop.classList.remove("is-visible");
        trigger.classList.remove("is-active");
        trigger.setAttribute("aria-expanded", "false");
        panel.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    function togglePanel() {
        if (isOpen) closePanel();
        else openPanel();
    }

    trigger.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        togglePanel();
    });

    closeBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        closePanel();
    });

    backdrop.addEventListener("click", closePanel);

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && isOpen) closePanel();
    });

    panel.addEventListener("keydown", (e) => {
        if (e.key !== "Tab") return;

        const focusable = panel.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    });
})();


/* ====================================================
   FITUR 1: VISITOR COUNTER (REAL via JSONBin.io)
   ==================================================== */
(function initVisitorCounter() {
    const el = document.querySelector("#visitorCount");
    if (!el) return;

    const JSONBIN_KEY = "$2a$10$hR/BpeB0os9dc332y953gOHGK9cgaRcCPTg1TiD3WsLxs4NK/nPEy";
    const JSONBIN_BIN = "6ad315aeac6210605a393343";

    const API_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN}`;
    const CACHE_KEY = "zuriyah-visitor-cache";
    const COUNTED_KEY = "zuriyah-visitor-counted";

    let current = 0;
    let displayStart = 0;

    function safeGet(store, key) {
        try { return store.getItem(key); } catch (e) { return null; }
    }
    function safeSet(store, key, value) {
        try { store.setItem(key, value); } catch (e) {}
    }

    function getCachedCount() {
        const raw = safeGet(localStorage, CACHE_KEY);
        const n = parseInt(raw, 10);
        return Number.isFinite(n) && n >= 0 ? n : null;
    }

    function setCachedCount(n) {
        safeSet(localStorage, CACHE_KEY, String(n));
    }

    function extractCount(data) {
        if (typeof data === "number") return data;
        if (data && typeof data === "object" && !Array.isArray(data)) {
            if (typeof data.visitors === "number") return data.visitors;
            if (typeof data.count === "number") return data.count;
        }
        return null;
    }

    async function fetchCount() {
        const res = await fetch(`${API_URL}/latest`, {
            headers: {
                "X-Master-Key": JSONBIN_KEY,
                "X-Bin-Meta": "false"
            },
            cache: "no-store"
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return { raw: data, count: extractCount(data) };
    }

    async function saveCount(visitors) {
        const res = await fetch(API_URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": JSONBIN_KEY
            },
            body: JSON.stringify({ visitors })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    }

    function animateTo(target, from) {
        const duration = 1200;
        const startVal = Math.max(0, from ?? target);
        const startTime = performance.now();

        function tick(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = Math.floor(startVal + (target - startVal) * eased);

            el.textContent = value.toLocaleString("id-ID");

            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                el.textContent = target.toLocaleString("id-ID");
            }
        }
        requestAnimationFrame(tick);
    }

    function renderStatic(n) {
        el.textContent = Number(n || 0).toLocaleString("id-ID");
    }

    function observeAndAnimate() {
        if ("IntersectionObserver" in window) {
            const obs = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        animateTo(current, displayStart);
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3 });
            obs.observe(el);
        } else {
            animateTo(current, displayStart);
        }
    }

    async function run() {
        const cached = getCachedCount();
        if (cached !== null) {
            current = cached;
            displayStart = cached;
            renderStatic(cached);
        } else {
            renderStatic(0);
        }

        const alreadyCounted = safeGet(sessionStorage, COUNTED_KEY) === "1";

        try {
            const { count } = await fetchCount();

            let next;

            if (count === null) {
                next = 1;
                await saveCount(next);
                setCachedCount(next);
                safeSet(sessionStorage, COUNTED_KEY, "1");
                displayStart = 0;
            } else if (!alreadyCounted) {
                next = count + 1;
                setCachedCount(next);
                safeSet(sessionStorage, COUNTED_KEY, "1");
                displayStart = cached ?? count;

                try {
                    await saveCount(next);
                } catch (err) {
                    console.warn("Gagal simpan visitor:", err);
                }
            } else {
                next = count;
                setCachedCount(count);
                displayStart = cached ?? count;
            }

            current = next;
            observeAndAnimate();
        } catch (err) {
            console.error("Visitor counter gagal:", err);
            const fallback = getCachedCount() ?? 0;
            current = fallback;
            displayStart = fallback;
            animateTo(fallback, fallback);
        }
    }

    run();
})();


/* ====================================================
   FITUR 2: SCROLL TO TOP BUTTON
   ==================================================== */
(function initScrollTop() {
    const btn = document.querySelector("#scrollTop");
    if (!btn) return;

    const SHOW_AFTER = 400;
    let ticking = false;

    function updateVisibility() {
        const scrolled = window.pageYOffset || document.documentElement.scrollTop;

        if (scrolled > SHOW_AFTER) {
            btn.classList.add("is-visible");
        } else {
            btn.classList.remove("is-visible");
        }

        ticking = false;
    }

    window.addEventListener("scroll", () => {
        if (!ticking) {
            requestAnimationFrame(updateVisibility);
            ticking = true;
        }
    }, { passive: true });

    updateVisibility();

    btn.addEventListener("click", () => {
        const prefersReduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        window.scrollTo({
            top: 0,
            behavior: prefersReduced ? "auto" : "smooth"
        });
    });
})();


/* ====================================================
   FITUR 3: JAM OPERASIONAL (AUTO HIGHLIGHT HARI INI)
   ==================================================== */
(function initOperationalHours() {
    const container = document.querySelector("#hoursList");
    if (!container) return;

    const SCHEDULE = [
        { day: "Minggu-Sabtu", open: null, close: null, closed: true },
        { day: "Senin", open: "05:30", close: "17:00", closed: false },
        { day: "Selasa", open: "05:30", close: "17:00", closed: false },
        { day: "Rabu", open: "05:30", close: "17:00", closed: false },
        { day: "Kamis", open: "05:30", close: "17:00", closed: false },
        { day: "Jumat", open: "05:30", close: "17:00", closed: false },
    ];

    const todayIndex = new Date().getDay();

    container.innerHTML = SCHEDULE.map((item, index) => {
        const isToday = index === todayIndex;
        const timeText = item.closed
            ? "Tutup"
            : `${item.open} – ${item.close}`;

        const classes = [
            "hours-row",
            isToday ? "is-today" : "",
            item.closed ? "is-closed" : ""
        ].filter(Boolean).join(" ");

        return `
            <div class="${classes}">
                <span class="day">${item.day}${isToday ? " (Hari ini)" : ""}</span>
                <span class="time">${timeText}</span>
            </div>
        `;
    }).join("");
})();