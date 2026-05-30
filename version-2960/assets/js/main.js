(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var filterControls = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var emptyNote = document.querySelector('[data-empty-note]');

  function clean(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters() {
    if (!filterControls.length || !cards.length) {
      return;
    }

    var queryControl = document.querySelector('[data-filter="query"]');
    var yearControl = document.querySelector('[data-filter="year"]');
    var typeControl = document.querySelector('[data-filter="type"]');
    var regionControl = document.querySelector('[data-filter="region"]');
    var query = clean(queryControl && queryControl.value);
    var year = clean(yearControl && yearControl.value);
    var type = clean(typeControl && typeControl.value);
    var region = clean(regionControl && regionControl.value);
    var visible = 0;

    cards.forEach(function (card) {
      var search = clean(card.getAttribute('data-search'));
      var cardYear = clean(card.getAttribute('data-year'));
      var cardType = clean(card.getAttribute('data-type'));
      var cardRegion = clean(card.getAttribute('data-region'));
      var matched = true;

      if (query && search.indexOf(query) === -1) {
        matched = false;
      }
      if (year && cardYear.indexOf(year) === -1) {
        matched = false;
      }
      if (type && cardType.indexOf(type) === -1) {
        matched = false;
      }
      if (region && cardRegion.indexOf(region) === -1) {
        matched = false;
      }

      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });

    if (emptyNote) {
      emptyNote.classList.toggle('visible', visible === 0);
    }
  }

  filterControls.forEach(function (control) {
    control.addEventListener('input', applyFilters);
    control.addEventListener('change', applyFilters);
  });
})();

function initVideoPlayer(config) {
  var video = document.getElementById(config.videoId);
  var button = document.getElementById(config.buttonId);
  var overlay = document.getElementById(config.overlayId);
  var attached = false;
  var hls = null;

  if (!video) {
    return;
  }

  function attach() {
    if (attached) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = config.source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls();
      hls.loadSource(config.source);
      hls.attachMedia(video);
    } else {
      video.src = config.source;
    }

    attached = true;
  }

  function start() {
    attach();
    video.controls = true;

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      start();
    });
  }

  if (overlay) {
    overlay.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (!attached || video.paused) {
      start();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls && typeof hls.destroy === 'function') {
      hls.destroy();
    }
  });
}
