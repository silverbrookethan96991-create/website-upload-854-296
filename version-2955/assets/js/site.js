
document.addEventListener("DOMContentLoaded", function () {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  const hero = document.querySelector("[data-hero]");
  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    let index = 0;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("active", current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("active", current === index);
      });
    }

    dots.forEach(function (dot, current) {
      dot.addEventListener("click", function () {
        show(current);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  }

  const scopes = Array.from(document.querySelectorAll("[data-filter-scope]"));
  const searchInputs = Array.from(document.querySelectorAll("[data-search-input]"));
  const filterButtons = Array.from(document.querySelectorAll("[data-filter-button]"));
  let activeFilter = "全部";

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function applyFilters() {
    const term = normalize(searchInputs.map(function (input) {
      return input.value;
    }).join(" "));

    scopes.forEach(function (scope) {
      const cards = Array.from(scope.querySelectorAll(".filter-card"));
      cards.forEach(function (card) {
        const haystack = normalize([
          card.getAttribute("data-search"),
          card.getAttribute("data-type"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-category")
        ].join(" "));
        const typeText = normalize(card.getAttribute("data-type"));
        const regionText = normalize(card.getAttribute("data-region"));
        const filterText = normalize(activeFilter);
        const termMatch = !term || haystack.indexOf(term) !== -1;
        const filterMatch = activeFilter === "全部" || typeText === filterText || regionText === filterText || haystack.indexOf(filterText) !== -1;
        card.classList.toggle("is-hidden", !(termMatch && filterMatch));
      });
    });
  }

  searchInputs.forEach(function (input) {
    input.addEventListener("input", applyFilters);
  });

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      activeFilter = button.getAttribute("data-filter-button") || "全部";
      filterButtons.forEach(function (other) {
        other.classList.toggle("active", other === button);
      });
      applyFilters();
    });
  });

  if (filterButtons.length) {
    filterButtons[0].classList.add("active");
  }
});
