import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SearchView } from '../../components/SearchView';
import { Event } from '../../types';

describe('SearchView 컴포넌트 테스트', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '팀 미팅',
      date: '2024-10-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '회의실 A에서 진행',
      location: '회의실 A',
      category: '업무',
      notificationTime: 10,
      repeat: { type: 'none', interval: 0 },
    },
    {
      id: '2',
      title: '프레젠테이션',
      date: '2024-10-15',
      startTime: '12:00',
      endTime: '13:00',
      description: '고객사 방문',
      location: '고객사',
      category: '업무',
      notificationTime: 0,
      repeat: { type: 'none', interval: 0 },
    },
  ];

  const currentDate = new Date('2024-10-15');
  const view: 'month' | 'week' = 'month';
  const editEvent = vi.fn();
  const deleteEvent = vi.fn();
  const notifiedEvents = ['1']; // '팀 미팅' 이벤트는 알림 대상

  const setup = () => {
    const user = userEvent.setup();
    return {
      ...render(
        <ChakraProvider>
          <SearchView
            events={events}
            currentDate={currentDate}
            view={view}
            editEvent={editEvent}
            deleteEvent={deleteEvent}
            notifiedEvents={notifiedEvents}
          />
        </ChakraProvider>,
      ),
      user,
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('검색어가 없으면 모든 이벤트가 렌더링된다', () => {
    setup();

    expect(screen.getByText('팀 미팅')).toBeInTheDocument();
    expect(screen.getByText('프레젠테이션')).toBeInTheDocument();
  });

  it('검색어 입력 시 일치하는 이벤트만 렌더링된다', async () => {
    const { user } = setup();
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');

    await user.clear(searchInput);
    await user.type(searchInput, '팀 미팅');

    expect(screen.getByText('팀 미팅')).toBeInTheDocument();
    expect(screen.queryByText('프레젠테이션')).not.toBeInTheDocument();
  });

  it('검색어에 해당하는 이벤트가 없으면 "검색 결과가 없습니다."를 렌더링한다', async () => {
    const { user } = setup();
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');

    await user.clear(searchInput);
    await user.type(searchInput, '없는 이벤트');

    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('수정 버튼 클릭 시 editEvent 콜백이 호출된다', async () => {
    const { user } = setup();
    const editButtons = screen.getAllByRole('button', { name: 'Edit event' });

    await user.click(editButtons[0]);

    expect(editEvent).toHaveBeenCalledTimes(1);
    expect(editEvent).toHaveBeenCalledWith(events[0]);
  });

  it('삭제 버튼 클릭 시 deleteEvent 콜백이 호출된다', async () => {
    const { user } = setup();
    const deleteButtons = screen.getAllByRole('button', { name: 'Delete event' });

    await user.click(deleteButtons[1]);

    expect(deleteEvent).toHaveBeenCalledTimes(1);
    expect(deleteEvent).toHaveBeenCalledWith(events[1].id);
  });

  it('알림 이벤트는 제목 텍스트가 굵고 빨간색으로 렌더링된다', () => {
    setup();
    const teamMeetingTitle = screen.getByText('팀 미팅');

    expect(teamMeetingTitle).toHaveStyle('font-weight: var(--chakra-fontWeights-bold);');
  });
});
