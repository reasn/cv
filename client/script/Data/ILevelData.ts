module ACV.Data {

    export interface ILevelData {
        handle:string;
        enabled:boolean;
        layers:{
            foreground: ILayerData[];
            background: ILayerData[];
        }
        prefs: ILevelPrefs;
        animations:IAnimationData[];
    }
}