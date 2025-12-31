// js/header.js

async function loadHeader() {
    const mount = document.getElementById("headerMount");
    if (!mount) return;

    const res = await fetch("/components/header.html");
    mount.innerHTML = await res.text();

    // render navs after header is injected
    renderDesktopNav(navLinks);
    renderMobileSideNav(navLinks);

    setupSideMenu();
    setupSmoothScroll();
}

function setupSideMenu() {
    const openBtn = document.getElementById("openMenuBtn");
    const closeBtn = document.getElementById("closeMenuBtn");
    const overlay = document.getElementById("menuOverlay");
    const drawer = document.getElementById("sideMenu");
    const mobileNav = document.getElementById("mobileSideNav");

    if (!openBtn || !closeBtn || !overlay || !drawer) return;

    const open = () => {
        overlay.classList.remove("hidden");
        requestAnimationFrame(() => {
            overlay.classList.remove("opacity-0");
            overlay.classList.add("opacity-100");
            drawer.classList.remove("translate-x-full");
        });
        document.body.classList.add("overflow-hidden");
    };

    const close = () => {
        overlay.classList.remove("opacity-100");
        overlay.classList.add("opacity-0");
        drawer.classList.add("translate-x-full");
        document.body.classList.remove("overflow-hidden");
        setTimeout(() => overlay.classList.add("hidden"), 300);
    };

    openBtn.addEventListener("click", open);
    closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", close);

    // close menu when clicking any link inside
    if (mobileNav) {
        mobileNav.addEventListener("click", (e) => {
            const a = e.target.closest("a");
            if (a) close();
        });
    }

    // Esc to close
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") close();
    });
}

/* Smooth scrolling for #anchors (works across pages if on same page) */
function setupSmoothScroll() {
    document.addEventListener("click", (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;

        const id = link.getAttribute("href");
        const el = document.querySelector(id);
        if (!el) return;

        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        history.pushState(null, "", id);
    });
}

loadHeader();
