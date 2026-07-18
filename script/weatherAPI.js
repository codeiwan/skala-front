export async function getLiveWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`날씨 서버 응답 오류: ${response.status}`);

    const data = await response.json();
    if (!data.current) throw new Error('현재 날씨 데이터가 없습니다.');

    return {
      temp: data.current.temperature_2m,
      humidity: data.current.relative_humidity_2m
    };
  } catch (error) {
    console.error('날씨 API 오류:', error);
    return null;
  }
}
