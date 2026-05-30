document.addEventListener('DOMContentLoaded', function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var active = 0;

    function show(index) {
      active = index;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show((active + 1) % slides.length);
      }, 5200);
    }
  });

  document.querySelectorAll('[data-filter-area]').forEach(function (area) {
    var input = area.querySelector('[data-filter-input]');
    var typeSelect = area.querySelector('[data-filter-type]');
    var regionSelect = area.querySelector('[data-filter-region]');
    var scope = area.parentElement || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
    var empty = scope.querySelector('.empty-result');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var typeValue = typeSelect ? typeSelect.value : '';
      var regionValue = regionSelect ? regionSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(' ').toLowerCase();
        var typeMatch = !typeValue || card.dataset.type === typeValue;
        var regionMatch = !regionValue || card.dataset.region === regionValue;
        var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
        var showCard = typeMatch && regionMatch && keywordMatch;

        card.style.display = showCard ? '' : 'none';
        if (showCard) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, typeSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  });

  document.querySelectorAll('[data-player]').forEach(function (shell) {
    var video = shell.querySelector('video');
    var cover = shell.querySelector('.player-cover');
    var hlsInstance = null;

    function playVideo() {
      if (!video) {
        return;
      }

      var stream = video.dataset.stream;
      if (!stream) {
        return;
      }

      if (cover) {
        cover.classList.add('is-hidden');
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (!video.src) {
          video.src = stream;
        }
        video.play();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new window.Hls();
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play();
          });
        } else {
          video.play();
        }
        return;
      }

      if (!video.src) {
        video.src = stream;
      }
      video.play();
    }

    if (cover) {
      cover.addEventListener('click', playVideo);
    }

    shell.addEventListener('click', function (event) {
      if (event.target === shell) {
        playVideo();
      }
    });
  });
});
