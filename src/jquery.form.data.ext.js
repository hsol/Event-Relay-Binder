if (!window.jQuery) {
  throw new Error('Could not find jQuery Object.');
}

var getSelector = function ($element) {
  var element = $element[0];

  // Get the xpath for this element.
  // This was easier than calculating the DOM using jQuery, for now.
  var xpath = '';
  for (; element && element.nodeType === 1; element = element.parentNode) {
    var id = $(element.parentNode).children(element.tagName).index(element) + 1;
    id > 1 ? (id = '[' + id + ']') : (id = '');
    xpath = '/' + element.tagName.toLowerCase() + id + xpath;
  }

  // Return CSS selector for the calculated xpath
  return xpath
    .substr(1)
    .replace(/\//g, ' > ')
    .replace(/\[(\d+)\]/g, function ($0, i) {
      return ':nth-child(' + i + ')';
    });
};

var localFormDataExtension = function () {
  var localEvents = {
    confirm: function (event) {
      var dataConfirm = $(event.currentTarget).data('confirm');
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
      var $targetForm = $(event.currentTarget).closest('form');
      if ($targetForm.length === 0) {
        return true;
      }

      event.preventDefault();
      $targetForm.submit();

      return true;
    },
    clear: function (event) {
      $(event.currentTarget).closest('form').find('[name]').val('');

      return true;
    }
  };

  return {
    _eventType: null,
    event: function (event) {
      var _ = this;
      var eventResponse = false;
      var actions = ($(event.currentTarget).data('actions') || '').split(' ');

      this._eventType = event.type;

      actions.every(function (action) {
        if (action === 'submit' && $(event.currentTarget).is('form') && _._eventType === action) {
          eventResponse = $(event.currentTarget).is('form');
          return false;
        }

        return localEvents[action](event);
      });

      return eventResponse;
    }
  };
};

$.fn.formDataExtension = function (eventType, isGlobal) {
  isGlobal = isGlobal || false;
  var formDataExtension = new localFormDataExtension();

  if (isGlobal) {
    $(document).on(eventType, getSelector($(this)), formDataExtension.event);
  } else {
    $(this).on(eventType, formDataExtension.event);
  }
};