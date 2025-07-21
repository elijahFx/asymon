import { useNavigate } from "react-router";
import { useDeleteBunkerEventMutation } from "../apis/bunkerEventsApi";
import { useDeleteJungleEventMutation } from "../apis/jungleEventsApi";
import { useDeleteMonopolyEventMutation } from "../apis/monopolyEventsApi";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const STATUS_COLORS = {
  Новое: "bg-red-500",
  "Ждем предоплату": "bg-orange-400",
  "Предоплата внесена": "bg-[#3174AD]",
};

const CalendarEventComponent = ({ event }) => {
  const navigate = useNavigate();

  const isAmeteur = event.isAmateur === 0 ? "Взрослый" : "Детский"
  

  const [deleteBunker] = useDeleteBunkerEventMutation();
  const [deleteJungle] = useDeleteJungleEventMutation();
  const [deleteMonopoly] = useDeleteMonopolyEventMutation();

  const handleClick = (e) => {
    if (e.target.closest(".delete-btn")) return;

    const getEventPath = () => {
      switch (event.resource?.place) {
        case "jungle":
          return `/jungle/event/${event.id}`;
        case "bunker":
          return `/bunker/event/${event.id}`;
        case "monopoly":
        default:
          return `/event/${event.id}`;
      }
    };

    navigate(getEventPath());
  };

  const confirmDelete = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    const toastId = toast.info(
      <div className="max-w-xs p-2">
        <div className="mb-3 text-sm">Вы уверены, что хотите удалить мероприятие?</div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toast.dismiss(toastId);
              toast.clearWaitingQueue();
            }}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toast.dismiss(toastId);
              handleDelete();
            }}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Удалить
          </button>
        </div>
      </div>,
      {
        position: "bottom-center",
        autoClose: false,
        closeButton: false,
        closeOnClick: false,
        draggable: false,
        className: "!w-auto !max-w-full",
      }
    );
  };

  const handleDelete = async () => {
    try {
      let result;
      switch (event.resource?.place) {
        case "jungle":
          result = await deleteJungle(event.id);
          break;
        case "bunker":
          result = await deleteBunker(event.id);
          break;
        case "monopoly":
        default:
          result = await deleteMonopoly(event.id);
          break;
      }

      if (result.error) throw new Error(result.error);

      toast.success("Мероприятие успешно удалено", {
        position: "bottom-right",
        autoClose: 3000,
      });
    } catch (error) {
      toast.error("Ошибка при удалении мероприятия", {
        position: "bottom-right",
        autoClose: 5000,
      });
      console.error("Delete error:", error);
    }
  };

  const eventColor = STATUS_COLORS[event.status] || "bg-gray-500";

  return (
    <div
      onClick={handleClick}
      className={`${eventColor} text-white p-1 rounded cursor-pointer hover:opacity-90 transition-opacity relative`}
    >
      <button
        onClick={confirmDelete}
        className="cursor-pointer delete-btn absolute -top-0 -right-0 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
        aria-label="Удалить мероприятие"
      >
        <X size={14} className="text-gray-700" />
      </button>

      <strong className="pr-4 block">{event.title}</strong>
      <small className="pr-4 block">{event.resource.phone}</small>
      <div className="text-xs">{isAmeteur}</div>
      {event.resource?.place && (
        <div className="text-xs italic mt-1">
          {event.resource.place === "jungle"
            ? "Джуманджи"
            : event.resource.place === "bunker"
            ? "Бункер"
            : "Монополия"}
        </div>
      )}
    </div>
  );
};

export default CalendarEventComponent;