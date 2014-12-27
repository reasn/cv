module ACV.Data {

    export interface IPerformanceSettings {
        lookAroundDistortion: boolean;
        yearDisplay: boolean;
        heightDisplay: boolean;
    }
    export interface IAppPrefs {
        totalDistance:number;
        ieFactor:number;
        maxLookAroundDistortion: number;
        assetPath: string;
        performanceSettings: IPerformanceSettings;
    }

    export interface IAppData {
        hud: IHudData;
        scene: ISceneData;
        prefs: IAppPrefs;
    }

    export interface ISkillBasketData {
        skills: string[];
    }

    export interface IHudPrefs {
        height:number;
    }
    export interface IYearDisplayData {
        triggers: {[key:string]:number};
    }
    export interface IHeightDisplayData {
        keyFrames: {[key:string]:number};
    }
    export interface ITimelineData {

    }
    export interface ITimelinePost {
        author:string;
        message:string;
    }

    export interface ITimelineElementData {
        playerX: number;
        timestamp: string;
        type:string;
        data: ITimelinePost;
    }

    export interface IHudData {
        skillBasket:ISkillBasketData;
        yearDisplay: IYearDisplayData;
        heightDisplay: IHeightDisplayData;
        timeline: ITimelineData;
        prefs: IHudPrefs;
    }

    export interface IScenePrefs {
        width:           number;
        dynamicViewport: {
            minHeight: number;
        }
    }

    export interface IPlayerAgePref {
        width: number;
        height:number;
    }
    export interface IPlayerPrefs {
        position: {
            y:number;
            min:number;
            max:number;
            target:number;
        }
        fastWalkMultiplicator:number;
        movementTriggerGranularity:number;
        initialAge:string;
        ages: {[handle:string]: IPlayerAgePref};
    }
    export interface IPowerUpData {
        x:number;
        y:number;
        type: string;
    }

    export interface IPlayerLayerPrefs {
        hitBox:number;
    }

    export interface IPlayerLayerData {
        player: IPlayerPrefs;
        powerUps: IPowerUpData[];
        prefs: IPlayerLayerPrefs;
    }
    export interface ILayerPrefs {
        speed:number;
        offset:number;
    }

    export interface ISpriteData {
        y:string;//or number
        handle:string;
        height:string;//or number
        id:string;
        x:number;
        width:number;
        topAligned:boolean;
        source:string;
        color:string;
        blurred:boolean;
    }

    export interface ILayerData {
        handle:string;
        prefs: ILayerPrefs;
        sprites:ISpriteData[];
    }
    export interface ILevelPrefs {
        offset:number;
        clip: {
            x1: number;
            x2: number;
        }
        visibility: {
            x1: number;
            x2: number;
        }
    }
    export interface IAnimationData {
    }
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

    export interface ITriggerData {
        playerX:any;
        before: string;
        after: string;
        fireOnEnter:boolean;
    }

    export interface ISceneData {
        prefs: IScenePrefs;
        playerLayer: IPlayerLayerData;
        levels: ILevelData[];
        triggers: ITriggerData[];
    }
}