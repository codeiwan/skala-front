import { getLiveWeather } from './weatherAPI.js';

const citySelect = document.querySelector('#city-select');
const weatherBox = document.querySelector('#weather-box');

citySelect.addEventListener('change', async function(event) {

  console.log("선택된 옵션의 값:", event.target.value); // 디버깅용 로그

  const selectedValue = event.target.value;
  if (selectedValue === "none") {
    weatherBox.innerHTML = "<p>도시를 선택하세요.</p>";
    return;
  }

  if (selectedValue === "current") {
    weatherBox.innerHTML = "<p>현재 위치를 확인하는 중... ⏳</p>";

    try {
      // 현재 위치 좌표 가져오기
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      // 현재 위치 좌표를 이용해 실제 날씨 API 호출
      const weatherInfo = await getLiveWeather(lat, lon);
      if (weatherInfo) {
        weatherBox.innerHTML = `
          <div style="background-color: #e8f8f5; border-left: 5px solid #16a085; padding: 15px; margin-top: 10px;">
            <h4>모듈형 날씨 피드: 현재 위치</h4>
            <p>📍 위도: ${lat.toFixed(2)}, 경도: ${lon.toFixed(2)}</p>
            <p>🌡️ 기온: ${weatherInfo.temp}°C</p>
            <p>💧 습도: ${weatherInfo.humidity}%</p>
          </div>
        `;
      } else {
        weatherBox.innerHTML = "<p>현재 위치의 날씨 데이터를 불러오지 못했습니다.</p>";
      }
    } catch (error) {
      console.error("현재 위치 확인 오류:", error);
      weatherBox.innerHTML = "<p>현재 위치를 확인할 수 없습니다. 위치 권한을 확인해 주세요. ❌</p>";
    }

    return;
  }

  const coords = selectedValue.split(',');
  const cityName = citySelect.options[citySelect.selectedIndex].text;

  // [UX 개선] 서버에서 데이터를 가져오는 동안 로딩 표시 띄우기
  weatherBox.innerHTML = "<p>모듈을 통해 실시간 날씨 로딩 중... ⏳</p>";

  // 2. 수입해온 비동기 모듈 함수를 실행해 결과만 딱 받아옵니다. (코드가 훨씬 간결해집니다!)
  const weatherInfo = await getLiveWeather(coords[0], coords[1]);

  if (weatherInfo) {
    weatherBox.innerHTML = `
      <div style="background-color: #e8f8f5; border-left: 5px solid #16a085; padding: 15px; margin-top: 10px;">
        <h4>모듈형 날씨 피드: ${cityName}</h4>
        <p>🌡️ 기온: ${weatherInfo.temp}°C</p>
        <p>💧 습도: ${weatherInfo.humidity}%</p>
      </div>
    `;
  } else {
    weatherBox.innerHTML = "<p>데이터를 불러오지 못했습니다.</p>";
  }
});