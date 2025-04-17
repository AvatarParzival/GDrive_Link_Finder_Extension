document.addEventListener('DOMContentLoaded', () => {
  const historyList = document.getElementById('historyList');
  const clearButton = document.getElementById('clearHistory');

  function renderHistory(history) {
    historyList.innerHTML = history.map(entry => `
      <div class="history-item">
        <div class="history-title">${entry.title}</div>
        <div class="history-url">${new URL(entry.url).hostname}</div>
        <div class="history-links">
          ${entry.links.map(link => `
            <a href="${link}" target="_blank" class="link-item">
              <img src="drive-icon.png" class="drive-icon">
              ${link}
            </a>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  chrome.storage.local.get({ history: [] }, (result) => {
    renderHistory(result.history);
  });

  clearButton.addEventListener('click', () => {
    chrome.storage.local.set({ history: [] });
    historyList.innerHTML = '<div class="status-message">History cleared</div>';
  });
});