"use strict";

/**
 * @since 2013-11-19
 */
var ACV = ACV ? ACV : {};

ACV.HUD = ACV.HUD ? ACV.HUD : {};

/**
 * @type {{
 *   _keyFrames: Array.<Object>
 *   _lastHeight: number
 * }}
 * @param keyFrames
 * @constructor
 */
ACV.HUD.HeightDisplay = function (keyFrames) {
    this._keyFrames = keyFrames;
};
/**
 *
 * @param {Object} data
 * @returns {ACV.HUD.HeightDisplay}
 */
ACV.HUD.HeightDisplay.createFromData = function (data) {
    return new ACV.HUD.HeightDisplay(data.keyFrames);
};

ACV.HUD.HeightDisplay.prototype = ACV.Core.createPrototype('ACV.HUD.HeightDisplay', {
    _keyFrames: [],
    _lastHeight: null
});

/**
 *
 * @param {jQuery} hudElement
 */
ACV.HUD.HeightDisplay.prototype.init = function (hudElement) {
    this.element = $('<div class="height-display" />');
    hudElement.append(this.element);

    this.debug('HeightDisplay initialized');
};
/**
 *
 * @param {number} ratio
 */
ACV.HUD.HeightDisplay.prototype.update = function (ratio) {
    var frameIndex, factor, height;
    var keys = Object.keys(this._keyFrames);

    // Automatically hide DOM-element when it's no longer needed
    if (ratio > keys[keys.length - 1] && this.elementVisible) {
        this.element.css('display', 'none');
        this.elementVisible = false;
        this.debug('Year display hidden.');

    } else if (ratio <= keys[keys.length - 1] && !this.elementVisible) {
        this.element.css('display', 'block');
        this.elementVisible = true;
        this.debug('Year display showed.');
    }


    for (frameIndex = 0; frameIndex < keys.length - 1; frameIndex++) {
        if (keys[frameIndex] > ratio || ratio > keys[frameIndex + 1]) {
            continue;
        }

        // a:= keys[i], b:=ratio, c:= keys[i+1] => factor = (b-a) / (c-a)
        factor = (ratio - keys[frameIndex]) / (keys[frameIndex + 1] - keys[frameIndex]);

        // h = (1-factor) * a + factor * b
        height = (1 - factor) * this._keyFrames[keys[frameIndex]] + factor * this._keyFrames[keys[frameIndex + 1]];
        break;

    }
    // Reduces draw calls
    if (height !== this._lastHeight) {
        this._lastHeight = height;
        this.element.text(Math.round(height));
    }
};