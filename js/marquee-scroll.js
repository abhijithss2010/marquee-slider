(function ($) {
  'use strict';

  var defaults = {
    autoScroll: true,
    customClass: ""
  };

  var fixedValues = {
    className: "marquee-slider"
  };

  function Plugin(element, options) {
    // Current  marqueeSlider element
    this.el = element;

    // Current jquery element
    this.$el = $(element);

    this.isDragging = false;

    // marqueeSlider settings
    this.settings = $.extend({}, defaults, options);

    this.init();

    return this;
  }

  Plugin.prototype.init = function () {
    var _this = this;

    _this.buildStructure();
    _this.buildBehaviour();
  };

  Plugin.prototype.buildStructure = function () {

    var template;
    var _this = this;
    var images = [];
    var templateInner = '';


    _this.$el.addClass(fixedValues.className);

    _this.settings.customClass.length && _this.$el.addClass(_this.settings.customClass);


    _this.$el.find('img').each(function () {
      templateInner += '<div class="item">' + $(this)[0].outerHTML + '</div>';
      $(this).remove();
    });

    template = '<div class="ms-track">' +
      templateInner +
      '</div>' +
      '<div class="ms-nav">' +
      templateInner +
      '<div class="ms-scroll">' +
      '</div>' +
      '</div>';

    _this.$el.append(template);

  };


  Plugin.prototype.buildBehaviour = function () {
    var _this = this;
    _this.setPluginVariables();

    _this.pageResizing();

    _this.scrollerWidthAdjust();

    //add dragging of scroller using interact js

    _this.addScrollHandleDragging();

    // interact(_this.$el.find('.ms-scroll')[0])
    //   .draggable({
    //     onmove: _this.dragMoveListener.bind(_this),
    //     onend: _this.dragEndListener.bind(_this),
    //     autoScroll: true,
    //     restrict: {
    //       restriction: 'parent',
    //       elementRect: {
    //         top: 0,
    //         left: 0,
    //         bottom: 1,
    //         right: 1
    //       }
    //     },
    //   });

    // auto scroll 
    if (_this.settings.autoScroll) {
      // _this.autoScroll();
    }

  };

  Plugin.prototype.addScrollHandleDragging = function (event) {
    var _this = this;

    _this.active = false;
    _this.currentX;
    _this.currentY;
    _this.initialX;
    _this.initialY;
    _this.xOffset = 0;
    _this.yOffset = 0;

    // bind all events 

    _this.$el.on("mousedown touchstart", ".ms-nav", function (event) {
      _this.dragStart(event);
    });

    _this.$el.on("mousemove touchmove", ".ms-nav", function (event) {
      _this.drag(event);
    });

    _this.$el.on("mouseup touchend", ".ms-nav", function (event) {
      _this.dragEnd(event);
    });
  };

  Plugin.prototype.dragStart = function (event) {

    console.log(event);
    var _this = this;
    var origEvent = event.originalEvent;

    if ($(event.target).is(_this.$el.find('.ms-scroll'))) {
      if (event.type === "touchstart") {
        _this.initialX = origEvent.touches[0].clientX - _this.xOffset;
        _this.initialY = origEvent.touches[0].clientY - _this.yOffset;
      } else {
        _this.initialX = event.clientX - _this.xOffset;
        _this.initialY = event.clientY - _this.yOffset;
      }
      _this.active = true;
    }

  };

  Plugin.prototype.drag = function (event) {
    var _this = this;
    var origEvent = event.originalEvent;

    if (_this.active) {

      event.preventDefault();

      if (event.type === "touchmove") {
        _this.currentX = origEvent.touches[0].clientX - _this.initialX;
        _this.currentY = origEvent.touches[0].clientY - _this.initialY;
      } else {
        _this.currentX = event.clientX - _this.initialX;
        _this.currentY = event.clientY - _this.initialY;
      }

      _this.xOffset = _this.currentX;
      _this.yOffset = _this.currentY;

      _this.setTranslate(_this.currentX, 0, _this.$el.find('.ms-scroll'));
    }
  };

  Plugin.prototype.dragEnd = function (event) {
    var _this = this;

    _this.initialX = _this.currentX;
    _this.initialY = _this.currentY;

    _this.active = false;
  };

  Plugin.prototype.dragMoveListener = function (event) {
    var _this = this;
    var xPos = event.dx;

    _this.isDragging = true;

    _this.scrollHandle(xPos);

    _this.scrollTrack();

  };

  Plugin.prototype.dragEndListener = function (event) {
    var _this = this;
    _this.isDragging = false;
    console.log('drag end');
  };

  Plugin.prototype.scrollHandle = function (dx) {
    var _this = this;
    var scrollHandle = _this.$el.find('.ms-scroll');
    var currentX = (parseFloat(scrollHandle.data('x')) || 0) + dx;

    _this.setTranslate(currentX, 0, scrollHandle);

    scrollHandle.data('x', currentX);

  };

  Plugin.prototype.scrollTrack = function () {
    var _this = this;
    var track = _this.$el.find('.ms-track');
    var scrollHandle = _this.$el.find('.ms-scroll');
    var xPos = scrollHandle.data('x');

    var currentX = -((xPos / _this.navHeight) * _this.trackHeight);

    _this.setTranslate(currentX, 0, track);

  };

  Plugin.prototype.autoScroll = function () {
    var _this = this;

    _this.$el.find('.ms-scroll').data('x', 0);

    _this.animSet = setInterval(_this.scrollAnimation.bind(_this), 1000 / 60);

  };

  Plugin.prototype.scrollAnimation = function () {
    var _this = this;
    var scrollHandle = _this.$el.find('.ms-scroll');

    if (!_this.isDragging) {
      _this.scrollHandle(0.2);

      _this.scrollTrack();

      // console.log(scrollHandle.data('x'), (_this.navWidth - _this.scrollerWidth))

      if (scrollHandle.data('x') > (_this.navWidth - _this.scrollerWidth)) {
        scrollHandle.data('x', 0);
      } else {

      }


    }

  };

  Plugin.prototype.setTranslate = function (xPos, yPos, $el) {
    $el.css({
      '-webkit-transform': 'translate(' + xPos + 'px, ' + yPos + 'px)',
      '-moz-transform': 'translate(' + xPos + 'px, ' + yPos + 'px)',
      '-ms-transform': 'translate(' + xPos + 'px, ' + yPos + 'px)',
      '-o-transform': 'translate(' + xPos + 'px, ' + yPos + 'px)',
      'transform': 'translate(' + xPos + 'px, ' + yPos + 'px)'
    });
  };

  Plugin.prototype.setPluginVariables = function () {
    var _this = this;

    _this.trackWidth = _this.$el.find('.ms-track').width();
    _this.navWidth = _this.$el.find('.ms-nav').width();
    _this.visibleAreaWidth = _this.$el.width();
    _this.trackHeight = _this.$el.find('.ms-track').height();
    _this.navHeight = _this.$el.find('.ms-nav').height();

    _this.visibleAreaImageRatio = _this.visibleAreaWidth / _this.trackHeight;

    _this.scrollerWidth = _this.visibleAreaImageRatio * _this.navHeight;

  };

  Plugin.prototype.pageResizing = function () {
    var _this = this;
    var resizeTimer;

    $(window).on('resize', function (e) {

      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {

        _this.setPluginVariables();
        _this.scrollerWidthAdjust();

      }, 250);

    });
  };

  Plugin.prototype.scrollerWidthAdjust = function () {
    var _this = this;
    if (_this.scrollerWidth) {
      _this.$el.find('.ms-scroll').css('width', _this.scrollerWidth + 'px');
    }
  };


  $.fn.marqueeSlider = function (options) {

    // This is the easiest way to have default options.

    // Greenify the collection based on the settings variable.

    return this.each(function () {
      if (!$.data(this, 'marqueeSlider')) {
        $.data(this, 'marqueeSlider', new Plugin(this, options));
      } else {
        try {
          $(this).data('marqueeSlider').init();
        } catch (err) {
          console.error('marqueeSlider has not initiated properly');
        }
      }
    });


  };

}(jQuery));