(function () {
    const $ = (s, p = document) => p.querySelector(s);
    const $$ = (s, p = document) => Array.from(p.querySelectorAll(s));

    // ---------- Dropdowns (dd style) ----------
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
                    if (dd === "emirates") {
                        const hidden = $("#emiratesValue");
                        if (hidden) hidden.value = v;
                        clearFieldError("emirates");
                    }

                    close();
                });
            });

            document.addEventListener("click", close);
            document.addEventListener("keydown", (e) => e.key === "Escape" && close());
        });
    }

    // ---------- Terms Modal ----------
    function initTermsModal() {
        const modal = $("#termsModal");
        const openBtn = $("#openTermsBtn");
        const agreeBtn = $("#agreeTermsBtn");
        const termsCheck = $("#termsCheck");
        const termsError = $("#termsError");

        if (!modal || !openBtn || !agreeBtn || !termsCheck) return;

        const open = () => {
            modal.classList.add("is-open");
            modal.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
        };

        const close = () => {
            modal.classList.remove("is-open");
            modal.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
        };

        openBtn.addEventListener("click", open);

        document.addEventListener("click", (e) => {
            if (e.target && e.target.closest("[data-terms-close='1']")) close();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modal.classList.contains("is-open")) close();
        });

        agreeBtn.addEventListener("click", () => {
            termsCheck.checked = true;
            if (termsError) termsError.style.display = "none";
            close();
        });
    }

    // ---------- Validation UI helpers ----------
    function setFieldError(fieldKey, on) {
        const wrap = document.querySelector(`[data-field="${fieldKey}"]`);
        if (!wrap) return;

        wrap.classList.toggle("is-error", !!on);

        // for accessibility
        const input = wrap.querySelector("input, textarea, button.dd-btn");
        if (input) input.setAttribute("aria-invalid", on ? "true" : "false");
    }

    function clearFieldError(fieldKey) {
        setFieldError(fieldKey, false);
    }

    function scrollFocus(el) {
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => {
            try { el.focus({ preventScroll: true }); } catch (_) { }
        }, 250);
    }

    // ---------- Validate & Submit ----------
    function initCheckoutActions() {
        const cancelBtn = $("#cancelBtn");
        const proceedBtn = $("#proceedBtn");
        const form = $("#checkoutForm");

        const termsCheck = $("#termsCheck");
        const termsError = $("#termsError");
        const termsBlock = $("#termsBlock");

        const emiratesHidden = $("#emiratesValue");
        const emiratesBtn = document.querySelector('[data-dd="emirates"] [data-dd-btn]');

        const area = $("#area");
        const street = $("#street");
        const building = $("#building");

        if (cancelBtn) {
            cancelBtn.addEventListener("click", () => {
                window.location.href = "/rehearsal-studios/";
            });
        }

        // Live clear errors
        const bindClear = (el, key) => {
            if (!el) return;
            el.addEventListener("input", () => {
                if (String(el.value || "").trim()) clearFieldError(key);
            });
            el.addEventListener("blur", () => {
                if (String(el.value || "").trim()) clearFieldError(key);
            });
        };

        bindClear(area, "area");
        bindClear(street, "street");
        bindClear(building, "building");

        if (termsCheck && termsError) {
            termsCheck.addEventListener("change", () => {
                if (termsCheck.checked) termsError.style.display = "none";
            });
        }

        if (!proceedBtn) return;

        proceedBtn.addEventListener("click", () => {
            // reset
            ["emirates", "area", "street", "building"].forEach((k) => clearFieldError(k));
            if (termsError) termsError.style.display = "none";
            if (termsBlock) termsBlock.classList.remove("is-error");

            const errors = [];

            // emirates
            const emiratesVal = (emiratesHidden?.value || "").trim();
            if (!emiratesVal) {
                setFieldError("emirates", true);
                errors.push(emiratesBtn || document.querySelector('[data-field="emirates"]'));
            }

            // text inputs
            const areaVal = (area?.value || "").trim();
            if (!areaVal) {
                setFieldError("area", true);
                errors.push(area);
            }

            const streetVal = (street?.value || "").trim();
            if (!streetVal) {
                setFieldError("street", true);
                errors.push(street);
            }

            const buildingVal = (building?.value || "").trim();
            if (!buildingVal) {
                setFieldError("building", true);
                errors.push(building);
            }

            // terms
            if (!termsCheck?.checked) {
                if (termsError) termsError.style.display = "block";
                if (termsBlock) termsBlock.classList.add("is-error");
                // only push if no field errors so it becomes first focus
                if (!errors.length) errors.push(termsCheck);
            }

            // go to first error
            if (errors.length) {
                scrollFocus(errors[0]);
                // optional toast
                if (typeof window.mnkToast === "function") {
                    window.mnkToast("Please fill the required fields.", "warn");
                }
                return;
            }

            // All good -> submit (wire to Telr later)
            if (typeof window.mnkToast === "function") {
                window.mnkToast("Looks good. Redirecting to payment...", "success");
            }

            // submit real form
            form?.submit();
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        initDropdowns();
        initTermsModal();
        initCheckoutActions();
    });
})();
