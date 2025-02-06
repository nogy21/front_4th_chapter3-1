import {
  Alert,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  CloseButton,
  Flex,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useRef, useState } from 'react';

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
  const cancelRef = useRef<HTMLButtonElement>(null);
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
      <AlertDialog
        isOpen={isOverlapDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsOverlapDialogOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              일정 겹침 경고
            </AlertDialogHeader>

            <AlertDialogBody>
              다음 일정과 겹칩니다:
              {overlappingEvents.map((event) => (
                <Text key={event.id}>
                  {event.title} ({event.date} {event.startTime}-{event.endTime})
                </Text>
              ))}
              계속 진행하시겠습니까?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsOverlapDialogOpen(false)}>
                취소
              </Button>
              <Button
                colorScheme='red'
                onClick={() => {
                  setIsOverlapDialogOpen(false);
                  saveEvent({
                    id: editingEvent ? editingEvent.id : undefined,
                    title,
                    date,
                    startTime,
                    endTime,
                    description,
                    location,
                    category,
                    repeat: {
                      type: isRepeating ? repeatType : 'none',
                      interval: repeatInterval,
                      endDate: repeatEndDate || undefined,
                    },
                    notificationTime,
                  });
                }}
                ml={3}
              >
                계속 진행
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* 알림 모달 */}
      {notifications.length > 0 && (
        <VStack position='fixed' top={4} right={4} spacing={2} align='flex-end'>
          {notifications.map((notification, index) => (
            <Alert key={index} status='info' variant='solid' width='auto'>
              <AlertIcon />
              <Box flex='1'>
                <AlertTitle fontSize='sm'>{notification.message}</AlertTitle>
              </Box>
              <CloseButton
                onClick={() => setNotifications((prev) => prev.filter((_, i) => i !== index))}
              />
            </Alert>
          ))}
        </VStack>
      )}
    </Box>
  );
}

export default App;
