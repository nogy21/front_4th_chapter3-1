import * as zustand from 'zustand';

// 모든 스토어의 리셋 함수를 저장할 Set
export const storeResetFns = new Set<() => void>();

// store 생성 시 초기 상태를 저장하고 리셋 함수 생성
const createUncurried = <T>(stateCreator: zustand.StateCreator<T>) => {
  const store = zustand.create(stateCreator);
  const initialState = store.getState();
  storeResetFns.add(() => {
    store.setState(initialState, true);
  });
  return store;
};

// create 함수 모킹
export const create = (<T>(stateCreator: zustand.StateCreator<T>) =>
  typeof stateCreator === 'function'
    ? createUncurried(stateCreator)
    : createUncurried) as typeof zustand.create;
