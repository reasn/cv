"use strict";

/**
 * @since 2013-11-19
 */
var ACV = ACV ? ACV : {};

ACV.HUD = ACV.HUD ? ACV.HUD : {};

ACV.HUD.HeightDisplay = function(keyFrames) {
	this.keyFrames = keyFrames;
};

ACV.HUD.HeightDisplay.createFromData = function(data, performanceSettings) {
	return new ACV.HUD.HeightDisplay(data.keyFrames);
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
	var frameIndex, factor, height;
	var keys = Object.keys(this.keyFrames);

	// Automatically hide DOM-element when it's no longer needed
	if (ratio > keys[keys.length - 1] && this.elementVisible) {
		this.element.css('display', 'none');
		this.elementVisible = false;

	} else if (!this.elementVisible) {
		this.element.css('display', 'block');
		this.elementVisible = true;
	}

	for (frameIndex = 0; frameIndex < keys.length - 1; frameIndex++) {
		if (keys[frameIndex] <= ratio && ratio <= keys[frameIndex + 1]) {
			// a:= keys[i], b:=ratio, c:= keys[i+1] => factor = (b-a) / (c-a)
			factor = (ratio - keys[frameIndex]) / (keys[frameIndex + 1] - keys[frameIndex]);
			// h = (1-factor) * a + factor * b
			height = (1 - factor) * this.keyFrames[keys[frameIndex]] + factor * this.keyFrames[keys[frameIndex + 1]];

			break;
		}
	}
	// Reduces draw calls
	if (height !== this.lastHeight) {
		this.lastHeight = height;
		this.element.text(Math.round(height));
	}
};