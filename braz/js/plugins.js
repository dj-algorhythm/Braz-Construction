// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

/*! Backstretch - v2.0.4 - 2013-06-19
* http://srobbin.com/jquery-plugins/backstretch/
* Copyright (c) 2013 Scott Robbin; Licensed MIT */

;(function ($, window, undefined) {
  'use strict';

  /* PLUGIN DEFINITION
   * ========================= */

  $.fn.backstretch = function (images, options) {
    // We need at least one image or method name
    if (images === undefined || images.length === 0) {
      $.error("No images were supplied for Backstretch");
    }

    /*
     * Scroll the page one pixel to get the right window height on iOS
     * Pretty harmless for everyone else
    */
    if ($(window).scrollTop() === 0 ) {
      window.scrollTo(0, 0);
    }

    return this.each(function () {
      var $this = $(this)
        , obj = $this.data('backstretch');

      // Do we already have an instance attached to this element?
      if (obj) {

        // Is this a method they're trying to execute?
        if (typeof images == 'string' && typeof obj[images] == 'function') {
          // Call the method
          obj[images](options);

          // No need to do anything further
          return;
        }

        // Merge the old options with the new
        options = $.extend(obj.options, options);

        // Remove the old instance
        obj.destroy(true);
      }

      obj = new Backstretch(this, images, options);
      $this.data('backstretch', obj);
    });
  };

  // If no element is supplied, we'll attach to body
  $.backstretch = function (images, options) {
    // Return the instance
    return $('body')
            .backstretch(images, options)
            .data('backstretch');
  };

  // Custom selector
  $.expr[':'].backstretch = function(elem) {
    return $(elem).data('backstretch') !== undefined;
  };

  /* DEFAULTS
   * ========================= */

  $.fn.backstretch.defaults = {
      centeredX: true   // Should we center the image on the X axis?
    , centeredY: true   // Should we center the image on the Y axis?
    , duration: 5000    // Amount of time in between slides (if slideshow)
    , fade: 0           // Speed of fade transition between slides
  };

  /* STYLES
   *
   * Baked-in styles that we'll apply to our elements.
   * In an effort to keep the plugin simple, these are not exposed as options.
   * That said, anyone can override these in their own stylesheet.
   * ========================= */
  var styles = {
      wrap: {
          overflow: 'hidden'
        , margin: 0
        , padding: 0
        , height: '100%'
        , width: '100%'
        , zIndex: -2
      }
    , img: {
          position: 'absolute'
        , display: 'none'
        , margin: 0
        , padding: 0
        , border: 'none'
        , width: '95.473684210526315789473684%'
        , height: '100%'
        , minHeight: '100%'
        , maxHeight: 'none'
        , maxWidth: 'none'
        , zIndex: -999999
      }
  };

  /* CLASS DEFINITION
   * ========================= */
  var Backstretch = function (container, images, options) {
    this.options = $.extend({}, $.fn.backstretch.defaults, options || {});

    /* In its simplest form, we allow Backstretch to be called on an image path.
     * e.g. $.backstretch('/path/to/image.jpg')
     * So, we need to turn this back into an array.
     */
    this.images = $.isArray(images) ? images : [images];

    // Preload images
    $.each(this.images, function () {
      $('<img />')[0].src = this;
    });

    // Convenience reference to know if the container is body.
    this.isBody = container === document.body;

    /* We're keeping track of a few different elements
     *
     * Container: the element that Backstretch was called on.
     * Wrap: a DIV that we place the image into, so we can hide the overflow.
     * Root: Convenience reference to help calculate the correct height.
     */
    this.$container = $(container);
    this.$root = this.isBody ? supportsFixedPosition ? $(window) : $(document) : this.$container;

    // Don't create a new wrap if one already exists (from a previous instance of Backstretch)
    var $existing = this.$container.children(".backstretch").first();
    this.$wrap = $existing.length ? $existing : $('<div class="backstretch"></div>').css(styles.wrap).appendTo(this.$container);

    // Non-body elements need some style adjustments
    if (!this.isBody) {
      // If the container is statically positioned, we need to make it relative,
      // and if no zIndex is defined, we should set it to zero.
      var position = this.$container.css('position')
        , zIndex = this.$container.css('zIndex');

      this.$container.css({
          position: position === 'static' ? 'relative' : position
        , zIndex:  -999998//zIndex === 'auto' ? 0 : zIndex
      });

      // Needs a higher z-index
      this.$wrap.css({zIndex: -999998});
    }

    // Fixed or absolute positioning?
    this.$wrap.css({
      position: this.isBody && supportsFixedPosition ? 'fixed' : 'absolute'
    });

    // Set the first image
    this.index = 0;
    this.show(this.index);

    // Listen for resize
    $(window).on('resize.backstretch', $.proxy(this.resize, this))
             .on('orientationchange.backstretch', $.proxy(function () {
                // Need to do this in order to get the right window height
                if (this.isBody && window.pageYOffset === 0) {
                  window.scrollTo(0, 1);
                  this.resize();
                }
             }, this));
  };

  /* PUBLIC METHODS
   * ========================= */
  Backstretch.prototype = {
      resize: function () {
        try {
          var  bgCSS = {left: 0, top: 0},
             rootWidth = this.$root.width() /*this.isBody ? this.$root.width() : this.$root.innerWidth()*/
            , bgWidth = rootWidth
            , rootHeight = this.isBody ? ( window.innerHeight ? window.innerHeight : this.$root.height() ) : this.$root.innerHeight()
            , bgHeight = bgWidth / this.$img.data('ratio')
            , bgOffset;

            //Make adjustments based on image ratio
                if (bgHeight >= rootHeight) {
                bgOffset = (bgHeight - rootHeight) / 2;
                if(this.options.centeredY) {
                  bgCSS.top = '-' + bgOffset + 'px';
                }
            } else {
                bgHeight = rootHeight;
                bgWidth = bgHeight * this.$img.data('ratio');
                bgOffset = (bgWidth - rootWidth) / 2;
                if(this.options.centeredX) {
                  bgCSS.left = '-' + bgOffset + 'px';
                };
            }

            this.$wrap.css({width: rootWidth, height: rootHeight})
                      .find('img:not(.deleteable)').css({width: rootWidth, height: rootHeight}); //.css(bgCSS)
        } catch(err) {
            // IE7 seems to trigger resize before the image is loaded.
            // This try/catch block is a hack to let it fail gracefully.
        }

        return this;
      }

      // Show the slide at a certain position
    , show: function (newIndex) {

        var navBorderColors = [
          '#3A1002',
          '#612B03', 
          '#C69C6D',
          '#3A1002',
          '#3D5E19',
          '#C69C6D'
        ];

        // Validate index
        if (Math.abs(newIndex) > this.images.length - 1) {
          return;
        }

        $('#navbar').css('border-color', navBorderColors[newIndex]);

        // Vars
        var self = this
          , oldImage = self.$wrap.find('img').addClass('deleteable')
          , evtOptions = { relatedTarget: self.$container[0] };

        // Trigger the "before" event
        self.$container.trigger($.Event('backstretch.before', evtOptions), [self, newIndex]);

        // Set the new index
        this.index = newIndex;

        // Pause the slideshow
        clearInterval(self.interval);

        // New image
        self.$img = $('<img />')
                      .css(styles.img)
                      .bind('load', function (e) {
                        var imgWidth = this.width || $(e.target).width()
                          , imgHeight = this.height || $(e.target).height();

                        // Save the ratio
                        $(this).data('ratio', imgWidth / imgHeight);

                        // Show the image, then delete the old one
                        // "speed" option has been deprecated, but we want backwards compatibilty
                        $(this).fadeIn(self.options.speed || self.options.fade, function () {
                          oldImage.remove();

                          // Resume the slideshow
                          if (!self.paused) {
                            self.cycle();
                          }

                          // Trigger the "after" and "show" events
                          // "show" is being deprecated
                          $(['after', 'show']).each(function () {
                            self.$container.trigger($.Event('backstretch.' + this, evtOptions), [self, newIndex]);
                          });
                        });

                        // Resize
                        self.resize();

                        if ($(this).attr('src') == './img/bg-welcome.jpg')
                          $('.nav li').filter($(this).attr('href', '#welcome')).toggleClass("active");
                        if ($(this).attr('src') == './img/bg-services.jpg')
                          $('.nav li').filter($(this).attr('href', '#services')).toggleClass("active");
                        if ($(this).attr('src') == './img/bg-gallery1.jpg')
                          $('.nav li').filter($(this).attr('href', '#gallery1')).toggleClass("active");
                        if ($(this).attr('src') == './img/bg-gallery2.jpg')
                          $('.nav li').filter($(this).attr('href', '#gallery1')).toggleClass("active");
                        if ($(this).attr('src') == './img/bg-gallery3.jpg')
                          $('.nav li').filter($(this).attr('href', '#gallery1')).toggleClass("active");
                        if ($(this).attr('src') == './img/bg-contact.jpg')
                          $('.nav li').filter($(this).attr('href', '#contact')).toggleClass("active");
                      })
                      .appendTo(self.$wrap);

        // Hack for IE img onload event
        self.$img.attr('src', self.images[newIndex]);
        return self;
      }

    , next: function () {
        // Next slide
        return this.show(this.index < this.images.length - 1 ? this.index + 1 : 0);
      }

    , prev: function () {
        // Previous slide
        return this.show(this.index === 0 ? this.images.length - 1 : this.index - 1);
      }

    , pause: function () {
        // Pause the slideshow
        this.paused = true;
        return this;
      }

    , resume: function () {
        // Resume the slideshow
        this.paused = false;
        this.next();
        return this;
      }

    , cycle: function () {
        // Start/resume the slideshow
        if(this.images.length > 1) {
          // Clear the interval, just in case
          clearInterval(this.interval);

          this.interval = setInterval($.proxy(function () {
            // Check for paused slideshow
            if (!this.paused) {
              this.next();
            }
          }, this), this.options.duration);
        }
        return this;
      }

    , destroy: function (preserveBackground) {
        // Stop the resize events
        $(window).off('resize.backstretch orientationchange.backstretch');

        // Clear the interval
        clearInterval(this.interval);

        // Remove Backstretch
        if(!preserveBackground) {
          this.$wrap.remove();
        }
        this.$container.removeData('backstretch');
      }
  };

  /* SUPPORTS FIXED POSITION?
   *
   * Based on code from jQuery Mobile 1.1.0
   * http://jquerymobile.com/
   *
   * In a nutshell, we need to figure out if fixed positioning is supported.
   * Unfortunately, this is very difficult to do on iOS, and usually involves
   * injecting content, scrolling the page, etc.. It's ugly.
   * jQuery Mobile uses this workaround. It's not ideal, but works.
   *
   * Modified to detect IE6
   * ========================= */

  var supportsFixedPosition = (function () {
    var ua = navigator.userAgent
      , platform = navigator.platform
        // Rendering engine is Webkit, and capture major version
      , wkmatch = ua.match( /AppleWebKit\/([0-9]+)/ )
      , wkversion = !!wkmatch && wkmatch[ 1 ]
      , ffmatch = ua.match( /Fennec\/([0-9]+)/ )
      , ffversion = !!ffmatch && ffmatch[ 1 ]
      , operammobilematch = ua.match( /Opera Mobi\/([0-9]+)/ )
      , omversion = !!operammobilematch && operammobilematch[ 1 ]
      , iematch = ua.match( /MSIE ([0-9]+)/ )
      , ieversion = !!iematch && iematch[ 1 ];

    return !(
      // iOS 4.3 and older : Platform is iPhone/Pad/Touch and Webkit version is less than 534 (ios5)
      ((platform.indexOf( "iPhone" ) > -1 || platform.indexOf( "iPad" ) > -1  || platform.indexOf( "iPod" ) > -1 ) && wkversion && wkversion < 534) ||

      // Opera Mini
      (window.operamini && ({}).toString.call( window.operamini ) === "[object OperaMini]") ||
      (operammobilematch && omversion < 7458) ||

      //Android lte 2.1: Platform is Android and Webkit version is less than 533 (Android 2.2)
      (ua.indexOf( "Android" ) > -1 && wkversion && wkversion < 533) ||

      // Firefox Mobile before 6.0 -
      (ffversion && ffversion < 6) ||

      // WebOS less than 3
      ("palmGetResource" in window && wkversion && wkversion < 534) ||

      // MeeGo
      (ua.indexOf( "MeeGo" ) > -1 && ua.indexOf( "NokiaBrowser/8.5.0" ) > -1) ||

      // IE6
      (ieversion && ieversion <= 6)
    );
  }());

}(jQuery, window));

// Generated by CoffeeScript 1.6.2
/*!
jQuery Waypoints - v2.0.5
Copyright (c) 2011-2014 Caleb Troughton
Licensed under the MIT license.
https://github.com/imakewebthings/jquery-waypoints/blob/master/licenses.txt
*/


