module ACV.View {

    export interface ViewportDimensions {

        width: number; //the viewport's width
        height :number; //the viewport's height
        widthChanged :boolean;//A flag whether the viewport width has just changed
        heightChanged :boolean; //A flag whether the viewport height has just changed
    }

}