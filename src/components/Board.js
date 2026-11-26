import { Column } from "./Column.js";
import { TaskCard } from "./TaskCard.js";
import { icon } from "./icons.js";

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}

function matchesSearch(task, query) {
  return !query || `${task.title} ${task.description} ${task.tag} ${task.assignee}`.toLowerCase().includes(query);
}

function dateLabel(date) {
  return date ? new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "No due date";
}

function TaskTable(tasks, columns) {
  return `
    <div class="table-wrap" data-aos="fade-up">
      <table class="task-table">
        <thead><tr><th>Task</th><th>Status</th><th>Priority</th><th>Assignee</th><th>Due date</th></tr></thead>
        <tbody>${tasks.length ? tasks.map((task) => `<tr data-action="edit-task" data-task-id="${escapeHTML(task.id)}" tabindex="0"><td><strong>${escapeHTML(task.title)}</strong><small>${escapeHTML(task.tag)}</small></td><td>${escapeHTML(columns.find((column) => column.id === task.columnId)?.title || "Unassigned")}</td><td><span class="priority priority-${escapeHTML(task.priority)}"><i></i>${escapeHTML(task.priority)}</span></td><td>${escapeHTML(task.assignee)}</td><td>${escapeHTML(dateLabel(task.dueDate))}</td></tr>`).join("") : `<tr><td class="table-empty" colspan="5">No tasks match your search.</td></tr>`}</tbody>
      </table>
    </div>
  `;
}

function TaskTimeline(tasks, columns) {
  const sorted = [...tasks].sort((first, second) => (first.dueDate || "9999-12-31").localeCompare(second.dueDate || "9999-12-31"));
  return `
    <div class="timeline-list">
      ${sorted.length ? sorted.map((task, index) => `<button class="timeline-task" data-action="edit-task" data-task-id="${escapeHTML(task.id)}" data-aos="fade-up" data-aos-delay="${Math.min(index * 50, 300)}">
        <span class="timeline-date">${escapeHTML(dateLabel(task.dueDate))}</span><span class="timeline-marker indicator-${escapeHTML(columns.find((column) => column.id === task.columnId)?.color || "lavender")}"></span>
        <span class="timeline-copy"><strong>${escapeHTML(task.title)}</strong><small>${escapeHTML(columns.find((column) => column.id === task.columnId)?.title || "Unassigned")} · ${escapeHTML(task.assignee)}</small></span><span class="timeline-priority priority-${escapeHTML(task.priority)}">${escapeHTML(task.priority)}</span>
      </button>`).join("") : `<p class="insight-empty">No tasks match your search.</p>`}
    </div>
  `;
}

function CalendarView(board, tasks) {
  const datedTasks = [...tasks]
    .filter((task) => task.dueDate && task.columnId !== "done")
    .sort((first, second) => first.dueDate.localeCompare(second.dueDate));
  const groups = new Map();
  datedTasks.forEach((task) => {
    if (!groups.has(task.dueDate)) groups.set(task.dueDate, []);
    groups.get(task.dueDate).push(task);
  });
  return `
    <main class="main-content calendar-content">
      <section class="insights-heading" data-aos="fade-up">
        <div><div class="insights-eyebrow">YOUR SCHEDULE</div><h1>Calendar</h1><p>Upcoming deadlines for ${escapeHTML(board.title)}.</p></div>
        <button class="primary-button" data-action="add-task" data-column-id="${escapeHTML(board.columns[0]?.id || "")}">Add task</button>
      </section>
      ${groups.size ? `<section class="calendar-list">${[...groups.entries()].map(([date, items], index) => `<article class="calendar-day" data-aos="fade-up" data-aos-delay="${Math.min(index * 60, 300)}"><div class="calendar-day-date"><span>${new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: "short" })}</span><strong>${new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</strong></div><div class="calendar-day-tasks">${items.map((task) => `<button class="calendar-task" data-action="edit-task" data-task-id="${escapeHTML(task.id)}"><span class="column-indicator indicator-${escapeHTML(board.columns.find((column) => column.id === task.columnId)?.color || "lavender")}"></span><span><strong>${escapeHTML(task.title)}</strong><small>${escapeHTML(task.assignee)} · ${escapeHTML(board.columns.find((column) => column.id === task.columnId)?.title || "Unassigned")}</small></span></button>`).join("")}</div></article>`).join("")}</section>` : `<div class="empty-state" data-aos="fade-up"><span>${icon("calendar", 22)}</span><strong>No upcoming due dates</strong><p>Add a due date to a task to see it on your calendar.</p><button class="primary-button" data-action="add-task" data-column-id="${escapeHTML(board.columns[0]?.id || "")}">Create a task</button></div>`}
    </main>
  `;
}

