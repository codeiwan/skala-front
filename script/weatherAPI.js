export async function searchCities(cityName) {
  const params = new URLSearchParams({
    name: cityName,
    count: '8',
    language: 'ko',
    format: 'json'
  });

  const url = `https://geocoding-api.open-meteo.com/v1/search?${params}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`도시 검색 서버 응답 오류: ${response.status}`);
    }

    const data = await response.json();

    // 검색 결과가 없으면 빈 배열을 반환합니다.
    return data.results ?? [];
  } catch (error) {
    console.error('도시 검색 API 오류:', error);
    return null;
  }
}

export async function getLiveWeather(latitude, longitude) {
  const params = new URLSearchParams({
    latitude,
    longitude,
    current: 'temperature_2m,relative_humidity_2m'
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`날씨 서버 응답 오류: ${response.status}`);
    }

    const data = await response.json();

    if (!data.current) {
      throw new Error('현재 날씨 데이터가 없습니다.');
    }

    return {
      temp: data.current.temperature_2m,
      humidity: data.current.relative_humidity_2m
    };
  } catch (error) {
    console.error('날씨 API 오류:', error);
    return null;
  }
}
