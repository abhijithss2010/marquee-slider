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

    // Handle jquery element
    _this.$scrollHandle = _this.$el.find('.ms-scroll');

    // Handle jquery element
    _this.$scrollNav = _this.$el.find('.ms-nav');

    // Track jquery element
    _this.$scrollTrack = _this.$el.find('.ms-track');

  };


  Plugin.prototype.buildBehaviour = function () {
    var _this = this;
    _this.setPluginVariables();

    _this.pageResizing();

    _this.scrollerWidthAdjust();

    _this.addScrollHandleDragging();

    // auto scroll 
    if (_this.settings.autoScroll) {
      _this.autoScroll();
    }

  };

  Plugin.prototype.addScrollHandleDragging = function (event) {
    var _this = this;

    _this.active = false;
    _this.currentX;
    _this.initialX;
    _this.xOffset = 0;

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
    
    var _this = this;
    console.log(_this.xOffset);
    var origEvent = event.originalEvent;
    
    if ($(event.target).is(_this.$scrollHandle)) {

      if (event.type === "touchstart") {
        _this.initialX = origEvent.touches[0].clientX - _this.xOffset;
      } else {
        _this.initialX = event.clientX - _this.xOffset;
      }
      _this.active = true;
      _this.isDragging = true;
    
    }

  };

  Plugin.prototype.drag = function (event) {
    
    var _this = this;
    console.log(_this.xOffset);
    var origEvent = event.originalEvent;

    if (_this.active) {

      // console.log((_this.navWidth - _this.scrollerWidth));

      event.preventDefault();

      if(_this.xOffset >= 0 && _this.xOffset < (_this.navWidth - _this.scrollerWidth)){
        if (event.type === "touchmove") {
          _this.currentX = origEvent.touches[0].clientX - _this.initialX;
        } else {
          _this.currentX = event.clientX - _this.initialX;
        }

        _this.xOffset = _this.scrollHandle(_this.currentX);
  
    
        _this.scrollTrack();
      } else {
        // console.log('else');
        _this.xOffset = 0;
        _this.currentNavXPos = 0;
      }

    }
  };

  Plugin.prototype.dragEnd = function (event) {
    
    var _this = this;
    console.log(_this.xOffset);

    _this.initialX = _this.currentX;

    _this.active = false;
    _this.isDragging = false;
    // _this.xOffset = 0;

  };

  Plugin.prototype.scrollHandle = function (xPos) {
    var _this = this;

    // _this.subI = 0;
    var movexPos = (xPos - 100 - _this.scrollerWidth);

    console.log(movexPos,(_this.navWidth/_this.visibleAreaWidth));

    if(xPos > (_this.visibleAreaWidth - _this.scrollerWidth - 100) && (_this.navWidth - _this.visibleAreaWidth) < movexPos){
      _this.setTranslate(-movexPos, 0, _this.$scrollNav);
    }

    _this.setTranslate(xPos, 0, _this.$scrollHandle);

    _this.currentNavXPos = xPos;

    return _this.currentNavXPos;

  };

  Plugin.prototype.scrollTrack = function () {
    var _this = this;
    var xPos = _this.currentNavXPos;
    var currentX = -((xPos / _this.navHeight) * _this.trackHeight);

    _this.setTranslate(currentX, 0, _this.$scrollTrack);
  };

  Plugin.prototype.autoScroll = function () {
    var _this = this;

    _this.currentNavXPos = 0;
    _this.animSet = setInterval(_this.scrollAnimation.bind(_this), 1000 / 60);

  };

  Plugin.prototype.scrollAnimation = function () {
    var _this = this;

    if (!_this.isDragging) {
      var xPos = (_this.currentNavXPos || 0) + 0.2;
      _this.scrollHandle(xPos);

      _this.scrollTrack();

      if (_this.currentNavXPos > (_this.navWidth - _this.scrollerWidth)) {
        _this.currentNavXPos = 0;
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

    _this.trackWidth =_this.$scrollTrack.width();
    _this.navWidth = _this.$scrollNav.width();
    _this.visibleAreaWidth = _this.$el.width();
    _this.trackHeight = _this.$scrollTrack.height();
    _this.navHeight = _this.$scrollNav.height();

    _this.visibleAreaImageRatio = _this.visibleAreaWidth / _this.trackHeight;
    _this.scrollerWidth = _this.visibleAreaImageRatio * _this.navHeight;

    _this.currentNavXPos = 0;

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
      _this.$scrollHandle.css('width', _this.scrollerWidth + 'px');
    }
  };


  $.fn.marqueeSlider = function (options) {

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