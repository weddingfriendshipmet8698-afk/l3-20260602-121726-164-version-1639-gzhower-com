(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function setupMenu() {
    var button = document.querySelector('.menu-toggle');
    var links = document.querySelector('.nav-links');
    if (!button || !links) {
      return;
    }
    button.addEventListener('click', function () {
      links.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    if (slides.length < 2) {
      return;
    }
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }
    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function setupLocalFilter() {
    var input = document.querySelector('[data-local-filter]');
    var clear = document.querySelector('[data-clear-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-list] .movie-card'));
    if (!input || !cards.length) {
      return;
    }
    function apply() {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = card.getAttribute('data-search') || '';
        card.classList.toggle('is-hidden', keyword && haystack.indexOf(keyword) === -1);
      });
    }
    input.addEventListener('input', apply);
    if (clear) {
      clear.addEventListener('click', function () {
        input.value = '';
        apply();
      });
    }
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (box) {
      var video = box.querySelector('video');
      var button = box.querySelector('.player-start');
      var url = box.getAttribute('data-m3u8');
      var prepared = false;
      var hlsInstance = null;
      if (!video || !url) {
        return;
      }
      function prepare() {
        if (prepared) {
          return;
        }
        prepared = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
        } else {
          video.src = url;
        }
      }
      function play() {
        prepare();
        box.classList.add('is-playing');
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            box.classList.remove('is-playing');
          });
        }
      }
      if (button) {
        button.addEventListener('click', play);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        box.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          box.classList.remove('is-playing');
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function createCard(movie) {
    var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<article class="movie-card">' +
      '<a class="card-link" href="' + escapeAttr(movie.href) + '">' +
      '<div class="poster-wrap">' +
      '<img src="' + escapeAttr(movie.poster) + '" alt="' + escapeAttr(movie.title) + '" loading="lazy">' +
      '<span class="play-dot">▶</span>' +
      '</div>' +
      '<div class="card-body">' +
      '<h3>' + escapeHtml(movie.title) + '</h3>' +
      '<p>' + escapeHtml(movie.oneLine || '') + '</p>' +
      '<div class="meta-row"><span>' + escapeHtml(movie.region || '') + '</span><span>' + escapeHtml(movie.year || '') + '</span></div>' +
      '<div class="chip-row">' + tags + '</div>' +
      '</div>' +
      '</a>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  function setupGlobalSearch() {
    var data = window.MOVIE_INDEX || [];
    var input = document.getElementById('globalSearch');
    var button = document.getElementById('globalSearchButton');
    var regionSelect = document.getElementById('regionFilter');
    var typeSelect = document.getElementById('typeFilter');
    var yearSelect = document.getElementById('yearFilter');
    var results = document.getElementById('searchResults');
    var title = document.getElementById('searchTitle');
    if (!input || !results || !data.length) {
      return;
    }
    var regions = Array.from(new Set(data.map(function (m) { return m.region; }).filter(Boolean))).sort();
    var types = Array.from(new Set(data.map(function (m) { return m.type; }).filter(Boolean))).sort();
    var years = Array.from(new Set(data.map(function (m) { return String(m.year || ''); }).filter(Boolean))).sort().reverse();
    fillSelect(regionSelect, regions);
    fillSelect(typeSelect, types);
    fillSelect(yearSelect, years);
    var params = new URLSearchParams(window.location.search);
    if (params.get('q')) {
      input.value = params.get('q');
    }
    function matches(movie, keyword) {
      var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine, (movie.tags || []).join(' ')].join(' ').toLowerCase();
      return !keyword || haystack.indexOf(keyword) !== -1;
    }
    function apply() {
      var keyword = input.value.trim().toLowerCase();
      var region = regionSelect ? regionSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var filtered = data.filter(function (movie) {
        return matches(movie, keyword) &&
          (!region || movie.region === region) &&
          (!type || movie.type === type) &&
          (!year || String(movie.year) === year);
      }).slice(0, 120);
      results.innerHTML = filtered.map(createCard).join('');
      if (title) {
        title.textContent = filtered.length ? '找到 ' + filtered.length + ' 部影片' : '暂无匹配影片';
      }
    }
    input.addEventListener('input', apply);
    if (button) {
      button.addEventListener('click', apply);
    }
    [regionSelect, typeSelect, yearSelect].forEach(function (select) {
      if (select) {
        select.addEventListener('change', apply);
      }
    });
    apply();
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupLocalFilter();
    setupPlayers();
    setupGlobalSearch();
  });
}());
