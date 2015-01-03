module ACV.Data {

    export interface ILevelPrefs {
        offset: number;
        background: string;
        clip: {
            x1: number;
            x2: number;
        }
        visibility: {
            x1: number;
            x2: number;
        }
    }
}