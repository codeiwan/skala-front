import { getLiveWeather } from './weatherAPI.js';


/* ==========================================================================
   1. HTML 요소 가져오기
   ========================================================================== */

// 사용자가 도시를 선택하는 select 요소
const citySelect = document.querySelector('#city-select');

// 날씨 안내와 결과를 출력할 영역
const weatherBox = document.querySelector('#weather-box');


/*
  필요한 HTML 요소가 존재하지 않으면 날씨 기능을 실행할 수 없습니다.
  문제를 빠르게 확인할 수 있도록 콘솔에 명확한 오류를 발생시킵니다.
*/
if (!citySelect || !weatherBox) {
  throw new Error(
    '날씨 기능에 필요한 #city-select 또는 #weather-box 요소를 찾을 수 없습니다.'
  );
}


/* ==========================================================================
   2. 사용자가 도시를 선택했을 때 실행되는 핵심 코드
   ========================================================================== */

citySelect.addEventListener('change', async function () {
  /*
    select의 value 값을 가져옵니다.

    현재 위치:
    value="current"

    일반 도시:
    value="37.56,126.97"
  */
  const selectedValue = citySelect.value;

  /*
    현재 선택된 option에 표시된 텍스트를 가져옵니다.

    예:
    "대한민국 서울"
    "일본 도쿄"
    "프랑스 파리"
  */
  const selectedCityName =
    citySelect.options[citySelect.selectedIndex].textContent.trim();

  try {
    /*
      아래에서 최종적으로 사용할 위치 정보를 저장합니다.
    */
    let latitude;
    let longitude;
    let displayName;


    /* ----------------------------------------------------------------------
       2-1. 현재 위치를 선택한 경우
       ---------------------------------------------------------------------- */

    if (selectedValue === 'current') {
      // 위치 정보를 가져오는 동안 화면에 안내 문구를 표시합니다.
      showMessage(
        '현재 위치를 확인하는 중입니다. ⏳',
        'weather-loading'
      );

      /*
        브라우저의 위치 정보를 요청합니다.

        getCurrentPosition()은 Promise를 반환하기 때문에
        await를 사용해 위치 확인이 끝날 때까지 기다립니다.
      */
      const position = await getCurrentPosition();

      // 브라우저에서 받은 현재 위치의 위도와 경도
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;

      // 화면에 표시할 위치 이름
      displayName = '현재 위치';
    }


    /* ----------------------------------------------------------------------
       2-2. 서울, 도쿄, 파리처럼 지정된 도시를 선택한 경우
       ---------------------------------------------------------------------- */

    else {
      /*
        option의 value는 다음과 같은 문자열입니다.

        "37.56,126.97"

        쉼표를 기준으로 나누면 다음 배열이 만들어집니다.

        ["37.56", "126.97"]
      */
      const coordinates = selectedValue.split(',');

      /*
        split()으로 나눈 값은 문자열이므로
        Number()를 사용해 숫자로 변환합니다.
      */
      latitude = Number(coordinates[0]);
      longitude = Number(coordinates[1]);

      // option에 적힌 도시 이름을 그대로 사용합니다.
      displayName = selectedCityName;
    }


    /* ----------------------------------------------------------------------
       2-3. 위도와 경도가 올바른 숫자인지 검사
       ---------------------------------------------------------------------- */

    /*
      HTML의 value 값이 잘못 작성되어 있다면
      API에 정상적인 좌표를 전달할 수 없습니다.
    */
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      throw new Error('선택한 도시의 좌표가 올바르지 않습니다.');
    }


    /* ----------------------------------------------------------------------
       2-4. 날씨 API 호출
       ---------------------------------------------------------------------- */

    // API 응답을 기다리는 동안 로딩 상태를 표시합니다.
    showMessage(
      `${displayName} 날씨를 불러오는 중입니다.`,
      'weather-loading'
    );

    /*
      weatherAPI.js에서 가져온 getLiveWeather() 함수를 실행합니다.

      전달하는 값:
      - latitude: 위도
      - longitude: 경도

      반환받는 값:
      {
        temp: 현재 기온,
        humidity: 현재 습도
      }
    */
    const weatherInfo = await getLiveWeather(
      latitude,
      longitude
    );


    /* ----------------------------------------------------------------------
       2-5. API 요청에 실패한 경우
       ---------------------------------------------------------------------- */

    /*
      weatherAPI.js에서는 오류가 발생하면 null을 반환합니다.

      따라서 weatherInfo가 null이면
      날씨 데이터를 가져오지 못한 것으로 처리합니다.
    */
    if (!weatherInfo) {
      throw new Error('날씨 데이터를 불러오지 못했습니다.');
    }


    /* ----------------------------------------------------------------------
       2-6. 최종 날씨 결과 출력
       ---------------------------------------------------------------------- */

    showWeather(
      displayName,
      latitude,
      longitude,
      weatherInfo
    );
  } catch (error) {
    /*
      현재 위치 권한 거부, 위치 조회 실패,
      API 요청 실패 등의 오류가 모두 이곳으로 전달됩니다.
    */
    console.error('날씨 처리 중 오류:', error);

    // 오류 종류에 맞는 사용자 안내 문구를 가져옵니다.
    const errorMessage = getErrorMessage(error);

    // 오류 내용을 화면에 표시합니다.
    showMessage(
      errorMessage,
      'weather-error'
    );
  }
});


