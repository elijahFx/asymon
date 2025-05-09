import React from "react";
import TopElement from "../TopElement";
import CalendarTable from "./CalendarTable";

export default function CalendarOverview() {
  return (
    <div className="mt-[11vh] flex-1">
      <TopElement type="calendar" />
      <CalendarTable />
    </div>
  );
}
