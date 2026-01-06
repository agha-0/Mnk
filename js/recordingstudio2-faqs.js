// /js/recordingstudio1-faqs.js

const studioFaqs = [
    {
        id: "acoustics-design",
        title: "Acoustics & Design",
        answers: [
            'Treatment: Fully decoupled "room-within-a-room" construction, offering exceptional isolation (~55 dB attenuation).',
            "Calibration: Calibrated for both stereo and immersive mixing environments with controlled decay times and balanced low-frequency response.",
            "Monitoring Position: Centralized reference axis for flat response and phase coherence for stereo and immersive workflows.",
        ],
    },
    {
        id: "monitoring-playback",
        title: "Monitoring & Playback",
        answers: [
            "Monitoring Chain: Calibrated full-range monitoring optimized for translation (nearfield + sub integration).",
            "Immersive Monitoring: Immersive-ready monitoring path (layout/session dependent).",
            "Cue/Playback: Low-latency playback with headphone distribution and talkback-ready workflow.",
        ],
    },
    {
        id: "routing-audio-infrastructure",
        title: "Routing & Audio Infrastructure",
        answers: [
            "Core Network: Fully Integrated Dante audio routing across all control rooms from Studio B for flexible signal distribution and remote session control.",
            "Converters & Interfaces: AVID MTRX Studio as the primary interface. Fully integrated via Dante networking, connecting to other studios for live tracking or remote patching.",
            "Clocking: Word-clock synchronized across the entire facility for phase-aligned recording and playback.",
        ],
    },
    {
        id: "software-production-tools",
        title: "Software & Production Tools",
        answers: [
            "DAW Workflow: Session-friendly workflow for common DAWs (bring your preferred session).",
            "Editing & Mix Tools: Production toolset available for tracking, editing, mixing, and delivery.",
            "Exports & Delivery: Stems/prints available on request (WAV/AIFF, 24-bit workflow supported).",
        ],
    },
    {
        id: "hardware-outboard-gear",
        title: "Hardware & Outboard Gear",
        answers: [
            "Mic Preamps: Clean and character options for vocals, instruments, and drum capture.",
            "Dynamics & EQ: Outboard options for tracking chains and mix inserts (session dependent).",
            "Utilities: DI, re-amp, and essential studio accessories available as needed.",
        ],
    },
    {
        id: "connectivity",
        title: "Connectivity",
        answers: [
            "File Transfer: Fast wired + Wi-Fi connectivity for uploads, backups, and collaboration.",
            "I/O Access: Convenient connectivity for laptops/interfaces near the working position.",
            "Session Flow: Efficient changeovers with organized routing and repeatable setups.",
        ],
    },
];

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

function setHeaderState({ headerBtn, pmIcon, isOpen }) {
    // background (keep your design)
    headerBtn.classList.toggle("bg-[var(--c-primary)]", isOpen);
    headerBtn.classList.toggle("bg-[var(--c-main-bg)]", !isOpen);

    // plus/minus
    const vert = pmIcon.querySelector(".pm-vert");
    if (vert) {
        vert.classList.toggle("opacity-0", isOpen);
        vert.classList.toggle("opacity-100", !isOpen);
    }

    headerBtn.setAttribute("aria-expanded", String(isOpen));
}

async function initTechAccordion() {
    const mount = document.getElementById("featuresAccordion");
    if (!mount) return;

    const items = [];
    let activeIndex = 0; // first open

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
        left.className = "flex items-center";

        const title = document.createElement("span");
        title.className =
            "text-white font-semibold md:text-[24px] text-base md:leading-[28px] leading-[20px] font-semibold";
        title.textContent = item.title;

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
            p.className =
                "text-paragraph md:text-base text-sm md:text-leading-[28px] leading-[24px]";
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

        items.push({ headerBtn, panel, pmIcon });
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
