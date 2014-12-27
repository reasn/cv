module ACV.Data {

    export interface IHudData {
        skillBasket:ISkillBasketData;
        yearDisplay: IYearDisplayData;
        heightDisplay: IHeightDisplayData;
        timeline: ITimelineData;
        prefs: IHudPrefs;
    }
}