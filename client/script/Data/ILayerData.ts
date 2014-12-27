module ACV.Data {

    export interface ILayerData {
        handle:string;
        prefs: ILayerPrefs;
        sprites:ISpriteData[];
    }
}