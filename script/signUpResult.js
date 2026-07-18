/* ==========================================================================
   회원가입 완료 페이지: 축하 애니메이션
   ========================================================================== */

const completionCard =
  document.querySelector(
    '.completion-card-animated'
  );

const confettiContainer =
  document.querySelector(
    '#completion-confetti'
  );


if (
  completionCard &&
  confettiContainer
) {
  requestAnimationFrame(
    function () {
      completionCard.classList.add(
        'is-visible'
      );
    }
  );


  const reducedMotion =
    window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;


  if (!reducedMotion) {
    createConfetti();
  }


  function createConfetti() {
    const particleCount = 24;


    for (
      let particleIndex = 0;
      particleIndex < particleCount;
      particleIndex += 1
    ) {
      const particle =
        document.createElement('span');

      particle.className =
        'completion-confetti-piece';

      particle.style.setProperty(
        '--confetti-left',
        `${Math.random() * 100}%`
      );

      particle.style.setProperty(
        '--confetti-delay',
        `${Math.random() * 0.45}s`
      );

      particle.style.setProperty(
        '--confetti-duration',
        `${1.8 + Math.random() * 1.2}s`
      );

      particle.style.setProperty(
        '--confetti-rotate',
        `${180 + Math.random() * 540}deg`
      );

      particle.dataset.color =
        String(
          particleIndex % 4
        );

      confettiContainer.append(
        particle
      );
    }


    window.setTimeout(
      function () {
        confettiContainer.replaceChildren();
      },
      3600
    );
  }
}
