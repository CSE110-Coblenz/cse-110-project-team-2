import Konva from "konva";
import { GameScreenModel } from "./GameScreenModel";
import { GameScreenView } from "./GameScreenView";
import { ToppingType,SLICE_OPTIONS } from "../../constants";
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


        this.drawSlicesButton(20,20,SLICE_OPTIONS[0])
		this.drawSlicesButton(20,100,SLICE_OPTIONS[1])
		this.drawSlicesButton(20,180,SLICE_OPTIONS[2])
		this.drawSlicesButton(20,260,SLICE_OPTIONS[3])


		this.drawToppingsButton(20,400,200,425,"mushrooms","brown",15)
		this.drawToppingsButton(20,480,200,505,"peppers","green",15)
		this.drawToppingsButton(20,550,200,575,"pepperoni","red",15)

		this.drawRemoveTopping(150,20,"mushrooms")
		this.drawRemoveTopping(150,100,"peppers")
		this.drawRemoveTopping(150,180,"pepperoni")

        this.view.show()
    }

    //draw specified number of slices on pizza
    private drawSlicesButton(cx:number,cy:number,slices:number):void{
        //button group
        const button=new Konva.Group({
            x:cx,
            y:cy,
        });

        //button shape
        const rect = new Konva.Rect({
            width: 100,
            height: 50,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
        });

        //button text
        const text = new Konva.Text({
            text: slices+' slices',
            fontSize: 20,
            fill: 'white',
            x: rect.width() / 2-30, 
            y: rect.height() / 2-10,
        });

        button.add(rect);
        button.add(text);
        this.view.group.add(button);

        //remove all toppings on pizza when number of slices change
        button.on("click", ()=>{
            this.model.sliceNum=slices;
            this.view.drawPizza(this.model.sliceNum)
            for(let topping of this.model.toppingsOnPizza.values()){
                for(let i=0;i<topping.length;i++){
                    topping[i].destroy()
                }
            }
            this.model.filled.clear();
            this.model.toppingsOnPizza.clear();
            this.view.updateFilledDisplay();
        })
    }

    //remove specific topping on pizza
    private drawRemoveTopping(cx:number,cy:number,topping:ToppingType):void{
        //button group
        const button=new Konva.Group({
            x:cx,
            y:cy,
        });

        //button shape
        const rect = new Konva.Rect({
            width: 200,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
        });

        //button text
        const text = new Konva.Text({
            text: `Remove ${topping}`,
            fontSize: 20,
            fill: 'white',
            x: rect.width() / 2-80, 
            y: rect.height() / 2-10,
        });

        button.add(rect);
        button.add(text);
        this.view.group.add(button);

        //remove specific topping
        button.on("click", ()=>{
            if(this.model.toppingsOnPizza.has(topping)){
                for(let node of this.model.toppingsOnPizza.get(topping)!){
                    node.destroy();
                }
                this.model.toppingsOnPizza.delete(topping);
                this.model.filled.get(topping)?.clear();
            }
            this.view.updateFilledDisplay();
            this.view.group.getLayer()?.batchDraw();

        })
    }


    private drawToppingsButton(buttonX:number,buttonY:number, toppingX:number,toppingY:number, 
                                toppingType:ToppingType, toppingColor:string, toppingRadius:number):void{
    
        //button group
        const toppingButton=new Konva.Group({
            x:buttonX,
            y:buttonY,
        });

        //button shape
        const rect = new Konva.Rect({
            width: 100,
            height: 50,
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 4,
        });

        //button text
        const text = new Konva.Text({
            text: toppingType,
            fontSize: 20,
            fill: 'white',
            x: rect.width() / 2 - 40, 
            y: rect.height() / 2 - 10,
        });
        toppingButton.add(rect);
        toppingButton.add(text);
        this.view.group.add(toppingButton);

        //create button on blick
        toppingButton.on("click",()=>{
            const topping=new Konva.Circle({
                stroke:"black",
                strokeWidth:4,
                radius:toppingRadius,
                fill:toppingColor,
                x:toppingX,
                y:toppingY,
                draggable:true,
                listening:true,
                name:toppingType
            })
            topping.setAttr("countedSlice",null)
            this.view.group.add(topping)

            //determine where topping is at end of drag and if it is on a slice
            topping.on("dragend",()=>{
                this.dragToppingLogic(topping,toppingType)
            })

        })
            
    }

    private dragToppingLogic(topping:Konva.Circle,toppingType:ToppingType){
        this.model.typeCheck(toppingType)
        const previousSlice=topping.getAttr("countedSlice")
        if(this.model.inPizza(topping.x(),topping.y())){
            //add to list of toppings on the pizza if its not there
            if(!this.model.toppingsOnPizza.get(toppingType)!.includes(topping)){
                this.model.toppingsOnPizza.get(toppingType)!.push(topping);
            }
            const currentSlice=this.model.sliceIndex(topping.x(),topping.y())

            if (previousSlice!==null&&previousSlice!==currentSlice){
                let removeSlice:boolean=true;
                //if theres other toppings on the same slice, don't remove that filled spot when the topping moved to another slice
                for(const other of this.model.toppingsOnPizza.get(toppingType)!){
                    if(other===topping){
                        continue
                    } 
                    const otherSlice=other.getAttr("countedSlice")
                    if(otherSlice!==null&&otherSlice===previousSlice){
                        removeSlice=false;
                        break;
                    }
                }
                if(removeSlice){
                    this.model.filled.get(toppingType)!.delete(previousSlice)
                }				
            }
            //update topping's location
            topping.setAttr("countedSlice",currentSlice)
            this.model.filled.get(toppingType)!.add(currentSlice)
        }
        else{
            //if topping is not on pizza remove it from the on pizza list and the filled set
            if(previousSlice!==null){
                this.model.filled.get(toppingType)!.delete(previousSlice);
                topping.setAttr("countedSlice", null);
            }
            const id=this.model.toppingsOnPizza.get(toppingType)!.indexOf(topping);
            if (id!==-1) {
                this.model.toppingsOnPizza.get(toppingType)!.splice(id,1);
            }
        }
        this.view.updateFilledDisplay()
    }

    startGame(){
        this.view.show()
    }

    endGame(){
        this.view.hide()
    }

    getView(): GameScreenView {
        return this.view;
    }
    
    
}