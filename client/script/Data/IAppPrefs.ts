module ACV.Data {

    export interface IAppPrefs {
        totalDistance:number;
        ieFactor:number;
        maxLookAroundDistortion: number;
        assetPath: string;
        performanceSettings: IPerformanceSettings;
    }
}