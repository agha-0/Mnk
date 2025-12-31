// js/who-done-for.js

const artists = [
    "DJ BLISS",
    "ATIF ASLAM",
    "MAHER ZAIN",
    "VALERIYA",
    "KADIM AL SAHIR",
    "AMY ROKO",
];

// put your real image filenames here:
const clients = [
    "/assets/images/clients/viu.png",
    "/assets/images/clients/samsung.png",
    "/assets/images/clients/netflix.png",
    "/assets/images/clients/seaworld.png",
    "/assets/images/clients/azizi.png",
    "/assets/images/clients/etisalat.png",
];

function escapeHtml(str = "") {
    return str.replace(/[&<>"']/g, (m) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    }[m]));
}

function clientItem(src) {
    const safeSrc = escapeHtml(src);
    const alt = safeSrc.split("/").pop().split(".")[0].replace(/[-_]/g, " ");

    return `
    <div class="who-item-box flex items-center justify-center
                md:w-[200px] md:h-[90px]
                w-[140px] h-[56px]
                shrink-0">
      <img src="${safeSrc}" alt="${escapeHtml(alt)}"
           class="max-h-[60%] max-w-[70%] object-contain opacity-90" />
    </div>
  `;
}

function artistItem(name) {
    const safe = escapeHtml(name);

    return `
    <div class="who-item-box flex items-center justify-center
                md:w-[200px] md:h-[90px]
                w-[160px] h-[56px]
                shrink-0">
      <span class="text-white/90 font-semibold tracking-wide md:text-[12px] text-[11px]">
        ${safe}
      </span>
    </div>
  `;
}

/**
 * Builds a seamless marquee:
 * - we render items TWICE
 * - CSS animates track from 0 to -50%
 */
function renderMarquee(trackSelector, itemsHtml) {
    const track = document.querySelector(trackSelector);
    if (!track) return;

    const gapClass = "gap-3 md:gap-4"; // spacing between boxes
    track.className = `marquee-track ${gapClass}`;

    // Duplicate the list for seamless looping
    track.innerHTML = itemsHtml + itemsHtml;
}

document.addEventListener("DOMContentLoaded", () => {
    const clientsHtml = clients.map(clientItem).join("");
    const artistsHtml = artists.map(artistItem).join("");

    renderMarquee('[data-track="clients"]', clientsHtml);
    renderMarquee('[data-track="artists"]', artistsHtml);
});
