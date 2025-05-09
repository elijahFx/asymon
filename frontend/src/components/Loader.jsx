import React from "react";

export default function Loader() {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-white bg-opacity-80 z-50">
      <div className="three-body">
        <div className="three-body__dot"></div>
        <div className="three-body__dot"></div>
        <div className="three-body__dot"></div>
      </div>
    </div>
  );
}