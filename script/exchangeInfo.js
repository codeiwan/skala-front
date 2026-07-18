/* ==========================================================================
   한국 원화 환율 대시보드
   ========================================================================== */

const exchangeRefreshButton = document.querySelector('#exchange-refresh');
const exchangeStatus = document.querySelector('#exchange-status');
const usdRateElement = document.querySelector('#exchange-rate-usd');
const jpyRateElement = document.querySelector('#exchange-rate-jpy');
const eurRateElement = document.querySelector('#exchange-rate-eur');
const exchangeConverter = document.querySelector('#exchange-converter');
const exchangeAmountInput = document.querySelector('#exchange-amount');
const exchangeCurrencySelect = document.querySelector('#exchange-currency');
const exchangeResult = document.querySelector('#exchange-result');

if (
  exchangeRefreshButton &&
  exchangeStatus &&
  usdRateElement &&
  jpyRateElement &&
  eurRateElement &&
  exchangeConverter &&
  exchangeAmountInput &&
  exchangeCurrencySelect &&
  exchangeResult
) {
  let latestRates = null;

  const numberFormatter =
    new Intl.NumberFormat('ko-KR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

  exchangeRefreshButton.addEventListener('click', loadExchangeRates);
  exchangeConverter.addEventListener('input', updateConvertedAmount);
  exchangeConverter.addEventListener('change', updateConvertedAmount);

  loadExchangeRates();

  async function loadExchangeRates() {
    setExchangeLoading(true);

    try {
      /*
        EUR를 기준으로 KRW, USD, JPY를 한 번에 요청
        응답값을 이용해 다음 환율을 계산
        - USD → KRW
        - JPY → KRW
        - EUR → KRW
      */
      const params = new URLSearchParams({ base: 'EUR', quotes: 'KRW,USD,JPY' });
      const response = await fetch(`https://api.frankfurter.dev/v2/rates?${params}`);

      if (!response.ok) {
        throw new Error(`환율 서버 응답 오류: ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('환율 데이터 형식이 올바르지 않습니다.');
      }

      const rateMap = Object.fromEntries(
        data.map(function (item) { return [item.quote, item.rate]; })
      );

      if (!rateMap.KRW || !rateMap.USD || !rateMap.JPY) {
        throw new Error('필요한 통화 정보를 찾지 못했습니다.');
      }

      /*
        EUR 기준 교차 환율을 원화 기준으로 변환
      */
      latestRates = {
        USD: rateMap.KRW / rateMap.USD,
        JPY: rateMap.KRW / rateMap.JPY,
        EUR: rateMap.KRW
      };

      usdRateElement.textContent = formatWon(latestRates.USD);
      // 국내에서는 엔화 환율을 100엔 기준으로 표시
      jpyRateElement.textContent = formatWon(latestRates.JPY * 100);
      eurRateElement.textContent = formatWon(latestRates.EUR);

      const latestDate = data.map(function (item) {return item.date;}).sort().at(-1);

      exchangeStatus.textContent = `최신 기준환율 · ${formatDate(latestDate)}`;

      updateConvertedAmount();
    } catch (error) {
      console.error('환율 API 오류:', error);

      latestRates = null;

      usdRateElement.textContent = '조회 실패';
      jpyRateElement.textContent = '조회 실패';
      eurRateElement.textContent = '조회 실패';

      exchangeStatus.textContent = '환율 정보를 불러오지 못했습니다. 새로고침을 눌러 다시 시도해 주세요.';

      exchangeResult.textContent = '환율 정보를 불러온 후 계산할 수 있습니다.';
    } finally {
      setExchangeLoading(false);
    }
  }


  function updateConvertedAmount() {
    if (!latestRates) {
      return;
    }

    const amount = Number(exchangeAmountInput.value);

    const currency = exchangeCurrencySelect.value;

    if (!Number.isFinite(amount) || amount < 0) {
      exchangeResult.textContent = '0 이상의 올바른 금액을 입력해 주세요.';
      return;
    }

    const convertedAmount = amount * latestRates[currency];

    exchangeResult.textContent =
      `${numberFormatter.format(amount)} ${currency} ≈ ` +
      `${formatWon(convertedAmount)}`;
  }

  function setExchangeLoading(isLoading) {
    exchangeRefreshButton.disabled = isLoading;
    exchangeRefreshButton.textContent = isLoading ? '불러오는 중' : '새로고침';

    if (isLoading) {
      exchangeStatus.textContent = '최신 환율 정보를 불러오는 중입니다.';
    }
  }


  function formatWon(value) {
    return `₩${numberFormatter.format(value)}`;
  }


  function formatDate(dateText) {
    if (!dateText) {
      return '기준일 확인 불가';
    }

    const date = new Date(`${dateText}T00:00:00`);

    return new Intl.DateTimeFormat(
      'ko-KR',
      {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }
    ).format(date);
  }
}