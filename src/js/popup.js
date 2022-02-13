async function readCurrentSiteInfo() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
            resolve([tabs[0].url, tabs[0].title]);
        })
    })
}

let tabUrl, tabTitle;
async function init() {
    let tabInfo = await readCurrentSiteInfo();
    tabUrl = tabInfo[0];
    tabTitle = tabInfo[1];

    obj = {};

    obj[tabUrl] = tabTitle;

    chrome.storage.local.set(obj);
}

window.onload = init();