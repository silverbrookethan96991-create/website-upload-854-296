(function () {
    function initPlayer(box) {
        var video = box.querySelector('video[data-src]');
        var cover = box.querySelector('[data-play-cover]');
        var button = box.querySelector('[data-play-button]');
        var hls = null;
        var isReady = false;

        if (!video) {
            return;
        }

        function bind() {
            var src = video.getAttribute('data-src');
            if (!src || isReady) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(src);
                hls.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
            }

            isReady = true;
        }

        function hideCover() {
            if (cover) {
                cover.classList.add('is-hidden');
            }
        }

        function showCover() {
            if (cover && video.paused && !video.currentTime) {
                cover.classList.remove('is-hidden');
            }
        }

        function play() {
            bind();
            hideCover();
            var attempt = video.play();
            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function () {
                    if (cover) {
                        cover.classList.remove('is-hidden');
                    }
                });
            }
        }

        function toggle() {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        }

        if (cover) {
            cover.addEventListener('click', play);
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.stopPropagation();
                play();
            });
        }

        video.addEventListener('click', toggle);
        video.addEventListener('play', hideCover);
        video.addEventListener('pause', showCover);
        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    }

    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function () {
        Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initPlayer);
    });
}());
