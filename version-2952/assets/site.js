(function () {
  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $$(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupMenu() {
    var button = $('[data-menu-toggle]');
    var menu = $('[data-mobile-nav]');
    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = $('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = $$('[data-hero-slide]', hero);
    var dots = $$('[data-hero-dot]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      if (timer || slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
        start();
      });
    });

    show(0);
    start();
  }

  function setupSearchForms() {
    $$('[data-site-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var keyword = input ? input.value.trim() : '';
        var target = form.getAttribute('data-search-url') || form.getAttribute('action') || 'search.html';
        var glue = target.indexOf('?') >= 0 ? '&' : '?';
        window.location.href = target + glue + 'q=' + encodeURIComponent(keyword);
      });
    });
  }

  function setupFilters() {
    var cards = $$('[data-movie-card]');
    var input = $('[data-search-input]');
    var year = $('[data-filter-year]');
    var region = $('[data-filter-region]');
    var empty = $('[data-empty-state]');

    if (!cards.length || (!input && !year && !region)) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');
    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function matches(card) {
      var keyword = normalize(input && input.value);
      var selectedYear = normalize(year && year.value);
      var selectedRegion = normalize(region && region.value);
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' '));
      var cardYear = normalize(card.getAttribute('data-year'));
      var cardRegion = normalize(card.getAttribute('data-region'));

      if (keyword && haystack.indexOf(keyword) === -1) {
        return false;
      }
      if (selectedYear && cardYear.indexOf(selectedYear) === -1) {
        return false;
      }
      if (selectedRegion && cardRegion.indexOf(selectedRegion) === -1) {
        return false;
      }
      return true;
    }

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var ok = matches(card);
        card.classList.toggle('is-hidden', !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, year, region].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener('input', apply);
      control.addEventListener('change', apply);
    });

    apply();
  }

  function setupPlayers() {
    $$('[data-player]').forEach(function (shell) {
      var video = $('video', shell);
      var button = $('[data-play-button]', shell);
      var message = $('[data-player-message]', shell);
      var source = shell.getAttribute('data-src');
      var hls = null;

      if (!video || !button || !source) {
        return;
      }

      function showMessage(text) {
        if (!message) {
          return;
        }
        message.textContent = text;
        message.hidden = false;
      }

      function playVideo() {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            showMessage('浏览器阻止了自动播放，请再次点击播放按钮。');
          });
        }
      }

      function initSource() {
        if (video.getAttribute('data-ready') === '1') {
          playVideo();
          return;
        }

        video.setAttribute('data-ready', '1');
        button.classList.add('is-hidden');

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              showMessage('播放线路暂时无法连接，请刷新页面或稍后重试。');
              try {
                hls.destroy();
              } catch (error) {
                hls = null;
              }
            }
          });
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', playVideo, { once: true });
          return;
        }

        video.src = source;
        playVideo();
      }

      button.addEventListener('click', initSource);
      video.addEventListener('error', function () {
        showMessage('播放线路暂时无法连接，请刷新页面或稍后重试。');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupSearchForms();
    setupFilters();
    setupPlayers();
  });
})();
