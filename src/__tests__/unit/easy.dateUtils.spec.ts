import { Event } from '../../types';
import {
  fillZero,
  formatDate,
  formatMonth,
  formatWeek,
  getDaysInMonth,
  getEventsForDay,
  getWeekDates,
  getWeeksAtMonth,
  isDateInRange,
} from '../../utils/dateUtils';

describe('getDaysInMonth', () => {
  it('1월은 31일 수를 반환한다', () => {
    const daysInJanuary = getDaysInMonth(2025, 1); // 월은 index를 전달받기 때문에 0부터 시작 (0=1월)
    expect(daysInJanuary).toBe(31);
  });

  it('4월은 30일 일수를 반환한다', () => {
    const daysInApril = getDaysInMonth(2025, 4);
    expect(daysInApril).toBe(30);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    const daysInFebruaryLeapYear = getDaysInMonth(2024, 2);
    expect(daysInFebruaryLeapYear).toBe(29);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    const daysInFebruaryCommonYear = getDaysInMonth(2025, 2);
    expect(daysInFebruaryCommonYear).toBe(28);
  });

  it('12보다 큰 월은 연도를 증가시키고 월을 1부터 시작하는 월로 변환한다', () => {
    const daysInJanuary2025 = getDaysInMonth(2024, 13);
    expect(daysInJanuary2025).toBe(31);

    const daysInFebruary2025 = getDaysInMonth(2024, 12 + 2);
    expect(daysInFebruary2025).toBe(28);

    const daysInFebruary2024 = getDaysInMonth(2023, 12 + 2);
    expect(daysInFebruary2024).toBe(29);
  });

  it('1보다 작은 월은 연도를 감소시키고 월을 12부터 시작하는 월로 변환한다', () => {
    const daysInDecember2024 = getDaysInMonth(2025, 0);
    expect(daysInDecember2024).toBe(31);

    const daysInFebruary2025 = getDaysInMonth(2026, 2 - 12);
    expect(daysInFebruary2025).toBe(28);

    const daysInFebruary2024 = getDaysInMonth(2025, 2 - 12);
    expect(daysInFebruary2024).toBe(29);
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const wednesday = new Date('2025-02-05');

    const weekDates = getWeekDates(wednesday);

    expect(weekDates.length).toBe(7);
    expect(weekDates[0]).toEqual(new Date('2025-02-02')); // 일요일
    expect(weekDates[6]).toEqual(new Date('2025-02-08')); // 토요일
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const monday = new Date('2025-02-03');

    const weekDates = getWeekDates(monday);

    expect(weekDates.length).toBe(7);
    expect(weekDates[0]).toEqual(new Date('2025-02-02')); // 일요일
    expect(weekDates[6]).toEqual(new Date('2025-02-08')); // 토요일
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const sunday = new Date('2025-02-02');

    const weekDates = getWeekDates(sunday);

    expect(weekDates.length).toBe(7);
    expect(weekDates[0]).toEqual(new Date('2025-02-02')); // 일요일
    expect(weekDates[6]).toEqual(new Date('2025-02-08')); // 토요일
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const december31 = new Date('2025-12-31'); // 수요일

    const weekDates = getWeekDates(december31);

    expect(weekDates.length).toBe(7);
    expect(weekDates[0]).toEqual(new Date('2025-12-28')); // 일요일
    expect(weekDates[6]).toEqual(new Date('2026-01-03')); // 토요일
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const january1 = new Date('2025-01-01'); // 수요일

    const weekDates = getWeekDates(january1);

    expect(weekDates.length).toBe(7);
    expect(weekDates[0]).toEqual(new Date('2024-12-29')); // 일요일
    expect(weekDates[6]).toEqual(new Date('2025-01-04')); // 토요일
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const february29InLeapYear = new Date('2024-02-29'); // 목요일

    const weekDates = getWeekDates(february29InLeapYear);

    expect(weekDates.length).toBe(7);
    expect(weekDates[0]).toEqual(new Date('2024-02-25')); // 일요일
    expect(weekDates[6]).toEqual(new Date('2024-03-02')); // 토요일
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    const january31 = new Date('2025-01-31'); // 금요일

    const weekDates = getWeekDates(january31);

    expect(weekDates.length).toBe(7);
    expect(weekDates[6]).toEqual(new Date('2025-02-01')); // 토요일
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월의 올바른 주 정보를 반환해야 한다', () => {
    const july = new Date('2025-07-01');

    const weeksAtMonth = getWeeksAtMonth(july);

    expect(weeksAtMonth.length).toBe(5);
  });

  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const july1 = new Date('2025-07-01');
    const weekday = july1.getDay(); // 화요일

    const weeksAtMonth = getWeeksAtMonth(july1);

    // 화요일부터 시작하므로 월요일은 값이 없음
    expect(weeksAtMonth[0][weekday - 1]).toBeNull();
    expect(weeksAtMonth[0][weekday]).toBe(1);
    // 화요일부터 시작하므로 첫 주는 5일
    expect(weeksAtMonth[0].filter((d) => !!d).length).toBe(5);
  });
});

