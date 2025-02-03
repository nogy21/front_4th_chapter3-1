import { http, HttpResponse } from 'msw';

import type { Event } from '../types';
import { events } from './response/events.json';

let mockEvents = {
  events,
};

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
export const handlers = [
  // events.json에 담긴 이벤트를 반환
  http.get('/api/events', () => HttpResponse.json(mockEvents)),

  // request에 담긴 데이터를 받아와서 새로운 이벤트를 추가
  http.post('/api/events', async ({ request }) => {
    const data = (await request.json()) as Event;
    const newEvent = { ...data, id: crypto.randomUUID() };

    mockEvents = {
      events: [...mockEvents.events, newEvent],
    };

    return HttpResponse.json(newEvent, { status: 201 });
  }),

  // request에 담긴 데이터를 받아와서 기존 이벤트를 수정
  http.put('/api/events/:id', async ({ request, params }) => {
    const { id } = params;
    const eventData = (await request.json()) as Event;

    const targetEvent = mockEvents.events.find((event) => event.id === id);

    if (!targetEvent) {
      return HttpResponse.json({ message: 'Event not found' }, { status: 404 });
    }

    const updatedEvent = {
      ...targetEvent,
      ...eventData,
    };
    mockEvents.events = mockEvents.events.map((event) => (event.id === id ? updatedEvent : event));

    return HttpResponse.json(updatedEvent);
  }),

  // request에 담긴 데이터를 받아와서 기존 이벤트를 삭제
  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;

    mockEvents.events = mockEvents.events.filter((event) => event.id !== id);

    return HttpResponse.json(null, { status: 204 });
  }),
];
