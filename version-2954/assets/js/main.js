(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function () {
        var toggle = document.querySelector('[data-menu-toggle]');
        var mobileNav = document.querySelector('[data-mobile-nav]');

        if (toggle && mobileNav) {
            toggle.addEventListener('click', function () {
                mobileNav.classList.toggle('is-open');
                toggle.textContent = mobileNav.classList.contains('is-open') ? '×' : '☰';
            });
        }

        initHero();
        initFilters();
        initQuerySearch();
    });

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 6200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initFilters() {
        var areas = Array.prototype.slice.call(document.querySelectorAll('[data-search-area]'));

        areas.forEach(function (area) {
            var cards = Array.prototype.slice.call(area.querySelectorAll('[data-movie-card]'));
            var input = area.querySelector('[data-search-input]');
            var typeFilter = area.querySelector('[data-type-filter]');
            var yearFilter = area.querySelector('[data-year-filter]');
            var regionFilter = area.querySelector('[data-region-filter]');
            var empty = area.querySelector('[data-empty-state]');

            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : '';
                var typeValue = typeFilter ? typeFilter.value : '';
                var yearValue = yearFilter ? yearFilter.value : '';
                var regionValue = regionFilter ? regionFilter.value : '';
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute('data-title') || '',
                        card.getAttribute('data-region') || '',
                        card.getAttribute('data-type') || '',
                        card.getAttribute('data-year') || '',
                        card.getAttribute('data-tags') || '',
                        card.getAttribute('data-category') || ''
                    ].join(' ').toLowerCase();
                    var passKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var passType = !typeValue || (card.getAttribute('data-type') || '').indexOf(typeValue) !== -1;
                    var passYear = !yearValue || (card.getAttribute('data-year') || '') === yearValue;
                    var passRegion = !regionValue || (card.getAttribute('data-region') || '') === regionValue;
                    var show = passKeyword && passType && passYear && passRegion;

                    card.classList.toggle('is-hidden', !show);
                    if (show) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }

            [input, typeFilter, yearFilter, regionFilter].forEach(function (element) {
                if (element) {
                    element.addEventListener('input', apply);
                    element.addEventListener('change', apply);
                }
            });

            apply();
        });
    }

    function initQuerySearch() {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (!q) {
            return;
        }
        var input = document.querySelector('[data-search-input]');
        if (input) {
            input.value = q;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.focus();
        }
    }
}());