export function Board(board, filter = "", view = "board", page = "board") {
  const query = filter.trim().toLowerCase();
  const isMine = page === "my-tasks";
  const tasks = board.tasks.filter((task) => (!isMine || task.assignee === "Jordan Davis") && matchesSearch(task, query));
  if (page === "calendar") return CalendarView(board, tasks);

  const total = tasks.length;
  const done = tasks.filter((task) => task.columnId === "done").length;
  const title = isMine ? "My tasks" : board.title;
  const subtitle = isMine ? "Tasks assigned to Jordan Davis." : board.subtitle;
  return `
    <main class="main-content">
      <section class="board-heading" data-aos="fade-up">
        <div class="board-title-area">
          <div class="board-eyebrow"><span class="board-emoji large-emoji">✳</span><span>${isMine ? "PERSONAL TASKS" : "DESIGN TEAM"}</span><span class="eyebrow-dot">·</span><span>${total} TASK${total === 1 ? "" : "S"}</span></div>
          <div class="title-line"><h1>${escapeHTML(title)}</h1><button class="icon-button title-menu" data-action="edit-board" aria-label="Board options">${icon("dots", 20)}</button></div>
          <p>${escapeHTML(subtitle)}</p>
        </div>
        <div class="board-heading-side">
          <div class="member-stack"><div class="avatar avatar-coral" title="Maya Chen">MC</div><div class="avatar avatar-blue" title="Leo Martin">LM</div><div class="avatar avatar-purple" title="Sam Rivera">SR</div><button class="avatar invite-avatar" data-action="share" aria-label="Copy board link">${icon("plus", 15)}</button></div>
          <button class="share-button" data-action="share">${icon("link", 16)}<span>Share</span></button>
        </div>
      </section>
      <section class="board-toolbar" aria-label="Board tools" data-aos="fade-up" data-aos-delay="80">
        <div class="view-tabs">
          ${[["board", "grid", "Board"], ["timeline", "calendar", "Timeline"], ["table", "chart", "Table"]].map(([key, symbol, label]) => `<button class="view-tab${view === key ? " active" : ""}" data-action="view" data-view="${key}" aria-pressed="${view === key}">${icon(symbol, 16)}${label}</button>`).join("")}
        </div>
        <div class="toolbar-actions"><span class="progress-label">${done} of ${total} tasks completed</span><div class="progress-track"><span style="width:${total ? Math.round((done / total) * 100) : 0}%"></span></div><button class="filter-button" data-action="focus-search">${icon("filter", 16)}<span>Filter</span><span class="filter-indicator"></span></button><button class="icon-button toolbar-settings" data-action="edit-board" aria-label="Board settings">${icon("sliders", 17)}</button></div>
      </section>
      ${view === "table" ? TaskTable(tasks, board.columns) : view === "timeline" ? TaskTimeline(tasks, board.columns) : `
        <div class="board-scroll"><div class="board-columns" id="board-columns">${board.columns.map((column, index) => {
          const columnTasks = tasks.filter((task) => task.columnId === column.id);
          return Column(column, columnTasks, index);
        }).join("")}
          <button class="add-column-button" data-action="add-column">${icon("plus", 17)}<span>Add another list</span></button>
        </div></div>
        <div class="board-hint">${icon("drag", 16)} Drag and drop tasks to update their status</div>
      `}
    </main>
  `;
}
