// js/podcast-work.js
"use strict";

/**
 * Podcast Work
 * - Desktop (>=1024): static layout like reference image
 *   Row 1: 3 equal cards
 *   Row 2: 2 cards centered
 * - Mobile/Tablet (<1024):
 *   if ENABLE_CAROUSEL = true => carousel
 *   else => stacked 1 per row
 */

const ENABLE_CAROUSEL = false;

const portfolio = {
    sound: [
        { thumb: "/assets/images/OtherServices/PodcastWork/Work1.webp", src: "/assets/videos/sound-1.mp4" },
        { thumb: "/assets/images/OtherServices/PodcastWork/Work2.webp", src: "/assets/videos/sound-2.mp4" },
        { thumb: "/assets/images/OtherServices/PodcastWork/Work3.webp", src: "/assets/videos/sound-3.mp4" },
        { thumb: "/assets/images/OtherServices/PodcastWork/Work4.webp", src: "/assets/videos/sound-4.mp4" },
        { thumb: "/assets/images/OtherServices/PodcastWork/Work5.webp", src: "/assets/videos/sound-5.mp4" },
        // add more...
    ],
};

const desktopMQ = window.matchMedia("(min-width: 1024px)");

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
      class="portfolio-card w-full"
      data-video-src="${src}"
      aria-label="Play video">
      <img class="portfolio-thumb" src="${thumb}" alt="" />
      <div class="portfolio-play">
        <div class="portfolio-play__bubble">
          <img src="/assets/images/PlayIcon.svg" alt=""
               class="w-[24px] h-[24px] md:w-[60px] md:h-[60px]" />
        </div>
      </div>
    </button>
  `;
}

function perView() {
    if (window.matchMedia("(min-width: 1024px)").matches) return 3;
    if (window.matchMedia("(min-width: 375px)").matches) return 2;
    return 1;
}

function setViewportMode(viewport, mode) {
    if (!viewport) return;

    viewport.classList.remove(
        "overflow-x-auto",
        "overflow-y-hidden",
        "overflow-hidden",
        "!overflow-visible",
        "snap-x",
        "snap-mandatory",
        "scroll-smooth"
    );

    if (mode === "desktop" || mode === "stack") {
        viewport.classList.add("!overflow-visible");
    } else if (mode === "carousel-snap") {
        viewport.classList.add("overflow-x-auto", "overflow-y-hidden", "snap-x", "snap-mandatory", "scroll-smooth");
    } else if (mode === "carousel-transform") {
        viewport.classList.add("overflow-hidden");
    }
}

function renderDesktopLayout(track, items) {
    // ✅ matches design:
    // row1: first 3
    // row2: next 2 (centered)
    // rest: remaining (optional)
    const row1 = items.slice(0, 3);
    const row2 = items.slice(3, 5); // ✅ ONLY 2
    const rest = items.slice(5);

    const row1Html = row1.length
        ? `
      <div class="grid grid-cols-3 gap-6">
        ${row1.map(cardHtml).join("")}
      </div>
    `
        : "";

    // ✅ Centered 2-card row.
    // We wrap a 2-col grid in a centered container with a max width
    // roughly equal to 2 cards + 1 gap, so it sits centered under row1.
    const row2Html = row2.length
        ? `
      <div class="flex justify-center">
        <div class="grid grid-cols-2 gap-6 w-full max-w-[calc((100%-48px)*2/3+24px)]">
          ${row2.map(cardHtml).join("")}
        </div>
      </div>
    `
        : "";

    const restHtml = rest.length
        ? `
      <div class="grid grid-cols-3 gap-6">
        ${rest.map(cardHtml).join("")}
      </div>
    `
        : "";

    track.className = "portfolio-track !block";
    track.style.transform = "none";

    track.innerHTML = `
    <div class="w-full space-y-6">
      ${row1Html}
      ${row2Html}
      ${restHtml}
    </div>
  `;

    Array.from(track.querySelectorAll(".portfolio-card")).forEach((c) => {
        c.style.width = "";
        c.classList.remove("snap-start");
    });
}

function renderStacked(track, items) {
    track.className = "portfolio-track !block";
    track.style.transform = "none";

    track.innerHTML = `
    <div class="grid grid-cols-1 gap-5">
      ${items.map(cardHtml).join("")}
    </div>
  `;

    Array.from(track.querySelectorAll(".portfolio-card")).forEach((c) => {
        c.style.width = "";
        c.classList.remove("snap-start");
    });
}

function renderCarousel(rowEl, track, viewport, items) {
    const prevBtn = rowEl.querySelector(`[data-action="prev"]`);
    const nextBtn = rowEl.querySelector(`[data-action="next"]`);
    const hasArrows = !!(prevBtn && nextBtn);

    track.className = "portfolio-track flex gap-4";
    track.innerHTML = items.map(cardHtml).join("");
    track.style.transform = "none";

    const cards = Array.from(track.children);

    const computeWidths = () => {
        if (!viewport || !cards.length) return;

        const pv = perView();
        const gap = parseFloat(getComputedStyle(track).gap || "0");
        const viewportW = viewport.getBoundingClientRect().width;
        const cardW = (viewportW - gap * (pv - 1)) / pv;

        cards.forEach((c) => (c.style.width = `${cardW}px`));
        return { stepPx: cardW + gap, maxIndex: Math.max(0, cards.length - pv) };
    };

    // scroll-snap carousel (works even without arrows)
    if (!hasArrows) {
        setViewportMode(viewport, "carousel-snap");
        cards.forEach((c) => c.classList.add("snap-start"));

        const onResize = () => window.requestAnimationFrame(computeWidths);
        if (rowEl.__podcastResize) window.removeEventListener("resize", rowEl.__podcastResize);
        rowEl.__podcastResize = onResize;
        window.addEventListener("resize", onResize);

        computeWidths();
        return;
    }

    // transform carousel (with arrows)
    setViewportMode(viewport, "carousel-transform");
    cards.forEach((c) => c.classList.remove("snap-start"));

    prevBtn.style.display = "";
    nextBtn.style.display = "";

    const state = rowEl.__podcastState || (rowEl.__podcastState = { index: 0 });

    const update = () => {
        const m = computeWidths();
        if (!m) return;

        state.index = Math.min(state.index, m.maxIndex);
        track.style.transform = `translateX(-${state.index * m.stepPx}px)`;

        prevBtn.disabled = state.index <= 0;
        nextBtn.disabled = state.index >= m.maxIndex;
    };

    prevBtn.onclick = () => {
        state.index = Math.max(0, state.index - 1);
        update();
    };

    nextBtn.onclick = () => {
        const m = computeWidths();
        if (!m) return;
        state.index = Math.min(m.maxIndex, state.index + 1);
        update();
    };

    const onResize = () => window.requestAnimationFrame(update);
    if (rowEl.__podcastResize) window.removeEventListener("resize", rowEl.__podcastResize);
    rowEl.__podcastResize = onResize;
    window.addEventListener("resize", onResize);

    update();
}

function renderRow(rowEl, key) {
    const track = rowEl.querySelector(`[data-track="${key}"]`);
    const viewport = rowEl.querySelector(".portfolio-viewport");
    if (!track) return;

    const items = portfolio[key] || [];
    const isDesktop = desktopMQ.matches;

    const mode = isDesktop ? "desktop" : (ENABLE_CAROUSEL ? "carousel" : "stack");
    const prevMode = rowEl.__podcastMode;
    rowEl.__podcastMode = mode;

    if (mode === "desktop") {
        setViewportMode(viewport, "desktop");
        renderDesktopLayout(track, items);
        return;
    }

    if (mode === "stack") {
        setViewportMode(viewport, "stack");
        renderStacked(track, items);

        const prevBtn = rowEl.querySelector(`[data-action="prev"]`);
        const nextBtn = rowEl.querySelector(`[data-action="next"]`);
        if (prevBtn) prevBtn.style.display = "none";
        if (nextBtn) nextBtn.style.display = "none";
        return;
    }

    if (mode === "carousel") {
        if (prevMode !== "carousel") setViewportMode(viewport, "carousel-snap");
        renderCarousel(rowEl, track, viewport, items);
    }
}

function initModalOnce() {
    if (window.__podcastWorkModalInit) return;
    window.__podcastWorkModalInit = true;

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
    const rows = Array.from(document.querySelectorAll("[data-portfolio-row]")).map((rowEl) => ({
        rowEl,
        key: rowEl.getAttribute("data-portfolio-row"),
    }));

    const renderAll = () => rows.forEach(({ rowEl, key }) => renderRow(rowEl, key));

    renderAll();
    initModalOnce();

    if (desktopMQ.addEventListener) desktopMQ.addEventListener("change", renderAll);
    else desktopMQ.addListener(renderAll);

    window.addEventListener("resize", () => window.requestAnimationFrame(renderAll));
});
