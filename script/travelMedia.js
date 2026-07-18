/* ==========================================================================
   여행 페이지 커스텀 오디오·비디오 플레이어
   ========================================================================== */

const mediaPlayers = document.querySelectorAll('[data-media-player]');

mediaPlayers.forEach(
  function (player) {
    const media = player.querySelector('audio, video');
    const playButtons = player.querySelectorAll('[data-action="play"]');
    const muteButton = player.querySelector('[data-action="mute"]');
    const fullscreenButton = player.querySelector('[data-action="fullscreen"]');
    const progressInput = player.querySelector('[data-progress]');
    const currentTimeElement = player.querySelector('[data-current-time]');
    const durationElement = player.querySelector('[data-duration]');
    const statusElement = player.querySelector('[data-media-status]');
    const videoStage = player.querySelector('.video-stage');

    // 비디오 컨트롤 자동 숨김 타이머
    let hideControlsTimer = null;

    if (!media || playButtons.length === 0 || !progressInput) {
      return;
    }

    media.controls = false;
    player.classList.add('is-enhanced');

    playButtons.forEach(
      function (button) {
        button.addEventListener(
          'click',
          function () {
            togglePlayback(
              player,
              media
            );
          }
        );
      }
    );


    if (media.tagName === 'VIDEO') {
      media.addEventListener(
        'click',
        function () {
          togglePlayback(
            player,
            media
          );
        }
      );
    }


    if (muteButton) {
      muteButton.addEventListener(
        'click',
        function () {
          media.muted =
            !media.muted;
        }
      );
    }


    if (
      fullscreenButton &&
      videoStage
    ) {
      fullscreenButton.addEventListener(
        'click',
        function () {
          openFullscreen(videoStage);
        }
      );


      /*
        마우스가 영상 위로 들어오면 컨트롤을 즉시 표시합니다.
      */
      videoStage.addEventListener(
        'pointerenter',
        function () {
          clearTimeout(
            hideControlsTimer
          );

          player.classList.remove(
            'is-controls-hidden'
          );
        }
      );


      /*
        영상 밖으로 마우스가 나가고 재생 중이면
        1.4초 후 컨트롤을 숨깁니다.
      */
      videoStage.addEventListener(
        'pointerleave',
        function () {
          clearTimeout(
            hideControlsTimer
          );

          if (!media.paused) {
            hideControlsTimer =
              window.setTimeout(
                function () {
                  player.classList.add(
                    'is-controls-hidden'
                  );
                },
                1400
              );
          }
        }
      );


      /*
        터치 환경에서는 화면을 누르면 컨트롤을 표시하고,
        재생 중일 때 2.2초 뒤 다시 숨깁니다.
      */
      videoStage.addEventListener(
        'touchstart',
        function () {
          clearTimeout(
            hideControlsTimer
          );

          player.classList.remove(
            'is-controls-hidden'
          );

          if (!media.paused) {
            hideControlsTimer =
              window.setTimeout(
                function () {
                  player.classList.add(
                    'is-controls-hidden'
                  );
                },
                2200
              );
          }
        },
        {
          passive: true
        }
      );
    }


    progressInput.addEventListener(
      'input',
      function () {
        if (
          !Number.isFinite(media.duration) ||
          media.duration <= 0
        ) {
          return;
        }

        const progressRatio =
          Number(progressInput.value) / 100;

        media.currentTime =
          progressRatio * media.duration;
      }
    );


    media.addEventListener(
      'loadedmetadata',
      function () {
        updateTimeDisplay(
          media,
          currentTimeElement,
          durationElement
        );
      }
    );


    media.addEventListener(
      'durationchange',
      function () {
        updateTimeDisplay(
          media,
          currentTimeElement,
          durationElement
        );
      }
    );


    media.addEventListener(
      'timeupdate',
      function () {
        updateProgress(
          player,
          media,
          progressInput
        );

        updateTimeDisplay(
          media,
          currentTimeElement,
          durationElement
        );
      }
    );


    media.addEventListener(
      'play',
      function () {
        pauseOtherMedia(media);

        clearTimeout(
          hideControlsTimer
        );

        player.classList.add(
          'is-playing'
        );

        player.classList.remove(
          'is-controls-hidden'
        );

        setPlayButtons(
          playButtons,
          true,
          media.tagName
        );

        if (statusElement) {
          statusElement.textContent =
            'PLAYING';
        }
      }
    );


    media.addEventListener(
      'pause',
      function () {
        clearTimeout(
          hideControlsTimer
        );

        player.classList.remove(
          'is-playing',
          'is-controls-hidden'
        );

        setPlayButtons(
          playButtons,
          false,
          media.tagName
        );

        if (
          statusElement &&
          !media.ended
        ) {
          statusElement.textContent =
            media.currentTime > 0
              ? 'PAUSED'
              : 'READY';
        }
      }
    );


    media.addEventListener(
      'ended',
      function () {
        clearTimeout(
          hideControlsTimer
        );

        player.classList.remove(
          'is-playing',
          'is-controls-hidden'
        );

        setPlayButtons(
          playButtons,
          false,
          media.tagName
        );

        if (statusElement) {
          statusElement.textContent =
            'ENDED';
        }
      }
    );


    media.addEventListener(
      'volumechange',
      function () {
        if (!muteButton) {
          return;
        }

        const isMuted =
          media.muted ||
          media.volume === 0;

        muteButton.textContent =
          isMuted
            ? '🔇'
            : '🔊';

        muteButton.setAttribute(
          'aria-label',
          isMuted
            ? '소리 켜기'
            : '음소거'
        );
      }
    );


    updateTimeDisplay(
      media,
      currentTimeElement,
      durationElement
    );
  }
);


