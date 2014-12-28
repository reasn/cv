module ACV.Data {

    export interface IPlayerPrefs {
        position: {
            y:number;
            min:number;
            max:number;
            target:number;
        }
        fastWalkMultiplicator: number;
        movementTriggerInterval: number;
        movementTriggerGranularity: number;
        initialAge: string;
        ages: {[handle:string]: IPlayerAgePref};
    }
}