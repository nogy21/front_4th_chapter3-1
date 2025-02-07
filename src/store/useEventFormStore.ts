import { devtools } from 'zustand/middleware';

import { create } from '../__mocks__/zustand';
import type { Event, RepeatType, EventForm as TEventForm } from '../types';
import { getTimeErrorMessage } from '../utils/timeValidation';

interface EventFormState extends TEventForm {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  category: string;
  notificationTime: number;
  isRepeating: boolean;
  repeat: {
    type: RepeatType;
    interval: number;
    endDate?: string;
  };
  startTimeError: string | null;
  endTimeError: string | null;
  editingEvent: Event | null;
}

interface EventFormActions {
  setTitle: (title: string) => void;
  setDate: (date: string) => void;
  setStartTime: (time: string) => void;
  setEndTime: (time: string) => void;
  setDescription: (desc: string) => void;
  setLocation: (loc: string) => void;
  setCategory: (cat: string) => void;
  setNotificationTime: (time: number) => void;
  setIsRepeating: (is: boolean) => void;
  setRepeatType: (type: RepeatType) => void;
  setRepeatInterval: (interval: number) => void;
  setRepeatEndDate: (date: string | undefined) => void;
  setEditingEvent: (event: Event | null) => void;
  handleStartTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleEndTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  resetForm: () => void;
  editEvent: (event: Event) => void;
}

type EventFormStore = EventFormState & EventFormActions;

const initialState: EventFormState = {
  title: '',
  date: '',
  startTime: '',
  endTime: '',
  description: '',
  location: '',
  category: '',
  notificationTime: 10,
  isRepeating: false,
  repeat: {
    type: 'none',
    interval: 1,
    endDate: undefined,
  },
  startTimeError: null,
  endTimeError: null,
  editingEvent: null,
};

export const useEventFormStore = create<EventFormStore>()(
  devtools((set) => ({
    ...initialState,

    setTitle: (title) => set({ title }),
    setDate: (date) => set({ date }),
    setStartTime: (startTime) => set({ startTime }),
    setEndTime: (endTime) => set({ endTime }),
    setDescription: (description) => set({ description }),
    setLocation: (location) => set({ location }),
    setCategory: (category) => set({ category }),
    setNotificationTime: (notificationTime) => set({ notificationTime }),
    setIsRepeating: (isRepeating) => set({ isRepeating }),
    setRepeatType: (type) =>
      set((state) => ({
        repeat: { ...state.repeat, type },
      })),
    setRepeatInterval: (interval) =>
      set((state) => ({
        repeat: { ...state.repeat, interval },
      })),
    setRepeatEndDate: (endDate) =>
      set((state) => ({
        repeat: { ...state.repeat, endDate },
      })),
    setEditingEvent: (event) =>
      set({
        editingEvent: event,
        title: event?.title || '',
        date: event?.date || '',
        startTime: event?.startTime || '',
        endTime: event?.endTime || '',
        description: event?.description || '',
        location: event?.location || '',
        category: event?.category || '',
        notificationTime: event?.notificationTime || 10,
        isRepeating: event?.repeat.type !== 'none' || false,
        repeat: {
          type: event?.repeat.type || 'none',
          interval: event?.repeat.interval || 1,
          endDate: event?.repeat.endDate || undefined,
        },
      }),

    handleStartTimeChange: (e) => {
      const newStartTime = e.target.value;
      set((state) => {
        const { startTimeError, endTimeError } = getTimeErrorMessage(newStartTime, state.endTime);
        return { startTime: newStartTime, startTimeError, endTimeError };
      });
    },

    handleEndTimeChange: (e) => {
      const newEndTime = e.target.value;
      set((state) => {
        const { startTimeError, endTimeError } = getTimeErrorMessage(state.startTime, newEndTime);
        return { endTime: newEndTime, startTimeError, endTimeError };
      });
    },

    resetForm: () => set(initialState),

    editEvent: (event) =>
      set({
        editingEvent: event,
        title: event.title,
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        description: event.description,
        location: event.location,
        category: event.category,
        notificationTime: event.notificationTime,
        isRepeating: event.repeat.type !== 'none',
        repeat: {
          type: event.repeat.type,
          interval: event.repeat.interval,
          endDate: event.repeat.endDate,
        },
        startTimeError: null,
        endTimeError: null,
      }),
  })),
);
