/* ==========================================================================
   자바스크립트 천국 공통 입력·결과 모달
   ========================================================================== */

const utilityModal =
  document.querySelector('#utility-modal');

const utilityModalTitle =
  document.querySelector('#utility-modal-title');

const utilityModalDescription =
  document.querySelector('#utility-modal-description');

const utilityModalBody =
  document.querySelector('#utility-modal-body');

const utilityModalConfirm =
  document.querySelector('#utility-modal-confirm');

const utilityModalCancel =
  document.querySelector('#utility-modal-cancel');

const utilityModalCloseButtons =
  document.querySelectorAll('[data-utility-close]');

let utilityModalResolve = null;
let utilityModalMode = 'message';


/*
  숫자 입력이 필요한 기능에서 사용합니다.

  반환값:
  - 입력 완료: 숫자
  - 취소: null
*/
window.openNumberModal = function ({
  title,
  description,
  label,
  min,
  max,
  placeholder = ''
}) {
  return new Promise(function (resolve) {
    utilityModalResolve = resolve;
    utilityModalMode = 'number';

    utilityModalTitle.textContent = title;
    utilityModalDescription.textContent = description;

    utilityModalBody.innerHTML = `
      <div class="utility-modal-field">
        <label for="utility-modal-input">${label}</label>

        <input
          type="number"
          id="utility-modal-input"
          min="${min}"
          max="${max}"
          placeholder="${placeholder}"
          autocomplete="off"
        >

        <p class="utility-modal-help">
          ${min}부터 ${max} 사이의 숫자를 입력하세요.
        </p>

        <p
          id="utility-modal-error"
          class="utility-modal-error"
          aria-live="polite"
        ></p>
      </div>
    `;

    utilityModalCancel.hidden = false;
    utilityModalConfirm.textContent = '입력';

    openUtilityModal();

    const input =
      document.querySelector('#utility-modal-input');

    input.focus();

    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        confirmUtilityModal();
      }
    });
  });
};


/*
  결과나 안내 문구를 보여줄 때 사용합니다.
  확인 버튼을 누르면 Promise가 완료됩니다.
*/
window.openMessageModal = function ({
  title,
  description = '결과를 확인해 주세요.',
  message
}) {
  return new Promise(function (resolve) {
    utilityModalResolve = resolve;
    utilityModalMode = 'message';

    utilityModalTitle.textContent = title;
    utilityModalDescription.textContent = description;

    utilityModalBody.innerHTML = '';

    const messageElement =
      document.createElement('p');

    messageElement.className =
      'utility-modal-message';

    messageElement.textContent =
      message;

    utilityModalBody.append(messageElement);

    utilityModalCancel.hidden = true;
    utilityModalConfirm.textContent = '확인';

    openUtilityModal();
    utilityModalConfirm.focus();
  });
};


function openUtilityModal() {
  utilityModal.hidden = false;
  document.body.classList.add('modal-open');
}


function confirmUtilityModal() {
  if (utilityModalMode === 'message') {
    finishUtilityModal(true);
    return;
  }

  const input =
    document.querySelector('#utility-modal-input');

  const errorBox =
    document.querySelector('#utility-modal-error');

  const value =
    Number(input.value);

  const min =
    Number(input.min);

  const max =
    Number(input.max);

  if (
    input.value.trim() === '' ||
    !Number.isFinite(value) ||
    value < min ||
    value > max
  ) {
    errorBox.textContent =
      `${min}부터 ${max} 사이의 숫자를 입력해 주세요.`;

    input.focus();
    return;
  }

  finishUtilityModal(value);
}


function cancelUtilityModal() {
  finishUtilityModal(null);
}


function finishUtilityModal(result) {
  utilityModal.hidden = true;
  document.body.classList.remove('modal-open');

  utilityModalBody.replaceChildren();

  if (utilityModalResolve) {
    utilityModalResolve(result);
    utilityModalResolve = null;
  }
}


utilityModalConfirm.addEventListener(
  'click',
  confirmUtilityModal
);


utilityModalCancel.addEventListener(
  'click',
  cancelUtilityModal
);


utilityModalCloseButtons.forEach(
  function (button) {
    button.addEventListener(
      'click',
      cancelUtilityModal
    );
  }
);


document.addEventListener(
  'keydown',
  function (event) {
    if (
      event.key === 'Escape' &&
      utilityModal &&
      !utilityModal.hidden
    ) {
      cancelUtilityModal();
    }
  }
);
