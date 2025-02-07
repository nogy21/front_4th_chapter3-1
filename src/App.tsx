import { Box, Flex } from '@chakra-ui/react';
import { useState } from 'react';

import { AlertNotificationDialog } from './components/AlertNotificationDialog';
import { AlertOverlapDialog } from './components/AlertOverlapDialog';
import { CalendarView } from './components/CalendarView';
import { EventForm } from './components/EventForm';
import { SearchView } from './components/SearchView';
import { useCalendarView } from './hooks/useCalendarView';
import { useEventOperations } from './hooks/useEventOperations';
import { useNotifications } from './hooks/useNotifications';
import { createStore } from './store/createStore';
import { useEventFormStore } from './store/useEventFormStore';
import type { Event } from './types';

const useEventFormSelector = createStore(useEventFormStore);

function App() {
  const { editingEvent, setEditingEvent, editEvent } = useEventFormSelector([
    'editingEvent',
    'setEditingEvent',
    'editEvent',
  ]);

  const { events, saveEvent, deleteEvent } = useEventOperations(Boolean(editingEvent), () =>
    setEditingEvent(null),
  );

  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();

  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);

  return (
    <Box w='full' h='100vh' m='auto' p={5}>
      <Flex gap={6} h='full'>
        <EventForm
          events={events}
          editingEvent={editingEvent}
          setOverlappingEvents={setOverlappingEvents}
          setIsOverlapDialogOpen={setIsOverlapDialogOpen}
          saveEvent={saveEvent}
        />

        <CalendarView
          view={view}
          currentDate={currentDate}
          events={events}
          notifiedEvents={notifiedEvents}
          holidays={holidays}
          navigate={navigate}
          setView={setView}
        />

        <SearchView
          events={events}
          currentDate={currentDate}
          view={view}
          editEvent={editEvent}
          deleteEvent={deleteEvent}
          notifiedEvents={notifiedEvents}
        />
      </Flex>

      <AlertOverlapDialog
        isOpen={isOverlapDialogOpen}
        onClose={() => setIsOverlapDialogOpen(false)}
        overlappingEvents={overlappingEvents}
        saveEvent={saveEvent}
        editingEvent={editingEvent}
      />

      <AlertNotificationDialog notifications={notifications} setNotifications={setNotifications} />
    </Box>
  );
}

export default App;
