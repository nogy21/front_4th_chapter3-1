import { useToast } from '@chakra-ui/react';

import { createStore } from '../store/createStore';
import { useEventFormStore } from '../store/useEventFormStore';
import { Event, EventForm as TEventForm } from '../types';
import { findOverlappingEvents } from '../utils/eventOverlap';

const useEventFormSelector = createStore(useEventFormStore);

interface Props {
  events: Event[];
  editingEvent: Event | null;
  setOverlappingEvents: (events: Event[]) => void;
  setIsOverlapDialogOpen: (isOpen: boolean) => void;
  saveEvent: (event: Event) => Promise<void>;
}
export const useAddOrUpdateEvent = ({
  events,
  editingEvent,
  setOverlappingEvents,
  setIsOverlapDialogOpen,
  saveEvent,
}: Props) => {
  const toast = useToast();

  const {
    title,
    date,
    startTime,
    endTime,
    description,
    location,
    category,
    notificationTime,
    startTimeError,
    endTimeError,
    repeat,
    resetForm,
  } = useEventFormSelector([
    'title',
    'date',
    'startTime',
    'endTime',
    'description',
    'location',
    'category',
    'notificationTime',
    'isRepeating',
    'startTimeError',
    'endTimeError',
    'repeat',
    'resetForm',
  ]);

  const addOrUpdateEvent = async () => {
    if (!title || !date || !startTime || !endTime) {
      toast({
        title: '필수 정보를 모두 입력해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (startTimeError || endTimeError) {
      toast({
        title: '시간 설정을 확인해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const eventData: Event | TEventForm = {
      id: editingEvent ? editingEvent.id : undefined,
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      repeat,
      notificationTime,
    };

    const overlapping = findOverlappingEvents(eventData, events);
    if (overlapping.length > 0) {
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
    } else {
      await saveEvent(eventData as Event);
      resetForm();
    }
  };

  return { addOrUpdateEvent };
};
