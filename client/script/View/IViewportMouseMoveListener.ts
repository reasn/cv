module ACV.View {

    export interface IViewportMouseMoveListener {
        (clientX: number, clientY: number, viewportDimensions: IViewportDimensions):void;
    }
}