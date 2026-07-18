import { getLiveWeather, searchCities } from './weatherAPI.js';


/* ==========================================================================
   1. 날씨 기능에 필요한 HTML 요소 가져오기
   ========================================================================== */

const weatherBox = document.querySelector('#weather-box');
const openCitySearchButton = document.querySelector('#open-city-search');
const currentLocationButton = document.querySelector('#current-location-button');

const weatherSearchDialog = document.querySelector('#weather-search-dialog');
const closeCitySearchButton = document.querySelector('#close-city-search');
const citySearchForm = document.querySelector('#city-search-form');
const citySearchInput = document.querySelector('#city-search-input');
const citySearchSubmit = document.querySelector('#city-search-submit');
const citySearchResults = document.querySelector('#city-search-results');

if (
  !weatherBox ||
  !openCitySearchButton ||
  !currentLocationButton ||
  !weatherSearchDialog ||
  !closeCitySearchButton ||
  !citySearchForm ||
  !citySearchInput ||
  !citySearchSubmit ||
  !citySearchResults
) {
  throw new Error('도시 검색 날씨 기능에 필요한 HTML 요소를 찾을 수 없습니다.');
}


/* ==========================================================================
   2. 도시 검색 모달 열기와 닫기
   ========================================================================== */

openCitySearchButton.addEventListener('click', function () {
  weatherSearchDialog.showModal();
  document.body.classList.add('modal-open');

  // 모달이 열린 뒤 바로 검색어를 입력할 수 있도록 포커스를 이동합니다.
  citySearchInput.focus();
});

closeCitySearchButton.addEventListener('click', function () {
  weatherSearchDialog.close();
});

// 모달의 어두운 바깥 영역을 클릭해도 닫히게 합니다.
weatherSearchDialog.addEventListener('click', function (event) {
  if (event.target === weatherSearchDialog) {
    weatherSearchDialog.close();
  }
});

// ESC 키 또는 close()로 모달이 닫히면 스크롤 잠금을 해제합니다.
weatherSearchDialog.addEventListener('close', function () {
  document.body.classList.remove('modal-open');
});


/* ==========================================================================
   3. 사용자가 입력한 도시 검색
   ========================================================================== */

citySearchForm.addEventListener('submit', async function (event) {
  event.preventDefault();

  const cityName = citySearchInput.value.trim();

  if (cityName.length < 2) {
    showCitySearchState('도시 이름을 두 글자 이상 입력해 주세요.', 'is-error');
    citySearchInput.focus();
    return;
  }

  showCitySearchState(`${cityName} 검색 결과를 불러오는 중입니다.`, 'is-loading');
  setCitySearchLoading(true);

  const cities = await searchCities(cityName);

  setCitySearchLoading(false);

  if (cities === null) {
    showCitySearchState('도시 검색 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.', 'is-error');
    return;
  }

  if (cities.length === 0) {
    showCitySearchState('일치하는 도시를 찾지 못했습니다. 다른 이름으로 검색해 보세요.');
    return;
  }

  showCitySearchResults(cities);
});


/* ==========================================================================
   4. 검색 결과에서 도시 선택
   ========================================================================== */

citySearchResults.addEventListener('click', function (event) {
  const resultButton = event.target.closest('.city-search-result');

  if (!resultButton) {
    return;
  }

  const location = {
    name: resultButton.dataset.name,
    region: resultButton.dataset.region,
    latitude: Number(resultButton.dataset.latitude),
    longitude: Number(resultButton.dataset.longitude)
  };

  weatherSearchDialog.close();
  loadWeather(location);
});


/* ==========================================================================
   5. 현재 위치 날씨 조회
   ========================================================================== */

currentLocationButton.addEventListener('click', async function () {
  showWeatherMessage('현재 위치를 확인하는 중입니다.', 'weather-loading');
  setWeatherButtonsDisabled(true);

  try {
    const position = await getCurrentPosition();

    const location = {
      name: '현재 위치',
      region: '브라우저에서 확인한 위치',
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };

    await loadWeather(location);
  } catch (error) {
    console.error('현재 위치 확인 오류:', error);
    showWeatherMessage(getErrorMessage(error), 'weather-error');
  } finally {
    setWeatherButtonsDisabled(false);
  }
});


/* ==========================================================================
   6. 선택한 위치의 날씨 불러오기
   ========================================================================== */

