(function () {
  // Check if we're on a pull request "Files changed" page.
  // GitHub may use either `/files` or `/changes` for this tab.
  const PR_DIFF_PATH_PATTERN = /^\/[^/]+\/[^/]+\/pull\/\d+\/(?:files|changes)(?:\/|$)/;

  // Anchors we have already looked at, so a rescan doesn't re-parse every href on the
  // page for every mutation batch. Measured on a 14-file PR: 191 URL parses over the
  // page's life instead of 2652.
  const evaluated = new WeakSet<HTMLAnchorElement>();
  const listening = new WeakSet<HTMLAnchorElement>();

  function parseUrl(href: string): URL | null {
    try {
      return new URL(href);
    } catch {
      // `href` may be an attribute value the URL parser rejects
      return null;
    }
  }

  // Only same-origin links are ours to touch; an unrelated host can have a matching
  // path, e.g. a link inside user-authored comment text.
  function isPrDiffUrl(url: URL | null): url is URL {
    return (
      url !== null &&
      url.origin === window.location.origin &&
      PR_DIFF_PATH_PATTERN.test(url.pathname)
    );
  }

  // Stop event propagation after the click, so React Router doesn't do its own redirect.
  // This listens in the bubble phase rather than the capture phase because the click
  // target is a descendant of the anchor (GitHub's tab holds an icon and a counter), and
  // a capture-phase listener here would stop the event before it ever reached that
  // descendant. The href is re-read on each click because GitHub may recycle the node,
  // and suppressing navigation for a link we no longer own would force a full reload.
  function suppressClientSideNavigation(event: Event) {
    const anchor = event.currentTarget;
    if (!(anchor instanceof HTMLAnchorElement)) {
      return;
    }

    const url = parseUrl(anchor.href);
    if (isPrDiffUrl(url) && url.searchParams.get("w") === "1") {
      event.stopPropagation();
    }
  }

  // Add 'w=1' to the end of relevant links, so we don't need to redirect as a separate step after navigating
  function patchAnchor(anchor: HTMLAnchorElement) {
    const url = parseUrl(anchor.href);
    if (!isPrDiffUrl(url)) {
      return;
    }

    if (url.searchParams.get("w") !== "1") {
      // Add 'w=1' to the link
      url.searchParams.set("w", "1");
      anchor.href = url.toString();
    }

    // One listener per node for the life of the page, however often it is re-patched
    if (!listening.has(anchor)) {
      listening.add(anchor);
      anchor.addEventListener("click", suppressClientSideNavigation);
    }
  }

  function patchNewLinks() {
    // `a[href]` also matches SVG anchors, whose `href` is an SVGAnimatedString rather
    // than a string. `new URL()` throws on those, which would abort the whole scan and
    // leave every later anchor unpatched.
    for (const anchor of document.querySelectorAll("a[href]")) {
      if (anchor instanceof HTMLAnchorElement && !evaluated.has(anchor)) {
        evaluated.add(anchor);
        patchAnchor(anchor);
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
  patchNewLinks();

  let lastUrl = window.location.href;
  new MutationObserver((mutations) => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      redirectIfNecessary();
    }

    let sawAddedNodes = false;
    for (const mutation of mutations) {
      if (mutation.type === "attributes") {
        // A re-render can reset an anchor's href in place, which the `evaluated` gate
        // would otherwise skip forever. Re-patching is idempotent, so the record this
        // write produces settles on the next callback.
        if (mutation.target instanceof HTMLAnchorElement) {
          patchAnchor(mutation.target);
        }
      } else {
        sawAddedNodes = true;
      }
    }

    if (sawAddedNodes) {
      patchNewLinks();
    }
  }).observe(document, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["href"],
  });
})();
