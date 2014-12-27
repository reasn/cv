module ACV.Game {

    export interface ISpriteCallback {
        (maxLookAroundDistortion: number,
         viewportHeight: number,
         sprites: {[key:string]:{top: number; bottom: number}}):number;
    }
}