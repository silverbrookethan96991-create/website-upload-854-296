(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = qs('[data-menu-toggle]');
    var panel = qs('[data-menu-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var open = panel.classList.toggle('is-open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('menu-open', open);
    });
  }

  function initHero() {
    var slider = qs('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = qsa('.hero-slide', slider);
    var dots = qsa('[data-hero-dot]', slider);
    var index = 0;
    var timer = null;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    qsa('[data-hero-prev]', slider).forEach(function (button) {
      button.addEventListener('click', function () {
        show(index - 1);
        play();
      });
    });

    qsa('[data-hero-next]', slider).forEach(function (button) {
      button.addEventListener('click', function () {
        show(index + 1);
        play();
      });
    });

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        play();
      });
    });

    show(0);
    play();
  }

  function initScrollRails() {
    qsa('[data-scroll-target]').forEach(function (button) {
      button.addEventListener('click', function () {
        var target = qs(button.getAttribute('data-scroll-target'));
        if (!target) {
          return;
        }
        var amount = button.getAttribute('data-scroll-dir') === 'left' ? -340 : 340;
        target.scrollBy({ left: amount, behavior: 'smooth' });
      });
    });
  }

  function initFilters() {
    qsa('[data-filter-panel]').forEach(function (panel) {
      var grid = qs(panel.getAttribute('data-grid'));
      if (!grid) {
        return;
      }
      var search = qs('[data-search-field]', panel);
      var selects = qsa('[data-filter-field]', panel);
      var empty = qs('[data-empty-for="' + grid.id + '"]');
      var cards = qsa('.movie-card', grid);

      function apply() {
        var term = search ? search.value.trim().toLowerCase() : '';
        var filters = {};
        selects.forEach(function (select) {
          filters[select.getAttribute('data-filter-field')] = select.value;
        });
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-tags') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-type') || '',
            card.getAttribute('data-year') || ''
          ].join(' ').toLowerCase();
          var ok = !term || haystack.indexOf(term) !== -1;
          Object.keys(filters).forEach(function (key) {
            if (filters[key] && card.getAttribute('data-' + key) !== filters[key]) {
              ok = false;
            }
          });
          card.style.display = ok ? '' : 'none';
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      if (search) {
        search.addEventListener('input', apply);
      }
      selects.forEach(function (select) {
        select.addEventListener('change', apply);
      });
    });
  }

  window.initMoviePlayer = function (src) {
    var video = document.getElementById('movie-player');
    var start = document.getElementById('player-start');
    if (!video || !src) {
      return;
    }

    function bindSource() {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    }

    function startPlay() {
      if (start) {
        start.classList.add('is-hidden');
      }
      video.controls = true;
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    bindSource();
    if (start) {
      start.addEventListener('click', startPlay);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlay();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initScrollRails();
    initFilters();
  });
})();
