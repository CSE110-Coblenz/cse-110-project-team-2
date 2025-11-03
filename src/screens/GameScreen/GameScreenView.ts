import Konva from "konva";
import { STAGE_HEIGHT,STAGE_WIDTH, SLICE_OPTIONS, ToppingType } from "../../constants";
import { GameScreenModel } from "./GameScreenModel";
import { View } from "../../types";

export class GameScreenView implements View{
    group: Konva.Group;
    pizzaGroup =new Konva.Group();
    sliceArcs:Konva.Arc[]=[];
    status:Konva.Text;

    model=new GameScreenModel()

    constructor() {
        this.group = new Konva.Group({ visible: false });
        const bg = new Konva.Rect({
            x: 0,
            y: 0,
            width: STAGE_WIDTH,
            height: STAGE_HEIGHT,
            fill: "#87CEEB"
        });
        this.status = new Konva.Text({ x: 520, y: 20, text: '', fontSize: 16, fill: 'black' });
        this.group.add(bg);
        this.group.add(this.pizzaGroup)
        this.group.add(this.status);


        this.drawSlicesButton(20,20,SLICE_OPTIONS[0])
        this.drawSlicesButton(20,100,SLICE_OPTIONS[1])
        this.drawSlicesButton(20,180,SLICE_OPTIONS[2])
        this.drawSlicesButton(20,260,SLICE_OPTIONS[3])


        this.drawToppingsButton(20,400,200,425,"Mushroom","brown",15)
        this.drawToppingsButton(20,480,200,505,"Pepper","green",15)
        this.drawToppingsButton(20,550,200,575,"Pepperoni","red",15)

        this.drawRemoveTopping(150,20,"Mushroom")
        this.drawRemoveTopping(150,100,"Pepper")
        this.drawRemoveTopping(150,180,"Pepperoni")

        this.show()
    }


    drawPizza(slices: number): void {
        //reset pizza
        this.sliceArcs=[];
        this.pizzaGroup.destroyChildren();

        //build the base circle
        const pizzaBase = new Konva.Circle({
            x:this.model.pizzaX,
            y:this.model.pizzaY,
            radius:this.model.rOuter,
            stroke:'black',
            strokeWidth:4,
            fill:"yellow",
            listening:false
        });
        this.pizzaGroup.add(pizzaBase);
        const degPer = 360 / slices;

        //draw lines showing slice separation
        for (let i=0; i<slices; i++) {
            const a=((i*degPer)*Math.PI)/180;
            const x2= this.model.pizzaX+this.model.rOuter*Math.cos(a);
            const y2= this.model.pizzaY+this.model.rOuter*Math.sin(a);
            this.pizzaGroup.add(
                new Konva.Line({
                    points:[this.model.pizzaX, this.model.pizzaY, x2, y2],
                    stroke:'black',
                    strokeWidth:4,
                    listening:false
                })
            );
        }
        //draw individual slices with ID
        for (let i=0;i<slices;i++) {
            const arc= new Konva.Arc({
                x:this.model.pizzaX,
                y:this.model.pizzaY,
                innerRadius:0,
                outerRadius:this.model.rOuter,
                angle:degPer,
                rotation:i*degPer,
                stroke:'black',
                fill:'yellow',
                strokeWidth: 4,
                id:`slice-${i}`,
                name:'slice',
            });
            this.pizzaGroup.add(arc);
            this.sliceArcs.push(arc);
        }
        this.pizzaGroup.getLayer()?.batchDraw();
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
            fontSize:20,
            fill:'white',
            width:rect.width(),
            align: 'center',
            y: rect.height()/2-10,
            x: 0,
        });

        button.add(rect);
        button.add(text);
        this.group.add(button);

        //remove all toppings on pizza when number of slices change
        button.on("click", ()=>{
            this.model.sliceNum=slices;
            this.drawPizza(this.model.sliceNum)
            for(let topping of this.model.toppingsOnPizza.values()){
                for(let i=0;i<topping.length;i++){
                    topping[i].destroy()
                }
            }
            this.model.filled.clear();
            this.model.toppingsOnPizza.clear();
            this.updateFilledDisplay();
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
            width: rect.width(),
            align: 'center',
            y: rect.height()/2-10,
            x: 0,
        });

        button.add(rect);
        button.add(text);
        this.group.add(button);

        //remove specific topping
        button.on("click", ()=>{
            if(this.model.toppingsOnPizza.has(topping)){
                for(let node of this.model.toppingsOnPizza.get(topping)!){
                    node.destroy();
                }
                this.model.toppingsOnPizza.delete(topping);
                this.model.filled.get(topping)?.clear();
            }
            this.updateFilledDisplay();
            this.group.getLayer()?.batchDraw();

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
            width: rect.width(),
            align: 'center',
            y: rect.height()/2-10,
            x: 0,
        });
        toppingButton.add(rect);
        toppingButton.add(text);
        this.group.add(toppingButton);

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
            this.group.add(topping)

            //determine where topping is at end of drag and if it is on a slice
            topping.on("dragend",()=>{
                this.dragToppingLogic(topping,toppingType)
            })

        })
            
    }

    dragToppingLogic(topping:Konva.Circle,toppingType:ToppingType){
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
        this.updateFilledDisplay()
    }
    

    updateFilledDisplay() {
		if (!this.model.sliceNum) { this.status.text(''); return; }
		const lines: string[] = [];
		for (const [type, set] of this.model.filled.entries()) {
			lines.push(`${type}: ${set.size} / ${this.model.sliceNum}`);
		}
		this.status.text(lines.length ? lines.join('\n') : '');
		this.group.getLayer()?.batchDraw();
	}

    getGroup(): Konva.Group {
        return this.group;
    }

    show(): void {
		this.group.visible(true);
	}

	hide(): void {
		this.group.visible(false);
	}
}