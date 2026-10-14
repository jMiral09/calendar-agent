from datetime import datetime, timedelta
from langchain_core.tools import tool
from agent.google_calendar import get_calendar_service


@tool
def check_calendar(date:str):
    """
    Check Google Calendar events for a specific date.

    Date format:
    YYYY-MM-DD (e.g., 2023-09-15)
    """
    service = get_calendar_service()

    # Implementation for checking calendar events
    start = datetime.fromisoformat(date)
    end = start + timedelta(days=1)

    events_result = (
        service.events().list(
            calendarId = "primary",
            timeMin = start.isoformat() + "Z",
            timeMax = end.isoformat() + "Z",
            singleEvents = True,
            orderBy = "startTime"
        ).execute()
    )

    events = events_result.get("items", [])
    if not events:
        return f"No events found on {date}."

    results = []

    for event in events:
        summary = event.get("summary", "Untitled event")
        start_data = event.get("start", {})
        event_time = start_data.get("dateTime") or start_data.get("date")

        results.append(f"{event_time}: {summary}")

    return "\n".join(results)


@tool
def create_event(title:str, date:str, time:str):
    """
    Create an event on Google Calendar.
    
    Date Format:
    YYYY-MM-DD (e.g., 2023-09-15)
    
    Time Format:
    HH:MM (e.g., 14:30)

    The event will be one hour long.
    """

    service = get_calendar_service()

    start_datetime = datetime.fromisoformat(f"{date}T{time}")
    end_datetime = start_datetime + timedelta(hours=1)

    event = {
        "summary": title,
        "start": {
            "dateTime": start_datetime.isoformat(),
            "timeZone": "Asia/Manila",
        },
        "end": {
            "dateTime": end_datetime.isoformat(),
            "timeZone": "Asia/Manila",
        }
    }

    created_event = service.events().insert(
        calendarId="primary", body=event
    ).execute()

    event_link = created_event.get("htmlLink")

    return (f"Event '{title}' created on {date} at {time}. Google Calendar link: {event_link}")
