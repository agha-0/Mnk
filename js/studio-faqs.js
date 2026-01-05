// /js/studio-faqs.js

const studioFaqs = [
    {
        id: "room-acoustics",
        title: "Room & Acoustics",
        icon: "/assets/images/studio-faqs/room-acoustics.svg",
        answers: [
            "Size: Approx. 320 sq ft",
            "Construction: Floating floors, isolated walls, and double-door sound lock",
            "Isolation Rating: ~55 dB (studio-grade attenuation)",
            "Acoustic Treatment: Controlled reflections and balanced frequency response",
        ],
    },
    {
        id: "audio-backline",
        title: "Audio & Backline Equipment",
        icon: "/assets/images/studio-faqs/audio-backline.svg",
        answers: [
            "Premium drum kit + cymbals (studio-ready setup)",
            "Guitar + bass amps with flexible routing",
            "PA monitoring with clean headroom for rehearsals",
        ],
    },
    {
        id: "recording-connectivity",
        title: "Recording & Connectivity",
        icon: "/assets/images/studio-faqs/recording-connectivity.svg",
        answers: [
            "Stereo / multitrack capture options",
            "Direct routing support to control room workflow",
            "Simple I/O access for quick plug-and-play sessions",
        ],
    },
    {
        id: "environment-comfort",
        title: "Environment & Comfort",
        icon: "/assets/images/studio-faqs/environment-comfort.svg",
        answers: [
            "Adjustable mood lighting for creative ambience",
            "Comfortable capacity for band + guests",
            "Ventilation + temperature balance for long sessions",
        ],
    },
    {
        id: "ideal-for",
        title: "Ideal For",
        icon: "/assets/images/studio-faqs/ideal-for.svg",
        answers: [
            "Full-band rehearsals & tight run-throughs",
            "Pre-production & arrangement refinement",
            "Live content capture for social media",
        ],
    },
];

/**
 * Converts Figma-exported SVGs with hardcoded colors into "currentColor" SVGs
 * so Tailwind text-* classes can control icon color.
 */
function normalizeSvgToCurrentColor(svgText) {
    if (!svgText) return "";

    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, "image/svg+xml");

        // If parsing fails, doc will include <parsererror>
        if (doc.querySelector("parsererror")) return svgText;

        const svg = doc.querySelector("svg");
        if (!svg) return svgText;

        // Normalize root attributes too
        const rootFill = svg.getAttribute("fill");
        if (rootFill && rootFill !== "none" && rootFill !== "currentColor") {
            svg.setAttribute("fill", "currentColor");
        }
        const rootStroke = svg.getAttribute("stroke");
        if (rootStroke && rootStroke !== "none" && rootStroke !== "currentColor") {
            svg.setAttribute("stroke", "currentColor");
        }

        // Normalize every child element
        svg.querySelectorAll("*").forEach((el) => {
            const fill = el.getAttribute("fill");
            if (fill && fill !== "none" && fill !== "currentColor") {
                el.setAttribute("fill", "currentColor");
            }

            const stroke = el.getAttribute("stroke");
            if (stroke && stroke !== "none" && stroke !== "currentColor") {
                el.setAttribute("stroke", "currentColor");
            }

            // Handle inline style="fill:#xxx; stroke:#yyy;"
            const style = el.getAttribute("style");
            if (style) {
                let nextStyle = style;

                // Replace fill values unless it's "none/currentColor"
                nextStyle = nextStyle.replace(/fill\s*:\s*([^;]+)\s*;?/gi, (m, v) => {
                    return /none|currentColor/i.test(v) ? m : "fill: currentColor;";
                });

                // Replace stroke values unless it's "none/currentColor"
                nextStyle = nextStyle.replace(/stroke\s*:\s*([^;]+)\s*;?/gi, (m, v) => {
                    return /none|currentColor/i.test(v) ? m : "stroke: currentColor;";
                });

                el.setAttribute("style", nextStyle);
            }
        });

        return new XMLSerializer().serializeToString(svg);
    } catch (e) {
        return svgText; // fallback safely
    }
}

async function fetchSvg(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load SVG: ${url}`);
    const raw = await res.text();
    return normalizeSvgToCurrentColor(raw);
}

function makePlusMinusIcon() {
    const wrap = document.createElement("span");
    wrap.className = "inline-flex items-center justify-center text-white";
    wrap.innerHTML = `
    <svg viewBox="0 0 24 24" class="w-[24px] h-[24px]" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path class="pm-vert transition-opacity duration-200 opacity-100" d="M12 5v14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `;
    return wrap;
}

function closePanel(panel) {
    panel.dataset.state = "closed";

    if (panel.style.height === "auto") {
        panel.style.height = panel.scrollHeight + "px";
    }

    requestAnimationFrame(() => {
        panel.style.height = "0px";
    });
}

function openPanel(panel) {
    panel.dataset.state = "open";
    panel.style.height = panel.scrollHeight + "px";
}

