(function (global) {
  "use strict";

  function BoardTile(board, index, defaultColor) {
    const escapeHtml = global.ORBIT_COMPONENTS.utils.escapeHtml;
    const count = board.lists.reduce(function (sum, list) { return sum + list.cards.length; }, 0);
    const star = board.favorite ? "★" : "☆";
    return `<article class="board-tile" data-aos="fade-up" data-aos-delay="${100 + Math.min(index * 90, 270)}" data-aos-duration="760">
      <button class="tile-cover" data-action="open-board" data-id="${escapeHtml(board.id)}" style="--cover:${escapeHtml(board.background || defaultColor)}">
        <span class="tile-cover-shade"></span><span class="tile-board-name">${escapeHtml(board.name)}</span><span class="tile-card-count">${count} cards</span>
      </button>
      <div class="tile-meta"><span class="tile-summary">${board.lists.length} lists</span><button class="icon-button tile-star ${board.favorite ? "is-favorite" : ""}" data-action="favorite-board" data-id="${escapeHtml(board.id)}" aria-label="${board.favorite ? "Remove from" : "Add to"} starred">${star}</button></div>
      <div class="tile-actions"><button data-action="rename-board" data-id="${escapeHtml(board.id)}">Rename</button><button data-action="duplicate-board" data-id="${escapeHtml(board.id)}">Duplicate</button><button data-action="delete-board" data-id="${escapeHtml(board.id)}">Delete</button></div>
    </article>`;
  }

  global.ORBIT_COMPONENTS.BoardTile = BoardTile;
})(window);
