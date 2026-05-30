(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function escapeText(value) {
    return String(value || "").replace(/[&<>"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function initCarousel() {
    var carousel = document.querySelector("[data-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    var current = Math.max(0, slides.findIndex(function (slide) {
      return slide.classList.contains("active");
    }));

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    var nextButton = carousel.querySelector("[data-next-slide]");
    var prevButton = carousel.querySelector("[data-prev-slide]");
    if (nextButton) {
      nextButton.addEventListener("click", function () {
        show(current + 1);
      });
    }
    if (prevButton) {
      prevButton.addEventListener("click", function () {
        show(current - 1);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-go-slide")) || 0);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function initFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
    forms.forEach(function (form) {
      var input = form.querySelector("[data-filter-input]");
      var list = document.querySelector("[data-filter-list]");
      var empty = document.querySelector("[data-empty-message]");
      if (!input || !list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
      function apply() {
        var keyword = input.value.trim().toLowerCase();
        var shown = 0;
        cards.forEach(function (card) {
          var text = card.getAttribute("data-keywords") || "";
          var match = !keyword || text.indexOf(keyword) !== -1;
          card.style.display = match ? "" : "none";
          if (match) {
            shown += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("show", shown === 0);
        }
      }
      input.addEventListener("input", apply);
      form.addEventListener("reset", function () {
        window.setTimeout(apply, 0);
      });
    });
  }

  function initSearch() {
    var form = document.querySelector("[data-search-form]");
    var input = document.querySelector("[data-search-input]");
    var results = document.querySelector("[data-search-results]");
    var empty = document.querySelector("[data-search-empty]");
    if (!form || !input || !results || !window.SEARCH_DATA) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function cardTemplate(item) {
      var tags = (item.tags || []).slice(0, 3).map(function (tag) {
        return '<span class="tag">' + escapeText(tag) + '</span>';
      }).join("");
      return [
        '<article class="movie-card">',
        '  <a class="poster-link" href="' + item.file + '" aria-label="观看' + escapeText(item.title) + '">',
        '    <img src="./' + escapeText(item.cover) + '" alt="' + escapeText(item.title) + '" loading="lazy">',
        '    <span class="poster-gradient"></span>',
        '    <span class="poster-play">▶</span>',
        '  </a>',
        '  <div class="card-body">',
        '    <div class="card-meta"><span>' + escapeText(item.type) + '</span><span>' + escapeText(item.year) + '</span></div>',
        '    <h2><a href="' + item.file + '">' + escapeText(item.title) + '</a></h2>',
        '    <p>' + escapeText(item.oneLine) + '</p>',
        '    <div class="card-tags">' + tags + '</div>',
        '  </div>',
        '</article>'
      ].join("");
    }

    function runSearch() {
      var keyword = input.value.trim().toLowerCase();
      if (!keyword) {
        results.innerHTML = "";
        if (empty) {
          empty.textContent = "输入关键词即可查找影片。";
          empty.classList.add("show");
        }
        return;
      }
      var matches = window.SEARCH_DATA.filter(function (item) {
        return item.searchText.indexOf(keyword) !== -1;
      }).slice(0, 96);
      results.innerHTML = matches.map(cardTemplate).join("");
      if (empty) {
        empty.textContent = matches.length ? "" : "没有找到匹配影片。";
        empty.classList.toggle("show", matches.length === 0);
      }
      var nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set("q", input.value.trim());
      window.history.replaceState({}, "", nextUrl.toString());
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      runSearch();
    });
    input.addEventListener("input", runSearch);
    runSearch();
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var overlay = player.querySelector(".player-overlay");
      var status = player.querySelector(".player-status");
      var playTarget = document.querySelector("[data-play-target]");
      var streamUrl = video ? video.getAttribute("data-src") : "";
      var hlsInstance = null;
      var started = false;

      function setStatus(text) {
        if (status) {
          status.textContent = text || "";
        }
      }

      function markPlaying() {
        player.classList.add("is-playing");
      }

      function playVideo() {
        if (!video) {
          return;
        }
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.then(markPlaying).catch(function () {
            setStatus("点击视频区域继续播放");
          });
        } else {
          markPlaying();
        }
      }

      function start() {
        if (!video || !streamUrl) {
          setStatus("视频暂时不可用");
          return;
        }
        if (started) {
          playVideo();
          return;
        }
        started = true;
        setStatus("正在加载视频");
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            maxBufferLength: 30,
            enableWorker: true
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus("");
            playVideo();
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            } else {
              setStatus("播放暂时不可用");
              hlsInstance.destroy();
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
          video.addEventListener("loadedmetadata", function () {
            setStatus("");
            playVideo();
          }, { once: true });
          video.load();
        } else {
          video.src = streamUrl;
          video.load();
          playVideo();
        }
      }

      if (overlay) {
        overlay.addEventListener("click", start);
      }
      if (playTarget) {
        playTarget.addEventListener("click", start);
      }
      player.addEventListener("click", function (event) {
        if (event.target === player) {
          start();
        }
      });
      video.addEventListener("play", markPlaying);
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initCarousel();
    initFilters();
    initSearch();
    initPlayers();
  });
})();
