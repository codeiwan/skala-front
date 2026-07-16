const storkGameModal =
  document.querySelector('#stork-game-modal');

const storkGamePlayer =
  document.querySelector('#stork-game-player');

let rufflePlayer = null;

function openStorkGame() {
  if (!storkGameModal || !storkGamePlayer) {
    console.error('황새 오래걷기 모달 요소를 찾을 수 없습니다.');
    return;
  }

  storkGameModal.hidden = false;
  document.body.classList.add('modal-open');

  if (!rufflePlayer) {
    loadStorkGame();
  }
}

function loadStorkGame() {
  if (!window.RufflePlayer) {
    storkGamePlayer.innerHTML = `
      <p class="game-error">
        게임 실행 프로그램을 불러오지 못했습니다.
      </p>
    `;

    console.error('RufflePlayer가 로드되지 않았습니다.');
    return;
  }

  const ruffle = window.RufflePlayer.newest();
  rufflePlayer = ruffle.createPlayer();

  rufflePlayer.style.width = '100%';
  rufflePlayer.style.height = '100%';

  storkGamePlayer.replaceChildren(rufflePlayer);

  rufflePlayer.load({
    url: '../media/walk-the-stork.swf',
    autoplay: 'on',
    unmuteOverlay: 'visible',
    backgroundColor: '#fff'
  });
}

function closeStorkGame() {
  if (!storkGameModal) {
    return;
  }

  storkGameModal.hidden = true;
  document.body.classList.remove('modal-open');

  if (rufflePlayer) {
    rufflePlayer.pause?.();
  }
}

function restartStorkGame() {
  if (!storkGamePlayer) {
    return;
  }

  rufflePlayer = null;
  storkGamePlayer.replaceChildren();
  loadStorkGame();
}

document.addEventListener('keydown', function (event) {
  if (
    event.key === 'Escape' &&
    storkGameModal &&
    !storkGameModal.hidden
  ) {
    closeStorkGame();
  }
});