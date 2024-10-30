import React, { useState, useEffect, useRef } from "react";
import classNames from "classnames";
import "./styles.scss";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
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

const DatePicker = ({ onDateSelect, initialDate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState({
    day: initialDate?.getDate() || new Date().getDate(),
    month: initialDate?.getMonth() || new Date().getMonth(),
    year: initialDate?.getFullYear() || new Date().getFullYear(),
  });

  const [displayMonth, setDisplayMonth] = useState(selectedDate.month);
  const [displayYear, setDisplayYear] = useState(selectedDate.year);

  const datePickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  };

  const getDaysInMonth = (month, year) => {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return month === 1 && isLeapYear(year) ? 29 : daysInMonth[month];
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(displayMonth, displayYear);
    const firstDay = getFirstDayOfMonth(displayMonth, displayYear);
    const days = [];

    const prevMonth = displayMonth === 0 ? 11 : displayMonth - 1;
    const prevYear = displayMonth === 0 ? displayYear - 1 : displayYear;
    const prevMonthDays = getDaysInMonth(prevMonth, prevYear);

    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        month: prevMonth,
        year: prevYear,
        isCurrentMonth: false,
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        month: displayMonth,
        year: displayYear,
        isCurrentMonth: true,
      });
    }

    const nextMonth = displayMonth === 11 ? 0 : displayMonth + 1;
    const nextYear = displayMonth === 11 ? displayYear + 1 : displayYear;
    let nextMonthDay = 1;

    while (days.length < 42) {
      days.push({
        day: nextMonthDay,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false,
      });
      nextMonthDay++;
    }

    return days;
  };

  const handleDateClick = (dateObj) => {
    setSelectedDate({
      day: dateObj.day,
      month: dateObj.month,
      year: dateObj.year,
    });

    if (dateObj.month !== displayMonth) {
      setDisplayMonth(dateObj.month);
      setDisplayYear(dateObj.year);
    }

    const selectedDateObj = new Date(dateObj.year, dateObj.month, dateObj.day);
    onDateSelect?.(selectedDateObj);
    setIsOpen(false);
  };

  const navigateMonth = (direction) => {
    if (direction === "prev") {
      if (displayMonth === 0) {
        setDisplayMonth(11);
        setDisplayYear((prev) => prev - 1);
      } else {
        setDisplayMonth((prev) => prev - 1);
      }
    } else {
      if (displayMonth === 11) {
        setDisplayMonth(0);
        setDisplayYear((prev) => prev + 1);
      } else {
        setDisplayMonth((prev) => prev + 1);
      }
    }
  };

  const isToday = (dateObj) => {
    const today = new Date();
    return (
      dateObj.day === today.getDate() &&
      dateObj.month === today.getMonth() &&
      dateObj.year === today.getFullYear()
    );
  };

  const isSelected = (dateObj) => {
    return (
      dateObj.day === selectedDate.day &&
      dateObj.month === selectedDate.month &&
      dateObj.year === selectedDate.year
    );
  };

  const formatDisplayDate = () => {
    return `${MONTHS[selectedDate.month]} ${selectedDate.day}, ${
      selectedDate.year
    }`;
  };

  const getDateButtonClasses = (dateObj) => {
    return classNames("datepicker__day", {
      "datepicker__day--other-month": !dateObj.isCurrentMonth,
      "datepicker__day--selected": isSelected(dateObj),
      "datepicker__day--today": isToday(dateObj),
    });
  };

  return (
    <div className="datepicker" ref={datePickerRef}>
      <div
        className={classNames("datepicker__input", {
          "datepicker__input--focused": isOpen,
        })}
        onClick={() => setIsOpen(!isOpen)}
      >
        {formatDisplayDate()}
      </div>

      {isOpen && (
        <div className="datepicker__calendar datepicker__calendar--visible">
          <div className="datepicker__header">
            <button
              className="datepicker__nav_button datepicker__nav_button--prev"
              onClick={() => navigateMonth("prev")}
              type="button"
            >
              ←
            </button>
            <div className="datepicker__month_display">
              {MONTHS[displayMonth]} {displayYear}
            </div>
            <button
              className="datepicker__nav_button datepicker__nav_button--next"
              onClick={() => navigateMonth("next")}
              type="button"
            >
              →
            </button>
          </div>

          <div className="datepicker__weekdays">
            {DAYS.map((day) => (
              <div key={day} className="datepicker__weekday">
                {day}
              </div>
            ))}
          </div>

          <div className="datepicker__days_grid">
            {generateCalendarDays().map((dateObj, index) => (
              <button
                key={`${dateObj.year}-${dateObj.month}-${dateObj.day}`}
                onClick={() => handleDateClick(dateObj)}
                className={getDateButtonClasses(dateObj)}
                type="button"
              >
                {dateObj.day}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
