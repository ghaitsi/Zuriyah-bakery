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
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch (e) {
            return null;
        }
    }

    function getSystemTheme() {
        return window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    }

    function applyTheme(theme) {
        if (theme === "dark") {
            root.setAttribute("data-theme", "dark");
        } else {
            root.removeAttribute("data-theme");
        }

        if (themeToggle) {
            themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
            themeToggle.setAttribute(
                "aria-label",
                theme === "dark"
                    ? "Aktifkan mode terang"
                    : "Aktifkan mode gelap"
            );
        }

        if (metaTheme) {
            metaTheme.setAttribute(
                "content",
                THEME_COLORS[theme] || THEME_COLORS.light
            );
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
   Semua user bisa lihat & kirim pertanyaan
   ========================== */
(function initQnA() {
    const JSONBIN_KEY = "$2a$10$hR/BpeB0os9dc332y953gOHGK9cgaRcCPTg1TiD3WsLxs4NK/nPEy";
    const JSONBIN_BIN = "6ad221bcac6210605a373689";

    const API_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN}`;
    const CACHE_KEY = "zuriyah-qna-cache";
    const MAX_ENTRIES = 100;

    const form = document.querySelector("#qnaForm");
    const listEl = document.querySelector("#qnaList");
    const emptyEl = document.querySelector("#qnaEmpty");
    const countEl = document.querySelector("#qnaCount");
    const searchInput = document.querySelector("#qnaSearch");
    const loadingEl = document.querySelector("#qnaLoading");
    const refreshBtn = document.querySelector("#qnaRefresh");

    if (!form || !listEl) return;

    let entries = [];
    let isLoading = false;
    let searchQuery = "";

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

        listEl.innerHTML = filtered.map((entry) => `
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

                <small class="qna-item-email">${escapeHtml(entry.email)}</small>
            </div>
        `).join("");
    }

    /* ============ SUBMIT ============ */
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
   QNA FLOATING PANEL — FIX
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

    /* Klik trigger → toggle */
    trigger.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        togglePanel();
    });

    /* Close button */
    closeBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        closePanel();
    });

    /* Backdrop click */
    backdrop.addEventListener("click", closePanel);

    /* ESC */
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && isOpen) closePanel();
    });

    /* Focus trap */
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