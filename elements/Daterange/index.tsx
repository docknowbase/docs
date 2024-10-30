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

const DateRangePicker = ({
  onRangeSelect,
  initialStartDate,
  initialEndDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState(
    initialStartDate
      ? {
          day: initialStartDate.getDate(),
          month: initialStartDate.getMonth(),
          year: initialStartDate.getFullYear(),
        }
      : null
  );

  const [endDate, setEndDate] = useState(
    initialEndDate
      ? {
          day: initialEndDate.getDate(),
          month: initialEndDate.getMonth(),
          year: initialEndDate.getFullYear(),
        }
      : null
  );

  const [displayMonth, setDisplayMonth] = useState(
    initialStartDate?.getMonth() || new Date().getMonth()
  );
  const [displayYear, setDisplayYear] = useState(
    initialStartDate?.getFullYear() || new Date().getFullYear()
  );

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

    // Previous month days
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

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        month: displayMonth,
        year: displayYear,
        isCurrentMonth: true,
      });
    }

    // Next month days
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

  const getDateTimestamp = (dateObj) => {
    return new Date(dateObj.year, dateObj.month, dateObj.day).getTime();
  };

  const isInRange = (dateObj) => {
    if (!startDate || !endDate) return false;

    const currentTimestamp = getDateTimestamp(dateObj);
    const startTimestamp = getDateTimestamp(startDate);
    const endTimestamp = getDateTimestamp(endDate);

    return currentTimestamp > startTimestamp && currentTimestamp < endTimestamp;
  };

  const handleDateClick = (dateObj) => {
    if (!startDate || (startDate && endDate)) {
      // Start new selection
      setStartDate(dateObj);
      setEndDate(null);
    } else {
      // Complete the range
      const startTimestamp = getDateTimestamp(startDate);
      const clickedTimestamp = getDateTimestamp(dateObj);

      if (clickedTimestamp < startTimestamp) {
        setEndDate(startDate);
        setStartDate(dateObj);
      } else {
        setEndDate(dateObj);
      }

      // Notify parent component
      if (onRangeSelect) {
        const start = new Date(dateObj.year, dateObj.month, dateObj.day);
        const end = new Date(startDate.year, startDate.month, startDate.day);
        onRangeSelect({
          startDate: clickedTimestamp < startTimestamp ? start : end,
          endDate: clickedTimestamp < startTimestamp ? end : start,
        });
      }
    }
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
      (startDate &&
        dateObj.day === startDate.day &&
        dateObj.month === startDate.month &&
        dateObj.year === startDate.year) ||
      (endDate &&
        dateObj.day === endDate.day &&
        dateObj.month === endDate.month &&
        dateObj.year === endDate.year)
    );
  };

  const formatDisplayDate = () => {
    if (!startDate) return "Select date range";

    const formatDate = (date) => {
      return `${MONTHS[date.month]} ${date.day}, ${date.year}`;
    };

    if (!endDate) return `${formatDate(startDate)} - Select end date`;
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  const getDateButtonClasses = (dateObj) => {
    return classNames("datepicker__day", {
      "datepicker__day--other-month": !dateObj.isCurrentMonth,
      "datepicker__day--selected": isSelected(dateObj),
      "datepicker__day--in-range": isInRange(dateObj),
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

export default DateRangePicker;
