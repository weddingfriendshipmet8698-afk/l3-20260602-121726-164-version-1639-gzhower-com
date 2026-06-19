(function () {
    var navToggle = document.querySelector('.nav-toggle');
    if (navToggle) {
        navToggle.addEventListener('click', function () {
            document.body.classList.toggle('nav-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var cards = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-card]'));
        var title = hero.querySelector('[data-hero-title]');
        var summary = hero.querySelector('[data-hero-summary]');
        var meta = hero.querySelector('[data-hero-meta]');
        var link = hero.querySelector('[data-hero-link]');
        var index = 0;

        function activate(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            cards.forEach(function (card, i) {
                card.classList.toggle('active', i === index);
            });
            var activeCard = cards[index];
            if (activeCard) {
                title.textContent = activeCard.dataset.title || '';
                summary.textContent = activeCard.dataset.summary || '';
                meta.innerHTML = activeCard.dataset.meta || '';
                link.href = activeCard.dataset.href || '#';
            }
        }

        cards.forEach(function (card, i) {
            card.addEventListener('click', function () {
                activate(i);
            });
        });

        if (slides.length > 0) {
            activate(0);
            window.setInterval(function () {
                activate(index + 1);
            }, 5200);
        }
    }

    var filterForm = document.querySelector('[data-filter-form]');
    if (filterForm) {
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
        var emptyTip = document.querySelector('[data-empty-tip]');
        var visibleLimit = parseInt(filterForm.dataset.initialLimit || '0', 10);
        var loadMore = document.querySelector('[data-load-more]');
        var visibleCount = visibleLimit || cards.length;

        function normalize(value) {
            return (value || '').toString().toLowerCase().trim();
        }

        function applyFilter(resetLimit) {
            var query = normalize(filterForm.querySelector('[name="q"]').value);
            var region = normalize(filterForm.querySelector('[name="region"]').value);
            var type = normalize(filterForm.querySelector('[name="type"]').value);
            var year = normalize(filterForm.querySelector('[name="year"]').value);
            var matched = 0;
            var shown = 0;

            if (resetLimit && visibleLimit) {
                visibleCount = visibleLimit;
            }

            cards.forEach(function (card) {
                var text = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.tags
                ].join(' '));
                var ok = true;
                if (query && text.indexOf(query) === -1) {
                    ok = false;
                }
                if (region && normalize(card.dataset.region).indexOf(region) === -1) {
                    ok = false;
                }
                if (type && normalize(card.dataset.type).indexOf(type) === -1) {
                    ok = false;
                }
                if (year && normalize(card.dataset.year) !== year) {
                    ok = false;
                }

                if (ok) {
                    matched += 1;
                    shown += 1;
                    card.style.display = shown <= visibleCount ? '' : 'none';
                } else {
                    card.style.display = 'none';
                }
            });

            if (emptyTip) {
                emptyTip.style.display = matched === 0 ? 'block' : 'none';
            }
            if (loadMore) {
                loadMore.style.display = matched > visibleCount ? 'block' : 'none';
            }
        }

        filterForm.addEventListener('input', function () {
            applyFilter(true);
        });
        filterForm.addEventListener('submit', function (event) {
            event.preventDefault();
            applyFilter(true);
        });
        if (loadMore) {
            loadMore.addEventListener('click', function () {
                visibleCount += visibleLimit || 60;
                applyFilter(false);
            });
        }

        var params = new URLSearchParams(window.location.search);
        if (params.has('q')) {
            filterForm.querySelector('[name="q"]').value = params.get('q') || '';
        }
        applyFilter(false);
    }

    var playButtons = document.querySelectorAll('[data-play-button]');
    playButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            var shell = button.closest('.video-shell');
            var video = shell ? shell.querySelector('video') : null;
            var overlay = shell ? shell.querySelector('.play-overlay') : null;
            if (!video) {
                return;
            }
            var source = video.dataset.src;
            if (!source) {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                if (!video._hlsInstance) {
                    var hls = new window.Hls();
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    video._hlsInstance = hls;
                }
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                video.src = source;
            }
            if (overlay) {
                overlay.classList.add('hidden');
            }
            video.controls = true;
            video.play().catch(function () {
                video.controls = true;
            });
        });
    });
})();
