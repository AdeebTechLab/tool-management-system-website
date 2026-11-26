(function () {
  "use strict";

  const STORE_KEY = "orbit-project-boards-v1";
  const COVER_MIGRATION_KEY = "orbit-demo-card-pictures-v1";
  const BOARD_COVER_MIGRATION_KEY = "orbit-demo-board-pictures-v1";
  const demo = window.ORBIT_DEMO;
  const app = document.getElementById("app");
  const toastRegion = document.getElementById("toast-region");
  const importFile = document.getElementById("import-file");
  let homeObserver = null;
  let heroSlideTimeout = null;
  let heroSlideInterval = null;
  const state = {
    boards: loadBoards(),
    currentBoardId: null,
    screen: "home",
    query: "",
    labelFilter: "",
    memberFilter: "",
    dueFilter: "",
    myCards: false,
    showArchived: false,
    collapseAll: false,
    modal: null,
    draggedCardId: null,
    draggedListId: null,
    homeHasRevealed: false
  };
  const currentUserId = "m1";
  const colors = [
    "linear-gradient(125deg,#6479d8,#a489e9)",
    "linear-gradient(125deg,#338b88,#6cbca5)",
    "linear-gradient(125deg,#d58d5e,#e9bd73)",
    "linear-gradient(125deg,#384b6b,#7189a7)",
    "linear-gradient(125deg,#be6587,#e29aa0)",
    "linear-gradient(125deg,#536b58,#9ab184)"
  ];

  function uid(prefix) {
    return (prefix || "id") + "-" + Math.random().toString(36).slice(2, 9);
  }
  function loadBoards() {
    try {
      const saved = localStorage.getItem(STORE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          try {
            seedDemoCardPictures(parsed);
            seedDemoBoardPictures(parsed);
          } catch (error) {
            console.error("Could not update demo pictures.", error);
          }
          return parsed;
        }
      }
    } catch (error) {
      console.error("Could not read saved Orbit data.", error);
    }
    return JSON.parse(JSON.stringify(demo.boards));
  }
  function seedDemoCardPictures(boards) {
    if (localStorage.getItem(COVER_MIGRATION_KEY)) return;
    const pictures = {};
    demo.boards.forEach(function (board) {
      board.lists.forEach(function (list) {
        list.cards.forEach(function (card) {
          if (card.cover) pictures[card.id] = card.cover;
        });
      });
    });
    boards.forEach(function (board) {
      (board.lists || []).forEach(function (list) {
        (list.cards || []).forEach(function (card) {
          if (!card.cover && pictures[card.id]) card.cover = pictures[card.id];
        });
      });
    });
    localStorage.setItem(STORE_KEY, JSON.stringify(boards));
    localStorage.setItem(COVER_MIGRATION_KEY, "done");
  }
  function seedDemoBoardPictures(boards) {
    const mobileBoard = boards.find(function (board) { return board.id === "b-mobile"; });
    const previousMobilePhoto = "linear-gradient(180deg,rgba(22,44,55,.04),rgba(20,46,49,.64)),url(https://images.unsplash.com/photo-1512941937669-90a1b58e7e9d?auto=format&fit=crop&w=1400&q=85)";
    if (mobileBoard && mobileBoard.background === previousMobilePhoto) {
      mobileBoard.background = demo.boards[1].background;
      localStorage.setItem(STORE_KEY, JSON.stringify(boards));
    }
    if (localStorage.getItem(BOARD_COVER_MIGRATION_KEY)) return;
    const defaultCovers = {
      "b-website": {
        previous: "linear-gradient(125deg,#6479d8,#a489e9)",
        cover: demo.boards[0].background
      },
      "b-mobile": {
        previous: "linear-gradient(125deg,#338b88,#6cbca5)",
        cover: demo.boards[1].background
      },
      "b-exams": {
        previous: "linear-gradient(125deg,#d58d5e,#e9bd73)",
        cover: demo.boards[2].background
      }
    };
    boards.forEach(function (board) {
      const defaults = defaultCovers[board.id];
      if (defaults && board.background === defaults.previous) board.background = defaults.cover;
    });
    localStorage.setItem(STORE_KEY, JSON.stringify(boards));
    localStorage.setItem(BOARD_COVER_MIGRATION_KEY, "done");
  }
  function save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state.boards));
    } catch (error) {
      console.error("Could not save Orbit data.", error);
      toast("Could not save your changes. Check browser storage.", "error");
    }
  }
  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }
  function safeImageUrl(value) {
    if (!value) return "";
    try {
      const url = new URL(value, window.location.href);
      return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
    } catch (error) {
      return "";
    }
  }
  function boardById(id) {
    return state.boards.find(function (board) { return board.id === id; });
  }
  function findCard(cardId, board) {
    if (!board) return null;
    for (let i = 0; i < board.lists.length; i++) {
      const card = board.lists[i].cards.find(function (item) { return item.id === cardId; });
      if (card) return { card: card, list: board.lists[i] };
    }
    return null;
  }
  function toast(message, type) {
    const node = document.createElement("div");
    node.className = "toast " + (type || "");
    node.textContent = message;
    toastRegion.appendChild(node);
    window.setTimeout(function () {
      node.classList.add("toast-out");
      window.setTimeout(function () { node.remove(); }, 250);
    }, 2600);
  }
  function stamp() {
    return new Date().toISOString();
  }
  function prettyTime(dateString) {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "just now";
    return date.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  }
  function recordBoard(board, message) {
    board.activity = board.activity || [];
    board.activity.unshift({ id: uid("act"), message: message, time: stamp() });
    save();
  }
  function recordCard(board, card, message) {
    card.activity = card.activity || [];
    card.activity.unshift({ id: uid("act"), message: message, time: stamp() });
    board.activity = board.activity || [];
    board.activity.unshift({ id: uid("act"), message: card.title + " · " + message, time: stamp() });
    save();
  }
  function initials(name) {
    return String(name || "").split(/\s+/).slice(0, 2).map(function (part) { return part.charAt(0); }).join("").toUpperCase();
  }
  function labelById(id) {
    return demo.labels.find(function (label) { return label.id === id; });
  }
  function memberById(id) {
    return demo.members.find(function (member) { return member.id === id; });
  }
  function dueState(dateString) {
    if (!dateString) return "";
    const due = new Date(dateString + "T23:59:59");
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endToday = new Date(start.getTime() + 86400000);
    const endWeek = new Date(start.getTime() + 7 * 86400000);
    if (due < start) return "overdue";
    if (due < endToday) return "today";
    if (due < endWeek) return "week";
    return "later";
  }
  function matchesFilters(card) {
    const query = state.query.trim().toLowerCase();
    if (query && !(card.title + " " + (card.description || "")).toLowerCase().includes(query)) return false;
    if (state.labelFilter && !(card.labels || []).includes(state.labelFilter)) return false;
    if (state.memberFilter && !(card.members || []).includes(state.memberFilter)) return false;
    if (state.myCards && !(card.members || []).includes(currentUserId)) return false;
    const due = dueState(card.dueDate);
    if (state.dueFilter === "overdue" && due !== "overdue") return false;
    if (state.dueFilter === "today" && due !== "today") return false;
    if (state.dueFilter === "week" && due !== "today" && due !== "week") return false;
    if (state.dueFilter === "none" && card.dueDate) return false;
    return true;
  }
  function render() {
    if (state.screen === "board" && boardById(state.currentBoardId)) {
      renderBoard();
    } else {
      state.screen = "home";
      renderHome();
    }
  }
  function renderHome() {
    stopHeroSlideshow();
    document.body.dataset.screen = "home";
    document.body.dataset.theme = "dark";
    const query = state.query.trim().toLowerCase();
    const boards = state.boards.filter(function (board) { return board.name.toLowerCase().includes(query); });
    const visibleBoards = boards.slice().sort(function (a, b) { return Number(b.favorite) - Number(a.favorite); });
    const totalCards = state.boards.reduce(function (sum, board) {
      return sum + board.lists.reduce(function (boardSum, list) { return boardSum + list.cards.length; }, 0);
    }, 0);
    app.innerHTML = `
      ${window.ORBIT_COMPONENTS.HomeHeader(state.query)}
      <main class="home-main">
        <section class="welcome-row" aria-labelledby="welcome-heading" data-aos="fade-up" data-aos-duration="850">
          <div class="welcome-content">
            <p class="eyebrow"><span class="eyebrow-dot"></span> A CLEARER WAY TO WORK</p>
            <h1 id="welcome-heading"><span class="headline-line"><span class="headline-word">Make</span> <span class="headline-word">room</span> <span class="headline-word">for</span></span><br><span class="headline-phrase-reveal"><span class="headline-phrase">great work.</span></span></h1>
            <p class="welcome-copy">A calm place to plan, build, and move things forward.</p>
            <div class="welcome-copy-row">
              <button class="button button-primary hero-action" data-action="new-board"><span aria-hidden="true">＋</span> Create a board <span class="button-arrow" aria-hidden="true">↗</span></button>
              <a class="hero-link" href="#boards">Explore your boards <span aria-hidden="true">↓</span></a>
            </div>
          </div>
          ${window.ORBIT_COMPONENTS.HeroVisual(state.boards.length, totalCards)}
        </section>
        <section class="board-section" id="boards" aria-labelledby="boards-heading">
          <div class="section-heading" data-aos="fade-up" data-aos-delay="70"><div><span class="section-icon grid-icon" aria-hidden="true">▦</span><div class="section-heading-copy"><h2 id="boards-heading">Your boards</h2><p>Pick up where you left off.</p></div></div><span class="section-count" aria-label="${boards.length} boards">${boards.length}</span></div>
          ${boards.length ? `<div class="board-grid">${visibleBoards.map(boardTile).join("")}<button class="create-board-tile" data-action="new-board" data-aos="zoom-in" data-aos-delay="${Math.min(boards.length * 90, 360)}" data-aos-duration="750"><span class="create-plus">+</span><b>Create a board</b><small>Start with a clean slate</small></button></div>` : `<div class="empty-state" data-aos="fade-up" data-aos-delay="120"><div class="empty-symbol">⌕</div><h3>No boards found</h3><p>${state.boards.length ? "Try another search or create a board." : "Create your first board to get started."}</p><button class="button button-primary" data-action="new-board">Create a board</button></div>`}
        </section>
        <footer class="home-footer" data-aos="fade-up" data-aos-delay="120"><span>Designed for momentum.</span><span>${state.boards.length} board${state.boards.length === 1 ? "" : "s"} · Saved in this browser</span></footer>
      </main>
      ${state.modal ? renderModal() : ""}
    `;
    if (state.homeHasRevealed) {
      if (homeObserver) {
        homeObserver.disconnect();
        homeObserver = null;
      }
      app.querySelectorAll("[data-aos]").forEach(function (item) { item.classList.add("aos-visible"); });
    } else {
      revealHomeElements();
      state.homeHasRevealed = true;
    }
    startHeroSlideshow();
  }
  function stopHeroSlideshow() {
    if (heroSlideTimeout !== null) {
      window.clearTimeout(heroSlideTimeout);
      heroSlideTimeout = null;
    }
    if (heroSlideInterval !== null) {
      window.clearInterval(heroSlideInterval);
      heroSlideInterval = null;
    }
  }
  function startHeroSlideshow() {
    const visual = app.querySelector(".hero-visual");
    const slides = Array.from(app.querySelectorAll("[data-visual-slide]"));
    if (!visual || slides.length < 2 || state.modal || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let activeIndex = 0;
    let paused = false;
    function advance() {
      const current = slides[activeIndex];
      activeIndex = (activeIndex + 1) % slides.length;
      current.classList.remove("is-active");
      current.classList.add("is-leaving");
      slides[activeIndex].classList.remove("is-leaving");
      slides[activeIndex].classList.add("is-active");
    }
    function start() {
      if (paused || heroSlideInterval !== null) return;
      advance();
      heroSlideInterval = window.setInterval(advance, 4200);
    }
    function pause() {
      paused = true;
      if (heroSlideInterval !== null) {
        window.clearInterval(heroSlideInterval);
        heroSlideInterval = null;
      }
    }
    function resume() {
      paused = false;
      if (heroSlideTimeout === null && heroSlideInterval === null) {
        heroSlideInterval = window.setInterval(advance, 4200);
      }
    }

    visual.addEventListener("mouseenter", pause);
    visual.addEventListener("mouseleave", resume);
    heroSlideTimeout = window.setTimeout(function () {
      heroSlideTimeout = null;
      start();
    }, 20);
  }
  function revealHomeElements() {
    if (homeObserver) homeObserver.disconnect();
    const items = app.querySelectorAll("[data-aos]");
    items.forEach(function (item) {
      const delay = item.getAttribute("data-aos-delay");
      const duration = item.getAttribute("data-aos-duration");
      if (delay !== null && Number.isFinite(Number(delay))) item.style.setProperty("--aos-delay", Math.max(0, Number(delay)) + "ms");
      if (duration !== null && Number.isFinite(Number(duration))) item.style.setProperty("--aos-duration", Math.max(0, Number(duration)) + "ms");
    });
    if (typeof window.IntersectionObserver !== "function") {
      items.forEach(function (item) { item.classList.add("aos-visible"); });
      return;
    }
    homeObserver = new window.IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("aos-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -24px 0px" });
    items.forEach(function (item) { homeObserver.observe(item); });
  }
  function boardTile(board, index) {
    return window.ORBIT_COMPONENTS.BoardTile(board, index, colors[0]);
  }
  function renderBoard() {
    const board = boardById(state.currentBoardId);
    if (!board) return renderHome();
    stopHeroSlideshow();
    document.body.dataset.screen = "board";
    if (homeObserver) {
      homeObserver.disconnect();
      homeObserver = null;
    }
    const totalCards = board.lists.reduce(function (sum, list) { return sum + list.cards.length; }, 0);
    app.innerHTML = `
      ${window.ORBIT_COMPONENTS.BoardHeader(board)}
      <main class="board-page ${board.lists.length ? "" : "is-empty"}" style="--board-bg:${escapeHtml(board.background || colors[0])}">
        <div class="board-toolbar">
          <div class="board-toolbar-heading">
            <span class="board-kicker">Project board</span>
            <h1>${escapeHtml(board.name)}</h1>
            <div class="board-subtitle"><span class="board-bullet"></span><span>${totalCards} cards across ${board.lists.length} lists</span></div>
          </div>
          <div class="filter-row">
            <label class="board-search"><span class="icon">⌕</span><input id="board-search" type="search" placeholder="Search cards" value="${escapeHtml(state.query)}" aria-label="Search cards on this board"><kbd>F</kbd></label>
            <select id="filter-label" aria-label="Filter by label"><option value="">All labels</option>${demo.labels.map(function (label) { return `<option value="${label.id}" ${state.labelFilter === label.id ? "selected" : ""}>${escapeHtml(label.name)}</option>`; }).join("")}</select>
            <select id="filter-member" aria-label="Filter by member"><option value="">All members</option>${demo.members.map(function (member) { return `<option value="${member.id}" ${state.memberFilter === member.id ? "selected" : ""}>${escapeHtml(member.name)}</option>`; }).join("")}</select>
            <select id="filter-due" aria-label="Filter by due date"><option value="">Any due date</option><option value="overdue" ${state.dueFilter==="overdue"?"selected":""}>Overdue</option><option value="today" ${state.dueFilter==="today"?"selected":""}>Due today</option><option value="week" ${state.dueFilter==="week"?"selected":""}>Due this week</option><option value="none" ${state.dueFilter==="none"?"selected":""}>No due date</option></select>
            <button class="button button-soft my-cards ${state.myCards ? "selected" : ""}" data-action="my-cards">◎ My cards</button>
            <button class="button button-primary add-list-top" data-action="new-list">＋ Add list</button>
          </div>
        </div>
        <div class="board-canvas" id="board-canvas">
          ${board.lists.length ? board.lists.map(function (list, index) { return renderList(list, board, index); }).join("") : `<div class="board-empty"><div class="empty-symbol">▤</div><h2>Your board is ready</h2><p>Add a list to start organizing the work.</p><button class="button button-primary" data-action="new-list">Create your first list</button></div>`}
          <button class="add-list-card" data-action="new-list"><span>＋</span><b>Add another list</b></button>
        </div>
        ${state.showArchived ? renderArchived(board) : ""}
      </main>
      ${state.modal ? renderModal() : ""}
    `;
  }
  function renderList(list, board, index) {
    const visibleCards = list.cards.filter(matchesFilters);
    const filtered = state.query || state.labelFilter || state.memberFilter || state.dueFilter || state.myCards;
    return `<section class="list-column ${list.collapsed || state.collapseAll ? "is-collapsed" : ""}" data-list-id="${escapeHtml(list.id)}" ${state.draggedListId === list.id ? 'data-dragging="true"' : ""}>
      <div class="list-header" draggable="true" data-list-drag="${escapeHtml(list.id)}">
        <span class="list-drag-handle" title="Drag to reorder">⠿</span>
        <button class="list-name" data-action="rename-list" data-id="${escapeHtml(list.id)}">${escapeHtml(list.name)}</button>
        <span class="list-count">${visibleCards.length}</span>
        <button class="icon-button list-menu-trigger" data-action="list-menu" data-id="${escapeHtml(list.id)}" aria-label="List options">•••</button>
      </div>
      ${!(list.collapsed || state.collapseAll) ? `<div class="list-card-stack" data-drop-list="${escapeHtml(list.id)}">
        ${visibleCards.length ? visibleCards.map(function (card) { return renderCard(card, board, list); }).join("") : `<div class="list-empty">${filtered ? "No cards match these filters" : "Nothing here yet. Add a card to get started."}</div>`}
      </div>
      <button class="add-card-button" data-action="new-card" data-id="${escapeHtml(list.id)}"><span>＋</span> Add a card</button>` : ""}
      <div class="list-footer"><button data-action="new-card" data-id="${escapeHtml(list.id)}">＋ Add card</button><span>List ${index + 1}</span></div>
    </section>`;
  }
  function renderCard(card, board, list) {
    const labels = (card.labels || []).map(labelById).filter(Boolean);
    const members = (card.members || []).map(memberById).filter(Boolean);
    const checklistDone = (card.checklist || []).filter(function (item) { return item.done; }).length;
    const due = dueState(card.dueDate);
    const cover = safeImageUrl(card.cover);
    return `<article class="task-card ${due === "overdue" ? "card-overdue" : ""}" draggable="true" data-card-id="${escapeHtml(card.id)}" data-list-id="${escapeHtml(list.id)}" data-action="open-card" tabindex="0">
      ${cover ? `<img class="card-cover" src="${escapeHtml(cover)}" alt="" loading="lazy" decoding="async">` : ""}
      ${labels.length ? `<div class="card-labels">${labels.map(function (label) { return `<span class="card-label" style="--label:${label.color}" title="${escapeHtml(label.name)}">${escapeHtml(label.name)}</span>`; }).join("")}</div>` : ""}
      <div class="card-title">${escapeHtml(card.title)}</div>
      ${card.description ? `<span class="card-description-icon" title="Has a description">≡</span>` : ""}
      <div class="card-footer">
        <div class="card-indicators">
          ${card.dueDate ? `<span class="card-due ${due === "overdue" ? "overdue" : ""}">◷ ${new Date(card.dueDate + "T00:00:00").toLocaleDateString([], {month:"short",day:"numeric"})}</span>` : ""}
          ${(card.checklist || []).length ? `<span class="card-checklist">☑ ${checklistDone}/${card.checklist.length}</span>` : ""}
          ${(card.comments || []).length ? `<span class="card-comment-count">▱ ${card.comments.length}</span>` : ""}
        </div>
        <div class="avatar-stack">${members.slice(0, 3).map(function (member) { return `<span class="avatar mini-avatar" title="${escapeHtml(member.name)}" style="--avatar:${member.color}">${member.initials}</span>`; }).join("")}</div>
      </div>
    </article>`;
  }
  function renderArchived(board) {
    const cards = board.archivedCards || [];
    const lists = board.archivedLists || [];
    return `<section class="archived-section"><div class="archived-heading"><div><p class="eyebrow">BOARD HISTORY</p><h2>Archived items <span class="section-count">${cards.length + lists.length}</span></h2></div><button class="button button-soft" data-action="hide-archived">Hide archive</button></div>
      <h3 class="archive-subheading">Cards</h3>${cards.length ? `<div class="archived-grid">${cards.map(function (entry) { return `<article class="archived-card"><div><b>${escapeHtml(entry.card.title)}</b><small>From ${escapeHtml(entry.listName)} · ${prettyTime(entry.archivedAt)}</small></div><button class="button button-soft" data-action="restore-card" data-id="${escapeHtml(entry.card.id)}">Restore</button></article>`; }).join("")}</div>` : `<p class="muted-copy">No archived cards.</p>`}
      <h3 class="archive-subheading">Lists</h3>${lists.length ? `<div class="archived-grid">${lists.map(function (list) { return `<article class="archived-card"><div><b>${escapeHtml(list.name)}</b><small>${list.cards.length} cards · ${prettyTime(list.archivedAt)}</small></div><button class="button button-soft" data-action="restore-list" data-id="${escapeHtml(list.id)}">Restore</button></article>`; }).join("")}</div>` : `<p class="muted-copy">No archived lists.</p>`}
    </section>`;
  }
  function renderModal() {
    if (!state.modal) return "";
    if (state.modal.type === "card") return renderCardModal();
    if (state.modal.type === "board-create") return `<div class="modal-backdrop" data-action="close-modal"><section class="modal small-modal" role="dialog" aria-modal="true" aria-labelledby="modal-heading" data-modal-content><button class="modal-close" data-action="close-modal" aria-label="Close">×</button><p class="eyebrow">NEW WORKSPACE</p><h2 id="modal-heading">Create a board</h2><form data-form="create-board"><label>Board name<input name="name" required maxlength="60" placeholder="What are you working on?"></label><label>Cover color<div class="cover-choices">${colors.map(function (color, i) { return `<label class="cover-choice"><input type="radio" name="color" value="${escapeHtml(color)}" ${i===0?"checked":""}><span style="--cover:${escapeHtml(color)}"></span></label>`; }).join("")}</div></label><div class="modal-actions"><button type="button" class="button button-soft" data-action="close-modal">Cancel</button><button class="button button-primary" type="submit">Create board</button></div></form></section></div>`;
    if (state.modal.type === "board-menu") return renderBoardMenu();
    if (state.modal.type === "activity") return renderActivityModal();
    if (state.modal.type === "list-menu") return renderListMenu();
    return "";
  }
  function renderCardModal() {
    const board = boardById(state.currentBoardId);
    const result = findCard(state.modal.cardId, board);
    if (!result) return "";
    const card = result.card;
    const done = (card.checklist || []).filter(function (item) { return item.done; }).length;
    const checkPercent = card.checklist && card.checklist.length ? Math.round(done / card.checklist.length * 100) : 0;
    const due = dueState(card.dueDate);
    const cover = safeImageUrl(card.cover);
    return `<div class="modal-backdrop" data-action="close-modal"><section class="modal card-modal" role="dialog" aria-modal="true" aria-labelledby="card-heading" data-modal-content>
      <button class="modal-close" data-action="close-modal" aria-label="Close">×</button>
      <div class="modal-main">
        <div class="modal-card-heading"><span class="modal-heading-icon">▤</span><div><h2 id="card-heading">${escapeHtml(card.title)}</h2><p>in <b>${escapeHtml(result.list.name)}</b></p></div></div>
        <form data-form="edit-card" data-id="${escapeHtml(card.id)}" class="card-edit-form">
          <label class="field-label">Title<input name="title" value="${escapeHtml(card.title)}" maxlength="160" required></label>
          <label class="field-label">Description<textarea name="description" rows="3" placeholder="Add more detail...">${escapeHtml(card.description || "")}</textarea></label>
          <button class="button button-primary button-small" type="submit">Save changes</button>
        </form>
        <div class="sidebar-field modal-date-field"><h3>Due date</h3><input class="date-input ${due === "overdue" ? "date-overdue" : ""}" id="card-due-date" type="date" value="${escapeHtml(card.dueDate || "")}">${due === "overdue" ? `<span class="overdue-note">This card is overdue</span>` : ""}</div>
        <div class="detail-block"><div class="detail-heading"><h3>Checklist</h3><span>${done}/${(card.checklist || []).length}</span></div>${card.checklist && card.checklist.length ? `<div class="progress-track"><span style="width:${checkPercent}%"></span></div><div class="checklist-items">${card.checklist.map(function (item) { return `<div class="checklist-row"><input type="checkbox" data-action="toggle-check" data-id="${escapeHtml(item.id)}" ${item.done ? "checked" : ""} aria-label="Mark ${escapeHtml(item.text)} ${item.done ? "incomplete" : "complete"}"><span class="${item.done ? "checked-text" : ""}">${escapeHtml(item.text)}</span><button class="icon-button remove-check" data-action="delete-check" data-id="${escapeHtml(item.id)}" aria-label="Delete checklist item">×</button></div>`; }).join("")}</div>` : `<p class="muted-copy">No checklist items yet. Add one to get started.</p>`}${state.modal.addingChecklistItem ? `<form data-form="add-check" class="inline-add"><input name="text" placeholder="Add an item..." required maxlength="120"><button class="button button-soft button-small">Add item</button><button type="button" class="button button-soft button-small" data-action="cancel-add-check">Cancel</button></form>` : `<button class="button button-soft button-small add-check-trigger" data-action="show-add-check">＋ Add item</button>`}</div>
        ${card.comments && card.comments.length ? `<div class="detail-block"><h3>Comments</h3><div class="comments-list">${card.comments.map(function (comment) { return `<div class="comment-row"><span class="avatar comment-avatar">AM</span><div><div class="comment-meta"><b>${escapeHtml(comment.name)}</b><time>${prettyTime(comment.time)}</time></div><p>${escapeHtml(comment.text)}</p></div></div>`; }).join("")}</div></div>` : ""}
        <div class="detail-block"><h3>Activity</h3>${card.activity && card.activity.length ? `<div class="activity-list compact">${card.activity.slice(0, 8).map(activityRow).join("")}</div>` : `<p class="muted-copy">Card activity will appear here.</p>`}</div>
      </div>
      <aside class="modal-sidebar">
        <div class="sidebar-field"><h3>Card picture</h3>${cover ? `<img class="cover-preview" src="${escapeHtml(cover)}" alt="Picture for ${escapeHtml(card.title)}" loading="lazy">` : `<div class="cover-empty">Add a picture to this card</div>`}<form data-form="set-cover" class="cover-form"><input name="cover" type="url" value="${escapeHtml(cover)}" placeholder="Paste an image URL" aria-label="Image URL" required maxlength="500"><button class="button button-soft button-small">${cover ? "Update" : "Add picture"}</button></form>${cover ? `<button class="remove-cover-button" data-action="remove-cover">Remove picture</button>` : ""}</div>
      </aside>
    </section></div>`;
  }
  function activityRow(item) {
    return `<div class="activity-row"><span class="activity-dot"></span><div><p>${escapeHtml(item.message)}</p><time>${prettyTime(item.time)}</time></div></div>`;
  }
  function renderBoardMenu() {
    const board = boardById(state.currentBoardId);
    return `<div class="modal-backdrop menu-backdrop" data-action="close-modal"><section class="modal menu-modal" role="dialog" aria-modal="true" aria-labelledby="menu-heading" data-modal-content><button class="modal-close" data-action="close-modal" aria-label="Close">×</button><p class="eyebrow">BOARD OPTIONS</p><h2 id="menu-heading">Board menu</h2><div class="menu-section"><h3>Background</h3><div class="background-choices">${colors.map(function (color) { return `<button class="background-swatch" style="--cover:${escapeHtml(color)}" data-action="set-background" data-value="${escapeHtml(color)}" aria-label="Set board background"></button>`; }).join("")}<button class="background-swatch photo-swatch" data-action="set-background" data-value="linear-gradient(160deg,rgba(18,34,52,.1),rgba(17,35,46,.52)),url(https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&amp;fit=crop&amp;w=1400&amp;q=80)" aria-label="Set mountain image background">↗</button><button class="background-swatch photo-swatch photo-two" data-action="set-background" data-value="linear-gradient(160deg,rgba(18,34,52,.1),rgba(17,35,46,.52)),url(https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&amp;fit=crop&amp;w=1400&amp;q=80)" aria-label="Set field image background">↗</button></div></div>
      <div class="menu-actions"><button data-action="toggle-archive">${state.showArchived ? "Hide" : "Show"} archived cards <span>›</span></button><button data-action="toggle-collapse">${state.collapseAll ? "Expand" : "Collapse"} all lists <span>›</span></button><button data-action="board-activity">View board activity <span>›</span></button><button data-action="export-board">Export board as JSON <span>↓</span></button><button data-action="import-board">Import board from JSON <span>↑</span></button><button class="danger-menu-action" data-action="delete-current-board">Delete this board <span>×</span></button></div></section></div>`;
  }
  function renderListMenu() {
    const list = boardById(state.currentBoardId).lists.find(function (item) { return item.id === state.modal.listId; });
    if (!list) return "";
    return `<div class="modal-backdrop menu-backdrop" data-action="close-modal"><section class="modal list-menu-modal" role="dialog" aria-modal="true" data-modal-content><button class="modal-close" data-action="close-modal" aria-label="Close">×</button><p class="eyebrow">LIST OPTIONS</p><h2>${escapeHtml(list.name)}</h2><div class="menu-actions"><button data-action="rename-list" data-id="${escapeHtml(list.id)}">Rename list <span>✎</span></button><button data-action="archive-list" data-id="${escapeHtml(list.id)}">Archive list <span>›</span></button><button class="danger-menu-action" data-action="delete-list" data-id="${escapeHtml(list.id)}">Delete list and cards <span>×</span></button></div></section></div>`;
  }
  function renderActivityModal() {
    const board = boardById(state.currentBoardId);
    const events = board.activity || [];
    return `<div class="modal-backdrop" data-action="close-modal"><section class="modal activity-modal" role="dialog" aria-modal="true" aria-labelledby="activity-heading" data-modal-content><button class="modal-close" data-action="close-modal" aria-label="Close">×</button><p class="eyebrow">BOARD HISTORY</p><h2 id="activity-heading">Activity</h2>${events.length ? `<div class="activity-list">${events.slice(0, 100).map(activityRow).join("")}</div>` : `<div class="empty-state compact-empty"><div class="empty-symbol">◷</div><h3>No activity yet</h3><p>Changes to this board will show up here.</p></div>`}</section></div>`;
  }
  function openCard(cardId) {
    state.modal = { type: "card", cardId: cardId };
    render();
  }
  function closeModal() {
    state.modal = null;
    render();
  }
  function askValue(message, value) {
    const result = window.prompt(message, value || "");
    return result === null ? null : result.trim();
  }
  function newCard(listId) {
    const title = askValue("Card title");
    if (!title) return;
    const board = boardById(state.currentBoardId);
    const list = board.lists.find(function (item) { return item.id === listId; });
    const card = { id: uid("card"), title: title, description: "", labels: [], members: [], dueDate: "", checklist: [], attachments: [], comments: [], activity: [] };
    list.cards.push(card);
    recordCard(board, card, "was created");
    state.modal = { type: "card", cardId: card.id };
    render();
    toast("Card created");
  }
  function cardFromModal() {
    const board = boardById(state.currentBoardId);
    const found = findCard(state.modal && state.modal.cardId, board);
    return found ? { board: board, card: found.card, list: found.list } : null;
  }
  function handleAction(action, target) {
    const id = target.dataset.id;
    const board = boardById(state.currentBoardId);
    if (action === "home") {
      state.screen = "home"; state.currentBoardId = null; state.query = ""; state.modal = null; state.homeHasRevealed = false; render();
    } else if (action === "open-board") {
      state.screen = "board"; state.currentBoardId = id; state.query = ""; state.labelFilter = ""; state.memberFilter = ""; state.dueFilter = ""; state.myCards = false; state.showArchived = false; state.modal = null; render();
    } else if (action === "new-board") {
      state.modal = { type: "board-create" }; render(); setTimeout(function () { const input = document.querySelector('[name="name"]'); if (input) input.focus(); }, 0);
    } else if (action === "favorite-board") {
      const item = boardById(id); item.favorite = !item.favorite; save(); render(); toast(item.favorite ? "Board starred" : "Board unstarred");
    } else if (action === "rename-board") {
      const item = boardById(id); const name = askValue("Rename board", item.name); if (name) { item.name = name; recordBoard(item, "Board was renamed to " + name); render(); toast("Board renamed"); }
    } else if (action === "duplicate-board") {
      const source = boardById(id); const copy = JSON.parse(JSON.stringify(source)); copy.id = uid("board"); copy.name = source.name + " copy"; copy.favorite = false; copy.activity = [];
      copy.lists.forEach(function (list) { list.id = uid("list"); list.cards.forEach(function (card) { card.id = uid("card"); card.activity = []; }); });
      state.boards.push(copy); save(); render(); toast("Board duplicated");
    } else if (action === "delete-board") {
      const item = boardById(id); if (window.confirm('Delete "' + item.name + '" and all its cards?')) { state.boards = state.boards.filter(function (b) { return b.id !== id; }); save(); render(); toast("Board deleted"); }
    } else if (action === "new-list") {
      const name = askValue("List name", "New list"); if (!name) return;
      const list = { id: uid("list"), name: name, collapsed: false, cards: [] }; board.lists.push(list); recordBoard(board, "List " + name + " was created"); render(); toast("List created");
    } else if (action === "rename-list") {
      const listId = id || (state.modal && state.modal.listId); const list = board.lists.find(function (item) { return item.id === listId; });
      if (!list) return;
      state.modal = null; const name = askValue("Rename list", list.name); if (name) { list.name = name; recordBoard(board, "List was renamed to " + name); render(); toast("List renamed"); }
    } else if (action === "list-menu") {
      state.modal = { type: "list-menu", listId: id }; render();
    } else if (action === "delete-list") {
      const list = board.lists.find(function (item) { return item.id === id; });
      if (list && window.confirm('Delete "' + list.name + '" and its ' + list.cards.length + " cards?")) { board.lists = board.lists.filter(function (item) { return item.id !== id; }); state.modal = null; recordBoard(board, "List " + list.name + " and its cards were deleted"); render(); toast("List deleted"); }
    } else if (action === "archive-list") {
      const list = board.lists.find(function (item) { return item.id === id; });
      if (list) { board.archivedLists = board.archivedLists || []; board.archivedLists.push(Object.assign({}, list, { archivedAt: stamp() })); board.lists = board.lists.filter(function (item) { return item.id !== id; }); state.modal = null; recordBoard(board, "List " + list.name + " was archived"); render(); toast("List archived"); }
    } else if (action === "new-card") {
      newCard(id);
    } else if (action === "close-modal") {
      if (target.classList.contains("modal-backdrop") || target.closest(".modal-close")) closeModal();
    } else if (action === "board-menu") {
      state.modal = { type: "board-menu" }; render();
    } else if (action === "board-activity") {
      state.modal = { type: "activity" }; render();
    } else if (action === "toggle-collapse") {
      state.collapseAll = !state.collapseAll; board.lists.forEach(function (list) { list.collapsed = state.collapseAll; }); state.modal = null; render();
    } else if (action === "toggle-archive") {
      state.showArchived = !state.showArchived; state.modal = null; render();
    } else if (action === "hide-archived") {
      state.showArchived = false; render();
    } else if (action === "set-background") {
      board.background = target.dataset.value; state.modal = null; recordBoard(board, "Board background was changed"); render(); toast("Board background updated");
    } else if (action === "export-board") {
      exportBoard(board); state.modal = null; render(); toast("Board exported as JSON");
    } else if (action === "import-board") {
      state.modal = null; render(); importFile.click();
    } else if (action === "delete-current-board") {
      if (window.confirm('Delete "' + board.name + '" and all its cards?')) { state.boards = state.boards.filter(function (item) { return item.id !== board.id; }); state.currentBoardId = null; state.screen = "home"; state.modal = null; save(); render(); toast("Board deleted"); }
    } else if (action === "my-cards") {
      state.myCards = !state.myCards; render();
    } else if (action === "open-card") {
      if (!target.closest("button")) openCard(target.dataset.cardId);
    } else if (action === "show-add-check") {
      state.modal.addingChecklistItem = true;
      render();
      const input = document.querySelector('.card-modal [name="text"]');
      if (input) input.focus();
    } else if (action === "cancel-add-check") {
      state.modal.addingChecklistItem = false;
      render();
    } else if (action === "toggle-check") {
      const detail = cardFromModal(); if (!detail) return;
      const item = detail.card.checklist.find(function (check) { return check.id === id; });
      if (item) { item.done = !item.done; recordCard(detail.board, detail.card, (item.done ? "completed" : "reopened") + ' checklist item "' + item.text + '"'); render(); toast(item.done ? "Checklist item completed" : "Checklist item reopened"); }
    } else if (action === "delete-check") {
      const detail = cardFromModal(); if (!detail) return;
      const item = detail.card.checklist.find(function (check) { return check.id === id; });
      detail.card.checklist = detail.card.checklist.filter(function (check) { return check.id !== id; }); recordCard(detail.board, detail.card, 'removed checklist item "' + (item ? item.text : "") + '"'); render(); toast("Checklist item deleted");
    } else if (action === "remove-cover") {
      const detail = cardFromModal(); if (!detail || !detail.card.cover) return;
      detail.card.cover = ""; recordCard(detail.board, detail.card, "removed the card picture"); render(); toast("Picture removed");
    } else if (action === "restore-card") {
      const entry = (board.archivedCards || []).find(function (item) { return item.card.id === id; });
      if (entry && board.lists.length) { board.lists[0].cards.push(entry.card); board.archivedCards = board.archivedCards.filter(function (item) { return item.card.id !== id; }); recordBoard(board, "Card " + entry.card.title + " was restored"); render(); toast("Card restored to " + board.lists[0].name); }
    } else if (action === "restore-list") {
      const list = (board.archivedLists || []).find(function (item) { return item.id === id; });
      if (list) { board.lists.push({ id: list.id, name: list.name, collapsed: false, cards: list.cards || [] }); board.archivedLists = board.archivedLists.filter(function (item) { return item.id !== id; }); recordBoard(board, "List " + list.name + " was restored"); render(); toast("List restored"); }
    }
  }
  function exportBoard(board) {
    const blob = new Blob([JSON.stringify(board, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = board.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".json"; anchor.click();
    URL.revokeObjectURL(url);
  }
  function importBoardFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function () {
      try {
        const board = JSON.parse(reader.result);
        if (!board || typeof board.name !== "string" || !Array.isArray(board.lists) || !board.lists.every(function (list) { return list && typeof list.name === "string" && Array.isArray(list.cards); })) throw new Error("This file is not a valid Orbit board.");
        const imported = JSON.parse(JSON.stringify(board));
        imported.id = uid("board"); imported.name = imported.name + " (imported)"; imported.favorite = false;
        imported.lists.forEach(function (list) { list.id = uid("list"); list.cards.forEach(function (card) { card.id = uid("card"); card.activity = card.activity || []; }); });
        state.boards.push(imported); save(); render(); toast("Board imported");
      } catch (error) {
        console.error("Could not import board.", error);
        toast(error.message || "Could not import this board.", "error");
      }
    };
    reader.onerror = function () { toast("Could not read the selected file.", "error"); };
    reader.readAsText(file);
  }

  app.addEventListener("click", function (event) {
    const actionTarget = event.target.closest("[data-action]");
    if (!actionTarget) return;
    if (actionTarget.dataset.action === "close-modal" && event.target !== actionTarget && !event.target.closest(".modal-close")) return;
    if (actionTarget.dataset.action === "toggle-check") return;
    handleAction(actionTarget.dataset.action, actionTarget);
  });
  app.addEventListener("submit", function (event) {
    const form = event.target.closest("form[data-form]");
    if (!form) return;
    event.preventDefault();
    const formType = form.dataset.form;
    if (formType === "create-board") {
      const name = form.elements.name.value.trim(); if (!name) return;
      const board = { id: uid("board"), name: name, favorite: false, background: form.elements.color.value || colors[0], lists: [], activity: [] };
      state.boards.push(board); state.currentBoardId = board.id; state.screen = "board"; state.modal = null; recordBoard(board, "Board was created"); render(); toast("Board created");
    } else if (formType === "edit-card") {
      const detail = cardFromModal(); if (!detail) return;
      const title = form.elements.title.value.trim(); const description = form.elements.description.value.trim();
      if (title !== detail.card.title || description !== (detail.card.description || "")) {
        detail.card.title = title; detail.card.description = description; recordCard(detail.board, detail.card, "details were updated"); render(); toast("Card updated");
      } else {
        toast("No changes to save");
      }
    } else if (formType === "add-check") {
      const detail = cardFromModal(); const text = form.elements.text.value.trim(); if (!detail || !text) return;
      detail.card.checklist = detail.card.checklist || []; detail.card.checklist.push({ id: uid("check"), text: text, done: false }); recordCard(detail.board, detail.card, "added checklist item"); render(); toast("Checklist item added");
    } else if (formType === "set-cover") {
      const detail = cardFromModal(); const value = safeImageUrl(form.elements.cover.value.trim());
      if (!detail || !value) { toast("Enter a valid http or https image URL.", "error"); return; }
      detail.card.cover = value; recordCard(detail.board, detail.card, "updated the card picture"); render(); toast("Card picture updated");
    }
  });
  app.addEventListener("input", function (event) {
    if (event.target.id === "home-search" || event.target.id === "board-search") {
      const start = event.target.selectionStart;
      state.query = event.target.value;
      const id = event.target.id;
      render();
      const replacement = document.getElementById(id);
      if (replacement) { replacement.focus(); replacement.setSelectionRange(start, start); }
    }
  });
  app.addEventListener("change", function (event) {
    if (event.target.id === "filter-label") { state.labelFilter = event.target.value; render(); }
    else if (event.target.id === "filter-member") { state.memberFilter = event.target.value; render(); }
    else if (event.target.id === "filter-due") { state.dueFilter = event.target.value; render(); }
    else if (event.target.id === "card-due-date") {
      const detail = cardFromModal(); if (!detail) return;
      const cardModal = document.querySelector(".card-modal");
      const scrollTop = cardModal ? cardModal.scrollTop : 0;
      detail.card.dueDate = event.target.value; recordCard(detail.board, detail.card, event.target.value ? "updated the due date to " + event.target.value : "removed the due date"); render(); toast("Due date updated");
      const updatedModal = document.querySelector(".card-modal");
      if (updatedModal) updatedModal.scrollTop = scrollTop;
    }
    else if (event.target.matches('input[type="checkbox"][data-action="toggle-check"]')) handleAction("toggle-check", event.target);
  });
  app.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && event.target.matches(".task-card")) { event.preventDefault(); openCard(event.target.dataset.cardId); }
  });
  app.addEventListener("dragstart", function (event) {
    const card = event.target.closest(".task-card");
    if (card) {
      state.draggedCardId = card.dataset.cardId;
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", state.draggedCardId);
      setTimeout(function () { card.classList.add("is-dragging"); }, 0);
      return;
    }
    const listHeader = event.target.closest("[data-list-drag]");
    if (listHeader) {
      state.draggedListId = listHeader.dataset.listDrag;
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", "list:" + state.draggedListId);
      listHeader.closest(".list-column").classList.add("list-dragging");
    }
  });
  app.addEventListener("dragover", function (event) {
    const card = event.target.closest(".task-card");
    const stack = event.target.closest(".list-card-stack");
    const column = event.target.closest(".list-column");
    if (state.draggedCardId && (card || stack)) {
      event.preventDefault();
      if (card) card.classList.add("drop-before");
      if (stack) stack.classList.add("drop-highlight");
    } else if (state.draggedListId && column) {
      event.preventDefault();
      column.classList.add("list-drop-target");
    }
  });
  app.addEventListener("dragleave", function (event) {
    if (!event.target.closest(".list-column")) return;
    event.target.closest(".list-column").querySelectorAll(".drop-before,.drop-highlight").forEach(function (node) { node.classList.remove("drop-before", "drop-highlight"); });
    event.target.closest(".list-column").classList.remove("list-drop-target");
  });
  app.addEventListener("drop", function (event) {
    const board = boardById(state.currentBoardId);
    if (!board) return;
    const targetCard = event.target.closest(".task-card");
    const targetStack = event.target.closest(".list-card-stack");
    const targetColumn = event.target.closest(".list-column");
    if (state.draggedCardId && (targetCard || targetStack)) {
      event.preventDefault();
      if (targetCard && targetCard.dataset.cardId === state.draggedCardId) return;
      const found = findCard(state.draggedCardId, board);
      if (!found) return;
      const targetListId = targetCard ? targetCard.dataset.listId : targetStack.dataset.dropList;
      const targetList = board.lists.find(function (list) { return list.id === targetListId; });
      if (!targetList) return;
      const card = found.card;
      found.list.cards.splice(found.list.cards.indexOf(card), 1);
      const destinationIndex = targetCard ? targetList.cards.findIndex(function (item) { return item.id === targetCard.dataset.cardId; }) : targetList.cards.length;
      targetList.cards.splice(Math.max(0, destinationIndex), 0, card);
      if (found.list.id !== targetList.id) recordCard(board, card, "was moved to " + targetList.name);
      else { recordCard(board, card, "was reordered in " + targetList.name); }
      state.draggedCardId = null; render(); toast(found.list.id !== targetList.id ? "Card moved to " + targetList.name : "Card reordered");
    } else if (state.draggedListId && targetColumn && targetColumn.dataset.listId !== state.draggedListId) {
      event.preventDefault();
      const from = board.lists.findIndex(function (list) { return list.id === state.draggedListId; });
      const to = board.lists.findIndex(function (list) { return list.id === targetColumn.dataset.listId; });
      const moved = board.lists.splice(from, 1)[0]; board.lists.splice(to, 0, moved);
      state.draggedListId = null; recordBoard(board, "Lists were reordered"); render(); toast("List reordered");
    }
  });
  app.addEventListener("dragend", function () {
    state.draggedCardId = null; state.draggedListId = null;
    document.querySelectorAll(".is-dragging,.list-dragging,.list-drop-target,.drop-before,.drop-highlight").forEach(function (node) { node.classList.remove("is-dragging","list-dragging","list-drop-target","drop-before","drop-highlight"); });
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && state.modal) { closeModal(); return; }
    if (event.target.matches("input,textarea,select") || event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key.toLowerCase() === "f") {
      event.preventDefault();
      const input = document.getElementById(state.screen === "board" ? "board-search" : "home-search");
      if (input) input.focus();
    } else if (event.key.toLowerCase() === "n" && state.screen === "board" && !state.modal) {
      event.preventDefault();
      const board = boardById(state.currentBoardId);
      if (board && board.lists.length) newCard(board.lists[0].id);
      else toast("Add a list before creating a card");
    }
  });
  importFile.addEventListener("change", function () {
    importBoardFile(importFile.files && importFile.files[0]);
    importFile.value = "";
  });

  render();
})();
