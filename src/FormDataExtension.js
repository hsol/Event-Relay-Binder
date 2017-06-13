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

  var _actions = {};

  return {
    addAction: function (action, callable) {
      if (_actions[action]) {
        window.console.error('[EventRelayBinder] Action already exists.');
        return false;
      }
      _actions[action] = callable;
      return true;
    },
    removeAction: function (actionToRemove) {
      if (!_actions[actionToRemove]) {
        window.console.error('[EventRelayBinder] Can not find action type: ' + actionToRemove);
        return false;
      }

      _actions = objectFilter(_actions, function (action, key) {
        return key !== actionToRemove;
      });

      return true;
    },
    on: function (eventType, callable) {
      if(typeof eventType === 'function') {
        _actionListener = callable;
      }
    },
    listener: function (event, actions) {
      var eventResponse = false;
      actions = actions || (event.currentTarget.getAttribute('data-actions') || '').split(' ');

      actions.every(function (actionType, index) {
        var actionEvent = _actions[actionType];
        var rawResponse = [false, 'Unknown Error!'];
        var response = new _responseDto();

        if (!actionEvent) {
          window.console.warn('[EventRelayBinder] Can not find action type: ' + actionType);
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