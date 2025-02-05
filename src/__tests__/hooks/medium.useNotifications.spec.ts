import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications';
import { Event } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { createNotificationMessage } from '../../utils/notificationUtils';
import { parseHM } from '../utils';

describe('useNotifications', () => {
  const 초 = 1000;
  const 분 = 60 * 초;
  const 시간 = 60 * 분;

  it('초기 상태에서는 알림이 없어야 한다', () => {
    const eventDate = new Date();
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트1',
        description: '이벤트1 설명',
        location: '이벤트1 위치',
        date: formatDate(eventDate),
        startTime: parseHM(eventDate.getTime() + 20 * 분),
        endTime: parseHM(eventDate.getTime() + 시간),
        category: 'event',
        repeat: {
          type: 'daily',
          interval: 1,
        },
        notificationTime: 10,
      },
    ];
    const { result } = renderHook(() => useNotifications(events));

    expect(result.current.notifications).toEqual([]);
    expect(result.current.notifiedEvents).toEqual([]);
  });

  it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
    const eventDate = new Date();
    const targetEvent: Event = {
      id: '1',
      title: '이벤트1',
      description: '이벤트1 설명',
      location: '이벤트1 위치',
      date: formatDate(eventDate),
      startTime: parseHM(eventDate.getTime() + 20 * 분),
      endTime: parseHM(eventDate.getTime() + 시간),
      category: 'event',
      repeat: {
        type: 'daily',
        interval: 1,
      },
      notificationTime: 10,
    };
    const events: Event[] = [targetEvent];
    const notification = {
      id: targetEvent.id,
      message: createNotificationMessage(targetEvent),
    };
    const { result } = renderHook(() => useNotifications(events));

    // 초기 상태에서는 알림이 없어야 한다
    expect(result.current.notifications).toEqual([]);

    // 10분 후
    act(() => {
      vi.advanceTimersByTime(10 * 분);
    });

    // 알림이 생성되어 추가되어야 한다
    expect(result.current.notifications).toEqual([notification]);
  });

  it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
    const { result } = renderHook(() => useNotifications([]));

    act(() => {
      result.current.setNotifications([
        { id: '1', message: '알림1' },
        { id: '2', message: '알림2' },
      ]);
    });

    expect(result.current.notifications).toEqual([
      { id: '1', message: '알림1' },
      { id: '2', message: '알림2' },
    ]);

    act(() => {
      result.current.removeNotification(0);
    });

    // 첫 번째 알림이 제거되어 두 번째 알림만 존재
    expect(result.current.notifications).toEqual([{ id: '2', message: '알림2' }]);
  });

  it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
    const eventDate = new Date();
    const targetEvent: Event = {
      id: '1',
      title: '이벤트1',
      description: '이벤트1 설명',
      location: '이벤트1 위치',
      date: formatDate(eventDate),
      startTime: parseHM(eventDate.getTime() + 10 * 분),
      endTime: parseHM(eventDate.getTime() + 시간),
      category: 'event',
      repeat: {
        type: 'daily',
        interval: 1,
      },
      notificationTime: 10,
    };
    const events: Event[] = [targetEvent];
    const { result } = renderHook(() => useNotifications(events));

    // 초기 상태
    expect(result.current.notifications).toEqual([]);
    expect(result.current.notifiedEvents).toEqual([]);

    // 첫 알림 발생
    act(() => {
      vi.advanceTimersByTime(초);
    });
    expect(result.current.notifications).toHaveLength(1);

    // 5분 후: 추가 시간 경과해도 중복 알림이 발생하지 않아야 함.
    act(() => {
      vi.advanceTimersByTime(5 * 분);
    });
    expect(result.current.notifications).toHaveLength(1);
  });
});
