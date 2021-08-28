if (window.opener) {
  window.opener.focus()
  window.opener.postMessage({ id }, window.opener.location)
}
window.close()
