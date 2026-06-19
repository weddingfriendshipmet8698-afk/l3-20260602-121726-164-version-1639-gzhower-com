(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  }

  ready(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var navMenu = document.querySelector('[data-nav-menu]');

    if (navToggle && navMenu) {
      navToggle.addEventListener('click', function () {
        navMenu.classList.toggle('is-open');
      });
    }

    var backTop = document.querySelector('[data-back-top]');

    if (backTop) {
      window.addEventListener('scroll', function () {
        if (window.scrollY > 320) {
          backTop.classList.add('is-visible');
        } else {
          backTop.classList.remove('is-visible');
        }
      });

      backTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    var catalogs = document.querySelectorAll('[data-catalog]');

    catalogs.forEach(function (catalog) {
      var scope = catalog.parentElement || document;
      var input = catalog.querySelector('[data-search-input]');
      var selects = catalog.querySelectorAll('[data-filter-select]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
      var count = catalog.querySelector('[data-result-count]');
      var params = new URLSearchParams(window.location.search);
      var queryFromUrl = params.get('q');

      if (input && queryFromUrl) {
        input.value = queryFromUrl;
      }

      function fillOptions(name) {
        var select = catalog.querySelector('[data-filter-select="' + name + '"]');
        if (!select || select.options.length > 1) {
          return;
        }

        var values = cards
          .map(function (card) { return card.getAttribute('data-' + name) || ''; })
          .filter(Boolean)
          .filter(function (value, index, arr) { return arr.indexOf(value) === index; })
          .sort(function (a, b) {
            if (name === 'year') {
              return Number(b) - Number(a);
            }
            return a.localeCompare(b, 'zh-CN');
          });

        values.forEach(function (value) {
          var option = document.createElement('option');
          option.value = value;
          option.textContent = value;
          select.appendChild(option);
        });
      }

      fillOptions('type');
      fillOptions('year');

      function applyFilters() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var visible = 0;

        cards.forEach(function (card) {
          var text = (card.getAttribute('data-search') || '').toLowerCase();
          var matches = !query || text.indexOf(query) !== -1;

          selects.forEach(function (select) {
            var value = select.value;
            var key = select.getAttribute('data-filter-select');
            if (value && card.getAttribute('data-' + key) !== value) {
              matches = false;
            }
          });

          if (matches) {
            card.classList.remove('is-hidden');
            visible += 1;
          } else {
            card.classList.add('is-hidden');
          }
        });

        if (count) {
          count.textContent = '当前显示 ' + visible + ' 部影片';
        }
      }

      if (input) {
        input.addEventListener('input', applyFilters);
      }

      selects.forEach(function (select) {
        select.addEventListener('change', applyFilters);
      });

      applyFilters();
    });
  });
})();
