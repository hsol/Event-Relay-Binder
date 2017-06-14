var eventRelayListener = new EventRelayListener(true);
eventRelayListener.setAttr('data-actions');
eventRelayListener.addAction('confirm', function (event) {
  var confirmMessage = event.currentTarget.getAttribute('data-confirm-text');
  if (!confirm(confirmMessage)) {
    event.preventDefault();
    return false;
  }

  return true;
});
eventRelayListener.addAction('reconfirm', function (event) {
  if (!confirm('Really submit?')) {
    event.preventDefault();
    return false;
  }

  return true;
});