(function (global) {
  "use strict";

  function HomeHeader(query) {
    const escapeHtml = global.ORBIT_COMPONENTS.utils.escapeHtml;
    return `
      <header class="topbar home-topbar">
        <button class="brand" data-action="home" aria-label="Orbit home"><span class="brand-mark">o</span><span>orbit</span></button>
        <a class="workspace-link" href="#boards">Workspace</a>
        <div class="topbar-spacer"></div>
        <label class="home-search"><span class="icon">⌕</span><input id="home-search" type="search" placeholder="Find a board" value="${escapeHtml(query)}" aria-label="Search boards"><kbd>F</kbd></label>
        <button class="avatar avatar-user" title="Alex Morgan">AM</button>
      </header>`;
  }

  global.ORBIT_COMPONENTS.HomeHeader = HomeHeader;
})(window);
