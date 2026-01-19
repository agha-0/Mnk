// js/nav.js

const navLinks = [
  { label: "Home", href: "/", className: "hover:text-primary" },
  {
    label: "Recording Studios",
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
    className: "hover:text-primary",
    children: [
      { label: "ADR Recording", href: "/other-services/adr-recording/", className: "hover:text-primary" },
      { label: "Location Recording", href: "/other-services/location-recording/", className: "hover:text-primary" },
      { label: "Podcast Studio", href: "/other-services/podcast-studio/", className: "hover:text-primary" },
    ],
  },
  { label: "Our Work", href: "/our-work/", className: "hover:text-primary" },
  { label: "Contact Us", href: "/contact-us/", className: "hover:text-primary" },

  { label: "Book Rehearsals", href: "/book-rehearsals/", className: "hover:text-primary !text-primary" },
];

function escapeHtml(str = "") {
  return str.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}

/* =========================
   AUTH STATE (simple)
   ========================= */
const MNK_AUTH_KEY = "mnk_is_logged_in";
const MNK_NAME_KEY = "mnk_user_name";

function getLoginState() {
  if (typeof window.MNK_IS_LOGGED_IN === "boolean") return window.MNK_IS_LOGGED_IN;
  return localStorage.getItem(MNK_AUTH_KEY) === "1";
}

function setLoginState(v) {
  window.MNK_IS_LOGGED_IN = !!v;
  localStorage.setItem(MNK_AUTH_KEY, v ? "1" : "0");
}

function getUserName() {
  if (typeof window.MNK_USER_NAME === "string" && window.MNK_USER_NAME.trim()) return window.MNK_USER_NAME.trim();
  return (localStorage.getItem(MNK_NAME_KEY) || "User").trim();
}

function setUserName(name) {
  const v = (name || "").trim() || "User";
  window.MNK_USER_NAME = v;
  localStorage.setItem(MNK_NAME_KEY, v);
}

// expose small API if you want to control from elsewhere
window.mnkAuth = { getLoginState, setLoginState, getUserName, setUserName };

/* =========================
   USER MENU HTML
   ========================= */
function renderUserMenuDesktop() {
  const isLoggedIn = getLoginState();
  const name = escapeHtml(getUserName());
  const menuItemCls = "block w-full text-left text-white py-2 border-b border-white/10 last:border-b-0 hover:text-primary";

  const items = !isLoggedIn
    ? `
      <button type="button" class="${menuItemCls}" data-auth-open="login">Login</button>
      <button type="button" class="${menuItemCls}" data-auth-open="signup">Sign Up</button>
    `
    : `
      <a class="${menuItemCls}" href="/profile/">Profile</a>
      <a class="${menuItemCls}" href="/my-bookings/">My Bookings</a>
      <button type="button" class="${menuItemCls}" data-auth-logout="1">Logout</button>
    `;

  return `
    <div class="relative" data-user-menu>
      <button type="button"
        class="ml-1 inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/5"
        aria-label="User menu"
        data-user-menu-btn="1">
        <img src="/assets/images/UserIcon.svg" alt="User" class="w-[22px] h-[22px]" />
      </button>

      <div class="absolute right-0 top-full pt-3 hidden" data-user-menu-panel="1">
        <div class="w-[230px] bg-[#13191F]/95 border border-primary p-[12px]">
          ${isLoggedIn ? `<p class="text-white/70 text-[12px] pb-2 border-b border-white/10">${name}'s</p>` : ``}
          <div class="">
            ${items}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderUserMenuMobile() {
  const isLoggedIn = getLoginState();

  const itemCls = "block py-3 text-white/90 border-t border-white/10 hover:text-primary text-left w-full";

  const items = !isLoggedIn
    ? `
      <button type="button" class="${itemCls}" data-auth-open="login">Login</button>
      <button type="button" class="${itemCls}" data-auth-open="signup">Sign Up</button>
    `
    : `
      <a class="${itemCls}" href="/profile/">Profile</a>
      <a class="${itemCls}" href="/my-bookings/">My Bookings</a>
      <button type="button" class="${itemCls}" data-auth-logout="1">Logout</button>
    `;

  return `
    <div class="mt-5 pt-3 border-t border-white/10">
      <div class="flex items-center gap-2">
        <img src="/assets/images/UserIcon.svg" alt="User" class="w-[20px] h-[20px]" />
        <p class="text-white text-[14px] font-semibold">Account</p>
      </div>
      <div class="mt-2">
        ${items}
      </div>
    </div>
  `;
}

/* =========================
   USER MENU EVENTS (once)
   ========================= */
function bindUserMenuEventsOnce() {
  if (window.__mnk_user_menu_bound__) return;
  window.__mnk_user_menu_bound__ = true;

  const closeAllDesktopPanels = () => {
    document.querySelectorAll("[data-user-menu-panel]").forEach((p) => p.classList.add("hidden"));
  };

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-user-menu-btn]");
    if (btn) {
      e.preventDefault();
      const wrap = btn.closest("[data-user-menu]");
      const panel = wrap?.querySelector("[data-user-menu-panel]");
      if (!panel) return;

      // close others
      document.querySelectorAll("[data-user-menu-panel]").forEach((p) => {
        if (p !== panel) p.classList.add("hidden");
      });

      panel.classList.toggle("hidden");
      return;
    }

    // open auth modals
    const authOpen = e.target.closest("[data-auth-open]");
    if (authOpen) {
      const which = authOpen.getAttribute("data-auth-open");
      closeAllDesktopPanels();
      if (typeof window.mnkOpenAuthModal === "function") window.mnkOpenAuthModal(which);
      return;
    }

    // logout
    const logoutBtn = e.target.closest("[data-auth-logout]");
    if (logoutBtn) {
      closeAllDesktopPanels();
      setLoginState(false);
      if (typeof window.mnkToast === "function") window.mnkToast("Logged out.", "success");
      if (typeof window.mnkRerenderNav === "function") window.mnkRerenderNav();
      return;
    }

    // click outside closes desktop panel
    if (!e.target.closest("[data-user-menu]")) closeAllDesktopPanels();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAllDesktopPanels();
  });
}

