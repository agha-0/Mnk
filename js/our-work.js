// js/portfolio.js

"use strict";

const portfolio = {
    sound: [
        { thumb: "/assets/images/OtherServices/OurWork/Work1.jpg", src: "/assets/videos/sound-1.mp4" },
        { thumb: "/assets/images/OtherServices/OurWork/Work2.jpg", src: "/assets/videos/sound-2.mp4" },
        { thumb: "/assets/images/OtherServices/OurWork/Work3.jpg", src: "/assets/videos/sound-3.mp4" },
        // add more...
    ],
};

// Turn this ON later when you want carousel + arrows back
const ENABLE_CAROUSEL = false;

function escapeHtml(str = "") {
    return str.replace(/[&<>"']/g, (m) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    }[m]));
}

function cardHtml(item) {
    const thumb = escapeHtml(item.thumb);
    const src = escapeHtml(item.src);

    return `
    <button type="button"
      class="portfolio-card"
      data-video-src="${src}"
      aria-label="Play video">
      <img class="portfolio-thumb" src="${thumb}" alt="" />
      <div class="portfolio-play">
        <div class="portfolio-play__bubble">
          <img src="/assets/images/PlayIcon.svg" alt="" class="w-[24px] h-[24px] md:w-[60px] md:h-[60px]" />
        </div>
      </div>
    </button>
  `;
}

function perView() {
    // desktop: 3, tablet: 2, mobile: 1 (matches your design)
    if (window.matchMedia("(min-width: 1024px)").matches) return 3;
    if (window.matchMedia("(min-width: 375px)").matches) return 2;
    return 1;
}

function initRow(rowEl, key) {
    const track = rowEl.querySelector(`[data-track="${key}"]`);
    const viewport = rowEl.querySelector(".portfolio-viewport");

    // arrows (optional now)
    const prevBtn = rowEl.querySelector(`[data-action="prev"]`);
    const nextBtn = rowEl.querySelector(`[data-action="next"]`);

    if (!track) return;

    // Render cards always
    track.innerHTML = (portfolio[key] || []).map(cardHtml).join("");

    // ----- CAROUSEL + ARROWS DISABLED FOR NOW -----
    if (!ENABLE_CAROUSEL) {
        // Hide arrows if they exist
        if (prevBtn) prevBtn.style.display = "none";
        if (nextBtn) nextBtn.style.display = "none";

        // Make it manual swipe/scroll (no JS sliding)
        if (viewport) {
            viewport.style.overflowX = "auto";
            viewport.style.overflowY = "hidden";
            viewport.style.webkitOverflowScrolling = "touch";
        }

        // Ensure no transform is applied
        track.style.transform = "none";

        // Keep responsive sizing (same math), but user scrolls manually
        const computeStatic = () => {
            const cards = Array.from(track.children);
            const pv = perView();
            if (!cards.length || !viewport) return;

            const gap = parseFloat(getComputedStyle(track).gap || "0");
            const viewportW = viewport.getBoundingClientRect().width;
            const cardW = (viewportW - gap * (pv - 1)) / pv;

            cards.forEach((c) => {
                c.style.width = `${cardW}px`;
            });
        };

        window.addEventListener("resize", () => window.requestAnimationFrame(computeStatic));
        computeStatic();
        return;
    }

    // ----- (When ENABLE_CAROUSEL = true) Carousel code runs -----
    // If arrows are missing, just skip carousel
    if (!viewport || !prevBtn || !nextBtn) return;

    let index = 0;
    let stepPx = 0;
    let maxIndex = 0;

    const compute = () => {
        const cards = Array.from(track.children);
        const pv = perView();

        if (!cards.length) return;

        const gap = parseFloat(getComputedStyle(track).gap || "0");
        const viewportW = viewport.getBoundingClientRect().width;
        const cardW = (viewportW - gap * (pv - 1)) / pv;

        cards.forEach((c) => {
            c.style.width = `${cardW}px`;
        });

        stepPx = cardW + gap;
        maxIndex = Math.max(0, cards.length - pv);
        index = Math.min(index, maxIndex);

        update();
    };

    const update = () => {
        track.style.transform = `translateX(-${index * stepPx}px)`;
        prevBtn.disabled = index <= 0;
        nextBtn.disabled = index >= maxIndex;
    };

    prevBtn.addEventListener("click", () => {
        index = Math.max(0, index - 1);
        update();
    });

    nextBtn.addEventListener("click", () => {
        index = Math.min(maxIndex, index + 1);
        update();
    });

    window.addEventListener("resize", compute);
    compute();
}

function initModal() {
    const modal = document.getElementById("portfolioModal");
    const video = document.getElementById("portfolioVideo");
    if (!modal || !video) return;

    const open = (src) => {
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");

        video.src = src;
        video.currentTime = 0;
        video.play().catch(() => { });
        document.body.style.overflow = "hidden";
    };

    const close = () => {
        video.pause();
        video.removeAttribute("src");
        video.load();

        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    };

    document.addEventListener("click", (e) => {
        const btn = e.target.closest(".portfolio-card[data-video-src]");
        if (!btn) return;
        const src = btn.getAttribute("data-video-src");
        if (src) open(src);
    });

    modal.addEventListener("click", (e) => {
        if (e.target.closest("[data-close='1']")) close();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("is-open")) close();
    });
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-portfolio-row]").forEach((row) => {
        const key = row.getAttribute("data-portfolio-row");
        initRow(row, key);
    });

    initModal();
});
