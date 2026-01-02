(function () {
    function mnkToast(msg, type = "info") {
        const root = document.getElementById("toastRoot");
        if (!root) return alert(msg);

        const el = document.createElement("div");
        el.className = `toast toast--${type}`;
        el.innerHTML = `<strong>${type.toUpperCase()}:</strong> ${msg}`;
        root.appendChild(el);

        setTimeout(() => {
            el.style.opacity = "0";
            el.style.transform = "translateY(-8px)";
        }, 2200);

        setTimeout(() => el.remove(), 2600);
    }

    window.mnkToast = mnkToast;
})();
