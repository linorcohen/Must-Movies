(function () {
    var NAV_HIDE_THRESHOLD = 20;
    var NAV_BG_THRESHOLD = 500;
    var nav = document.querySelector("nav");
    var prevScrollTop = document.documentElement.scrollTop;

    window.onscroll = function () {
        var currentScroll = document.documentElement.scrollTop || document.body.scrollTop;

        if (currentScroll > NAV_HIDE_THRESHOLD) {
            nav.style.top = "-" + nav.offsetHeight + "px";
        }
        if (currentScroll <= NAV_HIDE_THRESHOLD || prevScrollTop > currentScroll) {
            nav.style.top = "0";
        }

        nav.style.backgroundColor = currentScroll > NAV_BG_THRESHOLD ? "#000000" : "transparent";

        prevScrollTop = document.documentElement.scrollTop;
    };
})();
