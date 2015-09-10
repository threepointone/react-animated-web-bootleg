/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule Animated
 */
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _Easing = require('./Easing');

var _Easing2 = _interopRequireDefault(_Easing);

var _interpolation = require('./interpolation');

var _interpolation2 = _interopRequireDefault(_interpolation);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

// var Animated = (function() {

// Note(vjeux): this would be better as an interface but flow doesn't
// support them yet

var Animated = (function () {
  function Animated() {
    _classCallCheck(this, Animated);
  }

  // Important note: start() and stop() will only be called at most once.
  // Once an animation has been stopped or finished its course, it will
  // not be reused.

  _createClass(Animated, [{
    key: 'attach',
    value: function attach() {}
  }, {
    key: 'detach',
    value: function detach() {}
  }, {
    key: 'getValue',
    value: function getValue() {}
  }, {
    key: 'getAnimatedValue',
    value: function getAnimatedValue() {
      return this.getValue();
    }
  }, {
    key: 'addChild',
    value: function addChild(child) {}
  }, {
    key: 'removeChild',
    value: function removeChild(child) {}
  }, {
    key: 'getChildren',
    value: function getChildren() {
      return [];
    }
  }]);

  return Animated;
})();

var Animation = (function () {
  function Animation() {
    _classCallCheck(this, Animation);
  }

  _createClass(Animation, [{
    key: 'start',
    value: function start(fromValue, onUpdate, onEnd, previousAnimation) {}
  }, {
    key: 'stop',
    value: function stop() {}
  }]);

  return Animation;
})();

var AnimatedWithChildren = (function (_Animated) {
  _inherits(AnimatedWithChildren, _Animated);

  function AnimatedWithChildren() {
    _classCallCheck(this, AnimatedWithChildren);

    _get(Object.getPrototypeOf(AnimatedWithChildren.prototype), 'constructor', this).call(this);
    this._children = [];
  }

  /**
   * Animated works by building a directed acyclic graph of dependencies
   * transparently when you render your Animated components.
   *
   *               new Animated.Value(0)
   *     .interpolate()        .interpolate()    new Animated.Value(1)
   *         opacity               translateY      scale
   *          style                         transform
   *         View#234                         style
   *                                         View#123
   *
   * A) Top Down phase
   * When an Animated.Value is updated, we recursively go down through this
   * graph in order to find leaf nodes: the views that we flag as needing
   * an update.
   *
   * B) Bottom Up phase
   * When a view is flagged as needing an update, we recursively go back up
   * in order to build the new value that it needs. The reason why we need
   * this two-phases process is to deal with composite props such as
   * transform which can receive values from multiple parents.
   */

  _createClass(AnimatedWithChildren, [{
    key: 'addChild',
    value: function addChild(child) {
      if (this._children.length === 0) {
        this.attach();
      }
      this._children.push(child);
    }
  }, {
    key: 'removeChild',
    value: function removeChild(child) {
      var index = this._children.indexOf(child);
      if (index === -1) {
        console.warn('Trying to remove a child that doesn\'t exist');
        return;
      }
      this._children.splice(index, 1);
      if (this._children.length === 0) {
        this.detach();
      }
    }
  }, {
    key: 'getChildren',
    value: function getChildren() {
      return this._children;
    }
  }]);

  return AnimatedWithChildren;
})(Animated);

function _flush(node) {
  var animatedStyles = new Set();
  function findAnimatedStyles(theNode) {
    if ('update' in theNode) {
      animatedStyles.add(theNode);
    } else {
      theNode.getChildren().forEach(findAnimatedStyles);
    }
  }
  findAnimatedStyles(node);
  animatedStyles.forEach(function (animatedStyle) {
    return animatedStyle.update();
  });
}

