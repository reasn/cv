module ACV.Data {

    export interface ISpriteData {
        handle: string;
        x: number;
        y: string;//or number
        height: string;//or number
        width: number;
        id: string;
        topAligned: boolean;
        source: string;
        fontSymbol?: ISpriteFontSymbol;
        color: string;
        patterned: boolean;
        blur: number;
    }
}