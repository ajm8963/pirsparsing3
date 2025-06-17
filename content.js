
console.log('Content script injected!', location.href);

function isEmailOpen() {
    return !!document.querySelector('.mail-Message-Body-Content, [data-qa-id="message-body-content"]');
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Received message:', request);

    if (request.action === 'healthcheck') {
        sendResponse({
            status: 'alive',
            isEmailOpen: isEmailOpen(),
            url: location.href
        });
        return true;
    }

    if (request.action === 'getEmail') {
        try {
            const content = document.querySelector('.mail-Message-Body-Content, [data-qa-id="message-body-content"]');
            if (!content) throw new Error('Письмо не найдено');

            const email = {
                subject: document.querySelector('.mail-Message-Toolbar-Subject')?.textContent || 'Без темы',
                text: content.innerText.trim()
            };

            console.log('Extracted email:', email);
            sendResponse(email);
        } catch (error) {
            console.error('Error:', error);
            sendResponse({error: error.message});
        }
        return true;
    }
});