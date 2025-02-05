import { act, renderHook } from '@testing-library/react';

import { useCalendarView } from '../../hooks/useCalendarView';
import { assertDate } from '../utils';

describe('초기 상태', () => {
  it('초기 view는 "month"이어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());

    expect(result.current.view).toBe('month');
  });

  it('초기 currentDate는 테스트 지정 날짜인 "2024-10-15"이어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());

    assertDate(result.current.currentDate, new Date('2024-10-15'));
  });

  it('초기 holidays는 10월 휴일인 개천절, 한글날이 지정되어 있어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());

    expect(result.current.holidays).toEqual({
      '2024-10-03': '개천절',
      '2024-10-09': '한글날',
    });
  });
});

describe('view 변경', () => {
  it("view를 'week'으로 변경 시 view가 'week'으로 변경되어야 한다", () => {
    const { result } = renderHook(() => useCalendarView());

    act(() => {
      result.current.setView('week');
    });

    expect(result.current.view).toBe('week');
  });

  it("주간 뷰에서 다음으로 navigate시 7일 후 '2024-10-22' 날짜로 지정이 된다", () => {
    const { result } = renderHook(() => useCalendarView());

    act(() => {
      result.current.setView('week');
    });
    act(() => {
      result.current.navigate('next');
    });

    assertDate(result.current.currentDate, new Date('2024-10-22'));
  });

  it("주간 뷰에서 이전으로 navigate시 7일 후 '2024-10-08' 날짜로 지정이 된다", () => {
    const { result } = renderHook(() => useCalendarView());

    act(() => {
      result.current.setView('week');
    });
    act(() => {
      result.current.navigate('prev');
    });

    assertDate(result.current.currentDate, new Date('2024-10-08'));
  });

  it("월간 뷰에서 다음으로 navigate시 한 달 전 '2024-11-01' 날짜여야 한다", () => {
    const { result } = renderHook(() => useCalendarView());

    act(() => {
      result.current.setView('month');
    });
    act(() => {
      result.current.navigate('next');
    });

    assertDate(result.current.currentDate, new Date('2024-11-01'));
  });

  it("월간 뷰에서 이전으로 navigate시 한 달 전 '2024-09-01' 날짜여야 한다", () => {
    const { result } = renderHook(() => useCalendarView());

    act(() => {
      result.current.setView('month');
    });
    act(() => {
      result.current.navigate('prev');
    });

    assertDate(result.current.currentDate, new Date('2024-09-01'));
  });
});

describe('currentDate 변경', () => {
  it("currentDate가 '2025-01-01' 변경되면 1월 휴일 '신정'으로 업데이트되어야 한다", async () => {
    const { result } = renderHook(() => useCalendarView());

    act(() => {
      result.current.setCurrentDate(new Date('2025-01-01'));
    });

    expect(result.current.holidays).toEqual({
      '2025-01-01': '신정',
    });
  });
});
