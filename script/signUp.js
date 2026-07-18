/* ==========================================================================
   회원가입 페이지: 실시간 필수 입력 검증
   ========================================================================== */

const signupForm = document.querySelector('#signup-form');
const userIdInput = document.querySelector('#userId');
const userPasswordInput = document.querySelector('#userPw');
const userEmailInput = document.querySelector('#userEmail');
const userEmailDomain = document.querySelector('#userEmailDomain');
const userNameInput = document.querySelector('#userName');
const termsInput = document.querySelector('input[name="terms"]');
const privacyInput = document.querySelector('input[name="privacy"]');
const progressValue = document.querySelector('#signup-progress-value');
const progressMessage = document.querySelector('#signup-progress-message');
const progressTrack = document.querySelector('.signup-progress-track');
const progressBar = document.querySelector('#signup-progress-bar');
const submitButton = signupForm?.querySelector('button[type="submit"]');

if (
  signupForm &&
  userIdInput &&
  userPasswordInput &&
  userEmailInput &&
  userEmailDomain &&
  userNameInput &&
  termsInput &&
  privacyInput &&
  progressValue &&
  progressMessage &&
  progressTrack &&
  progressBar &&
  submitButton
) {
  const validationItems = [
    {
      key: 'userId',
      element: userIdInput,
      isValid: function () {
        return /^[A-Za-z0-9]{4,20}$/.test(
          userIdInput.value.trim()
        );
      }
    },
    {
      key: 'userPw',
      element: userPasswordInput,
      isValid: function () {
        const password =
          userPasswordInput.value;

        return (
          password.length >= 8 &&
          /[A-Za-z]/.test(password) &&
          /\d/.test(password) &&
          /[^A-Za-z0-9]/.test(password)
        );
      }
    },
    {
      key: 'email',
      element: userEmailInput,
      isValid: function () {
        return (
          /^[A-Za-z0-9._%+-]+$/.test(
            userEmailInput.value.trim()
          ) &&
          userEmailDomain.value !== ''
        );
      }
    },
    {
      key: 'userName',
      element: userNameInput,
      isValid: function () {
        return (
          userNameInput.value.trim().length >= 1
        );
      }
    },
    {
      key: 'terms',
      element: termsInput,
      isValid: function () {
        return (
          termsInput.checked &&
          privacyInput.checked
        );
      }
    }
  ];


  signupForm.addEventListener('input', updateSignupProgress);
  signupForm.addEventListener('change', updateSignupProgress);


  signupForm.addEventListener(
    'reset',
    function () {
      window.setTimeout(
        updateSignupProgress,
        0
      );
    }
  );


  signupForm.addEventListener(
    'submit',
    function (event) {
      event.preventDefault();

      const allValid =
        updateSignupProgress();

      if (!allValid) {
        const firstInvalid =
          validationItems.find(
            function (item) {
              return !item.isValid();
            }
          );

        progressMessage.textContent =
          '미완료 항목을 확인해 주세요.';

        if (firstInvalid) {
          firstInvalid.element.focus();
        }

        return;
      }

      /*
        정적 프로젝트이므로 비밀번호를 GET 쿼리스트링으로
        전송하지 않고 완료 페이지로 바로 이동합니다.
      */
      sessionStorage.setItem(
        'signupCompleted',
        'true'
      );

      window.location.href =
        signupForm.action;
    }
  );


  updateSignupProgress();


  function updateSignupProgress() {
    let completedCount = 0;


    validationItems.forEach(
      function (item) {
        const isComplete =
          item.isValid();

        const checkItem =
          document.querySelector(
            `[data-check="${item.key}"]`
          );

        if (isComplete) {
          completedCount += 1;
        }

        if (checkItem) {
          checkItem.classList.toggle(
            'is-complete',
            isComplete
          );

        }
      }
    );


    const progress =
      Math.round(
        completedCount /
        validationItems.length *
        100
      );

    progressValue.textContent =
      `${progress}%`;

    progressBar.style.width =
      `${progress}%`;

    progressTrack.setAttribute(
      'aria-valuenow',
      progress
    );


    if (progress === 100) {
      progressMessage.textContent =
        '모든 필수 항목이 준비되었습니다.';

      progressTrack.classList.add(
        'is-complete'
      );
    } else {
      progressMessage.textContent =
        `${validationItems.length - completedCount}개 필수 항목이 남았습니다.`;

      progressTrack.classList.remove(
        'is-complete'
      );
    }


    return (
      completedCount ===
      validationItems.length
    );
  }
}
