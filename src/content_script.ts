(function () {
  // Check if we're on a pull request "Files changed" page.
  // GitHub may use either `/files` or `/changes` for this tab.
  const PR_DIFF_PATH_PATTERN = /^\/[^/]+\/[^/]+\/pull\/\d+\/(?:files|changes)(?:\/|$)/;

  // Add 'w=1' to the end of relevant links, so we don't need to redirect as a separate step after navigating
  function patchLinks() {
    for (const anchor of document.querySelectorAll<HTMLAnchorElement>("a[href]")) {
      const url = new URL(anchor.href);

      if (PR_DIFF_PATH_PATTERN.test(url.pathname) && url.searchParams.get("w") !== "1") {
        // Add 'w=1' to the link
        url.searchParams.set("w", "1");
        anchor.href = url.toString();

        // Stop event propagation after the click, so React Router doesn't do its own redirect
        anchor.addEventListener("click", (event) => event.stopPropagation(), { capture: true });
      }
    }
  }

  function redirectIfNecessary() {
    const url = new URL(window.location.href);

    if (PR_DIFF_PATH_PATTERN.test(url.pathname)) {
      // If 'w=1' is not present, add it
      if (url.searchParams.get("w") !== "1") {
        url.searchParams.set("w", "1");
        window.location.replace(url.toString());
      }
    }
  }

  redirectIfNecessary();
  patchLinks();

  let lastUrl = window.location.href;
  new MutationObserver(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      redirectIfNecessary();
    }
    patchLinks();
  }).observe(document, { subtree: true, childList: true });
})();