/* ---------- Desktop dropdown (hover) ---------- */
function renderDesktopNav(navItems, mountId = "desktopNav") {
  const mount = document.getElementById(mountId);
  if (!mount) return;

  const dropdownWrapClass = "relative group";
  const dropdownPanelWrap = "absolute left-0 top-full pt-4 hidden group-hover:block";
  const dropdownPanel = "w-[265px] border border-primary p-[15px] bg-[#13191F]/90";
  const dropdownItem = "block text-white py-2 border-b border-white/10 last:border-b-0";

  const navHtml = navItems
    .map((item) => {
      const label = escapeHtml(item.label);
      const href = escapeHtml(item.href || "#");
      const cls = item.className || "hover:text-primary";

      if (!item.children || item.children.length === 0) {
        return `<a class="${cls}" href="${href}">${label}</a>`;
      }

      const childrenHtml = item.children
        .map((child) => {
          const cLabel = escapeHtml(child.label);
          const cHref = escapeHtml(child.href || "#");
          const cCls = child.className || "hover:text-primary";
          return `<a class="${dropdownItem} ${cCls}" href="${cHref}">${cLabel}</a>`;
        })
        .join("");

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
    })
    .join("");

  // ✅ append user icon AFTER Book Rehearsals
  mount.innerHTML = navHtml + renderUserMenuDesktop();

  bindUserMenuEventsOnce();
}

/* ---------- Mobile side nav (accordion) ---------- */
function renderMobileSideNav(navItems, mountId = "mobileSideNav") {
  const mount = document.getElementById(mountId);
  if (!mount) return;

  mount.innerHTML =
    navItems
      .map((item, idx) => {
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
          if (href) {
            return `<a class="block py-2 text-white ${cls}" href="${href}">${label}</a>`;
          }
          return `<a class="block py-2 text-white ${cls}">${label}</a>`;
        }

        // children
        const childrenHtml = item.children
          .map((child) => {
            const cLabel = escapeHtml(child.label);
            const cHref = escapeHtml(child.href || "#");
            const cCls = child.className || "hover:text-primary";

            return `
              <a class="block py-3 text-white/70 ${cCls} border-t border-white/10"
                 href="${cHref}">
                ${cLabel}
              </a>
            `;
          })
          .join("");

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
      })
      .join("") +
    // ✅ account section at bottom
    renderUserMenuMobile();

  const closeAll = () => {
    mount.querySelectorAll("[data-acc-panel]").forEach((p) => p.classList.add("hidden"));

    mount.querySelectorAll("[data-acc-icon]").forEach((ic) => {
      ic.classList.remove("rotate-180", "text-primary");
      ic.classList.add("text-[#7C8693]");
    });

    mount.querySelectorAll("[data-acc-btn]").forEach((btn) => {
      btn.classList.remove("text-primary");
      btn.classList.add("text-white");
    });
  };

  const btns = mount.querySelectorAll("[data-acc-btn]");
  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const i = btn.getAttribute("data-acc-btn");
      const panel = mount.querySelector(`[data-acc-panel="${i}"]`);
      const icon = mount.querySelector(`[data-acc-icon="${i}"]`);
      const isOpen = !panel.classList.contains("hidden");

      closeAll();

      if (!isOpen) {
        panel.classList.remove("hidden");
        btn.classList.remove("text-white");
        btn.classList.add("text-primary");
        icon.classList.remove("text-[#7C8693]");
        icon.classList.add("text-primary", "rotate-180");
      }
    });
  });

  bindUserMenuEventsOnce();
}

// helpful for re-render after login/logout
window.mnkRerenderNav = function () {
  renderDesktopNav(navLinks);
  renderMobileSideNav(navLinks);
};
