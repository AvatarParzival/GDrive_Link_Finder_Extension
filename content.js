const elements = document.querySelectorAll(`
  a[href*="drive.google.com"],
  iframe[src*="drive.google.com"],
  [src*="drive.google.com"]
`);

const links = [];
elements.forEach((element) => {
  const url = element.href || element.src;
  if (url.includes('drive.google.com')) links.push(url);
});

chrome.runtime.sendMessage({
  type: 'driveLinks',
  links: [...new Set(links)] 
});