module ACV.View {
    export interface ScrollMethod {
        init(containerDistanceFromTop: number): void;
        handleFixation(staticContainer: JQuery):void;
        isGameActive():boolean;
    }
}
