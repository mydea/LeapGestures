Leap Gestures
=================

A wrapper for LeapJS which enables easy gesture detection. Currently, swipe gestures, finger/fist detection, circle gestures and clap gestures a supported.

Try the demo: http://fnovy.com/projects/leap/

##Usage
You will of course need a Leap Motion and the Leap Motion SDK from https://developer.leapmotion.com/

Then, include the leapjs-script and leap-gestures.js:

    <script src="js/leap-0.6.0.min.js"></script>
    <script src="js/leap-gestures.js"></script>

You can now start using Leap Gestures! 

##Configuration
There are a few basic configuration options:

    // Test Configuration
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
    };
    
    var leapGestures = new LeapGestures(config);

All "event" functions will get passed one parameter which some basic information.

The parameter ````preventBackForth````, if set, will prevent swipe gestures in the opposite direction shortly after a swipe gesture.
````confidenceThreshold```` is a number between 0 and 1 which determines how uncertain Leap has to be about a gesture to ignore it.
````handDuration```` is the number of milliseconds a hand gesture has to be kept to call the event.

If an event is set to null or not set at all, this type of gesture will not be tracked.

For examples on how it can be used, see the index.html (which contains the demo).

##Notes
While the swipe and hand gestures work quite well, the circle gesture is (in my tests) sometimes called wrongly. I suspect this is a Leap problem. The clap detection is very basic and alpha, it works more or less but not extremly well.

##Author
LeapGestures has been created by Francesco Novy | http://www.fnovy.com | francesconovy@gmail.com | @_fnovy

##Copyright
Copyright © 2014 Francesco Novy | MIT license