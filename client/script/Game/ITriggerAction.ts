module ACV.Game {

    export interface ITriggerAction {
        action: string; //The action to take (e.g. "player.setAge")
        args: string[]; //The arguments to accompany the action
    }
}