(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = [].slice;

  (function(root, factory) {
    if (typeof define === 'function' && define.amd) {
      return define('waypoints', ['jquery'], function($) {
        return factory($, root);
      });
    } else {
      return factory(root.jQuery, root);
    }
  })(window, function($, window) {
    var $w, Context, Waypoint, allWaypoints, contextCounter, contextKey, contexts, isTouch, jQMethods, methods, resizeEvent, scrollEvent, waypointCounter, waypointKey, wp, wps;

    $w = $(window);
    isTouch = __indexOf.call(window, 'ontouchstart') >= 0;
    allWaypoints = {
      horizontal: {},
      vertical: {}
    };
    contextCounter = 1;
    contexts = {};
    contextKey = 'waypoints-context-id';
    resizeEvent = 'resize.waypoints';
    scrollEvent = 'scroll.waypoints';
    waypointCounter = 1;
    waypointKey = 'waypoints-waypoint-ids';
    wp = 'waypoint';
    wps = 'waypoints';
    Context = (function() {
      function Context($element) {
        var _this = this;

        this.$element = $element;
        this.element = $element[0];
        this.didResize = false;
        this.didScroll = false;
        this.id = 'context' + contextCounter++;
        this.oldScroll = {
          x: $element.scrollLeft(),
          y: $element.scrollTop()
        };
        this.waypoints = {
          horizontal: {},
          vertical: {}
        };
        this.element[contextKey] = this.id;
        contexts[this.id] = this;
        $element.bind(scrollEvent, function() {
          var scrollHandler;

          if (!(_this.didScroll || isTouch)) {
            _this.didScroll = true;
            scrollHandler = function() {
              _this.doScroll();
              return _this.didScroll = false;
            };
            return window.setTimeout(scrollHandler, $[wps].settings.scrollThrottle);
          }
        });
        $element.bind(resizeEvent, function() {
          var resizeHandler;

          if (!_this.didResize) {
            _this.didResize = true;
            resizeHandler = function() {
              $[wps]('refresh');
              return _this.didResize = false;
            };
            return window.setTimeout(resizeHandler, $[wps].settings.resizeThrottle);
          }
        });
      }

      Context.prototype.doScroll = function() {
        var axes,
          _this = this;

        axes = {
          horizontal: {
            newScroll: this.$element.scrollLeft(),
            oldScroll: this.oldScroll.x,
            forward: 'right',
            backward: 'left'
          },
          vertical: {
            newScroll: this.$element.scrollTop(),
            oldScroll: this.oldScroll.y,
            forward: 'down',
            backward: 'up'
          }
        };
        if (isTouch && (!axes.vertical.oldScroll || !axes.vertical.newScroll)) {
          $[wps]('refresh');
        }
        $.each(axes, function(aKey, axis) {
          var direction, isForward, triggered;

          triggered = [];
          isForward = axis.newScroll > axis.oldScroll;
          direction = isForward ? axis.forward : axis.backward;
          $.each(_this.waypoints[aKey], function(wKey, waypoint) {
            var _ref, _ref1;

            if ((axis.oldScroll < (_ref = waypoint.offset) && _ref <= axis.newScroll)) {
              return triggered.push(waypoint);
            } else if ((axis.newScroll < (_ref1 = waypoint.offset) && _ref1 <= axis.oldScroll)) {
              return triggered.push(waypoint);
            }
          });
          triggered.sort(function(a, b) {
            return a.offset - b.offset;
          });
          if (!isForward) {
            triggered.reverse();
          }
          return $.each(triggered, function(i, waypoint) {
            if (waypoint.options.continuous || i === triggered.length - 1) {
              return waypoint.trigger([direction]);
            }
          });
        });
        return this.oldScroll = {
          x: axes.horizontal.newScroll,
          y: axes.vertical.newScroll
        };
      };

      Context.prototype.refresh = function() {
        var axes, cOffset, isWin,
          _this = this;

        isWin = $.isWindow(this.element);
        cOffset = this.$element.offset();
        this.doScroll();
        axes = {
          horizontal: {
            contextOffset: isWin ? 0 : cOffset.left,
            contextScroll: isWin ? 0 : this.oldScroll.x,
            contextDimension: this.$element.width(),
            oldScroll: this.oldScroll.x,
            forward: 'right',
            backward: 'left',
            offsetProp: 'left'
          },
          vertical: {
            contextOffset: isWin ? 0 : cOffset.top,
            contextScroll: isWin ? 0 : this.oldScroll.y,
            contextDimension: isWin ? $[wps]('viewportHeight') : this.$element.height(),
            oldScroll: this.oldScroll.y,
            forward: 'down',
            backward: 'up',
            offsetProp: 'top'
          }
        };
        return $.each(axes, function(aKey, axis) {
          return $.each(_this.waypoints[aKey], function(i, waypoint) {
            var adjustment, elementOffset, oldOffset, _ref, _ref1;

            adjustment = waypoint.options.offset;
            oldOffset = waypoint.offset;
            elementOffset = $.isWindow(waypoint.element) ? 0 : waypoint.$element.offset()[axis.offsetProp];
            if ($.isFunction(adjustment)) {
              adjustment = adjustment.apply(waypoint.element);
            } else if (typeof adjustment === 'string') {
              adjustment = parseFloat(adjustment);
              if (waypoint.options.offset.indexOf('%') > -1) {
                adjustment = Math.ceil(axis.contextDimension * adjustment / 100);
              }
            }
            waypoint.offset = elementOffset - axis.contextOffset + axis.contextScroll - adjustment;
            if ((waypoint.options.onlyOnScroll && (oldOffset != null)) || !waypoint.enabled) {
              return;
            }
            if (oldOffset !== null && (oldOffset < (_ref = axis.oldScroll) && _ref <= waypoint.offset)) {
              return waypoint.trigger([axis.backward]);
            } else if (oldOffset !== null && (oldOffset > (_ref1 = axis.oldScroll) && _ref1 >= waypoint.offset)) {
              return waypoint.trigger([axis.forward]);
            } else if (oldOffset === null && axis.oldScroll >= waypoint.offset) {
              return waypoint.trigger([axis.forward]);
            }
          });
        });
      };

      Context.prototype.checkEmpty = function() {
        if ($.isEmptyObject(this.waypoints.horizontal) && $.isEmptyObject(this.waypoints.vertical)) {
          this.$element.unbind([resizeEvent, scrollEvent].join(' '));
          return delete contexts[this.id];
        }
      };

      return Context;

    })();
    Waypoint = (function() {
      function Waypoint($element, context, options) {
        var idList, _ref;

        if (options.offset === 'bottom-in-view') {
          options.offset = function() {
            var contextHeight;

            contextHeight = $[wps]('viewportHeight');
            if (!$.isWindow(context.element)) {
              contextHeight = context.$element.height();
            }
            return contextHeight - $(this).outerHeight();
          };
        }
        this.$element = $element;
        this.element = $element[0];
        this.axis = options.horizontal ? 'horizontal' : 'vertical';
        this.callback = options.handler;
        this.context = context;
        this.enabled = options.enabled;
        this.id = 'waypoints' + waypointCounter++;
        this.offset = null;
        this.options = options;
        context.waypoints[this.axis][this.id] = this;
        allWaypoints[this.axis][this.id] = this;
        idList = (_ref = this.element[waypointKey]) != null ? _ref : [];
        idList.push(this.id);
        this.element[waypointKey] = idList;
      }

      Waypoint.prototype.trigger = function(args) {
        if (!this.enabled) {
          return;
        }
        if (this.callback != null) {
          this.callback.apply(this.element, args);
        }
        if (this.options.triggerOnce) {
          return this.destroy();
        }
      };

      Waypoint.prototype.disable = function() {
        return this.enabled = false;
      };

      Waypoint.prototype.enable = function() {
        this.context.refresh();
        return this.enabled = true;
      };

      Waypoint.prototype.destroy = function() {
        delete allWaypoints[this.axis][this.id];
        delete this.context.waypoints[this.axis][this.id];
        return this.context.checkEmpty();
      };

      Waypoint.getWaypointsByElement = function(element) {
        var all, ids;

        ids = element[waypointKey];
        if (!ids) {
          return [];
        }
        all = $.extend({}, allWaypoints.horizontal, allWaypoints.vertical);
        return $.map(ids, function(id) {
          return all[id];
        });
      };

      return Waypoint;

    })();
    methods = {
      init: function(f, options) {
        var _ref;

        options = $.extend({}, $.fn[wp].defaults, options);
        if ((_ref = options.handler) == null) {
          options.handler = f;
        }
        this.each(function() {
          var $this, context, contextElement, _ref1;

          $this = $(this);
          contextElement = (_ref1 = options.context) != null ? _ref1 : $.fn[wp].defaults.context;
          if (!$.isWindow(contextElement)) {
            contextElement = $this.closest(contextElement);
          }
          contextElement = $(contextElement);
          context = contexts[contextElement[0][contextKey]];
          if (!context) {
            context = new Context(contextElement);
          }
          return new Waypoint($this, context, options);
        });
        $[wps]('refresh');
        return this;
      },
      disable: function() {
        return methods._invoke.call(this, 'disable');
      },
      enable: function() {
        return methods._invoke.call(this, 'enable');
      },
      destroy: function() {
        return methods._invoke.call(this, 'destroy');
      },
      prev: function(axis, selector) {
        return methods._traverse.call(this, axis, selector, function(stack, index, waypoints) {
          if (index > 0) {
            return stack.push(waypoints[index - 1]);
          }
        });
      },
      next: function(axis, selector) {
        return methods._traverse.call(this, axis, selector, function(stack, index, waypoints) {
          if (index < waypoints.length - 1) {
            return stack.push(waypoints[index + 1]);
          }
        });
      },
      _traverse: function(axis, selector, push) {
        var stack, waypoints;

        if (axis == null) {
          axis = 'vertical';
        }
        if (selector == null) {
          selector = window;
        }
        waypoints = jQMethods.aggregate(selector);
        stack = [];
        this.each(function() {
          var index;

          index = $.inArray(this, waypoints[axis]);
          return push(stack, index, waypoints[axis]);
        });
        return this.pushStack(stack);
      },
      _invoke: function(method) {
        this.each(function() {
          var waypoints;

          waypoints = Waypoint.getWaypointsByElement(this);
          return $.each(waypoints, function(i, waypoint) {
            waypoint[method]();
            return true;
          });
        });
        return this;
      }
    };
    $.fn[wp] = function() {
      var args, method;

      method = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (methods[method]) {
        return methods[method].apply(this, args);
      } else if ($.isFunction(method)) {
        return methods.init.apply(this, arguments);
      } else if ($.isPlainObject(method)) {
        return methods.init.apply(this, [null, method]);
      } else if (!method) {
        return $.error("jQuery Waypoints needs a callback function or handler option.");
      } else {
        return $.error("The " + method + " method does not exist in jQuery Waypoints.");
      }
    };
    $.fn[wp].defaults = {
      context: window,
      continuous: true,
      enabled: true,
      horizontal: false,
      offset: 0,
      triggerOnce: false
    };
    jQMethods = {
      refresh: function() {
        return $.each(contexts, function(i, context) {
          return context.refresh();
        });
      },
      viewportHeight: function() {
        var _ref;

        return (_ref = window.innerHeight) != null ? _ref : $w.height();
      },
      aggregate: function(contextSelector) {
        var collection, waypoints, _ref;

        collection = allWaypoints;
        if (contextSelector) {
          collection = (_ref = contexts[$(contextSelector)[0][contextKey]]) != null ? _ref.waypoints : void 0;
        }
        if (!collection) {
          return [];
        }
        waypoints = {
          horizontal: [],
          vertical: []
        };
        $.each(waypoints, function(axis, arr) {
          $.each(collection[axis], function(key, waypoint) {
            return arr.push(waypoint);
          });
          arr.sort(function(a, b) {
            return a.offset - b.offset;
          });
          waypoints[axis] = $.map(arr, function(waypoint) {
            return waypoint.element;
          });
          return waypoints[axis] = $.unique(waypoints[axis]);
        });
        return waypoints;
      },
      above: function(contextSelector) {
        if (contextSelector == null) {
          contextSelector = window;
        }
        return jQMethods._filter(contextSelector, 'vertical', function(context, waypoint) {
          return waypoint.offset <= context.oldScroll.y;
        });
      },
      below: function(contextSelector) {
        if (contextSelector == null) {
          contextSelector = window;
        }
        return jQMethods._filter(contextSelector, 'vertical', function(context, waypoint) {
          return waypoint.offset > context.oldScroll.y;
        });
      },
      left: function(contextSelector) {
        if (contextSelector == null) {
          contextSelector = window;
        }
        return jQMethods._filter(contextSelector, 'horizontal', function(context, waypoint) {
          return waypoint.offset <= context.oldScroll.x;
        });
      },
      right: function(contextSelector) {
        if (contextSelector == null) {
          contextSelector = window;
        }
        return jQMethods._filter(contextSelector, 'horizontal', function(context, waypoint) {
          return waypoint.offset > context.oldScroll.x;
        });
      },
      enable: function() {
        return jQMethods._invoke('enable');
      },
      disable: function() {
        return jQMethods._invoke('disable');
      },
      destroy: function() {
        return jQMethods._invoke('destroy');
      },
      extendFn: function(methodName, f) {
        return methods[methodName] = f;
      },
      _invoke: function(method) {
        var waypoints;

        waypoints = $.extend({}, allWaypoints.vertical, allWaypoints.horizontal);
        return $.each(waypoints, function(key, waypoint) {
          waypoint[method]();
          return true;
        });
      },
      _filter: function(selector, axis, test) {
        var context, waypoints;

        context = contexts[$(selector)[0][contextKey]];
        if (!context) {
          return [];
        }
        waypoints = [];
        $.each(context.waypoints[axis], function(i, waypoint) {
          if (test(context, waypoint)) {
            return waypoints.push(waypoint);
          }
        });
        waypoints.sort(function(a, b) {
          return a.offset - b.offset;
        });
        return $.map(waypoints, function(waypoint) {
          return waypoint.element;
        });
      }
    };
    $[wps] = function() {
      var args, method;

      method = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (jQMethods[method]) {
        return jQMethods[method].apply(null, args);
      } else {
        return jQMethods.aggregate.call(null, method);
      }
    };
    $[wps].settings = {
      resizeThrottle: 100,
      scrollThrottle: 30
    };
    return $w.on('load.waypoints', function() {
      return $[wps]('refresh');
    });
  });

}).call(this);

