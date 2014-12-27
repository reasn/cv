module ACV.Data {

    export interface IPlayerLayerData {
        player: IPlayerPrefs;
        powerUps: IPowerUpData[];
        prefs: IPlayerLayerPrefs;
    }
}