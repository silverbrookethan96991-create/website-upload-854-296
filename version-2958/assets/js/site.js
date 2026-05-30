(function () {
  var header = document.getElementById("siteHeader");
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");
  var backTop = document.querySelector("[data-back-top]");

  function updateHeader() {
    if (header) {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    }
    if (backTop) {
      backTop.classList.toggle("is-visible", window.scrollY > 420);
    }
  }

  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      var isOpen = mobilePanel.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  if (backTop) {
    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  document.querySelectorAll(".search-form").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      var input = form.querySelector("input[name='q']");
      if (!input || input.value.trim() === "") {
        event.preventDefault();
        if (input) {
          input.focus();
        }
      }
    });
  });

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function startTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  var searchRoot = document.querySelector("[data-search-root]");
  if (searchRoot && window.SEARCH_MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var input = searchRoot.querySelector("input[name='q']");
    var summary = searchRoot.querySelector("[data-search-summary]");
    var results = searchRoot.querySelector("[data-search-results]");

    if (input) {
      input.value = query;
    }

    function normalize(value) {
      return String(value || "").toLowerCase();
    }

    function renderSearch() {
      if (!results || !summary) {
        return;
      }
      var normalized = normalize(query);
      var matched = normalized
        ? window.SEARCH_MOVIES.filter(function (movie) {
            var haystack = normalize([
              movie.title,
              movie.region,
              movie.year,
              movie.genre,
              movie.type,
              movie.oneLine,
              (movie.tags || []).join(" ")
            ].join(" "));
            return haystack.indexOf(normalized) !== -1;
          })
        : window.SEARCH_MOVIES.slice(0, 36);

      summary.textContent = query
        ? "找到 " + matched.length + " 个相关结果"
        : "输入关键词，或先浏览下方推荐内容";

      if (!matched.length) {
        results.innerHTML = '<div class="empty-state">没有找到匹配内容，换个关键词试试。</div>';
        return;
      }

      results.innerHTML = matched.slice(0, 120).map(function (movie) {
        var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
          return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return [
          '<article class="result-card">',
          '  <a href="' + escapeHtml(movie.url) + '"><img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy"></a>',
          '  <div>',
          '    <div class="result-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
          '    <h2><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h2>',
          '    <p>' + escapeHtml(movie.oneLine) + '</p>',
          '    <div class="tag-row">' + tags + '</div>',
          '  </div>',
          '</article>'
        ].join("");
      }).join("");
    }

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    renderSearch();
  }
})();
