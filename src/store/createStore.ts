import type { StoreApi, UseBoundStore } from 'zustand';
import { useShallow } from 'zustand/shallow';

/**
 * useShallow를 이용하여 store의 특정 키를 선택하는 selector 함수
 * @example const { posts, setPosts } = usePostsStoreSelector(['posts', 'setPosts']);
 */
export const createStore =
  <K>(store: UseBoundStore<StoreApi<K>>) =>
  <T extends keyof K>(keys: T[]) =>
    store(
      useShallow((state) =>
        keys.reduce(
          (acc, key) => {
            acc[key] = state[key];
            return acc;
          },
          {} as Pick<K, T>,
        ),
      ),
    );