var TimingAnimation = (function (_Animation) {
  _inherits(TimingAnimation, _Animation);

  function TimingAnimation(config) {
    _classCallCheck(this, TimingAnimation);

    _get(Object.getPrototypeOf(TimingAnimation.prototype), 'constructor', this).call(this);
    this._toValue = config.toValue;
    this._easing = config.easing || _Easing2['default'].inOut(_Easing2['default'].ease);
    this._duration = config.duration !== undefined ? config.duration : 500;
    this._delay = config.delay || 0;
  }

  _createClass(TimingAnimation, [{
    key: 'start',
    value: function start(fromValue, onUpdate, onEnd) {
      var _this = this;

      this._fromValue = fromValue;
      this._onUpdate = onUpdate;
      this._onEnd = onEnd;

      var start = function start() {
        _this._startTime = Date.now();
        _this._animationFrame = window.requestAnimationFrame(_this.onUpdate.bind(_this));
      };
      if (this._delay) {
        this._timeout = setTimeout(start, this._delay);
      } else {
        start();
      }
    }
  }, {
    key: 'onUpdate',
    value: function onUpdate() {
      var now = Date.now();

      if (now > this._startTime + this._duration) {
        this._onUpdate(this._fromValue + this._easing(1) * (this._toValue - this._fromValue));
        var onEnd = this._onEnd;
        this._onEnd = null;
        onEnd && onEnd( /* finished */true);
        return;
      }

      this._onUpdate(this._fromValue + this._easing((now - this._startTime) / this._duration) * (this._toValue - this._fromValue));

      this._animationFrame = window.requestAnimationFrame(this.onUpdate.bind(this));
    }
  }, {
    key: 'stop',
    value: function stop() {
      clearTimeout(this._timeout);
      window.cancelAnimationFrame(this._animationFrame);
      var onEnd = this._onEnd;
      this._onEnd = null;
      onEnd && onEnd( /* finished */false);
    }
  }]);

  return TimingAnimation;
})(Animation);

var DecayAnimation = (function (_Animation2) {
  _inherits(DecayAnimation, _Animation2);

  function DecayAnimation(config) {
    _classCallCheck(this, DecayAnimation);

    _get(Object.getPrototypeOf(DecayAnimation.prototype), 'constructor', this).call(this);
    this._deceleration = config.deceleration || 0.998;
    this._velocity = config.velocity;
  }

  _createClass(DecayAnimation, [{
    key: 'start',
    value: function start(fromValue, onUpdate, onEnd) {
      this._lastValue = fromValue;
      this._fromValue = fromValue;
      this._onUpdate = onUpdate;
      this._onEnd = onEnd;
      this._startTime = Date.now();
      this._animationFrame = window.requestAnimationFrame(this.onUpdate.bind(this));
    }
  }, {
    key: 'onUpdate',
    value: function onUpdate() {
      var now = Date.now();

      var value = this._fromValue + this._velocity / (1 - this._deceleration) * (1 - Math.exp(-(1 - this._deceleration) * (now - this._startTime)));

      this._onUpdate(value);

      if (Math.abs(this._lastValue - value) < 0.1) {
        var onEnd = this._onEnd;
        this._onEnd = null;
        onEnd && onEnd( /* finished */true);
        return;
      }

      this._lastValue = value;
      this._animationFrame = window.requestAnimationFrame(this.onUpdate.bind(this));
    }
  }, {
    key: 'stop',
    value: function stop() {
      window.cancelAnimationFrame(this._animationFrame);
      var onEnd = this._onEnd;
      this._onEnd = null;
      onEnd && onEnd( /* finished */false);
    }
  }]);

  return DecayAnimation;
})(Animation);

function withDefault(value, defaultValue) {
  if (value === undefined || value === null) {
    return defaultValue;
  }
  return value;
}

function tensionFromOrigamiValue(oValue) {
  return (oValue - 30.0) * 3.62 + 194.0;
}
function frictionFromOrigamiValue(oValue) {
  return (oValue - 8.0) * 3.0 + 25.0;
}

var fromOrigamiTensionAndFriction = function fromOrigamiTensionAndFriction(tension, friction) {
  return {
    tension: tensionFromOrigamiValue(tension),
    friction: frictionFromOrigamiValue(friction)
  };
};

var fromBouncinessAndSpeed = function fromBouncinessAndSpeed(bounciness, speed) {
  function normalize(value, startValue, endValue) {
    return (value - startValue) / (endValue - startValue);
  }
  function projectNormal(n, start, end) {
    return start + n * (end - start);
  }
  function linearInterpolation(t, start, end) {
    return t * end + (1.0 - t) * start;
  }
  function quadraticOutInterpolation(t, start, end) {
    return linearInterpolation(2 * t - t * t, start, end);
  }
  function b3Friction1(x) {
    return 0.0007 * Math.pow(x, 3) - 0.031 * Math.pow(x, 2) + 0.64 * x + 1.28;
  }
  function b3Friction2(x) {
    return 0.000044 * Math.pow(x, 3) - 0.006 * Math.pow(x, 2) + 0.36 * x + 2.;
  }
  function b3Friction3(x) {
    return 0.00000045 * Math.pow(x, 3) - 0.000332 * Math.pow(x, 2) + 0.1078 * x + 5.84;
  }
  function b3Nobounce(tension) {
    if (tension <= 18) {
      return b3Friction1(tension);
    } else if (tension > 18 && tension <= 44) {
      return b3Friction2(tension);
    } else {
      return b3Friction3(tension);
    }
  }

  var b = normalize(bounciness / 1.7, 0, 20.0);
  b = projectNormal(b, 0.0, 0.8);
  var s = normalize(speed / 1.7, 0, 20.0);
  var bouncyTension = projectNormal(s, 0.5, 200);
  var bouncyFriction = quadraticOutInterpolation(b, b3Nobounce(bouncyTension), 0.01);

  return {
    tension: tensionFromOrigamiValue(bouncyTension),
    friction: frictionFromOrigamiValue(bouncyFriction)
  };
};

