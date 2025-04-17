document.addEventListener('DOMContentLoaded', () => {
  const resultsView = document.getElementById('resultsView');
  const historyView = document.getElementById('historyView');
  const toggleView = document.getElementById('toggleView');
  const resultsDiv = document.getElementById('results');
  const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistory');

  let isHistoryView = false;

  toggleView.addEventListener('click', () => {
    isHistoryView = !isHistoryView;
    resultsView.classList.toggle('hidden', isHistoryView);
    historyView.classList.toggle('hidden', !isHistoryView);
    toggleView.textContent = isHistoryView ? 'Back' : 'History';
    if(isHistoryView) loadHistory();
  });

  function startNewScan() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.reload(tabs[0].id, {}, () => {
        const listener = (tabId, info) => {
          if(tabId === tabs[0].id && info.status === 'complete') {
            chrome.tabs.onUpdated.removeListener(listener);
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              files: ['content.js']
            });
          }
        };
        chrome.tabs.onUpdated.addListener(listener);
      });
    });
  }

  chrome.runtime.onMessage.addListener((request) => {
    if (request.type === 'driveLinks') {
      saveToHistory(request.links);
      displayResults(request.links);
    }
  });

  function displayResults(links) {
    resultsDiv.innerHTML = links.length ? 
      links.map(link => `
        <a href="${link}" target="_blank" class="link-item">
          <img src="https://www.gstatic.com/images/branding/product/2x/drive_2020q4_48dp.png" 
               class="drive-icon" alt="Drive">
          ${link}
        </a>
      `).join('') : 
      '<div class="status-message">No Google Drive links found</div>';
  }

  function saveToHistory(links) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      const historyEntry = {
        timestamp: Date.now(),
        title: tab.title,
        url: tab.url,
        links: links
      };

      chrome.storage.local.get({ history: [] }, (result) => {
        const updatedHistory = [historyEntry, ...result.history].slice(0, 100);
        chrome.storage.local.set({ history: updatedHistory });
      });
    });
  }

  function loadHistory() {
    chrome.storage.local.get({ history: [] }, (result) => {
      historyList.innerHTML = result.history.length ? 
        result.history.map(entry => `
          <div class="history-item">
            <div class="history-title">${entry.title}</div>
            <div class="history-url">${new URL(entry.url).hostname}</div>
            ${entry.links.map(link => `
              <a href="${link}" target="_blank" class="link-item">
                <img src="https://www.gstatic.com/images/branding/product/2x/drive_2020q4_48dp.png" 
                     class="drive-icon" alt="Drive">
                ${link}
              </a>
            `).join('')}
          </div>
        `).join('') : 
        '<div class="status-message">No history found</div>';
    });
  }

  clearHistoryBtn.addEventListener('click', () => {
    chrome.storage.local.set({ history: [] });
    historyList.innerHTML = '<div class="status-message">History cleared</div>';
  });

  startNewScan();
});