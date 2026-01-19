// /js/mnk-work.js
"use strict";

(function () {
    const $ = (s, p = document) => p.querySelector(s);

    // ✅ tabs
    const TABS = [
        { key: "production", label: "Production" },
        { key: "mastering", label: "Mastering" },
        { key: "sound_design", label: "Sound Design & Foley" },
        { key: "recording", label: "Recording" },
        { key: "podcast", label: "Podcast" },
    ];

    // ✅ data (extend freely)
    const WORK = {
        production: [
            {
                title: "Cinema: VOX Cinemas - Bad Boys Teaser (5.1 Surround Sound Mix)",
                thumb: "/assets/images/OtherServices/PodcastWork/Work1.webp",
                src: "/assets/videos/sound-1.mp4",
                // optional (for design)
                topTitle: "L'ART DE VIVRE",
                topSubtitle: "IN THE HEART OF THE METROPOLIS",
                credits: "Samuel Sabu, Jason Baretto, Aarti Venkatasubramanian, Miltiadis Kyvernitis",
                bullets: [
                    "Sound Design by MNK Studios",
                    "Mix & Master by MNK Studios",
                    "Foley Work by MNK Studios",
                    "5.1 Surround Sound",
                ],
                ctaText: "Inquire Now",
                ctaHref: "/contact-us/",
            },
            {
                title: "Cinema: VOX Cinemas - Bad Boys Teaser (5.1 Surround Sound Mix)",
                thumb: "/assets/images/OtherServices/PodcastWork/Work2.webp",
                src: "/assets/videos/sound-2.mp4",
                topTitle: "L'ART DE VIVRE",
                topSubtitle: "IN THE HEART OF THE METROPOLIS",
                credits: "Samuel Sabu, Jason Baretto, Aarti Venkatasubramanian, Miltiadis Kyvernitis",
                bullets: [
                    "Sound Design by MNK Studios",
                    "Mix & Master by MNK Studios",
                    "Foley Work by MNK Studios",
                    "5.1 Surround Sound",
                ],
                ctaText: "Inquire Now",
                ctaHref: "/contact-us/",
            },
        ],

        mastering: [
            { title: "Mastering Project Example Title", thumb: "/assets/images/OtherServices/PodcastWork/Work2.webp", src: "/assets/videos/sound-2.mp4" },
            { title: "Mastering Project Example Title", thumb: "/assets/images/OtherServices/PodcastWork/Work3.webp", src: "/assets/videos/sound-3.mp4" },
        ],

        sound_design: [
            { title: "Sound Design Example Title", thumb: "/assets/images/OtherServices/PodcastWork/Work4.webp", src: "/assets/videos/sound-4.mp4" },
            { title: "Sound Design Example Title", thumb: "/assets/images/OtherServices/PodcastWork/Work5.webp", src: "/assets/videos/sound-5.mp4" },
        ],

        recording: [
            { title: "Recording Example Title", thumb: "/assets/images/OtherServices/PodcastWork/Work1.webp", src: "/assets/videos/sound-1.mp4" },
            { title: "Recording Example Title", thumb: "/assets/images/OtherServices/PodcastWork/Work2.webp", src: "/assets/videos/sound-2.mp4" },
        ],

        podcast: [
            { title: "Podcast Example Title", thumb: "/assets/images/OtherServices/PodcastWork/Work3.webp", src: "/assets/videos/sound-3.mp4" },
            { title: "Podcast Example Title", thumb: "/assets/images/OtherServices/PodcastWork/Work4.webp", src: "/assets/videos/sound-4.mp4" },
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

    function getCount(key) {
        return (WORK[key] || []).length;
    }

    // ---------- Tabs ----------
    function tabBtnHtml(tab, activeKey) {
        const isActive = tab.key === activeKey;
        const count = getCount(tab.key);

        return `
      <button
        type="button"
        class="
          work-tab whitespace-nowrap shrink-0
          flex items-center justify-between gap-3
          lg:w-full
          ${isActive ? "text-white bg-[#212931]" : "text-white"}
          px-4 py-3 lg:px-5 lg:py-4
          rounded-none
          transition
        "
        data-work-tab="${escapeHtml(tab.key)}"
        aria-pressed="${isActive ? "true" : "false"}"
      >
        <h5 class="text-[16px] lg:text-[18px] lg:leading-[28px] leading-[22px] font-semibold">
          ${escapeHtml(tab.label)}
        </h5>

        <span class="shrink-0 py-[3px] px-[10px] !pt-[3.5px] rounded-full grid place-items-center bg-[#2B333D] !text-[12px] !leading-[18px]">
          ${count}
        </span>
      </button>
    `;
    }

    function renderTabs(activeKey) {
        const tabsEl = $("#workTabs");
        const scrollEl = $("#workTabsScroll");
        if (!tabsEl) return;

        // ensure smooth touch scroll on iOS
        if (scrollEl) scrollEl.style.webkitOverflowScrolling = "touch";

        tabsEl.innerHTML = TABS.map((t) => tabBtnHtml(t, activeKey)).join("");
    }


    // ---------- Grid Cards ----------
    function cardHtml(item, idx, activeKey) {
        const thumb = escapeHtml(item.thumb);
        const title = escapeHtml(item.title || "");

        return `
      <div class="w-full">
        <button
          type="button"
          class="group relative w-full overflow-hidden bg-[#0b0f14] border border-white/10"
          data-work-open="1"
          data-work-key="${escapeHtml(activeKey)}"
          data-work-idx="${idx}"
          aria-label="Open details"
        >
          <img src="${thumb}" alt="" class="w-full aspect-video object-cover " loading="lazy" />

          <div class="absolute inset-0 grid place-items-center">
            <img src="/assets/images/PlayIcon.svg" alt=""
              class="w-[44px] h-[44px] sm:w-[54px] sm:h-[54px] md:w-[68px] md:h-[68px]" />
          </div>
        </button>

        <p
          class="mt-2 text-white font-semibold text-[14px] sm:text-[15px] md:text-[18px] leading-[20px] sm:leading-[22px] md:leading-[28px] break-words"
          style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;"
          title="${title}"
        >
          ${title}
        </p>

      </div>
    `;
    }

    function renderGrid(activeKey) {
        const grid = $("#workGrid");
        if (!grid) return;

        const items = WORK[activeKey] || [];
        if (!items.length) {
            grid.innerHTML = `<p class="text-white/70 text-[14px]">No videos found for this category.</p>`;
            return;
        }

        // ✅ mobile: 1 per row, desktop: 2 per row, 50px after each row
        grid.className = "grid grid-cols-1 lg:grid-cols-2 gap-x-5 gap-y-[24px] lg:gap-y-[50px]";
        grid.innerHTML = items.map((it, idx) => cardHtml(it, idx, activeKey)).join("");
    }

    // ---------- DETAIL MODAL (match your design) ----------
    function ensureDetailModal() {
        if ($("#workDetailModal")) return;

        const modal = document.createElement("div");
        modal.id = "workDetailModal";
        modal.className = "portfolio-modal"; // ✅ reuse your modal styling base
        modal.setAttribute("aria-hidden", "true");

        // NOTE:
        // - We keep "portfolio-modal__backdrop" & "__dialog" naming because you likely already styled them.
        // - Layout inside is adjusted to match your screenshot.
        modal.innerHTML = `
      <div class="portfolio-modal__backdrop" data-work-detail-close="1"></div>

      <div class="portfolio-modal__dialog !max-w-[980px] !w-[95vw] !p-0 overflow-hidden border border-white/10 bg-[#0b0f14] !rounded-none !h-auto">
        <!-- close -->
        <button type="button"
          class="absolute right-4 top-4 z-[5] grid place-items-center"
          data-work-detail-close="1" aria-label="Close">
          <img src="/assets/images/CrossIcon2.svg" alt="Close" />
        </button>

        <!-- TOP IMAGE AREA -->
        <div class="relative">
          <button type="button" class="relative w-full" data-work-detail-play="1" aria-label="Play video">
            <img id="workDetailThumb" src="" alt="" class="w-full object-cover h-[240px] sm:h-[320px] md:h-[420px]" />

            <!-- centered play -->
            <div class="absolute inset-0 grid place-items-center">
              <div class="grid place-items-center w-[64px] h-[64px] md:w-[84px] md:h-[84px] rounded-full bg-black/40 border border-white/20">
                <img src="/assets/images/PlayIcon.svg" alt="" class="w-[34px] h-[34px] md:w-[44px] md:h-[44px]" />
              </div>
            </div>

            <!-- top centered text like screenshot -->
            <div class="absolute inset-x-0 top-[48%] -translate-y-1/2 text-center px-4">
              <p id="workDetailTopTitle" class="text-white tracking-[0.2em] text-[14px] md:text-[18px] font-semibold uppercase"></p>
              <p id="workDetailTopSubtitle" class="text-white/80 tracking-[0.25em] text-[10px] md:text-[12px] uppercase mt-1"></p>
            </div>

            <!-- credits line -->
            <div class="absolute inset-x-0 bottom-4 text-center px-4">
              <p id="workDetailCredits" class="text-[#F5A23A] text-[12px] md:text-[14px] font-semibold"></p>
            </div>
          </button>

          <!-- logo bottom-right -->
          <div class="absolute right-4 bottom-4 md:right-6 md:bottom-6 z-[4] flex items-center gap-2">
            <img src="/assets/images/OurWork/RightImage.png" alt="" class="w-[42px] h-[42px] rounded-full object-cover hidden md:block" />
          </div>
        </div>

        <!-- BOTTOM CONTENT PANEL -->
        <div class="bg-[#141A21] border-t border-white/10 p-4 md:p-6">
          <h3 id="workDetailTitle" class="text-white font-semibold text-[16px] md:text-[22px] leading-[22px] md:leading-[30px]"></h3>

          <ul id="workDetailBullets" class="mt-4 space-y-2 text-white/60 text-[12px] md:text-[14px]">
          </ul>

          <div class="mt-5">
            <a id="workDetailCta"
              href="/contact-us/"
              class="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-white font-bold text-[13px] md:text-[14px]">
              Inquire Now
            </a>
          </div>
        </div>
      </div>
    `;

        document.body.appendChild(modal);
    }

    function openDetailModal(item) {
        ensureDetailModal();

        const modal = $("#workDetailModal");
        const thumbEl = $("#workDetailThumb");
        const titleEl = $("#workDetailTitle");
        const bulletsEl = $("#workDetailBullets");
        const ctaEl = $("#workDetailCta");

        const topTitleEl = $("#workDetailTopTitle");
        const topSubtitleEl = $("#workDetailTopSubtitle");
        const creditsEl = $("#workDetailCredits");

        if (!modal || !thumbEl || !titleEl || !bulletsEl || !ctaEl) return;

        thumbEl.src = item.thumb || "";
        titleEl.textContent = item.title || "";

        // top overlay text
        if (topTitleEl) topTitleEl.textContent = item.topTitle || "";
        if (topSubtitleEl) topSubtitleEl.textContent = item.topSubtitle || "";
        if (creditsEl) creditsEl.textContent = item.credits || "";

        // bullets
        const bullets = Array.isArray(item.bullets) ? item.bullets : [];
        bulletsEl.innerHTML = bullets.length
            ? bullets.map((b) => `
          <li class="flex gap-3">
            <span class="mt-[7px] w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>
            <span>${escapeHtml(b)}</span>
          </li>
        `).join("")
            : "";

        // CTA
        ctaEl.textContent = item.ctaText || "Inquire Now";
        ctaEl.href = item.ctaHref || "/contact-us/";

        // store video src
        modal.__videoSrc = item.src || "";

        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");

        // ✅ keep scroll locked
        document.body.style.overflow = "hidden";
    }

    function closeDetailModal() {
        const modal = $("#workDetailModal");
        if (!modal) return;

        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");

        // unlock only if video modal isn't open
        const videoModalOpen = $("#portfolioModal")?.classList.contains("is-open");
        if (!videoModalOpen) document.body.style.overflow = "";
    }

    // ---------- VIDEO MODAL ----------
    function initVideoModalOnce() {
        if (window.__ourWorkVideoModalInit) return;
        window.__ourWorkVideoModalInit = true;

        const modal = $("#portfolioModal");
        const video = $("#portfolioVideo");
        if (!modal || !video) return;

        window.__openVideoModal = function (src) {
            // ✅ Ensure video modal is above detail modal
            modal.style.zIndex = "10050";
            const detail = $("#workDetailModal");
            if (detail) detail.style.zIndex = "10000";

            // ✅ Move video modal to the end of body (wins stacking order)
            document.body.appendChild(modal);

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

            // ✅ if detail modal still open, KEEP body locked
            const detailOpen = $("#workDetailModal")?.classList.contains("is-open");
            if (!detailOpen) document.body.style.overflow = "";
        };

        modal.addEventListener("click", (e) => {
            if (e.target.closest("[data-close='1']")) close();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modal.classList.contains("is-open")) close();
        });
    }

    // ---------- Init ----------
    function init() {
        const tabsEl = $("#workTabs");
        const gridEl = $("#workGrid");
        if (!tabsEl || !gridEl) return;

        let activeKey = TABS[0]?.key || "production";

        const setActive = (key) => {
            activeKey = key;
            renderTabs(activeKey);
            renderGrid(activeKey);

            const activeBtn = tabsEl.querySelector(`[data-work-tab="${key}"]`);
            if (activeBtn && window.innerWidth < 1024) {
                activeBtn.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
            }
        };

        setActive(activeKey);
        initVideoModalOnce();
        ensureDetailModal();

        // tab clicks
        tabsEl.addEventListener("click", (e) => {
            const btn = e.target.closest("[data-work-tab]");
            if (!btn) return;
            const key = btn.getAttribute("data-work-tab");
            if (!key) return;
            setActive(key);
        });

        // open detail
        document.addEventListener("click", (e) => {
            const btn = e.target.closest("[data-work-open='1']");
            if (!btn) return;

            const key = btn.getAttribute("data-work-key");
            const idx = parseInt(btn.getAttribute("data-work-idx") || "0", 10);
            const item = (WORK[key] || [])[idx];
            if (!item) return;

            openDetailModal(item);
        });

        // detail close + play
        document.addEventListener("click", (e) => {
            if (e.target.closest("[data-work-detail-close='1']")) {
                closeDetailModal();
                return;
            }

            const playBtn = e.target.closest("[data-work-detail-play='1']");
            if (playBtn) {
                const modal = $("#workDetailModal");
                const src = modal?.__videoSrc;

                if (src && typeof window.__openVideoModal === "function") {
                    // ✅ IMPORTANT: DO NOT close detail modal
                    // Just open video modal above it
                    window.__openVideoModal(src);
                }
            }
        });

        // esc closes detail if open (video modal handles itself)
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                const detailOpen = $("#workDetailModal")?.classList.contains("is-open");
                const videoOpen = $("#portfolioModal")?.classList.contains("is-open");

                // if video is open, let its handler manage Escape close first
                if (!videoOpen && detailOpen) closeDetailModal();
            }
        });
    }

    document.addEventListener("DOMContentLoaded", init);
})();
