import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import { format, parseISO } from "date-fns";
import { cn, Button, buttonVariants, Input, Textarea } from "@lumia/ui"; // Assuming @lumia/ui is your UI library
import { Plus } from "lucide-react";
import { useAppStore } from "@/store/appStore"; // Assuming your store setup
import PageNavbar from "@/components/pageNavbar"; // Assuming this component exists

// Event Type (description field is used for notes)
interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  description?: string; // This field stores the notes
}

// Modal component for creating/editing events (notes)
const EventModal = ({
  isOpen,
  onClose,
  onSave,
  initialEvent,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  initialEvent?: CalendarEvent;
}) => {
  const [title, setTitle] = useState(initialEvent?.title || "");
  const [start, setStart] = useState(
    initialEvent?.start
      ? format(parseISO(initialEvent.start), "yyyy-MM-dd'T'HH:mm")
      : "",
  );
  const [end, setEnd] = useState(
    initialEvent?.end ? format(parseISO(initialEvent.end), "yyyy-MM-dd'T'HH:mm") : "",
  );
  const [description, setDescription] = useState(initialEvent?.description || "");

  const handleSave = () => {
    onSave({
      id: initialEvent?.id || Math.random().toString(36).slice(2),
      title,
      start: new Date(start).toISOString(),
      end: new Date(end).toISOString(),
      description,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 font-sans">
      <div className="w-full max-w-md rounded-lg bg-neutral-100 p-6 dark:bg-neutral-900">
        <h2 className="mb-4 text-lg font-normal text-neutral-700 dark:text-neutral-400 font-sans">
          {initialEvent?.title || (initialEvent?.start && !initialEvent?.id && !initialEvent.title) ? "New Note / Event" : initialEvent ? "Edit Event" : "New Event"}
        </h2>
        <div className="space-y-4">
          <Input
            placeholder="Event Title (optional for notes)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-neutral-200 dark:bg-neutral-800 font-sans font-normal text-neutral-700 dark:text-neutral-400"
          />
          <Input
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="bg-neutral-200 dark:bg-neutral-800 font-sans font-normal text-neutral-700 dark:text-neutral-400"
          />
          <Input
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="bg-neutral-200 dark:bg-neutral-800 font-sans font-normal text-neutral-700 dark:text-neutral-400"
          />
          <Textarea
            placeholder="Notes / Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-neutral-200 dark:bg-neutral-800 font-sans font-normal text-neutral-700 dark:text-neutral-400"
            rows={4}
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className="font-sans font-normal text-neutral-700 dark:text-neutral-400"
            >
              Cancel
            </Button>
            <Button
              className="bg-sky-300 text-neutral-700 hover:bg-sky-400 dark:bg-sky-500 dark:text-neutral-400 dark:hover:bg-sky-600 font-sans font-normal"
              onClick={handleSave}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CalendarPage = () => {
  const [events, setEvents] = useAppStore((state) => [state.events, state.setEvents]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>(undefined);

  const handleDateClick = (arg: { dateStr: string }) => {
    setSelectedEvent({
      id: Math.random().toString(36).slice(2),
      title: "",
      start: arg.dateStr,
      end: arg.dateStr,
      description: "",
    });
    setIsModalOpen(true);
  };

  const handleEventClick = (arg: { event: { id: string; title: string; start: Date | null; end: Date | null; extendedProps: { description?: string } } }) => {
    setSelectedEvent({
      id: arg.event.id,
      title: arg.event.title,
      start: arg.event.start?.toISOString() || "",
      end: arg.event.end?.toISOString() || "",
      description: arg.event.extendedProps.description,
    });
    setIsModalOpen(true);
  };

  // Saving the event (or note)
  const handleSaveEvent = (newEvent: CalendarEvent) => {
    const updatedEvents = [
      ...events.filter((e: CalendarEvent) => e.id !== newEvent.id), // Explicitly type 'e'
      newEvent,
    ];
    setEvents(updatedEvents); // Pass the new array directly
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 font-sans">
      <PageNavbar title="Calendar" border={false}>
        <Button
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "bg-sky-100 text-neutral-700 hover:bg-sky-200 dark:bg-sky-300 dark:text-neutral-400 dark:hover:bg-sky-400 mt-2 ml-4 font-sans font-normal",
          )}
          onClick={() => {
            // Removed unused 'todayStr'
            setSelectedEvent({
                id: Math.random().toString(36).slice(2),
                title: "",
                start: format(new Date(), "yyyy-MM-dd'T'HH:mm"), // Default to current time
                end: format(new Date(Date.now() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"), // Default to one hour from now
                description: ""
            });
            setIsModalOpen(true);
          }}
        >
          <Plus size={16} className="mr-2" />
          New Event
        </Button>
      </PageNavbar>
      <div className="p-4">
        <div className="rounded-lg bg-neutral-200/50 p-4 dark:bg-neutral-800/50 font-sans">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listYear",
            }}
            events={events}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            editable
            selectable
            eventBackgroundColor="rgba(255, 192, 203, 0.8)" 
            eventBorderColor="rgba(255, 182, 193, 1)"
            eventTextColor="#4b5563" 
            height="calc(100vh - 100px)"
            buttonText={{
              today: "Today",
              month: "Month",
              week: "Week",
              day: "Day",
              list: "Year",
            }}
          />
        </div>
      </div>
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        initialEvent={selectedEvent}
      />
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .fc {
          font-family: "Inter", system-ui, sans-serif !important;
          font-weight: 400 !important;
        }
        .fc-button {
          background-color: #bae6fd !important;
          border-color: #7dd3fc !important;
          color: #4b5563 !important; 
          font-family: "Inter", system-ui, sans-serif !important;
          font-weight: 400 !important;
        }
        .fc-button:hover {
          background-color: #7dd3fc !important;
        }
        .fc-button.fc-button-active,
        .fc-button:focus {
          background-color: #38bdf8 !important;
          border-color: #38bdf8 !important;
        }
        .fc-event {
          font-family: "Inter", system-ui, sans-serif !important;
          font-weight: 400 !important;
        }
        .fc-toolbar-title {
          font-family: "Inter", system-ui, sans-serif !important;
          font-weight: 400 !important;
          color: #4b5563 !important;
        }
        .fc-day-today {
          background-color: rgba(186, 230, 253, 0.4) !important; 
          border-color: #7dd3fc !important; 
        }
        .fc-day-today .fc-daygrid-day-number {
          background-color: #38bdf8 !important; 
          color: #ffffff !important;
          border-radius: 9999px;
          padding: 2px 8px;
        }
      `}}
      />
    </div>
  );
};

export default CalendarPage;