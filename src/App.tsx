import { Box, Flex } from '@chakra-ui/react';
import { useState } from 'react';

import { AlertNotificationDialog } from './components/AlertNotificationDialog';
import { AlertOverlapDialog } from './components/AlertOverlapDialog';
import { CalendarView } from './components/CalendarView';
import { EventForm } from './components/EventForm';
import { SearchView } from './components/SearchView';
import { useCalendarView } from './hooks/useCalendarView';
import { useEventForm } from './hooks/useEventForm';
import { useEventOperations } from './hooks/useEventOperations';
import { useNotifications } from './hooks/useNotifications';
import type { Event } from './types';

function App() {
  const {
    title,
    setTitle,
    date,
    setDate,
    startTime,
    endTime,
    description,
    setDescription,
    location,
    setLocation,
    category,
    setCategory,
    isRepeating,
    setIsRepeating,
    repeatType,
    setRepeatType,
    repeatInterval,
    setRepeatInterval,
    repeatEndDate,
    setRepeatEndDate,
    notificationTime,
    setNotificationTime,
    startTimeError,
    endTimeError,
    editingEvent,
    setEditingEvent,
    handleStartTimeChange,
    handleEndTimeChange,
    resetForm,
    editEvent,
  } = useEventForm();

  const { events, saveEvent, deleteEvent } = useEventOperations(Boolean(editingEvent), () =>
    setEditingEvent(null),
  );

  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();

  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
  const eventForm = {
    title,
    date,
    startTime,
    endTime,
    description,
    location,
    category,
    notificationTime,
    isRepeating,
    repeat: {
      type: isRepeating ? repeatType : 'none',
      interval: repeatInterval,
      endDate: repeatEndDate || undefined,
    },
    startTimeError,
    endTimeError,
  };
  const eventHandlers = {
    setTitle,
    setDate,
    setDescription,
    setLocation,
    setCategory,
    setNotificationTime,
    setIsRepeating,
    setRepeatType,
    setRepeatInterval,
    setRepeatEndDate,
    setOverlappingEvents,
    setIsOverlapDialogOpen,
    handleStartTimeChange,
    handleEndTimeChange,
    saveEvent,
    resetForm,
  };

  return (
    <Box w='full' h='100vh' m='auto' p={5}>
      <Flex gap={6} h='full'>
        {/* 일정 추가/수정 폼 */}
        <EventForm
          events={events}
          eventForm={eventForm}
          eventHandlers={eventHandlers}
          editingEvent={editingEvent}
        />

        {/* 일정 보기 영역 */}
        <CalendarView
          view={view}
          currentDate={currentDate}
          events={events}
          notifiedEvents={notifiedEvents}
          holidays={holidays}
          navigate={navigate}
          setView={setView}
        />

        {/* 일정 검색 영역 */}
        <SearchView
          events={events}
          currentDate={currentDate}
          view={view}
          editEvent={editEvent}
          deleteEvent={deleteEvent}
          notifiedEvents={notifiedEvents}
        />
      </Flex>

      {/* 일정 겹침 경고 모달 */}
      <AlertOverlapDialog
        isOpen={isOverlapDialogOpen}
        onClose={() => setIsOverlapDialogOpen(false)}
        overlappingEvents={overlappingEvents}
        saveEvent={saveEvent}
        editingEvent={editingEvent}
      />

      {/* 알림 모달 */}
      <AlertNotificationDialog notifications={notifications} setNotifications={setNotifications} />
    </Box>
  );
}

export default App;
