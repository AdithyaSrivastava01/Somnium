"""Test SSE Event Manager"""

import asyncio
import pytest
from app.core.events import SSEEventManager


@pytest.mark.asyncio
async def test_sse_subscribe_unsubscribe():
    """Test subscribing and unsubscribing to events"""
    manager = SSEEventManager()
    queue = asyncio.Queue()
    patient_id = "test-patient-123"

    # Subscribe
    await manager.subscribe(patient_id, queue)
    assert manager.get_subscriber_count(patient_id) == 1

    # Unsubscribe
    await manager.unsubscribe(patient_id, queue)
    assert manager.get_subscriber_count(patient_id) == 0


@pytest.mark.asyncio
async def test_sse_publish_event():
    """Test publishing events to subscribers"""
    manager = SSEEventManager()
    queue = asyncio.Queue()
    patient_id = "test-patient-456"

    await manager.subscribe(patient_id, queue)

    # Publish event
    test_data = {"vitals": {"heart_rate": 80, "bp": "120/80"}}
    await manager.publish(patient_id, "vitals_update", test_data)

    # Check event received
    event = await asyncio.wait_for(queue.get(), timeout=1.0)
    assert event["event"] == "vitals_update"
    assert event["data"] == test_data
    assert event["patient_id"] == patient_id

    await manager.unsubscribe(patient_id, queue)


@pytest.mark.asyncio
async def test_sse_multiple_subscribers():
    """Test multiple subscribers to same patient"""
    manager = SSEEventManager()
    queue1 = asyncio.Queue()
    queue2 = asyncio.Queue()
    patient_id = "test-patient-789"

    await manager.subscribe(patient_id, queue1)
    await manager.subscribe(patient_id, queue2)
    assert manager.get_subscriber_count(patient_id) == 2

    # Publish event
    test_data = {"alert": "high_lactate"}
    await manager.publish(patient_id, "alert", test_data)

    # Both queues should receive event
    event1 = await asyncio.wait_for(queue1.get(), timeout=1.0)
    event2 = await asyncio.wait_for(queue2.get(), timeout=1.0)

    assert event1["event"] == "alert"
    assert event2["event"] == "alert"

    await manager.unsubscribe(patient_id, queue1)
    await manager.unsubscribe(patient_id, queue2)


if __name__ == "__main__":
    asyncio.run(test_sse_subscribe_unsubscribe())
    asyncio.run(test_sse_publish_event())
    asyncio.run(test_sse_multiple_subscribers())
    print("✅ All SSE Event Manager tests passed!")
