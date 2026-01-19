// /js/auth.js
(function () {
    const $ = (s, p = document) => p.querySelector(s);

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
    }

    function setFieldError(fieldKey, on) {
        const wrap = document.querySelector(`[data-field="${fieldKey}"]`);
        if (!wrap) return;
        wrap.classList.toggle("is-error", !!on);
        const input = wrap.querySelector("input, textarea, button.dd-btn");
        if (input) input.setAttribute("aria-invalid", on ? "true" : "false");
    }

    function clearModalErrors(modal) {
        if (!modal) return;
        modal.querySelectorAll(".mnk-field.is-error").forEach((w) => w.classList.remove("is-error"));
        modal.querySelectorAll("[aria-invalid='true']").forEach((el) => el.setAttribute("aria-invalid", "false"));
    }

    function resetModal(modal, opts = { resetValues: true }) {
        if (!modal) return;

        // reset inputs
        if (opts.resetValues) {
            const form = modal.querySelector("form");
            if (form) form.reset();
        }

        // clear errors always
        clearModalErrors(modal);
    }

    function openModal(modal) {
        if (!modal) return;
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";

        const firstInput = modal.querySelector("input, button, textarea");
        if (firstInput) setTimeout(() => { try { firstInput.focus(); } catch (_) { } }, 50);
    }

    function closeModal(modal, resetValues = true) {
        if (!modal) return;

        // ✅ clear typed data + errors
        resetModal(modal, { resetValues });

        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");

        // only unlock scroll if both modals closed
        const anyOpen = document.querySelector(".slots-modal.is-open");
        if (!anyOpen) document.body.style.overflow = "";
    }

    function initAuth() {
        const loginModal = $("#loginModal");
        const signupModal = $("#signupModal");
        if (!loginModal || !signupModal) return;

        // ---------- SIGNUP PHONE (iti) ----------
        const suPhone = $("#suPhone");
        const suDialCode = $("#suDialCode");
        const suPhoneE164 = $("#suPhoneE164");

        let iti = null;

        function syncSignupPhoneMeta() {
            if (!iti) return;
            const data = iti.getSelectedCountryData();
            if (suDialCode) suDialCode.value = data?.dialCode ? `+${data.dialCode}` : "";
        }

        function resetSignupPhone() {
            if (!suPhone) return;
            suPhone.value = "";
            if (iti) iti.setCountry("ae");
            if (suDialCode) suDialCode.value = "";
            if (suPhoneE164) suPhoneE164.value = "";
        }

        if (suPhone && window.intlTelInput) {
            iti = window.intlTelInput(suPhone, {
                initialCountry: "ae",
                separateDialCode: true,
                strictMode: true,
            });

            suPhone.addEventListener("countrychange", syncSignupPhoneMeta);
            syncSignupPhoneMeta();
        }

        // override resetModal to include signup phone reset
        const _resetModal = resetModal;
        resetModal = function (modal, opts = { resetValues: true }) {
            _resetModal(modal, opts);
            if (opts.resetValues && modal && modal.id === "signupModal") resetSignupPhone();
        };

        // public opener for nav.js
        window.mnkOpenAuthModal = function (which) {
            if (which === "signup") {
                // close other modal WITHOUT clearing values (so switching doesn't wipe)
                closeModal(loginModal, false);
                openModal(signupModal);
            } else {
                closeModal(signupModal, false);
                openModal(loginModal);
            }
        };

        // close buttons/backdrop
        document.addEventListener("click", (e) => {
            // close
            if (e.target.closest("[data-auth-close='1']")) {
                closeModal(loginModal, true);
                closeModal(signupModal, true);
                return;
            }

            // switch
            const sw = e.target.closest("[data-switch-auth]");
            if (sw) {
                const which = sw.getAttribute("data-switch-auth");
                window.mnkOpenAuthModal(which);
                return;
            }
        });

        // ESC close
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                closeModal(loginModal, true);
                closeModal(signupModal, true);
            }
        });

        // ---------- LOGIN ----------
        const loginForm = $("#loginForm");
        const loginEmail = $("#loginEmail");
        const loginPassword = $("#loginPassword");

        if (loginForm) {
            loginEmail?.addEventListener("input", () => setFieldError("loginEmail", false));
            loginPassword?.addEventListener("input", () => setFieldError("loginPassword", false));

            loginForm.addEventListener("submit", (e) => {
                e.preventDefault();

                setFieldError("loginEmail", false);
                setFieldError("loginPassword", false);

                const emailVal = (loginEmail?.value || "").trim();
                const passVal = (loginPassword?.value || "").trim();

                const errors = [];
                if (!emailVal || !isValidEmail(emailVal)) { setFieldError("loginEmail", true); errors.push(loginEmail); }
                if (!passVal) { setFieldError("loginPassword", true); errors.push(loginPassword); }

                if (errors.length) {
                    if (typeof window.mnkToast === "function") window.mnkToast("Please fix the highlighted fields.", "warn");
                    return;
                }

                // TODO: call API
                window.mnkAuth?.setLoginState(true);
                window.mnkAuth?.setUserName("zain");
                closeModal(loginModal, true);

                if (typeof window.mnkToast === "function") window.mnkToast("Logged in!", "success");
                if (typeof window.mnkRerenderNav === "function") window.mnkRerenderNav();
            });
        }

        // ---------- SIGNUP ----------
        const signupForm = $("#signupForm");
        const suFirstName = $("#suFirstName");
        const suLastName = $("#suLastName");
        const suEmail = $("#suEmail");
        const suCountry = $("#suCountry");
        const suPassword = $("#suPassword");
        const suConfirmPassword = $("#suConfirmPassword");

        // live clear
        suFirstName?.addEventListener("input", () => setFieldError("firstName", false));
        suLastName?.addEventListener("input", () => setFieldError("lastName", false));
        suPhone?.addEventListener("input", () => setFieldError("mobile", false));
        suEmail?.addEventListener("input", () => setFieldError("email", false));
        suCountry?.addEventListener("input", () => setFieldError("country", false));
        suPassword?.addEventListener("input", () => setFieldError("password", false));
        suConfirmPassword?.addEventListener("input", () => setFieldError("confirmPassword", false));

        if (signupForm) {
            signupForm.addEventListener("submit", (e) => {
                e.preventDefault();

                ["firstName", "lastName", "mobile", "email", "country", "password", "confirmPassword"].forEach((k) =>
                    setFieldError(k, false)
                );

                const fn = (suFirstName?.value || "").trim();
                const ln = (suLastName?.value || "").trim();
                const em = (suEmail?.value || "").trim();
                const ct = (suCountry?.value || "").trim();
                const pw = (suPassword?.value || "").trim();
                const cpw = (suConfirmPassword?.value || "").trim();
                const phoneRaw = (suPhone?.value || "").trim();

                const errors = [];

                if (!fn) { setFieldError("firstName", true); errors.push(suFirstName); }
                if (!ln) { setFieldError("lastName", true); errors.push(suLastName); }

                // phone validate
                if (!phoneRaw) {
                    setFieldError("mobile", true); errors.push(suPhone);
                } else if (iti && !iti.isValidNumber()) {
                    setFieldError("mobile", true); errors.push(suPhone);
                } else if (!iti) {
                    const digits = phoneRaw.replace(/\D/g, "");
                    if (digits.length < 6) { setFieldError("mobile", true); errors.push(suPhone); }
                }

                if (!em || !isValidEmail(em)) { setFieldError("email", true); errors.push(suEmail); }
                if (!ct) { setFieldError("country", true); errors.push(suCountry); }
                if (!pw) { setFieldError("password", true); errors.push(suPassword); }
                if (!cpw || cpw !== pw) { setFieldError("confirmPassword", true); errors.push(suConfirmPassword); }

                if (errors.length) {
                    if (typeof window.mnkToast === "function") window.mnkToast("Please fix the highlighted fields.", "warn");
                    return;
                }

                if (iti && suPhoneE164) suPhoneE164.value = iti.getNumber();
                if (iti) syncSignupPhoneMeta();

                // TODO: call API
                window.mnkAuth?.setLoginState(true);
                window.mnkAuth?.setUserName(fn.toLowerCase());
                closeModal(signupModal, true);

                if (typeof window.mnkToast === "function") window.mnkToast("Account created!", "success");
                if (typeof window.mnkRerenderNav === "function") window.mnkRerenderNav();
            });
        }
    }

    // header is loaded dynamically; wait until modals exist
    function waitFor(selector, cb) {
        if (document.querySelector(selector)) return cb();

        const mo = new MutationObserver(() => {
            if (document.querySelector(selector)) {
                mo.disconnect();
                cb();
            }
        });
        mo.observe(document.documentElement, { childList: true, subtree: true });
    }

    document.addEventListener("DOMContentLoaded", () => {
        waitFor("#loginModal", initAuth);
    });
})();