describe('getEventsForDay', () => {
  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트1',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '12:00',
        description: '이벤트1 설명',
        location: '이벤트1 장소',
        category: '카테고리1',
        repeat: {
          type: 'daily',
          interval: 1,
        },
        notificationTime: 0,
      },
      {
        id: '2',
        title: '이벤트2',
        date: '2025-07-02',
        startTime: '13:00',
        endTime: '15:00',
        description: '이벤트2 설명',
        location: '이벤트2 장소',
        category: '카테고리2',
        repeat: {
          type: 'daily',
          interval: 1,
        },
        notificationTime: 0,
      },
    ];

    const eventsForDay = getEventsForDay(events, 1);

    expect(eventsForDay.length).toBe(1);
    expect(eventsForDay[0].title).toBe('이벤트1');
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트1',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '12:00',
        description: '이벤트1 설명',
        location: '이벤트1 장소',
        category: '카테고리1',
        repeat: {
          type: 'daily',
          interval: 1,
        },
        notificationTime: 0,
      },
    ];

    const eventsForDay = getEventsForDay(events, 2);

    expect(eventsForDay.length).toBe(0);
  });

  it('유효하지 않은 날짜(0일)에 대해 빈 배열을 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트',
        date: '2025-07-00',
        startTime: '10:00',
        endTime: '12:00',
        description: '이벤트 설명',
        location: '이벤트 장소',
        category: '카테고리',
        repeat: {
          type: 'daily',
          interval: 1,
        },
        notificationTime: 0,
      },
    ];

    const eventsForDay0 = getEventsForDay(events, 0);
    expect(eventsForDay0.length).toBe(0);
  });

  it('유효하지 않은 날짜(32일)에 대해 빈 배열을 반환한다', () => {
    const events: Event[] = [
      {
        id: '2',
        title: '이벤트',
        date: '2025-07-32',
        startTime: '13:00',
        endTime: '15:00',
        description: '이벤트 설명',
        location: '이벤트 장소',
        category: '카테고리',
        repeat: {
          type: 'daily',
          interval: 1,
        },
        notificationTime: 0,
      },
    ];

    const eventsForDay32 = getEventsForDay(events, 32);
    expect(eventsForDay32.length).toBe(0);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const targetDate = new Date('2025-07-15');
    const formattedWeek = formatWeek(targetDate);

    expect(formattedWeek).toBe('2025년 7월 3주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const targetDate = new Date('2025-07-01');
    const formattedWeek = formatWeek(targetDate);

    expect(formattedWeek).toBe('2025년 7월 1주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const targetDate = new Date('2025-07-31');
    const formattedWeek = formatWeek(targetDate);

    expect(formattedWeek).toBe('2025년 7월 5주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const targetDate = new Date('2025-12-31');
    const formattedWeek = formatWeek(targetDate);

    expect(formattedWeek).toBe('2026년 1월 1주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const targetDate = new Date('2025-02-28');
    const formattedWeek = formatWeek(targetDate);

    expect(formattedWeek).toBe('2025년 2월 4주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const targetDate = new Date('2024-02-29');
    const formattedWeek = formatWeek(targetDate);

    expect(formattedWeek).toBe('2024년 2월 5주');
  });
});

describe('formatMonth', () => {
  it("2024년 7월 10일을 '2024년 7월'로 반환한다", () => {
    const targetDate = new Date('2024-07-10');
    const formattedMonth = formatMonth(targetDate);

    expect(formattedMonth).toBe('2024년 7월');
  });
});

describe('isDateInRange', () => {
  const rangeStart = new Date('2024-07-01');
  const rangeEnd = new Date('2024-07-31');

  it('범위 내의 날짜 2024-07-10에 대해 true를 반환한다', () => {
    const targetDate = new Date('2024-07-10');
    const isInRange = isDateInRange(targetDate, rangeStart, rangeEnd);

    expect(isInRange).toBe(true);
  });

  it('범위의 시작일 2024-07-01에 대해 true를 반환한다', () => {
    const targetDate = new Date('2024-07-01');
    const isInRange = isDateInRange(targetDate, rangeStart, rangeEnd);

    expect(isInRange).toBe(true);
  });

  it('범위의 종료일 2024-07-31에 대해 true를 반환한다', () => {
    const targetDate = new Date('2024-07-31');
    const isInRange = isDateInRange(targetDate, rangeStart, rangeEnd);

    expect(isInRange).toBe(true);
  });

  it('범위 이전의 날짜 2024-06-30에 대해 false를 반환한다', () => {
    const targetDate = new Date('2024-06-30');
    const isInRange = isDateInRange(targetDate, rangeStart, rangeEnd);

    expect(isInRange).toBe(false);
  });

  it('범위 이후의 날짜 2024-08-01에 대해 false를 반환한다', () => {
    const targetDate = new Date('2024-08-01');
    const isInRange = isDateInRange(targetDate, rangeStart, rangeEnd);

    expect(isInRange).toBe(false);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    const targetDate = new Date('2024-07-31');
    const isInRange = isDateInRange(targetDate, rangeEnd, rangeStart);

    expect(isInRange).toBe(false);
  });
});

describe('fillZero', () => {
  it('value가 지정된 size보다 작은 자릿수를 가지면 앞에 0이 붙는다', () => {
    const oneFilledZero = fillZero(1, 2);
    const zeroFilledZero = fillZero(0, 2);

    expect(oneFilledZero).toBe('01');
    expect(zeroFilledZero).toBe('00');
  });

  it('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    const filledZero = fillZero(12345, 2);

    expect(filledZero).toBe('12345');
  });

  it('value와 지정된 size의 자릿수가 같으면 원래 값을 그대로 반환한다', () => {
    const filledZero = fillZero(10, 2);

    expect(filledZero).toBe('10');
  });

  it('소수점 포함 숫자는 "."을 포함하는 전체 자릿수 기준으로 변환한다.', () => {
    const filledZero = fillZero(3.14, 5);

    expect(filledZero).toBe('03.14');
  });

  it('size 파라미터를 생략하면 기본값 2를 사용한다', () => {
    const filledZero = fillZero(1);

    expect(filledZero).toBe('01');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    const formattedDate = formatDate(new Date(2024, 9, 10)); // 2024년 10월 10일, monthIndex는 0부터 시작

    expect(formattedDate).toBe('2024-10-10');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    const formattedDate = formatDate(new Date(2025, 1, 10), 20);

    expect(formattedDate).toBe('2025-02-20');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const formattedDate = formatDate(new Date(2025, 0, 10));

    expect(formattedDate).toBe('2025-01-10');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const formattedDate = formatDate(new Date(2024, 9, 5));

    expect(formattedDate).toBe('2024-10-05');
  });
});
