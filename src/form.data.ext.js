var closest = function (el, selector) {
  var matchesSelector = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector;

  while (el) {
    if (matchesSelector.call(el, selector)) {
      break;
    }
    el = el.parentElement;
  }
  return el;
};

window.FormDataExtension = function () {
  var defaultActions = {
    alert: function (event) {
      var dataAlert = event.currentTarget.getAttribute('data-alert');
      if (!dataAlert) {
        return true;
      }

      alert(dataAlert);

      return true;
    },
    confirm: function (event) {
      var dataConfirm = event.currentTarget.getAttribute('data-confirm');
      if (!dataConfirm) {
        return true;
      }

      if (!confirm(dataConfirm)) {
        event.preventDefault();
        return false;
      }

      return true;
    },
    submit: function (event) {
      var $targetForm = closest(event.currentTarget, 'form');
      if ($targetForm.length === 0) {
        return true;
      }

      event.preventDefault();
      $targetForm.submit();

      return true;
    },
    clear: function (event) {
      var elementsWithData = closest(event.currentTarget, 'form').querySelectorAll('[name]');
      elementsWithData.forEach(function (element) {
        element.value = null;
      });

      return true;
    }
  };
  var _actions = defaultActions;

  return {
    event: function (event) {
      var eventResponse = false;
      var actions = (event.currentTarget.getAttribute('data-actions') || '').split(' ');

      actions.every(function (action) {
        var actionEvent = _actions[action];
        if (action === 'submit' && event.currentTarget.tagName.toUpperCase() === 'FORM' && action.type === action) {
          eventResponse = true;
          return false;
        }

        if (!actionEvent) {
          window.console.warn('[Form-Data-Extension] Can not find action type: ' + action);
          return true;
        }

        return actionEvent(event);
      });

      return eventResponse;
    }
  };
};