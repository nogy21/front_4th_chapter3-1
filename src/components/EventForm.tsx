import {
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Select,
  Tooltip,
  VStack,
} from '@chakra-ui/react';

import { CATEGORIES, NOTIFICATION_OPTIONS } from '../constants';
import { useAddOrUpdateEvent } from '../hooks/useAddOrUpdateEvent';
import { createStore } from '../store/createStore';
import { useEventFormStore } from '../store/useEventFormStore';
import type { Event, RepeatType } from '../types';
import { getTimeErrorMessage } from '../utils/timeValidation';

const useEventFormSelector = createStore(useEventFormStore);

interface Props {
  events: Event[];
  editingEvent: Event | null;
  setOverlappingEvents: (events: Event[]) => void;
  setIsOverlapDialogOpen: (isOpen: boolean) => void;
  saveEvent: (event: Event) => Promise<void>;
}
export const EventForm = ({
  events,
  editingEvent,
  setOverlappingEvents,
  setIsOverlapDialogOpen,
  saveEvent,
}: Props) => {
  const {
    title,
    date,
    startTime,
    endTime,
    description,
    location,
    category,
    notificationTime,
    isRepeating,
    startTimeError,
    endTimeError,
    repeat,
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
  ]);
  const {
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
    handleStartTimeChange,
    handleEndTimeChange,
  } = useEventFormSelector([
    'setTitle',
    'setDate',
    'setDescription',
    'setLocation',
    'setCategory',
    'setNotificationTime',
    'setIsRepeating',
    'setRepeatType',
    'setRepeatInterval',
    'setRepeatEndDate',
    'handleStartTimeChange',
    'handleEndTimeChange',
  ]);

  const { addOrUpdateEvent } = useAddOrUpdateEvent({
    events,
    editingEvent,
    setOverlappingEvents,
    setIsOverlapDialogOpen,
    saveEvent,
  });

  return (
    <VStack w='400px' spacing={5} align='stretch'>
      <Heading>{editingEvent ? '일정 수정' : '일정 추가'}</Heading>

      <FormControl>
        <FormLabel>제목</FormLabel>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </FormControl>

      <FormControl>
        <FormLabel>날짜</FormLabel>
        <Input type='date' value={date} onChange={(e) => setDate(e.target.value)} />
      </FormControl>

      <HStack width='100%'>
        <FormControl>
          <FormLabel>시작 시간</FormLabel>
          <Tooltip label={startTimeError} isOpen={!!startTimeError} placement='top'>
            <Input
              type='time'
              value={startTime}
              onChange={handleStartTimeChange}
              onBlur={() => getTimeErrorMessage(startTime, endTime)}
              isInvalid={!!startTimeError}
            />
          </Tooltip>
        </FormControl>
        <FormControl>
          <FormLabel>종료 시간</FormLabel>
          <Tooltip label={endTimeError} isOpen={!!endTimeError} placement='top'>
            <Input
              type='time'
              value={endTime}
              onChange={handleEndTimeChange}
              onBlur={() => getTimeErrorMessage(startTime, endTime)}
              isInvalid={!!endTimeError}
            />
          </Tooltip>
        </FormControl>
      </HStack>

      <FormControl>
        <FormLabel>설명</FormLabel>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} />
      </FormControl>

      <FormControl>
        <FormLabel>위치</FormLabel>
        <Input value={location} onChange={(e) => setLocation(e.target.value)} />
      </FormControl>

      <FormControl>
        <FormLabel>카테고리</FormLabel>
        <Select
          aria-label='category-select'
          title='카테고리 선택'
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value=''>카테고리 선택</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>반복 설정</FormLabel>
        <Checkbox isChecked={isRepeating} onChange={(e) => setIsRepeating(e.target.checked)}>
          반복 일정
        </Checkbox>
      </FormControl>

      <FormControl>
        <FormLabel>알림 설정</FormLabel>
        <Select
          aria-label='notification-time'
          title='알림 시간 선택'
          value={notificationTime}
          onChange={(e) => setNotificationTime(Number(e.target.value))}
        >
          {NOTIFICATION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </FormControl>

      {isRepeating && (
        <VStack width='100%'>
          <FormControl>
            <FormLabel>반복 유형</FormLabel>
            <Select
              aria-label='repeat-type-select'
              title='반복 유형 선택'
              value={repeat.type}
              onChange={(e) => setRepeatType(e.target.value as RepeatType)}
            >
              <option value='daily'>매일</option>
              <option value='weekly'>매주</option>
              <option value='monthly'>매월</option>
              <option value='yearly'>매년</option>
            </Select>
          </FormControl>
          <HStack width='100%'>
            <FormControl>
              <FormLabel>반복 간격</FormLabel>
              <Input
                type='number'
                value={repeat.interval}
                onChange={(e) => setRepeatInterval(Number(e.target.value))}
                min={1}
              />
            </FormControl>
            <FormControl>
              <FormLabel>반복 종료일</FormLabel>
              <Input
                type='date'
                value={repeat.endDate}
                onChange={(e) => setRepeatEndDate(e.target.value)}
              />
            </FormControl>
          </HStack>
        </VStack>
      )}

      <Button data-testid='event-submit-button' onClick={addOrUpdateEvent} colorScheme='blue'>
        {editingEvent ? '일정 수정' : '일정 추가'}
      </Button>
    </VStack>
  );
};
