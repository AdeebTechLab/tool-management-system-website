import { icon } from "./icons.js";

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}

export function Topbar(page = "board", notificationsRead = false, boardTitle = "Website redesign", filter = "") {
  const currentPage = {
    insights: "Insights",
    "my-tasks": "My tasks",
    calendar: "Calendar",
  }[page] || boardTitle;
  return `
    <header class="topbar" data-aos="fade-down">
      <div class="breadcrumb"><span>Studio North</span>${icon("chevron", 14)}<span class="breadcrumb-current">${escapeHTML(currentPage)}</span></div>
      <div class="topbar-actions">
        <label class="search-box">${icon("search", 17)}<input type="search" value="${escapeHTML(filter)}" placeholder="Search anything..." aria-label="Search tasks"><kbd>⌘ K</kbd></label>
        <button class="icon-button notification-button" data-action="notifications" aria-label="Notifications">${icon("bell")}${notificationsRead ? "" : "<span></span>"}</button>
        <div class="avatar avatar-dark topbar-avatar">JD</div>
      </div>
    </header>
  `;
}
