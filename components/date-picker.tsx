"use client";

import { useEffect, useRef, useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameDay,
  isToday,
  getDay,
  parseISO,
} from "date-fns";
import { id as idLocale } from "date-fns/locale";

export default function DatePicker({
  name,
  value,
  onChange,
  placeholder = "Pilih tanggal",
}: {
  name: string;
  value: string; // ISO format YYYY-MM-DD, atau ""
  onChange: (isoDate: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() =>
    value ? parseISO(value) : new Date()
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDate = value ? parseISO(value) : null;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const days = eachDayOfInterval({
    start: startOfMonth(viewMonth),
    end: endOfMonth(viewMonth),
  });
  const leadingBlanks = getDay(startOfMonth(viewMonth)); // 0 = Minggu

  function pickDay(day: Date) {
    onChange(format(day, "yyyy-MM-dd"));
    setOpen(false);
  }

  return (
    <div className="relative" ref={containerRef}>
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="input text-left flex items-center justify-between"
      >
        <span className={selectedDate ? "" : "text-gray-400"}>
          {selectedDate
            ? format(selectedDate, "d MMMM yyyy", { locale: idLocale })
            : placeholder}
        </span>
        <span className="text-gray-400">📅</span>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-72">
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => setViewMonth((m) => subMonths(m, 1))}
              className="text-gray-500 hover:text-brand-700 px-2 py-1"
            >
              ‹
            </button>
            <span className="text-sm font-medium">
              {format(viewMonth, "MMMM yyyy", { locale: idLocale })}
            </span>
            <button
              type="button"
              onClick={() => setViewMonth((m) => addMonths(m, 1))}
              className="text-gray-500 hover:text-brand-700 px-2 py-1"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-1">
            {["M", "S", "S", "R", "K", "J", "S"].map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: leadingBlanks }).map((_, i) => (
              <span key={`blank-${i}`} />
            ))}
            {days.map((day) => {
              const selected = selectedDate && isSameDay(day, selectedDate);
              return (
                <button
                  type="button"
                  key={day.toISOString()}
                  onClick={() => pickDay(day)}
                  className={`text-sm rounded-full h-8 w-8 flex items-center justify-center ${
                    selected
                      ? "bg-brand-600 text-white font-medium"
                      : isToday(day)
                        ? "bg-brand-50 text-brand-700 font-medium"
                        : "hover:bg-gray-100"
                  }`}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className="text-xs text-gray-400 hover:text-red-600 mt-2"
          >
            Kosongkan
          </button>
        </div>
      )}
    </div>
  );
}
