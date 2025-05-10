import React, { useEffect, useState } from "react";
import {
  FileText,
  PlusCircle,
  Trash2,
  Send,
  FileCode,
  Calendar,
  ShieldAlert,
  CircleDollarSign,
  Pen
} from "lucide-react";
import { useNavigate } from "react-router";

export default function TopElement({ type = "cases" }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState({
    icon: <FileText className="w-6 h-6 text-blue-600" />,
  });

  useEffect(() => {
    if (type === "calendar") {
      setName("Мероприятия");
      setIcon({ icon: <Calendar className="w-6 h-6 text-blue-600" /> });
    } 
  }, []);

  function handleClick() {
    if (type === "cases") {
      navigate("/add_case");
    } else if (type === "in_corr") {
      navigate("/in_corr/+");
    } else if (type === "out_corr") {
      navigate("/out_corr/+");
    } else if(type === "calendar") {
      navigate("/event/+")
    } else if(type === "appeals") {
      navigate("/appeals/+")
    }
  }

  return (
    <div className="flex items-center justify-between px-5 pt-5 bg-gray-100 border-b-1 pb-5">
      <div className="flex items-center space-x-2">
        {icon.icon}

        <h2 className="text-lg font-semibold">{name}</h2>
      </div>
      {type !== "finance" && (
        <div className="flex items-center gap-2">
          <button
            onClick={handleClick}
            className="flex items-center gap-1 px-3 py-1 cursor-pointer bg-green-500 text-white rounded hover:bg-green-600"
          >
            <PlusCircle className="w-4 h-4 " />
            Добавить
          </button>
          <button className="flex items-center gap-1 px-3 cursor-pointer py-1 bg-red-500 text-white rounded hover:bg-red-600">
            <Trash2 className="w-4 h-4 " />
            Удалить
          </button>
        </div>
      )}
    </div>
  );
}
