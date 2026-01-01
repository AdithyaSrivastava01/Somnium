"""
Server-Sent Events (SSE) manager for real-time patient data updates.
"""

import asyncio
import json
from typing import Dict, Set
from uuid import UUID


class SSEEventManager:
    """
    Manages SSE subscriptions per patient for real-time updates.

    Uses in-memory pub/sub pattern where:
    - Each patient has a set of subscriber queues
    - Events published to a patient are broadcast to all subscribers
    - Supports multiple concurrent clients per patient
    """

    def __init__(self) -> None:
        """Initialize the event manager with empty subscribers."""
        self._subscribers: Dict[str, Set[asyncio.Queue]] = {}
        self._lock = asyncio.Lock()

    async def subscribe(self, patient_id: str, queue: asyncio.Queue) -> None:
        """
        Subscribe a client queue to receive events for a patient.

        Args:
            patient_id: UUID string of the patient
            queue: Asyncio queue for sending events to the client
        """
        async with self._lock:
            if patient_id not in self._subscribers:
                self._subscribers[patient_id] = set()
            self._subscribers[patient_id].add(queue)

    async def unsubscribe(self, patient_id: str, queue: asyncio.Queue) -> None:
        """
        Unsubscribe a client queue from patient events.

        Args:
            patient_id: UUID string of the patient
            queue: Queue to remove from subscribers
        """
        async with self._lock:
            if patient_id in self._subscribers:
                self._subscribers[patient_id].discard(queue)
                # Clean up empty subscriber sets
                if not self._subscribers[patient_id]:
                    del self._subscribers[patient_id]

    async def publish(self, patient_id: str, event_type: str, data: dict) -> None:
        """
        Publish an event to all subscribers of a patient.

        Args:
            patient_id: UUID string of the patient
            event_type: Type of event (e.g., 'vitals_update', 'alert', 'prediction')
            data: Event data dictionary
        """
        async with self._lock:
            if patient_id not in self._subscribers:
                return

            # Create SSE-formatted event
            event = {
                "event": event_type,
                "data": data,
                "patient_id": patient_id,
            }

            # Send to all subscribers (non-blocking)
            dead_queues = set()
            for queue in self._subscribers[patient_id]:
                try:
                    queue.put_nowait(event)
                except asyncio.QueueFull:
                    # Mark queue for removal if full
                    dead_queues.add(queue)

            # Clean up dead queues
            for queue in dead_queues:
                self._subscribers[patient_id].discard(queue)

    def get_subscriber_count(self, patient_id: str) -> int:
        """
        Get the number of active subscribers for a patient.

        Args:
            patient_id: UUID string of the patient

        Returns:
            int: Number of active subscribers
        """
        return len(self._subscribers.get(patient_id, set()))

    async def broadcast_all(self, event_type: str, data: dict) -> None:
        """
        Broadcast an event to all patients (e.g., system-wide alerts).

        Args:
            event_type: Type of event
            data: Event data dictionary
        """
        async with self._lock:
            for patient_id in list(self._subscribers.keys()):
                await self.publish(patient_id, event_type, data)


# Global singleton instance
event_manager = SSEEventManager()
