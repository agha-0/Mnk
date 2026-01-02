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
        let view = { y: today.getFullYear(), mIndex: today.getMonth() };
        let activeDateKey = keyFromDate(today);

        // MULTI PICKED (in modal, before confirm)
        const pickedSet = new Set(); // slot ids picked (toggle)
        // CONFIRMED / ADDED
        const selectedSlotMap = new Map(); // id -> {id, dateKey, label}

        function toast(msg, type = "warn") {
            if (typeof window.mnkToast === "function") window.mnkToast(msg, type);
            else alert(msg);
        }

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
                    // If modal open, re-render to remove green tick + enable again if applicable
                    if (modal.classList.contains("is-open")) renderSlotsLastPayload();
                    syncSessionUI();
                    toast("Slot removed.", "warn");
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
            pickedSet.clear();
            confirmBtn.disabled = true;
        }

        document.addEventListener("click", (e) => {
            if (e.target && e.target.closest("[data-slots-close='1']")) closeModal();
        });
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
        });

        // keep last fetched slots
        let lastSlots = [];
        let lastDateKey = null;

        // differentiate disabled vs added
        function slotState(slot, dateKey) {
            // already added (confirmed)
            if (selectedSlotMap.has(slot.id)) return { state: "added" };

            // API unavailable
            if (slot.status !== 1) return { state: "disabled" };
            if (slot.not === 1) return { state: "disabled" };

            // time-based disabling for today
            const d = new Date(dateKey + "T00:00:00");
            const isToday = startOfDay(d).getTime() === today.getTime();
            if (isToday) {
                const startMins = parseTimeToMinutes(slot.start_time);
                if (startMins <= nowMinutes()) return { state: "disabled" };
            }

            return { state: "active" };
        }

        function updateConfirmState() {
            confirmBtn.disabled = pickedSet.size === 0;
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
                const st = slotState(slot, dateKey);

                const b = document.createElement("button");
                b.type = "button";
                b.className = "slot";
                b.textContent = labelText;

                // styles
                if (st.state === "disabled") b.classList.add("is-disabled");
                if (st.state === "added") b.classList.add("is-added"); // ✅ green tick
                if (pickedSet.has(slot.id)) b.classList.add("is-picked");

                // click (only active)
                if (st.state === "active") {
                    b.addEventListener("click", () => {
                        // toggle pick (multi)
                        if (pickedSet.has(slot.id)) pickedSet.delete(slot.id);
                        else pickedSet.add(slot.id);

                        // repaint picked styles quickly
                        b.classList.toggle("is-picked", pickedSet.has(slot.id));
                        updateConfirmState();
                    });
                }

                slotsGrid.appendChild(b);
            });

            updateConfirmState();
            syncSessionUI();
        }

        function renderSlotsLastPayload() {
            if (!lastDateKey) return;
            // if user removed slot, make sure pickedSet doesn't hold removed id confusion
            pickedSet.forEach((id) => {
                if (selectedSlotMap.has(id)) pickedSet.delete(id);
            });
            renderSlots(lastDateKey, lastSlots);
        }

        async function openSlotsForDate(dateKey) {
            const studioVal = studioValueEl?.value?.trim();
            if (!studioVal) {
                toast("Please select studio first.", "warn");
                return;
            }

            if (sessionStudio) sessionStudio.textContent = studioVal;

            pickedSet.clear();
            updateConfirmState();

            slotsGrid.innerHTML = "";
            slotsLoader?.classList.remove("hidden");
            openModal();

            try {
                const slots = await fetchSlotsApiLike(dateKey, studioVal);
                slotsLoader?.classList.add("hidden");
                renderSlots(dateKey, slots);
            } catch (err) {
                slotsLoader?.classList.add("hidden");
                toast("Failed to load slots. Please try again.", "warn");
            }
        }

        // CONFIRM: add all picked at once
        confirmBtn.addEventListener("click", () => {
            if (!lastDateKey || pickedSet.size === 0) return;

            let addedCount = 0;

            pickedSet.forEach((id) => {
                const slot = lastSlots.find((s) => s.id === id);
                if (!slot) return;

                selectedSlotMap.set(slot.id, {
                    id: slot.id,
                    dateKey: lastDateKey,
                    label: `${slot.start_time} - ${slot.end_time}`,
                });
                addedCount++;
            });

            pickedSet.clear();
            updateConfirmState();
            renderSlotsLastPayload();
            syncSessionUI();

            toast(addedCount > 1 ? `${addedCount} slots added.` : "Slot added.", "success");
            closeModal();
        });

        // ---------- Calendar render ----------
        function renderCalendar() {
            label.textContent = monthLabel(view.y, view.mIndex);
            grid.innerHTML = "";

            const first = new Date(view.y, view.mIndex, 1);
            const firstDay = first.getDay();
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

                const isPast = startOfDay(d).getTime() < today.getTime();
                const isDisabled = isPast || !inMonth;

                if (isDisabled) btn.classList.add("is-disabled");

                // today highlight
                if (dKey === keyFromDate(today)) btn.classList.add("is-today");

                // selected outline
                if (dKey === activeDateKey) btn.classList.add("is-selected");

                if (!isDisabled) {
                    btn.addEventListener("click", () => {
                        activeDateKey = dKey;
                        $$(".cal-day", grid).forEach((x) => x.classList.remove("is-selected"));
                        btn.classList.add("is-selected");

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
                const notes = $("#bookingNotes")?.value?.trim();
                const bandName = $("#bandNameInput")?.value?.trim();
                const anySlots = selectedSlotMap.size > 0;

                if (!studioVal) return toast("Select studio is required.", "warn");
                if (!notes) return toast("Booking Notes are required.", "warn");
                if (!bandName) return toast("Band Name is required.", "warn");
                if (!anySlots) return toast("Please select at least one slot.", "warn");

                toast("Form looks good (submission wiring comes next).", "ok");
            });
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        initTabs();
        initDropdowns();
        initCalendarAndSlots();
    });
})();
