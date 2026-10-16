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

    const cards = Array.from(stage.querySelectorAll(".product-card"));
    if (cards.length === 0) return;

    const total = cards.length;
    let current = 0;
    let autoplayTimer = null;
    const AUTOPLAY_DELAY = 5000;

    const dots = cards.map((_, i) => {
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

    function layout() {
        cards.forEach((card, i) => {
            let diff = i - current;

            if (diff > total / 2) diff -= total;
            if (diff < -total / 2) diff += total;

            const absDiff = Math.abs(diff);

            const translateX = diff * 240;
            const translateZ = -absDiff * 220;
            const rotateY = diff * -22;
            const scale = absDiff === 0 ? 1 : 0.82;
            const opacity = absDiff > 3 ? 0 : 1 - absDiff * 0.18;
            const blur = absDiff > 2 ? 2 : absDiff * 0.8;

            card.style.transform = `
                translate(-50%, -50%)
                translateX(${translateX}px)
                translateZ(${translateZ}px)
                rotateY(${rotateY}deg)
                scale(${scale})
            `;
            card.style.opacity = opacity;
            card.style.filter = `blur(${blur}px)`;
            card.style.zIndex = String(100 - absDiff);
            card.style.pointerEvents = absDiff > 3 ? "none" : "auto";

            card.classList.toggle("is-active", diff === 0);
        });

        dots.forEach((dot, i) => {
            dot.classList.toggle("is-active", i === current);
        });
    }

    function goTo(index) {
        current = (index + total) % total;
        layout();
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    // Klik card non-aktif → pindah slide
    cards.forEach((card) => {
        card.addEventListener("click", (e) => {
            // Kalau klik tombol panah → biarkan modal handler urus
            if (e.target.closest("[data-open-modal]")) return;

            if (!card.classList.contains("is-active")) {
                const idx = Number(card.dataset.index);
                if (!Number.isNaN(idx)) {
                    goTo(idx);
                    restartAutoplay();
                }
            }
        });
    });

    nextBtn.addEventListener("click", () => { next(); restartAutoplay(); });
    prevBtn.addEventListener("click", () => { prev(); restartAutoplay(); });

    document.addEventListener("keydown", (e) => {
        // Hanya kalau modal tidak terbuka
        if (document.body.classList.contains("modal-open")) return;
        if (e.key === "ArrowRight") { next(); restartAutoplay(); }
        if (e.key === "ArrowLeft") { prev(); restartAutoplay(); }
    });

    // Swipe / drag
    let startX = 0;
    let isDown = false;
    const SWIPE_THRESHOLD = 60;

    function onDown(x) {
        isDown = true;
        startX = x;
    }

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
        resizeTimer = setTimeout(layout, 150);
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

    if (!modal) return;

    let lastFocused = null;

    function openModal(card) {
        const img = card.querySelector(".product-image img");
        const tag = card.querySelector(".product-image > span");
        const title = card.querySelector(".product-info h3");
        const desc = card.querySelector(".product-info p");

        if (!img || !title) return;

        modalImage.src = img.src;
        modalImage.alt = img.alt || title.textContent.trim();

        modalTag.textContent = tag ? tag.textContent.trim() : "PRODUK";
        modalTitle.textContent = title.textContent.trim();
        modalDescription.textContent = desc ? desc.textContent.trim() : "";

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

    // Event delegation — pakai capture agar duluan dari card click
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

    // Focus trap
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