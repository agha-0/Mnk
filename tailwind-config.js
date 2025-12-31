window.tailwind = window.tailwind || {};
window.tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: "var(--c-primary)",
                paragraph: "var(--c-paragraph)",
                mainBg: "var(--c-main-bg)",
                subBg: "var(--c-sub-bg)",
            },
            fontFamily: {
                // use: class="font-robotto"
                robotto: ['"Roboto Condensed"', "system-ui", "sans-serif"],

                // optional: use: class="font-montserrat"
                montserrat: ['"Montserrat"', "system-ui", "sans-serif"],

                // optional: use: class="font-century"
                century: ['"Century Gothic"', 'system-ui', 'sans-serif'],
            },
            screens: {
                "2xs": "375px",
                // => @media (min-width:375px) { ... }

                xs: "425px",
                // => @media (min-width:425px) { ... }

                '2sm': "480px",
                // => @media (min-width:480px) { ... }

                sm: "640px",
                // => @media (min-width: 640px) { ... }

                md: "768px",
                // => @media (min-width: 768px) { ... }

                lg: "1024px",
                // => @media (min-width: 1024px) { ... }

                xl: "1280px",
                // => @media (min-width: 1280px) { ... }

                "2xl": "1440px",
                // => @media (min-width: 1440px) { ... }
            },
        },
    },
};
