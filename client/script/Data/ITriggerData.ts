module ACV.Data {

    export interface ITriggerData {
        playerX?: any;
        levelX?: any;
        enabled?: boolean;
        before: string[];
        after: string[];
        fireOnEnter: boolean;
    }
}