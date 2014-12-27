module ACV.Data {

    export interface ITimelineEventData {
        playerX: number;
        timestamp: string;
        type:string;
        data: ITimelinePost;
    }

}