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

        tabs.forEach((btn) => btn.addEventListener("click", () => setActive(btn.dataset.bookTab)));
        setActive("packages");
    }

    // ---------------- Dropdowns (studio only) ----------------
    function initDropdowns() {
        $$("[data-dd]").forEach((wrap) => {
            const btn = $("[data-dd-btn]", wrap);
            const menu = $("[data-dd-menu]", wrap);
            const label = $("[data-dd-label]", wrap);

            if (!btn || !menu || !label) return;

            const close = () => menu.classList.add("hidden");
            const toggle = () => menu.classList.toggle("hidden");

            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                $$("[data-dd-menu]").forEach((m) => m !== menu && m.classList.add("hidden"));
                toggle();
            });

            $$("[data-dd-item]", wrap).forEach((item) => {
                item.addEventListener("click", () => {
                    const v = item.getAttribute("data-dd-item") || item.textContent.trim();
                    label.textContent = v;

                    const dd = wrap.getAttribute("data-dd");
                    if (dd === "studio") {
                        $("#studioValue").value = v;
                        const s = $("#sessionStudio");
                        if (s) s.textContent = v;
                    }
                    close();
                });
            });

            document.addEventListener("click", close);
            document.addEventListener("keydown", (e) => e.key === "Escape" && close());
        });
    }

    // ---------- Helpers ----------
    const pad = (n) => String(n).padStart(2, "0");
    const keyFromDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const monthLabel = (y, mIndex) =>
        new Date(y, mIndex, 1).toLocaleString("en", { month: "long", year: "numeric" });

    function startOfDay(d) {
        const x = new Date(d);
        x.setHours(0, 0, 0, 0);
        return x;
    }

    function parseTimeToMinutes(t) {
        // "10:00 AM"
        const m = String(t).match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (!m) return 0;
        let hh = parseInt(m[1], 10);
        const mm = parseInt(m[2], 10);
        const ap = m[3].toUpperCase();
        if (ap === "PM" && hh !== 12) hh += 12;
        if (ap === "AM" && hh === 12) hh = 0;
        return hh * 60 + mm;
    }

    function nowMinutes() {
        const n = new Date();
        return n.getHours() * 60 + n.getMinutes();
    }

    // ---------------- Slots (API-shaped mock) ----------------
    // When you plug real API:
    // fetch(`https://mnk-studios.com/front_get_slots?date=${encodeURIComponent(...)}&room=${encodeURIComponent(...)}`)
    //   .then(r=>r.json())
    async function fetchSlotsApiLike(dateKey, studioValue) {
        // show loader for UX
        await new Promise((r) => setTimeout(r, 650));

        // mock using your API format (array of objects)
        const demo = [
            { id: 143, room_id: 2, start_time: "10:00 AM", end_time: "11:00 AM", status: 1, check_time: "10", not: 0 },
            { id: 144, room_id: 2, start_time: "11:00 AM", end_time: "12:00 PM", status: 1, check_time: "11" },
            { id: 145, room_id: 2, start_time: "12:00 PM", end_time: "1:00 PM", status: 1, check_time: "12" },
            { id: 146, room_id: 2, start_time: "1:00 PM", end_time: "2:00 PM", status: 1, check_time: "13" },
            { id: 147, room_id: 2, start_time: "2:00 PM", end_time: "3:00 PM", status: 1, check_time: "14", not: 1 }, // unavailable example
            { id: 148, room_id: 2, start_time: "3:00 PM", end_time: "4:00 PM", status: 1, check_time: "15" },
            { id: 149, room_id: 2, start_time: "4:00 PM", end_time: "5:00 PM", status: 1, check_time: "16" },
            { id: 150, room_id: 2, start_time: "5:00 PM", end_time: "6:00 PM", status: 1, check_time: "17" },
            { id: 151, room_id: 2, start_time: "6:00 PM", end_time: "7:00 PM", status: 1, check_time: "18" },
            { id: 153, room_id: 2, start_time: "7:00 PM", end_time: "8:00 PM", status: 1, check_time: "19" },
            { id: 154, room_id: 2, start_time: "8:00 PM", end_time: "9:00 PM", status: 1, check_time: "20", not: 1 }, // unavailable
            { id: 155, room_id: 2, start_time: "9:00 PM", end_time: "10:00 PM", status: 1, check_time: "21" },
        ];

        // you can swap based on studioValue later
        return demo;
    }

    // ---------------- Calendar + Slots + Session Details ----------------
    function initCalendarAndSlots() {
        const grid = $("#calGrid");
        const label = $("#calLabel");
        const modal = $("#slotsModal");
        const slotsTitle = $("#slotsTitle");
        const slotsGrid = $("#slotsGrid");
        const slotsLoader = $("#slotsLoader");
        const confirmBtn = $("#slotConfirmBtn");

        const studioValueEl = $("#studioValue");
        const sessionStudio = $("#sessionStudio");
        const sessionDate = $("#sessionDate");
        const sessionSlots = $("#sessionSlots");
        const sessionSlotsEmpty = $("#sessionSlotsEmpty");

        if (!grid || !label || !modal || !slotsGrid || !confirmBtn) return;

        const today = startOfDay(new Date());
        let view = { y: today.getFullYear(), mIndex: today.getMonth() }; // current month by default
        let activeDateKey = keyFromDate(today); // current date primary
        let pickedSlotId = null; // slot selected in modal (not confirmed)
        const selectedSlotMap = new Map(); // id -> {dateKey, label}

        function syncSessionUI() {
            if (sessionStudio) sessionStudio.textContent = studioValueEl?.value || "None";
            if (sessionDate) sessionDate.textContent = activeDateKey || "None";

            if (!sessionSlots || !sessionSlotsEmpty) return;

            sessionSlots.innerHTML = "";
            const items = Array.from(selectedSlotMap.values()).filter((x) => x.dateKey === activeDateKey);

            if (!items.length) {
                sessionSlotsEmpty.classList.remove("hidden");
                return;
            }
            sessionSlotsEmpty.classList.add("hidden");

            items.forEach((it) => {
                const row = document.createElement("div");
                row.className =
                    "flex items-center justify-between gap-3 bg-white/5 border border-white/10 px-3 py-2 text-[11px] text-white/80";
                row.innerHTML = `
          <span class="font-semibold text-white/85">${it.label}</span>
          <button type="button" class="text-white/60 hover:text-white" data-remove-slot="${it.id}" aria-label="Remove">✕</button>
        `;
                sessionSlots.appendChild(row);
            });

            sessionSlots.querySelectorAll("[data-remove-slot]").forEach((btn) => {
                btn.addEventListener("click", () => {
                    const id = Number(btn.getAttribute("data-remove-slot"));
                    selectedSlotMap.delete(id);
                    // re-render modal slots state if open
                    if (modal.classList.contains("is-open")) renderSlotsLastPayload();
                    syncSessionUI();
                });
            });
        }

        function openModal() {
            modal.classList.add("is-open");
            modal.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
        }
        function closeModal() {
            modal.classList.remove("is-open");
            modal.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
            pickedSlotId = null;
            confirmBtn.disabled = true;
        }

        document.addEventListener("click", (e) => {
            if (e.target && e.target.closest("[data-slots-close='1']")) closeModal();
        });
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
        });

        // keep last fetched slots so remove/add updates button states inside modal
        let lastSlots = [];
        let lastDateKey = null;

        function slotIsDisabled(slot, dateKey) {
            // unavailable from API
            if (slot.status !== 1) return true;
            if (slot.not === 1) return true;

            // already added
            if (selectedSlotMap.has(slot.id)) return true;

            // if date is today: start time must be > current time
            const d = new Date(dateKey + "T00:00:00");
            const isToday = startOfDay(d).getTime() === today.getTime();
            if (isToday) {
                const startMins = parseTimeToMinutes(slot.start_time);
                if (startMins <= nowMinutes()) return true;
            }
            return false;
        }

        function renderSlots(dateKey, slots) {
            lastSlots = slots;
            lastDateKey = dateKey;

            const d = new Date(dateKey + "T00:00:00");
            const title = `${d.getDate()} ${d.toLocaleString("en", { month: "short" })} ${d.getFullYear()}`;
            if (slotsTitle) slotsTitle.textContent = title;

            slotsGrid.innerHTML = "";

            slots.forEach((slot) => {
                const labelText = `${slot.start_time} - ${slot.end_time}`;
                const disabled = slotIsDisabled(slot, dateKey);

                const b = document.createElement("button");
                b.type = "button";
                b.className = `slot ${disabled ? "is-disabled" : ""} ${pickedSlotId === slot.id ? "is-picked" : ""}`;
                b.textContent = labelText;

                if (!disabled) {
                    b.addEventListener("click", () => {
                        // pick (not confirm)
                        pickedSlotId = slot.id;
                        confirmBtn.disabled = false;

                        // repaint
                        $$(".slot", slotsGrid).forEach((x) => x.classList.remove("is-picked"));
                        b.classList.add("is-picked");
                    });
                }

                slotsGrid.appendChild(b);
            });

            // update session panel
            syncSessionUI();
        }

        function renderSlotsLastPayload() {
            if (!lastDateKey) return;
            renderSlots(lastDateKey, lastSlots);
        }

        async function openSlotsForDate(dateKey) {
            // must have studio
            const studioVal = studioValueEl?.value?.trim();
            if (!studioVal) {
                mnkToast("Please select studio first.", "error");
                return;
            }

            // update session studio label instantly
            if (sessionStudio) sessionStudio.textContent = studioVal;

            // show loader + open modal
            slotsGrid.innerHTML = "";
            confirmBtn.disabled = true;
            pickedSlotId = null;

            slotsLoader?.classList.remove("hidden");
            openModal();

            // fetch slots (static now, API-ready)
            try {
                const slots = await fetchSlotsApiLike(dateKey, studioVal);
                slotsLoader?.classList.add("hidden");
                renderSlots(dateKey, slots);
            } catch (err) {
                slotsLoader?.classList.add("hidden");
                mnkToast("Failed to load slots. Please try again.");
            }
        }

        confirmBtn.addEventListener("click", () => {
            if (!pickedSlotId || !lastDateKey) return;

            const slot = lastSlots.find((s) => s.id === pickedSlotId);
            if (!slot) return;

            selectedSlotMap.set(slot.id, {
                id: slot.id,
                dateKey: lastDateKey,
                label: `${slot.start_time} - ${slot.end_time}`,
            });

            // after confirm: reset pick + rerender (so it becomes disabled + cut line)
            pickedSlotId = null;
            confirmBtn.disabled = true;
            renderSlotsLastPayload();
            syncSessionUI();
            mnkToast("Slot added to session.");
        });

        // ---------- Calendar render ----------
        function renderCalendar() {
            label.textContent = monthLabel(view.y, view.mIndex);
            grid.innerHTML = "";

            const first = new Date(view.y, view.mIndex, 1);
            const firstDay = first.getDay(); // 0 Sun
            const daysInMonth = new Date(view.y, view.mIndex + 1, 0).getDate();

            // 6 weeks grid (42)
            const start = new Date(view.y, view.mIndex, 1 - firstDay);

            for (let i = 0; i < 42; i++) {
                const d = new Date(start);
                d.setDate(start.getDate() + i);

                const inMonth = d.getMonth() === view.mIndex;
                const dKey = keyFromDate(d);

                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "cal-day";

                btn.textContent = String(d.getDate());

                if (!inMonth) btn.classList.add("is-out");

                // disable past dates (including out-of-month past)
                const isPast = startOfDay(d).getTime() < today.getTime();
                const isDisabled = isPast || !inMonth;

                if (isDisabled) btn.classList.add("is-disabled");

                // today highlight (primary)
                if (dKey === keyFromDate(today)) btn.classList.add("is-today");

                // selected outline
                if (dKey === activeDateKey) btn.classList.add("is-selected");

                if (!isDisabled) {
                    btn.addEventListener("click", () => {
                        activeDateKey = dKey;

                        // update selected styling
                        $$(".cal-day", grid).forEach((x) => x.classList.remove("is-selected"));
                        btn.classList.add("is-selected");

                        // update session date UI
                        if (sessionDate) sessionDate.textContent = activeDateKey;

                        openSlotsForDate(dKey);
                    });
                }

                grid.appendChild(btn);
            }

            syncSessionUI();
        }

        // nav
        $$("[data-cal-nav]").forEach((btn) => {
            btn.addEventListener("click", () => {
                const dir = btn.getAttribute("data-cal-nav");
                if (dir === "prev") view.mIndex--;
                if (dir === "next") view.mIndex++;

                if (view.mIndex < 0) { view.mIndex = 11; view.y--; }
                if (view.mIndex > 11) { view.mIndex = 0; view.y++; }

                renderCalendar();
            });
        });

        // init
        renderCalendar();
        syncSessionUI();

        // ---------- Submit validation ----------
        const submitBtn = $("#singleSubmitBtn");
        if (submitBtn) {
            submitBtn.addEventListener("click", () => {
                const studioVal = studioValueEl?.value?.trim();
                const notes = $("textarea.book-input")?.value?.trim(); // your booking notes textarea uses book-input
                const bandName = $("#bandNameInput")?.value?.trim();

                // only slots from active date OR any? you can change later
                const anySlots = selectedSlotMap.size > 0;

                if (!studioVal) return mnkToast("Select studio is required.");
                if (!notes) return mnkToast("Booking Notes are required.");
                if (!bandName) return mnkToast("Band Name is required.");
                if (!anySlots) return mnkToast("Please select at least one slot.");

                mnkToast("Form looks good (submission wiring comes next).", "warn");
            });
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        initTabs();
        initDropdowns();
        initCalendarAndSlots();
    });
})();
