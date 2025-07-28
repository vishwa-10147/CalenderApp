import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import './index.css';

function App() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [showModal, setShowModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [customButtons, setCustomButtons] = useState([]);
  const [newButtonText, setNewButtonText] = useState("");
  const [newButtonColor, setNewButtonColor] = useState("#0078D4");
  const [dateTextBoxes, setDateTextBoxes] = useState({});
  const [textBoxContent, setTextBoxContent] = useState({});
  const [savedContent, setSavedContent] = useState({});
  const [displayedSavedContent, setDisplayedSavedContent] = useState({});
  const [tables, setTables] = useState([]);
  const [tableRows, setTableRows] = useState(3);
  const [tableColumns, setTableColumns] = useState(3);
  const [tableData, setTableData] = useState({});
  const [tableTitle, setTableTitle] = useState("");
  
  // New state for calendar enhancements
  const [events, setEvents] = useState({});
  const [specialDates, setSpecialDates] = useState({});
  const [calendarView, setCalendarView] = useState('month'); // 'month', 'week', 'year'
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [userRegion, setUserRegion] = useState('US'); // Default to US
  const [showRegionModal, setShowRegionModal] = useState(false);

  // Public holidays data for different regions
  const publicHolidays = {
    US: {
      "New Year's Day": { month: 0, day: 1, color: "#ff6b6b" },
      "Martin Luther King Jr. Day": { month: 0, day: 15, color: "#4ecdc4", isThirdMonday: true },
      "Presidents' Day": { month: 1, day: 15, color: "#4ecdc4", isThirdMonday: true },
      "Memorial Day": { month: 4, day: 25, color: "#4ecdc4", isLastMonday: true },
      "Independence Day": { month: 6, day: 4, color: "#ff6b6b" },
      "Labor Day": { month: 8, day: 1, color: "#4ecdc4", isFirstMonday: true },
      "Columbus Day": { month: 9, day: 8, color: "#4ecdc4", isSecondMonday: true },
      "Veterans Day": { month: 10, day: 11, color: "#4ecdc4" },
      "Thanksgiving": { month: 10, day: 22, color: "#ff9500", isFourthThursday: true },
      "Christmas Day": { month: 11, day: 25, color: "#ff6b6b" }
    },
    UK: {
      "New Year's Day": { month: 0, day: 1, color: "#ff6b6b" },
      "Good Friday": { month: 3, day: 7, color: "#4ecdc4", isEasterBased: true },
      "Easter Monday": { month: 3, day: 10, color: "#4ecdc4", isEasterBased: true },
      "Early May Bank Holiday": { month: 4, day: 6, color: "#4ecdc4", isFirstMonday: true },
      "Spring Bank Holiday": { month: 4, day: 27, color: "#4ecdc4", isLastMonday: true },
      "Summer Bank Holiday": { month: 7, day: 26, color: "#4ecdc4", isLastMonday: true },
      "Christmas Day": { month: 11, day: 25, color: "#ff6b6b" },
      "Boxing Day": { month: 11, day: 26, color: "#ff6b6b" }
    },
    IN: {
      "Republic Day": { month: 0, day: 26, color: "#ff6b6b" },
      "Independence Day": { month: 7, day: 15, color: "#ff6b6b" },
      "Gandhi Jayanti": { month: 9, day: 2, color: "#4ecdc4" },
      "Christmas Day": { month: 11, day: 25, color: "#ff6b6b" }
    },
    CA: {
      "New Year's Day": { month: 0, day: 1, color: "#ff6b6b" },
      "Good Friday": { month: 3, day: 7, color: "#4ecdc4", isEasterBased: true },
      "Easter Monday": { month: 3, day: 10, color: "#4ecdc4", isEasterBased: true },
      "Victoria Day": { month: 4, day: 20, color: "#4ecdc4", isThirdMonday: true },
      "Canada Day": { month: 6, day: 1, color: "#ff6b6b" },
      "Labour Day": { month: 8, day: 2, color: "#4ecdc4", isFirstMonday: true },
      "Thanksgiving": { month: 9, day: 8, color: "#ff9500", isSecondMonday: true },
      "Christmas Day": { month: 11, day: 25, color: "#ff6b6b" },
      "Boxing Day": { month: 11, day: 26, color: "#ff6b6b" }
    }
  };

  // Function to calculate Easter Sunday (simplified)
  const getEasterSunday = (year) => {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
  };

  // Function to get the nth occurrence of a day in a month
  const getNthDayOfMonth = (year, month, dayOfWeek, n) => {
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay();
    const offset = (dayOfWeek - firstDayOfWeek + 7) % 7;
    const targetDate = new Date(year, month, 1 + offset + (n - 1) * 7);
    return targetDate;
  };

  // Function to get the last occurrence of a day in a month
  const getLastDayOfMonth = (year, month, dayOfWeek) => {
    const lastDay = new Date(year, month + 1, 0);
    const lastDayOfWeek = lastDay.getDay();
    const offset = (lastDayOfWeek - dayOfWeek + 7) % 7;
    const targetDate = new Date(year, month + 1, 0 - offset);
    return targetDate;
  };

  // Function to check if a date is a public holiday
  const isPublicHoliday = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const dayOfWeek = date.getDay();
    
    const holidays = publicHolidays[userRegion];
    if (!holidays) return null;

    for (const [holidayName, holidayData] of Object.entries(holidays)) {
      let isHoliday = false;
      
      if (holidayData.isEasterBased) {
        const easter = getEasterSunday(year);
        const holidayDate = new Date(easter);
        if (holidayData.day === 7) { // Good Friday
          holidayDate.setDate(easter.getDate() - 3);
        } else if (holidayData.day === 10) { // Easter Monday
          holidayDate.setDate(easter.getDate() + 1);
        }
        isHoliday = date.toDateString() === holidayDate.toDateString();
      } else if (holidayData.isFirstMonday) {
        const firstMonday = getNthDayOfMonth(year, month, 1, 1);
        isHoliday = date.toDateString() === firstMonday.toDateString();
      } else if (holidayData.isSecondMonday) {
        const secondMonday = getNthDayOfMonth(year, month, 1, 2);
        isHoliday = date.toDateString() === secondMonday.toDateString();
      } else if (holidayData.isThirdMonday) {
        const thirdMonday = getNthDayOfMonth(year, month, 1, 3);
        isHoliday = date.toDateString() === thirdMonday.toDateString();
      } else if (holidayData.isFourthThursday) {
        const fourthThursday = getNthDayOfMonth(year, month, 4, 4);
        isHoliday = date.toDateString() === fourthThursday.toDateString();
      } else if (holidayData.isLastMonday) {
        const lastMonday = getLastDayOfMonth(year, month, 1);
        isHoliday = date.toDateString() === lastMonday.toDateString();
      } else {
        // Fixed date holiday
        isHoliday = month === holidayData.month && day === holidayData.day;
      }
      
      if (isHoliday) {
        return { name: holidayName, color: holidayData.color };
      }
    }
    
    return null;
  };

  // Function to get all holidays for a month
  const getHolidaysForMonth = (year, month) => {
    const holidays = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const holiday = getHolidaysForDate(date);
      if (holiday) {
        holidays.push({
          date: date,
          name: holiday.name,
          color: holiday.color,
          type: holiday.type || 'Public'
        });
      }
    }
    
    return holidays;
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    // Show saved content when date is clicked
    const dateKey = date.toDateString();
    const textBoxesForDate = dateTextBoxes[dateKey] || [];
    const newDisplayedContent = {};
    
    textBoxesForDate.forEach(textBox => {
      if (savedContent[textBox.id]) {
        newDisplayedContent[textBox.id] = savedContent[textBox.id];
      }
    });
    
    setDisplayedSavedContent(newDisplayedContent);
  };

  const createCustomButton = () => {
    if (newButtonText.trim()) {
      const newButton = {
        id: Date.now(),
        text: newButtonText,
        color: newButtonColor,
        date: selectedDate.toDateString()
      };
      setCustomButtons([...customButtons, newButton]);
      setNewButtonText("");
      setShowModal(false);
    }
  };

  const createTable = () => {
    const newTable = {
      id: Date.now(),
      rows: tableRows,
      columns: tableColumns,
      title: tableTitle.trim() || `Day-to-Day Work Table (${tableRows}x${tableColumns})`
    };
    
    setTables([...tables, newTable]);
    
    // Initialize table data with empty cells
    const initialData = {};
    for (let i = 0; i < tableRows; i++) {
      for (let j = 0; j < tableColumns; j++) {
        initialData[`${newTable.id}-${i}-${j}`] = "";
      }
    }
    setTableData(prev => ({ ...prev, ...initialData }));
    
    setShowTableModal(false);
    setTableRows(3);
    setTableColumns(3);
    setTableTitle("");
  };

  const updateTableCell = (tableId, row, col, value) => {
    const cellKey = `${tableId}-${row}-${col}`;
    setTableData(prev => ({
      ...prev,
      [cellKey]: value
    }));
  };

  const saveTable = (tableId) => {
    alert("Table saved successfully!");
  };

  const deleteTable = (tableId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this table?");
    if (confirmDelete) {
      setTables(tables.filter(table => table.id !== tableId));
      
      // Remove table data
      const newTableData = { ...tableData };
      Object.keys(newTableData).forEach(key => {
        if (key.startsWith(`${tableId}-`)) {
          delete newTableData[key];
        }
      });
      setTableData(newTableData);
    }
  };

  const deleteButton = (buttonId) => {
    const buttonToDelete = customButtons.find(btn => btn.id === buttonId);
    if (buttonToDelete) {
      const confirmDelete = window.confirm(
        `Are you sure you want to delete the button "${buttonToDelete.text}"? This will also delete all text boxes and data created by this button across all dates.`
      );
      
      if (confirmDelete) {
        // Remove the button from custom buttons
        setCustomButtons(customButtons.filter(btn => btn.id !== buttonId));
        
        // Find and remove all text boxes created by this button across all dates
        const updatedDateTextBoxes = {};
        Object.keys(dateTextBoxes).forEach(dateKey => {
          const textBoxesForDate = dateTextBoxes[dateKey] || [];
          const filteredTextBoxes = textBoxesForDate.filter(textBox => 
            textBox.buttonText !== buttonToDelete.text || textBox.buttonColor !== buttonToDelete.color
          );
          
          if (filteredTextBoxes.length > 0) {
            updatedDateTextBoxes[dateKey] = filteredTextBoxes;
          }
        });
        
        setDateTextBoxes(updatedDateTextBoxes);
        
        // Remove associated content and saved content
        const textBoxIdsToRemove = [];
        Object.values(dateTextBoxes).forEach(textBoxes => {
          textBoxes.forEach(textBox => {
            if (textBox.buttonText === buttonToDelete.text && textBox.buttonColor === buttonToDelete.color) {
              textBoxIdsToRemove.push(textBox.id);
            }
          });
        });
        
        setTextBoxContent(prev => {
          const newContent = { ...prev };
          textBoxIdsToRemove.forEach(id => {
            delete newContent[id];
          });
          return newContent;
        });
        
        setSavedContent(prev => {
          const newContent = { ...prev };
          textBoxIdsToRemove.forEach(id => {
            delete newContent[id];
          });
          return newContent;
        });
        
        setDisplayedSavedContent(prev => {
          const newContent = { ...prev };
          textBoxIdsToRemove.forEach(id => {
            delete newContent[id];
          });
          return newContent;
        });
        
        alert("Button and all associated data have been deleted successfully!");
      }
    }
  };

  const handleCustomButtonClick = (button) => {
    const dateKey = selectedDate.toDateString();
    const newTextBox = {
      id: Date.now(),
      buttonText: button.text,
      buttonColor: button.color,
      date: dateKey,
      content: ""
    };
    
    setDateTextBoxes(prev => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), newTextBox]
    }));
    
    setTextBoxContent(prev => ({
      ...prev,
      [newTextBox.id]: ""
    }));
  };

  const updateTextBoxContent = (textBoxId, content) => {
    setTextBoxContent(prev => ({
      ...prev,
      [textBoxId]: content
    }));
  };

  const saveTextBoxContent = (textBoxId) => {
    const content = textBoxContent[textBoxId] || "";
    setSavedContent(prev => ({
      ...prev,
      [textBoxId]: content
    }));
    alert("Text saved successfully!");
  };

  const deleteTextBox = (dateKey, textBoxId) => {
    setDateTextBoxes(prev => ({
      ...prev,
      [dateKey]: prev[dateKey].filter(box => box.id !== textBoxId)
    }));
    
    setTextBoxContent(prev => {
      const newContent = { ...prev };
      delete newContent[textBoxId];
      return newContent;
    });

    setSavedContent(prev => {
      const newContent = { ...prev };
      delete newContent[textBoxId];
      return newContent;
    });

    setDisplayedSavedContent(prev => {
      const newContent = { ...prev };
      delete newContent[textBoxId];
      return newContent;
    });
  };

  const getTextBoxesForDate = (date) => {
    const dateKey = date.toDateString();
    return dateTextBoxes[dateKey] || [];
  };

  // Event and Special Date Management Functions
  const createEvent = () => {
    if (newEvent.title.trim()) {
      const dateKey = selectedDate.toDateString();
      const eventId = Date.now();
      const eventData = {
        id: eventId,
        ...newEvent,
        date: selectedDate
      };
      
      setEvents(prev => ({
        ...prev,
        [dateKey]: [...(prev[dateKey] || []), eventData]
      }));
      
      setNewEvent({
        title: "",
        description: "",
        color: "#ff6b6b",
        isRecurring: false,
        recurringType: "yearly"
      });
      setShowEventModal(false);
      alert("Event created successfully!");
    }
  };

  const createSpecialDate = () => {
    if (newSpecialDate.title.trim()) {
      const dateKey = selectedDate.toDateString();
      const specialDateData = {
        id: Date.now(),
        ...newSpecialDate,
        date: selectedDate
      };
      
      setSpecialDates(prev => ({
        ...prev,
        [dateKey]: specialDateData
      }));
      
      setNewSpecialDate({
        title: "",
        description: "",
        color: "#4ecdc4",
        isHoliday: false
      });
      setShowEventModal(false);
      alert("Special date created successfully!");
    }
  };

  const deleteEvent = (dateKey, eventId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this event?");
    if (confirmDelete) {
      setEvents(prev => ({
        ...prev,
        [dateKey]: prev[dateKey].filter(event => event.id !== eventId)
      }));
    }
  };

  const deleteSpecialDate = (dateKey) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this special date?");
    if (confirmDelete) {
      setSpecialDates(prev => {
        const newSpecialDates = { ...prev };
        delete newSpecialDates[dateKey];
        return newSpecialDates;
      });
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const getEventsForDate = (date) => {
    const dateKey = date.toDateString();
    return events[dateKey] || [];
  };

  const getSpecialDateForDate = (date) => {
    const dateKey = date.toDateString();
    return specialDates[dateKey] || null;
  };

  const isDateSpecial = (date) => {
    const dateKey = date.toDateString();
    return specialDates[dateKey] !== undefined;
  };

  const hasEvents = (date) => {
    const dateKey = date.toDateString();
    return events[dateKey] && events[dateKey].length > 0;
  };

  // Function to get holidays (API or local)
  const getHolidaysForDate = (date) => {
    // Only use local holiday logic
    return isPublicHoliday(date);
  };

  return (
    <div style={{
      padding: "20px",
      maxWidth: "1200px",
      margin: "auto",
      color: isDarkMode ? "white" : "black",
      backgroundColor: isDarkMode ? "#121212" : "#f5f5f5",
      minHeight: "100vh"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>MY DIGITAL CALENDER</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setShowRegionModal(true)}
            style={{
              padding: "8px 16px",
              backgroundColor: isDarkMode ? "#4a4a4a" : "#0078D4",
              border: "none",
              borderRadius: "5px",
              color: "white",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            🌍 {userRegion} Holidays
          </button>
          <button
            onClick={toggleTheme}
            style={{
              padding: "8px 16px",
              backgroundColor: isDarkMode ? "#4a4a4a" : "#0078D4",
              border: "none",
              borderRadius: "5px",
              color: "white",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            {isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "40px", alignItems: "flex-start" }}>
        {/* Calendar Section */}
        <div style={{ flex: "1" }}>
          <Calendar
            onChange={handleDateClick}
            value={selectedDate}
            showNeighboringMonth={false}
            tileContent={({ date, view }) => {
              if (view === 'month') {
                const holiday = getHolidaysForDate(date);
                if (holiday) {
                  return (
                    <div style={{
                      position: "absolute",
                      top: "2px",
                      left: "2px",
                      width: "8px",
                      height: "8px",
                      backgroundColor: holiday.color,
                      borderRadius: "50%",
                      zIndex: 1
                    }} title={holiday.name} />
                  );
                }
              }
              return null;
            }}
          />

          {/* Public Holidays Display */}
          {(() => {
            const currentYear = selectedDate.getFullYear();
            const currentMonth = selectedDate.getMonth();
            const holidays = getHolidaysForMonth(currentYear, currentMonth);
            
            if (holidays.length > 0) {
              return (
                <div style={{ marginTop: "15px", padding: "10px", backgroundColor: isDarkMode ? "#2e2e2e" : "#ffffff", borderRadius: "8px", border: isDarkMode ? "1px solid #444" : "1px solid #ddd" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <h4 style={{ margin: 0, color: "#0078D4", fontSize: "14px" }}>
                      🎉 Public Holidays ({userRegion}) - {selectedDate.toLocaleString('default', { month: 'long' })} {currentYear}
                    </h4>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {holidays.map((holiday, index) => (
                      <span key={index} style={{
                        padding: "4px 8px",
                        backgroundColor: holiday.color,
                        color: "white",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "bold"
                      }}>
                        {holiday.date.getDate()} {holiday.name}
                        {holiday.type && <span style={{ fontSize: "10px", opacity: 0.8 }}> ({holiday.type})</span>}
                      </span>
                    ))}
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {/* Events and Special Dates Display */}
          {(getEventsForDate(selectedDate).length > 0 || getSpecialDateForDate(selectedDate)) && (
            <div style={{ marginTop: "20px" }}>
              <h3 style={{ color: "#0078D4", marginBottom: "15px" }}>
                Events & Special Dates for {selectedDate.toDateString()}
              </h3>
              
              {/* Special Date Display */}
              {getSpecialDateForDate(selectedDate) && (
                <div style={{ 
                  marginBottom: "15px", 
                  padding: "15px", 
                  backgroundColor: isDarkMode ? "#2e2e2e" : "#ffffff",
                  borderRadius: "8px",
                  border: `3px solid ${getSpecialDateForDate(selectedDate).color}`
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <h4 style={{ 
                      margin: 0, 
                      color: getSpecialDateForDate(selectedDate).color,
                      fontSize: "16px"
                    }}>
                      {getSpecialDateForDate(selectedDate).isHoliday ? "🎉 " : "⭐ "}
                      {getSpecialDateForDate(selectedDate).title}
                    </h4>
                    <button
                      onClick={() => deleteSpecialDate(selectedDate.toDateString())}
                      style={{
                        padding: "2px 6px",
                        backgroundColor: "#ff4444",
                        border: "none",
                        borderRadius: "3px",
                        color: "white",
                        cursor: "pointer",
                        fontSize: "10px"
                      }}
                    >
                      ×
                    </button>
                  </div>
                  <p style={{ margin: 0, fontSize: "14px", color: isDarkMode ? "#ccc" : "#666" }}>
                    {getSpecialDateForDate(selectedDate).description}
                  </p>
                </div>
              )}

              {/* Events Display */}
              {getEventsForDate(selectedDate).map((event) => (
                <div key={event.id} style={{ 
                  marginBottom: "10px", 
                  padding: "12px", 
                  backgroundColor: isDarkMode ? "#2e2e2e" : "#ffffff",
                  borderRadius: "8px",
                  borderLeft: `4px solid ${event.color}`
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h5 style={{ 
                        margin: "0 0 5px 0", 
                        color: event.color,
                        fontSize: "14px"
                      }}>
                        📅 {event.title}
                        {event.isRecurring && <span style={{ fontSize: "12px", color: "#888" }}> (Recurring)</span>}
                      </h5>
                      <p style={{ 
                        margin: 0, 
                        fontSize: "12px", 
                        color: isDarkMode ? "#ccc" : "#666" 
                      }}>
                        {event.description}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteEvent(selectedDate.toDateString(), event.id)}
                      style={{
                        padding: "2px 6px",
                        backgroundColor: "#ff4444",
                        border: "none",
                        borderRadius: "3px",
                        color: "white",
                        cursor: "pointer",
                        fontSize: "10px"
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Text Boxes for Selected Date */}
          {getTextBoxesForDate(selectedDate).length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <h3 style={{ color: "#0078D4", marginBottom: "15px" }}>
                Text Boxes for {selectedDate.toDateString()}
              </h3>
              {getTextBoxesForDate(selectedDate).map((textBox) => (
                <div key={textBox.id} style={{ marginBottom: "15px", padding: "15px", backgroundColor: isDarkMode ? "#2e2e2e" : "#ffffff", borderRadius: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                    <span style={{ 
                      padding: "4px 8px", 
                      backgroundColor: textBox.buttonColor, 
                      borderRadius: "4px", 
                      fontSize: "12px",
                      color: "white"
                    }}>
                      {textBox.buttonText}
                    </span>
                    <button
                      onClick={() => saveTextBoxContent(textBox.id)}
                      style={{
                        padding: "4px 8px",
                        backgroundColor: "#28a745",
                        border: "none",
                        borderRadius: "3px",
                        color: "white",
                        cursor: "pointer",
                        fontSize: "10px"
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => deleteTextBox(selectedDate.toDateString(), textBox.id)}
                      style={{
                        padding: "2px 6px",
                        backgroundColor: "#ff4444",
                        border: "none",
                        borderRadius: "3px",
                        color: "white",
                        cursor: "pointer",
                        fontSize: "10px"
                      }}
                    >
                      ×
                    </button>
                  </div>
                  <textarea
                    value={textBoxContent[textBox.id] || ""}
                    onChange={(e) => updateTextBoxContent(textBox.id, e.target.value)}
                    placeholder="Enter your text here..."
                    style={{
                      width: "100%",
                      minHeight: "80px",
                      padding: "10px",
                      backgroundColor: isDarkMode ? "#1e1e1e" : "#f9f9f9",
                      border: `1px solid ${isDarkMode ? "#444" : "#ddd"}`,
                      borderRadius: "5px",
                      color: isDarkMode ? "white" : "black",
                      resize: "vertical"
                    }}
                  />
                  {displayedSavedContent[textBox.id] && (
                    <div style={{ marginTop: "10px", padding: "8px", backgroundColor: isDarkMode ? "#1a1a1a" : "#e8f5e8", borderRadius: "4px", fontSize: "12px", color: "#28a745" }}>
                      ✓ Saved: {displayedSavedContent[textBox.id]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Custom Button Section */}
        <div style={{ flex: "1", minWidth: "300px" }}>
          {/* Create Custom Button */}
          <div style={{ marginBottom: "20px", textAlign: "center" }}>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => setShowModal(true)}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#0078D4",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "bold"
                }}
              >
                Create Your Own Button
              </button>
              <button
                onClick={() => setShowTableModal(true)}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#28a745",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "bold"
                }}
              >
                Day-to-Day Work
              </button>
              <button
                onClick={() => setShowEventModal(true)}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#ff6b6b",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "bold"
                }}
              >
                Add Event/Reminder
              </button>
            </div>
          </div>

          {/* Custom Buttons Display */}
          {customButtons.length > 0 && (
            <div>
              <h3>Your Custom Buttons:</h3>
              <p style={{ fontSize: "14px", color: "#ccc", marginBottom: "15px" }}>
                Click any button to add a text box to the selected date ({selectedDate.toDateString()})
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {customButtons.map((button) => (
                  <div key={button.id} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <button
                      onClick={() => handleCustomButtonClick(button)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: button.color,
                        border: "none",
                        borderRadius: "4px",
                        color: "white",
                        cursor: "pointer",
                        fontSize: "14px"
                      }}
                    >
                      {button.text}
                    </button>
                    <button
                      onClick={() => deleteButton(button.id)}
                      style={{
                        padding: "2px 6px",
                        backgroundColor: "#ff4444",
                        border: "none",
                        borderRadius: "3px",
                        color: "white",
                        cursor: "pointer",
                        fontSize: "10px"
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tables Display */}
          {tables.length > 0 && (
            <div style={{ marginTop: "30px" }}>
              <h3>Day-to-Day Work Tables:</h3>
              {tables.map((table) => (
                <div key={table.id} style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#2e2e2e", borderRadius: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <h4 style={{ margin: 0, color: "#28a745" }}>{table.title}</h4>
                    <div style={{ display: "flex", gap: "5px" }}>
                      <button
                        onClick={() => saveTable(table.id)}
                        style={{
                          padding: "4px 8px",
                          backgroundColor: "#28a745",
                          border: "none",
                          borderRadius: "3px",
                          color: "white",
                          cursor: "pointer",
                          fontSize: "10px"
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => deleteTable(table.id)}
                        style={{
                          padding: "2px 6px",
                          backgroundColor: "#ff4444",
                          border: "none",
                          borderRadius: "3px",
                          color: "white",
                          cursor: "pointer",
                          fontSize: "10px"
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ 
                      width: "100%", 
                      borderCollapse: "collapse", 
                      backgroundColor: "white",
                      color: "black"
                    }}>
                      <tbody>
                        {Array.from({ length: table.rows }, (_, rowIndex) => (
                          <tr key={rowIndex}>
                            {Array.from({ length: table.columns }, (_, colIndex) => (
                              <td key={colIndex} style={{ 
                                border: "1px solid #ccc", 
                                padding: "8px",
                                minWidth: "80px"
                              }}>
                                <input
                                  type="text"
                                  value={tableData[`${table.id}-${rowIndex}-${colIndex}`] || ""}
                                  onChange={(e) => updateTableCell(table.id, rowIndex, colIndex, e.target.value)}
                                  style={{
                                    width: "100%",
                                    border: "none",
                                    outline: "none",
                                    backgroundColor: "transparent",
                                    color: "black",
                                    fontSize: "14px"
                                  }}
                                  placeholder="Enter text..."
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal for creating custom button */}
      {showModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.7)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: isDarkMode ? "#2e2e2e" : "#ffffff",
            padding: "30px",
            borderRadius: "10px",
            minWidth: "300px",
            border: isDarkMode ? "1px solid #444" : "1px solid #ddd"
          }}>
            <h3 style={{ marginTop: 0, marginBottom: "20px", color: isDarkMode ? "white" : "black" }}>Create Custom Button</h3>
            
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", color: isDarkMode ? "white" : "black" }}>Button Text:</label>
              <input
                type="text"
                value={newButtonText}
                onChange={(e) => setNewButtonText(e.target.value)}
                placeholder="Enter button text..."
                style={{
                  width: "100%",
                  padding: "8px",
                  backgroundColor: isDarkMode ? "#1e1e1e" : "#f9f9f9",
                  border: `1px solid ${isDarkMode ? "#444" : "#ddd"}`,
                  borderRadius: "5px",
                  color: isDarkMode ? "white" : "black"
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "5px", color: isDarkMode ? "white" : "black" }}>Button Color:</label>
              <input
                type="color"
                value={newButtonColor}
                onChange={(e) => setNewButtonColor(e.target.value)}
                style={{
                  width: "100%",
                  height: "40px",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer"
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#666",
                  border: "none",
                  borderRadius: "5px",
                  color: "white",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                onClick={createCustomButton}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#0078D4",
                  border: "none",
                  borderRadius: "5px",
                  color: "white",
                  cursor: "pointer"
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for creating table */}
      {showTableModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.7)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: isDarkMode ? "#2e2e2e" : "#ffffff",
            padding: "30px",
            borderRadius: "10px",
            minWidth: "300px",
            border: isDarkMode ? "1px solid #444" : "1px solid #ddd"
          }}>
            <h3 style={{ marginTop: 0, marginBottom: "20px", color: isDarkMode ? "white" : "black" }}>Create Day-to-Day Work Table</h3>
            
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", color: isDarkMode ? "white" : "black" }}>Table Title:</label>
              <input
                type="text"
                value={tableTitle}
                onChange={(e) => setTableTitle(e.target.value)}
                placeholder="Enter table title..."
                style={{
                  width: "100%",
                  padding: "8px",
                  backgroundColor: isDarkMode ? "#1e1e1e" : "#f9f9f9",
                  border: `1px solid ${isDarkMode ? "#444" : "#ddd"}`,
                  borderRadius: "5px",
                  color: isDarkMode ? "white" : "black"
                }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", color: isDarkMode ? "white" : "black" }}>Number of Rows:</label>
              <input
                type="number"
                value={tableRows}
                onChange={(e) => setTableRows(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max="10"
                style={{
                  width: "100%",
                  padding: "8px",
                  backgroundColor: isDarkMode ? "#1e1e1e" : "#f9f9f9",
                  border: `1px solid ${isDarkMode ? "#444" : "#ddd"}`,
                  borderRadius: "5px",
                  color: isDarkMode ? "white" : "black"
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "5px", color: isDarkMode ? "white" : "black" }}>Number of Columns:</label>
              <input
                type="number"
                value={tableColumns}
                onChange={(e) => setTableColumns(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max="10"
                style={{
                  width: "100%",
                  padding: "8px",
                  backgroundColor: isDarkMode ? "#1e1e1e" : "#f9f9f9",
                  border: `1px solid ${isDarkMode ? "#444" : "#ddd"}`,
                  borderRadius: "5px",
                  color: isDarkMode ? "white" : "black"
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowTableModal(false)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#666",
                  border: "none",
                  borderRadius: "5px",
                  color: "white",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                onClick={createTable}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#28a745",
                  border: "none",
                  borderRadius: "5px",
                  color: "white",
                  cursor: "pointer"
                }}
              >
                Create Table
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for creating events and special dates */}
      {showEventModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.7)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: isDarkMode ? "#2e2e2e" : "#ffffff",
            padding: "30px",
            borderRadius: "10px",
            minWidth: "400px",
            border: isDarkMode ? "1px solid #444" : "1px solid #ddd"
          }}>
            <h3 style={{ marginTop: 0, marginBottom: "20px", color: isDarkMode ? "white" : "black" }}>
              Add Event/Reminder for {selectedDate.toDateString()}
            </h3>
            
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
                <button
                  onClick={() => setShowEventModal(false)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#ff6b6b",
                    border: "none",
                    borderRadius: "5px",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >
                  📅 Create Event
                </button>
                <button
                  onClick={() => setShowEventModal(false)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#4ecdc4",
                    border: "none",
                    borderRadius: "5px",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >
                  ⭐ Create Special Date
                </button>
              </div>
            </div>

            {/* Event Creation Form */}
            <div style={{ marginBottom: "20px" }}>
              <h4 style={{ color: isDarkMode ? "white" : "black", marginBottom: "15px" }}>Event Details:</h4>
              
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", color: isDarkMode ? "white" : "black" }}>Event Title:</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  placeholder="Enter event title..."
                  style={{
                    width: "100%",
                    padding: "8px",
                    backgroundColor: isDarkMode ? "#1e1e1e" : "#f9f9f9",
                    border: `1px solid ${isDarkMode ? "#444" : "#ddd"}`,
                    borderRadius: "5px",
                    color: isDarkMode ? "white" : "black"
                  }}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", color: isDarkMode ? "white" : "black" }}>Event Description:</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  placeholder="Enter event description..."
                  style={{
                    width: "100%",
                    padding: "8px",
                    backgroundColor: isDarkMode ? "#1e1e1e" : "#f9f9f9",
                    border: `1px solid ${isDarkMode ? "#444" : "#ddd"}`,
                    borderRadius: "5px",
                    color: isDarkMode ? "white" : "black"
                  }}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", color: isDarkMode ? "white" : "black" }}>Event Color:</label>
                <input
                  type="color"
                  value={newEvent.color}
                  onChange={(e) => setNewEvent({...newEvent, color: e.target.value})}
                  style={{
                    width: "100%",
                    height: "40px",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer"
                  }}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", color: isDarkMode ? "white" : "black" }}>Is Recurring:</label>
                <input
                  type="checkbox"
                  checked={newEvent.isRecurring}
                  onChange={(e) => setNewEvent({...newEvent, isRecurring: e.target.checked})}
                  style={{
                    width: "20px",
                    height: "20px",
                    cursor: "pointer"
                  }}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", color: isDarkMode ? "white" : "black" }}>Recurring Type:</label>
                <select
                  value={newEvent.recurringType}
                  onChange={(e) => setNewEvent({...newEvent, recurringType: e.target.value})}
                  style={{
                    width: "100%",
                    padding: "8px",
                    backgroundColor: isDarkMode ? "#1e1e1e" : "#f9f9f9",
                    border: `1px solid ${isDarkMode ? "#444" : "#ddd"}`,
                    borderRadius: "5px",
                    color: isDarkMode ? "white" : "black"
                  }}
                >
                  <option value="yearly">Yearly</option>
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowEventModal(false)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#666",
                  border: "none",
                  borderRadius: "5px",
                  color: "white",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                onClick={createEvent}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#28a745",
                  border: "none",
                  borderRadius: "5px",
                  color: "white",
                  cursor: "pointer"
                }}
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for region selection */}
      {showRegionModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.7)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: isDarkMode ? "#2e2e2e" : "#ffffff",
            padding: "30px",
            borderRadius: "10px",
            minWidth: "400px",
            border: isDarkMode ? "1px solid #444" : "1px solid #ddd"
          }}>
            <h3 style={{ marginTop: 0, marginBottom: "20px", color: isDarkMode ? "white" : "black" }}>
              Select Your Region for Public Holidays
            </h3>
            
            <div style={{ marginBottom: "20px" }}>
              <p style={{ color: isDarkMode ? "#ccc" : "#666", fontSize: "14px", marginBottom: "15px" }}>
                Choose your region to see relevant public holidays displayed on the calendar.
              </p>
              
              <div style={{ display: "grid", gap: "10px" }}>
                {[
                  { code: 'US', name: 'United States', flag: '🇺🇸' },
                  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
                  { code: 'IN', name: 'India', flag: '🇮🇳' },
                  { code: 'CA', name: 'Canada', flag: '🇨🇦' }
                ].map((region) => (
                  <button
                    key={region.code}
                    onClick={() => {
                      setUserRegion(region.code);
                      setShowRegionModal(false);
                    }}
                    style={{
                      padding: "12px 16px",
                      backgroundColor: userRegion === region.code ? "#0078D4" : (isDarkMode ? "#4a4a4a" : "#f0f0f0"),
                      border: "none",
                      borderRadius: "8px",
                      color: userRegion === region.code ? "white" : (isDarkMode ? "white" : "black"),
                      cursor: "pointer",
                      fontSize: "16px",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      transition: "background-color 0.2s"
                    }}
                  >
                    <span style={{ fontSize: "20px" }}>{region.flag}</span>
                    <span>{region.name}</span>
                    {userRegion === region.code && <span style={{ marginLeft: "auto" }}>✓</span>}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowRegionModal(false)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#666",
                  border: "none",
                  borderRadius: "5px",
                  color: "white",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;