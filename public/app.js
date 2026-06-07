const form = document.getElementById('shorten-form');
const input = document.getElementById('originalUrl');
const result = document.getElementById('result');
const shortUrl = document.getElementById('shortUrl');
const copyButton = document.getElementById('copyButton');
const status = document.getElementById('status');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  result.hidden = true;
  status.textContent = 'Shortening URL...';

  try {
    const response = await fetch('/api/urls', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ originalUrl: input.value })
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || 'Unable to shorten URL');
    }

    shortUrl.href = payload.shortUrl;
    shortUrl.textContent = payload.shortUrl;
    result.hidden = false;
    status.textContent = 'Done.';
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : 'Something went wrong';
  }
});

copyButton.addEventListener('click', async () => {
  await navigator.clipboard.writeText(shortUrl.textContent);
  status.textContent = 'Copied to clipboard.';
});