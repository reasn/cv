module ACV.Game {
    export interface IPlayerMovementListener {
        (playerX: number,
         payerXBefore: number,
         targetPlayerX?: number,
         playerY?:number,
         sceneX?: number,
         viewportDimensions?: ACV.View.IViewportDimensions): void;
    }
}