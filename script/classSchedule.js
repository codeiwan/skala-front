/* ==========================================================================
   학습 시간표: 오늘 요일과 현재 수업 강조
   ========================================================================== */

const scheduleTable = document.querySelector('#weekly-schedule');
const scheduleCurrentTitle = document.querySelector('#schedule-current-title');
const scheduleCurrentDescription = document.querySelector('#schedule-current-description');
const scheduleCurrentDate = document.querySelector('#schedule-current-date');
const scheduleCurrentTime = document.querySelector('#schedule-current-time');

if (
  scheduleTable &&
  scheduleCurrentTitle &&
  scheduleCurrentDescription &&
  scheduleCurrentDate &&
  scheduleCurrentTime
) {
  const weekdayNames =
    ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

  const bodyRows = Array.from(scheduleTable.tBodies[0].rows);
  const headerCells = Array.from(scheduleTable.tHead.rows[0].cells);

  /*
    rowspan과 colspan이 있는 표를 실제 화면의 행·열 구조로 변환합니다.

    예:
    Vue.js 셀이 rowspan="3"이면
    09시, 10시, 11시의 월요일 위치가 모두 같은 셀을 가리킵니다.
  */
  const scheduleGrid = createScheduleGrid(bodyRows);

  updateScheduleHighlight();

  // 시간이 바뀌면 강조 상태와 시계를 갱신합니다.
  window.setInterval(updateScheduleHighlight, 60 * 1000);

  function updateScheduleHighlight() {
    const now = new Date();
    const currentDay = now.getDay();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const isWeekday = currentDay >= 1 && currentDay <= 5;

    clearScheduleHighlight();
    updateClock(now);

    /*
      JavaScript의 요일 번호:
      월요일 1 ~ 금요일 5

      표의 논리 열 번호도:
      시간 0, 월요일 1 ~ 금요일 5
    */
    if (isWeekday) {
      highlightTodayColumn(currentDay);
    }

    const currentRowIndex = findCurrentTimeRow(currentMinutes);

    if (!isWeekday) {
      showWeekendMessage(now);
      return;
    }

    if (currentRowIndex === -1) {
      showOutsideClassMessage(currentMinutes, currentDay);
      return;
    }

    const currentRow = bodyRows[currentRowIndex];
    const timeCell = currentRow.cells[0];
    const currentClassCell = scheduleGrid[currentRowIndex][currentDay];

    timeCell.classList.add('is-current-time');

    if (currentClassCell) {
      currentClassCell.classList.add('is-current-class');
    }

    showCurrentClassMessage(
      currentDay,
      timeCell,
      currentClassCell
    );
  }


  /* ==========================================================================
     오늘 요일 열 강조
     ========================================================================== */

  function highlightTodayColumn(dayColumn) {
    const todayHeader = headerCells[dayColumn];

    if (todayHeader) {
      todayHeader.classList.add('is-today-column');
    }

    const todayCells = new Set();

    scheduleGrid.forEach(
      function (row) {
        const cell = row[dayColumn];

        /*
          점심시간처럼 여러 요일을 한 번에 차지하는 colspan 셀은
          오늘 열 배경을 적용하면 전체 행이 칠해지므로 제외합니다.
          현재 시간이 점심시간이면 별도의 현재 일정 강조가 적용됩니다.
        */
        if (cell && cell.colSpan === 1) {
          todayCells.add(cell);
        }
      }
    );

    todayCells.forEach(
      function (cell) {
        cell.classList.add('is-today-column');
      }
    );
  }


  /* ==========================================================================
     현재 시간 행 찾기
     ========================================================================== */

  function findCurrentTimeRow(currentMinutes) {
    return bodyRows.findIndex(
      function (row) {
        const timeText = row.cells[0].textContent.trim();
        const timeRange = parseTimeRange(timeText);

        if (!timeRange) {
          return false;
        }

        return (
          currentMinutes >=
          timeRange.start &&
          currentMinutes <
          timeRange.end
        );
      }
    );
  }


  function parseTimeRange(timeText) {
    const matchedTime =
      timeText.match(
        /(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/
      );

    if (!matchedTime) {
      return null;
    }

    const start =
      Number(matchedTime[1]) * 60 +
      Number(matchedTime[2]);

    const end =
      Number(matchedTime[3]) * 60 +
      Number(matchedTime[4]);

    return { start, end };
  }


  /* ==========================================================================
     상태 패널 문구
     ========================================================================== */

  function showCurrentClassMessage(currentDay, timeCell, currentClassCell) {
    const className = getCellText(currentClassCell);
    const timeRange = timeCell.textContent.trim();

    if (currentClassCell && currentClassCell.closest('.lunch-row')) {
      scheduleCurrentTitle.textContent = '현재는 점심시간입니다.';
      scheduleCurrentDescription.textContent = `${weekdayNames[currentDay]} · ${timeRange}`;
      return;
    }

    scheduleCurrentTitle.textContent = className ? `${className} 진행 중` : '현재 진행 중인 일정이 없습니다.';
    scheduleCurrentDescription.textContent = `${weekdayNames[currentDay]} · ${timeRange}`;
  }


  function showOutsideClassMessage(currentMinutes, currentDay) {
    const firstClassStart = 9 * 60;
    const lastClassEnd = 18 * 60;

    if (currentMinutes < firstClassStart) {
      scheduleCurrentTitle.textContent = '오늘 수업 시작 전입니다.';
      scheduleCurrentDescription.textContent = `${weekdayNames[currentDay]} 첫 일정은 오전 9시에 시작합니다.`;
      return;
    }

    if (currentMinutes >= lastClassEnd) {
      scheduleCurrentTitle.textContent = '오늘의 학습 일정이 종료되었습니다.';
      scheduleCurrentDescription.textContent = `${weekdayNames[currentDay]} 일정을 마무리하고 학습 내용을 정리해 보세요.`;
      return;
    }

    scheduleCurrentTitle.textContent = '현재 진행 중인 수업이 없습니다.';
    scheduleCurrentDescription.textContent = `${weekdayNames[currentDay]} 다음 일정을 확인해 주세요.`;
  }


  function showWeekendMessage(now) {
    scheduleCurrentTitle.textContent = '오늘은 정규 학습 일정이 없습니다.';
    scheduleCurrentDescription.textContent = `${weekdayNames[now.getDay()]} · 주간 시간표는 월요일부터 금요일까지 운영됩니다.`;
  }


  /* ==========================================================================
     날짜와 시계
     ========================================================================== */

  function updateClock(now) {
    scheduleCurrentDate.textContent =
      new Intl.DateTimeFormat('ko-KR',
        {
          month: 'long',
          day: 'numeric',
          weekday: 'short'
        }
      ).format(now);

    scheduleCurrentTime.textContent =
      new Intl.DateTimeFormat('ko-KR',
        {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }
      ).format(now);
  }


  /* ==========================================================================
     기존 강조 상태 제거
     ========================================================================== */

  function clearScheduleHighlight() {
    scheduleTable.querySelectorAll('.is-today-column, ' + '.is-current-time, ' + '.is-current-class')
      .forEach(
        function (cell) {
          cell.classList.remove('is-today-column', 'is-current-time', 'is-current-class');
        }
      );
  }


  /* ==========================================================================
     rowspan과 colspan을 반영한 논리 표 생성
     ========================================================================== */

  function createScheduleGrid(rows) {
    const grid = [];


    rows.forEach(
      function (row, rowIndex) {
        if (!grid[rowIndex]) {
          grid[rowIndex] = [];
        }

        let columnIndex = 0;

        Array.from(row.cells).forEach(
          function (cell) {
            /*
              이전 행의 rowspan 셀이 현재 위치를 차지하고 있으면
              비어 있는 다음 논리 열로 이동합니다.
            */
            while (grid[rowIndex][columnIndex]) {
              columnIndex += 1;
            }

            const rowSpan = cell.rowSpan || 1;
            const columnSpan = cell.colSpan || 1;

            for (let rowOffset = 0; rowOffset < rowSpan; rowOffset += 1) {
              const targetRow = rowIndex + rowOffset;

              if (!grid[targetRow]) {
                grid[targetRow] = [];
              }

              for (let columnOffset = 0; columnOffset < columnSpan; columnOffset += 1) {
                grid[targetRow][columnIndex + columnOffset] = cell;
              }
            }

            columnIndex += columnSpan;
          }
        );
      }
    );

    return grid;
  }


  function getCellText(cell) {
    if (!cell) {
      return '';
    }

    return cell.textContent.replace(/\s+/g, ' ').trim();
  }
}
