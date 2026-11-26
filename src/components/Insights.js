function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}

function percentage(value, total) {
  return total ? Math.round((value / total) * 100) : 0;
}

export function Insights(board, filter = "") {
  const query = filter.trim().toLowerCase();
  const tasks = board.tasks.filter((task) => !query || `${task.title} ${task.description} ${task.tag} ${task.assignee}`.toLowerCase().includes(query));
  const completed = tasks.filter((task) => task.columnId === "done").length;
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const overdue = tasks.filter((task) => task.columnId !== "done" && task.dueDate && task.dueDate < today).length;
  const highPriority = tasks.filter((task) => task.priority === "high").length;
  const priorities = [
    { name: "High", value: highPriority, className: "high" },
    { name: "Medium", value: tasks.filter((task) => task.priority === "medium").length, className: "medium" },
    { name: "Low", value: tasks.filter((task) => task.priority === "low").length, className: "low" },
  ];
  const people = new Map();
  tasks.forEach((task) => {
    const name = task.assignee || "Unassigned";
    people.set(name, (people.get(name) || 0) + 1);
  });
  const assignees = [...people.entries()].sort((first, second) => second[1] - first[1]);
  const upcomingTasks = tasks
    .filter((task) => task.dueDate && task.columnId !== "done")
    .sort((first, second) => first.dueDate.localeCompare(second.dueDate))
    .slice(0, 5);
  const completedPercent = percentage(completed, tasks.length);

  return `
    <main class="main-content insights-content">
      <section class="insights-heading" data-aos="fade-up">
        <div>
          <div class="insights-eyebrow">WORKSPACE ANALYTICS</div>
          <h1>Insights</h1>
          <p>Live progress and workload for ${escapeHTML(board.title)}.</p>
        </div>
        <button class="primary-button" data-action="add-task" data-column-id="${escapeHTML(board.columns[0]?.id || "")}">Add task</button>
      </section>
      <section class="insights-metrics" aria-label="Task summary" data-aos="fade-up" data-aos-delay="80">
        <article class="insight-metric">
          <span>Total tasks</span><strong>${tasks.length}</strong><small>In this board</small>
        </article>
        <article class="insight-metric">
          <span>Completed</span><strong>${completed}</strong><small>${completedPercent}% completion</small>
        </article>
        <article class="insight-metric">
          <span>In progress</span><strong>${tasks.filter((task) => task.columnId === "progress").length}</strong><small>Currently being worked on</small>
        </article>
        <article class="insight-metric${overdue ? " metric-alert" : ""}">
          <span>Overdue</span><strong>${overdue}</strong><small>${overdue ? "Past the due date" : "No overdue tasks"}</small>
        </article>
      </section>
      <section class="insights-grid">
        <article class="insight-panel" data-aos="fade-up">
          <div class="insight-panel-heading"><div><h2>Tasks by status</h2><p>Distribution across board lists</p></div><span class="insight-total">${tasks.length} total</span></div>
          <div class="insight-bars">
            ${board.columns.map((column) => {
              const count = tasks.filter((task) => task.columnId === column.id).length;
              return `<div class="insight-bar-row"><div class="insight-bar-label"><span><i class="insight-status-dot indicator-${escapeHTML(column.color)}"></i>${escapeHTML(column.title)}</span><strong>${count}</strong></div><div class="insight-bar-track"><span class="insight-status-fill indicator-${escapeHTML(column.color)}" style="width:${percentage(count, tasks.length)}%"></span></div></div>`;
            }).join("")}
          </div>
        </article>
        <article class="insight-panel" data-aos="fade-up" data-aos-delay="60">
          <div class="insight-panel-heading"><div><h2>Priority breakdown</h2><p>Tasks grouped by priority</p></div></div>
          <div class="insight-priorities">
            ${priorities.map((priority) => `<div class="insight-priority-row"><span><i class="priority-dot priority-dot-${priority.className}"></i>${priority.name}</span><strong>${priority.value}</strong><div class="insight-bar-track"><span class="priority-fill priority-fill-${priority.className}" style="width:${percentage(priority.value, tasks.length)}%"></span></div></div>`).join("")}
          </div>
        </article>
        <article class="insight-panel" data-aos="fade-up" data-aos-delay="120">
          <div class="insight-panel-heading"><div><h2>Workload by assignee</h2><p>Tasks currently on this board</p></div></div>
          ${assignees.length ? `<div class="insight-assignees">${assignees.map(([name, count]) => {
            const task = tasks.find((item) => (item.assignee || "Unassigned") === name);
            return `<div class="insight-assignee"><div class="insight-assignee-avatar avatar-${escapeHTML(task?.avatar || "dark")}">${escapeHTML(task?.initials || name.slice(0, 2).toUpperCase())}</div><span>${escapeHTML(name)}</span><strong>${count}</strong></div>`;
          }).join("")}</div>` : `<p class="insight-empty">No tasks match your search.</p>`}
        </article>
        <article class="insight-panel" data-aos="fade-up" data-aos-delay="180">
          <div class="insight-panel-heading"><div><h2>Upcoming due dates</h2><p>Open tasks with a due date</p></div></div>
          ${upcomingTasks.length ? `<div class="insight-due-list">${upcomingTasks.map((task) => `<button class="insight-due-task" data-action="edit-task" data-task-id="${escapeHTML(task.id)}"><span>${escapeHTML(task.title)}</span><time datetime="${escapeHTML(task.dueDate)}">${new Date(`${task.dueDate}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</time></button>`).join("")}</div>` : `<p class="insight-empty">${tasks.length ? "No open tasks have due dates." : "No tasks match your search."}</p>`}
        </article>
      </section>
    </main>
  `;
}
