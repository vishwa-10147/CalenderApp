import React, { useEffect, useMemo, useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

const CATEGORIES = ['all', 'work', 'personal', 'wishlist']
const STORAGE_KEY = 'focusflow_tasks_v1'

function App() {
  const [activeTab, setActiveTab] = useState('tasks') // 'tasks' | 'calendar' | 'profile'
  const [tasks, setTasks] = useState(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return []
      return parsed
    } catch {
      return []
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    } catch {
      // ignore write errors
    }
  }, [tasks])

  const handleCreateTask = (task) => {
    setTasks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
        title: task.title || 'Untitled task',
        category: task.category,
        startDate: task.startDate,
        endDate: task.endDate,
        endTime: task.endTime,
        notes: task.notes?.trim() || '',
        priority: task.priority || 'medium',
        reminder: task.reminder || '',
        completed: false,
      },
    ])
  }

  const handleToggleTask = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    )
  }

  const handleMoveTaskToDate = (id, isoDate) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, startDate: isoDate } : t)),
    )
  }

  const today = useMemo(() => new Date(), [])

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <div className="app-title">
            FocusFlow
            <span className="app-title-badge">Daily To-do</span>
          </div>
          <p className="app-subtitle">Plan tasks, see them on a calendar, and track progress.</p>
        </div>
        <div className="pill">
          <span className="pill-dot" />
          <span>Synced</span>
        </div>
      </header>

      <nav className="tab-nav">
        <button
          className={`tab-btn ${activeTab === 'tasks' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          Tasks
        </button>
        <button
          className={`tab-btn ${activeTab === 'calendar' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          Calendar
        </button>
        <button
          className={`tab-btn ${activeTab === 'profile' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'tasks' && (
          <TasksView tasks={tasks} onCreateTask={handleCreateTask} onToggleTask={handleToggleTask} />
        )}
        {activeTab === 'calendar' && (
          <CalendarView
            tasks={tasks}
            today={today}
            onToggleTask={handleToggleTask}
            onMoveTaskToDate={handleMoveTaskToDate}
          />
        )}
        {activeTab === 'profile' && <ProfileView tasks={tasks} today={today} />}
      </main>

      <footer className="app-footer">
        <span>
          <strong>
            {today.toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </strong>
        </span>
        <span>Windows & Android ready</span>
      </footer>
    </div>
  )
}

function TasksView({ tasks, onCreateTask, onToggleTask }) {
  const [filter, setFilter] = useState('all')
  const [form, setForm] = useState({
    title: '',
    category: 'work',
    startDate: '',
    endDate: '',
    endTime: '',
    notes: '',
    priority: 'medium',
    reminder: '',
  })

  const filteredTasks = tasks.filter((task) =>
    filter === 'all' ? true : task.category === filter,
  )

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return

    onCreateTask(form)
    setForm((prev) => ({
      ...prev,
      title: '',
      startDate: '',
      endDate: '',
      endTime: '',
      notes: '',
      reminder: '',
    }))
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Tasks</h2>
        <div className="chip-row">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`chip ${filter === cat ? 'chip--active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat === 'all'
                ? 'All'
                : cat === 'work'
                  ? 'Work'
                  : cat === 'personal'
                    ? 'Personal'
                    : 'Wishlist'}
            </button>
          ))}
        </div>
      </div>

      <form className="task-form" onSubmit={handleSubmit}>
        <div className="task-form-row">
          <input
            name="title"
            className="input"
            placeholder="Create a task..."
            value={form.title}
            onChange={handleChange}
          />
          <select
            name="category"
            className="select"
            value={form.category}
            onChange={handleChange}
          >
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="wishlist">Wishlist</option>
          </select>
        </div>
        <div className="task-form-row">
          <div className="field">
            <label>Priority</label>
            <select
              name="priority"
              className="select"
              value={form.priority}
              onChange={handleChange}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="field">
            <label>Reminder</label>
            <input
              type="datetime-local"
              name="reminder"
              className="input"
              value={form.reminder}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="field">
          <label>Notes</label>
          <textarea
            name="notes"
            className="textarea"
            rows={2}
            placeholder="Extra details for this task (optional)..."
            value={form.notes}
            onChange={handleChange}
          />
        </div>
        <div className="task-form-row task-form-row--dates">
          <div className="field">
            <label>Start date</label>
            <input
              type="date"
              name="startDate"
              className="input input--sm"
              value={form.startDate}
              onChange={handleChange}
            />
          </div>
          <div className="field">
            <label>End date</label>
            <input
              type="date"
              name="endDate"
              className="input input--sm"
              value={form.endDate}
              onChange={handleChange}
            />
          </div>
          <div className="field">
            <label>End time</label>
            <input
              type="time"
              name="endTime"
              className="input input--sm"
              value={form.endTime}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="btn-primary">
            Add
          </button>
        </div>
      </form>

      <ul className="task-list">
        {filteredTasks.length === 0 && (
          <li className="task-empty">No tasks yet in this view.</li>
        )}
        {filteredTasks.map((task) => (
          <li key={task.id} className={`task-item ${task.completed ? 'task-item--done' : ''}`}>
            <button
              type="button"
              className={`task-checkbox ${task.completed ? 'task-checkbox--checked' : ''}`}
              onClick={() => onToggleTask(task.id)}
            >
              {task.completed && <span>✓</span>}
            </button>
            <div className="task-main">
              <div className="task-title-row">
                <span className="task-title">{task.title}</span>
                <span className={`pill pill--mini pill--priority pill--priority-${task.priority}`}>
                  {task.priority === 'high'
                    ? 'High'
                    : task.priority === 'low'
                      ? 'Low'
                      : 'Medium'}
                </span>
                <span className={`pill pill--mini pill--${task.category}`}>
                  {task.category === 'work'
                    ? 'Work'
                    : task.category === 'personal'
                      ? 'Personal'
                      : 'Wishlist'}
                </span>
              </div>
              <div className="task-meta">
                {(task.startDate || task.endDate) && (
                  <span>
                    {task.startDate || '—'} → {task.endDate || '—'}
                  </span>
                )}
                {task.endTime && <span>End time: {task.endTime}</span>}
                {task.reminder && <span>Reminder: {formatReminder(task.reminder)}</span>}
              </div>
              {task.notes && <p className="task-notes">{task.notes}</p>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function CalendarView({ tasks, today, onToggleTask, onMoveTaskToDate }) {
  const [selectedDate, setSelectedDate] = useState(startOfDay(today))
  const selectedISO = selectedDate.toISOString().slice(0, 10)

  const tasksOnSelected = tasks.filter(
    (t) => (t.startDate || t.endDate) && (t.startDate || t.endDate) === selectedISO,
  )

  const tasksByDate = useMemo(() => {
    const map = new Map()
    tasks.forEach((t) => {
      const key = t.startDate || t.endDate
      if (!key) return
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(t)
    })
    return map
  }, [tasks])

  const handleDropOnDate = (event, date) => {
    event.preventDefault()
    const id = event.dataTransfer.getData('text/plain')
    if (!id) return
    const iso = date.toISOString().slice(0, 10)
    onMoveTaskToDate(id, iso)
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Calendar</h2>
        <p className="panel-subtitle">Full month view with tasks shown on each day.</p>
      </div>

      <div className="calendar-wrapper">
        <Calendar
          value={selectedDate}
          onChange={(date) => setSelectedDate(Array.isArray(date) ? date[0] : date)}
          onClickDay={(date) => setSelectedDate(date)}
          tileContent={({ date, view }) => {
            if (view !== 'month') return null
            const iso = date.toISOString().slice(0, 10)
            const tasksForDay = tasksByDate.get(iso) || []
            return (
              <div
                className="calendar-day-dropzone"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDropOnDate(e, date)}
              >
                {tasksForDay.length > 0 && (
                  <span className="calendar-dot">{tasksForDay.length}</span>
                )}
              </div>
            )
          }}
        />
      </div>

      <h3 className="panel-subtitle-heading">Tasks on {selectedISO}</h3>
      <ul className="task-list task-list--compact">
        {tasksOnSelected.length === 0 && (
          <li className="task-empty">No tasks scheduled for this day.</li>
        )}
        {tasksOnSelected.map((task) => (
          <li
            key={task.id}
            className={`task-item ${task.completed ? 'task-item--done' : ''}`}
            draggable
            onDragStart={(e) => e.dataTransfer.setData('text/plain', task.id)}
          >
            <button
              type="button"
              className={`task-checkbox ${task.completed ? 'task-checkbox--checked' : ''}`}
              onClick={() => onToggleTask(task.id)}
            >
              {task.completed && <span>✓</span>}
            </button>
            <div className="task-main">
              <div className="task-title-row">
                <span className="task-title">{task.title}</span>
                <span className={`pill pill--mini pill--priority pill--priority-${task.priority}`}>
                  {task.priority === 'high'
                    ? 'High'
                    : task.priority === 'low'
                      ? 'Low'
                      : 'Medium'}
                </span>
                <span className={`pill pill--mini pill--${task.category}`}>
                  {task.category === 'work'
                    ? 'Work'
                    : task.category === 'personal'
                      ? 'Personal'
                      : 'Wishlist'}
                </span>
              </div>
              <div className="task-meta">
                {task.endTime && <span>End time: {task.endTime}</span>}
                {task.reminder && <span>Reminder: {formatReminder(task.reminder)}</span>}
              </div>
              {task.notes && <p className="task-notes">{task.notes}</p>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function ProfileView({ tasks, today }) {
  const completedCount = tasks.filter((t) => t.completed).length
  const pendingCount = tasks.length - completedCount

  const tasksNext7Days = tasks.filter((t) => {
    if (!t.startDate && !t.endDate) return false
    const baseDate = new Date(t.startDate || t.endDate)
    const diffMs = baseDate - startOfDay(today)
    const diffDays = diffMs / (1000 * 60 * 60 * 24)
    return diffDays >= 0 && diffDays <= 7
  })

  const categoryPending = CATEGORIES.filter((c) => c !== 'all').map((cat) => ({
    category: cat,
    count: tasks.filter((t) => !t.completed && t.category === cat).length,
  }))

  const dailyStats = buildDailyStats(tasks, today)
  const completionRateToday =
    dailyStats.today.total === 0
      ? 0
      : Math.round((dailyStats.today.completed / dailyStats.today.total) * 100)

  return (
    <section className="panel">
      <div className="panel-header profile-header">
        <div>
          <h2>Profile</h2>
          <p className="panel-subtitle">Your productivity snapshot.</p>
        </div>
        <div className="avatar">
          <span>U</span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Completed tasks</span>
          <span className="stat-value">{completedCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pending tasks</span>
          <span className="stat-value">{pendingCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Today completion</span>
          <span className="stat-value">{completionRateToday}%</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Next 7 days</span>
          <span className="stat-value">{tasksNext7Days.length}</span>
        </div>
      </div>

      <div className="panel-section">
        <div className="section-header">
          <h3>Daily completion</h3>
          <span className="section-caption">Last 7 days</span>
        </div>
        <div className="mini-graph">
          {dailyStats.series.map((day) => (
            <div key={day.label} className="mini-graph-bar">
              <div
                className="mini-graph-bar-fill"
                style={{ height: `${day.rate}%` }}
                title={`${day.label}: ${day.completed}/${day.total}`}
              />
              <span className="mini-graph-label">{day.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel-section">
        <div className="section-header">
          <h3>Pending by category</h3>
        </div>
        <ul className="category-list">
          {categoryPending.map((c) => (
            <li key={c.category} className="category-item">
              <span className={`pill pill--mini pill--${c.category}`}>
                {c.category === 'work'
                  ? 'Work'
                  : c.category === 'personal'
                    ? 'Personal'
                    : 'Wishlist'}
              </span>
              <span className="category-count">{c.count} pending</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="panel-section">
        <div className="section-header">
          <h3>Tasks in next 7 days</h3>
        </div>
        <ul className="task-list task-list--compact">
          {tasksNext7Days.length === 0 && (
            <li className="task-empty">No upcoming tasks in the next 7 days.</li>
          )}
          {tasksNext7Days.map((task) => (
            <li key={task.id} className="task-item">
              <div className="task-main">
                <div className="task-title-row">
                  <span className="task-title">{task.title}</span>
                  <span className={`pill pill--mini pill--priority pill--priority-${task.priority}`}>
                    {task.priority === 'high'
                      ? 'High'
                      : task.priority === 'low'
                        ? 'Low'
                        : 'Medium'}
                  </span>
                  <span className={`pill pill--mini pill--${task.category}`}>
                    {task.category === 'work'
                      ? 'Work'
                      : task.category === 'personal'
                        ? 'Personal'
                        : 'Wishlist'}
                  </span>
                </div>
                <div className="task-meta">
                  {(task.startDate || task.endDate) && (
                    <span>
                      {task.startDate || '—'} → {task.endDate || '—'}
                    </span>
                  )}
                  {task.endTime && <span>End time: {task.endTime}</span>}
                  {task.reminder && <span>Reminder: {formatReminder(task.reminder)}</span>}
                </div>
                {task.notes && <p className="task-notes">{task.notes}</p>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function startOfDay(d) {
  const copy = new Date(d)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function buildDailyStats(tasks, today) {
  const days = []
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const key = date.toISOString().slice(0, 10)
    days.push({ key, date })
  }

  const byDay = new Map()
  for (const { key } of days) {
    byDay.set(key, { total: 0, completed: 0 })
  }

  tasks.forEach((task) => {
    const dateKey = task.startDate || task.endDate
    if (!dateKey || !byDay.has(dateKey)) return
    const bucket = byDay.get(dateKey)
    bucket.total += 1
    if (task.completed) bucket.completed += 1
  })

  const series = days.map(({ key, date }) => {
    const bucket = byDay.get(key)
    const rate = bucket.total === 0 ? 0 : Math.round((bucket.completed / bucket.total) * 100)
    return {
      label: date.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2),
      total: bucket.total,
      completed: bucket.completed,
      rate,
    }
  })

  const todayKey = today.toISOString().slice(0, 10)
  const todayBucket = byDay.get(todayKey) || { total: 0, completed: 0 }

  return {
    today: todayBucket,
    series,
  }
}

function formatReminder(reminder) {
  try {
    const d = new Date(reminder)
    if (Number.isNaN(d.getTime())) return reminder
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return reminder
  }
}

export default App
