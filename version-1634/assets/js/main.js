(function () {
  var button = document.querySelector('[data-menu-button]');
  var menu = document.querySelector('[data-menu]');

  if (button && menu) {
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dots button'));
    var index = 0;

    function showSlide(next) {
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

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }
  }

  var searchInput = document.querySelector('[data-site-search]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

  function applyFilter() {
    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var yearValue = yearFilter ? yearFilter.value : 'all';

    cards.forEach(function (card) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      var year = parseInt(card.getAttribute('data-year') || '0', 10);
      var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
      var yearMatch = true;

      if (yearValue !== 'all') {
        if (yearValue === '2020') {
          yearMatch = year > 0 && year <= 2020;
        } else {
          yearMatch = year === parseInt(yearValue, 10);
        }
      }

      card.classList.toggle('is-filtered-out', !(keywordMatch && yearMatch));
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilter);
  }

  if (yearFilter) {
    yearFilter.addEventListener('change', applyFilter);
  }
})();
