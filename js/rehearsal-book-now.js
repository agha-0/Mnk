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
                        const studioInput = $("#studioValue");
                        const prev = studioInput?.value?.trim() || "";

                        if (studioInput) studioInput.value = v;

                        const s = $("#sessionStudio");
                        if (s) s.textContent = v;

                        // 🔥 only clear selections if studio actually changed
                        if (prev && prev !== v) {
                            window.dispatchEvent(
                                new CustomEvent("mnk:studio-changed", { detail: { value: v, prev } })
                            );
                        }
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
    async function fetchSlotsApiLike(dateKey, studioValue) {
        await new Promise((r) => setTimeout(r, 650));

        const demo = [
            { id: 143, room_id: 2, start_time: "10:00 AM", end_time: "11:00 AM", status: 1, check_time: "10", not: 0 },
            { id: 144, room_id: 2, start_time: "11:00 AM", end_time: "12:00 PM", status: 1, check_time: "11" },
            { id: 145, room_id: 2, start_time: "12:00 PM", end_time: "1:00 PM", status: 1, check_time: "12" },
            { id: 146, room_id: 2, start_time: "1:00 PM", end_time: "2:00 PM", status: 1, check_time: "13" },
            { id: 147, room_id: 2, start_time: "2:00 PM", end_time: "3:00 PM", status: 1, check_time: "14", not: 1 },
            { id: 148, room_id: 2, start_time: "3:00 PM", end_time: "4:00 PM", status: 1, check_time: "15" },
            { id: 149, room_id: 2, start_time: "4:00 PM", end_time: "5:00 PM", status: 1, check_time: "16" },
            { id: 150, room_id: 2, start_time: "5:00 PM", end_time: "6:00 PM", status: 1, check_time: "17" },
            { id: 151, room_id: 2, start_time: "6:00 PM", end_time: "7:00 PM", status: 1, check_time: "18" },
            { id: 153, room_id: 2, start_time: "7:00 PM", end_time: "8:00 PM", status: 1, check_time: "19" },
            { id: 154, room_id: 2, start_time: "8:00 PM", end_time: "9:00 PM", status: 1, check_time: "20", not: 1 },
            { id: 155, room_id: 2, start_time: "9:00 PM", end_time: "10:00 PM", status: 1, check_time: "21" },
        ];

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

        // composite key (date + slotId) so "green" only applies to the right day
        const slotKey = (dateKey, slotId) => `${dateKey}__${slotId}`;

        // MULTI PICKED (in modal, before confirm) - store composite keys
        const pickedSet = new Set(); // Set<string>

        // CONFIRMED / ADDED - store composite keys
        const selectedSlotMap = new Map(); // key -> { key, slotId, dateKey, label }
        const selectedDateCount = new Map(); // dateKey -> count

        function incDate(dateKey) {
            selectedDateCount.set(dateKey, (selectedDateCount.get(dateKey) || 0) + 1);
        }
        function decDate(dateKey) {
            const c = selectedDateCount.get(dateKey) || 0;
            if (c <= 1) selectedDateCount.delete(dateKey);
            else selectedDateCount.set(dateKey, c - 1);
        }

        function toast(msg, type = "warn") {
            if (typeof window.mnkToast === "function") window.mnkToast(msg, type);
            else alert(msg);
        }

        function updateConfirmState() {
            confirmBtn.disabled = pickedSet.size === 0;
        }

        function clearAllSelections() {
            pickedSet.clear();
            selectedSlotMap.clear();
            selectedDateCount.clear();
            confirmBtn.disabled = true;

            // clear last cache too (optional but clean)
            lastSlots = [];
            lastDateKey = null;

            syncSessionUI();
            renderCalendar();
        }

        // 🔥 clear selected slots when studio changes
        window.addEventListener("mnk:studio-changed", () => {
            if (modal.classList.contains("is-open")) closeModal();
            clearAllSelections();
            toast("Studio changed — selected slots cleared.", "warn");
        });

        function syncSessionUI() {
            if (sessionStudio) sessionStudio.textContent = studioValueEl?.value || "None";
            if (sessionDate) sessionDate.textContent = activeDateKey || "None";

            if (!sessionSlots || !sessionSlotsEmpty) return;

            sessionSlots.innerHTML = "";

            // Group all selected slots by date (so multi-day selections are visible)
            const groups = new Map(); // dateKey -> items[]
            for (const it of selectedSlotMap.values()) {
                if (!groups.has(it.dateKey)) groups.set(it.dateKey, []);
                groups.get(it.dateKey).push(it);
            }

            const dateKeys = Array.from(groups.keys()).sort();

            if (!dateKeys.length) {
                sessionSlotsEmpty.classList.remove("hidden");
                return;
            }
            sessionSlotsEmpty.classList.add("hidden");

            dateKeys.forEach((dKey) => {
                const header = document.createElement("div");
                header.className = "text-white/80 font-semibold text-[12px] mt-2";
                header.textContent = dKey;
                sessionSlots.appendChild(header);

                const items = groups.get(dKey) || [];
                items.forEach((it) => {
                    const row = document.createElement("div");
                    row.className =
                        "flex items-center justify-between gap-3 bg-white/5 border border-white/10 px-3 py-2 text-[11px] text-white/80";
                    row.innerHTML = `
            <span class="font-semibold text-white/85">${it.label}</span>
            <button type="button" class="text-white/60 hover:text-white" data-remove-slot="${it.key}" aria-label="Remove">✕</button>
          `;
                    sessionSlots.appendChild(row);
                });
            });

            sessionSlots.querySelectorAll("[data-remove-slot]").forEach((btn) => {
                btn.addEventListener("click", () => {
                    const key = btn.getAttribute("data-remove-slot");
                    if (!key) return;

                    const it = selectedSlotMap.get(key);
                    if (!it) return;

                    selectedSlotMap.delete(key);
                    decDate(it.dateKey);

                    // if modal open, refresh slots paint
                    if (modal.classList.contains("is-open")) renderSlotsLastPayload();

                    syncSessionUI();
                    renderCalendar(); // update green day outline
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

        function slotState(slot, dateKey) {
            const k = slotKey(dateKey, slot.id);

            // already added (confirmed) FOR THIS DATE
            if (selectedSlotMap.has(k)) return { state: "added", key: k };

            // API unavailable
            if (slot.status !== 1) return { state: "disabled", key: k };
            if (slot.not === 1) return { state: "disabled", key: k };

            // time-based disabling for today
            const d = new Date(dateKey + "T00:00:00");
            const isToday = startOfDay(d).getTime() === today.getTime();
            if (isToday) {
                const startMins = parseTimeToMinutes(slot.start_time);
                if (startMins <= nowMinutes()) return { state: "disabled", key: k };
            }

            return { state: "active", key: k };
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
                b.className = "slot flex items-center justify-center gap-2 px-2";
                //         b.innerHTML = `
                //   <span class="slot-label">${labelText}</span>
                //   <span class="slot-tick">✓</span>
                // `;
                b.innerHTML = `
          <span class="slot-label w-full flex-1 mx-auto">${labelText}</span>
        `;

                if (st.state === "disabled") b.classList.add("is-disabled");
                if (st.state === "added") b.classList.add("is-added");
                if (pickedSet.has(st.key)) b.classList.add("is-picked");

                if (st.state === "active") {
                    b.addEventListener("click", () => {
                        if (pickedSet.has(st.key)) pickedSet.delete(st.key);
                        else pickedSet.add(st.key);

                        b.classList.toggle("is-picked", pickedSet.has(st.key));
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

            // if studio changed/cleared, ensure picks not stale
            for (const k of Array.from(pickedSet)) {
                // only allow picks for current modal date
                if (!k.startsWith(lastDateKey + "__")) pickedSet.delete(k);
                // prevent picking already-added slot
                if (selectedSlotMap.has(k)) pickedSet.delete(k);
            }

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

        // CONFIRM: add all picked at once (for the current date)
        confirmBtn.addEventListener("click", () => {
            if (!lastDateKey || pickedSet.size === 0) return;

            let addedCount = 0;

            pickedSet.forEach((k) => {
                const parts = k.split("__");
                const slotId = Number(parts[1]);
                const slot = lastSlots.find((s) => s.id === slotId);
                if (!slot) return;

                if (!selectedSlotMap.has(k)) {
                    selectedSlotMap.set(k, {
                        key: k,
                        slotId: slot.id,
                        dateKey: lastDateKey,
                        label: `${slot.start_time} - ${slot.end_time}`,
                    });
                    incDate(lastDateKey);
                    addedCount++;
                }
            });

            pickedSet.clear();
            updateConfirmState();

            renderSlotsLastPayload();
            syncSessionUI();
            renderCalendar(); // update green outline on calendar

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

                // green outline if THIS date has any selected slots
                if (selectedDateCount.has(dKey)) btn.classList.add("is-has-slots");

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

                if (view.mIndex < 0) {
                    view.mIndex = 11;
                    view.y--;
                }
                if (view.mIndex > 11) {
                    view.mIndex = 0;
                    view.y++;
                }

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
