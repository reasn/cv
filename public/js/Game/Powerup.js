"use strict";

/**
 * @since 2013-11-19
 */
var ACV = ACV ? ACV : {};

ACV.Game = ACV.Game ? ACV.Game : {};

ACV.Game.PowerUp = function (x, y, skillType) {
    this.x = x;
    this.y = y;
    this.skillType = skillType;
};
ACV.Game.PowerUp.prototype = ACV.Core.createPrototype('ACV.Game.PowerUp',
    {
        x: 0,
        y: 0,
        skillType: '',
        element: null
    });

ACV.Game.PowerUp.prototype.init = function (playerLayerElement) {
    this.element = $('<div class="powerUp" />');
    this.element.css(
        {
            left: this.x,
            bottom: this.y
        });
    this.element.text(this.x);

    playerLayerElement.append(this.element);

    this.debug('PowerUp initialized');
};
ACV.Game.PowerUp.prototype.hasJustBeenCollected = function (playerX) {
    return playerX >= this.x;
};
