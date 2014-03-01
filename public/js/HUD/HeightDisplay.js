"use strict";

/**
 * @since 2013-11-19
 */
var ACV = ACV ? ACV : new Object();

ACV.HUD = ACV.HUD ? ACV.HUD : new Object();

ACV.HUD.HeightDisplay = function(keyframes) {
	this.keyframes = keyframes;
};

ACV.HUD.HeightDisplay.createFromData = function(data, performanceSettings) {
	return new ACV.HUD.HeightDisplay(data.keyframes);
};

ACV.HUD.HeightDisplay.prototype = ACV.Core.createPrototype('ACV.HUD.HeightDisplay', {
	triggers : [],
	lastHeight : null
});

ACV.HUD.HeightDisplay.prototype.init = function(hudElement) {
	this.element = $('<div id="height">' + this.year + '</div>');
	hudElement.append(this.element);

	this.debug('HeightDisplay initialized');
};

ACV.HUD.HeightDisplay.prototype.update = function(ratio) {
	var i, factor, height;
	var keys = Object.keys(this.keyframes);

	// Automatically hide DOM-element when it's no longer needed
	if (ratio > keys[keys.length - 1] && this.elementVisible) {
		this.element.css('display', 'none');
		this.elementVisible = false;

	} else if (!this.elementVisible) {
		this.element.css('display', 'block');
		this.elementVisible = true;
	}

	for (i = 0; i < keys.length - 1; i++) {
		if (keys[i] <= ratio && ratio <= keys[i + 1]) {
			// a:= keys[i], b:=ratio, c:= keys[i+1] => factor = (b-a) / (c-a)
			factor = (ratio - keys[i]) / (keys[i + 1] - keys[i]);
			// h = (1-factor) * a + factor * b
			height = (1 - factor) * this.keyframes[keys[i]] + factor * this.keyframes[keys[i + 1]];

			break;
		}
	}
	// Reduces draw calls
	if (height !== this.lastHeight) {
		this.lastHeight = height;
		this.element.text(Math.round(height));
	}
};