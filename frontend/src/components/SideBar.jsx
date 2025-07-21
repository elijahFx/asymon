import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  ShieldUser,
  Citrus,
  List,
  MessageSquareMore,
  Eye,
  LoaderCircle
} from "lucide-react";
import { Link } from "react-router";

const SideBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      label: "Монополия",
      icon: <Calendar color="red" />,
      link: "/main",
    },
    {
      label: "Джуманджи",
      icon: <Citrus color="green" />,
      link: "/jungle",
    },
    {
      label: "Бункер",
      icon: <ShieldUser color="gold" />,
      link: "/bunker",
    },
     {
      label: "Общий список",
      icon: <List color="#0C1B60" />,
      link: "/list",
    },
    {
      label: "Просмотр",
      icon: <Eye color="#0C1B60" />,
      link: "/views",
    },
    {
      label: "Лист ожидания",
      icon: <LoaderCircle color="#0C1B60" />,
      link: "/waitings",
    },
    {
      label: "SMS-оповещения",
      icon: <MessageSquareMore color="#0C1B60" />,
      link: "/sms",
    },
  ];

  return (
    <div className="flex h-screen">
      <div
        className={`bg-white transition-all duration-300 ease-in-out mt-[11vh] ${
          isOpen
            ? "w-64 shadow-[2px_0_6px_rgba(0,0,0,0.1)]"
            : "w-20 shadow-[2px_0_6px_rgba(0,0,0,0.1)]"
        }`}
      >
        <div
          className={`flex items-center justify-center px-4 py-4 ${
            isOpen ? "shadow-sm" : ""
          }`}
        >
          <button onClick={() => setIsOpen(!isOpen)} className="text-gray-500">
            {isOpen ? (
              <ChevronLeft color="#0C1B60" className="cursor-pointer" />
            ) : (
              <ChevronRight color="#0C1B60" className="cursor-pointer" />
            )}
          </button>
        </div>

        <nav className="mt-4">
          {menuItems.map((item, idx) => (
            <Link
              key={idx}
              to={item.link}
              className="flex items-center px-6.5 py-3 text-gray-700 hover:bg-gray-100 transition-colors group"
            >
              <div className="w-6 h-6">{item.icon}</div>
              {isOpen && (
                <span className="ml-3 transition-opacity duration-300">
                  {item.label}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default SideBar;
