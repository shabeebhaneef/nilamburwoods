/**
 * apps-script.gs — Nilamburwoods
 * Paste this into Google Apps Script (script.google.com).
 * Set GITHUB_TOKEN in Script Properties (Project Settings → Script Properties).
 * Attach triggerWorkflow() to the Google Sheet's onFormSubmit trigger.
 */

function triggerWorkflow() {
  const token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  if (!token) {
    console.error('GITHUB_TOKEN not set in Script Properties.');
    return;
  }

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    payload: JSON.stringify({ event_type: 'update-listings' }),
    muteHttpExceptions: true,
  };

  const res = UrlFetchApp.fetch(
    'https://api.github.com/repos/shabeebhaneef/nilamburwoods/dispatches',
    options
  );

  const code = res.getResponseCode();
  if (code === 204) {
    console.log('✅  GitHub Actions workflow triggered successfully.');
  } else {
    console.error('❌  Trigger failed. HTTP ' + code + ': ' + res.getContentText());
  }
}