if("undefined"==typeof jQuery)throw new Error("Bootstrap requires jQuery");+function(a){"use strict";function b(){var a=document.createElement("bootstrap"),b={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"};for(var c in b)if(void 0!==a.style[c])return{end:b[c]}}a.fn.emulateTransitionEnd=function(b){var c=!1,d=this;a(this).one(a.support.transition.end,function(){c=!0});var e=function(){c||a(d).trigger(a.support.transition.end)};return setTimeout(e,b),this},a(function(){a.support.transition=b()})}(jQuery),+function(a){"use strict";var b='[data-dismiss="alert"]',c=function(c){a(c).on("click",b,this.close)};c.prototype.close=function(b){function c(){f.trigger("closed.bs.alert").remove()}var d=a(this),e=d.attr("data-target");e||(e=d.attr("href"),e=e&&e.replace(/.*(?=#[^\s]*$)/,""));var f=a(e);b&&b.preventDefault(),f.length||(f=d.hasClass("alert")?d:d.parent()),f.trigger(b=a.Event("close.bs.alert")),b.isDefaultPrevented()||(f.removeClass("in"),a.support.transition&&f.hasClass("fade")?f.one(a.support.transition.end,c).emulateTransitionEnd(150):c())};var d=a.fn.alert;a.fn.alert=function(b){return this.each(function(){var d=a(this),e=d.data("bs.alert");e||d.data("bs.alert",e=new c(this)),"string"==typeof b&&e[b].call(d)})},a.fn.alert.Constructor=c,a.fn.alert.noConflict=function(){return a.fn.alert=d,this},a(document).on("click.bs.alert.data-api",b,c.prototype.close)}(jQuery),+function(a){"use strict";var b=function(c,d){this.$element=a(c),this.options=a.extend({},b.DEFAULTS,d)};b.DEFAULTS={loadingText:"loading..."},b.prototype.setState=function(a){var b="disabled",c=this.$element,d=c.is("input")?"val":"html",e=c.data();a+="Text",e.resetText||c.data("resetText",c[d]()),c[d](e[a]||this.options[a]),setTimeout(function(){"loadingText"==a?c.addClass(b).attr(b,b):c.removeClass(b).removeAttr(b)},0)},b.prototype.toggle=function(){var a=this.$element.closest('[data-toggle="buttons"]'),b=!0;if(a.length){var c=this.$element.find("input");"radio"===c.prop("type")&&(c.prop("checked")&&this.$element.hasClass("active")?b=!1:a.find(".active").removeClass("active")),b&&c.prop("checked",!this.$element.hasClass("active")).trigger("change")}b&&this.$element.toggleClass("active")};var c=a.fn.button;a.fn.button=function(c){return this.each(function(){var d=a(this),e=d.data("bs.button"),f="object"==typeof c&&c;e||d.data("bs.button",e=new b(this,f)),"toggle"==c?e.toggle():c&&e.setState(c)})},a.fn.button.Constructor=b,a.fn.button.noConflict=function(){return a.fn.button=c,this},a(document).on("click.bs.button.data-api","[data-toggle^=button]",function(b){var c=a(b.target);c.hasClass("btn")||(c=c.closest(".btn")),c.button("toggle"),b.preventDefault()})}(jQuery),+function(a){"use strict";var b=function(b,c){this.$element=a(b),this.$indicators=this.$element.find(".carousel-indicators"),this.options=c,this.paused=this.sliding=this.interval=this.$active=this.$items=null,"hover"==this.options.pause&&this.$element.on("mouseenter",a.proxy(this.pause,this)).on("mouseleave",a.proxy(this.cycle,this))};b.DEFAULTS={interval:5e3,pause:"hover",wrap:!0},b.prototype.cycle=function(b){return b||(this.paused=!1),this.interval&&clearInterval(this.interval),this.options.interval&&!this.paused&&(this.interval=setInterval(a.proxy(this.next,this),this.options.interval)),this},b.prototype.getActiveIndex=function(){return this.$active=this.$element.find(".item.active"),this.$items=this.$active.parent().children(),this.$items.index(this.$active)},b.prototype.to=function(b){var c=this,d=this.getActiveIndex();return b>this.$items.length-1||0>b?void 0:this.sliding?this.$element.one("slid.bs.carousel",function(){c.to(b)}):d==b?this.pause().cycle():this.slide(b>d?"next":"prev",a(this.$items[b]))},b.prototype.pause=function(b){return b||(this.paused=!0),this.$element.find(".next, .prev").length&&a.support.transition.end&&(this.$element.trigger(a.support.transition.end),this.cycle(!0)),this.interval=clearInterval(this.interval),this},b.prototype.next=function(){return this.sliding?void 0:this.slide("next")},b.prototype.prev=function(){return this.sliding?void 0:this.slide("prev")},b.prototype.slide=function(b,c){var d=this.$element.find(".item.active"),e=c||d[b](),f=this.interval,g="next"==b?"left":"right",h="next"==b?"first":"last",i=this;if(!e.length){if(!this.options.wrap)return;e=this.$element.find(".item")[h]()}this.sliding=!0,f&&this.pause();var j=a.Event("slide.bs.carousel",{relatedTarget:e[0],direction:g});if(!e.hasClass("active")){if(this.$indicators.length&&(this.$indicators.find(".active").removeClass("active"),this.$element.one("slid.bs.carousel",function(){var b=a(i.$indicators.children()[i.getActiveIndex()]);b&&b.addClass("active")})),a.support.transition&&this.$element.hasClass("slide")){if(this.$element.trigger(j),j.isDefaultPrevented())return;e.addClass(b),e[0].offsetWidth,d.addClass(g),e.addClass(g),d.one(a.support.transition.end,function(){e.removeClass([b,g].join(" ")).addClass("active"),d.removeClass(["active",g].join(" ")),i.sliding=!1,setTimeout(function(){i.$element.trigger("slid.bs.carousel")},0)}).emulateTransitionEnd(600)}else{if(this.$element.trigger(j),j.isDefaultPrevented())return;d.removeClass("active"),e.addClass("active"),this.sliding=!1,this.$element.trigger("slid.bs.carousel")}return f&&this.cycle(),this}};var c=a.fn.carousel;a.fn.carousel=function(c){return this.each(function(){var d=a(this),e=d.data("bs.carousel"),f=a.extend({},b.DEFAULTS,d.data(),"object"==typeof c&&c),g="string"==typeof c?c:f.slide;e||d.data("bs.carousel",e=new b(this,f)),"number"==typeof c?e.to(c):g?e[g]():f.interval&&e.pause().cycle()})},a.fn.carousel.Constructor=b,a.fn.carousel.noConflict=function(){return a.fn.carousel=c,this},a(document).on("click.bs.carousel.data-api","[data-slide], [data-slide-to]",function(b){var c,d=a(this),e=a(d.attr("data-target")||(c=d.attr("href"))&&c.replace(/.*(?=#[^\s]+$)/,"")),f=a.extend({},e.data(),d.data()),g=d.attr("data-slide-to");g&&(f.interval=!1),e.carousel(f),(g=d.attr("data-slide-to"))&&e.data("bs.carousel").to(g),b.preventDefault()}),a(window).on("load",function(){a('[data-ride="carousel"]').each(function(){var b=a(this);b.carousel(b.data())})})}(jQuery),+function(a){"use strict";var b=function(c,d){this.$element=a(c),this.options=a.extend({},b.DEFAULTS,d),this.transitioning=null,this.options.parent&&(this.$parent=a(this.options.parent)),this.options.toggle&&this.toggle()};b.DEFAULTS={toggle:!0},b.prototype.dimension=function(){var a=this.$element.hasClass("width");return a?"width":"height"},b.prototype.show=function(){if(!this.transitioning&&!this.$element.hasClass("in")){var b=a.Event("show.bs.collapse");if(this.$element.trigger(b),!b.isDefaultPrevented()){var c=this.$parent&&this.$parent.find("> .panel > .in");if(c&&c.length){var d=c.data("bs.collapse");if(d&&d.transitioning)return;c.collapse("hide"),d||c.data("bs.collapse",null)}var e=this.dimension();this.$element.removeClass("collapse").addClass("collapsing")[e](0),this.transitioning=1;var f=function(){this.$element.removeClass("collapsing").addClass("in")[e]("auto"),this.transitioning=0,this.$element.trigger("shown.bs.collapse")};if(!a.support.transition)return f.call(this);var g=a.camelCase(["scroll",e].join("-"));this.$element.one(a.support.transition.end,a.proxy(f,this)).emulateTransitionEnd(350)[e](this.$element[0][g])}}},b.prototype.hide=function(){if(!this.transitioning&&this.$element.hasClass("in")){var b=a.Event("hide.bs.collapse");if(this.$element.trigger(b),!b.isDefaultPrevented()){var c=this.dimension();this.$element[c](this.$element[c]())[0].offsetHeight,this.$element.addClass("collapsing").removeClass("collapse").removeClass("in"),this.transitioning=1;var d=function(){this.transitioning=0,this.$element.trigger("hidden.bs.collapse").removeClass("collapsing").addClass("collapse")};return a.support.transition?(this.$element[c](0).one(a.support.transition.end,a.proxy(d,this)).emulateTransitionEnd(350),void 0):d.call(this)}}},b.prototype.toggle=function(){this[this.$element.hasClass("in")?"hide":"show"]()};var c=a.fn.collapse;a.fn.collapse=function(c){return this.each(function(){var d=a(this),e=d.data("bs.collapse"),f=a.extend({},b.DEFAULTS,d.data(),"object"==typeof c&&c);e||d.data("bs.collapse",e=new b(this,f)),"string"==typeof c&&e[c]()})},a.fn.collapse.Constructor=b,a.fn.collapse.noConflict=function(){return a.fn.collapse=c,this},a(document).on("click.bs.collapse.data-api","[data-toggle=collapse]",function(b){var c,d=a(this),e=d.attr("data-target")||b.preventDefault()||(c=d.attr("href"))&&c.replace(/.*(?=#[^\s]+$)/,""),f=a(e),g=f.data("bs.collapse"),h=g?"toggle":d.data(),i=d.attr("data-parent"),j=i&&a(i);g&&g.transitioning||(j&&j.find('[data-toggle=collapse][data-parent="'+i+'"]').not(d).addClass("collapsed"),d[f.hasClass("in")?"addClass":"removeClass"]("collapsed")),f.collapse(h)})}(jQuery),+function(a){"use strict";function b(){a(d).remove(),a(e).each(function(b){var d=c(a(this));d.hasClass("open")&&(d.trigger(b=a.Event("hide.bs.dropdown")),b.isDefaultPrevented()||d.removeClass("open").trigger("hidden.bs.dropdown"))})}function c(b){var c=b.attr("data-target");c||(c=b.attr("href"),c=c&&/#/.test(c)&&c.replace(/.*(?=#[^\s]*$)/,""));var d=c&&a(c);return d&&d.length?d:b.parent()}var d=".dropdown-backdrop",e="[data-toggle=dropdown]",f=function(b){a(b).on("click.bs.dropdown",this.toggle)};f.prototype.toggle=function(d){var e=a(this);if(!e.is(".disabled, :disabled")){var f=c(e),g=f.hasClass("open");if(b(),!g){if("ontouchstart"in document.documentElement&&!f.closest(".navbar-nav").length&&a('<div class="dropdown-backdrop"/>').insertAfter(a(this)).on("click",b),f.trigger(d=a.Event("show.bs.dropdown")),d.isDefaultPrevented())return;f.toggleClass("open").trigger("shown.bs.dropdown"),e.focus()}return!1}},f.prototype.keydown=function(b){if(/(38|40|27)/.test(b.keyCode)){var d=a(this);if(b.preventDefault(),b.stopPropagation(),!d.is(".disabled, :disabled")){var f=c(d),g=f.hasClass("open");if(!g||g&&27==b.keyCode)return 27==b.which&&f.find(e).focus(),d.click();var h=a("[role=menu] li:not(.divider):visible a",f);if(h.length){var i=h.index(h.filter(":focus"));38==b.keyCode&&i>0&&i--,40==b.keyCode&&i<h.length-1&&i++,~i||(i=0),h.eq(i).focus()}}}};var g=a.fn.dropdown;a.fn.dropdown=function(b){return this.each(function(){var c=a(this),d=c.data("bs.dropdown");d||c.data("bs.dropdown",d=new f(this)),"string"==typeof b&&d[b].call(c)})},a.fn.dropdown.Constructor=f,a.fn.dropdown.noConflict=function(){return a.fn.dropdown=g,this},a(document).on("click.bs.dropdown.data-api",b).on("click.bs.dropdown.data-api",".dropdown form",function(a){a.stopPropagation()}).on("click.bs.dropdown.data-api",e,f.prototype.toggle).on("keydown.bs.dropdown.data-api",e+", [role=menu]",f.prototype.keydown)}(jQuery),+function(a){"use strict";var b=function(b,c){this.options=c,this.$element=a(b),this.$backdrop=this.isShown=null,this.options.remote&&this.$element.load(this.options.remote)};b.DEFAULTS={backdrop:!0,keyboard:!0,show:!0},b.prototype.toggle=function(a){return this[this.isShown?"hide":"show"](a)},b.prototype.show=function(b){var c=this,d=a.Event("show.bs.modal",{relatedTarget:b});this.$element.trigger(d),this.isShown||d.isDefaultPrevented()||(this.isShown=!0,this.escape(),this.$element.on("click.dismiss.modal",'[data-dismiss="modal"]',a.proxy(this.hide,this)),this.backdrop(function(){var d=a.support.transition&&c.$element.hasClass("fade");c.$element.parent().length||c.$element.appendTo(document.body),c.$element.show(),d&&c.$element[0].offsetWidth,c.$element.addClass("in").attr("aria-hidden",!1),c.enforceFocus();var e=a.Event("shown.bs.modal",{relatedTarget:b});d?c.$element.find(".modal-dialog").one(a.support.transition.end,function(){c.$element.focus().trigger(e)}).emulateTransitionEnd(300):c.$element.focus().trigger(e)}))},b.prototype.hide=function(b){b&&b.preventDefault(),b=a.Event("hide.bs.modal"),this.$element.trigger(b),this.isShown&&!b.isDefaultPrevented()&&(this.isShown=!1,this.escape(),a(document).off("focusin.bs.modal"),this.$element.removeClass("in").attr("aria-hidden",!0).off("click.dismiss.modal"),a.support.transition&&this.$element.hasClass("fade")?this.$element.one(a.support.transition.end,a.proxy(this.hideModal,this)).emulateTransitionEnd(300):this.hideModal())},b.prototype.enforceFocus=function(){a(document).off("focusin.bs.modal").on("focusin.bs.modal",a.proxy(function(a){this.$element[0]===a.target||this.$element.has(a.target).length||this.$element.focus()},this))},b.prototype.escape=function(){this.isShown&&this.options.keyboard?this.$element.on("keyup.dismiss.bs.modal",a.proxy(function(a){27==a.which&&this.hide()},this)):this.isShown||this.$element.off("keyup.dismiss.bs.modal")},b.prototype.hideModal=function(){var a=this;this.$element.hide(),this.backdrop(function(){a.removeBackdrop(),a.$element.trigger("hidden.bs.modal")})},b.prototype.removeBackdrop=function(){this.$backdrop&&this.$backdrop.remove(),this.$backdrop=null},b.prototype.backdrop=function(b){var c=this.$element.hasClass("fade")?"fade":"";if(this.isShown&&this.options.backdrop){var d=a.support.transition&&c;if(this.$backdrop=a('<div class="modal-backdrop '+c+'" />').appendTo(document.body),this.$element.on("click.dismiss.modal",a.proxy(function(a){a.target===a.currentTarget&&("static"==this.options.backdrop?this.$element[0].focus.call(this.$element[0]):this.hide.call(this))},this)),d&&this.$backdrop[0].offsetWidth,this.$backdrop.addClass("in"),!b)return;d?this.$backdrop.one(a.support.transition.end,b).emulateTransitionEnd(150):b()}else!this.isShown&&this.$backdrop?(this.$backdrop.removeClass("in"),a.support.transition&&this.$element.hasClass("fade")?this.$backdrop.one(a.support.transition.end,b).emulateTransitionEnd(150):b()):b&&b()};var c=a.fn.modal;a.fn.modal=function(c,d){return this.each(function(){var e=a(this),f=e.data("bs.modal"),g=a.extend({},b.DEFAULTS,e.data(),"object"==typeof c&&c);f||e.data("bs.modal",f=new b(this,g)),"string"==typeof c?f[c](d):g.show&&f.show(d)})},a.fn.modal.Constructor=b,a.fn.modal.noConflict=function(){return a.fn.modal=c,this},a(document).on("click.bs.modal.data-api",'[data-toggle="modal"]',function(b){var c=a(this),d=c.attr("href"),e=a(c.attr("data-target")||d&&d.replace(/.*(?=#[^\s]+$)/,"")),f=e.data("modal")?"toggle":a.extend({remote:!/#/.test(d)&&d},e.data(),c.data());b.preventDefault(),e.modal(f,this).one("hide",function(){c.is(":visible")&&c.focus()})}),a(document).on("show.bs.modal",".modal",function(){a(document.body).addClass("modal-open")}).on("hidden.bs.modal",".modal",function(){a(document.body).removeClass("modal-open")})}(jQuery),+function(a){"use strict";var b=function(a,b){this.type=this.options=this.enabled=this.timeout=this.hoverState=this.$element=null,this.init("tooltip",a,b)};b.DEFAULTS={animation:!0,placement:"top",selector:!1,template:'<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover focus",title:"",delay:0,html:!1,container:!1},b.prototype.init=function(b,c,d){this.enabled=!0,this.type=b,this.$element=a(c),this.options=this.getOptions(d);for(var e=this.options.trigger.split(" "),f=e.length;f--;){var g=e[f];if("click"==g)this.$element.on("click."+this.type,this.options.selector,a.proxy(this.toggle,this));else if("manual"!=g){var h="hover"==g?"mouseenter":"focus",i="hover"==g?"mouseleave":"blur";this.$element.on(h+"."+this.type,this.options.selector,a.proxy(this.enter,this)),this.$element.on(i+"."+this.type,this.options.selector,a.proxy(this.leave,this))}}this.options.selector?this._options=a.extend({},this.options,{trigger:"manual",selector:""}):this.fixTitle()},b.prototype.getDefaults=function(){return b.DEFAULTS},b.prototype.getOptions=function(b){return b=a.extend({},this.getDefaults(),this.$element.data(),b),b.delay&&"number"==typeof b.delay&&(b.delay={show:b.delay,hide:b.delay}),b},b.prototype.getDelegateOptions=function(){var b={},c=this.getDefaults();return this._options&&a.each(this._options,function(a,d){c[a]!=d&&(b[a]=d)}),b},b.prototype.enter=function(b){var c=b instanceof this.constructor?b:a(b.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type);return clearTimeout(c.timeout),c.hoverState="in",c.options.delay&&c.options.delay.show?(c.timeout=setTimeout(function(){"in"==c.hoverState&&c.show()},c.options.delay.show),void 0):c.show()},b.prototype.leave=function(b){var c=b instanceof this.constructor?b:a(b.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type);return clearTimeout(c.timeout),c.hoverState="out",c.options.delay&&c.options.delay.hide?(c.timeout=setTimeout(function(){"out"==c.hoverState&&c.hide()},c.options.delay.hide),void 0):c.hide()},b.prototype.show=function(){var b=a.Event("show.bs."+this.type);if(this.hasContent()&&this.enabled){if(this.$element.trigger(b),b.isDefaultPrevented())return;var c=this.tip();this.setContent(),this.options.animation&&c.addClass("fade");var d="function"==typeof this.options.placement?this.options.placement.call(this,c[0],this.$element[0]):this.options.placement,e=/\s?auto?\s?/i,f=e.test(d);f&&(d=d.replace(e,"")||"top"),c.detach().css({top:0,left:0,display:"block"}).addClass(d),this.options.container?c.appendTo(this.options.container):c.insertAfter(this.$element);var g=this.getPosition(),h=c[0].offsetWidth,i=c[0].offsetHeight;if(f){var j=this.$element.parent(),k=d,l=document.documentElement.scrollTop||document.body.scrollTop,m="body"==this.options.container?window.innerWidth:j.outerWidth(),n="body"==this.options.container?window.innerHeight:j.outerHeight(),o="body"==this.options.container?0:j.offset().left;d="bottom"==d&&g.top+g.height+i-l>n?"top":"top"==d&&g.top-l-i<0?"bottom":"right"==d&&g.right+h>m?"left":"left"==d&&g.left-h<o?"right":d,c.removeClass(k).addClass(d)}var p=this.getCalculatedOffset(d,g,h,i);this.applyPlacement(p,d),this.$element.trigger("shown.bs."+this.type)}},b.prototype.applyPlacement=function(a,b){var c,d=this.tip(),e=d[0].offsetWidth,f=d[0].offsetHeight,g=parseInt(d.css("margin-top"),10),h=parseInt(d.css("margin-left"),10);isNaN(g)&&(g=0),isNaN(h)&&(h=0),a.top=a.top+g,a.left=a.left+h,d.offset(a).addClass("in");var i=d[0].offsetWidth,j=d[0].offsetHeight;if("top"==b&&j!=f&&(c=!0,a.top=a.top+f-j),/bottom|top/.test(b)){var k=0;a.left<0&&(k=-2*a.left,a.left=0,d.offset(a),i=d[0].offsetWidth,j=d[0].offsetHeight),this.replaceArrow(k-e+i,i,"left")}else this.replaceArrow(j-f,j,"top");c&&d.offset(a)},b.prototype.replaceArrow=function(a,b,c){this.arrow().css(c,a?50*(1-a/b)+"%":"")},b.prototype.setContent=function(){var a=this.tip(),b=this.getTitle();a.find(".tooltip-inner")[this.options.html?"html":"text"](b),a.removeClass("fade in top bottom left right")},b.prototype.hide=function(){function b(){"in"!=c.hoverState&&d.detach()}var c=this,d=this.tip(),e=a.Event("hide.bs."+this.type);return this.$element.trigger(e),e.isDefaultPrevented()?void 0:(d.removeClass("in"),a.support.transition&&this.$tip.hasClass("fade")?d.one(a.support.transition.end,b).emulateTransitionEnd(150):b(),this.$element.trigger("hidden.bs."+this.type),this)},b.prototype.fixTitle=function(){var a=this.$element;(a.attr("title")||"string"!=typeof a.attr("data-original-title"))&&a.attr("data-original-title",a.attr("title")||"").attr("title","")},b.prototype.hasContent=function(){return this.getTitle()},b.prototype.getPosition=function(){var b=this.$element[0];return a.extend({},"function"==typeof b.getBoundingClientRect?b.getBoundingClientRect():{width:b.offsetWidth,height:b.offsetHeight},this.$element.offset())},b.prototype.getCalculatedOffset=function(a,b,c,d){return"bottom"==a?{top:b.top+b.height,left:b.left+b.width/2-c/2}:"top"==a?{top:b.top-d,left:b.left+b.width/2-c/2}:"left"==a?{top:b.top+b.height/2-d/2,left:b.left-c}:{top:b.top+b.height/2-d/2,left:b.left+b.width}},b.prototype.getTitle=function(){var a,b=this.$element,c=this.options;return a=b.attr("data-original-title")||("function"==typeof c.title?c.title.call(b[0]):c.title)},b.prototype.tip=function(){return this.$tip=this.$tip||a(this.options.template)},b.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".tooltip-arrow")},b.prototype.validate=function(){this.$element[0].parentNode||(this.hide(),this.$element=null,this.options=null)},b.prototype.enable=function(){this.enabled=!0},b.prototype.disable=function(){this.enabled=!1},b.prototype.toggleEnabled=function(){this.enabled=!this.enabled},b.prototype.toggle=function(b){var c=b?a(b.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type):this;c.tip().hasClass("in")?c.leave(c):c.enter(c)},b.prototype.destroy=function(){this.hide().$element.off("."+this.type).removeData("bs."+this.type)};var c=a.fn.tooltip;a.fn.tooltip=function(c){return this.each(function(){var d=a(this),e=d.data("bs.tooltip"),f="object"==typeof c&&c;e||d.data("bs.tooltip",e=new b(this,f)),"string"==typeof c&&e[c]()})},a.fn.tooltip.Constructor=b,a.fn.tooltip.noConflict=function(){return a.fn.tooltip=c,this}}(jQuery),+function(a){"use strict";var b=function(a,b){this.init("popover",a,b)};if(!a.fn.tooltip)throw new Error("Popover requires tooltip.js");b.DEFAULTS=a.extend({},a.fn.tooltip.Constructor.DEFAULTS,{placement:"right",trigger:"click",content:"",template:'<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'}),b.prototype=a.extend({},a.fn.tooltip.Constructor.prototype),b.prototype.constructor=b,b.prototype.getDefaults=function(){return b.DEFAULTS},b.prototype.setContent=function(){var a=this.tip(),b=this.getTitle(),c=this.getContent();a.find(".popover-title")[this.options.html?"html":"text"](b),a.find(".popover-content")[this.options.html?"html":"text"](c),a.removeClass("fade top bottom left right in"),a.find(".popover-title").html()||a.find(".popover-title").hide()},b.prototype.hasContent=function(){return this.getTitle()||this.getContent()},b.prototype.getContent=function(){var a=this.$element,b=this.options;return a.attr("data-content")||("function"==typeof b.content?b.content.call(a[0]):b.content)},b.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".arrow")},b.prototype.tip=function(){return this.$tip||(this.$tip=a(this.options.template)),this.$tip};var c=a.fn.popover;a.fn.popover=function(c){return this.each(function(){var d=a(this),e=d.data("bs.popover"),f="object"==typeof c&&c;e||d.data("bs.popover",e=new b(this,f)),"string"==typeof c&&e[c]()})},a.fn.popover.Constructor=b,a.fn.popover.noConflict=function(){return a.fn.popover=c,this}}(jQuery),+function(a){"use strict";function b(c,d){var e,f=a.proxy(this.process,this);this.$element=a(c).is("body")?a(window):a(c),this.$body=a("body"),this.$scrollElement=this.$element.on("scroll.bs.scroll-spy.data-api",f),this.options=a.extend({},b.DEFAULTS,d),this.selector=(this.options.target||(e=a(c).attr("href"))&&e.replace(/.*(?=#[^\s]+$)/,"")||"")+" .nav li > a",this.offsets=a([]),this.targets=a([]),this.activeTarget=null,this.refresh(),this.process()}b.DEFAULTS={offset:10},b.prototype.refresh=function(){var b=this.$element[0]==window?"offset":"position";this.offsets=a([]),this.targets=a([]);var c=this;this.$body.find(this.selector).map(function(){var d=a(this),e=d.data("target")||d.attr("href"),f=/^#\w/.test(e)&&a(e);return f&&f.length&&[[f[b]().top+(!a.isWindow(c.$scrollElement.get(0))&&c.$scrollElement.scrollTop()),e]]||null}).sort(function(a,b){return a[0]-b[0]}).each(function(){c.offsets.push(this[0]),c.targets.push(this[1])})},b.prototype.process=function(){var a,b=this.$scrollElement.scrollTop()+this.options.offset,c=this.$scrollElement[0].scrollHeight||this.$body[0].scrollHeight,d=c-this.$scrollElement.height(),e=this.offsets,f=this.targets,g=this.activeTarget;if(b>=d)return g!=(a=f.last()[0])&&this.activate(a);for(a=e.length;a--;)g!=f[a]&&b>=e[a]&&(!e[a+1]||b<=e[a+1])&&this.activate(f[a])},b.prototype.activate=function(b){this.activeTarget=b,a(this.selector).parents(".active").removeClass("active");var c=this.selector+'[data-target="'+b+'"],'+this.selector+'[href="'+b+'"]',d=a(c).parents("li").addClass("active");d.parent(".dropdown-menu").length&&(d=d.closest("li.dropdown").addClass("active")),d.trigger("activate.bs.scrollspy")};var c=a.fn.scrollspy;a.fn.scrollspy=function(c){return this.each(function(){var d=a(this),e=d.data("bs.scrollspy"),f="object"==typeof c&&c;e||d.data("bs.scrollspy",e=new b(this,f)),"string"==typeof c&&e[c]()})},a.fn.scrollspy.Constructor=b,a.fn.scrollspy.noConflict=function(){return a.fn.scrollspy=c,this},a(window).on("load",function(){a('[data-spy="scroll"]').each(function(){var b=a(this);b.scrollspy(b.data())})})}(jQuery),+function(a){"use strict";var b=function(b){this.element=a(b)};b.prototype.show=function(){var b=this.element,c=b.closest("ul:not(.dropdown-menu)"),d=b.data("target");if(d||(d=b.attr("href"),d=d&&d.replace(/.*(?=#[^\s]*$)/,"")),!b.parent("li").hasClass("active")){var e=c.find(".active:last a")[0],f=a.Event("show.bs.tab",{relatedTarget:e});if(b.trigger(f),!f.isDefaultPrevented()){var g=a(d);this.activate(b.parent("li"),c),this.activate(g,g.parent(),function(){b.trigger({type:"shown.bs.tab",relatedTarget:e})})}}},b.prototype.activate=function(b,c,d){function e(){f.removeClass("active").find("> .dropdown-menu > .active").removeClass("active"),b.addClass("active"),g?(b[0].offsetWidth,b.addClass("in")):b.removeClass("fade"),b.parent(".dropdown-menu")&&b.closest("li.dropdown").addClass("active"),d&&d()}var f=c.find("> .active"),g=d&&a.support.transition&&f.hasClass("fade");g?f.one(a.support.transition.end,e).emulateTransitionEnd(150):e(),f.removeClass("in")};var c=a.fn.tab;a.fn.tab=function(c){return this.each(function(){var d=a(this),e=d.data("bs.tab");e||d.data("bs.tab",e=new b(this)),"string"==typeof c&&e[c]()})},a.fn.tab.Constructor=b,a.fn.tab.noConflict=function(){return a.fn.tab=c,this},a(document).on("click.bs.tab.data-api",'[data-toggle="tab"], [data-toggle="pill"]',function(b){b.preventDefault(),a(this).tab("show")})}(jQuery),+function(a){"use strict";var b=function(c,d){this.options=a.extend({},b.DEFAULTS,d),this.$window=a(window).on("scroll.bs.affix.data-api",a.proxy(this.checkPosition,this)).on("click.bs.affix.data-api",a.proxy(this.checkPositionWithEventLoop,this)),this.$element=a(c),this.affixed=this.unpin=null,this.checkPosition()};b.RESET="affix affix-top affix-bottom",b.DEFAULTS={offset:0},b.prototype.checkPositionWithEventLoop=function(){setTimeout(a.proxy(this.checkPosition,this),1)},b.prototype.checkPosition=function(){if(this.$element.is(":visible")){var c=a(document).height(),d=this.$window.scrollTop(),e=this.$element.offset(),f=this.options.offset,g=f.top,h=f.bottom;"object"!=typeof f&&(h=g=f),"function"==typeof g&&(g=f.top()),"function"==typeof h&&(h=f.bottom());var i=null!=this.unpin&&d+this.unpin<=e.top?!1:null!=h&&e.top+this.$element.height()>=c-h?"bottom":null!=g&&g>=d?"top":!1;this.affixed!==i&&(this.unpin&&this.$element.css("top",""),this.affixed=i,this.unpin="bottom"==i?e.top-d:null,this.$element.removeClass(b.RESET).addClass("affix"+(i?"-"+i:"")),"bottom"==i&&this.$element.offset({top:document.body.offsetHeight-h-this.$element.height()}))}};var c=a.fn.affix;a.fn.affix=function(c){return this.each(function(){var d=a(this),e=d.data("bs.affix"),f="object"==typeof c&&c;e||d.data("bs.affix",e=new b(this,f)),"string"==typeof c&&e[c]()})},a.fn.affix.Constructor=b,a.fn.affix.noConflict=function(){return a.fn.affix=c,this},a(window).on("load",function(){a('[data-spy="affix"]').each(function(){var b=a(this),c=b.data();c.offset=c.offset||{},c.offsetBottom&&(c.offset.bottom=c.offsetBottom),c.offsetTop&&(c.offset.top=c.offsetTop),b.affix(c)})})}(jQuery);

/**
 * jQuery Stalactite : Lightweight Element Packing
 * Examples and documentation at: http://jonobr1.github.com/stalactite
 * Copyright (c) 2011 Jono Brandel
 * Version: 0.1 (8-SEPTEMBER-2011)
 * Requires: jQuery v1.6.2 or later
 *
 * Copyright 2011 jonobr1
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function($) {

  var indexed = []; // List of all dom elements already applied.

  $.fn.stalactite = function(customOptions) {

    var resizing = false;
    var options = $.extend({}, $.fn.stalactite.defaultOptions, customOptions);
        options.cssSelector = options.cssPrefix + '-loaded';

    return this.each(function() {

      var $this = $(this);
      var packTimeout = null;
      var $newElems = prep($this, options);
      appendLoader($this);

      var prevThisIndex = index($this);
      var params = {
        row: 0,
        prevMinIndex: 0,
        prevMaxIndex: 0,
        i: 0
      };

      // Check for elements already packed.
      if (prevThisIndex >= 0) {

        if ($this.children().index($newElems[0]) > 0) {
          params = indexed[prevThisIndex];
        }

      }

      var row = params.row;

      // Bind events for window resizing
      if (options.fluid) {
        $this.css('width', 'auto');
        $(window).bind('resize', function() {
          if (packTimeout) {
            clearTimeout(packTimeout);
          } else {
            appendLoader($this);
          }
          resizing = true;
          packTimeout = setTimeout(function() {
            resizing = false;
            packTimeout = null;
            row = 0;
            params = {
              row: 0,
              prevMinIndex: 0,
              prevMaxIndex: 0,
              i: 0
            };
            indexed = [];
            pack($this, calculateOffset, params, options);
          }, 2000);
        });
      }

      // Gather all assets in the element
      var selector = 'img, embed, iframe, audio, video, div';
      var $assets = $this
        .children()
        .not(options.cssSelector)
        .find(selector);
      var $content = $this
        .find(':not(' + selector + ')');

      // var loadedImgs = 0;
      // Make sure all the elements are loaded before we start packing
      // if ($assets.length > 0) {
      //   $assets.each(function(i) {
      //     console.log('loading');
      //     var $asset = $(this).bind('load', function() {
      //       animateIn($asset);
      //       loadedImgs++;
      //       console.log(loadedImgs, $assets.length);
      //       if (loadedImgs >= $assets.length) {
      //         pack($this, calculateOffset, params, options);
      //       }
      //     });
      //   });
      // } else {
      //   console.log('no need to load');
      pack($this, calculateOffset, params, options);
      // }

      // This measures the distance between the current child element and the
      // element `relative`ly above it. Then animates to the pack.
      function calculateOffset($content, origin, prevMinIndex, prevMaxIndex, i) {

        if (i >= $content.length) {
          if (indexed[prevThisIndex]) { // update
            indexed[prevThisIndex] = $.extend(indexed[prevThisIndex], params);
          } else {  // push a new instance
            indexed.push($.extend({ dom: $content.parent('div')[0] }, params));
          }
          options.complete.apply(this);
          removeLoader(options);
          return;
        } else if (resizing && options.fluid) {
          removeLoader(options);
          return;
        }

        var $this = $($content[i]); 
        var $prev = $($content[i - 1]);

        var outerWidth = $this.outerWidth(true);
        var outerHeight = $this.outerHeight(true);

        var hMargin = outerWidth - $this.outerWidth();
        var vMargin = outerHeight - $this.outerHeight();

        var x1 = $this.offset().left - hMargin, x2 = x1 + outerWidth,
            y1 = $this.offset().top - vMargin, y2 = y1 + outerHeight;

        if ($prev.length > 0) {
          if (x1 < $prev.offset().left && i > 0 && i !== params.i) {
            row++;
            params.row = row;
            params.prevMinIndex = prevMinIndex = prevMaxIndex;
            params.prevMaxIndex = prevMaxIndex = i - 1;
            params.i = i;
          }
        }

        var offsetY = 0;

        if (row > 0) {

          for (var j = prevMaxIndex; j >= prevMinIndex; j--) {

            var $prev = $($content[j]);

            outerWidth = $prev.outerWidth(true);
            outerHeight = $prev.outerHeight(true);

            hMargin = outerWidth - $prev.outerWidth();
            vMargin = outerHeight - $prev.outerHeight();

            var a1 = $prev.offset().left - hMargin, a2 = a1 + outerWidth,
                b1 = $prev.offset().top - vMargin, b2 = b1 + outerHeight;

            if (a1 >= x2 || a2 <= x1) {
              continue;
            } else if (offsetY < b2) {
              offsetY = b2;
            }

          }

          offsetY = offsetY - y1;

        } else {
          offsetY = - parseInt($this.css('margin-top').toString().replace('px', ''));
        }

        animateIn($this, {
          opacity: 1,
          marginTop: '+=' + offsetY
        }, function() {
          calculateOffset($content, origin, prevMinIndex, prevMaxIndex, i + 1);
        });

      }

    });

    // Appends a custom loader to the body and places at the top left corner of
    // the element invoking the plugin.
    function appendLoader($dom) {

      var origin = {
        x: $dom.offset().left + ($dom.outerWidth() - $dom.width()) / 2,
        y: $dom.offset().top + ($dom.outerHeight() - $dom.height()) / 2
      };

      var $loader = $('#stalactite-loader');
      if ($loader.length <= 0) {
        $loader = $('<p class="stalactite-loader" style="display: none;"/>');
      }
      $loader
        .css({
          position: 'absolute',
          top: origin.y,
          left: origin.x
        })
        .html(options.loader)
        .appendTo('body');

      $loader
        .find('img')
        .bind('load', function() {
          $loader.fadeIn();
        });

    }

    function animateIn($dom, params, callback) {
      var args = $.extend({}, params, options.styles);
      if (args.opacity == $dom.css('opacity')) {  // Weird bug.
        delete args.opacity;
      }
      $dom.css('z-index', 'auto').stop().animate(args,
        options.duration, options.easing, callback);
    }

  };

  function index($dom) {
    var dom = $dom[0];
    var iterator = -1;
    for (var i = 0; i < indexed.length; i++) {
      var d = indexed[i].dom;
      if (dom === d) {
        iterator = i;
        break;
      }
    }
    return iterator;
  }

  function removeLoader(options) {
    $((options.cssPrefix + '-loader')).fadeOut();
  }

  // Before all assets are loaded, lets make sure that all children elements
  // within stalactite have the same structural css styling.
  function prep($dom, options) {

    var result = $dom
      .children()
      .not(options.cssSelector);

    if (options.cssPrep) {
      result
        .css({
          position: 'relative',
          display: 'inline-block',
          verticalAlign: 'top',
          opacity: 0,
          zIndex: -1
        });
    }

    return result;

  }

  // As we go through and pack each element, let's make sure that they're marked
  // so as not to have to repeat packing logic.
  function pack($dom, callback, params, options) {

    var $content = $dom.children().addClass(options.cssSelector);

    var vMargin = $dom.outerHeight(true) - $dom.outerHeight();
    var hMargin = $dom.outerWidth(true) - $dom.outerWidth();

    var origin = {
      x: $dom.offset().left - hMargin + ($dom.outerWidth(true) - $dom.width()) / 2,
      y: $dom.offset().top - vMargin + ($dom.outerHeight(true) - $dom.height()) / 2
    };

    callback.apply(this, [$content, origin, params.prevMinIndex, params.prevMaxIndex, params.i]);

  }

  $.fn.stalactite.defaultOptions = {
    duration: 150,
    easing: 'swing',
    cssPrefix: '.stalactite',
    cssPrep: true,
    fluid: true,
    loader: '<img src="data:image/gif;base64, R0lGODlhEAAQAPQAAP///zMzM/n5+V9fX5ycnDc3N1FRUd7e3rm5uURERJGRkYSEhOnp6aysrNHR0WxsbHd3dwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAAFUCAgjmRpnqUwFGwhKoRgqq2YFMaRGjWA8AbZiIBbjQQ8AmmFUJEQhQGJhaKOrCksgEla+KIkYvC6SJKQOISoNSYdeIk1ayA8ExTyeR3F749CACH5BAkKAAAALAAAAAAQABAAAAVoICCKR9KMaCoaxeCoqEAkRX3AwMHWxQIIjJSAZWgUEgzBwCBAEQpMwIDwY1FHgwJCtOW2UDWYIDyqNVVkUbYr6CK+o2eUMKgWrqKhj0FrEM8jQQALPFA3MAc8CQSAMA5ZBjgqDQmHIyEAIfkECQoAAAAsAAAAABAAEAAABWAgII4j85Ao2hRIKgrEUBQJLaSHMe8zgQo6Q8sxS7RIhILhBkgumCTZsXkACBC+0cwF2GoLLoFXREDcDlkAojBICRaFLDCOQtQKjmsQSubtDFU/NXcDBHwkaw1cKQ8MiyEAIfkECQoAAAAsAAAAABAAEAAABVIgII5kaZ6AIJQCMRTFQKiDQx4GrBfGa4uCnAEhQuRgPwCBtwK+kCNFgjh6QlFYgGO7baJ2CxIioSDpwqNggWCGDVVGphly3BkOpXDrKfNm/4AhACH5BAkKAAAALAAAAAAQABAAAAVgICCOZGmeqEAMRTEQwskYbV0Yx7kYSIzQhtgoBxCKBDQCIOcoLBimRiFhSABYU5gIgW01pLUBYkRItAYAqrlhYiwKjiWAcDMWY8QjsCf4DewiBzQ2N1AmKlgvgCiMjSQhACH5BAkKAAAALAAAAAAQABAAAAVfICCOZGmeqEgUxUAIpkA0AMKyxkEiSZEIsJqhYAg+boUFSTAkiBiNHks3sg1ILAfBiS10gyqCg0UaFBCkwy3RYKiIYMAC+RAxiQgYsJdAjw5DN2gILzEEZgVcKYuMJiEAOwAAAAAAAAAAAA==" />',
    styles: {},
    complete: function(value) { return value; }
  };

})(jQuery);

/*
* jQuery Mobile v1.4.5
* http://jquerymobile.com
*
* Copyright 2010, 2014 jQuery Foundation, Inc. and other contributors
* Released under the MIT license.
* http://jquery.org/license
*
*/

(function ( root, doc, factory ) {
  if ( typeof define === "function" && define.amd ) {
    // AMD. Register as an anonymous module.
    define( [ "jquery" ], function ( $ ) {
      factory( $, root, doc );
      return $.mobile;
    });
  } else {
    // Browser globals
    factory( root.jQuery, root, doc );
  }
}( this, document, function ( jQuery, window, document, undefined ) { (function( $, undefined ) {
    $.extend( $.support, {
      orientation: "orientation" in window && "onorientationchange" in window
    });
  }( jQuery ));


  // throttled resize event
  (function( $ ) {
    $.event.special.throttledresize = {
      setup: function() {
        $( this ).bind( "resize", handler );
      },
      teardown: function() {
        $( this ).unbind( "resize", handler );
      }
    };

    var throttle = 250,
      handler = function() {
        curr = ( new Date() ).getTime();
        diff = curr - lastCall;

        if ( diff >= throttle ) {

          lastCall = curr;
          $( this ).trigger( "throttledresize" );

        } else {

          if ( heldCall ) {
            clearTimeout( heldCall );
          }

          // Promise a held call will still execute
          heldCall = setTimeout( handler, throttle - diff );
        }
      },
      lastCall = 0,
      heldCall,
      curr,
      diff;
  })( jQuery );


(function( $, window ) {
  var win = $( window ),
    event_name = "orientationchange",
    get_orientation,
    last_orientation,
    initial_orientation_is_landscape,
    initial_orientation_is_default,
    portrait_map = { "0": true, "180": true },
    ww, wh, landscape_threshold;

  // It seems that some device/browser vendors use window.orientation values 0 and 180 to
  // denote the "default" orientation. For iOS devices, and most other smart-phones tested,
  // the default orientation is always "portrait", but in some Android and RIM based tablets,
  // the default orientation is "landscape". The following code attempts to use the window
  // dimensions to figure out what the current orientation is, and then makes adjustments
  // to the to the portrait_map if necessary, so that we can properly decode the
  // window.orientation value whenever get_orientation() is called.
  //
  // Note that we used to use a media query to figure out what the orientation the browser
  // thinks it is in:
  //
  //     initial_orientation_is_landscape = $.mobile.media("all and (orientation: landscape)");
  //
  // but there was an iPhone/iPod Touch bug beginning with iOS 4.2, up through iOS 5.1,
  // where the browser *ALWAYS* applied the landscape media query. This bug does not
  // happen on iPad.

  if ( $.support.orientation ) {

    // Check the window width and height to figure out what the current orientation
    // of the device is at this moment. Note that we've initialized the portrait map
    // values to 0 and 180, *AND* we purposely check for landscape so that if we guess
    // wrong, , we default to the assumption that portrait is the default orientation.
    // We use a threshold check below because on some platforms like iOS, the iPhone
    // form-factor can report a larger width than height if the user turns on the
    // developer console. The actual threshold value is somewhat arbitrary, we just
    // need to make sure it is large enough to exclude the developer console case.

    ww = window.innerWidth || win.width();
    wh = window.innerHeight || win.height();
    landscape_threshold = 50;

    initial_orientation_is_landscape = ww > wh && ( ww - wh ) > landscape_threshold;

    // Now check to see if the current window.orientation is 0 or 180.
    initial_orientation_is_default = portrait_map[ window.orientation ];

    // If the initial orientation is landscape, but window.orientation reports 0 or 180, *OR*
    // if the initial orientation is portrait, but window.orientation reports 90 or -90, we
    // need to flip our portrait_map values because landscape is the default orientation for
    // this device/browser.
    if ( ( initial_orientation_is_landscape && initial_orientation_is_default ) || ( !initial_orientation_is_landscape && !initial_orientation_is_default ) ) {
      portrait_map = { "-90": true, "90": true };
    }
  }

  $.event.special.orientationchange = $.extend( {}, $.event.special.orientationchange, {
    setup: function() {
      // If the event is supported natively, return false so that jQuery
      // will bind to the event using DOM methods.
      if ( $.support.orientation && !$.event.special.orientationchange.disabled ) {
        return false;
      }

      // Get the current orientation to avoid initial double-triggering.
      last_orientation = get_orientation();

      // Because the orientationchange event doesn't exist, simulate the
      // event by testing window dimensions on resize.
      win.bind( "throttledresize", handler );
    },
    teardown: function() {
      // If the event is not supported natively, return false so that
      // jQuery will unbind the event using DOM methods.
      if ( $.support.orientation && !$.event.special.orientationchange.disabled ) {
        return false;
      }

      // Because the orientationchange event doesn't exist, unbind the
      // resize event handler.
      win.unbind( "throttledresize", handler );
    },
    add: function( handleObj ) {
      // Save a reference to the bound event handler.
      var old_handler = handleObj.handler;

      handleObj.handler = function( event ) {
        // Modify event object, adding the .orientation property.
        event.orientation = get_orientation();

        // Call the originally-bound event handler and return its result.
        return old_handler.apply( this, arguments );
      };
    }
  });

  // If the event is not supported natively, this handler will be bound to
  // the window resize event to simulate the orientationchange event.
  function handler() {
    // Get the current orientation.
    var orientation = get_orientation();

    if ( orientation !== last_orientation ) {
      // The orientation has changed, so trigger the orientationchange event.
      last_orientation = orientation;
      win.trigger( event_name );
    }
  }

  // Get the current page orientation. This method is exposed publicly, should it
  // be needed, as jQuery.event.special.orientationchange.orientation()
  $.event.special.orientationchange.orientation = get_orientation = function() {
    var isPortrait = true, elem = document.documentElement;

    // prefer window orientation to the calculation based on screensize as
    // the actual screen resize takes place before or after the orientation change event
    // has been fired depending on implementation (eg android 2.3 is before, iphone after).
    // More testing is required to determine if a more reliable method of determining the new screensize
    // is possible when orientationchange is fired. (eg, use media queries + element + opacity)
    if ( $.support.orientation ) {
      // if the window orientation registers as 0 or 180 degrees report
      // portrait, otherwise landscape
      isPortrait = portrait_map[ window.orientation ];
    } else {
      isPortrait = elem && elem.clientWidth / elem.clientHeight < 1.1;
    }

    return isPortrait ? "portrait" : "landscape";
  };

  $.fn[ event_name ] = function( fn ) {
    return fn ? this.bind( event_name, fn ) : this.trigger( event_name );
  };

  // jQuery < 1.8
  if ( $.attrFn ) {
    $.attrFn[ event_name ] = true;
  }

}( jQuery, this ));


(function( $ ) {
  $.mobile = {};
}( jQuery ));

(function( $, window, undefined ) {
  $.extend( $.mobile, {

    // Version of the jQuery Mobile Framework
    version: "1.4.5",

    // Deprecated and no longer used in 1.4 remove in 1.5
    // Define the url parameter used for referencing widget-generated sub-pages.
    // Translates to example.html&ui-page=subpageIdentifier
    // hash segment before &ui-page= is used to make Ajax request
    subPageUrlKey: "ui-page",

    hideUrlBar: true,

    // Keepnative Selector
    keepNative: ":jqmData(role='none'), :jqmData(role='nojs')",

    // Deprecated in 1.4 remove in 1.5
    // Class assigned to page currently in view, and during transitions
    activePageClass: "ui-page-active",

    // Deprecated in 1.4 remove in 1.5
    // Class used for "active" button state, from CSS framework
    activeBtnClass: "ui-btn-active",

    // Deprecated in 1.4 remove in 1.5
    // Class used for "focus" form element state, from CSS framework
    focusClass: "ui-focus",

    // Automatically handle clicks and form submissions through Ajax, when same-domain
    ajaxEnabled: true,

    // Automatically load and show pages based on location.hash
    hashListeningEnabled: true,

    // disable to prevent jquery from bothering with links
    linkBindingEnabled: true,

    // Set default page transition - 'none' for no transitions
    defaultPageTransition: "fade",

    // Set maximum window width for transitions to apply - 'false' for no limit
    maxTransitionWidth: false,

    // Minimum scroll distance that will be remembered when returning to a page
    // Deprecated remove in 1.5
    minScrollBack: 0,

    // Set default dialog transition - 'none' for no transitions
    defaultDialogTransition: "pop",

    // Error response message - appears when an Ajax page request fails
    pageLoadErrorMessage: "Error Loading Page",

    // For error messages, which theme does the box use?
    pageLoadErrorMessageTheme: "a",

    // replace calls to window.history.back with phonegaps navigation helper
    // where it is provided on the window object
    phonegapNavigationEnabled: false,

    //automatically initialize the DOM when it's ready
    autoInitializePage: true,

    pushStateEnabled: true,

    // allows users to opt in to ignoring content by marking a parent element as
    // data-ignored
    ignoreContentEnabled: false,

    buttonMarkup: {
      hoverDelay: 200
    },

    // disable the alteration of the dynamic base tag or links in the case
    // that a dynamic base tag isn't supported
    dynamicBaseEnabled: true,

    // default the property to remove dependency on assignment in init module
    pageContainer: $(),

    //enable cross-domain page support
    allowCrossDomainPages: false,

    dialogHashKey: "&ui-state=dialog"
  });
})( jQuery, this );

/*!
 * jQuery UI Core c0ab71056b936627e8a7821f03c044aec6280a40
 * http://jqueryui.com
 *
 * Copyright 2013 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/category/ui-core/
 */
(function( $, undefined ) {

var uuid = 0,
  runiqueId = /^ui-id-\d+$/;

// $.ui might exist from components with no dependencies, e.g., $.ui.position
$.ui = $.ui || {};

$.extend( $.ui, {
  version: "c0ab71056b936627e8a7821f03c044aec6280a40",

  keyCode: {
    BACKSPACE: 8,
    COMMA: 188,
    DELETE: 46,
    DOWN: 40,
    END: 35,
    ENTER: 13,
    ESCAPE: 27,
    HOME: 36,
    LEFT: 37,
    PAGE_DOWN: 34,
    PAGE_UP: 33,
    PERIOD: 190,
    RIGHT: 39,
    SPACE: 32,
    TAB: 9,
    UP: 38
  }
});

// plugins
$.fn.extend({
  focus: (function( orig ) {
    return function( delay, fn ) {
      return typeof delay === "number" ?
        this.each(function() {
          var elem = this;
          setTimeout(function() {
            $( elem ).focus();
            if ( fn ) {
              fn.call( elem );
            }
          }, delay );
        }) :
        orig.apply( this, arguments );
    };
  })( $.fn.focus ),

  scrollParent: function() {
    var scrollParent;
    if (($.ui.ie && (/(static|relative)/).test(this.css("position"))) || (/absolute/).test(this.css("position"))) {
      scrollParent = this.parents().filter(function() {
        return (/(relative|absolute|fixed)/).test($.css(this,"position")) && (/(auto|scroll)/).test($.css(this,"overflow")+$.css(this,"overflow-y")+$.css(this,"overflow-x"));
      }).eq(0);
    } else {
      scrollParent = this.parents().filter(function() {
        return (/(auto|scroll)/).test($.css(this,"overflow")+$.css(this,"overflow-y")+$.css(this,"overflow-x"));
      }).eq(0);
    }

    return ( /fixed/ ).test( this.css( "position") ) || !scrollParent.length ? $( this[ 0 ].ownerDocument || document ) : scrollParent;
  },

  uniqueId: function() {
    return this.each(function() {
      if ( !this.id ) {
        this.id = "ui-id-" + (++uuid);
      }
    });
  },

  removeUniqueId: function() {
    return this.each(function() {
      if ( runiqueId.test( this.id ) ) {
        $( this ).removeAttr( "id" );
      }
    });
  }
});

// selectors
function focusable( element, isTabIndexNotNaN ) {
  var map, mapName, img,
    nodeName = element.nodeName.toLowerCase();
  if ( "area" === nodeName ) {
    map = element.parentNode;
    mapName = map.name;
    if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
      return false;
    }
    img = $( "img[usemap=#" + mapName + "]" )[0];
    return !!img && visible( img );
  }
  return ( /input|select|textarea|button|object/.test( nodeName ) ?
    !element.disabled :
    "a" === nodeName ?
      element.href || isTabIndexNotNaN :
      isTabIndexNotNaN) &&
    // the element and all of its ancestors must be visible
    visible( element );
}

function visible( element ) {
  return $.expr.filters.visible( element ) &&
    !$( element ).parents().addBack().filter(function() {
      return $.css( this, "visibility" ) === "hidden";
    }).length;
}

$.extend( $.expr[ ":" ], {
  data: $.expr.createPseudo ?
    $.expr.createPseudo(function( dataName ) {
      return function( elem ) {
        return !!$.data( elem, dataName );
      };
    }) :
    // support: jQuery <1.8
    function( elem, i, match ) {
      return !!$.data( elem, match[ 3 ] );
    },

  focusable: function( element ) {
    return focusable( element, !isNaN( $.attr( element, "tabindex" ) ) );
  },

  tabbable: function( element ) {
    var tabIndex = $.attr( element, "tabindex" ),
      isTabIndexNaN = isNaN( tabIndex );
    return ( isTabIndexNaN || tabIndex >= 0 ) && focusable( element, !isTabIndexNaN );
  }
});

// support: jQuery <1.8
if ( !$( "<a>" ).outerWidth( 1 ).jquery ) {
  $.each( [ "Width", "Height" ], function( i, name ) {
    var side = name === "Width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ],
      type = name.toLowerCase(),
      orig = {
        innerWidth: $.fn.innerWidth,
        innerHeight: $.fn.innerHeight,
        outerWidth: $.fn.outerWidth,
        outerHeight: $.fn.outerHeight
      };

    function reduce( elem, size, border, margin ) {
      $.each( side, function() {
        size -= parseFloat( $.css( elem, "padding" + this ) ) || 0;
        if ( border ) {
          size -= parseFloat( $.css( elem, "border" + this + "Width" ) ) || 0;
        }
        if ( margin ) {
          size -= parseFloat( $.css( elem, "margin" + this ) ) || 0;
        }
      });
      return size;
    }

    $.fn[ "inner" + name ] = function( size ) {
      if ( size === undefined ) {
        return orig[ "inner" + name ].call( this );
      }

      return this.each(function() {
        $( this ).css( type, reduce( this, size ) + "px" );
      });
    };

    $.fn[ "outer" + name] = function( size, margin ) {
      if ( typeof size !== "number" ) {
        return orig[ "outer" + name ].call( this, size );
      }

      return this.each(function() {
        $( this).css( type, reduce( this, size, true, margin ) + "px" );
      });
    };
  });
}

// support: jQuery <1.8
if ( !$.fn.addBack ) {
  $.fn.addBack = function( selector ) {
    return this.add( selector == null ?
      this.prevObject : this.prevObject.filter( selector )
    );
  };
}

// support: jQuery 1.6.1, 1.6.2 (http://bugs.jquery.com/ticket/9413)
if ( $( "<a>" ).data( "a-b", "a" ).removeData( "a-b" ).data( "a-b" ) ) {
  $.fn.removeData = (function( removeData ) {
    return function( key ) {
      if ( arguments.length ) {
        return removeData.call( this, $.camelCase( key ) );
      } else {
        return removeData.call( this );
      }
    };
  })( $.fn.removeData );
}





// deprecated
$.ui.ie = !!/msie [\w.]+/.exec( navigator.userAgent.toLowerCase() );

$.support.selectstart = "onselectstart" in document.createElement( "div" );
$.fn.extend({
  disableSelection: function() {
    return this.bind( ( $.support.selectstart ? "selectstart" : "mousedown" ) +
      ".ui-disableSelection", function( event ) {
        event.preventDefault();
      });
  },

  enableSelection: function() {
    return this.unbind( ".ui-disableSelection" );
  },

  zIndex: function( zIndex ) {
    if ( zIndex !== undefined ) {
      return this.css( "zIndex", zIndex );
    }

    if ( this.length ) {
      var elem = $( this[ 0 ] ), position, value;
      while ( elem.length && elem[ 0 ] !== document ) {
        // Ignore z-index if position is set to a value where z-index is ignored by the browser
        // This makes behavior of this function consistent across browsers
        // WebKit always returns auto if the element is positioned
        position = elem.css( "position" );
        if ( position === "absolute" || position === "relative" || position === "fixed" ) {
          // IE returns 0 when zIndex is not specified
          // other browsers return a string
          // we ignore the case of nested elements with an explicit value of 0
          // <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
          value = parseInt( elem.css( "zIndex" ), 10 );
          if ( !isNaN( value ) && value !== 0 ) {
            return value;
          }
        }
        elem = elem.parent();
      }
    }

    return 0;
  }
});

// $.ui.plugin is deprecated. Use $.widget() extensions instead.
$.ui.plugin = {
  add: function( module, option, set ) {
    var i,
      proto = $.ui[ module ].prototype;
    for ( i in set ) {
      proto.plugins[ i ] = proto.plugins[ i ] || [];
      proto.plugins[ i ].push( [ option, set[ i ] ] );
    }
  },
  call: function( instance, name, args, allowDisconnected ) {
    var i,
      set = instance.plugins[ name ];

    if ( !set ) {
      return;
    }

    if ( !allowDisconnected && ( !instance.element[ 0 ].parentNode || instance.element[ 0 ].parentNode.nodeType === 11 ) ) {
      return;
    }

    for ( i = 0; i < set.length; i++ ) {
      if ( instance.options[ set[ i ][ 0 ] ] ) {
        set[ i ][ 1 ].apply( instance.element, args );
      }
    }
  }
};

})( jQuery );

(function( $, window, undefined ) {

  // Subtract the height of external toolbars from the page height, if the page does not have
  // internal toolbars of the same type. We take care to use the widget options if we find a
  // widget instance and the element's data-attributes otherwise.
  var compensateToolbars = function( page, desiredHeight ) {
    var pageParent = page.parent(),
      toolbarsAffectingHeight = [],

      // We use this function to filter fixed toolbars with option updatePagePadding set to
      // true (which is the default) from our height subtraction, because fixed toolbars with
      // option updatePagePadding set to true compensate for their presence by adding padding
      // to the active page. We want to avoid double-counting by also subtracting their
      // height from the desired page height.
      noPadders = function() {
        var theElement = $( this ),
          widgetOptions = $.mobile.toolbar && theElement.data( "mobile-toolbar" ) ?
            theElement.toolbar( "option" ) : {
              position: theElement.attr( "data-" + $.mobile.ns + "position" ),
              updatePagePadding: ( theElement.attr( "data-" + $.mobile.ns +
                "update-page-padding" ) !== false )
            };

        return !( widgetOptions.position === "fixed" &&
          widgetOptions.updatePagePadding === true );
      },
      externalHeaders = pageParent.children( ":jqmData(role='header')" ).filter( noPadders ),
      internalHeaders = page.children( ":jqmData(role='header')" ),
      externalFooters = pageParent.children( ":jqmData(role='footer')" ).filter( noPadders ),
      internalFooters = page.children( ":jqmData(role='footer')" );

    // If we have no internal headers, but we do have external headers, then their height
    // reduces the page height
    if ( internalHeaders.length === 0 && externalHeaders.length > 0 ) {
      toolbarsAffectingHeight = toolbarsAffectingHeight.concat( externalHeaders.toArray() );
    }

    // If we have no internal footers, but we do have external footers, then their height
    // reduces the page height
    if ( internalFooters.length === 0 && externalFooters.length > 0 ) {
      toolbarsAffectingHeight = toolbarsAffectingHeight.concat( externalFooters.toArray() );
    }

    $.each( toolbarsAffectingHeight, function( index, value ) {
      desiredHeight -= $( value ).outerHeight();
    });

    // Height must be at least zero
    return Math.max( 0, desiredHeight );
  };

  $.extend( $.mobile, {
    // define the window and the document objects
    window: $( window ),
    document: $( document ),

    // TODO: Remove and use $.ui.keyCode directly
    keyCode: $.ui.keyCode,

    // Place to store various widget extensions
    behaviors: {},

    // Scroll page vertically: scroll to 0 to hide iOS address bar, or pass a Y value
    silentScroll: function( ypos ) {
      if ( $.type( ypos ) !== "number" ) {
        ypos = $.mobile.defaultHomeScroll;
      }

      // prevent scrollstart and scrollstop events
      $.event.special.scrollstart.enabled = false;

      setTimeout(function() {
        window.scrollTo( 0, ypos );
        $.mobile.document.trigger( "silentscroll", { x: 0, y: ypos });
      }, 20 );

      setTimeout(function() {
        $.event.special.scrollstart.enabled = true;
      }, 150 );
    },

    getClosestBaseUrl: function( ele )  {
      // Find the closest page and extract out its url.
      var url = $( ele ).closest( ".ui-page" ).jqmData( "url" ),
        base = $.mobile.path.documentBase.hrefNoHash;

      if ( !$.mobile.dynamicBaseEnabled || !url || !$.mobile.path.isPath( url ) ) {
        url = base;
      }

      return $.mobile.path.makeUrlAbsolute( url, base );
    },
    removeActiveLinkClass: function( forceRemoval ) {
      if ( !!$.mobile.activeClickedLink &&
        ( !$.mobile.activeClickedLink.closest( "." + $.mobile.activePageClass ).length ||
          forceRemoval ) ) {

        $.mobile.activeClickedLink.removeClass( $.mobile.activeBtnClass );
      }
      $.mobile.activeClickedLink = null;
    },

    // DEPRECATED in 1.4
    // Find the closest parent with a theme class on it. Note that
    // we are not using $.fn.closest() on purpose here because this
    // method gets called quite a bit and we need it to be as fast
    // as possible.
    getInheritedTheme: function( el, defaultTheme ) {
      var e = el[ 0 ],
        ltr = "",
        re = /ui-(bar|body|overlay)-([a-z])\b/,
        c, m;
      while ( e ) {
        c = e.className || "";
        if ( c && ( m = re.exec( c ) ) && ( ltr = m[ 2 ] ) ) {
          // We found a parent with a theme class
          // on it so bail from this loop.
          break;
        }

        e = e.parentNode;
      }
      // Return the theme letter we found, if none, return the
      // specified default.
      return ltr || defaultTheme || "a";
    },

    enhanceable: function( elements ) {
      return this.haveParents( elements, "enhance" );
    },

    hijackable: function( elements ) {
      return this.haveParents( elements, "ajax" );
    },

    haveParents: function( elements, attr ) {
      if ( !$.mobile.ignoreContentEnabled ) {
        return elements;
      }

      var count = elements.length,
        $newSet = $(),
        e, $element, excluded,
        i, c;

      for ( i = 0; i < count; i++ ) {
        $element = elements.eq( i );
        excluded = false;
        e = elements[ i ];

        while ( e ) {
          c = e.getAttribute ? e.getAttribute( "data-" + $.mobile.ns + attr ) : "";

          if ( c === "false" ) {
            excluded = true;
            break;
          }

          e = e.parentNode;
        }

        if ( !excluded ) {
          $newSet = $newSet.add( $element );
        }
      }

      return $newSet;
    },

    getScreenHeight: function() {
      // Native innerHeight returns more accurate value for this across platforms,
      // jQuery version is here as a normalized fallback for platforms like Symbian
      return window.innerHeight || $.mobile.window.height();
    },

    //simply set the active page's minimum height to screen height, depending on orientation
    resetActivePageHeight: function( height ) {
      var page = $( "." + $.mobile.activePageClass ),
        pageHeight = page.height(),
        pageOuterHeight = page.outerHeight( true );

      height = compensateToolbars( page,
        ( typeof height === "number" ) ? height : $.mobile.getScreenHeight() );

      // Remove any previous min-height setting
      page.css( "min-height", "" );

      // Set the minimum height only if the height as determined by CSS is insufficient
      if ( page.height() < height ) {
        page.css( "min-height", height - ( pageOuterHeight - pageHeight ) );
      }
    },

    loading: function() {
      // If this is the first call to this function, instantiate a loader widget
      var loader = this.loading._widget || $( $.mobile.loader.prototype.defaultHtml ).loader(),

        // Call the appropriate method on the loader
        returnValue = loader.loader.apply( loader, arguments );

      // Make sure the loader is retained for future calls to this function.
      this.loading._widget = loader;

      return returnValue;
    }
  });

  $.addDependents = function( elem, newDependents ) {
    var $elem = $( elem ),
      dependents = $elem.jqmData( "dependents" ) || $();

    $elem.jqmData( "dependents", $( dependents ).add( newDependents ) );
  };

  // plugins
  $.fn.extend({
    removeWithDependents: function() {
      $.removeWithDependents( this );
    },

    // Enhance child elements
    enhanceWithin: function() {
      var index,
        widgetElements = {},
        keepNative = $.mobile.page.prototype.keepNativeSelector(),
        that = this;

      // Add no js class to elements
      if ( $.mobile.nojs ) {
        $.mobile.nojs( this );
      }

      // Bind links for ajax nav
      if ( $.mobile.links ) {
        $.mobile.links( this );
      }

      // Degrade inputs for styleing
      if ( $.mobile.degradeInputsWithin ) {
        $.mobile.degradeInputsWithin( this );
      }

      // Run buttonmarkup
      if ( $.fn.buttonMarkup ) {
        this.find( $.fn.buttonMarkup.initSelector ).not( keepNative )
        .jqmEnhanceable().buttonMarkup();
      }

      // Add classes for fieldContain
      if ( $.fn.fieldcontain ) {
        this.find( ":jqmData(role='fieldcontain')" ).not( keepNative )
        .jqmEnhanceable().fieldcontain();
      }

      // Enhance widgets
      $.each( $.mobile.widgets, function( name, constructor ) {

        // If initSelector not false find elements
        if ( constructor.initSelector ) {

          // Filter elements that should not be enhanced based on parents
          var elements = $.mobile.enhanceable( that.find( constructor.initSelector ) );

          // If any matching elements remain filter ones with keepNativeSelector
          if ( elements.length > 0 ) {

            // $.mobile.page.prototype.keepNativeSelector is deprecated this is just for backcompat
            // Switch to $.mobile.keepNative in 1.5 which is just a value not a function
            elements = elements.not( keepNative );
          }

          // Enhance whatever is left
          if ( elements.length > 0 ) {
            widgetElements[ constructor.prototype.widgetName ] = elements;
          }
        }
      });

      for ( index in widgetElements ) {
        widgetElements[ index ][ index ]();
      }

      return this;
    },

    addDependents: function( newDependents ) {
      $.addDependents( this, newDependents );
    },

    // note that this helper doesn't attempt to handle the callback
    // or setting of an html element's text, its only purpose is
    // to return the html encoded version of the text in all cases. (thus the name)
    getEncodedText: function() {
      return $( "<a>" ).text( this.text() ).html();
    },

    // fluent helper function for the mobile namespaced equivalent
    jqmEnhanceable: function() {
      return $.mobile.enhanceable( this );
    },

    jqmHijackable: function() {
      return $.mobile.hijackable( this );
    }
  });

  $.removeWithDependents = function( nativeElement ) {
    var element = $( nativeElement );

    ( element.jqmData( "dependents" ) || $() ).remove();
    element.remove();
  };
  $.addDependents = function( nativeElement, newDependents ) {
    var element = $( nativeElement ),
      dependents = element.jqmData( "dependents" ) || $();

    element.jqmData( "dependents", $( dependents ).add( newDependents ) );
  };

  $.find.matches = function( expr, set ) {
    return $.find( expr, null, null, set );
  };

  $.find.matchesSelector = function( node, expr ) {
    return $.find( expr, null, null, [ node ] ).length > 0;
  };

})( jQuery, this );

(function( $, window, undefined ) {
  var nsNormalizeDict = {},
    oldFind = $.find,
    rbrace = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/,
    jqmDataRE = /:jqmData\(([^)]*)\)/g;

  $.extend( $.mobile, {

    // Namespace used framework-wide for data-attrs. Default is no namespace

    ns: "",

    // Retrieve an attribute from an element and perform some massaging of the value

    getAttribute: function( element, key ) {
      var data;

      element = element.jquery ? element[0] : element;

      if ( element && element.getAttribute ) {
        data = element.getAttribute( "data-" + $.mobile.ns + key );
      }

      // Copied from core's src/data.js:dataAttr()
      // Convert from a string to a proper data type
      try {
        data = data === "true" ? true :
          data === "false" ? false :
          data === "null" ? null :
          // Only convert to a number if it doesn't change the string
          +data + "" === data ? +data :
          rbrace.test( data ) ? JSON.parse( data ) :
          data;
      } catch( err ) {}

      return data;
    },

    // Expose our cache for testing purposes.
    nsNormalizeDict: nsNormalizeDict,

    // Take a data attribute property, prepend the namespace
    // and then camel case the attribute string. Add the result
    // to our nsNormalizeDict so we don't have to do this again.
    nsNormalize: function( prop ) {
      return nsNormalizeDict[ prop ] ||
        ( nsNormalizeDict[ prop ] = $.camelCase( $.mobile.ns + prop ) );
    },

    // Find the closest javascript page element to gather settings data jsperf test
    // http://jsperf.com/single-complex-selector-vs-many-complex-selectors/edit
    // possibly naive, but it shows that the parsing overhead for *just* the page selector vs
    // the page and dialog selector is negligable. This could probably be speed up by
    // doing a similar parent node traversal to the one found in the inherited theme code above
    closestPageData: function( $target ) {
      return $target
        .closest( ":jqmData(role='page'), :jqmData(role='dialog')" )
        .data( "mobile-page" );
    }

  });

  // Mobile version of data and removeData and hasData methods
  // ensures all data is set and retrieved using jQuery Mobile's data namespace
  $.fn.jqmData = function( prop, value ) {
    var result;
    if ( typeof prop !== "undefined" ) {
      if ( prop ) {
        prop = $.mobile.nsNormalize( prop );
      }

      // undefined is permitted as an explicit input for the second param
      // in this case it returns the value and does not set it to undefined
      if ( arguments.length < 2 || value === undefined ) {
        result = this.data( prop );
      } else {
        result = this.data( prop, value );
      }
    }
    return result;
  };

  $.jqmData = function( elem, prop, value ) {
    var result;
    if ( typeof prop !== "undefined" ) {
      result = $.data( elem, prop ? $.mobile.nsNormalize( prop ) : prop, value );
    }
    return result;
  };

  $.fn.jqmRemoveData = function( prop ) {
    return this.removeData( $.mobile.nsNormalize( prop ) );
  };

  $.jqmRemoveData = function( elem, prop ) {
    return $.removeData( elem, $.mobile.nsNormalize( prop ) );
  };

  $.find = function( selector, context, ret, extra ) {
    if ( selector.indexOf( ":jqmData" ) > -1 ) {
      selector = selector.replace( jqmDataRE, "[data-" + ( $.mobile.ns || "" ) + "$1]" );
    }

    return oldFind.call( this, selector, context, ret, extra );
  };

  $.extend( $.find, oldFind );

})( jQuery, this );


(function( $, undefined ) {

  /*! matchMedia() polyfill - Test a CSS media type/query in JS. Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas. Dual MIT/BSD license */
  window.matchMedia = window.matchMedia || (function( doc, undefined ) {

    var bool,
      docElem = doc.documentElement,
      refNode = docElem.firstElementChild || docElem.firstChild,
      // fakeBody required for <FF4 when executed in <head>
      fakeBody = doc.createElement( "body" ),
      div = doc.createElement( "div" );

    div.id = "mq-test-1";
    div.style.cssText = "position:absolute;top:-100em";
    fakeBody.style.background = "none";
    fakeBody.appendChild(div);

    return function(q){

      div.innerHTML = "&shy;<style media=\"" + q + "\"> #mq-test-1 { width: 42px; }</style>";

      docElem.insertBefore( fakeBody, refNode );
      bool = div.offsetWidth === 42;
      docElem.removeChild( fakeBody );

      return {
        matches: bool,
        media: q
      };

    };

  }( document ));

  // $.mobile.media uses matchMedia to return a boolean.
  $.mobile.media = function( q ) {
    return window.matchMedia( q ).matches;
  };

})(jQuery);

  (function( $, undefined ) {
    var support = {
      touch: "ontouchend" in document
    };

    $.mobile.support = $.mobile.support || {};
    $.extend( $.support, support );
    $.extend( $.mobile.support, support );
  }( jQuery ));

(function( $, undefined ) {

// thx Modernizr
function propExists( prop ) {
  var uc_prop = prop.charAt( 0 ).toUpperCase() + prop.substr( 1 ),
    props = ( prop + " " + vendors.join( uc_prop + " " ) + uc_prop ).split( " " ),
    v;

  for ( v in props ) {
    if ( fbCSS[ props[ v ] ] !== undefined ) {
      return true;
    }
  }
}

var fakeBody = $( "<body>" ).prependTo( "html" ),
  fbCSS = fakeBody[ 0 ].style,
  vendors = [ "Webkit", "Moz", "O" ],
  webos = "palmGetResource" in window, //only used to rule out scrollTop
  operamini = window.operamini && ({}).toString.call( window.operamini ) === "[object OperaMini]",
  bb = window.blackberry && !propExists( "-webkit-transform" ), //only used to rule out box shadow, as it's filled opaque on BB 5 and lower
  nokiaLTE7_3;

// inline SVG support test
function inlineSVG() {
  // Thanks Modernizr & Erik Dahlstrom
  var w = window,
    svg = !!w.document.createElementNS && !!w.document.createElementNS( "http://www.w3.org/2000/svg", "svg" ).createSVGRect && !( w.opera && navigator.userAgent.indexOf( "Chrome" ) === -1 ),
    support = function( data ) {
      if ( !( data && svg ) ) {
        $( "html" ).addClass( "ui-nosvg" );
      }
    },
    img = new w.Image();

  img.onerror = function() {
    support( false );
  };
  img.onload = function() {
    support( img.width === 1 && img.height === 1 );
  };
  img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
}

function transform3dTest() {
  var mqProp = "transform-3d",
    // Because the `translate3d` test below throws false positives in Android:
    ret = $.mobile.media( "(-" + vendors.join( "-" + mqProp + "),(-" ) + "-" + mqProp + "),(" + mqProp + ")" ),
    el, transforms, t;

  if ( ret ) {
    return !!ret;
  }

  el = document.createElement( "div" );
  transforms = {
    // We’re omitting Opera for the time being; MS uses unprefixed.
    "MozTransform": "-moz-transform",
    "transform": "transform"
  };

  fakeBody.append( el );

  for ( t in transforms ) {
    if ( el.style[ t ] !== undefined ) {
      el.style[ t ] = "translate3d( 100px, 1px, 1px )";
      ret = window.getComputedStyle( el ).getPropertyValue( transforms[ t ] );
    }
  }
  return ( !!ret && ret !== "none" );
}

// Test for dynamic-updating base tag support ( allows us to avoid href,src attr rewriting )
function baseTagTest() {
  var fauxBase = location.protocol + "//" + location.host + location.pathname + "ui-dir/",
    base = $( "head base" ),
    fauxEle = null,
    href = "",
    link, rebase;

  if ( !base.length ) {
    base = fauxEle = $( "<base>", { "href": fauxBase }).appendTo( "head" );
  } else {
    href = base.attr( "href" );
  }

  link = $( "<a href='testurl' />" ).prependTo( fakeBody );
  rebase = link[ 0 ].href;
  base[ 0 ].href = href || location.pathname;

  if ( fauxEle ) {
    fauxEle.remove();
  }
  return rebase.indexOf( fauxBase ) === 0;
}

// Thanks Modernizr
function cssPointerEventsTest() {
  var element = document.createElement( "x" ),
    documentElement = document.documentElement,
    getComputedStyle = window.getComputedStyle,
    supports;

  if ( !( "pointerEvents" in element.style ) ) {
    return false;
  }

  element.style.pointerEvents = "auto";
  element.style.pointerEvents = "x";
  documentElement.appendChild( element );
  supports = getComputedStyle &&
  getComputedStyle( element, "" ).pointerEvents === "auto";
  documentElement.removeChild( element );
  return !!supports;
}

function boundingRect() {
  var div = document.createElement( "div" );
  return typeof div.getBoundingClientRect !== "undefined";
}

// non-UA-based IE version check by James Padolsey, modified by jdalton - from http://gist.github.com/527683
// allows for inclusion of IE 6+, including Windows Mobile 7
$.extend( $.mobile, { browser: {} } );
$.mobile.browser.oldIE = (function() {
  var v = 3,
    div = document.createElement( "div" ),
    a = div.all || [];

  do {
    div.innerHTML = "<!--[if gt IE " + ( ++v ) + "]><br><![endif]-->";
  } while( a[0] );

  return v > 4 ? v : !v;
})();

function fixedPosition() {
  var w = window,
    ua = navigator.userAgent,
    platform = navigator.platform,
    // Rendering engine is Webkit, and capture major version
    wkmatch = ua.match( /AppleWebKit\/([0-9]+)/ ),
    wkversion = !!wkmatch && wkmatch[ 1 ],
    ffmatch = ua.match( /Fennec\/([0-9]+)/ ),
    ffversion = !!ffmatch && ffmatch[ 1 ],
    operammobilematch = ua.match( /Opera Mobi\/([0-9]+)/ ),
    omversion = !!operammobilematch && operammobilematch[ 1 ];

  if (
    // iOS 4.3 and older : Platform is iPhone/Pad/Touch and Webkit version is less than 534 (ios5)
    ( ( platform.indexOf( "iPhone" ) > -1 || platform.indexOf( "iPad" ) > -1  || platform.indexOf( "iPod" ) > -1 ) && wkversion && wkversion < 534 ) ||
    // Opera Mini
    ( w.operamini && ({}).toString.call( w.operamini ) === "[object OperaMini]" ) ||
    ( operammobilematch && omversion < 7458 ) ||
    //Android lte 2.1: Platform is Android and Webkit version is less than 533 (Android 2.2)
    ( ua.indexOf( "Android" ) > -1 && wkversion && wkversion < 533 ) ||
    // Firefox Mobile before 6.0 -
    ( ffversion && ffversion < 6 ) ||
    // WebOS less than 3
    ( "palmGetResource" in window && wkversion && wkversion < 534 ) ||
    // MeeGo
    ( ua.indexOf( "MeeGo" ) > -1 && ua.indexOf( "NokiaBrowser/8.5.0" ) > -1 ) ) {
    return false;
  }

  return true;
}

$.extend( $.support, {
  // Note, Chrome for iOS has an extremely quirky implementation of popstate.
  // We've chosen to take the shortest path to a bug fix here for issue #5426
  // See the following link for information about the regex chosen
  // https://developers.google.com/chrome/mobile/docs/user-agent#chrome_for_ios_user-agent
  pushState: "pushState" in history &&
    "replaceState" in history &&
    // When running inside a FF iframe, calling replaceState causes an error
    !( window.navigator.userAgent.indexOf( "Firefox" ) >= 0 && window.top !== window ) &&
    ( window.navigator.userAgent.search(/CriOS/) === -1 ),

  mediaquery: $.mobile.media( "only all" ),
  cssPseudoElement: !!propExists( "content" ),
  touchOverflow: !!propExists( "overflowScrolling" ),
  cssTransform3d: transform3dTest(),
  boxShadow: !!propExists( "boxShadow" ) && !bb,
  fixedPosition: fixedPosition(),
  scrollTop: ("pageXOffset" in window ||
    "scrollTop" in document.documentElement ||
    "scrollTop" in fakeBody[ 0 ]) && !webos && !operamini,

  dynamicBaseTag: baseTagTest(),
  cssPointerEvents: cssPointerEventsTest(),
  boundingRect: boundingRect(),
  inlineSVG: inlineSVG
});

fakeBody.remove();

// $.mobile.ajaxBlacklist is used to override ajaxEnabled on platforms that have known conflicts with hash history updates (BB5, Symbian)
// or that generally work better browsing in regular http for full page refreshes (Opera Mini)
// Note: This detection below is used as a last resort.
// We recommend only using these detection methods when all other more reliable/forward-looking approaches are not possible
nokiaLTE7_3 = (function() {

  var ua = window.navigator.userAgent;

  //The following is an attempt to match Nokia browsers that are running Symbian/s60, with webkit, version 7.3 or older
  return ua.indexOf( "Nokia" ) > -1 &&
      ( ua.indexOf( "Symbian/3" ) > -1 || ua.indexOf( "Series60/5" ) > -1 ) &&
      ua.indexOf( "AppleWebKit" ) > -1 &&
      ua.match( /(BrowserNG|NokiaBrowser)\/7\.[0-3]/ );
})();

// Support conditions that must be met in order to proceed
// default enhanced qualifications are media query support OR IE 7+

$.mobile.gradeA = function() {
  return ( ( $.support.mediaquery && $.support.cssPseudoElement ) || $.mobile.browser.oldIE && $.mobile.browser.oldIE >= 8 ) && ( $.support.boundingRect || $.fn.jquery.match(/1\.[0-7+]\.[0-9+]?/) !== null );
};

$.mobile.ajaxBlacklist =
      // BlackBerry browsers, pre-webkit
      window.blackberry && !window.WebKitPoint ||
      // Opera Mini
      operamini ||
      // Symbian webkits pre 7.3
      nokiaLTE7_3;

// Lastly, this workaround is the only way we've found so far to get pre 7.3 Symbian webkit devices
// to render the stylesheets when they're referenced before this script, as we'd recommend doing.
// This simply reappends the CSS in place, which for some reason makes it apply
if ( nokiaLTE7_3 ) {
  $(function() {
    $( "head link[rel='stylesheet']" ).attr( "rel", "alternate stylesheet" ).attr( "rel", "stylesheet" );
  });
}

// For ruling out shadows via css
if ( !$.support.boxShadow ) {
  $( "html" ).addClass( "ui-noboxshadow" );
}

})( jQuery );


}));