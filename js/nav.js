// js/nav.js
const navLinks = [
    { label: "Home", href: "/", className: "hover:text-primary" },

    {
        label: "Recording Studios",
        href: "/recording-studios/",
        className: "hover:text-primary",
        children: [
            { label: "Studio 1", href: "/recording-studios/studio-1/", className: "hover:text-primary" },
            { label: "Studio 2", href: "/recording-studios/studio-2/", className: "hover:text-primary" },
        ],
    },

    { label: "Rehearsal Studios", href: "/rehearsal-studios/", className: "hover:text-primary" },
    { label: "Space Rental", href: "/space-rental/", className: "hover:text-primary" },
    { label: "Dolby Atmos / 5.1 Mixing", href: "/dolby-atmos/", className: "hover:text-primary" },

    {
        label: "Other Services",
        href: "/other-services/",
        className: "hover:text-primary",
        children: [
            { label: "ADR Recording", href: "/other-services/adr-recording/", className: "hover:text-primary" },
            { label: "Location Recording", href: "/other-services/location-recording/", className: "hover:text-primary" },
            { label: "Podcast Studio", href: "/other-services/podcast-studio/", className: "hover:text-primary" },
        ],
    },

    { label: "Our Work", href: "/our-work/", className: "hover:text-primary" },
    { label: "Contact Us", href: "/contact/", className: "hover:text-primary" },

    { label: "Book Rehearsals", href: "/book-rehearsals/", className: "hover:text-primary !text-primary" },
];

function escapeHtml(str = "") {
    return str.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}

/* ---------- Desktop dropdown (hover) ---------- */
function renderDesktopNav(navItems, mountId = "desktopNav") {
    const mount = document.getElementById(mountId);
    if (!mount) return;

    const dropdownWrapClass = "relative group";
    const dropdownPanelWrap = "absolute left-0 top-full pt-4 hidden group-hover:block";
    const dropdownPanel = "w-[265px] border border-primary p-[15px] bg-[#13191F]/90";
    const dropdownItem = "block text-white py-2 border-b border-white/10 last:border-b-0";

    mount.innerHTML = navItems.map((item) => {
        const label = escapeHtml(item.label);
        const href = escapeHtml(item.href || "#");
        const cls = item.className || "hover:text-primary";

        if (!item.children || item.children.length === 0) {
            return `<a class="${cls}" href="${href}">${label}</a>`;
        }

        const childrenHtml = item.children.map((child) => {
            const cLabel = escapeHtml(child.label);
            const cHref = escapeHtml(child.href || "#");
            const cCls = child.className || "hover:text-primary";
            return `<a class="${dropdownItem} ${cCls}" href="${cHref}">${cLabel}</a>`;
        }).join("");

        return `
      <div class="${dropdownWrapClass}">
        <a class="${cls} inline-flex items-center gap-1" href="${href}">
          ${label}
        </a>

        <div class="${dropdownPanelWrap}">
          <div class="${dropdownPanel}">
            ${childrenHtml}
          </div>
        </div>
      </div>
    `;
    }).join("");
}

/* ---------- Mobile side nav (accordion) ---------- */
function renderMobileSideNav(navItems, mountId = "mobileSideNav") {
    const mount = document.getElementById(mountId);
    if (!mount) return;

    mount.innerHTML = navItems.map((item, idx) => {
        const label = escapeHtml(item.label);
        const href = escapeHtml(item.href || "#");
        const cls = item.className || "hover:text-primary";

        const isBook = item.label.toLowerCase().includes("book rehearsals");

        // no children
        if (!item.children || item.children.length === 0) {
            if (isBook) {
                return `
          <a href="${href}"
             class="mt-4 inline-flex items-center justify-center rounded-full border border-primary px-5 py-2 text-[12px] font-semibold text-primary hover:bg-primary/10">
            ${label}
          </a>
        `;
            }

            return `
        <a class="block py-2 text-white ${cls}" href="${href}">${label}</a>
      `;
        }

        // children
        const childrenHtml = item.children.map((child) => {
            const cLabel = escapeHtml(child.label);
            const cHref = escapeHtml(child.href || "#");
            const cCls = child.className || "hover:text-primary";

            return `
        <a class="block py-3 text-white/70 ${cCls} border-t border-white/10"
           href="${cHref}">
          ${cLabel}
        </a>
      `;
        }).join("");

        return `
      <div class="">
        <button
          type="button"
          class="w-full flex items-center justify-between py-2 text-white ${cls}"
          data-acc-btn="${idx}">
          <span data-acc-label="${idx}">${label}</span>

          <span class="transition-transform duration-200 text-[#7C8693]"
                data-acc-icon="${idx}">
            <svg class="w-[17px] h-[11px]" viewBox="0 0 17 11" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.730469 0.683945L8.23047 8.68395L15.7305 0.683945"
                    stroke="currentColor" stroke-width="2"/>
            </svg>
          </span>
        </button>

        <div class="hidden text-[13px] font-medium text-white" data-acc-panel="${idx}">
          ${childrenHtml}
        </div>
      </div>
    `;
    }).join("");

    const closeAll = () => {
        mount.querySelectorAll("[data-acc-panel]").forEach(p => p.classList.add("hidden"));

        // reset icons
        mount.querySelectorAll("[data-acc-icon]").forEach(ic => {
            ic.classList.remove("rotate-180", "text-primary");
            ic.classList.add("text-[#7C8693]");
        });

        // reset labels/buttons
        mount.querySelectorAll("[data-acc-btn]").forEach(btn => {
            btn.classList.remove("text-primary");
            btn.classList.add("text-white");
        });
    };

    // accordion behavior
    const btns = mount.querySelectorAll("[data-acc-btn]");
    btns.forEach((btn) => {
        btn.addEventListener("click", () => {
            const i = btn.getAttribute("data-acc-btn");
            const panel = mount.querySelector(`[data-acc-panel="${i}"]`);
            const icon = mount.querySelector(`[data-acc-icon="${i}"]`);

            const isOpen = !panel.classList.contains("hidden");

            // close all first
            closeAll();

            // open current if it was closed
            if (!isOpen) {
                panel.classList.remove("hidden");

                // button/label stays primary while open
                btn.classList.remove("text-white");
                btn.classList.add("text-primary");

                // arrow becomes primary + rotates
                icon.classList.remove("text-[#7C8693]");
                icon.classList.add("text-primary", "rotate-180");
            }
        });
    });
}
