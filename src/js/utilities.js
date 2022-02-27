export function getCardElems(card) {
    return {
        title: card.querySelector(".card-title"),
        description: card.querySelector(".card-description"),
        urlInput: card.querySelector(".card-url-input"),
        thumbnail: card.querySelector(".card-thumbnail"),
        mainLink: card.querySelector(".card-main-link"),
        domainDisplayText: card.querySelector(".card-domain-display-text"),
        dateAdded: card.querySelector(".card-date-added"),
        editButton: card.querySelector(".card-edit-button"),
        deleteButton: card.querySelector(".card-delete-button"),
        cancelButton: card.querySelector(".card-cancel-button"),
        saveButton: card.querySelector(".card-save-button")
    }
}

export function saveDataPrevValueAttr(cardElems) {
    cardElems.title.setAttribute("data-prev-value", cardElems.title.value);
    cardElems.description.setAttribute("data-prev-value", cardElems.description.value);
    cardElems.urlInput.setAttribute("data-prev-value", cardElems.urlInput.value);
}

export function getDomain(url) {
    const { hostname } = new URL(url);

    let displayDomain;
    if (hostname.includes("www.")) {
        displayDomain = hostname.substring(4);
    } else {
        displayDomain = hostname;
    }

    return displayDomain
}

export async function getTemplate(path) {
    const response = await fetch(path, {method: "GET"});
    const responseText = await response.text();

    return responseText
}

export function navigateTo(page) {
    
}