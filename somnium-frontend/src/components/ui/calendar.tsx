"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CalendarProps = {
  mode?: "single";
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  initialFocus?: boolean;
  className?: string;
  disabled?: (date: Date) => boolean;
};

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function Calendar({
  mode = "single",
  selected,
  onSelect,
  className,
  disabled,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(
    selected
      ? new Date(selected.getFullYear(), selected.getMonth(), 1)
      : new Date(),
  );

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Get days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // Generate calendar grid
  const days: (number | null)[] = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }

  // Add days of month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleDayClick = (day: number) => {
    if (onSelect) {
      const newDate = new Date(year, month, day);
      if (disabled && disabled(newDate)) {
        return; // Don't allow selecting disabled dates
      }
      onSelect(newDate);
    }
  };

  const isDisabled = (day: number) => {
    if (!disabled) return false;
    const date = new Date(year, month, day);
    return disabled(date);
  };

  const isSelected = (day: number) => {
    if (!selected) return false;
    return (
      selected.getDate() === day &&
      selected.getMonth() === month &&
      selected.getFullYear() === year
    );
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  return (
    <div className={cn("p-3", className)}>
      {/* Header */}
      <div className="flex justify-center pt-1 relative items-center mb-4">
        <button
          onClick={handlePrevMonth}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1",
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex gap-2 items-center">
          <select
            value={month}
            onChange={(e) =>
              setCurrentMonth(new Date(year, parseInt(e.target.value), 1))
            }
            className="text-sm font-medium bg-transparent border-none focus:outline-none cursor-pointer"
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) =>
              setCurrentMonth(new Date(parseInt(e.target.value), month, 1))
            }
            className="text-sm font-medium bg-transparent border-none focus:outline-none cursor-pointer"
          >
            {Array.from(
              { length: 100 },
              (_, i) => new Date().getFullYear() - 50 + i,
            ).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleNextMonth}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1",
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Calendar Grid */}
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {DAYS.map((day) => (
              <th
                key={day}
                className="text-muted-foreground font-normal text-[0.8rem] h-9 w-9 text-center"
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: Math.ceil(days.length / 7) }).map(
            (_, weekIndex) => (
              <tr key={weekIndex}>
                {days
                  .slice(weekIndex * 7, weekIndex * 7 + 7)
                  .map((day, dayIndex) => (
                    <td key={dayIndex} className="text-center p-0">
                      {day ? (
                        <button
                          onClick={() => handleDayClick(day)}
                          disabled={isDisabled(day)}
                          className={cn(
                            buttonVariants({ variant: "ghost" }),
                            "h-9 w-9 p-0 font-normal",
                            isSelected(day) &&
                              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                            isToday(day) &&
                              !isSelected(day) &&
                              "bg-accent text-accent-foreground",
                            !isDisabled(day) &&
                              "hover:bg-accent hover:text-accent-foreground",
                            isDisabled(day) &&
                              "text-muted-foreground opacity-50 cursor-not-allowed",
                          )}
                        >
                          {day}
                        </button>
                      ) : (
                        <div className="h-9 w-9" />
                      )}
                    </td>
                  ))}
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