var SpringAnimation = (function (_Animation3) {
  _inherits(SpringAnimation, _Animation3);

  function SpringAnimation(config) {
    _classCallCheck(this, SpringAnimation);

    _get(Object.getPrototypeOf(SpringAnimation.prototype), 'constructor', this).call(this);

    this._overshootClamping = withDefault(config.overshootClamping, false);
    this._restDisplacementThreshold = withDefault(config.restDisplacementThreshold, 0.001);
    this._restSpeedThreshold = withDefault(config.restSpeedThreshold, 0.001);
    this._lastVelocity = withDefault(config.velocity, 0);
    this._tempVelocity = this._lastVelocity;
    this._toValue = config.toValue;

    var springConfig;
    if (config.bounciness !== undefined || config.speed !== undefined) {
      invariant(config.tension === undefined && config.friction === undefined, 'You can only define bounciness/speed or tension/friction but not both');
      springConfig = fromBouncinessAndSpeed(withDefault(config.bounciness, 8), withDefault(config.speed, 12));
    } else {
      springConfig = fromOrigamiTensionAndFriction(withDefault(config.tension, 40), withDefault(config.friction, 7));
    }
    this._tension = springConfig.tension;
    this._friction = springConfig.friction;
  }

  _createClass(SpringAnimation, [{
    key: 'start',
    value: function start(fromValue, onUpdate, onEnd, previousAnimation) {
      this._active = true;
      this._startPosition = fromValue;
      this._lastPosition = this._startPosition;
      this._tempPosition = this._lastPosition;

      this._onUpdate = onUpdate;
      this._onEnd = onEnd;
      this._lastTime = Date.now();

      if (previousAnimation instanceof SpringAnimation) {
        var internalState = previousAnimation.getInternalState();
        this._lastPosition = internalState.lastPosition;
        this._tempPosition = internalState.tempPosition;
        this._lastVelocity = internalState.lastVelocity;
        this._tempVelocity = internalState.tempVelocity;
        this._lastTime = internalState.lastTime;
      }

      this.onUpdate();
    }
  }, {
    key: 'getInternalState',
    value: function getInternalState() {
      return {
        lastPosition: this._lastPosition,
        tempPosition: this._tempPosition,
        lastVelocity: this._lastVelocity,
        tempVelocity: this._tempVelocity,
        lastTime: this._lastTime
      };
    }
  }, {
    key: 'onUpdate',
    value: function onUpdate() {
      if (!this._active) {
        return;
      }
      var now = Date.now();

      var position = this._lastPosition;
      var velocity = this._lastVelocity;

      var tempPosition = position;
      var tempVelocity = velocity;

      var TIMESTEP_MSEC = 4;
      var numSteps = Math.floor((now - this._lastTime) / TIMESTEP_MSEC);
      for (var i = 0; i < numSteps; ++i) {
        // Velocity is based on seconds instead of milliseconds
        var step = TIMESTEP_MSEC / 1000;

        var aVelocity = velocity;
        var aAcceleration = this._tension * (this._toValue - tempPosition) - this._friction * tempVelocity;
        tempPosition = position + aVelocity * step / 2;
        tempVelocity = velocity + aAcceleration * step / 2;

        var bVelocity = tempVelocity;
        var bAcceleration = this._tension * (this._toValue - tempPosition) - this._friction * tempVelocity;
        tempPosition = position + bVelocity * step / 2;
        tempVelocity = velocity + bAcceleration * step / 2;

        var cVelocity = tempVelocity;
        var cAcceleration = this._tension * (this._toValue - tempPosition) - this._friction * tempVelocity;
        tempPosition = position + cVelocity * step;
        tempVelocity = velocity + cAcceleration * step;

        var dVelocity = tempVelocity;
        var dAcceleration = this._tension * (this._toValue - tempPosition) - this._friction * tempVelocity;

        var dxdt = (aVelocity + 2 * (bVelocity + cVelocity) + dVelocity) / 6;
        var dvdt = (aAcceleration + 2 * (bAcceleration + cAcceleration) + dAcceleration) / 6;

        position += dxdt * step;
        velocity += dvdt * step;
      }

      this._lastTime = now;
      this._tempPosition = tempPosition;
      this._tempVelocity = tempVelocity;
      this._lastPosition = position;
      this._lastVelocity = velocity;

      this._onUpdate(position);

      // Conditions for stopping the spring animation
      var isOvershooting = false;
      if (this._overshootClamping && this._tension !== 0) {
        if (this._startPosition < this._toValue) {
          isOvershooting = position > this._toValue;
        } else {
          isOvershooting = position < this._toValue;
        }
      }
      var isVelocity = Math.abs(velocity) <= this._restSpeedThreshold;
      var isDisplacement = true;
      if (this._tension !== 0) {
        isDisplacement = Math.abs(this._toValue - position) <= this._restDisplacementThreshold;
      }
      if (isOvershooting || isVelocity && isDisplacement) {
        var onEnd = this._onEnd;
        this._onEnd = null;
        onEnd && onEnd( /* finished */true);
        return;
      }
      this._animationFrame = window.requestAnimationFrame(this.onUpdate.bind(this));
    }
  }, {
    key: 'stop',
    value: function stop() {
      this._active = false;
      window.cancelAnimationFrame(this._animationFrame);
      var onEnd = this._onEnd;
      this._onEnd = null;
      onEnd && onEnd( /* finished */false);
    }
  }]);

  return SpringAnimation;
})(Animation);

