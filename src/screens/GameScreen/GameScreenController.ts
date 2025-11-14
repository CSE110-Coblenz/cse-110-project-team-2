import Konva from "konva";
import { GameScreenModel } from "./GameScreenModel";
import { GameScreenView } from "./GameScreenView";
import { PIZZA } from "../../constants";
import { ScreenController, Difficulty, Order } from "../../types";
import { ScreenSwitcher } from "../../types";

export class GameScreenController extends ScreenController{
    private model:GameScreenModel;
    private view:GameScreenView;
    private screen?: ScreenSwitcher;

    constructor(screenSwitcher?: ScreenSwitcher){
        super()
        this.view = new GameScreenView(() => this.handleBackToMenuClick());
        this.model=this.view.model
        this.screen=screenSwitcher;

        this.view.show()
    }

    getView(): GameScreenView {
        return this.view;
    }
    
    private handleBackToMenuClick(){
        this.screen?.switchToScreen({type:"menu"});
    }
    startGame(difficulty: Difficulty, order:Order): void {
        // Configure game based on difficulty level:
        // proper: generates only proper fractions (numerator < denominator)
        // improper: generates only improper fractions (numerator > denominator)
        // mixed: generates both proper and improper fractions
        console.log(`Starting game with ${difficulty} difficulty`);
        if (order){
            // forward the order to the view
            this.view.displayOrder(order);
        }
        this.view.show();
    }

    endGame(){
        this.view.hide()
    }

    
    
}