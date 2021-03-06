(function(angular){
  'use strict';

  angular.module('ngSlider').factory('sliderDraggable', ['utils', function(utils) {

    function Draggable(){
      this._init.apply( this, arguments );
    }

    Draggable.prototype.oninit = function(){
    };

    Draggable.prototype.events = function(){
    };

    Draggable.prototype.onmousedown = function(){
      this.ptr.css({ position: "absolute" });
    };

    Draggable.prototype.onmousemove = function( evt, x, y ){
      this.ptr.css({ left: x, top: y });
    };

    Draggable.prototype.onmouseup = function(){};

    Draggable.prototype.isDefault = {
      drag: false,
      clicked: false,
      toclick: true,
      mouseup: false
    };

    Draggable.prototype._init = function() {
      if( arguments.length > 0 ){
        this.ptr = arguments[0];
        this.parent = arguments[2];

        if (!this.ptr)
          return;
        //this.outer = $(".draggable-outer");

        this.is = {};
        angular.extend( this.is, this.isDefault );
        var offset = utils.offset(this.ptr);

        this.d = {
          left: offset.left,
          top: offset.top,
          width: this.ptr[0].clientWidth,
          height: this.ptr[0].clientHeight
        };

        this.oninit.apply( this, arguments );

        this._events();
      }
    };

    Draggable.prototype._getPageCoords = function( event ){
      if( event.targetTouches && event.targetTouches[0] ){
        return { x: event.targetTouches[0].pageX, y: event.targetTouches[0].pageY };
      } else
      return { x: event.pageX, y: event.pageY };
    };

    Draggable.prototype._bindEvent = function( ptr, eventType, handler ){
      var self = this;

      if( this.supportTouches_ )
        ptr[0].addEventListener( this.events_[ eventType ], handler, false );

      else
        ptr.bind( this.events_[ eventType ], handler );
    };

    Draggable.prototype._events = function(){
      var self = this;

      this.supportTouches_ = 'ontouchend' in document;
      this.events_ = {
        "click": this.supportTouches_ ? "touchstart" : "click",
        "down": this.supportTouches_ ? "touchstart" : "mousedown",
        "move": this.supportTouches_ ? "touchmove" : "mousemove",
        "up"  : this.supportTouches_ ? "touchend" : "mouseup",
        "mousedown"  : this.supportTouches_ ? "mousedown" : "mousedown"
      };

      var documentElt = angular.element(window.document);

      this._bindEvent(documentElt, "move", function(event) {        
        if(self.is.drag) {
          event.stopPropagation();
          event.preventDefault();
          if (!self.parent.disabled) {
            self._mousemove(event);
          }  
        }
      });
      this._bindEvent(documentElt, "down", function(event) {
        if(self.is.drag) {
          event.stopPropagation();
          event.preventDefault();
        }
      });
      this._bindEvent(documentElt, "up", function(event) {        
        self._mouseup(event);        
      });

      this._bindEvent( this.ptr, "down", function(event) {
        self._mousedown( event );
        return false;
      });
      this._bindEvent( this.ptr, "up", function(event) {
        self._mouseup( event );
      });      
     
      // TODO see if needed
      this.events();
    };

    Draggable.prototype._mousedown = function( evt ){
      this.is.drag = true;
      this.is.clicked = false;
      this.is.mouseup = false;   

      var coords = this._getPageCoords( evt );
      this.cx = coords.x - this.ptr[0].offsetLeft;
      this.cy = coords.y - this.ptr[0].offsetTop;

      angular.extend(this.d, {
        left: this.ptr[0].offsetLeft,
        top: this.ptr[0].offsetTop,
        width: this.ptr[0].clientWidth,
        height: this.ptr[0].clientHeight
      });

      if( this.outer && this.outer.get(0) ){
        this.outer.css({ height: Math.max(this.outer.height(), $(document.body).height()), overflow: "hidden" });
      }

      this.onmousedown( evt );
    };

    Draggable.prototype._mousemove = function( evt ){
      this.is.toclick = false;
      var coords = this._getPageCoords( evt );
      this.onmousemove( evt, coords.x - this.cx, coords.y - this.cy );
    };    

    Draggable.prototype._mouseup = function( evt ){
      var oThis = this;

      if( this.is.drag ){
        this.is.drag = false;

        if( this.outer && this.outer.get(0) ) {

          if( $.browser.mozilla ){
            this.outer.css({ overflow: "hidden" });
          } else {
            this.outer.css({ overflow: "visible" });
          }

          if( $.browser.msie && $.browser.version == '6.0' ){
            this.outer.css({ height: "100%" });
          } else {
            this.outer.css({ height: "auto" });
          }
        }

        this.onmouseup( evt );
      }
    };

    return Draggable;
  }]);
}(angular));