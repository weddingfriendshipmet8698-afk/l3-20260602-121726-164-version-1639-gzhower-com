(function () {
  var configNode = document.getElementById('video-config');
  var video = document.getElementById('video-player');
  var layer = document.getElementById('play-layer');
  var button = document.getElementById('play-button');

  if (!configNode || !video || !layer || !button) {
    return;
  }

  var config = {};
  try {
    config = JSON.parse(configNode.textContent || '{}');
  } catch (error) {
    config = {};
  }

  var src = config.src || '';
  var attached = false;

  function attachSource() {
    if (attached || !src) {
      return;
    }
    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      return;
    }

    video.src = src;
  }

  function startPlayback() {
    attachSource();
    layer.classList.add('is-hidden');
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  button.addEventListener('click', startPlayback);
  layer.addEventListener('click', startPlayback);
  video.addEventListener('click', function () {
    if (!attached) {
      startPlayback();
    }
  });
})();
