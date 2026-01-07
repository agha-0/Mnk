// js/our-clients.js
"use strict";

/**
 * Our Clients
 * - Desktop (>= 1024px): static grid (no scrolling) like reference
 * - Mobile/Tablet (< 1024px): marquee auto-scroll (same flow)
 *
 * Images:
 * /assets/images/OtherServices/Clients/client1.png ... clientN.png
 */

const BASE_PATH = "/assets/images/OtherServices/Clients/client";
const EXT = "png";

// Desktop card size (fixed width like your layout)
const DESKTOP_CARD_W = "w-[230px]";
const DESKTOP_CARD_H = "h-[90px]";

// Desktop grid gap (so gaps are visible)
const DESKTOP_GAP = "gap-3";

// Desktop grid columns (fixed width columns)
const DESKTOP_COLS = "grid-cols-[repeat(5,230px)]";

// Shared card styling
const CARD_BASE =
    "who-item-box flex items-center justify-center shrink-0 " +
    "!bg-[#0D1014] border border-[#2B333D]";

// Image styling (desktop + mobile)
const IMG_BASE = "object-contain opacity-90";

// Mobile sizes (keep your current marquee sizing)
const MOBILE_WRAP = "w-[140px] h-[56px] md:w-[200px] md:h-[90px]";
const MOBILE_IMG = "max-h-[60%] max-w-[70%]";
const DESKTOP_IMG = "max-h-[55%] max-w-[75%]";

function escapeHtml(str = "") {
    return str.replace(/[&<>"']/g, (m) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    }[m]));
}

function altFromSrc(src) {
    const name = (src || "").split("/").pop()?.split(".")[0] || "client";
    return escapeHtml(name.replace(/[-_]/g, " "));
}

/** Mobile marquee item */
function clientItemMarquee(src) {
    const safeSrc = escapeHtml(src);
    const alt = altFromSrc(src);

    return `
    <div class="${CARD_BASE} ${MOBILE_WRAP} grayscale hover:grayscale-0">
      <img src="${safeSrc}" alt="${alt}"
           class="${IMG_BASE} ${MOBILE_IMG}" />
    </div>
  `;
}

/** Desktop grid cell */
function clientCellGrid(src) {
    const safeSrc = escapeHtml(src);
    const alt = altFromSrc(src);

    return `
    <div class="${CARD_BASE} ${DESKTOP_CARD_W} ${DESKTOP_CARD_H} grayscale hover:grayscale-0">
      <img src="${safeSrc}" alt="${alt}"
           class="${IMG_BASE} ${DESKTOP_IMG}" />
    </div>
  `;
}

/** Empty placeholder used to center last row while keeping equal widths */
function placeholderCell() {
    return `<div class="${DESKTOP_CARD_W} ${DESKTOP_CARD_H} opacity-0 pointer-events-none"></div>`;
}

/**
 * Marquee builder:
 * - render items twice for seamless loop
 * - relies on your existing CSS for `.marquee-track` animation
 */
function renderMarquee(trackEl, itemsHtml) {
    if (!trackEl) return;

    // Restore marquee behavior
    trackEl.style.animation = "";
    trackEl.style.transform = "";

    trackEl.className = "marquee-track gap-3 md:gap-4";
    trackEl.innerHTML = itemsHtml + itemsHtml;
}

/**
 * Desktop layout:
 * - 5 fixed columns
 * - first 15 items fill 3 rows (5x3)
 * - remainder (usually 3) is centered in a 5-col row using invisible placeholders
 * - ALL cards same fixed width (no spanning)
 */
function renderDesktopGrid(trackEl, clients) {
    if (!trackEl) return;

    // Stop any marquee animation if applied somewhere
    trackEl.style.animation = "none";
    trackEl.style.transform = "none";

    // Remove marquee-track class so it doesn't force flex/animation
    trackEl.className = "w-full";

    const firstChunk = clients.slice(0, 15);
    const remainder = clients.slice(15);

    const topGrid = `
    <div class="grid ${DESKTOP_COLS} justify-center ${DESKTOP_GAP}">
      ${firstChunk.map(clientCellGrid).join("")}
    </div>
  `;

    let bottomRow = "";
    if (remainder.length) {
        // Center remainder within 5 cols using placeholders
        const lead = Math.floor((5 - remainder.length) / 2);
        const tail = 5 - remainder.length - lead;

        bottomRow = `
      <div class="grid ${DESKTOP_COLS} justify-center ${DESKTOP_GAP}">
        ${Array.from({ length: lead }, placeholderCell).join("")}
        ${remainder.map(clientCellGrid).join("")}
        ${Array.from({ length: tail }, placeholderCell).join("")}
      </div>
    `;
    }

    trackEl.innerHTML = `
    <div class="w-full flex flex-col ${DESKTOP_GAP}">
      ${topGrid}
      ${bottomRow}
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
    const track =
        document.querySelector('[data-track="clients"]') ||
        document.querySelector("#clientsTrack") ||
        document.querySelector("[data-clients-track]");

    if (!track) return;

    const marqueeWrap =
        track.closest('[data-marquee="clients"]') ||
        track.closest(".marquee") ||
        null;

    // Optional: set in HTML: data-clients-count="18"
    const countAttr =
        marqueeWrap?.getAttribute("data-clients-count") ||
        track.getAttribute("data-clients-count");

    const CLIENTS_COUNT = Math.max(1, Number(countAttr) || 18);

    const clients = Array.from({ length: CLIENTS_COUNT }, (_, i) => {
        const n = i + 1;
        return `${BASE_PATH}${n}.${EXT}`;
    });

    const desktopMQ = window.matchMedia("(min-width: 1024px)");
    let lastMode = null;

    const render = () => {
        const isDesktop = desktopMQ.matches;
        if (isDesktop === lastMode) return;
        lastMode = isDesktop;

        if (isDesktop) {
            // ensure grid isn't clipped
            if (marqueeWrap) {
                marqueeWrap.classList.add("overflow-visible");
                marqueeWrap.classList.remove("overflow-hidden");
            }
            renderDesktopGrid(track, clients);
        } else {
            if (marqueeWrap) {
                marqueeWrap.classList.remove("overflow-visible");
            }
            const clientsHtml = clients.map(clientItemMarquee).join("");
            renderMarquee(track, clientsHtml);
        }
    };

    render();

    if (desktopMQ.addEventListener) desktopMQ.addEventListener("change", render);
    else desktopMQ.addListener(render);

    window.addEventListener("resize", () => window.requestAnimationFrame(render));
});
