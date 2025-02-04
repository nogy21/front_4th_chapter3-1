import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { Event } from '../types';

const setup = (jsx: React.ReactNode) => ({
  user: userEvent.setup(),
  ...render(<ChakraProvider>{jsx}</ChakraProvider>),
});

// 일정 저장 함수
const saveSchedule = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime' | 'repeat'>,
) => {
  const { title, date, startTime, endTime, location, description, category } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.selectOptions(screen.getByLabelText('카테고리'), category);

  await user.click(screen.getByTestId('event-submit-button'));
};

describe('일정 CRUD 및 기본 기능', () => {
  // 각 테스트 시작 전 App 렌더링, user 설정

  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    // event 추가/제거/저장 로직을 전체 테스트에서 진행한다면, 각 테스트가 독립적이지 못하고 순서에 따라 영향을 미치게 됨
    // 이를 해결하기 위해 각 테스트에서 독립적으로 실행될 수 있도록 새로운 핸들러 및 mockEvents 생성 필요
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: '새 회의',
      date: '2024-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',
    });

    // 일정 저장 후 데이터가 렌더링될 때까지 대기
    await waitFor(async () => {
      const eventList = within(screen.getByTestId('event-list'));
      // getByText는 요소가 없으면 테스트 실패하므로 존재하지 않는 요소에 대해서는 queryByText를 사용. queryByText는 요소가 없으면 null 반환
      expect(eventList.queryByText('검색 결과가 없습니다.')).not.toBeInTheDocument();
      expect(eventList.getByText('새 회의')).toBeInTheDocument();
    });

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('2024-10-15')).toBeInTheDocument();
    expect(eventList.getByText('14:00 - 15:00')).toBeInTheDocument();
    expect(eventList.getByText('프로젝트 진행 상황 논의')).toBeInTheDocument();
    expect(eventList.getByText('회의실 A')).toBeInTheDocument();
    expect(eventList.getByText('카테고리: 업무')).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하면 변경사항이 정확히 반영된다', async () => {
    setupMockHandlerUpdating(); // handlerUtils에서 초기 데이터 설정 및 수정 핸들러 설정하여 테스트를 독립적으로 실행
    const { user } = setup(<App />);

    // 기존 일정 조회
    await waitFor(async () => {
      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.getByText('기존 회의')).toBeInTheDocument();
    });

    await user.click((await screen.findAllByLabelText('Edit event'))[0]);

    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '수정된 회의');
    await user.clear(screen.getByLabelText('설명'));
    await user.type(screen.getByLabelText('설명'), '회의 내용 변경');

    await user.click(screen.getByTestId('event-submit-button'));

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('수정된 회의')).toBeInTheDocument();
    expect(eventList.getByText('회의 내용 변경')).toBeInTheDocument();
  });

  it('일정을 삭제하면 더 이상 조회되지 않는다', async () => {
    setupMockHandlerDeletion();
    const { user } = setup(<App />);

    await waitFor(async () => {
      const eventList = within(await screen.getByTestId('event-list'));
      expect(eventList.getByText('기존 회의')).toBeInTheDocument();
    });

    await user.click(await screen.getByLabelText('Delete event'));

    await waitFor(async () => {
      const eventList = within(await screen.getByTestId('event-list'));
      expect(eventList.queryByText('기존 회의')).not.toBeInTheDocument();
    });
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    // 주별 뷰 선택
    await user.click(screen.getByRole('combobox', { name: 'view' }));
    await user.click(screen.getByRole('option', { name: 'Week' }));

    // 이벤트 리스트에 아무런 일정도 없는지 확인
    await waitFor(() => {
      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.queryByText('기존 회의')).not.toBeInTheDocument();
      expect(eventList.queryByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    vi.setSystemTime('2025-01-01');
    setupMockHandlerCreation([
      {
        id: '1',
        title: '회의',
        date: '2025-01-01',
        startTime: '10:00',
        endTime: '11:00',
        location: '회의실 A',
        description: '회의 내용',
        category: '업무',
        notificationTime: 0,
        repeat: {
          type: 'none',
          interval: 0,
        },
      },
    ]);
    const { user } = setup(<App />);

    // 주별 뷰 선택
    await user.click(screen.getByRole('combobox', { name: 'view' }));
    await user.click(screen.getByRole('option', { name: 'Week' }));

    // 일정 추가 후 일정이 정확히 표시되는지 확인
    await waitFor(async () => {
      const eventList = within(await screen.getByTestId('event-list'));
      expect(eventList.getByText('회의')).toBeInTheDocument();
      expect(eventList.getByText('2025-01-01')).toBeInTheDocument();
      expect(eventList.getByText('10:00 - 11:00')).toBeInTheDocument();
      expect(eventList.getByText('회의실 A')).toBeInTheDocument();
      expect(eventList.getByText('회의 내용')).toBeInTheDocument();
      expect(eventList.getByText('카테고리: 업무')).toBeInTheDocument();
    });
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    // 월별 뷰 선택
    await user.click(screen.getByRole('combobox', { name: 'view' }));
    await user.click(screen.getByRole('option', { name: 'Month' }));

    await waitFor(() => {
      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.queryByText('기존 회의')).not.toBeInTheDocument();
      expect(eventList.queryByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    vi.setSystemTime('2025-01-01');
    setupMockHandlerCreation([
      {
        id: '1',
        title: '회의',
        date: '2025-01-01',
        startTime: '10:00',
        endTime: '11:00',
        location: '회의실 A',
        description: '회의 내용',
        category: '업무',
        notificationTime: 0,
        repeat: {
          type: 'none',
          interval: 0,
        },
      },
    ]);
    const { user } = setup(<App />);

    // 월별 뷰 선택
    await user.click(screen.getByRole('combobox', { name: 'view' }));
    await user.click(screen.getByRole('option', { name: 'Month' }));

    await waitFor(async () => {
      const eventList = within(await screen.getByTestId('event-list'));
      expect(eventList.getByText('회의')).toBeInTheDocument();
      expect(eventList.getByText('2025-01-01')).toBeInTheDocument();
      expect(eventList.getByText('10:00 - 11:00')).toBeInTheDocument();
      expect(eventList.getByText('회의실 A')).toBeInTheDocument();
      expect(eventList.getByText('회의 내용')).toBeInTheDocument();
      expect(eventList.getByText('카테고리: 업무')).toBeInTheDocument();
    });
  });

  it('달력에 1월 1일이 공휴일(신정)으로 표시되는지 확인한다', async () => {
    // 시스템 시간을 신정 날짜로 설정 (2025-01-01)
    vi.setSystemTime(new Date('2025-01-01'));
    setup(<App />);

    // 달력에 1월이 표시되는지 확인
    const calendar = screen.getByTestId('month-view');
    const yearMonth = within(calendar).getByRole('heading');
    expect(yearMonth.textContent).toContain('1월');

    // 1월 1일이 신정으로 표시되는지 확인
    const cell = within(calendar).getByText('1').closest('td');
    expect(within(cell!).getByText(/신정/i)).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    await user.type(screen.getByPlaceholderText('검색어를 입력하세요'), '없는 일정');

    await waitFor(() => {
      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    vi.setSystemTime('2025-01-01');
    setupMockHandlerCreation([
      {
        id: '1',
        title: '팀 회의',
        date: '2025-01-01',
        startTime: '10:00',
        endTime: '11:00',
        location: '회의실 A',
        description: '회의 내용',
        category: '업무',
        notificationTime: 0,
        repeat: {
          type: 'none',
          interval: 0,
        },
      },
    ]);
    const { user } = setup(<App />);

    await user.type(screen.getByPlaceholderText('검색어를 입력하세요'), '팀 회의');

    await waitFor(() => {
      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.getByText('팀 회의')).toBeInTheDocument();
    });
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    vi.setSystemTime('2025-01-01');
    setupMockHandlerCreation([
      {
        id: '1',
        title: '팀 회의1',
        date: '2025-01-01',
        startTime: '10:00',
        endTime: '11:00',
        location: '회의실 A',
        description: '회의 내용',
        category: '업무',
        notificationTime: 0,
        repeat: {
          type: 'none',
          interval: 0,
        },
      },
      {
        id: '2',
        title: '팀 회의2',
        date: '2025-01-02',
        startTime: '10:00',
        endTime: '11:00',
        location: '회의실 B',
        description: '회의 내용',
        category: '업무',
        notificationTime: 0,
        repeat: {
          type: 'none',
          interval: 0,
        },
      },
    ]);
    const { user } = setup(<App />);

    // 없는 일정 검색
    await user.type(screen.getByPlaceholderText('검색어를 입력하세요'), '팀 회의3');
    await waitFor(() => {
      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
      expect(eventList.queryByText('팀 회의1')).not.toBeInTheDocument();
      expect(eventList.queryByText('팀 회의2')).not.toBeInTheDocument();
    });

    // 검색어 지우기
    await user.clear(screen.getByPlaceholderText('검색어를 입력하세요'));

    // 모든 일정 표시
    await waitFor(() => {
      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.getByText('팀 회의1')).toBeInTheDocument();
      expect(eventList.getByText('팀 회의2')).toBeInTheDocument();
    });
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '회의',
        date: '2025-01-01',
        startTime: '10:00',
        endTime: '11:00',
        location: '회의실 A',
        description: '회의 내용',
        category: '업무',
        notificationTime: 0,
        repeat: {
          type: 'none',
          interval: 0,
        },
      },
    ]);
    const { user } = setup(<App />);

    await user.type(screen.getByLabelText('제목'), '회의');
    await user.type(screen.getByLabelText('날짜'), '2025-01-01');
    await user.type(screen.getByLabelText('시작 시간'), '10:00');
    await user.type(screen.getByLabelText('종료 시간'), '11:00');
    await user.type(screen.getByLabelText('위치'), '회의실 A');
    await user.type(screen.getByLabelText('설명'), '회의 내용');
    await user.selectOptions(screen.getByLabelText('카테고리'), '업무');
    await user.click(screen.getByTestId('event-submit-button'));
    screen.debug();

    // 일정 겹침 경고 표시 확인
    await waitFor(() => {
      const alertDialogTitle = screen.getByText('일정 겹침 경고');
      expect(alertDialogTitle).toBeInTheDocument();
    });
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    // 2024-10-15 09:00-10:00, 2024-10-15 10:00-11:00 일정이 존재하도록 설정
    vi.setSystemTime(new Date('2024-10-15'));
    setupMockHandlerUpdating();
    const { user } = setup(<App />);

    // 이벤트 리스트에서 일정 확인
    await waitFor(() => {
      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.getByText('기존 회의')).toBeInTheDocument();
      expect(eventList.getByText('기존 회의2')).toBeInTheDocument();
    });

    // 수정 버튼을 모두 조회하고, "기존 회의2"에 해당하는 버튼을 선택 (순서상 두 번째)
    const editButtons = await screen.findAllByLabelText('Edit event');
    await user.click(editButtons[1]);

    // 시작 시간과 종료 시간을 "09:00", "10:00"으로 변경하여 충돌 발생 유도
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');
    await user.clear(startTimeInput);
    await user.type(startTimeInput, '09:00');
    await user.clear(endTimeInput);
    await user.type(endTimeInput, '10:00');

    // 수정 제출 버튼 클릭
    await user.click(screen.getByTestId('event-submit-button'));

    // 일정 겹침 경고 표시 확인
    await waitFor(() => {
      const alertDialogTitle = screen.getByText('일정 겹침 경고');
      expect(alertDialogTitle).toBeInTheDocument();
    });
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  vi.setSystemTime('2025-01-01');
  setupMockHandlerCreation([]);

  const { user } = setup(<App />);

  // 이벤트 생성
  await user.type(screen.getByLabelText('제목'), '회의');
  await user.type(screen.getByLabelText('날짜'), '2025-01-01');
  await user.type(screen.getByLabelText('시작 시간'), '10:00');
  await user.type(screen.getByLabelText('종료 시간'), '11:00');
  await user.type(screen.getByLabelText('위치'), '회의실 A');
  await user.type(screen.getByLabelText('설명'), '회의 내용');
  await user.selectOptions(screen.getByLabelText('카테고리'), '업무');
  // notificationTime 필드 10 입력
  await user.selectOptions(screen.getByLabelText('알림 설정'), '10');

  // 이벤트 등록 (제출)
  await user.click(screen.getByTestId('event-submit-button'));
  await waitFor(() => {
    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('회의')).toBeInTheDocument();
  });

  // 이벤트 시작 시간은 10:00이므로, 10분 전인 09:50:00으로 시스템 시간 변경
  vi.setSystemTime(new Date('2025-01-01T09:50:00'));
  // 타이머 1초 이동 (notification 관련 로직 실행 유도)
  vi.advanceTimersByTime(1000);

  // 알림 텍스트 검증
  await waitFor(() => {
    expect(screen.getByText(/알림: 10분 전/)).toBeInTheDocument();
  });
});
