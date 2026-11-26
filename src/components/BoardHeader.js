(function (global) {
  "use strict";

  function BoardHeader(board) {
    const escapeHtml = global.ORBIT_COMPONENTS.utils.escapeHtml;
    return `
      <header class="topbar board-topbar">
        <button class="brand" data-action="home" aria-label="Back to boards"><span class="brand-mark">o</span><span>orbit</span></button>
        <span class="breadcrumb">/</span><button class="back-link" data-action="home">Boards</button><span class="breadcrumb">/</span>
        <button class="board-title-button" data-action="rename-board" data-id="${escapeHtml(board.id)}">${escapeHtml(board.name)} <span class="edit-pencil">✎</span></button>
        <div class="topbar-spacer"></div>
        <button class="button button-soft board-star ${board.favorite ? "is-favorite" : ""}" data-action="favorite-board" data-id="${escapeHtml(board.id)}">${board.favorite ? "★ Starred" : "☆ Star"}</button>
        <button class="button button-soft" data-action="board-activity"><span class="button-icon">◷</span> Activity</button>
        <button class="button button-soft" data-action="board-menu"><span class="button-icon">•••</span> Menu</button>
        <button class="avatar avatar-user" title="Alex Morgan">AM</button>
      </header>`;
  }

  global.ORBIT_COMPONENTS.BoardHeader = BoardHeader;
})(window);
