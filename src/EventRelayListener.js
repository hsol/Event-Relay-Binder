var objectReject = function (object, callable) {
  if (callable === undefined) {
    throw new Error('[EventRelayListener] Could not find callable.');
  }

  for (var key in object) {
    if (callable(object[key], key, object)) {
      delete object[key];
    }
  }

  return object;
};

var initActions = function (isGlobal) {
  if (!EventRelayListener.__proto__._actions) {
    EventRelayListener.__proto__._actions = {};
  }

  return isGlobal ? EventRelayListener.__proto__._actions : {};
};

var initDataAttribute = function () {
  if (!EventRelayListener.__proto__._attrName) {
    EventRelayListener.__proto__._attrName = 'data-actions';
  }
};

window.EventRelayListener = function (isGlobal) {
  var _actionListener = new Function();
  var _eachActionListener = {};
  var _actionDto = function (index, type, action, responseDto) {
    return {
      index: index,
      type: type,
      action: action,
      time: new Date(),
      response: responseDto
    };
  };
  var _responseDto = function (first, second) {
    var dto = {
      isPassed: false,
      data: null
    };

    if (typeof first === 'boolean') {
      dto.isPassed = first === true;
      dto.data = second;
    } else {
      dto.isPassed = true;
      dto.data = first;
    }

    return dto;
  };

  initDataAttribute();
  var _actions = initActions(isGlobal === true);

  return {
    initActions: function (actions) {
      _actions = objectReject(_actions, function () {
        return true;
      });

      for (var key in actions) {
        _actions[key] = actions[key];
      }
      return true;
    },
    addAction: function (action, callable) {
      if (_actions[action]) {
        throw new Error('[EventRelayListener] Action already exists.');
      }
      _actions[action] = callable;
      return true;
    },
    removeAction: function (actionToRemove) {
      if (!_actions[actionToRemove]) {
        throw new Error('[EventRelayListener] Can not find action type: ' + actionToRemove);
      }

      _actions = objectReject(_actions, function (action, key) {
        return key === actionToRemove;
      });

      return true;
    },
    on: function (actionType, callable) {
      if (typeof actionType === 'function') {
        _actionListener = callable;
      } else if (typeof actionType === 'string') {
        _eachActionListener[actionType] = callable;
      }

      throw new Error('[EventRelayListener] Can not find action type: ' + actionToRemove);
    },
    setAttr: function (attrName) {
      EventRelayListener.__proto__._attrName = attrName;
    },
    listener: function (event, actions) {
      var eventResponse = false;
      actions = actions || (event.currentTarget.getAttribute(EventRelayListener.__proto__._attrName) || '').split(' ');

      actions.every(function (actionType, index) {
        var actionEvent = _actions[actionType];
        var rawResponse = [false, 'Unknown Error!'];
        var response = new _responseDto();

        if (!actionEvent) {
          window.console.warn('[EventRelayListener] Can not find action type: ' + actionType);
          return true;
        }

        try {
          rawResponse = actionEvent(event);
        } catch (error) {
          rawResponse = [false, error.message];
        }

        if (Array.isArray(rawResponse)) {
          response = _responseDto.apply(null, rawResponse);
        } else {
          response = _responseDto.call(null, rawResponse);
        }

        var actionDto = new _actionDto(index, actionType, actionEvent, response);

        _actionListener(actionDto);

        if (_eachActionListener[actionType]) {
          _eachActionListener[actionType](actionDto);
        }

        return eventResponse = response.isPassed;
      });

      return eventResponse;
    }
  };
};