var _uniqueId = 1;

var AnimatedValue = (function (_AnimatedWithChildren) {
  _inherits(AnimatedValue, _AnimatedWithChildren);

  function AnimatedValue(value) {
    _classCallCheck(this, AnimatedValue);

    _get(Object.getPrototypeOf(AnimatedValue.prototype), 'constructor', this).call(this);
    this._value = value;
    this._offset = 0;
    this._animation = null;
    this._listeners = {};
  }

  _createClass(AnimatedValue, [{
    key: 'detach',
    value: function detach() {
      this.stopAnimation();
    }
  }, {
    key: 'getValue',
    value: function getValue() {
      return this._value + this._offset;
    }
  }, {
    key: 'setValue',
    value: function setValue(value) {
      if (this._animation) {
        this._animation.stop();
        this._animation = null;
      }
      this._updateValue(value);
    }
  }, {
    key: 'getOffset',
    value: function getOffset() {
      return this._offset;
    }
  }, {
    key: 'setOffset',
    value: function setOffset(offset) {
      this._offset = offset;
    }
  }, {
    key: 'addListener',
    value: function addListener(callback) {
      var id = _uniqueId++;
      this._listeners[id] = callback;
      return id;
    }
  }, {
    key: 'removeListener',
    value: function removeListener(id) {
      delete this._listeners[id];
    }
  }, {
    key: 'animate',
    value: function animate(animation, callback) {
      var _this2 = this;

      var previousAnimation = this._animation;
      this._animation && this._animation.stop();
      this._animation = animation;
      animation.start(this._value, function (value) {
        _this2._updateValue(value);
      }, function (finished) {
        _this2._animation = null;
        callback && callback(finished);
      }, previousAnimation);
    }
  }, {
    key: 'stopAnimation',
    value: function stopAnimation(callback) {
      this.stopTracking();
      this._animation && this._animation.stop();
      callback && callback(this._value);
    }
  }, {
    key: 'stopTracking',
    value: function stopTracking() {
      this._tracking && this._tracking.detach();
    }
  }, {
    key: 'track',
    value: function track(tracking) {
      this.stopTracking();
      this._tracking = tracking;
    }
  }, {
    key: 'interpolate',
    value: function interpolate(config) {
      return new AnimatedInterpolation(this, _interpolation2['default'].create(config));
    }
  }, {
    key: '_updateValue',
    value: function _updateValue(value) {
      if (value === this._value) {
        return;
      }
      this._value = value;
      _flush(this);
      for (var key in this._listeners) {
        this._listeners[key]({ value: this.getValue() });
      }
    }
  }]);

  return AnimatedValue;
})(AnimatedWithChildren);

