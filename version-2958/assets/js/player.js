var MoviePlayer = (function () {
  function init(videoId, coverId, buttonId, sourceUrl) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var button = document.getElementById(buttonId);
    var hls = null;
    var started = false;

    if (!video || !cover || !button || !sourceUrl) {
      return;
    }

    function playVideo() {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    function attach() {
      if (started) {
        playVideo();
        return;
      }
      started = true;
      cover.classList.add("is-hidden");

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (!data || !data.fatal || !hls) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        video.load();
      } else {
        video.src = sourceUrl;
        playVideo();
      }
    }

    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      attach();
    });

    cover.addEventListener("click", function (event) {
      event.preventDefault();
      attach();
    });

    video.addEventListener("play", function () {
      cover.classList.add("is-hidden");
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  return {
    init: init
  };
})();