async function loadWeather(location) {
  if (
    !Number.isFinite(location.latitude) ||
    !Number.isFinite(location.longitude)
  ) {
    showWeatherMessage('선택한 도시의 좌표가 올바르지 않습니다.', 'weather-error');
    return;
  }

  showWeatherMessage(
    `${location.name} 날씨를 불러오는 중입니다.`,
    'weather-loading'
  );

  setWeatherButtonsDisabled(true);

  try {
    const weatherInfo = await getLiveWeather(
      location.latitude,
      location.longitude
    );

    if (!weatherInfo) {
      throw new Error('날씨 데이터를 불러오지 못했습니다.');
    }

    showWeather(location, weatherInfo);
  } catch (error) {
    console.error('날씨 조회 오류:', error);
    showWeatherMessage(getErrorMessage(error), 'weather-error');
  } finally {
    setWeatherButtonsDisabled(false);
  }
}


/* ==========================================================================
   7. 도시 검색 결과 화면 만들기
   ========================================================================== */

function showCitySearchResults(cities) {
  citySearchResults.replaceChildren();

  const resultList = document.createElement('ul');
  resultList.className = 'city-search-list';

  cities.forEach(function (city) {
    const listItem = document.createElement('li');
    const resultButton = document.createElement('button');
    const resultCopy = document.createElement('span');
    const resultName = document.createElement('strong');
    const resultRegion = document.createElement('span');
    const resultCoordinates = document.createElement('span');

    const regionText = [city.admin1, city.country]
      .filter(Boolean)
      .join(' · ');

    resultButton.type = 'button';
    resultButton.className = 'city-search-result';
    resultButton.dataset.name = city.name;
    resultButton.dataset.region = regionText || '지역 정보 없음';
    resultButton.dataset.latitude = city.latitude;
    resultButton.dataset.longitude = city.longitude;

    resultCopy.className = 'city-result-copy';
    resultName.className = 'city-result-name';
    resultRegion.className = 'city-result-region';
    resultCoordinates.className = 'city-result-coordinates';

    resultName.textContent = city.name;
    resultRegion.textContent = regionText || '지역 정보 없음';
    resultCoordinates.textContent = `${city.latitude.toFixed(2)}, ${city.longitude.toFixed(2)}`;

    resultCopy.append(resultName, resultRegion);
    resultButton.append(resultCopy, resultCoordinates);
    listItem.append(resultButton);
    resultList.append(listItem);
  });

  citySearchResults.append(resultList);
}


/* ==========================================================================
   8. 안내·로딩·오류 상태 출력
   ========================================================================== */

function showCitySearchState(message, stateClass = '') {
  citySearchResults.replaceChildren();

  const stateBox = document.createElement('div');
  stateBox.className = `city-search-state ${stateClass}`.trim();
  stateBox.textContent = message;

  citySearchResults.append(stateBox);
}

function showWeatherMessage(message, className) {
  weatherBox.innerHTML = `
    <div class="${className}" role="status">
      ${message}
    </div>
  `;
}


/* ==========================================================================
   9. 최종 날씨 결과 출력
   ========================================================================== */

function showWeather(location, weatherInfo) {
  weatherBox.innerHTML = `
    <article class="weather-card">
      <h4>${location.name} 실시간 날씨</h4>
      <p class="weather-card-region">${location.region}</p>

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


/* ==========================================================================
   10. 브라우저 현재 위치 가져오기
   ========================================================================== */

function getCurrentPosition() {
  return new Promise(function (resolve, reject) {
    if (!navigator.geolocation) {
      reject(new Error('현재 브라우저는 위치 기능을 지원하지 않습니다.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      reject,
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  });
}


/* ==========================================================================
   11. 버튼 상태와 오류 문구 관리
   ========================================================================== */

function setCitySearchLoading(isLoading) {
  citySearchInput.disabled = isLoading;
  citySearchSubmit.disabled = isLoading;
  citySearchSubmit.textContent = isLoading ? '검색 중' : '검색';
}

function setWeatherButtonsDisabled(isDisabled) {
  openCitySearchButton.disabled = isDisabled;
  currentLocationButton.disabled = isDisabled;
}

function getErrorMessage(error) {
  if (error.code === 1) {
    return '위치 권한이 거부되었습니다. 브라우저 설정을 확인해 주세요.';
  }

  if (error.code === 2) {
    return '현재 위치 정보를 확인할 수 없습니다.';
  }

  if (error.code === 3) {
    return '현재 위치를 확인하는 시간이 초과되었습니다.';
  }

  return error.message || '날씨 정보를 처리하는 중 오류가 발생했습니다.';
}
