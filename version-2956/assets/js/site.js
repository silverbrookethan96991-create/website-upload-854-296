(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function initNavigation() {
        var toggle = document.querySelector(".nav-toggle");
        var menu = document.querySelector(".mobile-nav");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initCarousel() {
        var carousel = document.querySelector("[data-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
        var previous = carousel.querySelector(".hero-prev");
        var next = carousel.querySelector(".hero-next");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                restart();
            });
        });

        if (previous) {
            previous.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function uniqueValues(cards, attribute) {
        var values = [];
        cards.forEach(function (card) {
            var value = card.getAttribute(attribute) || "";
            if (value && values.indexOf(value) === -1) {
                values.push(value);
            }
        });
        return values.sort(function (a, b) {
            return String(b).localeCompare(String(a), "zh-CN");
        });
    }

    function fillSelect(select, values) {
        if (!select) {
            return;
        }
        values.forEach(function (value) {
            var option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function initFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        var grid = document.querySelector("[data-card-grid]");
        if (!panel || !grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
        var query = panel.querySelector("[data-filter-query]");
        var region = panel.querySelector("[data-filter-region]");
        var year = panel.querySelector("[data-filter-year]");
        var category = panel.querySelector("[data-filter-category]");
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";

        fillSelect(region, uniqueValues(cards, "data-region"));
        fillSelect(year, uniqueValues(cards, "data-year"));

        if (query && initial) {
            query.value = initial;
        }

        function apply() {
            var words = (query ? query.value : "").trim().toLowerCase();
            var regionValue = region ? region.value : "";
            var yearValue = year ? year.value : "";
            var categoryValue = category ? category.value : "";

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-category"),
                    card.getAttribute("data-tags")
                ].join(" ").toLowerCase();
                var matched = true;

                if (words && haystack.indexOf(words) === -1) {
                    matched = false;
                }
                if (regionValue && card.getAttribute("data-region") !== regionValue) {
                    matched = false;
                }
                if (yearValue && card.getAttribute("data-year") !== yearValue) {
                    matched = false;
                }
                if (categoryValue && card.getAttribute("data-category") !== categoryValue) {
                    matched = false;
                }

                card.classList.toggle("is-filtered-out", !matched);
            });
        }

        [query, region, year, category].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });

        apply();
    }

    ready(function () {
        initNavigation();
        initCarousel();
        initFilters();
    });
})();

function initPlayer(url) {
    var player = document.querySelector("[data-player]");
    if (!player) {
        return;
    }
    var video = player.querySelector("video");
    var layer = player.querySelector(".play-layer");
    var started = false;
    var hls = null;

    function begin() {
        if (!video || started) {
            if (video) {
                video.play().catch(function () {});
            }
            return;
        }
        started = true;
        if (layer) {
            layer.classList.add("is-hidden");
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            video.play().catch(function () {});
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal && hls) {
                    hls.destroy();
                    video.src = url;
                    video.play().catch(function () {});
                }
            });
            return;
        }
        video.src = url;
        video.play().catch(function () {});
    }

    if (layer) {
        layer.addEventListener("click", begin);
    }
    if (video) {
        video.addEventListener("click", function () {
            if (video.paused) {
                begin();
            }
        });
    }
}
