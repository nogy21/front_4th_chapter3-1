import { ChakraProvider } from '@chakra-ui/react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { CalendarView } from '../../components/CalendarView';
import { Event } from '../../types';

// WeekView와 MonthView를 더미 컴포넌트로 모킹하여 실제 구현과 분리
vi.mock('../../components/WeekView', () => ({
  WeekView: () => <div data-testid='week-view'>Week View Component</div>,
}));
// MonthView에 전달되는 { events, holidays }를 캡처하기 위한 변수
let capturedMonthViewProps: { events: Event[]; holidays: Record<string, string> } | null = null;
vi.mock('../../components/MonthView', () => ({
  MonthView: (props: { events: Event[]; holidays: Record<string, string> }) => {
    capturedMonthViewProps = props;
    return <div data-testid='month-view'>Month View Component</div>;
  },
}));

describe('CalendarView 컴포넌트 테스트', () => {
  const defaultProps = {
    view: 'week' as const,
    currentDate: new Date('2024-10-10'),
    events: [
      {
        id: '1',
        title: '회의',
        date: '2024-10-10',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ] as Event[],
    notifiedEvents: [] as string[],
    holidays: {} as Record<string, string>,
    navigate: vi.fn(), // 'prev' 또는 'next' 호출 테스트
    setView: vi.fn(), // view 변경 확인
  };

  // 헬퍼 함수: ChakraProvider로 감싸서 렌더링
  const setup = (jsx: React.ReactElement) => ({
    ...render(<ChakraProvider>{jsx}</ChakraProvider>),
    user: userEvent.setup(),
  });

  it('캘린더는 "일정 보기"라는 제목과 함께 주간 일정 정보가 제공된다', () => {
    setup(<CalendarView {...defaultProps} />);

    expect(screen.getByRole('heading')).toHaveTextContent('일정 보기');
    expect(screen.getByTestId('week-view')).toBeInTheDocument();
  });

  it('월간 뷰를 선택하면, 월간 일정 정보가 명확히 표시된다', () => {
    setup(<CalendarView {...defaultProps} view='month' />);

    expect(screen.getByTestId('month-view')).toBeInTheDocument();
  });

  it('이전 버튼을 클릭하면, 캘린더가 이전 기간으로 이동하여 일정 정보를 업데이트 한다', async () => {
    setup(<CalendarView {...defaultProps} />);
    const prevButton = screen.getByRole('button', { name: /previous/i });

    await userEvent.click(prevButton);

    expect(defaultProps.navigate).toHaveBeenCalledWith('prev');
  });

  it('다음 버튼을 클릭하면, 캘린더가 다음 기간으로 이동하여 새로운 일정 정보를 보여준다', async () => {
    setup(<CalendarView {...defaultProps} />);
    const nextButton = screen.getByRole('button', { name: /next/i });

    await userEvent.click(nextButton);

    expect(defaultProps.navigate).toHaveBeenCalledWith('next');
  });

  it('뷰 모드를 드롭다운 메뉴에서 변경하면, 캘린더의 일정 뷰가 선택한 모드(월간, 주간)로 전환된다', async () => {
    const { user, rerender } = setup(<CalendarView {...defaultProps} />);
    const selectElement = screen.getByRole('combobox');

    // 월간 뷰로 변경 (모킹된 setView 호출 검증)
    await user.selectOptions(selectElement, 'month');
    expect(defaultProps.setView).toHaveBeenCalledWith('month');

    // 실제로 부모가 상태를 변경했다고 가정하고, view="month"로 재렌더링
    rerender(
      <ChakraProvider>
        <CalendarView {...defaultProps} view='month' />
      </ChakraProvider>,
    );

    // 재렌더링 후 실제 월간 뷰 요소가 출력되는지 확인
    expect(screen.getByTestId('month-view')).toBeInTheDocument();
  });

  it('월간 뷰는 자식 컴포넌트에 이벤트 및 공휴일 데이터를 전달한다', () => {
    const holidays = { '2024-10-01': '예시 공휴일' };
    const propsWithHoliday = { ...defaultProps, view: 'month' as const, holidays };
    // 캡처 변수 초기화
    capturedMonthViewProps = null;

    setup(<CalendarView {...propsWithHoliday} />);

    // 전달된 { events, holidays }가 캡처되었는지 확인
    expect(capturedMonthViewProps).not.toBeNull();
    if (capturedMonthViewProps) {
      expect(
        (capturedMonthViewProps as { events: Event[]; holidays: Record<string, string> }).events,
      ).toStrictEqual(defaultProps.events);

      expect(
        (capturedMonthViewProps as { events: Event[]; holidays: Record<string, string> }).holidays,
      ).toStrictEqual(holidays);
    }
  });
});
