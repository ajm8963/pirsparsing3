document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('downloadBtn');
    const status = document.getElementById('status');

    btn.addEventListener('click', async () => {
        btn.disabled = true;
        status.textContent = "Проверяем подключение...";
        status.style.color = "blue";

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab?.url?.includes('mail.yandex')) {
                throw new Error('Откройте письмо в Яндекс.Почте');
            }

            const sendMessageWithTimeout = (tabId, message, timeout = 2000) => {
                return Promise.race([
                    chrome.tabs.sendMessage(tabId, message, { frameId: 0 }),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Таймаут: не удалось получить ответ')), timeout)
                    )
                ]);
            };


            status.textContent = "Проверяем подключение...";
            const health = await sendMessageWithTimeout(tab.id, { action: 'healthcheck' }, 2000)
                .catch(err => {
                    console.error('Ошибка подключения:', err);
                    throw new Error('Не удалось подключиться к странице. Обновите страницу (F5)');
                });

            if (!health?.isEmailOpen) {
                throw new Error('Откройте письмо полностью');
            }

            status.textContent = "Получаем письмо...";
            const email = await sendMessageWithTimeout(tab.id, { action: 'getEmail' }, 5000);

            if (email.error) {
                throw new Error(email.error);
            }


            status.textContent = "Скачиваем...";
            const blob = new Blob([email.text], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);

            await chrome.downloads.download({
                url: url,
                filename: `Письмо - ${email.subject.substring(0, 50)}.txt`,
                saveAs: true,
                conflictAction: 'uniquify'
            });

            status.textContent = " Готово!";

        } catch (error) {
            status.textContent = ` ${error.message}`;
            console.error('Ошибка:', error);
        } finally {
            btn.disabled = false;
            setTimeout(() => status.textContent = "", 5000);
        }
    });
});