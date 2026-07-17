import { getLiveWeather } from './weatherAPI.js';

const citySelect = document.querySelector('#city-select');
const weatherBox = document.querySelector('#weather-box');

if (!citySelect || !weatherBox) {
  throw new Error(
    '[날씨 초기화 실패] #city-select 또는 #weather-box를 찾을 수 없습니다.'
  );
}

console.log('[날씨] realtimeInfo.js 실행 완료');

// 빠르게 도시를 바꿨을 때 이전 응답이 최신 화면을 덮지 않게 합니다.
let latestRequestId = 0;

citySelect.addEventListener('change', async function (event) {
  const selectElement = event.currentTarget;
  const selectedValue = selectElement.value;
  const requestId = ++latestRequestId;

  if (!selectedValue || selectedValue === 'none') {
    showState(
      'weather-placeholder',
      '도시를 선택하면 현재 기온과 습도를 표시합니다.'
    );
    return;
  }

  try {
    const location = selectedValue === 'current'
      ? await getCurrentLocation()
      : getSelectedCity(selectElement, selectedValue);

    if (requestId !== latestRequestId) return;

    showState(
      'weather-loading',
      `${location.name} 날씨를 불러오는 중입니다.`
    );

    const weatherInfo = await getLiveWeather(
      location.latitude,
      location.longitude
    );

    if (requestId !== latestRequestId) return;

    if (!weatherInfo) {
      throw new Error('WEATHER_LOAD_FAILED');
    }

    showWeather(location, weatherInfo);
  } catch (error) {
    if (requestId !== latestRequestId) return;

    console.error('[날씨 오류]', error);
    showState('weather-error', getErrorMessage(error));
  }
});

// select의 value="위도,경도"를 숫자로 변환합니다.
function getSelectedCity(selectElement, selectedValue) {
  const [latitudeText, longitudeText] = selectedValue.split(',');
  const latitude = Number(latitudeText);
  const longitude = Number(longitudeText);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error('INVALID_COORDINATES');
  }

  return {
    name: selectElement.options[
      selectElement.selectedIndex
    ].textContent.trim(),
    latitude,
    longitude
  };
}

// 브라우저의 현재 위치를 Promise 방식으로 가져옵니다.
function getCurrentLocation() {
  showState('weather-loading', '현재 위치를 확인하는 중입니다.');

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('GEOLOCATION_NOT_SUPPORTED'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          name: '현재 위치',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      reject,
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  });
}

// 기본 안내, 로딩, 오류 상태를 표시합니다.
function showState(className, message) {
  weatherBox.innerHTML = `
    <div class="${className}" role="status">${message}</div>
  `;
}

// 최종 날씨 결과를 표시합니다.
function showWeather(location, weatherInfo) {
  weatherBox.innerHTML = `
    <article class="weather-card">
      <h4>${location.name} 실시간 날씨</h4>

      <p class="muted">
        위도 ${location.latitude.toFixed(2)} ·
        경도 ${location.longitude.toFixed(2)}
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

function getErrorMessage(error) {
  if (error?.code === 1) {
    return '위치 권한이 거부되었습니다.';
  }

  if (error?.code === 2) {
    return '현재 위치를 확인할 수 없습니다.';
  }

  if (error?.code === 3) {
    return '현재 위치 확인 시간이 초과되었습니다.';
  }

  if (error?.message === 'INVALID_COORDINATES') {
    return '선택한 도시의 좌표가 올바르지 않습니다.';
  }

  if (error?.message === 'GEOLOCATION_NOT_SUPPORTED') {
    return '현재 브라우저는 위치 확인 기능을 지원하지 않습니다.';
  }

  return '날씨 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';
}