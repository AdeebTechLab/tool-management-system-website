import { icon } from "./icons.js";

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}

export function Sidebar(activePage = "", board, boards = []) {
  const myTaskCount = board?.tasks.filter((task) => task.assignee === "Jordan Davis").length ?? 0;
  return `
    <aside class="sidebar" data-aos="fade-right">
      <a class="brand" href="#" aria-label="Orbit home">
        <span class="brand-mark"><span></span><span></span><span></span><span></span></span>
        <span>orbit</span>
      </a>
      <button class="workspace-switcher" data-action="workspace-info">
        <span class="workspace-logo">S</span>
        <span class="workspace-copy"><strong>Studio North</strong><small>Free workspace</small></span>
        ${icon("down", 16)}
      </button>
      <nav class="primary-nav" aria-label="Main navigation">
        <a href="#" class="nav-link${activePage === "board" ? " active" : ""}" data-action="navigate" data-page="board" aria-label="Overview" aria-current="${activePage === "board" ? "page" : "false"}">${icon("grid")}<span>Overview</span></a>
        <a href="#" class="nav-link${activePage === "my-tasks" ? " active" : ""}" data-action="navigate" data-page="my-tasks" aria-label="My tasks (${myTaskCount})" aria-current="${activePage === "my-tasks" ? "page" : "false"}">${icon("inbox")}<span>My tasks</span><span class="nav-count">${myTaskCount}</span></a>
        <a href="#" class="nav-link${activePage === "calendar" ? " active" : ""}" data-action="navigate" data-page="calendar" aria-label="Calendar" aria-current="${activePage === "calendar" ? "page" : "false"}">${icon("calendar")}<span>Calendar</span></a>
        <a href="#" class="nav-link${activePage === "insights" ? " active" : ""}" data-action="navigate" data-page="insights" aria-label="Insights" aria-current="${activePage === "insights" ? "page" : "false"}">${icon("chart")}<span>Insights</span></a>
      </nav>
      <div class="sidebar-divider"></div>
      <div class="section-label"><span>WORKSPACES</span></div>
      <button class="workspace-row" data-action="workspace-info"><span class="workspace-dot dot-violet"></span><span>Studio North</span>${icon("down", 14)}</button>
      <div class="section-label board-label"><span>YOUR BOARDS</span><button aria-label="Add board" data-action="add-board">${icon("plus", 16)}</button></div>
      <div class="board-nav">
        ${boards.map((item) => `<a href="#" class="board-link${item.id === board?.id ? " active" : ""}" data-action="select-board" data-board-id="${escapeHTML(item.id)}"><span class="board-emoji">✳</span><span>${escapeHTML(item.title)}</span></a>`).join("")}
        <button class="new-board" data-action="add-board">${icon("plus", 16)}<span>Create a board</span></button>
      </div>
      <div class="sidebar-bottom">
        <button class="help-link" data-action="help"><span class="help-badge">?</span><span>Help center</span><span class="help-shortcut">⌘ /</span></button>
        <div class="profile">
          <div class="avatar avatar-dark">JD</div>
          <div class="profile-copy"><strong>Jordan Davis</strong><small>jordan@studio.co</small></div>
          ${icon("dots", 18)}
        </div>
      </div>
    </aside>
  `;
}
