Leap Gestures
=================

A wrapper for LeapJS which enables easy gesture detection. Currently, swipe gestures, finger/fist detection, circle gestures and clap gestures a supported.

Try the demo: http://fnovy.com/projects/leap/

Current version: 0.2.0 // Last updatre: May 27th 2014


##Usage
You will of course need a Leap Motion and the Leap Motion SDK from https://developer.leapmotion.com/

Then, include the leapjs-script and leap-gestures.js:

    <script src="js/leap-0.6.0.min.js"></script>
    <script src="js/leap-gestures.js"></script>

You can now start using Leap Gestures! 

##Configuration
There are a few basic configuration options:

```js
config = {
    // Event handles for recognized gestures
    swipeLeft: swipeLeftFunction,
    swipeRight: swipeRightFunction,
    swipeUp: swipeUpFunction,
    swipeDown: swipeDownFunction,
    circle: null, // Set to null or leave out to not track this type of gesture
    hand: handFunction,
    clap: clapFunction,
    statusChanged: statusChangedFunction, // gets called when the status changes
    preventBackForth: true, // This enables users to continuously swipe in one direction.
    confidenceThreshold: 0.15, // Gestures with a confidence lower than this are ignored
    handDuration: 1500, // How long a fist has to be kept to trigger the event (in ms)
    controller: leapController, // You can pass in a LeapController if youo want, elsewise one is created for you. Remember to set "enableGestures: true"!
    useControllerEvents: false, // If set to true, the event functions will be ignored. You can then use the appropriate controller.on(...) functions (see below)
};
    
var leapGestures = new LeapGestures(config);
```

All "event" functions will get passed one parameter which some basic information.

The parameter ````preventBackForth````, if set, will prevent swipe gestures in the opposite direction shortly after a swipe gesture.
````confidenceThreshold```` is a number between 0 and 1 which determines how uncertain Leap has to be about a gesture to ignore it.
````handDuration```` is the number of milliseconds a hand gesture has to be kept to call the event.

If an event is set to null or not set at all, this type of gesture will not be tracked.

If you set ````useControllerEvents```` to true, the event functions (swipeLeft, circle, ...) will NOT be called. Instead, you have to use controller.on(...) functions. You can get the controller with ````yourLeapGestureInstance.getLeapController()````.

The corresponding event names are:

```js
var leapGestures = new LeapGestures({useControllerEvents: true});
var c = leapGestures.getLeapController();
c.on("gestureSwipeLeft", swipeLeftFunction);
c.on("gestureSwipeRight", swipeRightFunction);
c.on("gestureSwipeUp", swipeUpFunction);
c.on("gestureSwipeDown", swipeDownFunction);
c.on("gestureCircle", circleFunction);
c.on("gestureClap", clapFunction);
c.on("gestureHand", handFunction);
c.on("statusChanged", statusChangedFunction);
```

For examples on how it can be used, see the index.html (which contains the demo).

##Methods
There are a few functions you can use:

````leapGestures.getLeapController()```` will return the Leap.Controller instance.

````leapGestures.isConnected()```` will return true if a Leap Motion is connected, otherwise false.

````leapGestures.debugOptions()```` will return the passed options (for debugging purposes).

##Notes
While the swipe and hand gestures work quite well, the circle gesture is (in my tests) sometimes called wrongly. I suspect this is a Leap problem. The clap detection is very basic and alpha, it works more or less but not extremly well.

##Changelog
* v0.2.0
 * You can now pass a Leap Controller
 * You can now use emitted events by the Leap Controller
 * Gesture-events now have a property "originalGesture"
 * clap is now called immediatley (and not afterwards)
* v0.1.0 
 * Initial release

##Author
LeapGestures has been created by Francesco Novy | http://www.fnovy.com | francesconovy@gmail.com | @_fnovy

##Copyright
Copyright © 2014 Francesco Novy | MIT license