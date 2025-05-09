// Row.jsx
import React from "react";
import { Link } from "react-router";

export default function Row({
  id,
  consumer,
  performer,
  nature,
  disputeArea,
  responsible,
  status,
  dateAdded,
}) {
  return (
    <div className="grid grid-cols-8 gap-2 py-4 px-4 border-b border-gray-200 hover:bg-gray-50 text-sm min-h-[60px]">
      <div className="text-gray-700 flex items-center justify-center content-center text-center ">
        <Link to={`/cases/${id}`}>
          <span className="text-blue-500 underline">{id}</span>
        </Link>
      </div>
      <div className="text-gray-800 font-medium flex items-center text-center ">
        {consumer}
      </div>
      <div className="text-gray-600 flex items-center text-center  justify-center content-center">
        {performer}
      </div>
      <div className="text-gray-600 flex items-center text-center  justify-center content-center">
        {nature}
      </div>
      <div className="text-gray-600 flex items-center text-center  justify-center content-center">
        {disputeArea}
      </div>
      <div className="text-gray-700 flex items-center text-center  justify-center content-center">
        {responsible}
      </div>
      <div className="text-gray-600 flex items-center text-center justify-center content-center">
        {status}
      </div>
      <div className="text-gray-500 flex items-center text-center justify-center content-center">
        {dateAdded}
      </div>
    </div>
  );
}
