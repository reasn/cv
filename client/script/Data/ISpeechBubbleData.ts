module ACV.Data {

    export interface ISpeechBubbleData {
        prefs: ISpeechBubblePrefs;
        messages: {[handle:string]:ISpeechBubbleMessage}
    }

}