function setHeaderState({ headerBtn, iconWrap, pmIcon, isOpen }) {
    // background (keep your design)
    headerBtn.classList.toggle("bg-[var(--c-primary)]", isOpen);
    headerBtn.classList.toggle("bg-[var(--c-main-bg)]", !isOpen);

    // icon color (left)
    iconWrap.classList.toggle("text-white", isOpen);
    iconWrap.classList.toggle("text-primary", !isOpen);

    // plus/minus fix: toggle BOTH classes so it always switches
    const vert = pmIcon.querySelector(".pm-vert");
    if (vert) {
        vert.classList.toggle("opacity-0", isOpen);
        vert.classList.toggle("opacity-100", !isOpen);
    }

    headerBtn.setAttribute("aria-expanded", String(isOpen));
}

async function initTechAccordion() {
    const mount = document.getElementById("techOverviewAcc");
    if (!mount) return;

    const svgList = await Promise.all(studioFaqs.map((x) => fetchSvg(x.icon).catch(() => "")));

    const items = [];
    let activeIndex = 0; // keep as you have (first open)

    studioFaqs.forEach((item, idx) => {
        const wrapper = document.createElement("div");
        wrapper.className = "overflow-hidden bg-mainBg mb-[10px]";

        const headerBtn = document.createElement("button");
        headerBtn.type = "button";
        headerBtn.className =
            "w-full flex items-center justify-between px-5 md:px-[30px] px-4 py-4 transition-colors duration-200 bg-[var(--c-main-bg)]";
        headerBtn.style.fontFamily = "var(--ff-heading)";
        headerBtn.setAttribute("aria-controls", `panel-${item.id}`);
        headerBtn.setAttribute("aria-expanded", "false");

        const left = document.createElement("div");
        left.className = "flex items-center gap-3";

        const iconWrap = document.createElement("span");
        iconWrap.className = "inline-flex text-primary w-[24px] h-[24px] md:w-[40px] md:h-[40px] shrink-0";
        iconWrap.innerHTML = svgList[idx] || "";

        // force the injected svg to respect wrapper size
        const injectedSvg = iconWrap.querySelector("svg");
        if (injectedSvg) {
            injectedSvg.setAttribute("width", "100%");
            injectedSvg.setAttribute("height", "100%");
            injectedSvg.style.width = "100%";
            injectedSvg.style.height = "100%";
            injectedSvg.style.display = "block";
        }

        const title = document.createElement("span");
        title.className =
            "text-white font-semibold md:text-[24px] text-base md:leading-[28px] leading-[20px] font-semibold";
        title.textContent = item.title;

        left.appendChild(iconWrap);
        left.appendChild(title);

        const pmIcon = makePlusMinusIcon();

        headerBtn.appendChild(left);
        headerBtn.appendChild(pmIcon);

        const panel = document.createElement("div");
        panel.id = `panel-${item.id}`;
        panel.className =
            "overflow-hidden h-0 transition-[height] duration-300 ease-in-out bg-mainBg";
        panel.dataset.state = "closed";
        panel.style.height = "0px";

        const panelInner = document.createElement("div");
        panelInner.className = "px-5 md:px-6 py-4 space-y-2";

        item.answers.forEach((line) => {
            const p = document.createElement("p");
            p.className = "text-paragraph md:text-base text-sm md:text-leading-[28px] leading-[24px]";
            p.textContent = line;
            panelInner.appendChild(p);
        });

        panel.appendChild(panelInner);

        wrapper.appendChild(headerBtn);
        wrapper.appendChild(panel);

        mount.appendChild(wrapper);

        panel.addEventListener("transitionend", (e) => {
            if (e.propertyName !== "height") return;
            if (panel.dataset.state === "open") panel.style.height = "auto";
        });

        items.push({ headerBtn, panel, iconWrap, pmIcon });
    });

    function openIndex(nextIdx) {
        if (activeIndex !== -1 && activeIndex !== nextIdx) {
            const cur = items[activeIndex];
            setHeaderState({ ...cur, isOpen: false });
            closePanel(cur.panel);
        }

        if (activeIndex === nextIdx) {
            const cur = items[activeIndex];
            setHeaderState({ ...cur, isOpen: false });
            closePanel(cur.panel);
            activeIndex = -1;
            return;
        }

        const next = items[nextIdx];
        setHeaderState({ ...next, isOpen: true });
        openPanel(next.panel);
        activeIndex = nextIdx;
    }

    items.forEach((x, idx) => {
        x.headerBtn.addEventListener("click", () => openIndex(idx));
    });

    // initial open (and set minus correctly)
    if (activeIndex >= 0) {
        const first = items[activeIndex];
        setHeaderState({ ...first, isOpen: true });
        first.panel.style.height = "auto";
    }
}

document.addEventListener("DOMContentLoaded", initTechAccordion);
