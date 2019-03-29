(function($) {
  "use strict";

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

    this.movexPos = 0.2;

    return this;
  }

  Plugin.prototype.init = function() {
    var _this = this;

    _this.buildStructure();
    _this.buildBehaviour();
  };

  Plugin.prototype.buildStructure = function() {
    var template;
    var _this = this;
    var images = [];
    var templateInner = "";
    var itemGroup = {};
    var groupConcated = "";
    var groupStyles = "<style>";

    _this.$el.addClass(fixedValues.className);

    _this.settings.customClass.length &&
      _this.$el.addClass(_this.settings.customClass);

    _this.$el.find("img").each(function() {
      templateInner += '<div class="item">' + $(this)[0].outerHTML + "</div>";

      if (!itemGroup.hasOwnProperty($(this).data("group"))) {
        itemGroup[$(this).data("group")] = "";
      }

      itemGroup[$(this).data("group")] +=
        '<li class="item">' + $(this)[0].outerHTML + "</li>";

      $(this).remove();
    });

    console.log(itemGroup);

    for (var groupName in itemGroup) {
      var randomColor = _this.getRandomColor()+'ba';

      groupStyles += '.item-group.\\'+randomColor+':before{ background:'+randomColor+'}';

      groupConcated +=
        '<ul class="item-group '+randomColor+' " data-group-name="' +
        groupName +
        '">' +
        itemGroup[groupName] +
        '</ul>';
    }

    groupStyles += '</style>';

    

    template =
      '<div class="ms-track">' +
      templateInner +
      "</div>" +
      '<div class="ms-nav">' +
      '<div class="ms-nav-items">' +
      groupConcated +
      "</div>" +
      '<div class="ms-scroll">' +
      "</div>" +
      "</div>";

    _this.$el.append(template);
    $('head').append(groupStyles);

    // Handle jquery element
    _this.$scrollHandle = _this.$el.find(".ms-scroll");

    // Handle jquery element
    _this.$scrollNav = _this.$el.find(".ms-nav");

    // Nav item Conatiner jquery element
    _this.$navItemContainer = _this.$el.find(".ms-nav-items");

    // Track jquery element
    _this.$scrollTrack = _this.$el.find(".ms-track");
  };

  Plugin.prototype.buildBehaviour = function() {
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

  Plugin.prototype.addScrollHandleDragging = function(event) {
    var _this = this;

    _this.active = false;
    _this.currentX;
    _this.initialX;
    _this.xOffset = 0;

    // bind all events

    _this.$el.on("mousedown touchstart", ".ms-nav", function(event) {
      _this.dragStart(event);
    });

    _this.$el.on("mousemove touchmove", ".ms-nav", function(event) {
      _this.drag(event);
    });

    _this.$el.on("mouseup touchend", ".ms-nav", function(event) {
      _this.dragEnd(event);
    });
  };

  Plugin.prototype.dragStart = function(event) {
    var _this = this;
    // console.log(_this.xOffset);
    var origEvent = event.originalEvent;

    if (event.type === "touchstart") {
      _this.initialX = origEvent.touches[0].clientX - _this.xOffset;
    } else {
      _this.initialX = event.clientX - _this.xOffset;
    }

    if ($(event.target).is(_this.$scrollHandle)) {
      _this.active = true;
      _this.isDragging = true;
    }
  };

  Plugin.prototype.drag = function(event) {
    var _this = this;
    // console.log(_this.xOffset);
    var origEvent = event.originalEvent;

    if (_this.active) {
      // console.log((_this.navWidth - _this.scrollerWidth));

      event.preventDefault();

      // if(_this.xOffset >= 0 && _this.xOffset < (_this.navWidth - _this.scrollerWidth)){
      if (event.type === "touchmove") {
        _this.currentX = origEvent.touches[0].clientX - _this.initialX;
      } else {
        _this.currentX = event.clientX - _this.initialX;
      }

      // console.log(_this.currentX+_this.scrollerWidth);
      if (_this.currentX + _this.scrollerWidth >= _this.navWidth) {
        _this.scrollHandle(_this.navWidth - _this.scrollerWidth,true);
      } else if (_this.currentX <= 0) {
        _this.scrollHandle(0,true);
      } else {
        _this.scrollHandle(_this.currentX,true);
      }

      if (_this.navItemContainerWidth > _this.visibleAreaWidth) {
        _this.scrollNavTrack();
      }
      _this.scrollTrack(true);
    }
  };

  Plugin.prototype.dragEnd = function(event) {
    var _this = this;

    _this.initialX = _this.currentX;
    _this.active = false;
    _this.isDragging = false;
  };

  Plugin.prototype.scrollHandle = function(xPos,isDragged) {
    var _this = this;

    _this.setTranslate(xPos, 0, _this.$scrollHandle);
    _this.xOffset = xPos;

    if(isDragged){
      _this.percentScrolled = (
        (xPos / (_this.navWidth - _this.scrollerWidth)));
    }
  };

  Plugin.prototype.scrollTrack = function(isDragged) {
    var _this = this;

    _this.currentTrackXPos = isDragged
      ? (_this.percentScrolled) *
        (_this.trackWidth - _this.visibleAreaWidth)
      : _this.currentTrackXPos + 1;

    _this.setTranslate(-_this.currentTrackXPos, 0, _this.$scrollTrack);

    _this.percentScrolled = (
      (_this.currentTrackXPos / (_this.trackWidth - _this.visibleAreaWidth)));
  };

  Plugin.prototype.scrollNavTrack = function() {
    var _this = this;
    var xPos =
      (_this.percentScrolled) *
      (_this.navItemContainerWidth - _this.visibleAreaWidth);

    _this.setTranslate(-xPos, 0, _this.$navItemContainer);
  };

  Plugin.prototype.autoScroll = function() {
    var _this = this;

    // _this.animSet = setInterval(_this.scrollAnimation.bind(_this), 50);

    window.requestAnimationFrame(_this.scrollAnimation.bind(_this));
  };

  Plugin.prototype.scrollAnimation = function() {
    var _this = this;

    if (!_this.isDragging) {
      _this.scrollTrack();

      var xPos =
        (_this.percentScrolled) * (_this.navWidth - _this.scrollerWidth);
      _this.scrollHandle(xPos,false);

      if (_this.navItemContainerWidth > _this.visibleAreaWidth) {
        _this.scrollNavTrack();
      }

      // console.log(_this.percentScrolled);

      if (_this.percentScrolled > 1) {
        _this.percentScrolled = 0;
        _this.currentTrackXPos = 0;
      } else {
      }
    }
    window.requestAnimationFrame(_this.scrollAnimation.bind(_this));
  };

  Plugin.prototype.setTranslate = function(xPos, yPos, $el) {
    xPos = xPos.toFixed(1);
    // $el[0].style.transform =
    //   "translate3d(" + xPos + "px, " + yPos + "px, " + 0 + "px)";
    $el.css({
      "-webkit-transform": "translate(" + xPos + "px, " + yPos + "px)",
      "-moz-transform": "translate(" + xPos + "px, " + yPos + "px)",
      "-ms-transform": "translate(" + xPos + "px, " + yPos + "px)",
      "-o-transform": "translate(" + xPos + "px, " + yPos + "px)",
      "transform": "translate(" + xPos + "px, " + yPos + "px)"
    });
  };

  Plugin.prototype.setPluginVariables = function() {
    var _this = this;

    _this.trackWidth = _this.$scrollTrack.width();
    _this.navWidth = _this.$scrollNav.width();
    _this.navItemContainerWidth = _this.$navItemContainer.width();
    _this.visibleAreaWidth = _this.$el.width();
    _this.trackHeight = _this.$scrollTrack.height();
    _this.navHeight = _this.$scrollNav.height();

    _this.visibleAreaImageRatio = _this.visibleAreaWidth / _this.trackHeight;
    _this.scrollerWidth = _this.visibleAreaImageRatio * _this.navHeight;

    _this.currentTrackXPos = 0;
    _this.percentScrolled = 0;
  };

  Plugin.prototype.pageResizing = function() {
    var _this = this;
    var resizeTimer;

    $(window).on("resize", function(e) {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        _this.setPluginVariables();
        _this.scrollerWidthAdjust();
      }, 250);
    });
  };

  Plugin.prototype.scrollerWidthAdjust = function() {
    var _this = this;
    if (_this.scrollerWidth) {
      _this.$scrollHandle.css("width", _this.scrollerWidth + "px");
    }
  };

  Plugin.prototype.getRandomColor = function() {
    var letters = 'BCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * letters.length)];
    }
    return color;
  };

  $.fn.marqueeSlider = function(options) {
    return this.each(function() {
      if (!$.data(this, "marqueeSlider")) {
        $.data(this, "marqueeSlider", new Plugin(this, options));
      } else {
        try {
          $(this)
            .data("marqueeSlider")
            .init();
        } catch (err) {
          console.error("marqueeSlider has not initiated properly");
        }
      }
    });
  };
})(jQuery);