/* ==========================================================================
   재생과 정지
   ========================================================================== */

function togglePlayback(
  player,
  media
) {
  if (media.paused || media.ended) {
    media.play().catch(
      function (error) {
        console.error(
          '미디어 재생 오류:',
          error
        );
      }
    );

    return;
  }

  media.pause();
}


/*
  음악과 영상이 동시에 재생되지 않도록
  새 미디어를 재생하면 나머지를 정지합니다.
*/
function pauseOtherMedia(
  activeMedia
) {
  document
    .querySelectorAll('audio, video')
    .forEach(
      function (media) {
        if (
          media !== activeMedia &&
          !media.paused
        ) {
          media.pause();
        }
      }
    );
}


/* ==========================================================================
   재생 버튼 상태
   ========================================================================== */

function setPlayButtons(
  buttons,
  isPlaying,
  mediaType
) {
  const mediaName =
    mediaType === 'VIDEO'
      ? '영상'
      : '음악';

  buttons.forEach(
    function (button) {
      button.textContent =
        isPlaying
          ? '❚❚'
          : '▶';

      button.setAttribute(
        'aria-label',
        isPlaying
          ? `${mediaName} 일시정지`
          : `${mediaName} 재생`
      );
    }
  );
}


/* ==========================================================================
   진행률과 시간
   ========================================================================== */

function updateProgress(
  player,
  media,
  progressInput
) {
  if (
    !Number.isFinite(media.duration) ||
    media.duration <= 0
  ) {
    progressInput.value = 0;

    player.style.setProperty(
      '--media-progress',
      '0%'
    );

    return;
  }

  const progress =
    media.currentTime /
    media.duration *
    100;

  progressInput.value =
    progress;

  player.style.setProperty(
    '--media-progress',
    `${progress}%`
  );
}


function updateTimeDisplay(
  media,
  currentTimeElement,
  durationElement
) {
  if (currentTimeElement) {
    currentTimeElement.textContent =
      formatTime(media.currentTime);
  }

  if (durationElement) {
    durationElement.textContent =
      formatTime(media.duration);
  }
}


function formatTime(seconds) {
  if (!Number.isFinite(seconds)) {
    return '0:00';
  }

  const minutes =
    Math.floor(seconds / 60);

  const remainingSeconds =
    Math.floor(seconds % 60)
      .toString()
      .padStart(2, '0');

  return (
    `${minutes}:${remainingSeconds}`
  );
}


/* ==========================================================================
   전체화면
   ========================================================================== */

function openFullscreen(element) {
  if (document.fullscreenElement) {
    document.exitFullscreen();
    return;
  }

  if (element.requestFullscreen) {
    element.requestFullscreen();
  }
}
