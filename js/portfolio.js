// js/portfolio.js

const portfolio = {
    sound: [
        { thumb: "/assets/images/portfolio/sound-1.png", src: "/assets/videos/sound-1.mp4" },
        { thumb: "/assets/images/portfolio/sound-2.png", src: "/assets/videos/sound-2.mp4" },
        { thumb: "/assets/images/portfolio/sound-3.png", src: "/assets/videos/sound-3.mp4" },
        // add more...
    ],
    music: [
        { thumb: "/assets/images/portfolio/music-1.png", src: "/assets/videos/music-1.mp4" },
        { thumb: "/assets/images/portfolio/music-2.png", src: "/assets/videos/music-2.mp4" },
        { thumb: "/assets/images/portfolio/music-3.png", src: "/assets/videos/music-3.mp4" },
    ],
    space: [
        { thumb: "/assets/images/portfolio/space-1.png", src: "/assets/videos/space-1.mp4" },
        { thumb: "/assets/images/portfolio/space-2.png", src: "/assets/videos/space-2.mp4" },
        { thumb: "/assets/images/portfolio/space-3.png", src: "/assets/videos/space-3.mp4" },
    ],
};

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
    const prevBtn = rowEl.querySelector(`[data-action="prev"]`);
    const nextBtn = rowEl.querySelector(`[data-action="next"]`);

    if (!track || !prevBtn || !nextBtn) return;

    // Render cards
    track.innerHTML = (portfolio[key] || []).map(cardHtml).join("");

    let index = 0;
    let stepPx = 0;
    let maxIndex = 0;

    const compute = () => {
        const cards = Array.from(track.children);
        const pv = perView();

        if (!cards.length) return;

        // gap from CSS
        const gap = parseFloat(getComputedStyle(track).gap || "0");

        // card width (they are full-width; we calculate based on viewport)
        const viewport = rowEl.querySelector(".portfolio-viewport");
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

    // Recompute on resize
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

        // set src and play
        video.src = src;
        video.currentTime = 0;
        video.play().catch(() => { });
        document.body.style.overflow = "hidden";
    };

    const close = () => {
        // stop playback completely
        video.pause();
        video.removeAttribute("src");
        video.load();

        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    };

    // open on card click (event delegation)
    document.addEventListener("click", (e) => {
        const btn = e.target.closest(".portfolio-card[data-video-src]");
        if (!btn) return;
        const src = btn.getAttribute("data-video-src");
        if (src) open(src);
    });

    // close handlers
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
