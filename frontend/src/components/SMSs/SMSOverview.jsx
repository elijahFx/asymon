import React from "react";
import SMSPage from "./SMSPage";
import SMSPreview from "./SMSPreview";

export default function SMSOverview() {
  return (
    <div className="p-4 ml-2 mt-[12vh] bg-white rounded-lg shadow space-y-6 flex gap-2 flex-row w-[100%] items-start">
      <SMSPage />
      <SMSPreview />
    </div>
  );
}
