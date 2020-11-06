import addDomainPermissionToggle from 'webext-domain-permission-toggle'

function redirect(details) {
    let newUrl = new URL(details.url);
    if (newUrl.searchParams.get('w') === '1') return;
    newUrl.searchParams.set('w', '1');
    return {redirectUrl: newUrl.href};
}

chrome.webRequest.onBeforeRequest.addListener(
    redirect,
    {urls: ["*://*/*/pull/*/files*"]},
    ['blocking']
);

addDomainPermissionToggle()
