import React, { useState, useEffect } from 'react';
import { Calendar, CheckSquare, Square, Clock, Download, RotateCcw } from 'lucide-react';

const CleaningScheduleManager = () => {
  const [completedTasks, setCompletedTasks] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date().toDateString());

  // Daily cleaning tasks organized by frequency
  const dailyTasks = [
    { id: 'dishes', name: 'Do dishes', time: '15 min', priority: 'high' },
    { id: 'kitchen_counter', name: 'Wipe kitchen counters', time: '5 min', priority: 'high' },
    { id: 'make_beds', name: 'Make beds', time: '5 min', priority: 'medium' },
    { id: 'tidy_living', name: 'Tidy living room', time: '10 min', priority: 'medium' },
    { id: 'bathroom_quick', name: 'Quick bathroom wipe', time: '5 min', priority: 'medium' },
    { id: 'take_out_trash', name: 'Take out trash (if full)', time: '3 min', priority: 'low' }
  ];

  const weeklyTasks = {
    'Monday': [{ id: 'vacuum', name: 'Vacuum main areas', time: '20 min' }],
    'Tuesday': [{ id: 'bathroom_deep', name: 'Deep clean bathroom', time: '25 min' }],
    'Wednesday': [{ id: 'dust', name: 'Dust surfaces', time: '15 min' }],
    'Thursday': [{ id: 'kitchen_deep', name: 'Deep clean kitchen', time: '30 min' }],
    'Friday': [{ id: 'floors', name: 'Mop floors', time: '15 min' }],
    'Saturday': [{ id: 'laundry', name: 'Do laundry', time: '10 min active' }],
    'Sunday': [{ id: 'rest', name: 'Rest day / catch up', time: '0 min' }]
  };

  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const todaysWeeklyTasks = weeklyTasks[dayName] || [];

  const toggleTask = (taskId) => {
    setCompletedTasks(prev => ({
      ...prev,
      [currentDate]: {
        ...prev[currentDate],
        [taskId]: !prev[currentDate]?.[taskId]
      }
    }));
  };

  const isTaskCompleted = (taskId) => {
    return completedTasks[currentDate]?.[taskId] || false;
  };

  const resetDay = () => {
    setCompletedTasks(prev => ({
      ...prev,
      [currentDate]: {}
    }));
  };

  const calculateProgress = () => {
    const allTasks = [...dailyTasks, ...todaysWeeklyTasks];
    const completed = allTasks.filter(task => isTaskCompleted(task.id)).length;
    return Math.round((completed / allTasks.length) * 100);
  };

  const generateCalDAVEvent = (task, isDaily = false) => {
    const date = new Date();
    const startTime = new Date(date.getTime());
    startTime.setHours(9, 0, 0, 0); // Default to 9 AM
    
    const endTime = new Date(startTime.getTime() + 30 * 60000); // 30 min duration
    
    const formatDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    return `BEGIN:VEVENT
UID:cleaning-${task.id}-${Date.now()}@household.local
DTSTART:${formatDate(startTime)}
DTEND:${formatDate(endTime)}
SUMMARY:${task.name}
DESCRIPTION:Estimated time: ${task.time}
CATEGORIES:CLEANING,HOUSEHOLD
${isDaily ? 'RRULE:FREQ=DAILY' : `RRULE:FREQ=WEEKLY;BYDAY=${dayName.substring(0,2).toUpperCase()}`}
END:VEVENT`;
  };

  const downloadCalDAV = () => {
    let calendarContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Household Cleaning//Daily Schedule//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Daily Cleaning Schedule
X-WR-TIMEZONE:America/New_York
X-WR-CALDESC:Automated daily and weekly cleaning tasks

`;

    // Add daily tasks
    dailyTasks.forEach(task => {
      calendarContent += generateCalDAVEvent(task, true) + '\n';
    });

    // Add weekly tasks
    Object.entries(weeklyTasks).forEach(([day, tasks]) => {
      tasks.forEach(task => {
        calendarContent += generateCalDAVEvent(task, false) + '\n';
      });
    });

    calendarContent += 'END:VCALENDAR';

    const blob = new Blob([calendarContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cleaning-schedule.ics';
    a.click();
    URL.revokeObjectURL(url);
  };

  const progress = calculateProgress();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="text-blue-600" />
              Daily Cleaning Schedule
            </h1>
            <p className="text-gray-600 mt-1">{today.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{progress}%</div>
            <div className="text-sm text-gray-500">Complete</div>
          </div>
        </div>

        <div className="bg-gray-200 rounded-full h-3 mb-6">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex gap-3 mb-8">
          <button
            onClick={downloadCalDAV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={16} />
            Download Calendar
          </button>
          <button
            onClick={resetDay}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RotateCcw size={16} />
            Reset Today
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Daily Tasks */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="text-orange-600" />
            Daily Tasks
          </h2>
          <div className="space-y-3">
            {dailyTasks.map(task => (
              <div
                key={task.id}
                className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  isTaskCompleted(task.id) 
                    ? 'bg-green-50 border-green-200' 
                    : task.priority === 'high' 
                      ? 'bg-red-50 border-red-200 hover:bg-red-100'
                      : task.priority === 'medium'
                        ? 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => toggleTask(task.id)}
              >
                <div className="flex items-center gap-3">
                  {isTaskCompleted(task.id) ? (
                    <CheckSquare className="text-green-600" size={20} />
                  ) : (
                    <Square className="text-gray-400" size={20} />
                  )}
                  <div>
                    <div className={`font-medium ${isTaskCompleted(task.id) ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {task.name}
                    </div>
                    <div className="text-sm text-gray-500">{task.time}</div>
                  </div>
                </div>
                <div className={`text-xs px-2 py-1 rounded ${
                  task.priority === 'high' ? 'bg-red-100 text-red-700' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {task.priority}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Tasks */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="text-purple-600" />
            {dayName} Focus
          </h2>
          <div className="space-y-3">
            {todaysWeeklyTasks.map(task => (
              <div
                key={task.id}
                className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  isTaskCompleted(task.id) 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-purple-50 border-purple-200 hover:bg-purple-100'
                }`}
                onClick={() => toggleTask(task.id)}
              >
                <div className="flex items-center gap-3">
                  {isTaskCompleted(task.id) ? (
                    <CheckSquare className="text-green-600" size={20} />
                  ) : (
                    <Square className="text-gray-400" size={20} />
                  )}
                  <div>
                    <div className={`font-medium ${isTaskCompleted(task.id) ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {task.name}
                    </div>
                    <div className="text-sm text-gray-500">{task.time}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Weekly Schedule Preview */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">This Week's Focus</h3>
            <div className="space-y-2">
              {Object.entries(weeklyTasks).map(([day, tasks]) => (
                <div key={day} className={`flex justify-between text-sm ${day === dayName ? 'font-semibold text-purple-700' : 'text-gray-600'}`}>
                  <span>{day}</span>
                  <span>{tasks[0]?.name || 'Rest day'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">💡 Quick Tips</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Click the "Download Calendar" button to add these tasks to your calendar app</li>
          <li>• Focus on high-priority daily tasks first</li>
          <li>• Daily tasks take about 40-45 minutes total</li>
          <li>• Weekly tasks are spread out to keep each day manageable</li>
        </ul>
      </div>
    </div>
  );
};

export default CleaningScheduleManager;