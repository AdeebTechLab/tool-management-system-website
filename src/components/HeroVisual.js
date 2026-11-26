(function (global) {
  "use strict";

  function HeroVisual(boardCount, cardCount) {
    return `
      <div class="hero-visual" aria-label="A preview of your project workspace" data-aos="fade-left" data-aos-delay="140" data-aos-duration="950">
        <div class="visual-orbit visual-orbit-one" aria-hidden="true"></div>
        <div class="visual-orbit visual-orbit-two" aria-hidden="true"></div>
        <span class="hero-bubble bubble-one" aria-hidden="true"></span>
        <span class="hero-bubble bubble-two" aria-hidden="true"></span>
        <span class="hero-bubble bubble-three" aria-hidden="true"></span>
        <span class="hero-bubble bubble-four" aria-hidden="true"></span>
        <span class="hero-bubble bubble-five" aria-hidden="true"></span>
        <span class="hero-bubble bubble-six" aria-hidden="true"></span>
        <span class="hero-bubble bubble-seven" aria-hidden="true"></span>
        <span class="hero-bubble bubble-eight" aria-hidden="true"></span>
        <div class="visual-window" aria-hidden="true">
          <div class="visual-window-bar"><span class="window-dots"><i></i><i></i><i></i></span><span>YOUR PROJECTS</span><span class="window-mark">✦</span></div>
          <div class="visual-slides">
            <div class="visual-scene is-active" data-visual-slide><div class="visual-columns"><div class="visual-column"><b>UP NEXT</b><i></i><i></i><i></i></div><div class="visual-column"><b>IN MOTION</b><i></i><i></i></div><div class="visual-column"><b>COMPLETE</b><i></i><i></i></div></div><div class="visual-progress"><span></span></div></div>
            <div class="visual-scene" data-visual-slide><div class="visual-agenda"><div class="agenda-row"><span class="agenda-time">09:30</span><div><b>Plan the launch</b><small>Design review · 3 tasks</small></div><i></i></div><div class="agenda-row"><span class="agenda-time">11:00</span><div><b>Review progress</b><small>Website refresh · 2 tasks</small></div><i></i></div><div class="agenda-row"><span class="agenda-time">14:15</span><div><b>Share the update</b><small>Team sync · 1 task</small></div><i></i></div></div><div class="visual-progress"><span class="progress-week"></span></div></div>
            <div class="visual-scene" data-visual-slide><div class="visual-team"><div class="team-row"><span class="team-avatar avatar-violet">AM</span><div><b>Website refresh</b><small>Design · 3 people</small></div><span class="team-status">82%</span></div><div class="team-row"><span class="team-avatar avatar-teal">JL</span><div><b>Mobile launch</b><small>Product · 5 people</small></div><span class="team-status">64%</span></div><div class="team-row"><span class="team-avatar avatar-amber">SR</span><div><b>Study planner</b><small>Research · 2 people</small></div><span class="team-status">48%</span></div></div><div class="visual-progress"><span class="progress-team"></span></div></div>
          </div>
        </div>
        <div class="workspace-summary" aria-label="Workspace summary"><div><strong>${boardCount}</strong><span>boards</span></div><i></i><div><strong>${cardCount}</strong><span>cards</span></div></div>
      </div>`;
  }

  global.ORBIT_COMPONENTS.HeroVisual = HeroVisual;
})(window);
