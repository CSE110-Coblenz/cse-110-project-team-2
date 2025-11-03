import Konva from "konva";
import { GameScreenModel } from "./GameScreenModel";
import { GameScreenView } from "./GameScreenView";
import { ToppingType } from "../../constants";
import { ScreenController } from "../../types";
import { ScreenSwitcher } from "../../types";

export class GameScreenController extends ScreenController{
    private model:GameScreenModel;
    private view:GameScreenView;
    private screen?: ScreenSwitcher;

    constructor(screenSwitcher?: ScreenSwitcher){
        super()
        this.view=new GameScreenView()
        this.model=this.view.model
        this.screen=screenSwitcher;

        this.view.show()
    }

    getView(): GameScreenView {
        return this.view;
    }

    startGame(){
        this.view.show()
    }

    endGame(){
        this.view.hide()
    }

    
    
}