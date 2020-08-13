function redirect(details) {
    var newUrl = new URL(details.url);
    if (newUrl.searchParams.get('w') === '1') return;
    newUrl.searchParams.set('w', '1');
    return {redirectUrl: newUrl.href};
}

chrome.webRequest.onBeforeRequest.addListener(
    redirect,
    {urls: ["*://github.com/*/pull/*"]},
    ['blocking']
);