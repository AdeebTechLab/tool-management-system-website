(function (global) {
  "use strict";

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }

  function safeImageUrl(value) {
    if (!value) return "";
    try {
      const url = new URL(value, global.location.href);
      return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
    } catch (error) {
      return "";
    }
  }

  global.ORBIT_COMPONENTS = global.ORBIT_COMPONENTS || {};
  global.ORBIT_COMPONENTS.utils = { escapeHtml: escapeHtml, safeImageUrl: safeImageUrl };
})(window);
