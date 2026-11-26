import { icon } from "./icons.js";

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}

export function TaskDialog(task, columns) {
  const editing = Boolean(task?.id);
  const value = task ?? { title: "", description: "", priority: "medium", dueDate: "", assignee: "Jordan Davis", tag: "Design", columnId: columns[0]?.id ?? "" };
  return `
    <dialog class="task-dialog">
      <form method="dialog" class="dialog-shell" data-form="task">
        <div class="dialog-header"><div><span class="dialog-eyebrow">${editing ? "TASK DETAILS" : "NEW TASK"}</span><h2>${editing ? "Edit task" : "Create a task"}</h2></div><button type="button" class="icon-button dialog-close" data-action="close-dialog" aria-label="Close dialog">${icon("close", 19)}</button></div>
        <label class="field-label">Task name<input name="title" type="text" value="${escapeHTML(value.title)}" placeholder="What needs to get done?" required maxlength="120" autofocus></label>
        <label class="field-label">Description<textarea name="description" rows="3" placeholder="Add a few details...">${escapeHTML(value.description)}</textarea></label>
        <div class="field-grid">
          <label class="field-label">Status<select name="columnId">${columns.map((column) => `<option value="${escapeHTML(column.id)}" ${value.columnId === column.id ? "selected" : ""}>${escapeHTML(column.title)}</option>`).join("")}</select></label>
          <label class="field-label">Priority<select name="priority">${["low", "medium", "high"].map((item) => `<option value="${item}" ${value.priority === item ? "selected" : ""}>${item[0].toUpperCase() + item.slice(1)}</option>`).join("")}</select></label>
        </div>
        <div class="field-grid">
          <label class="field-label">Assignee<select name="assignee">${["Maya Chen", "Leo Martin", "Sam Rivera", "Jordan Davis"].map((name) => `<option ${value.assignee === name ? "selected" : ""}>${name}</option>`).join("")}</select></label>
          <label class="field-label">Due date<input name="dueDate" type="date" value="${escapeHTML(value.dueDate)}"></label>
        </div>
        <label class="field-label">Label<input name="tag" type="text" value="${escapeHTML(value.tag)}" placeholder="Design" maxlength="24"></label>
        <div class="dialog-footer">${editing ? `<button type="button" class="delete-task-button" data-action="delete-task">${icon("trash", 15)} Delete task</button>` : "<span></span>"}<div class="dialog-actions"><button type="button" class="cancel-button" data-action="close-dialog">Cancel</button><button class="primary-button" value="save">${editing ? "Save changes" : "Create task"}</button></div></div>
      </form>
    </dialog>
  `;
}

export function ColumnDialog(column) {
  const editing = Boolean(column);
  return `
    <dialog class="task-dialog column-dialog">
      <form method="dialog" class="dialog-shell" data-form="column">
        <div class="dialog-header"><div><span class="dialog-eyebrow">BOARD SETUP</span><h2>${editing ? "Edit list" : "Add a list"}</h2></div><button type="button" class="icon-button dialog-close" data-action="close-dialog" aria-label="Close dialog">${icon("close", 19)}</button></div>
        <label class="field-label">List name<input name="title" type="text" value="${escapeHTML(column?.title ?? "")}" placeholder="e.g. In review" required maxlength="32" autofocus></label>
        <div class="dialog-footer">${editing ? `<button type="button" class="delete-task-button" data-action="delete-column" data-column-id="${escapeHTML(column.id)}">${icon("trash", 15)} Delete list</button>` : "<span></span>"}<div class="dialog-actions"><button type="button" class="cancel-button" data-action="close-dialog">Cancel</button><button class="primary-button" value="save">${editing ? "Save list" : "Add list"}</button></div></div>
      </form>
    </dialog>
  `;
}

export function BoardDialog(board, boards = []) {
  const editing = Boolean(board);
  return `
    <dialog class="task-dialog board-dialog">
      <form method="dialog" class="dialog-shell" data-form="board" data-editing="${editing}">
        <div class="dialog-header"><div><span class="dialog-eyebrow">WORKSPACE SETUP</span><h2>${editing ? "Board settings" : "Create a board"}</h2></div><button type="button" class="icon-button dialog-close" data-action="close-dialog" aria-label="Close dialog">${icon("close", 19)}</button></div>
        <label class="field-label">Board name<input name="title" type="text" value="${escapeHTML(board?.title ?? "")}" placeholder="e.g. Product launch" required maxlength="60" autofocus></label>
        ${editing ? `<label class="field-label">Description<textarea name="subtitle" rows="3" maxlength="160">${escapeHTML(board.subtitle)}</textarea></label>` : ""}
        ${editing && boards.length > 1 ? `<div class="board-switch-list"><span class="board-switch-label">Switch board</span>${boards.filter((item) => item.id !== board.id).map((item) => `<button type="button" class="board-switch-option" data-action="select-board" data-board-id="${escapeHTML(item.id)}">${escapeHTML(item.title)}</button>`).join("")}</div>` : ""}
        <div class="dialog-footer">${editing ? `<div class="dialog-extra-actions">${boards.length > 1 ? `<button type="button" class="delete-task-button" data-action="delete-board">${icon("trash", 15)} Delete board</button>` : ""}<button type="button" class="cancel-button create-board-shortcut" data-action="add-board">New board</button></div>` : "<span></span>"}<div class="dialog-actions"><button type="button" class="cancel-button" data-action="close-dialog">Cancel</button><button class="primary-button" value="save">${editing ? "Save changes" : "Create board"}</button></div></div>
      </form>
    </dialog>
  `;
}
