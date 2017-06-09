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
  var localEvents = {
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

  return {
    _eventType: null,
    event: function (event) {
      var _ = this;
      var eventResponse = false;
      var actions = (event.currentTarget.getAttribute('data-actions') || '').split(' ');

      this._eventType = event.type;

      actions.every(function (action) {
        if (action === 'submit' && event.currentTarget.tagName.toUpperCase() === 'FORM' && _._eventType === action) {
          eventResponse = true;
          return false;
        }

        return localEvents[action](event);
      });

      return eventResponse;
    }
  };
};