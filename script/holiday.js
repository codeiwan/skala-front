/* ==========================================================================
   휴일 페이지: 현재 시간대 카드 자동 강조
   ========================================================================== */

/* ==========================================================================
   1. 현재 시간대 카드 자동 강조
   ========================================================================== */

const holidayCards = document.querySelectorAll('.day-card[data-period]');

function highlightCurrentPeriod() {
  const currentHour = new Date().getHours();

  let currentPeriod;

  if (currentHour >= 6 && currentHour < 12) {
    currentPeriod = 'morning';
  } else if (currentHour >= 12 && currentHour < 18) {
    currentPeriod = 'afternoon';
  } else {
    currentPeriod = 'night';
  }

  holidayCards.forEach(
    function (card) {
      const isCurrent = card.dataset.period === currentPeriod;

      card.classList.toggle('is-current', isCurrent);

      const statusBadge = card.querySelector('.day-card-status');

      if (statusBadge) {
        statusBadge.hidden = !isCurrent;
      }
    }
  );
}

highlightCurrentPeriod();

// 페이지를 오래 열어 두어도 시간대가 바뀌면 다시 강조합니다.
setInterval(highlightCurrentPeriod, 60 * 1000);
