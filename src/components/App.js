import { Board } from "./Board.js";
import { Insights } from "./Insights.js";
import { BoardDialog, ColumnDialog, TaskDialog } from "./TaskDialog.js";
import { Sidebar } from "./Sidebar.js";
import { Topbar } from "./Topbar.js";
import { initialBoard, loadWorkspace, saveWorkspace } from "../data/board.js";

const people = {
  "Maya Chen": { initials: "MC", avatar: "coral" },
  "Leo Martin": { initials: "LM", avatar: "blue" },
  "Sam Rivera": { initials: "SR", avatar: "purple" },
  "Jordan Davis": { initials: "JD", avatar: "dark" },
};

export class App {
  constructor(root) {
    this.root = root;
    this.workspace = loadWorkspace();
    this.boards = this.workspace.boards.length ? this.workspace.boards : [structuredClone(initialBoard)];
    this.activeBoardId = this.boards.some((board) => board.id === this.workspace.activeBoardId)
      ? this.workspace.activeBoardId
      : this.boards[0].id;
    this.filter = "";
    this.page = "board";
    this.view = "board";
    this.draggedTaskId = null;
    this.pointerDrag = null;
    this.suppressTaskClick = false;
    this.dialogTaskId = null;
    this.dialogColumnId = null;
    this.notificationsRead = false;
  }

  mount() {
    this.render();
    this.root.addEventListener("click", (event) => this.handleClick(event));
    this.root.addEventListener("input", (event) => this.handleInput(event));
    this.root.addEventListener("submit", (event) => this.handleSubmit(event));
    this.root.addEventListener("pointerdown", (event) => this.handlePointerDown(event));
    this.root.addEventListener("pointermove", (event) => this.handlePointerMove(event));
    this.root.addEventListener("pointerup", (event) => this.handlePointerUp(event));
    this.root.addEventListener("pointercancel", () => this.clearDragState());
    this.root.addEventListener("keydown", (event) => this.handleKeyboard(event));
  }

  render() {
    this.root.classList.add("aos-enabled");
    const content = this.page === "insights"
      ? Insights(this.board, this.filter)
      : Board(this.board, this.filter, this.view, this.page);
    this.root.innerHTML = `${Sidebar(this.page, this.board, this.boards)}<div class="page-shell">${Topbar(this.page, this.notificationsRead, this.board.title, this.filter)}${content}</div>`;
    this.initializeAOS();
  }

  persistAndRender() {
    saveWorkspace(this.boards, this.activeBoardId);
    this.render();
  }

  get board() {
    return this.boards.find((board) => board.id === this.activeBoardId);
  }