/* ==========================================================================
   3. 브라우저의 현재 위치 가져오기
   ========================================================================== */

/*
  navigator.geolocation.getCurrentPosition()은 원래 콜백 방식입니다.

  이를 Promise로 감싸면 이벤트 함수에서 다음처럼
  await를 사용할 수 있습니다.

  const position = await getCurrentPosition();
*/
function getCurrentPosition() {
  return new Promise(function (resolve, reject) {
    /*
      사용 중인 브라우저가 위치 기능을 지원하지 않는 경우
      Promise를 실패 상태로 처리합니다.
    */
    if (!navigator.geolocation) {
      reject(
        new Error('현재 브라우저는 위치 기능을 지원하지 않습니다.')
      );

      return;
    }

    /*
      위치 확인에 성공하면 resolve가 실행되고,
      실패하면 reject가 실행됩니다.
    */
    navigator.geolocation.getCurrentPosition(
      resolve,
      reject
    );
  });
}


/* ==========================================================================
   4. 안내, 로딩, 오류 메시지 출력
   ========================================================================== */

/*
  message:
  화면에 표시할 문구

  className:
  상태에 맞게 적용할 CSS 클래스

  예:
  showMessage(
    '날씨를 불러오는 중입니다.',
    'weather-loading'
  );
*/
function showMessage(message, className) {
  weatherBox.innerHTML = `
    <div class="${className}" role="status">
      ${message}
    </div>
  `;
}


/* ==========================================================================
   5. 최종 날씨 결과 출력
   ========================================================================== */

function showWeather(
  cityName,
  latitude,
  longitude,
  weatherInfo
) {
  weatherBox.innerHTML = `
    <article class="weather-card">
      <h4>${cityName} 실시간 날씨</h4>

      <p class="muted">
        위도 ${latitude.toFixed(2)} ·
        경도 ${longitude.toFixed(2)}
      </p>

      <div class="weather-values">
        <div class="weather-value">
          <span>현재 기온</span>
          <strong>${weatherInfo.temp}°C</strong>
        </div>

        <div class="weather-value">
          <span>현재 습도</span>
          <strong>${weatherInfo.humidity}%</strong>
        </div>
      </div>
    </article>
  `;
}


/* ==========================================================================
   6. 오류 종류에 맞는 안내 문구 반환
   ========================================================================== */

function getErrorMessage(error) {
  /*
    브라우저의 위치 API에서 제공하는 오류 코드입니다.

    1: 사용자가 위치 권한을 거부함
    2: 현재 위치를 확인할 수 없음
    3: 위치 확인 시간이 초과됨
  */

  if (error.code === 1) {
    return '위치 권한이 거부되었습니다. 브라우저 설정을 확인해 주세요.';
  }

  if (error.code === 2) {
    return '현재 위치 정보를 확인할 수 없습니다.';
  }

  if (error.code === 3) {
    return '현재 위치를 확인하는 시간이 초과되었습니다.';
  }

  /*
    위에서 throw new Error()로 직접 발생시킨 오류라면
    해당 Error 객체의 message를 그대로 표시합니다.
  */
  if (error.message) {
    return error.message;
  }

  // 어떤 오류인지 구분할 수 없을 때 사용하는 기본 문구
  return '날씨 정보를 처리하는 중 오류가 발생했습니다.';
}