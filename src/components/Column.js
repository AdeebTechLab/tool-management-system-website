import { icon } from "./icons.js";
import { TaskCard } from "./TaskCard.js";

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}

export function Column(column, tasks, index = 0) {
  return `
    <section class="board-column" data-column-id="${escapeHTML(column.id)}" data-aos="fade-up" data-aos-delay="${Math.min(index * 70, 350)}">
      <div class="column-heading">
        <div class="column-title-wrap"><span class="column-indicator indicator-${escapeHTML(column.color)}"></span><h2>${escapeHTML(column.title)}</h2><span class="task-count">${tasks.length}</span></div>
        <div class="column-actions"><button class="icon-button" data-action="add-task" data-column-id="${escapeHTML(column.id)}" aria-label="Add task to ${escapeHTML(column.title)}">${icon("plus", 17)}</button><button class="icon-button" data-action="column-menu" data-column-id="${escapeHTML(column.id)}" aria-label="Column options">${icon("dots", 18)}</button></div>
      </div>
      <div class="task-list" data-dropzone="${escapeHTML(column.id)}">
        ${tasks.map(TaskCard).join("")}
      </div>
      <button class="add-task-button" data-action="add-task" data-column-id="${escapeHTML(column.id)}">${icon("plus", 17)}<span>Add a task</span><kbd>N</kbd></button>
    </section>
  `;
}
