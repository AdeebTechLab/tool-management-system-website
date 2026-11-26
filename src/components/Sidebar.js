(function (global) {
  "use strict";

  function Sidebar(board, boards) {
    const escapeHtml = global.ORBIT_COMPONENTS.utils.escapeHtml;
    const items = boards || [];
    return `
      <aside class="sidebar" aria-label="Workspace navigation">
        <button class="brand" data-action="home" aria-label="Orbit home"><span class="brand-mark">o</span><span>orbit</span></button>
        <nav class="primary-nav" aria-label="Boards">
          ${items.map(function (item) {
            return `<button class="board-link${item.id === (board && board.id) ? " active" : ""}" data-action="open-board" data-id="${escapeHtml(item.id)}"><span class="board-emoji">✳</span><span>${escapeHtml(item.name)}</span></button>`;
          }).join("")}
        </nav>
        <button class="new-board" data-action="new-board">＋<span>Create a board</span></button>
      </aside>`;
  }

  global.ORBIT_COMPONENTS.Sidebar = Sidebar;
})(window);