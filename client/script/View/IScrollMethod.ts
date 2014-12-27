module ACV.View {
    export interface IScrollMethod {
        init(containerDistanceFromTop: number): void;
        handleFixation(staticContainer: JQuery):void;
        isGameActive():boolean;
    }
}
