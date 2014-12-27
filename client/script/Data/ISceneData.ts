module ACV.Data {

    export interface ISceneData {
        prefs: IScenePrefs;
        playerLayer: IPlayerLayerData;
        levels: ILevelData[];
        triggers: ITriggerData[];
    }
}