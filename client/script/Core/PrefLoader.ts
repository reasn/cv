/// <reference path="../Game/Animation"/>

module ACV.Core {
    export class PrefLoader extends ACV.Core.AbstractObject {

        static FORCE_UNCACHED_DATA = true;

        gameData: ACV.Data.IAppData = null;

        constructor() {
            super('ACV.Core.PrefLoader');
        }

        /**
         * Loads general game data and dependent resources for all levels via asynchronous requests to the server.
         *
         * @param {function(this:ACV.Core.PrefLoader, object)} qFx The function to be called when loading is complete
         * @returns void
         * @version 2014-02-28
         * @since 2014-02-28
         * @author Alexander Thiel
         */
        load(qFx: ()=>void) {

            $.getJSON(this.createUrl('game.json'), (gameData: ACV.Data.IAppData) => {
                this.gameData = gameData;

                this.loadLevels(gameData.scene.levels, () => {
                    this.info('Preferences and levels loaded.');
                    qFx.apply(this, [this.gameData]);
                });
            });
        }

        /**
         * Loads all levels as described in the given array of level descriptors.
         *
         * @param {string} url The url to enhance.
         * @returns string
         * @private
         * @version 2014-02-28
         * @since 2014-02-28
         * @author Alexander Thiel
         */
        private createUrl(url: string) {
            url = 'assets/' + url;
            if (PrefLoader.FORCE_UNCACHED_DATA)
                url += '?timestamp=' + (new Date()).getTime();
            return url;
        }

        /**
         * Loads all levels as described in the given array of level descriptors.
         *
         * @param {Array.<object>} levels The level descriptors
         * @param {function(this:ACV.Core.PrefLoader, object)} qFx
         * @returns void
         * @private
         * @version 2014-02-28
         * @since 2014-02-28
         * @author Alexander Thiel
         */
        private loadLevels(levels: ACV.Data.ILevelData[], qFx: ()=>void) {
            var loadNextLevel: ()=>void,
                levelIndex = 0;

            this.info('Loading ' + levels.length + ' levels.');

            loadNextLevel = () => {

                this.loadLevel(levels[levelIndex], () => {

                    if (++levelIndex < levels.length) {
                        loadNextLevel();
                    } else {
                        qFx.apply(this, [this.gameData]);
                    }
                });
            };
            loadNextLevel();
        }

        /**
         * Loads dependent resources for a given level
         *
         * @param {object} level
         * @param {function(this:ACV.Core.PrefLoader)} qFx
         * @returns void
         * @private
         * @version 2014-02-28
         * @since 2014-02-28
         * @author Alexander Thiel
         */
        private loadLevel(level: ACV.Data.ILevelData, qFx: ()=>void) {
            var filesToLoad = 4;

            if (!level.enabled) {
                this.info('Loading level ' + level.handle + ' because it is disabled.', 'i');
                qFx.apply(this);
                return;
            }

            this.info('Loading level ' + level.handle, 'i');

            var wrappedQfx = ()=> {
                if (--filesToLoad === 0) {
                    qFx.apply(this);
                }
            };

            $.getJSON(this.createUrl('map/' + level.handle + '/layers.json'), (layers) => {
                level.layers = layers;
                wrappedQfx.apply(this);
            });

            $.getJSON(this.createUrl('map/' + level.handle + '/triggers.json'), (triggers) => {
                this.loadTriggers(level.prefs.offset, triggers, wrappedQfx);
            });
            $.getJSON(this.createUrl('map/' + level.handle + '/powerUps.json'), (powerUps) => {
                this.loadPowerUps(level.prefs.offset, powerUps, wrappedQfx);
            });
            $.get(this.createUrl('map/' + level.handle + '/animations.js'), (animationSource) => {
                this.loadAnimations(level, animationSource, wrappedQfx);
            });
        }

        /**
         * Loads all trgiggers for a specific level.
         *
         * @returns void
         * @private
         * @version 2014-02-28
         * @since 2014-02-28
         * @author Alexander Thiel
         */
        private loadTriggers(levelOffset: number, triggers: ACV.Data.ITriggerData[], qFx: ()=>void) {
            var triggerIndex: any;
            for (triggerIndex in triggers) {
                this.gameData.scene.triggers.push(triggers[triggerIndex]);
            }
            qFx.apply(this);
        }

        /**
         * Loads all power ups for a specific level.
         *
         * @version 2014-02-28
         * @since 2014-02-28
         * @author Alexander Thiel
         */
        private loadPowerUps(levelOffset: number, powerUps: ACV.Data.IPowerUpData[], qFx: ()=>void) {
            var powerUpIndex: any;
            for (powerUpIndex in powerUps) {
                this.gameData.scene.playerLayer.powerUps.push(powerUps[powerUpIndex]);
            }
            qFx.apply(this);
        }

        /**
         * Loads animations consisting of parameters and function bodies.
         *
         * This function uses "new Function" instead of "eval" as a security measure in order
         * to make sure that the code executed cannot get a reference to any of the game's objects.
         *
         * @version 2014-03-05
         * @since 2014-03-05
         * @author Alexander Thiel
         */
        private loadAnimations(level: ACV.Data.ILevelData, animationSource: string, qFx: ()=>void) {
            var customScope: Function,
                animations: ACV.Game.Animation[];

            customScope = new Function(animationSource + 'return animations;');
            level.animations = customScope();
            qFx.apply(this);
        }
    }
}