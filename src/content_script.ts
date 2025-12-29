(function () {
  function redirectIfNecessary() {
    const url = new URL(window.location.href);

    // Check if we're on a pull request "Files changed" page
    // GitHub may use either `/files` or `/changes` for this tab.
    if (/^\/[^/]+\/[^/]+\/pull\/\d+\/(?:files|changes)(?:\/|$)/.test(url.pathname)) {
      // If 'w=1' is not present, add it
      if (url.searchParams.get("w") !== "1") {
        url.searchParams.set("w", "1");
        window.location.replace(url.toString());
      }
    }
  }

  redirectIfNecessary();

  let lastUrl = window.location.href;
  new MutationObserver(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      redirectIfNecessary();
    }
  }).observe(document, { subtree: true, childList: true });
})();
