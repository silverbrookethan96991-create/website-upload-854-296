
(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var previous = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 6200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (previous) {
      previous.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
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

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (shell) {
      var video = shell.querySelector('video');
      var trigger = shell.querySelector('[data-play-trigger]');
      var streamUrl = video ? video.getAttribute('data-stream') : '';
      var loaded = false;
      var hlsInstance = null;

      function attachStream() {
        if (!video || !streamUrl || loaded) {
          return;
        }

        loaded = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
          shell.classList.add('ready');
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            shell.classList.add('ready');
          });
          return;
        }

        video.src = streamUrl;
        shell.classList.add('ready');
      }

      function playVideo() {
        attachStream();
        if (!video) {
          return;
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      }

      if (trigger) {
        trigger.addEventListener('click', function (event) {
          event.preventDefault();
          playVideo();
        });
      }

      if (video) {
        video.addEventListener('play', function () {
          shell.classList.add('playing');
        });
        video.addEventListener('pause', function () {
          shell.classList.remove('playing');
        });
        video.addEventListener('click', function () {
          if (video.paused) {
            playVideo();
          } else {
            video.pause();
          }
        });
      }

      window.addEventListener('beforeunload', function () {
        if (hlsInstance && typeof hlsInstance.destroy === 'function') {
          hlsInstance.destroy();
        }
      });
    });
  }

  function setupSearchPage() {
    var page = document.querySelector('[data-search-page]');
    if (!page) {
      return;
    }

    var form = page.querySelector('[data-filter-form]');
    var input = page.querySelector('[data-search-input]');
    var year = page.querySelector('[data-year-filter]');
    var region = page.querySelector('[data-region-filter]');
    var status = page.querySelector('[data-search-status]');
    var cards = Array.prototype.slice.call(page.querySelectorAll('[data-card]'));
    var params = new URLSearchParams(window.location.search);

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function apply() {
      var keyword = normalize(input ? input.value : '');
      var selectedYear = normalize(year ? year.value : '');
      var selectedRegion = normalize(region ? region.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.textContent
        ].join(' '));
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !selectedYear || normalize(card.getAttribute('data-year')) === selectedYear;
        var matchRegion = !selectedRegion || normalize(card.getAttribute('data-region')) === selectedRegion;
        var matched = matchKeyword && matchYear && matchRegion;
        card.classList.toggle('hidden-by-filter', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (status) {
        status.textContent = visible ? '筛选结果已更新。' : '没有找到匹配影片。';
      }
    }

    if (input && params.get('q')) {
      input.value = params.get('q');
    }

    if (form) {
      form.addEventListener('input', apply);
      form.addEventListener('change', apply);
      form.addEventListener('reset', function () {
        window.setTimeout(apply, 0);
      });
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        apply();
      });
    }

    apply();
  }

  setupHero();
  setupPlayers();
  setupSearchPage();
})();
