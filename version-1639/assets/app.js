(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var searchInput = document.querySelector('[data-search]');
  if (searchInput) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    searchInput.addEventListener('input', function () {
      var value = searchInput.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = [card.getAttribute('data-title'), card.getAttribute('data-tags'), card.getAttribute('data-year')].join(' ').toLowerCase();
        card.style.display = text.indexOf(value) === -1 ? 'none' : '';
      });
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function restart() {
      if (timer) window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    show(0);
    restart();
  }

  var player = document.querySelector('[data-player]');
  if (player) {
    var video = player.querySelector('[data-video]');
    var start = player.querySelector('.player-start');
    var hlsInstance = null;

    function prepare() {
      if (!video || video.getAttribute('data-ready') === '1') return;
      var stream = video.getAttribute('data-stream');
      if (!stream) return;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }

      video.setAttribute('data-ready', '1');
      video.setAttribute('controls', 'controls');
    }

    function play() {
      prepare();
      if (!video) return;
      if (start) start.hidden = true;
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          if (start) start.hidden = false;
        });
      }
    }

    if (start) {
      start.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.getAttribute('data-ready') !== '1') play();
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance && hlsInstance.destroy) hlsInstance.destroy();
    });
  }
})();
