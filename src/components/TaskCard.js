import { icon } from "./icons.js";

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}

function dateLabel(date) {
  if (!date) return "";
  const parsed = new Date(`${date}T12:00:00`);
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function TaskCard(task) {
  return `
    <article class="task-card" data-task-id="${escapeHTML(task.id)}" tabindex="0" aria-label="${escapeHTML(task.title)}" data-aos="fade-up">
      <div class="task-card-top">
        <span class="task-tag tag-${escapeHTML(task.tag.toLowerCase().replace(/\s+/g, "-"))}">${escapeHTML(task.tag)}</span>
        <button class="card-menu icon-button" data-action="edit-task" data-task-id="${escapeHTML(task.id)}" aria-label="Edit ${escapeHTML(task.title)}">${icon("dots", 17)}</button>
      </div>
      <h3>${escapeHTML(task.title)}</h3>
      ${task.description ? `<p class="task-description">${escapeHTML(task.description)}</p>` : ""}
      <div class="task-card-footer">
        <div class="task-meta">
          <span class="priority priority-${escapeHTML(task.priority)}"><i></i>${escapeHTML(task.priority[0].toUpperCase() + task.priority.slice(1))}</span>
          ${task.dueDate ? `<span class="due-date">${icon("clock", 14)}${dateLabel(task.dueDate)}</span>` : ""}
        </div>
        <div class="avatar avatar-${escapeHTML(task.avatar)}" title="${escapeHTML(task.assignee)}">${escapeHTML(task.initials)}</div>
      </div>
    </article>
  `;
}
