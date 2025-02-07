import { useState } from 'react';

import type { Event } from '../types';

export function useOverlapDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);

  return { isOpen, setIsOpen, overlappingEvents, setOverlappingEvents };
}
