(function () {
    const $ = (s, p = document) => p.querySelector(s);
    const $$ = (s, p = document) => Array.from(p.querySelectorAll(s));

    // ---------- Dropdowns (dd style) ----------
    function initDropdowns() {
        $$("[data-dd]").forEach((wrap) => {
            const btn = $("[data-dd-btn]", wrap);
            const menu = $("[data-dd-menu]", wrap);
            const label = $("[data-dd-label]", wrap);
            const hidden = $("input[type='hidden']", wrap);

            if (!btn || !menu || !label) return;

            const close = () => menu.classList.add("hidden");
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
                    const labelText = item.getAttribute("data-dd-label-text") || item.textContent.trim();

                    label.textContent = labelText;
                    if (hidden) hidden.value = v;

                    // clear error if dropdown is required
                    const fieldWrap = wrap.closest("[data-field]");
                    if (fieldWrap) setFieldError(fieldWrap.getAttribute("data-field"), false);

                    close();
                });
            });

            document.addEventListener("click", close);
            document.addEventListener("keydown", (e) => e.key === "Escape" && close());
        });
    }

    // ---------- Validation UI helpers ----------
    function setFieldError(fieldKey, on) {
        const wrap = document.querySelector(`[data-field="${fieldKey}"]`);
        if (!wrap) return;

        wrap.classList.toggle("is-error", !!on);

        const input = wrap.querySelector("input, textarea, button.dd-btn");
        if (input) input.setAttribute("aria-invalid", on ? "true" : "false");
    }

    function scrollFocus(el) {
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => {
            try {
                el.focus({ preventScroll: true });
            } catch (_) { }
        }, 250);
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
    }

    // ---------- Form ----------
    function initInquiryForm() {
        const form = $("#inquiryForm");
        if (!form) return;


        const fullName = $("#inqFullName");
        const email = $("#inqEmail");
        const country = $("#inqCountry");        // visible country input

        const phone = $("#inqPhone");                 // visible input
        const dialCode = $("#dialCodeValue");         // hidden
        const phoneE164 = $("#inqPhoneE164");         // hidden
        const phoneCountryHidden = $("#phoneCountryValue"); // hidden from phone dropdown
        const message = $("#inqMessage");
        const recaptchaCheck = $("[data-recaptcha-check]", form);

        // ---- init intl-tel-input ----
        const iti = window.intlTelInput(phone, {
            initialCountry: "ae",        // default UAE (change if you want)
            separateDialCode: true,      // shows +971 as uneditable next to input :contentReference[oaicite:2]{index=2}
            strictMode: true,            // numeric only + caps max length :contentReference[oaicite:3]{index=3}

            // OPTIONAL: limit to GCC only
            // onlyCountries: ["ae", "sa", "kw", "bh", "qa", "om"],
        });

        function syncPhoneMeta() {
            const data = iti.getSelectedCountryData();
            if (dialCode) dialCode.value = data?.dialCode ? `+${data.dialCode}` : "";
        }

        phone.addEventListener("countrychange", syncPhoneMeta);
        syncPhoneMeta();

        // live clear on input
        const bindClear = (el, key) => {
            if (!el) return;
            el.addEventListener("input", () => setFieldError(key, false));
            el.addEventListener("blur", () => {
                if (String(el.value || "").trim()) setFieldError(key, false);
            });
        };

        bindClear(fullName, "fullName");
        bindClear(email, "email");
        bindClear(phone, "phone");
        bindClear(message, "message");
        bindClear(country, "country");

        if (recaptchaCheck) {
            recaptchaCheck.addEventListener("change", () => {
                if (recaptchaCheck.checked) setFieldError("recaptcha", false);
            });
        }

        form.addEventListener("submit", (e) => {
            e.preventDefault();

            ["fullName", "email", "phone", "message", "recaptcha", "country"].forEach((k) => setFieldError(k, false));
            const errors = [];

            const fullNameVal = (fullName?.value || "").trim();
            if (!fullNameVal) { setFieldError("fullName", true); errors.push(fullName); }

            const emailVal = (email?.value || "").trim();
            if (!emailVal || !isValidEmail(emailVal)) { setFieldError("email", true); errors.push(email); }

            const phoneVal = (phone?.value || "").trim();
            if (!phoneVal) {
                setFieldError("phone", true);
                errors.push(phone);
            } else {
                // validate according to selected country (via libphonenumber utils) :contentReference[oaicite:4]{index=4}
                if (!iti.isValidNumber()) {
                    setFieldError("phone", true);
                    errors.push(phone);
                }
            }

            const countryVal = (country?.value || "").trim();
            if (!countryVal) { setFieldError("country", true); errors.push(country); }

            const messageVal = (message?.value || "").trim();
            if (!messageVal) { setFieldError("message", true); errors.push(message); }

            if (recaptchaCheck && !recaptchaCheck.checked) {
                setFieldError("recaptcha", true);
                if (!errors.length) errors.push(recaptchaCheck);
            }

            if (errors.length) {
                scrollFocus(errors[0]);
                if (typeof window.mnkToast === "function") window.mnkToast("Please fix the highlighted fields.", "warn");
                form.classList.add("!gap-5");
                return;
            }

            // store standardized phone (E.164)
            syncPhoneMeta();
            const e164 = iti.getNumber(); // E.164 output is what most APIs/backends want :contentReference[oaicite:5]{index=5}
            if (phoneE164) phoneE164.value = e164;

            const payload = {
                fullName: fullNameVal,
                email: emailVal,
                dialCode: (dialCode?.value || "").trim(),
                phone: e164,                   // save E.164, not raw input
                country: countryVal,
                message: messageVal,
                newsletter: !!form.querySelector('input[name="newsletter"]')?.checked,
            };

            console.log("Inquiry Form Submit:", payload);

            if (typeof window.mnkToast === "function") window.mnkToast("Inquiry submitted (check console).", "success");

            form.reset();
            iti.setCountry("ae");   // reset back to UAE (or your default)
            syncPhoneMeta();
            if (phoneE164) phoneE164.value = "";
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        initDropdowns();
        initInquiryForm();
    });
})();
