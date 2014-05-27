/*!
 * Leap Gestures
 * v0.2.0
 *
 * Copyright © 2014 Francesco Novy | MIT license
 */

(function(root, factory)
{
	var leapjs;
	if (typeof exports === 'object') {
		// CommonJS module
		// Load moment.js as an optional dependency
		try {
			leapjs = require('leapjs');
		} catch (e) {
		}
		module.exports = factory(leapjs);
	} else if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(function(req)
		{
			// Load moment.js as an optional dependency
			var id = 'leapjs';
			leapjs = req.defined && req.defined(id) ? req(id) : undefined;
			return factory(leapjs);
		});
	} else {
		root.LeapGestures = factory(root.leapjs);
	}
}(this, function(leapjs)
{
	/**
	 * G-Mote constructor
	 */
	LeapGestures = function(options)
	{
		var self = this;
		var _options = self.config(options);
		var _deferTimer = null, _lastGesture = null, _gestureSpeedCummulated = 0,
						_gestureDistance = [0, 0, 0], _gestureCount = 0, _nextGesture = null,
						_lastGestureTimestamp = 0, _fingerCount = null, _lastHandTimestamp,
						_deferBlocked = false;

		self._isConnected;
		self._controller = null;

		self._debugOptions = function() {
			console.log(_options);
			return _options;
		};

		self._leapConnected = function() {
			self._isConnected = true;
			if (_options["statusChanged"] !== null) {
				var statusObj = {
					type: "connection",
					connected: true,
					message: "The Leap Motion has been connected"
				};
				_options["statusChanged"](statusObj);
			}
		};

		self._leapDisconnected = function() {
			self._isConnected = false;
			if (_options["statusChanged"] !== null) {
				var statusObj = {
					type: "connection",
					connected: false,
					message: "The Leap Motion has been disconnected."
				};
				_options["statusChanged"](statusObj);
			}
		};

		self._gesture = function(gesture) {
			// Circle?
			if (gesture.type == "circle") {
				_gestureSpeedCummulated = 0;
				_gestureDistance = [0, 0, 0];
				_gestureCount = 0;
				// Set new Gesture
				_nextGesture = gesture;

				clearTimeout(_deferTimer);
				_deferTimer = setTimeout(self._gestureCall, 150);

				return;
			}


			var isHorizontal = Math.abs(gesture.direction[0]) > Math.abs(gesture.direction[1]);
			//Classify as right-left or up-down
			if (isHorizontal) {
				if (gesture.direction[0] > 0) {
					swipeDirection = "right";
				} else {
					swipeDirection = "left";
				}
			} else { //vertical
				if (gesture.direction[1] > 0) {
					swipeDirection = "up";
				} else {
					swipeDirection = "down";
				}
			}

			gesture.swipeDirection = swipeDirection;

			// New gesture is the same direction as old gesture
			if (_nextGesture === null || _nextGesture.swipeDirection != swipeDirection) {
				// New gesture, immediatley call old gesture if available
				//self._gestureCall();
				_gestureSpeedCummulated = 0;
				_gestureDistance = [0, 0, 0];
				_gestureCount = 0;
				// Set new Gesture
				_nextGesture = gesture;
			}

			// Recalulate speed & distance
			_gestureCount++;
			_gestureSpeedCummulated += gesture.speed;

			var pos1 = gesture.startPosition;
			var pos2 = gesture.position;
			_gestureDistance[0] += Math.abs(pos1[0] - pos2[0]);
			_gestureDistance[1] += Math.abs(pos1[1] - pos2[1]);
			_gestureDistance[2] += Math.abs(pos1[2] - pos2[2]);

			// Defer gesture to avoid duplicate calling in one gesture
			clearTimeout(_deferTimer);
			_deferTimer = setTimeout(self._gestureCall, 150);
		};

		self._gestureCall = function() {
			if (_nextGesture === null)
				return;

			// Quick direction changes can be forbidden
			if (_options["preventBackForth"] && _lastGesture != null) {
				if (
								(_lastGesture.swipeDirection == "down" && _nextGesture.swipeDirection == "up")
								|| (_lastGesture.swipeDirection == "up" && _nextGesture.swipeDirection == "down")
								|| (_lastGesture.swipeDirection == "right" && _nextGesture.swipeDirection == "left")
								|| (_lastGesture.swipeDirection == "left" && _nextGesture.swipeDirection == "right")
								) {
					// If the previous gesture was 300ms or less before the current, cancel it
					var now = new Date().getTime();
					if (now - _lastGestureTimestamp < 1000) {
						return;
					}
				}
			}

			var dist = 0, obj, statusObj, speed, clockwise;

			// Save as last gesture to identify back and forth
			_lastGesture = _nextGesture;
			_lastGestureTimestamp = new Date().getTime();

			// check if is circle or fist
			if (_nextGesture.type == "circle") {
				// determine clockwise/counterclockwise
				if (_nextGesture.normal[0] > 0) {
					clockwise = false;
				} else {
					clockwise = true;
				}
				// Circle
				obj = {
					gesture: "circle",
					clockwise: clockwise,
					originalGesture: _nextGesture
				};
				
				statusObj = {
					type: "gesture",
					recognized: true,
					message: "A gesture has been recognized correctly.",
					gesture: "circle"
				};
				_options["statusChanged"](statusObj);

				_options["circle"](obj);
				return;
			} 

			//console.log(_lastGesture);
			switch (_nextGesture.swipeDirection) {
				case "up":
				case "down":
					dist = _gestureDistance[1];
					break;
				case "left":
				case "right":
					dist = _gestureDistance[0];
					break;
			}

			// Map distance from 0 - 2000 to 0 - 1
			dist = (dist - 0) / (2000 - 0) * (1 - 0) + 0;
			dist = Math.max(0, Math.min(dist, 1));

			// Map speed from 0 - 400 to 0 - 1
			speed = (_gestureSpeedCummulated / _gestureCount - 0) / (400 - 0) * (1 - 0) + 0;
			speed = Math.max(0, Math.min(speed, 1));

			//console.log(_gestureSpeedCummulated/_gestureCount);
			//console.log(speed);
			
			if(_options[eventName] !== null) {

				var eventName = "swipe"+_nextGesture.swipeDirection.charAt(0).toUpperCase() + _nextGesture.swipeDirection.slice(1);

				obj = {
					gesture: "swipe",
					distance: parseFloat(dist.toFixed(4)),
					speed: parseFloat(speed.toFixed(4)),
					direction: swipeDirection,
					originalGesture: _nextGesture
				};

				statusObj = {
					type: "gesture",
					recognized: true,
					message: "A gesture has been recognized correctly.",
					gesture: eventName
				};
				
				_options["statusChanged"](statusObj);
				_options[eventName](obj);
			}
			
			// Reset next gesture
			_nextGesture = null;
			_gestureSpeedCummulated = 0;
			_gestureDistance = [0, 0, 0];
			_gestureCount = 0;
		};
		
		self._clap = function(frame) {
			_lastHandTimestamp = new Date().getTime();
			
			// If not throttled, clap
			if(!_deferBlocked) {
				self._clapCall();
				_deferBlocked = true;
			}
			
			clearTimeout(_deferTimer);
			_deferTimer = setTimeout(self._clapReset, 250);
		};
		
		self._clapReset = function() {
			_deferBlocked = false;
		};
		
		self._clapCall = function() {
			var obj = {
				gesture: "clap"
			};
			
			statusObj = {
					type: "gesture",
					recognized: true,
					message: "A gesture has been recognized correctly.",
					gesture: "clap"
				};
				_options["statusChanged"](statusObj);
			
			_options["clap"](obj);
		};
		
		self._hand = function(frame) {
			_lastHandTimestamp = new Date().getTime();
			
			// As many fingers as before?
			if(_fingerCount == frame.fingerCount) {
				return;
			}
			
			_fingerCount = frame.fingerCount;
			clearTimeout(_deferTimer);
			_deferTimer = setTimeout(self._handCall, _options["handDuration"]);
		};
		
		self._handCall = function() {
			var now = new Date().getTime();
			if(now - _lastHandTimestamp > 50) return;
			
			var obj = {
				gesture: "hand",
				fingers: _fingerCount
			};
			
			statusObj = {
					type: "gesture",
					recognized: true,
					message: "A gesture has been recognized correctly.",
					gesture: "hand",
					fingers: _fingerCount
				};
				_options["statusChanged"](statusObj);
			
			_options["hand"](obj);
			_fingerCount = null;
		};
		
		self._initControllerEvents = function() {
			_options["swipeLeft"] = function(e) {
				self._controller.emit("gestureSwipeLeft", e);
			};
			_options["swipeRight"] = function(e) {
				self._controller.emit("gestureSwipeRight", e);
			};
			_options["swipeDown"] = function(e) {
				self._controller.emit("gestureSwipeDown", e);
			};
			_options["swipeUp"] = function(e) {
				self._controller.emit("gestureSwipeUp", e);
			};
			_options["circle"] = function(e) {
				self._controller.emit("gestureCircle", e);
			};
			_options["hand"] = function(e) {
				self._controller.emit("gestureHand", e);
			};
			_options["clap"] = function(e) {
				self._controller.emit("gestureClap", e);
			};
			_options["statusChanged"] = function(e) {
				self._controller.emit("statusChanged", e);
			};
		};

		self._initLeapLoop = function() {
			// Init Controller
			var c = (_options["controller"] != null) ? _options["controller"] : new Leap.Controller({
				enableGestures: true,
				frameEventName: 'animationFrame',
			});
			
			self._controller = c;
			c.connect();
			
			c.on("frame", function(frame) {
				// swipe or circle
				if (frame.gestures.length > 0) {
					frame.gestures.forEach(function(gesture) {

						// Check gesture confidence
						if (frame.hands.length < 1 || frame.hands[0].confidence < _options["confidenceThreshold"]) {
							var gestureType = gesture.type;
							
							if(gestureType == "swipe") {
							var isHorizontal = Math.abs(gesture.direction[0]) > Math.abs(gesture.direction[1]);
								//Classify as right-left or up-down
								if (isHorizontal) {
									if (gesture.direction[0] > 0) {
										swipeDirection = "right";
									} else {
										swipeDirection = "left";
									}
								} else { //vertical
									if (gesture.direction[1] > 0) {
										swipeDirection = "up";
									} else {
										swipeDirection = "down";
									}
								}
								gestureType += swipeDirection.charAt(0).toUpperCase() + swipeDirection.slice(1)	
							}
							
							var statusObj = {
								type: "gesture",
								recognized: false,
								message: "A gesture has not been recognized correctly.",
								gesture: gestureType
							};
							_options["statusChanged"](statusObj);
							return;
						}

						if ( (_options.swipeLeft !== null || _options.swipeRight !== null || _options.swipeUp !== null || _options.swipeDown !== null) && gesture.type == "swipe") {
							//swipe left, swipe right, swipe up, swipe down
							if (gesture.state == "stop") {
								// call when gesture ends

								self._gesture(gesture);
								return;
							}
						} else if (_options.circle !== null && gesture.type == "circle") {
							// circle gesture
							if (gesture.state == "stop") {
								// call when gesture ends

								self._gesture(gesture);
								return;
							}
						}
					});
				}
				
				// clap
				else if( (_options.clap !== null) && frame.hands.length == 2) {
					var hand1 = frame.hands[0];
					var hand2 = frame.hands[1];
					
					var vector = Leap.vec3.create();
					Leap.vec3.add(vector, hand1.palmNormal, hand2.palmNormal);
					
					var faceTogether = Math.abs(vector[0]) < 0.1;
					
					if(faceTogether) {
						var clapVelocity = Math.abs(hand1.palmVelocity[0]) + Math.abs(hand2.palmVelocity[0]);
						if(clapVelocity > 200) {
							frame.clapVelocity = clapVelocity;
							frame.clapVector = vector;
							self._clap(frame);
							return;
						}
					}
				}
				
				// grab & fist
				else if( (_options.hand !== null) && frame.gestures.length == 0 && frame.hands.length > 0) {
					var hand = frame.hands[0];
					
					// Grab
					if(hand.grabStrength > 0.8) {
						frame.fingerCount = 0;
						self._hand(frame);
					} else {
						// Goto channel
						
						// Count extended fingers
						var fingers = 0;
						for(j=0; j<frame.hands.length; j++) {
							for(i=0; i<frame.hands[j].fingers.length; i++) {
								if(frame.hands[j].fingers[i].extended) fingers++;
							}
						}
						if(fingers > 0) {
							frame.fingerCount = fingers;
							self._hand(frame);
						} 
					}
				}
			});
		
			self._controller.on("streamingStarted", self._leapConnected);
			self._controller.on("streamingStopped", self._leapDisconnected);
		};
		
		if(_options.useControllerEvents) self._initControllerEvents();
		self._initLeapLoop();
	};

	/**
	 * Public API
	 */
	LeapGestures.prototype = {
		/**
		 * configuration
		 */
		config: function(options) {
			// If options is not an object, reset it
			if (typeof options !== "object") {
				options = {};
			}

			// Check types of options
			if (typeof options.swipeLeft !== "function") {
				options.swipeLeft = null;
			}
			if (typeof options.swipeRight !== "function") {
				options.swipeRight = null;
			}
			if (typeof options.swipeUp !== "function") {
				options.swipeUp = null;
			}
			if (typeof options.swipeDown !== "function") {
				options.swipeDown = null;
			}
			if (typeof options.circle !== "function") {
				options.circle = null;
			}
			if (typeof options.hand !== "function") {
				options.hand = null;
			}
			if (typeof options.clap !== "function") {
				options.clap = null;
			}
			if (typeof options.statusChanged !== "function") {
				options.statusChanged = function() {
				};
			}
			if (typeof options.preventBackForth == "undefined") {
				options.preventBackForth = false;
			} else {
				options.preventBackForth = (options.preventBackForth == true);
			}
			if (typeof options.confidenceThreshold == "undefined") {
				options.confidenceThreshold = 0.25;
			} else {
				options.confidenceThreshold = parseFloat(options.confidenceThreshold);
			}
			if (typeof options.handDuration == "undefined") {
				options.handDuration = 1000;
			} else {
				options.handDuration = parseInt(options.handDuration);
			}
			if(typeof options.controller != "object") {
				options.controller = null;
			}
			if(typeof options.useControllerEvents != "boolean") {
				options.useControllerEvents = false;
			}

			return options;
		},
		debugOptions: function() {
			return this._debugOptions();
		},
		getLeapController: function() {
			return this._controller;
		},
		isConnected: function() {
			return this._isConnected;
		}
	}

	return LeapGestures;
}));