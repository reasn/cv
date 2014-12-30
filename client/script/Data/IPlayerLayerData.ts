module ACV.Data {

    export interface IPlayerLayerData {
        player: IPlayerPrefs;
        prefs: IPlayerLayerPrefs;
        speechBubble: ISpeechBubbleData;
        powerUps: IPowerUpData[];
    }
}