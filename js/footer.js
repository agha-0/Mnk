// js/footer.js
async function mountFooter() {
    const mount = document.getElementById("footerMount");
    if (!mount) return;

    try {
        const res = await fetch("/components/footer.html");
        mount.innerHTML = await res.text();

        const year = String(new Date().getFullYear());

        // IMPORTANT: you have multiple #footerYear in markup (desktop + mobile)
        mount.querySelectorAll("#footerYear").forEach((el) => {
            el.textContent = year;
        });
    } catch (e) {
        console.error("Footer mount failed:", e);
    }
}

document.addEventListener("DOMContentLoaded", mountFooter);
