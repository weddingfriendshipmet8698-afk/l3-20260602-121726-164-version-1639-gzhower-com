document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector(".menu-toggle");
  var nav = document.querySelector(".nav-links");
  if (menuButton && nav) {
    menuButton.addEventListener("click", function () {
      var opened = nav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  document.querySelectorAll("img").forEach(function (image) {
    image.addEventListener("error", function () {
      image.style.opacity = "0";
    });
  });

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var index = 0;
    function show(next) {
      if (!slides.length) return;
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  document.querySelectorAll("[data-card-search]").forEach(function (input) {
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-region"),
          card.textContent
        ].join(" ").toLowerCase();
        card.classList.toggle("is-filtered", query && text.indexOf(query) === -1);
      });
    });
  });

  document.querySelectorAll("[data-rank-search]").forEach(function (input) {
    var rows = Array.prototype.slice.call(document.querySelectorAll(".ranking-row"));
    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      rows.forEach(function (row) {
        var text = [
          row.getAttribute("data-title"),
          row.getAttribute("data-year"),
          row.getAttribute("data-genre"),
          row.getAttribute("data-region"),
          row.textContent
        ].join(" ").toLowerCase();
        row.classList.toggle("is-filtered", query && text.indexOf(query) === -1);
      });
    });
  });
});
