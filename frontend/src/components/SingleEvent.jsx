import React from "react";
import { Link } from "react-router";

export default function SingleEvent({
  court_name,
  id,
  time,
  date,
  employee,
  type,
  liabelee,
  suitor,
  caseNum,
}) {
  // Определяем цвет в зависимости от типа события
  const borderColor = type === "Дежурство" ? "#ffc107" : "#FF7575";

  return (
    <div
      className={`
        flex items-center 
        p-2 mb-2 
        rounded 
        bg-gray-50 
        shadow-sm
        hover:bg-gray-100
        transition-colors
      `}
      style={{ borderLeft: `7px solid ${borderColor}` }}
    >
      <div className="font-bold mr-3 w-12">{time}</div>
      <div className="flex-1">
        <div className="font-medium">
          {type === "Дежурство" ? "Дежурство" : court_name}
        </div>
        <div className="font-medium">{employee}</div>

        {type === "Дежурство" ? (
          <></>
        ) : (
          <>
            <div className="text-sm text-gray-600">
              {suitor} к {liabelee}
            </div>
            <div className="text-sm cursor-pointer text-[#0C1B60] text-underline">
              <Link to={`/cases/${caseNum}`}>Дело № {caseNum}</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