var AnimatedVec2 = (function (_AnimatedWithChildren2) {
  _inherits(AnimatedVec2, _AnimatedWithChildren2);

  function AnimatedVec2(value) {
    _classCallCheck(this, AnimatedVec2);

    _get(Object.getPrototypeOf(AnimatedVec2.prototype), 'constructor', this).call(this);
    value = value || { x: 0, y: 0 };
    if (typeof value.x === 'number') {
      this.x = new AnimatedValue(value.x);
      this.y = new AnimatedValue(value.y);
    } else {
      this.x = value.x;
      this.y = value.y;
    }
    this._listeners = {};
  }

  _createClass(AnimatedVec2, [{
    key: 'setValue',
    value: function setValue(value) {
      this.x.setValue(value.x);
      this.y.setValue(value.y);
    }
  }, {
    key: 'setOffset',
    value: function setOffset(offset) {
      this.x.setOffset(offset.x);
      this.y.setOffset(offset.y);
    }
  }, {
    key: 'addListener',
    value: function addListener(callback) {
      var _this3 = this;

      var id = _uniqueId++;
      var jointCallback = function jointCallback(value) {
        callback({ x: _this3.x.getValue(), y: _this3.y.getValue() });
      };
      this._listeners[id] = {
        x: this.x.addListener(jointCallback),
        y: this.y.addListener(jointCallback)
      };
      return id;
    }
  }, {
    key: 'removeListener',
    value: function removeListener(id) {
      this.x.removeListener(this._listeners[id].x);
      this.y.removeListener(this._listeners[id].y);
      delete this._listeners[id];
    }
  }, {
    key: 'offset',
    value: function offset(theOffset) {
      // chunky...perf?
      return new AnimatedVec2({
        x: this.x.interpolate({
          inputRange: [0, 1],
          outputRange: [theOffset.x, theOffset.x + 1]
        }),
        y: this.y.interpolate({
          inputRange: [0, 1],
          outputRange: [theOffset.y, theOffset.y + 1]
        })
      });
    }
  }, {
    key: 'getLayout',
    value: function getLayout() {
      return {
        left: this.x,
        top: this.y
      };
    }
  }, {
    key: 'getTranslateTransform',
    value: function getTranslateTransform() {
      return [{ translateX: this.x }, { translateY: this.y }];
    }
  }]);

  return AnimatedVec2;
})(AnimatedWithChildren);

var AnimatedInterpolation = (function (_AnimatedWithChildren3) {
  _inherits(AnimatedInterpolation, _AnimatedWithChildren3);

  function AnimatedInterpolation(parent, interpolation) {
    _classCallCheck(this, AnimatedInterpolation);

    _get(Object.getPrototypeOf(AnimatedInterpolation.prototype), 'constructor', this).call(this);
    this._parent = parent;
    this._interpolation = interpolation;
  }

  _createClass(AnimatedInterpolation, [{
    key: 'getValue',
    value: function getValue() {
      var parentValue = this._parent.getValue();
      invariant(typeof parentValue === 'number', 'Cannot interpolate an input which is not a number.');
      return this._interpolation(parentValue);
    }
  }, {
    key: 'interpolate',
    value: function interpolate(config) {
      return new AnimatedInterpolation(this, _interpolation2['default'].create(config));
    }
  }, {
    key: 'attach',
    value: function attach() {
      this._parent.addChild(this);
    }
  }, {
    key: 'detach',
    value: function detach() {
      this._parent.removeChild(this);
    }
  }]);

  return AnimatedInterpolation;
})(AnimatedWithChildren);

var AnimatedTransform = (function (_AnimatedWithChildren4) {
  _inherits(AnimatedTransform, _AnimatedWithChildren4);

  function AnimatedTransform(transforms) {
    _classCallCheck(this, AnimatedTransform);

    _get(Object.getPrototypeOf(AnimatedTransform.prototype), 'constructor', this).call(this);
    this._transforms = transforms;
  }

  _createClass(AnimatedTransform, [{
    key: 'getValue',
    value: function getValue() {
      return this._transforms.map(function (transform) {
        var result = '';
        for (var key in transform) {
          var value = transform[key];
          if (value instanceof Animated) {
            result += key + '(' + value.getValue() + ')';
          } else {
            result += key + '(' + value.join(',') + ')';
          }
        }
        return result;
      }).join(' ');
    }
  }, {
    key: 'getAnimatedValue',
    value: function getAnimatedValue() {
      return this._transforms.map(function (transform) {
        var result = '';
        for (var key in transform) {
          var value = transform[key];
          if (value instanceof Animated) {
            result += key + '(' + value.getValue() + ') ';
          } else {
            // All transform components needed to recompose matrix
            result += key + '(' + value.join(',') + ') ';
          }
        }
        return result;
      }).join('').trim();
    }
  }, {
    key: 'attach',
    value: function attach() {
      var _this4 = this;

      this._transforms.forEach(function (transform) {
        for (var key in transform) {
          var value = transform[key];
          if (value instanceof Animated) {
            value.addChild(_this4);
          }
        }
      });
    }
  }, {
    key: 'detach',
    value: function detach() {
      var _this5 = this;

      this._transforms.forEach(function (transform) {
        for (var key in transform) {
          var value = transform[key];
          if (value instanceof Animated) {
            value.removeChild(_this5);
          }
        }
      });
    }
  }]);

  return AnimatedTransform;
})(AnimatedWithChildren);

