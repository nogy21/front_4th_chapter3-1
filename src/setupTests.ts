import '@testing-library/jest-dom';
import { setupServer } from 'msw/node';

import { handlers } from './__mocks__/handlers';

/* msw */
export const server = setupServer(...handlers);

beforeAll(() => {
  server.listen();
  vi.useFakeTimers({
    shouldAdvanceTime: true,
    // 3 버전으로 업그레이드되며 default로 적용되던 toFake 옵션이 사라져 명시적으로 설정
    toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'],
  });
});

beforeEach(() => {
  // 각 테스트마다 최소 한 개 이상의 어설션이 실행되었는지 확인, 비동기 테스트에서 효과적
  expect.hasAssertions();
  // 테스트 실행 동안 고정된 시간 사용
  vi.setSystemTime(new Date('2024-10-15'));
});

afterEach(() => {
  // 테스트 실행 후 핸들러 초기화
  server.resetHandlers();
  vi.clearAllMocks();
});

afterAll(() => {
  vi.resetAllMocks();
  vi.useRealTimers();
  server.close();
});
