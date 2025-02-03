import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { handlers } from '../__mocks__/handlers';
import { Event } from '../types';

// MSW 서버 설정
const server = setupServer(...handlers);

// 각 테스트 실행 전 서버를 시작, 테스트 후 핸들러 설정을 리셋, 마지막에 서버 종료
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// 테스트용 더미 이벤트 데이터 반환 헬퍼 함수
const dummyEventData = (): Partial<Event> => ({
  title: '테스트 이벤트',
  startTime: '2023-10-10T10:00:00Z',
  endTime: '2023-10-10T12:00:00Z',
  description: '테스트 설명',
  location: '테스트 장소',
});

describe('MSW 핸들러 검증', () => {
  it('GET /api/events 요청에 대한 응답이 정확한지 확인합니다.', async () => {
    const response = await fetch('/api/events');
    const data = await response.json();

    // __mocks__/response/events.json 파일의 내용을 가져와 비교
    const eventsModule = await import('../__mocks__/response/events.json');
    expect(data).toEqual({ events: eventsModule.events });
  });

  it('POST /api/events 요청으로 새로운 이벤트가 추가되는지 확인합니다.', async () => {
    const newEventData: Partial<Event> = dummyEventData();
    const postResponse = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEventData),
    });
    expect(postResponse.status).toBe(201);
    const createdEvent = await postResponse.json();

    // 생성된 이벤트는 id 프로퍼티를 가져야 함
    expect(createdEvent).toHaveProperty('id');
    expect(createdEvent.title).toBe(newEventData.title);

    // GET 요청 시 새로운 이벤트가 포함되어 있는지 확인
    const getResponse = await fetch('/api/events');
    const getData = await getResponse.json();
    expect(getData.events).toContainEqual(createdEvent);
  });

  it('PUT /api/events/:id 요청으로 이벤트가 업데이트 되는지 확인합니다.', async () => {
    // 우선 기존 이벤트를 조회
    const getResponse = await fetch('/api/events');
    const getData = await getResponse.json();
    const existingEvent = getData.events[0];

    const updateData: Partial<Event> = {
      title: '수정된 이벤트 제목',
      endTime: '2023-10-10T13:00:00Z',
    };

    const putResponse = await fetch(`/api/events/${existingEvent.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    expect(putResponse.status).toBe(200);
    const updatedEvent = await putResponse.json();
    expect(updatedEvent.title).toBe(updateData.title);
    expect(updatedEvent.endTime).toBe(updateData.endTime);

    // GET 요청을 통해 변경된 내용이 반영되었는지 확인
    const getResponseAfterPut = await fetch('/api/events');
    const getDataAfterPut = await getResponseAfterPut.json();
    expect(getDataAfterPut.events).toContainEqual(updatedEvent);
  });

  it('DELETE /api/events/:id 요청으로 이벤트가 삭제되는지 확인합니다.', async () => {
    // 삭제할 이벤트를 생성
    const newEventData: Partial<Event> = dummyEventData();
    const postResponse = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEventData),
    });
    const createdEvent = await postResponse.json();
    expect(createdEvent).toHaveProperty('id');

    // 생성된 이벤트를 삭제
    const deleteResponse = await fetch(`/api/events/${createdEvent.id}`, {
      method: 'DELETE',
    });
    expect(deleteResponse.status).toBe(204);

    // 삭제된 이벤트가 GET 요청 시 더 이상 포함되지 않아야 함
    const getResponseAfterDelete = await fetch('/api/events');
    const getDataAfterDelete = await getResponseAfterDelete.json();
    expect(getDataAfterDelete.events).not.toContainEqual(createdEvent);
  });
});