var AnimatedStyle = (function (_AnimatedWithChildren5) {
  _inherits(AnimatedStyle, _AnimatedWithChildren5);

  function AnimatedStyle(style) {
    _classCallCheck(this, AnimatedStyle);

    _get(Object.getPrototypeOf(AnimatedStyle.prototype), 'constructor', this).call(this);
    style = style || {};
    if (style.transform) {
      style = _extends({}, style, {
        transform: new AnimatedTransform(style.transform)
      });
    }
    this._style = style;
  }

  _createClass(AnimatedStyle, [{
    key: 'getValue',
    value: function getValue() {
      var style = {};
      for (var key in this._style) {
        var value = this._style[key];
        if (value instanceof Animated) {
          style[key] = value.getValue();
        } else {
          style[key] = value;
        }
      }
      return style;
    }
  }, {
    key: 'getAnimatedValue',
    value: function getAnimatedValue() {
      var style = {};
      for (var key in this._style) {
        var value = this._style[key];
        if (value instanceof Animated) {
          style[key] = value.getAnimatedValue();
        }
      }
      return style;
    }
  }, {
    key: 'attach',
    value: function attach() {
      for (var key in this._style) {
        var value = this._style[key];
        if (value instanceof Animated) {
          value.addChild(this);
        }
      }
    }
  }, {
    key: 'detach',
    value: function detach() {
      for (var key in this._style) {
        var value = this._style[key];
        if (value instanceof Animated) {
          value.removeChild(this);
        }
      }
    }
  }]);

  return AnimatedStyle;
})(AnimatedWithChildren);

var AnimatedProps = (function (_Animated2) {
  _inherits(AnimatedProps, _Animated2);

  function AnimatedProps(props, callback) {
    _classCallCheck(this, AnimatedProps);

    _get(Object.getPrototypeOf(AnimatedProps.prototype), 'constructor', this).call(this);
    if (props.style) {
      props = _extends({}, props, {
        style: new AnimatedStyle(props.style)
      });
    }
    this._props = props;
    this._callback = callback;
    this.attach();
  }

  _createClass(AnimatedProps, [{
    key: 'getValue',
    value: function getValue() {
      var props = {};
      for (var key in this._props) {
        var value = this._props[key];
        if (value instanceof Animated) {
          props[key] = value.getValue();
        } else {
          props[key] = value;
        }
      }
      return props;
    }
  }, {
    key: 'getAnimatedValue',
    value: function getAnimatedValue() {
      var props = {};
      for (var key in this._props) {
        var value = this._props[key];
        if (value instanceof Animated) {
          props[key] = value.getAnimatedValue();
        }
      }
      return props;
    }
  }, {
    key: 'attach',
    value: function attach() {
      for (var key in this._props) {
        var value = this._props[key];
        if (value instanceof Animated) {
          value.addChild(this);
        }
      }
    }
  }, {
    key: 'detach',
    value: function detach() {
      for (var key in this._props) {
        var value = this._props[key];
        if (value instanceof Animated) {
          value.removeChild(this);
        }
      }
    }
  }, {
    key: 'update',
    value: function update() {
      this._callback();
    }
  }]);

  return AnimatedProps;
})(Animated);