  initializeAOS() {
    const elements = this.root.querySelectorAll("[data-aos]");
    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("aos-animate"));
      return;
    }
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("aos-animate");
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    elements.forEach((element) => {
      element.style.setProperty("--aos-delay", `${Number(element.dataset.aosDelay) || 0}ms`);
      observer.observe(element);
    });
  }

  handleClick(event) {
    if (this.suppressTaskClick) {
      this.suppressTaskClick = false;
      return;
    }
    const action = event.target.closest("[data-action]");
    if (action) {
      const { action: name, taskId, columnId } = action.dataset;
      if (name === "add-task") this.openTaskDialog(null, columnId);
      if (name === "edit-task") this.openTaskDialog(this.board.tasks.find((task) => task.id === taskId));
      if (name === "navigate") {
        event.preventDefault();
        this.page = action.dataset.page;
        this.view = "board";
        this.render();
      }
      if (name === "select-board") {
        event.preventDefault();
        this.activeBoardId = action.dataset.boardId;
        this.page = "board";
        this.view = "board";
        this.filter = "";
        this.persistAndRender();
      }
      if (name === "view") {
        this.view = action.dataset.view;
        this.render();
      }
      if (name === "add-column") this.openColumnDialog();
      if (name === "delete-task") this.deleteDialogTask();
      if (name === "close-dialog") this.closeDialog();
      if (name === "focus-search") this.root.querySelector(".search-box input")?.focus();
      if (name === "add-board") this.openBoardDialog();
      if (name === "edit-board") this.openBoardDialog(this.board);
      if (name === "delete-board") this.deleteBoard();
      if (name === "workspace-info") this.showToast("Studio North is your active workspace.");
      if (name === "help") this.showToast("Shortcuts: press N to add a task, or Ctrl/⌘ K to search.");
      if (name === "column-menu") this.openColumnDialog(this.board.columns.find((column) => column.id === columnId));
      if (name === "delete-column") this.deleteColumn(columnId);
      if (name === "share") this.shareBoard();
      if (name === "notifications") {
        this.notificationsRead = true;
        action.querySelector("span")?.remove();
        const upcoming = this.board.tasks.filter((task) => task.dueDate && task.columnId !== "done").length;
        this.showToast(upcoming ? `You have ${upcoming} task${upcoming === 1 ? "" : "s"} with upcoming due dates.` : "You’re all caught up.");
      }
      return;
    }
    const card = event.target.closest(".task-card");
    if (card && !event.target.closest("button")) this.openTaskDialog(this.board.tasks.find((task) => task.id === card.dataset.taskId));
  }

  handleInput(event) {
    if (event.target.matches(".search-box input")) {
      const cursor = event.target.selectionStart;
      this.filter = event.target.value;
      this.render();
      const input = this.root.querySelector(".search-box input");
      input.focus();
      input.setSelectionRange(cursor, cursor);
    }
  }

  handleSubmit(event) {
    const form = event.target.closest("form[data-form]");
    if (!form) return;
    event.preventDefault();
    if (event.submitter?.value === "cancel") {
      this.closeDialog();
      return;
    }
    const values = Object.fromEntries(new FormData(form).entries());

    if (form.dataset.form === "task") {
      const person = people[values.assignee] ?? people["Maya Chen"];
      const task = {
        id: this.dialogTaskId ?? `task-${Date.now()}`,
        title: values.title.trim(),
        description: values.description.trim(),
        priority: values.priority,
        dueDate: values.dueDate,
        assignee: values.assignee,
        ...person,
        tag: values.tag.trim() || "General",
        columnId: values.columnId,
      };
      if (!task.title) return;
      if (this.dialogTaskId) {
        const index = this.board.tasks.findIndex((item) => item.id === this.dialogTaskId);
        if (index >= 0) this.board.tasks[index] = task;
      } else {
        this.board.tasks.push(task);
      }
      this.closeDialog();
      this.persistAndRender();
    }

    if (form.dataset.form === "column") {
      const title = values.title.trim();
      if (!title) return;
      if (this.dialogColumnId) {
        const column = this.board.columns.find((item) => item.id === this.dialogColumnId);
        if (column) column.title = title;
      } else {
        const id = `list-${Date.now()}`;
        this.board.columns.push({ id, title, color: ["lavender", "blue", "orange", "green"][this.board.columns.length % 4] });
      }
      this.dialogColumnId = null;
      this.closeDialog();
      this.persistAndRender();
    }

    if (form.dataset.form === "board") {
      const title = values.title.trim();
      if (!title) return;
      if (form.dataset.editing === "true") {
        this.board.title = title;
        this.board.subtitle = values.subtitle.trim();
      } else {
        const id = `board-${Date.now()}`;
        const newBoard = structuredClone(initialBoard);
        newBoard.id = id;
        newBoard.title = title;
        newBoard.subtitle = "Plan, track, and ship your next project.";
        newBoard.tasks = [];
        this.boards.push(newBoard);
        this.activeBoardId = id;
        this.page = "board";
        this.view = "board";
        this.filter = "";
      }
      this.closeDialog();
      this.persistAndRender();
    }
  }

  openTaskDialog(task, columnId) {
    this.dialogTaskId = task?.id ?? null;
    this.closeDialog();
    this.root.insertAdjacentHTML("beforeend", TaskDialog(task ? { ...task } : { columnId, title: "", description: "", priority: "medium", dueDate: "", assignee: "Jordan Davis", tag: "Design" }, this.board.columns));
    const dialog = this.root.querySelector(".task-dialog");
    dialog.showModal();
    dialog.querySelector('input[name="title"]').focus();
  }

  openColumnDialog(column) {
    this.dialogColumnId = column?.id ?? null;
    this.closeDialog();
    this.root.insertAdjacentHTML("beforeend", ColumnDialog(column));
    const dialog = this.root.querySelector(".column-dialog");
    dialog.showModal();
    dialog.querySelector('input[name="title"]').focus();
  }

  openBoardDialog(board) {
    this.closeDialog();
    this.root.insertAdjacentHTML("beforeend", BoardDialog(board, this.boards));
    const dialog = this.root.querySelector(".board-dialog");
    dialog.showModal();
    dialog.querySelector('input[name="title"]').focus();
  }

  closeDialog() {
    this.root.querySelectorAll("dialog").forEach((dialog) => {
      if (dialog.open) dialog.close();
      dialog.remove();
    });
  }

  deleteDialogTask() {
    if (!this.dialogTaskId) return;
    this.board.tasks = this.board.tasks.filter((task) => task.id !== this.dialogTaskId);
    this.closeDialog();
    this.persistAndRender();
    this.showToast("Task deleted.");
  }

  deleteColumn(columnId) {
    if (this.board.columns.length <= 1) {
      this.showToast("A board needs at least one list.");
      return;
    }
    const target = this.board.columns.find((column) => column.id !== columnId);
    this.board.tasks.forEach((task) => {
      if (task.columnId === columnId) task.columnId = target.id;
    });
    this.board.columns = this.board.columns.filter((column) => column.id !== columnId);
    this.dialogColumnId = null;
    this.closeDialog();
    this.persistAndRender();
    this.showToast(`List deleted. Its tasks moved to ${target.title}.`);
  }

  deleteBoard() {
    if (this.boards.length <= 1) {
      this.showToast("A workspace needs at least one board.");
      return;
    }
    if (!window.confirm(`Delete "${this.board.title}" and all of its tasks?`)) return;
    this.boards = this.boards.filter((board) => board.id !== this.activeBoardId);
    this.activeBoardId = this.boards[0].id;
    this.page = "board";
    this.view = "board";
    this.filter = "";
    this.closeDialog();
    this.persistAndRender();
    this.showToast("Board deleted.");
  }

  async shareBoard() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      this.showToast("Board link copied to clipboard.");
    } catch (error) {
      console.error("Could not copy the board link.", error);
      this.showToast("Clipboard access is unavailable in this browser.");
    }
  }

  handlePointerDown(event) {
    const card = event.target.closest(".task-card");
    if (!card || event.target.closest("button") || event.button !== 0) return;
    this.pointerDrag = {
      taskId: card.dataset.taskId,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };
  }

  handlePointerMove(event) {
    const drag = this.pointerDrag;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (!drag.moved && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 6) {
      drag.moved = true;
      this.draggedTaskId = drag.taskId;
      this.root.setPointerCapture(event.pointerId);
      this.root.querySelectorAll(".task-card").forEach((card) => {
        if (card.dataset.taskId === drag.taskId) card.classList.add("is-dragging");
      });
    }
    if (!drag.moved) return;
    event.preventDefault();
    const target = this.root.ownerDocument.elementFromPoint(event.clientX, event.clientY);
    const scroll = target?.closest(".board-scroll");
    if (scroll) {
      const bounds = scroll.getBoundingClientRect();
      if (event.clientX < bounds.left + 38) scroll.scrollLeft -= 18;
      if (event.clientX > bounds.right - 38) scroll.scrollLeft += 18;
    }
    const zone = target?.closest(".task-list");
    this.root.querySelectorAll(".task-list").forEach((list) => list.classList.remove("drop-active"));
    zone?.classList.add("drop-active");
  }

  handlePointerUp(event) {
    const drag = this.pointerDrag;
    if (!drag || drag.pointerId !== event.pointerId) return;
    this.pointerDrag = null;
    if (!drag.moved) return;
    this.suppressTaskClick = true;
    const target = this.root.ownerDocument.elementFromPoint(event.clientX, event.clientY);
    const zone = target?.closest(".task-list");
    const targetTaskId = target?.closest(".task-card")?.dataset.taskId;
    if (zone) this.moveTask(drag.taskId, zone.dataset.dropzone, targetTaskId);
    this.clearDragState();
    setTimeout(() => { this.suppressTaskClick = false; }, 0);
  }

  moveTask(taskId, columnId, targetTaskId) {
    const taskIndex = this.board.tasks.findIndex((task) => task.id === taskId);
    if (taskIndex < 0 || targetTaskId === taskId) return;
    const [task] = this.board.tasks.splice(taskIndex, 1);
    task.columnId = columnId;
    const insertBeforeIndex = targetTaskId
      ? this.board.tasks.findIndex((item) => item.id === targetTaskId)
      : -1;
    if (insertBeforeIndex >= 0) {
      this.board.tasks.splice(insertBeforeIndex, 0, task);
    } else {
      const lastIndex = this.board.tasks.reduce((last, item, index) => item.columnId === columnId ? index : last, -1);
      this.board.tasks.splice(lastIndex + 1, 0, task);
    }
    this.persistAndRender();
  }

  clearDragState() {
    this.draggedTaskId = null;
    this.pointerDrag = null;
    this.root.querySelectorAll(".is-dragging, .drop-active").forEach((element) => element.classList.remove("is-dragging", "drop-active"));
  }

  handleKeyboard(event) {
    if (event.key === "Escape") this.closeDialog();
    if (event.key.toLowerCase() === "n" && !event.metaKey && !event.ctrlKey && !event.altKey && !event.target.matches("input, textarea, select")) {
      event.preventDefault();
      this.openTaskDialog(null, this.board.columns[0]?.id);
    }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      this.root.querySelector(".search-box input")?.focus();
    }
    if (event.key === "Enter" && event.target.matches(".task-card, .task-table tbody tr[data-task-id]")) {
      this.openTaskDialog(this.board.tasks.find((task) => task.id === event.target.dataset.taskId));
    }
  }

  showToast(message) {
    this.root.querySelector(".toast")?.remove();
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    this.root.append(toast);
    window.setTimeout(() => toast.remove(), 2600);
  }
}
