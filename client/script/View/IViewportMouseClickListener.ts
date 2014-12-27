module ACV.View {

    export interface IViewportMouseClickListener {
        (clientX: number, clientY: number, viewportDimensions: IViewportDimensions):void;
    }
}