function createAnimatedComponent(Component) {
  var refName = 'node';

  var AnimatedComponent = (function (_React$Component) {
    _inherits(AnimatedComponent, _React$Component);

    function AnimatedComponent() {
      _classCallCheck(this, AnimatedComponent);

      _get(Object.getPrototypeOf(AnimatedComponent.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(AnimatedComponent, [{
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        this._propsAnimated && this._propsAnimated.detach();
      }
    }, {
      key: 'setNativeProps',
      value: function setNativeProps(props) {
        this.refs[refName].setNativeProps(props);
      }
    }, {
      key: 'componentWillMount',
      value: function componentWillMount() {
        this.attachProps(this.props);
      }
    }, {
      key: 'attachProps',
      value: function attachProps(nextProps) {
        var _this6 = this;

        var oldPropsAnimated = this._propsAnimated;

        // The system is best designed when setNativeProps is implemented. It is
        // able to avoid re-rendering and directly set the attributes that
        // changed. However, setNativeProps can only be implemented on leaf
        // native components. If you want to animate a composite component, you
        // need to re-render it. In this case, we have a fallback that uses
        // forceUpdate.
        var callback = function callback() {
          if (_this6.refs[refName].setNativeProps) {
            var value = _this6._propsAnimated.getAnimatedValue();
            _this6.refs[refName].setNativeProps(value);
          } else {
            _this6.forceUpdate();
          }
        };

        this._propsAnimated = new AnimatedProps(nextProps, callback);

        // When you call detach, it removes the element from the parent list
        // of children. If it goes to 0, then the parent also detaches itself
        // and so on.
        // An optimization is to attach the new elements and THEN detach the old
        // ones instead of detaching and THEN attaching.
        // This way the intermediate state isn't to go to 0 and trigger
        // this expensive recursive detaching to then re-attach everything on
        // the very next operation.
        oldPropsAnimated && oldPropsAnimated.detach();
      }
    }, {
      key: 'componentWillReceiveProps',
      value: function componentWillReceiveProps(nextProps) {
        this.attachProps(nextProps);
      }
    }, {
      key: 'render',
      value: function render() {
        return _react2['default'].createElement(Component, _extends({}, this._propsAnimated.getValue(), {
          ref: refName
        }));
      }
    }]);

    return AnimatedComponent;
  })(_react2['default'].Component);

  return AnimatedComponent;
}

var AnimatedTracking = (function (_Animated3) {
  _inherits(AnimatedTracking, _Animated3);

  function AnimatedTracking(value, parent, animationClass, animationConfig, callback) {
    _classCallCheck(this, AnimatedTracking);

    _get(Object.getPrototypeOf(AnimatedTracking.prototype), 'constructor', this).call(this);
    this._value = value;
    this._parent = parent;
    this._animationClass = animationClass;
    this._animationConfig = animationConfig;
    this._callback = callback;
    this.attach();
  }

  _createClass(AnimatedTracking, [{
    key: 'getValue',
    value: function getValue() {
      return this._parent.getValue();
    }
  }, {
    key: 'attach',
    value: function attach() {
      this._active = true;
      this._parent.addChild(this);
    }
  }, {
    key: 'detach',
    value: function detach() {
      this._parent.removeChild(this);
      this._active = false;
    }
  }, {
    key: 'update',
    value: function update() {
      if (!this._active) {
        console.warn('calling update on detached AnimatedTracking');
        return;
      }
      // console.log('AnimatedTracking update with ',
      //   {toValue: this._animationConfig.toValue.getValue(), value: this._value.getValue()});
      this._value.animate(new this._animationClass(_extends({}, this._animationConfig, {
        toValue: this._animationConfig.toValue.getValue()
      })), this._callback);
    }
  }]);

  return AnimatedTracking;
})(Animated);

var maybeVectorAnim = function maybeVectorAnim(value, config, anim) {
  if (value instanceof AnimatedVec2) {
    var configX = _extends({}, config);
    var configY = _extends({}, config);
    for (var key in config) {
      var _config$key = config[key];
      var x = _config$key.x;
      var y = _config$key.y;

      if (x !== undefined && y !== undefined) {
        configX[key] = x;
        configY[key] = y;
      }
    }
    // TODO: Urg, parallel breaks tracking :(
    // return parallel([
    //   anim(value.x, configX),
    //   anim(value.y, configY),
    // ]);
    anim(value.x, configX).start();
    return anim(value.y, configY);
  }
  return null;
};

var spring = function spring(value, config) {
  return maybeVectorAnim(value, config, spring) || {
    start: function start(callback) {
      value.stopTracking();
      if (config.toValue instanceof Animated) {
        value.track(new AnimatedTracking(value, config.toValue, SpringAnimation, config, callback));
      } else {
        value.animate(new SpringAnimation(config), callback);
      }
    },

    stop: function stop() {
      value.stopAnimation();
    }
  };
};

var timing = function timing(value, config) {
  return maybeVectorAnim(value, config, timing) || {
    start: function start(callback) {
      value.stopTracking();
      value.animate(new TimingAnimation(config), callback);
    },

    stop: function stop() {
      value.stopAnimation();
    }
  };
};

var decay = function decay(value, config) {
  return maybeVectorAnim(value, config, decay) || {
    start: function start(callback) {
      value.stopTracking();
      value.animate(new DecayAnimation(config), callback);
    },

    stop: function stop() {
      value.stopAnimation();
    }
  };
};

var sequence = function sequence(animations) {
  var current = 0;
  return {
    start: function start(callback) {
      var onComplete = function onComplete(finished) {
        if (!finished) {
          callback && callback(finished);
          return;
        }

        current++;

        if (current === animations.length) {
          callback && callback( /* finished */true);
          return;
        }

        animations[current].start(onComplete);
      };

      if (animations.length === 0) {
        callback && callback( /* finished */true);
      } else {
        animations[current].start(onComplete);
      }
    },

    stop: function stop() {
      if (current < animations.length) {
        animations[current].stop();
      }
    }
  };
};

var parallel = function parallel(animations) {
  var doneCount = 0;
  // Variable to make sure we only call stop() at most once
  var hasBeenStopped = false;

  var result = {
    start: function start(callback) {
      if (doneCount === animations.length) {
        callback && callback( /* finished */true);
        return;
      }

      animations.forEach(function (animation, idx) {
        animation.start(function (finished) {
          doneCount++;
          if (doneCount === animations.length) {
            callback && callback(finished);
            return;
          }

          if (!finished && !hasBeenStopped) {
            result.stop();
          }
        });
      });
    },

    stop: function stop() {
      hasBeenStopped = true;
      animations.forEach(function (animation) {
        animation.stop();
      });
    }
  };

  return result;
};

var delay = function delay(time) {
  // Would be nice to make a specialized implementation.
  return timing(new AnimatedValue(0), { toValue: 0, delay: time, duration: 0 });
};

var stagger = function stagger(time, animations) {
  return parallel(animations.map(function (animation, i) {
    return sequence([delay(time * i), animation]);
  }));
};

/**
 *  Takes an array of mappings and extracts values from each arg accordingly,
 *  then calls setValue on the mapped outputs.  e.g.
 *
 *  onScroll={this.AnimatedEvent(
 *    [{nativeEvent: {contentOffset: {x: this._scrollX}}}]
 *    {listener, updatePeriod: 100}  // optional listener invoked every 100ms
 *  )
 *  ...
 *  onPanResponderMove: this.AnimatedEvent([
 *    null,                               // raw event arg
 *    {dx: this._panX},                   // gestureState arg
 *  ]),
 *
 */
var event = function event(argMapping, config) {
  var lastUpdate = 0;
  var timer;
  var isEnabled = true;
  if (config && config.ref) {
    config.ref({
      enable: function enable() {
        isEnabled = true;
      },
      disable: function disable() {
        isEnabled = false;
        clearTimeout(timer);
        timer = null;
      }
    });
  }
  var lastArgs;
  return function () {
    lastArgs = arguments;
    if (!isEnabled) {
      clearTimeout(timer);
      timer = null;
      return;
    }
    var traverse = function traverse(recMapping, recEvt, key) {
      if (recMapping instanceof AnimatedValue || recMapping instanceof AnimatedInterpolation) {
        invariant(typeof recEvt === 'number', 'Bad event element of type ' + typeof recEvt + ' for key ' + key);
        recMapping.setValue(recEvt);
        return;
      }
      invariant(typeof recMapping === 'object', 'Bad mapping of type ' + typeof recMapping + ' for key ' + key);
      invariant(typeof recEvt === 'object', 'Bad event of type ' + typeof recEvt + ' for key ' + key);
      for (var key in recMapping) {
        traverse(recMapping[key], recEvt[key], key);
      }
    };
    argMapping.forEach(function (mapping, idx) {
      traverse(mapping, lastArgs[idx], null);
    });
    if (config && config.listener && !timer) {
      var cb = function cb() {
        lastUpdate = Date.now();
        timer = null;
        config.listener.apply(null, lastArgs);
      };
      if (config.updatePeriod) {
        timer = setTimeout(cb, config.updatePeriod - Date.now() + lastUpdate);
      } else {
        cb();
      }
    }
  };
};

module.exports = {
  delay: delay,
  sequence: sequence,
  parallel: parallel,
  stagger: stagger,

  decay: decay,
  timing: timing,
  spring: spring,

  event: event,

  Value: AnimatedValue,
  Vec2: AnimatedVec2,
  __PropsOnlyForTests: AnimatedProps,
  div: createAnimatedComponent('div'),
  createAnimatedComponent: createAnimatedComponent
};

// })();