module ACV.View {

    export interface IViewportScrollListener {
        (lastRatio: number, ratioBefore: number, viewportDimensions: IViewportDimensions): void;
    }
}