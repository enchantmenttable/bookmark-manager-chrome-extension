function getPageInfo() {
    let metadata = {
        url: document.URL,
        title: document.title,
        thumbnail: document.head.querySelector("[property='og:image']").content,
        description: document.head.querySelector("[property='og:description']").content
    };

    return metadata
}

getPageInfo()