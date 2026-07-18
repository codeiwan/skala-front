/* ==========================================================================
   메인 페이지: 숫자 야구 게임
   ========================================================================== */

const openBaseballButton = document.querySelector('#open-baseball-game');
const baseballModal = document.querySelector('#baseball-game-modal');
const baseballModalContent = document.querySelector('#baseball-modal-content');
const baseballModalBackdrop = document.querySelector('#baseball-modal-backdrop');
const baseballModalClose = document.querySelector('#baseball-modal-close');
const baseballCloseButton = document.querySelector('#baseball-close');
const baseballRestartButton = document.querySelector('#baseball-restart');
const baseballGameBoard = document.querySelector('#baseball-game-board');
const baseballComplete = document.querySelector('#baseball-complete');
const baseballForm = document.querySelector('#baseball-form');
const baseballInput = document.querySelector('#baseball-input');
const baseballSubmit = document.querySelector('#baseball-submit');
const baseballError = document.querySelector('#baseball-error');
const baseballStatus = document.querySelector('#baseball-status');
const baseballAttemptCount = document.querySelector('#baseball-attempt-count');
const baseballHistory = document.querySelector('#baseball-history');
const baseballAnswer = document.querySelector('#baseball-answer');
const baseballCompleteSummary = document.querySelector('#baseball-complete-summary');

let secretDigits = [];
let attemptCount = 0;
let isGameFinished = false;


/* ==========================================================================
   1. 숫자 야구 모달 열기와 닫기
   ========================================================================== */

openBaseballButton.addEventListener('click',
  function () {
    if (secretDigits.length === 0) {
      resetBaseballGame();
    }

    baseballModal.hidden = false;
    document.body.classList.add('modal-open');

    if (isGameFinished) {
      baseballRestartButton.focus();
    } else {
      baseballInput.focus();
    }
  }
);


function closeBaseballGame() {
  baseballModal.hidden = true;
  document.body.classList.remove('modal-open');
}


baseballModalBackdrop.addEventListener('click', closeBaseballGame);
baseballModalClose.addEventListener('click', closeBaseballGame);
baseballCloseButton.addEventListener('click', closeBaseballGame);
baseballRestartButton.addEventListener('click', resetBaseballGame);

document.addEventListener('keydown',
  function (event) {
    if (event.key === 'Escape' && !baseballModal.hidden) {
      closeBaseballGame();
    }
  }
);


/* ==========================================================================
   2. 사용자가 입력한 숫자 검사와 결과 계산
   ========================================================================== */

baseballForm.addEventListener('submit',
  function (event) {
    event.preventDefault();

    if (isGameFinished) {
      return;
    }

    const guessText = baseballInput.value.trim();

    if (!isValidGuess(guessText)) {
      baseballError.textContent = '1부터 9까지 서로 다른 숫자 세 개를 입력해 주세요.';
      baseballInput.focus();
      return;
    }

    baseballError.textContent = '';

    const guessDigits = guessText.split('').map(Number);
    const result = calculateBaseballResult(guessDigits);

    attemptCount += 1;

    baseballAttemptCount.textContent = attemptCount;

    addHistoryItem(guessText, result);

    if (result.strikes === 3) {
      finishBaseballGame();
      return;
    }

    if (result.strikes === 0 && result.balls === 0) {
      baseballStatus.textContent = '일치하는 숫자가 없습니다. 다른 숫자를 시도해 보세요.';
    } else {
      baseballStatus.textContent =
        `${result.strikes} 스트라이크, ` +
        `${result.balls} 볼입니다.`;
    }

    baseballInput.value = '';
    baseballInput.focus();
  }
);


function isValidGuess(guessText) {
  return (/^[1-9]{3}$/.test(guessText) && new Set(guessText).size === 3);
}


function calculateBaseballResult(guessDigits) {
  let strikes = 0;
  let balls = 0;

  guessDigits.forEach(
    function (digit, position) {
      if (secretDigits[position] === digit) {
        strikes += 1;
      } else if (secretDigits.includes(digit)) {
        balls += 1;
      }
    }
  );

  return {strikes, balls};
}


/* ==========================================================================
   3. 게임 완료 화면
   ========================================================================== */

function finishBaseballGame() {
  isGameFinished = true;

  baseballInput.disabled = true;
  baseballSubmit.disabled = true;

  baseballAnswer.textContent = secretDigits.join('');

  baseballCompleteSummary.textContent = `${attemptCount}번의 시도로 숫자 야구 게임을 완료했습니다.`;

  baseballGameBoard.hidden = true;
  baseballComplete.hidden = false;

  baseballModalContent.classList.add('is-complete');

  baseballRestartButton.focus();
}


/* ==========================================================================
   4. 새로운 정답 생성과 게임 초기화
   ========================================================================== */

function createSecretDigits() {
  const numberPool = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  for (let currentIndex = numberPool.length - 1; currentIndex > 0; currentIndex -= 1) {
    const randomIndex = Math.floor(Math.random() * (currentIndex + 1));
    [numberPool[currentIndex], numberPool[randomIndex]] = [numberPool[randomIndex], numberPool[currentIndex]];
  }

  return numberPool.slice(0, 3);
}


function resetBaseballGame() {
  secretDigits = createSecretDigits();

  attemptCount = 0;
  isGameFinished = false;

  baseballAttemptCount.textContent = '0';

  baseballStatus.textContent = '세 자리 숫자를 입력해 첫 번째 추리를 시작하세요.';

  baseballError.textContent = '';
  baseballInput.value = '';
  baseballInput.disabled = false;
  baseballSubmit.disabled = false;

  baseballHistory.innerHTML = `
    <li class="baseball-history-empty">
      아직 시도 기록이 없습니다.
    </li>
  `;

  baseballComplete.hidden = true;
  baseballGameBoard.hidden = false;

  baseballModalContent.classList.remove('is-complete');

  if (!baseballModal.hidden) {
    baseballInput.focus();
  }
}


/* ==========================================================================
   5. 시도 기록 화면에 추가
   ========================================================================== */

function addHistoryItem(guessText, result) {
  const emptyMessage = baseballHistory.querySelector('.baseball-history-empty');

  if (emptyMessage) {
    emptyMessage.remove();
  }

  const historyItem = document.createElement('li');
  const attemptNumber = document.createElement('span');
  const guessNumber = document.createElement('strong');
  const resultText = document.createElement('span');

  attemptNumber.className = 'baseball-history-number';
  guessNumber.className = 'baseball-history-guess';
  resultText.className = 'baseball-history-result';
  attemptNumber.textContent = `${attemptCount}회`;
  guessNumber.textContent = guessText;

  if (result.strikes === 0 && result.balls === 0) {
    resultText.textContent = 'OUT';
  } else {
    resultText.textContent = `${result.strikes}S ${result.balls}B`;
  }

  historyItem.append(attemptNumber, guessNumber, resultText);
  baseballHistory.prepend(historyItem);
}