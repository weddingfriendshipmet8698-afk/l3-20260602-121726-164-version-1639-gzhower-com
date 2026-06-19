(function () {
    const toggle = document.querySelector('[data-mobile-toggle]');
    const panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    const slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        const slides = Array.from(slider.querySelectorAll('.hero-slide'));
        const dots = Array.from(slider.querySelectorAll('.hero-dot'));
        let index = 0;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                show(index + 1);
            }, 5200);
        }
    }

    const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
    const searchInput = document.querySelector('[data-role="movie-search"]');
    const sortSelect = document.querySelector('[data-role="movie-sort"]');
    const categorySelect = document.querySelector('[data-role="movie-category"]');
    const emptyState = document.querySelector('[data-empty-state]');

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function cardText(card) {
        return normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.textContent
        ].join(' '));
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }

        const query = normalize(searchInput ? searchInput.value : '');
        const selectedCategory = categorySelect ? categorySelect.value : 'all';
        let visible = 0;

        cards.forEach(function (card) {
            const categoryMatch = selectedCategory === 'all' || card.getAttribute('data-category') === selectedCategory;
            const searchMatch = !query || cardText(card).indexOf(query) !== -1;
            const matched = categoryMatch && searchMatch;
            card.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('is-visible', visible === 0);
        }
    }

    function applySort() {
        if (!sortSelect || !cards.length) {
            applyFilters();
            return;
        }

        const mode = sortSelect.value;
        const parent = cards[0].parentElement;
        const sorted = cards.slice();

        sorted.sort(function (a, b) {
            if (mode === 'views') {
                return Number(b.getAttribute('data-views') || 0) - Number(a.getAttribute('data-views') || 0);
            }
            if (mode === 'likes') {
                return Number(b.getAttribute('data-likes') || 0) - Number(a.getAttribute('data-likes') || 0);
            }
            if (mode === 'year') {
                return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
            }
            if (mode === 'title') {
                return String(a.getAttribute('data-title') || '').localeCompare(String(b.getAttribute('data-title') || ''), 'zh-Hans-CN');
            }
            return 0;
        });

        sorted.forEach(function (card) {
            parent.appendChild(card);
        });

        applyFilters();
    }

    if (searchInput || sortSelect || categorySelect) {
        const urlQuery = new URLSearchParams(window.location.search).get('q');
        if (searchInput && urlQuery) {
            searchInput.value = urlQuery;
        }
        if (searchInput) {
            searchInput.addEventListener('input', applyFilters);
        }
        if (categorySelect) {
            categorySelect.addEventListener('change', applyFilters);
        }
        if (sortSelect) {
            sortSelect.addEventListener('change', applySort);
        }
        applySort();
    }
})();

function initMoviePlayer(videoId, coverId, src) {
    const video = document.getElementById(videoId);
    const cover = document.getElementById(coverId);
    let started = false;
    let hls = null;

    if (!video) {
        return;
    }

    function bind() {
        if (started) {
            return;
        }
        started = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(src);
            hls.attachMedia(video);
        } else {
            video.src = src;
        }
    }

    function play() {
        bind();
        video.setAttribute('controls', 'controls');
        if (cover) {
            cover.classList.add('is-hidden');
        }
        const attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
            attempt.catch(function () {});
        }
    }

    if (cover) {
        cover.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            play();
        }
    });

    video.addEventListener('play', function () {
        if (cover) {
            cover.classList.add('is-hidden');
        }
    });

    video.addEventListener('error', function () {
        if (hls) {
            hls.destroy();
            hls = null;
            started = false;
        }
    });
}
