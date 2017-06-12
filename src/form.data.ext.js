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

var objectFilter = function (object, callable) {
  var newObject = {};

  if (callable === undefined) {
    throw new Error('Could not find callable.');
  }

  for (var key in object) {
    if (callable(object[key], key, object)) {
      newObject[key] = object[key];
    }
  }

  return newObject;
};

window.FormDataExtension = function () {
  var _actionListener = new Function();
  var _actionDto = function (index, type, action, responseDto) {
    return {
      index: index,
      type: type,
      action: action,
      time: new Date(),
      response: responseDto
    };
  };
  var _responseDto = function (isPassed, message) {
    return {
      isPassed: isPassed === true,
      message: message || ''
    };
  };

  var _actions = {
    alert: function (event) {
      var dataAlert = event.currentTarget.getAttribute('data-alert');
      if (!dataAlert) {
        return [true, 'Could not find data-alert attribute.'];
      }

      alert(dataAlert);

      return [true];
    },
    confirm: function (event) {
      var dataConfirm = event.currentTarget.getAttribute('data-confirm');
      if (!dataConfirm) {
        return [true, 'Could not find data-confirm attribute.'];
      }

      if (!confirm(dataConfirm)) {
        event.preventDefault();
        return [false, 'Canceled.'];
      }

      return [true];
    },
    submit: function (event) {
      if (event.currentTarget.tagName.toUpperCase() === 'FORM') {
        return [true];
      }

      var $targetForm = closest(event.currentTarget, 'form');
      if ($targetForm.length === 0) {
        return [true, 'Could not find form to submit'];
      }

      event.preventDefault();
      $targetForm.submit();

      return [true];
    },
    clear: function (event) {
      var elementsWithData = closest(event.currentTarget, 'form').querySelectorAll('[name]');
      elementsWithData.forEach(function (element) {
        element.value = null;
      });

      return [true];
    }
  };

  return {
    addAction: function (action, callable) {
      if (_actions[action]) {
        window.console.error('[Form-Data-Extension] Action already exists.');
        return false;
      }
      _actions[action] = callable;
      return true;
    },
    removeAction: function (actionToRemove) {
      if (!_actions[actionToRemove]) {
        window.console.error('[Form-Data-Extension] Can not find action type: ' + actionToRemove);
        return false;
      }

      _actions = objectFilter(_actions, function (action, key) {
        return key !== actionToRemove;
      });

      return true;
    },
    onAction: function (callable) {
      _actionListener = callable;
    },
    eventListener: function (event) {
      var eventResponse = false;
      var actions = (event.currentTarget.getAttribute('data-actions') || '').split(' ');

      actions.every(function (actionType, index) {
        var actionEvent = _actions[actionType];
        var rawResponse = [false, 'Unknown Error!'];
        var response = new _responseDto();

        if (!actionEvent) {
          window.console.warn('[Form-Data-Extension] Can not find action type: ' + actionType);
          return true;
        }

        try {
          rawResponse = actionEvent(event);
        } catch (error) {
          rawResponse = [false, error.message];
        }

        response = _responseDto.apply(null, rawResponse);
        _actionListener(new _actionDto(index, actionType, actionEvent, response));

        return eventResponse = response.isPassed;
      });

      return eventResponse;
    }
  };
};