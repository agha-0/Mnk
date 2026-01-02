// /js/rehearsal-book-now.js
(function () {
    const $ = (s, p = document) => p.querySelector(s);
    const $$ = (s, p = document) => Array.from(p.querySelectorAll(s));

    // ---------------- Tabs ----------------
    function initTabs() {
        const tabs = $$("[data-book-tab]");
        const panels = $$("[data-book-panel]");

        const setActive = (key) => {
            tabs.forEach((b) => b.classList.toggle("is-active", b.dataset.bookTab === key));
            panels.forEach((p) => p.classList.toggle("hidden", p.dataset.bookPanel !== key));
        };

        tabs.forEach((btn) => {
            btn.addEventListener("click", () => setActive(btn.dataset.bookTab));
        });

        setActive("packages");
    }

    // ---------------- Dropdowns ----------------
    function initDropdowns() {
        $$("[data-dd]").forEach((wrap) => {
            const btn = $("[data-dd-btn]", wrap);
            const menu = $("[data-dd-menu]", wrap);
            const label = $("[data-dd-label]", wrap);

            const close = () => menu.classList.add("hidden");
            const open = () => menu.classList.remove("hidden");
            const toggle = () => menu.classList.toggle("hidden");

            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                // close other dropdowns
                $$("[data-dd-menu]").forEach((m) => m !== menu && m.classList.add("hidden"));
                toggle();
            });

            $$("[data-dd-item]", wrap).forEach((item) => {
                item.addEventListener("click", () => {
                    const v = item.getAttribute("data-dd-item") || item.textContent.trim();
                    label.textContent = v;
                    const dd = wrap.getAttribute("data-dd");
                    if (dd === "studio") $("#studioValue").value = v;
                    if (dd === "band") $("#bandValue").value = v;
                    close();
                });
            });

            document.addEventListener("click", close);
            document.addEventListener("keydown", (e) => {
                if (e.key === "Escape") close();
            });
        });
    }

    // ---------------- Calendar + Slots ----------------
    const slotData = {
        // format: YYYY-MM-DD : { slots: [{t:'9:00 AM - 10:00 PM', a:true/false}, ...] }
        "2025-12-27": {
            slots: [
                { t: "9:00 AM - 10:00 PM", a: false },
                { t: "12:00 AM - 1:00 PM", a: false },
                { t: "5:00 AM - 6:00 PM", a: false },
                { t: "8:00 AM - 9:00 PM", a: false },
                { t: "10:00 AM - 11:00 PM", a: false },
                { t: "3:00 AM - 4:00 PM", a: true },
                { t: "6:00 AM - 7:00 PM", a: true },
                { t: "10:00 AM - 11:00 PM", a: true },
                { t: "11:00 AM - 12:00 PM", a: true }, // selected example in your image
                { t: "1:00 AM - 2:00 PM", a: true },
                { t: "4:00 AM - 5:00 PM", a: true },
                { t: "7:00 AM - 8:00 PM", a: true },
            ],
        },
    };

    function pad(n) { return String(n).padStart(2, "0"); }
    function fmtKey(y, m, d) { return `${y}-${pad(m)}-${pad(d)}`; }

    let current = { y: 2025, m: 12 }; // default to Dec 2025 like your screenshot
    let selected = { dateKey: null, slot: null };

    function initCalendar() {
        const grid = $("#calGrid");
        const label = $("#calLabel");
        const modal = $("#slotsModal");
        const slotsTitle = $("#slotsTitle");
        const slotsGrid = $("#slotsGrid");
        const selectedText = $("#selectedSlotText");

        if (!grid || !label) return;

        const monthName = (y, m) => new Date(y, m - 1, 1).toLocaleString("en", { month: "long", year: "numeric" });

        const openModal = (dateKey) => {
            const d = new Date(dateKey);
            slotsTitle.textContent = `${d.getDate()} ${d.toLocaleString("en", { month: "short" })} ${d.getFullYear()}`;

            const data = slotData[dateKey] || { slots: [] };
            slotsGrid.innerHTML = "";

            // If no data, show some demo slots (all available)
            const slots = data.slots.length
                ? data.slots
                : [
                    { t: "10:00 AM - 11:00 AM", a: true },
                    { t: "11:00 AM - 12:00 PM", a: true },
                    { t: "12:00 PM - 1:00 PM", a: true },
                    { t: "1:00 PM - 2:00 PM", a: true },
                    { t: "2:00 PM - 3:00 PM", a: true },
                    { t: "3:00 PM - 4:00 PM", a: true },
                ];

            slots.forEach((s) => {
                const b = document.createElement("button");
                b.type = "button";
                b.className = `slot ${s.a ? "" : "is-disabled"} ${selected.dateKey === dateKey && selected.slot === s.t ? "is-selected" : ""}`;
                b.textContent = s.t;

                b.addEventListener("click", () => {
                    selected.dateKey = dateKey;
                    selected.slot = s.t;

                    // update ui
                    selectedText.textContent = `${dateKey} • ${s.t}`;

                    // update calendar active day
                    $$(".cal-day").forEach((x) => x.classList.remove("is-active"));
                    const dayBtn = grid.querySelector(`[data-date="${dateKey}"]`);
                    if (dayBtn) dayBtn.classList.add("is-active");

                    // update selection inside modal
                    $$(".slot", slotsGrid).forEach((x) => x.classList.remove("is-selected"));
                    b.classList.add("is-selected");
                });

                slotsGrid.appendChild(b);
            });

            modal.classList.add("is-open");
            modal.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
        };

        const closeModal = () => {
            modal.classList.remove("is-open");
            modal.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
        };

        document.addEventListener("click", (e) => {
            if (e.target && e.target.closest("[data-slots-close='1']")) closeModal();
        });
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
        });

        const render = () => {
            label.textContent = monthName(current.y, current.m);
            grid.innerHTML = "";

            const first = new Date(current.y, current.m - 1, 1);
            const startDay = first.getDay(); // 0 Sun
            const daysInMonth = new Date(current.y, current.m, 0).getDate();

            // blanks before 1st
            for (let i = 0; i < startDay; i++) {
                const b = document.createElement("button");
                b.type = "button";
                b.className = "cal-day is-muted";
                b.textContent = "•";
                grid.appendChild(b);
            }

            for (let d = 1; d <= daysInMonth; d++) {
                const key = fmtKey(current.y, current.m, d);
                const b = document.createElement("button");
                b.type = "button";
                b.className = `cal-day ${selected.dateKey === key ? "is-active" : ""}`;
                b.textContent = String(d);
                b.setAttribute("data-date", key);

                b.addEventListener("click", () => openModal(key));
                grid.appendChild(b);
            }
        };

        // nav
        $$("[data-cal-nav]").forEach((btn) => {
            btn.addEventListener("click", () => {
                const dir = btn.getAttribute("data-cal-nav");
                let y = current.y, m = current.m;

                if (dir === "prev") m--;
                if (dir === "next") m++;

                if (m === 0) { m = 12; y--; }
                if (m === 13) { m = 1; y++; }

                current = { y, m };
                render();
            });
        });

        render();
    }

    document.addEventListener("DOMContentLoaded", () => {
        initTabs();
        initDropdowns();
        initCalendar();
    });
})();
