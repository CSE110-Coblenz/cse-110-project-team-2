import Konva from "konva";
import { STAGE_HEIGHT,STAGE_WIDTH, SLICE_OPTIONS, ToppingType, ORDERS_PER_DAY } from "../../constants";
import { GameScreenModel } from "./GameScreenModel";
import type { View, Order, Difficulty } from "../../types";
import { OrderScreenModel } from "../OrderScreen/OrderScreenModel";
import { PIZZA } from "../../constants";
import { FONTS } from "../../fonts";
import { ResultStore } from "../../data/ResultStore";
import { OrderResult, PlacedTopping } from "../../data/OrderResult";

export class GameScreenView implements View {
    group: Konva.Group;
    pizzaGroup =new Konva.Group();
    sliceArcs:Konva.Arc[]=[];
    private orderDisplay: Konva.Text;
    private currentOrder?: Order;
    private currentDifficulty: Difficulty = "proper";
    private orderNum=1;
    private orderNumber:Konva.Text
    private day:number=1
    private dayDisplay:Konva.Text
    public onOrderSuccess: (difficulty: Difficulty) => void = () => {};
    public onGoToMinigame1: () => void = () => {};
    private onBackToMenuClick: () => void;


    model=new GameScreenModel()
    private rOuter=0;

    private resultStore: ResultStore;

    constructor(onBackToMenuClick: () => void, resultStore: ResultStore, onOrderSuccess?: (difficulty?: Difficulty) => void) {
    // onOrderSuccess is called when the current order was completed successfully
        this.onBackToMenuClick = onBackToMenuClick;
        this.resultStore = resultStore;
        this.group = new Konva.Group({ visible: false });
        const basePizza=new Image()
        basePizza.src='/pizza.png'
        basePizza.onload=()=>{
            this.rOuter=basePizza.width/2*.8-5
        } 

        this.drawBackground()

        this.group.add(this.pizzaGroup)

        const sliceText = new Konva.Text({
            text: "Pizza Size",
            fontSize:36,
            fill:'white',
            align: 'center',
            x: 150, 
            y: 440,
        });
        sliceText.offsetX(sliceText.width()/2)
        this.group.add(sliceText)
        this.drawSlicesButton(150,485,SLICE_OPTIONS[0])
        this.drawSlicesButton(150,521.67,SLICE_OPTIONS[1]) //lol
        this.drawSlicesButton(150,558.33,SLICE_OPTIONS[2])
        this.drawSlicesButton(150,595,SLICE_OPTIONS[3])

        const numPizzaText = new Konva.Text({
            text:"# Pizzas",
            fontSize:36,
            fill:'white',
            align: 'center',
            x: 150, 
            y: 270,
        });
        numPizzaText.offsetX(numPizzaText.width()/2)
        this.drawPizzaButton(150, 320, 1)
        this.drawPizzaButton(150, 350, 2)
        this.group.add(numPizzaText)


        this.drawTopping(450,170,"Mushroom","mushroom.png",0.75)
        this.drawTopping(675,170,"Pepperoni","pepperoni.png",0.75)
        this.drawTopping(900,170,"Basil","basil.png",0.075)

        const tongs=new Image()
        tongs.src='/tongs.png'
        const Ytong:number=STAGE_HEIGHT*1/3-16
        tongs.onload=()=>{
            const tongsIm=new Konva.Image({
                scaleX:0.5, 
                scaleY:0.5,
                image:tongs,
                offsetX:tongs.width/2,
                offsetY:tongs.height/2,
                listening:true,
                x:1090,
                y:Ytong,
                draggable:true,
                rotation:60

            })
            this.group.add(tongsIm);
            tongsIm.on('dragstart',()=>{
                tongsIm.rotation(0)
                this.group.getLayer()?.batchDraw();

            })
            tongsIm.on("dragend", () => {

                const box=tongsIm.getClientRect();
                const tongX=box.x+box.width/2;
                const tongY=box.y+box.height/2;
                const radius=40;
                const toppings= this.group.find("Circle");
                let minDist=radius*radius
                let closestNode;
                let closestType;
                toppings.forEach((node: Konva.Node)=>{
                    const rect=node.getClientRect();
                    const x=rect.x+rect.width/2-tongX;
                    const y=rect.y+rect.height/2-tongY;
                    const dist=x*x+y*y

                    if (dist<=minDist) {
                        minDist=dist;
                        closestNode=node;
                        closestType=node.getAttr("toppingType") as ToppingType;
                    }
                });

                tongsIm.setPosition({ x:1090, y:Ytong});
                tongsIm.rotation(60)

                if (!closestNode||!closestType) {
                    this.group.getLayer()?.batchDraw();
                    return;
                }
                this.removeTopping(closestType);
                this.group.getLayer()?.batchDraw();
            });



        }
        const orderHeader = new Konva.Text({
            text:"Order:",
            fontSize:36,
            fill:'black',
            align: 'center',
            x: 160, 
            y: 20,
        });

        orderHeader.offsetX(orderHeader.width()/2)
        this.group.add(orderHeader)
        this.orderDisplay = new Konva.Text({
            x: 40,
            y: 70,
            width: 250,
            text: '',
            fontSize: 20,
            fill: 'black',
            align: 'center',
        });
        this.group.add(this.orderDisplay);

        //submit button
        const submitGroup = new Konva.Group({ x: STAGE_WIDTH - 142.5, y: STAGE_HEIGHT-135 });

        const submit = new Konva.Rect({
            width: 135,
            height: 135,
            fill: "green",
            cornerRadius: 8,
            stroke: "green",
            strokeWidth: 2,
        });

        const submitText = new Konva.Text({
            x: 67.5,
            y: 67.5,
            text: "Submit",
            fontSize: 36,
            fill: "white",
            align:'center'
        });
        submitText.offsetX(submitText.width() / 2);
        submitText.offsetY(submitText.height() / 2);

        submitGroup.add(submit, submitText);

        // click event → submit the current pizza against the order
        submitGroup.on("click", () => this.handleSubmit());
        this.group.add(submitGroup);

        // To minigame 1 button
        const minigameGroup = new Konva.Group({ x: STAGE_WIDTH - 142.5, y: STAGE_HEIGHT-300 });

        const minigameBtn = new Konva.Rect({
            width: 135,     
            height: 135,
            fill: "#1e40af",
            cornerRadius: 8,
            stroke: "#1e40af",
            strokeWidth: 2,
        });

        const minigameText = new Konva.Text({       
            x: 67.5,
            y: 67.5,
            text: "Minigame 1",
            fontSize: 28,
            fill: "white",
            align:'center'
        });

        minigameText.offsetX(minigameText.width() / 2);
        minigameText.offsetY(minigameText.height() / 2);
        minigameGroup.add(minigameBtn, minigameText);

        // click event → goes to minigame 1 screen
        minigameGroup.on("click", () => this.onGoToMinigame1());
        this.group.add(minigameGroup);


        const orderCount = new Konva.Group({ x: STAGE_WIDTH - 550, y: 20 });

        const orderRect = new Konva.Rect({
            width: 160,
            height: 50,
            fill: "#996228",
            cornerRadius: 8,
            stroke: "#996228",
            strokeWidth: 2,
        });

        this.orderNumber = new Konva.Text({
            x: 80,
            y: 25,
            text: `Order Number: ${this.orderNum} / ${ORDERS_PER_DAY}`,
            fontSize: 16,
            fill: "white",
        });
        this.orderNumber.offsetX(this.orderNumber.width() / 2);
        this.orderNumber.offsetY(this.orderNumber.height() / 2);

        orderCount.add(orderRect, this.orderNumber);
        this.group.add(orderCount)


        const dayCount = new Konva.Group({ x: STAGE_WIDTH - 850, y: 20 });

        const dayRect = new Konva.Rect({
            width: 160,
            height: 50,
            fill: "#996228",
            cornerRadius: 8,
            stroke: "#996228",
            strokeWidth: 2,
        });

        this.dayDisplay = new Konva.Text({
            x: 80,
            y: 25,
            text: `Day: ${this.day}`,
            fontSize: 16,
            fill: "white",
        });
        this.dayDisplay.offsetX(this.dayDisplay.width() / 2);
        this.dayDisplay.offsetY(this.dayDisplay.height() / 2);

        dayCount.add(dayRect, this.dayDisplay);
        this.group.add(dayCount)


        // Back to main menu button (top-right corner)
        const backGroup = new Konva.Group({ x: STAGE_WIDTH - 180, y: 20 });

        const backBtn = new Konva.Rect({
            width: 160,
            height: 50,
            fill: "#d84315",
            cornerRadius: 8,
            stroke: "#b71c1c",
            strokeWidth: 2,
        });

        const backText = new Konva.Text({
            x: 80,
            y: 25,
            text: "Back to Menu",
            fontSize: 16,
            fill: "white",
            });
        backText.offsetX(backText.width() / 2);
        backText.offsetY(backText.height() / 2);

        backGroup.add(backBtn, backText);

        // click event → goes back to menu
        backGroup.on("click", onBackToMenuClick);
        this.group.add(backGroup);

        this.show()
    }



    //draw specified number od pizza
    private drawPizzaButton(cx:number,cy:number,numPizza:number):void{
        //button group
        const button=new Konva.Group({
            x:cx,
            y:cy,
        });

        //button shape
        const rect = new Konva.Rect({
            width: 100,
            height: 30,
            strokeWidth: 4,
        });

        //button text
        const text = new Konva.Text({
            text: numPizza+' Pizza',
            fontSize:20,
            fill:'white',
            width:rect.width(),
            align: 'center',
            y: rect.height()/2-10,
            x: 0,
        });

        button.add(rect);
        button.add(text);
        text.offsetX(text.width()/2)
        rect.offsetX(text.width()/2)

        //highlight when hovering over it
        button.on("mouseover", ()=>{
            rect.stroke("#F5C753")
        })
        button.on("mouseout", () =>{
            rect.stroke(null)
        })

        this.group.add(button);

        //remove all toppings on pizza when number of slices change
        button.on("click", ()=>{
            for(let i=0;i<this.sliceArcs.length;i++){
                this.sliceArcs[i].destroy()
            }
            this.sliceArcs=[];
            this.pizzaGroup.destroyChildren();
            this.model.sliceNum=0
            this.model.pizzaNum=numPizza
            if(numPizza===1){
                this.drawPizza(PIZZA.pizzaX)
            }
            else if (numPizza===2){
                this.drawPizza(PIZZA.pizzaX1)
                this.drawPizza(PIZZA.pizzaX2)
            }
            else return;
            for(let topping of this.model.toppingsOnPizza.values()){
                for(let i=0;i<topping.length;i++){
                    topping[i].destroy()
                }
            }
            this.model.filled.clear();
            this.model.toppingsOnPizza.clear();
            this.pizzaGroup.getLayer()?.batchDraw();
        })
    }


    drawPizza( pizzaX:number): void {

        //build the base circle
        const basePizza=new Image()
        basePizza.src='/pizza.png'
        const scale=0.8;
        basePizza.onload=()=>{
            const pizzaBase=new Konva.Image({
                scaleX:scale,
                scaleY:scale,
                image:basePizza,
                offsetX:basePizza.width/2,
                offsetY:basePizza.height/2,
                listening:false,
                x:pizzaX,
                y:PIZZA.pizzaY
            })
            this.pizzaGroup.add(pizzaBase);

        }

        
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
            height: 30,
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
        text.offsetX(text.width()/2)
        rect.offsetX(text.width()/2)

        //highlight when hovering over it
        button.on("mouseover", ()=>{
            rect.stroke("#F5C753")
        })
        button.on("mouseout", () =>{
            rect.stroke(null)
        })

        this.group.add(button);

        //remove all toppings on pizza when number of slices change
        button.on("click", ()=>{
            this.pizzaGroup.find('Line').forEach((node) =>node.destroy());
            this.pizzaGroup.find('.slice').forEach((node)=>node.destroy());

            for(let i=0;i<this.sliceArcs.length;i++){
                this.sliceArcs[i].destroy()
            }
            this.sliceArcs = [];
            this.model.sliceNum=slices;
            if(this.model.pizzaNum===1){
                this.makeSlices(slices,PIZZA.pizzaX)
            }
            else if (this.model.pizzaNum===2){
                this.makeSlices(slices,PIZZA.pizzaX1)
                this.makeSlices(slices,PIZZA.pizzaX2)
            }
            for(let topping of this.model.toppingsOnPizza.values()){
                for(let i=0;i<topping.length;i++){
                    topping[i].destroy()
                }
            }
            this.model.filled.clear();
            this.model.toppingsOnPizza.clear();
            this.pizzaGroup.getLayer()?.batchDraw();
        })
    }

    //helper
    private makeSlices(slices:number, pizzaX:number){
        const degPer = 360 / slices;

        //draw lines showing slice separation
        for (let i=0; i<slices; i++) {
            const a=((i*degPer)*Math.PI)/180;
            const x1= pizzaX+7*Math.cos(a);
            const y1= PIZZA.pizzaY+7*Math.sin(a);
            const x2= pizzaX+this.rOuter*Math.cos(a);
            const y2= PIZZA.pizzaY+this.rOuter*Math.sin(a);
            this.pizzaGroup.add(
                new Konva.Line({
                    points:[x1,y1, x2, y2],
                    stroke:'red',
                    strokeWidth:2,
                    listening:false,
                    opacity:0.67, //lol
                    dash:[10,5]
                })
            );
        }
        //draw individual slices with ID
        let realSlices=slices
        let i=0;
        if(pizzaX===PIZZA.pizzaX2){
            realSlices*=2
            i+=slices
        }
        for (i;i<realSlices;i++) {
            const arc= new Konva.Arc({
                x:pizzaX,
                y:PIZZA.pizzaY,
                innerRadius:0,
                outerRadius:this.rOuter,
                angle:degPer,
                rotation:i*degPer,
                id:`slice-${i}`,
                name:'slice',
            });
            this.pizzaGroup.add(arc);
            this.sliceArcs.push(arc);
        }
        this.pizzaGroup.getLayer()?.batchDraw();
    }
    


    //remove specific topping on pizza
    private removeTopping(topping:ToppingType):void{
        if(this.model.toppingsOnPizza.has(topping)){
            for(let node of this.model.toppingsOnPizza.get(topping)!){
                node.destroy();
            }
            this.model.toppingsOnPizza.delete(topping);
            this.model.filled.get(topping)?.clear();
        }
        this.group.getLayer()?.batchDraw();
    
    }


    private drawTopping(tinX:number,tinY:number, 
                                toppingType:ToppingType, toppingURL:string, toppingScale:number):void{
    
        //group
        const toppingBin=new Konva.Group({
            x:tinX,
            y:tinY,
        });

        // button text
        const text = new Konva.Text({
            text: toppingType,
            fontSize: 20,
            fill: 'white',
            align: 'center',
            y: 40,
            x: 0,
        });
        const tin=new Image()
        tin.src='/tin.png'
        tin.onload=()=>{
            const tinIm=new Konva.Image({
                scaleX:0.5, 
                scaleY:0.5,
                image:tin,
                offsetX:tin.width/2,
                offsetY:tin.height/2,
                listening:false,
                x:0,
                y:0,
            })
            toppingBin.add(text);
            toppingBin.add(tinIm)
            text.offsetX(text.width()/2)
            this.group.add(toppingBin)
            this.group.getLayer()?.batchDraw();
            
            for(let i=0;i<5;i++){
                this.createTopping(tinX-25,tinY-20,toppingType,toppingURL,toppingScale)
            }
    
        }
            
    }

    createTopping(toppingX:number,toppingY:number, toppingType:ToppingType, toppingURL:string, toppingScale:number):void{
        const toppingIm=new Image()
        toppingIm.src=toppingURL
        toppingIm.onload=()=>{
            const toppingGroup=new Konva.Group({
                x:toppingX+(Math.random()*50),
                y:toppingY+(Math.random()*10),
                draggable:true,
                listening:true,
                name:toppingType

            });
            toppingGroup.setAttr("isTopping", true);
            const image=new Konva.Image({
                image:toppingIm,
                scale:{x:toppingScale,y:toppingScale},
                rotationDeg:Math.random()*360,
            })
            image.offsetX(image.width()/2)
            image.offsetY(image.height()/2)
            const topping=new Konva.Circle({
                radius:image.width()/2*toppingScale,
                fillEnabled:false
            })
            topping.setAttr("countedSlice",null)
            topping.setAttr("isTopping", true); 
            topping.setAttr("toppingType", toppingType);

            toppingGroup.add(image, topping)
            this.group.add(toppingGroup)

            //auto creae topping after dragging one away
            toppingGroup.on('dragstart', ()=>{
                const x=toppingGroup.x()-toppingX
                const y=toppingGroup.y()-toppingY
                const dist=(Math.sqrt(x*x+y*y))
                if(dist<200){
                    this.createTopping(toppingX,toppingY,toppingType,toppingURL,toppingScale)
                }
            })

            //determine where topping is at end of drag and if it is on a slice
            toppingGroup.on("dragend",()=>{

                if (this.model.pizzaNum===0||this.model.sliceNum===0){
                    toppingGroup.destroy()
                }
                //check at different positions depending on how many pizzas there are
                else if(this.model.pizzaNum===2){
                    if(this.model.inPizza(toppingGroup.x(),toppingGroup.y(),PIZZA.pizzaX1,this.rOuter)){
                        this.dragToppingLogic(toppingGroup,toppingType,PIZZA.pizzaX1,this.rOuter);
                        this.model.registerPlacedTopping(toppingGroup.x(), toppingGroup.y(), toppingType, 0);   
                    }
                    else {
                        this.dragToppingLogic(toppingGroup,toppingType,PIZZA.pizzaX2,this.rOuter);
                        this.model.registerPlacedTopping(toppingGroup.x(), toppingGroup.y(), toppingType, 1);
                    };
                }
                else if (this.model.pizzaNum===1){
                    this.dragToppingLogic(toppingGroup,toppingType,PIZZA.pizzaX,this.rOuter);
                    this.model.registerPlacedTopping(toppingGroup.x(), toppingGroup.y(), toppingType, 0);

                }

                this.group.getLayer()?.batchDraw();
                
            });


        }

    }

    public getPlacedToppings(): PlacedTopping[] {
        const result: PlacedTopping[] = [];
        const toppingGroup = this.group.find((node: Konva.Node) => node.getAttr && node.getAttr("isToppingGroup")) as Konva.Group[];
        toppingGroup.forEach((g) => {
            const toppingType = g.name() as ToppingType;
            const x = g.x();
            const y = g.y();
            const dLeft = Math.hypot(x - PIZZA.pizzaX1, y - PIZZA.pizzaY);
            const dRight = Math.hypot(x - PIZZA.pizzaX2, y - PIZZA.pizzaY);
            const pizzaIndex: 0 | 1 = dLeft < dRight ? 0 : 1;
            result.push({ type: toppingType, x, y, pizzaIndex });
        });
        return result;
    }

    dragToppingLogic(topping:Konva.Group,toppingType:ToppingType,pizzaX:number,rOuter:number){
        this.model.typeCheck(toppingType)
        const previousSlice=topping.getAttr("countedSlice")
        if(this.model.inPizza(topping.x(),topping.y(),pizzaX,rOuter)){
            //add to list of toppings on the pizza if its not there
            if(!this.model.toppingsOnPizza.get(toppingType)!.includes(topping)){
                this.model.toppingsOnPizza.get(toppingType)!.push(topping);
            }
            
            let currentSlice=this.model.sliceIndex(topping.x(),topping.y(),pizzaX)
            if(pizzaX===PIZZA.pizzaX2){
                currentSlice+=this.model.sliceNum;
            }
            // If other topping types already occupy this slice, remove those toppings.
            for (const [type, toppings] of this.model.toppingsOnPizza.entries()) {
                if (type === toppingType) continue;
                const filled = this.model.filled.get(type);
                if (!filled||!filled.has(currentSlice)) continue;
                // check filled to see if any of the other types are on the slice we want
                for (let i=toppings.length-1; i>=0; i--) {
                    const node=toppings[i];
                    if (node.getAttr('countedSlice') === currentSlice) {
                        node.destroy();
                        toppings.splice(i, 1);
                    }
                }
                filled.delete(currentSlice);
            }
            

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
                topping.setAttr("countedSlice", null);
            }
            const id=this.model.toppingsOnPizza.get(toppingType)!.indexOf(topping);
            if (id!==-1) {
                this.model.toppingsOnPizza.get(toppingType)!.splice(id,1);
            }
            topping.destroy()
        }
    }

    


    //display order in game screen
    displayOrder(order: Order): void{
        this.currentOrder=order;
        if (!order) {
            this.orderDisplay.text('');
            this.group.getLayer()?.batchDraw();
            return;
        }

        const denom=order.fractionStruct?.denominator;
        const lines:string[]=[];
        if (!order.toppingsCounts) {
            if (order.fraction) lines.push(order.fraction);
        } else {
            for (const [t,c] of Object.entries(order.toppingsCounts)) {
                if(c!==0) lines.push(`${c}/${denom} ${t}`);
            }
        }
        
        if(lines.length){
            this.orderDisplay.text(lines.join('\n'));
        }
        else{
            this.orderDisplay.text(order.fraction??'');
        }
        this.group.getLayer()?.batchDraw();
    }



    // check if its right and then generate new order after clicking submit button
    private handleSubmit(): void {
        const order=this.currentOrder;
        if(this.model.pizzaNum===0||this.model.sliceNum===0) return;
        if (!order) return;
        const denom=order.fractionStruct?.denominator;
        if(!denom) return;

        const placedToppings=this.getPlacedToppings();

        const lines: string[]=[];
        let allMatch=true;
        let expectedTotal=0;
        let currentTotal=0;
        let expectedPizzaNum=1;

        if (order.toppingsCounts) {
            for (const [topping, count] of Object.entries(order.toppingsCounts)) {
                const expected=(count as number);
                let current=this.model.filled.get(topping as ToppingType)?.size??0;
                const LCM=denom/this.model.sliceNum
                const weightedCurrent=current*LCM
                expectedTotal+=expected;
                currentTotal+=weightedCurrent||0;
                lines.push(`${topping}: expected ${expected}/${denom}  —  current ${current}/${this.model.sliceNum}`);
                if (expected!==weightedCurrent){
                    allMatch=false;
                };
                if(expectedTotal>denom) expectedPizzaNum=2;
            }
            lines.push(`#Pizza: expected ${expectedPizzaNum}  —  current ${this.model.pizzaNum}`);

        }
        // show popup with results
        const success= allMatch&&expectedTotal===currentTotal&&expectedPizzaNum===this.model.pizzaNum;

        const originalOrder = this.currentOrder;
        if(!originalOrder) return;

        // make a copy of the order so it can't be mutated later
        const orderCopy: Order = {
            ...order,
            toppingsCounts: { 
                Mushroom: originalOrder.toppingsCounts?.Mushroom ?? 0,
                Pepperoni: originalOrder.toppingsCounts?.Pepperoni ?? 0,
                Basil: originalOrder.toppingsCounts?.Basil ?? 0,
             },
            fractionStruct: originalOrder.fractionStruct ? { ...originalOrder.fractionStruct } : undefined,
        };

        this.resultStore.add({
            orderNumber: this.orderNum,
            day: this.day,
            success,
            details: lines.join("\n"),
            expectedTotal,
            currentTotal,
            expectedPizzaNum,
            currentPizzaNumber: this.model.pizzaNum,
            slicesUsed: this.model.sliceNum,
            placedToppings: this.model.placedToppings.map(t => ({
                type: t.type,
                x: t.x,
                y: t.y,
                pizzaIndex: t.pizzaIndex,
            })),
            order: orderCopy,
            tipsEarned: 0 
        });

        // Clear mdoel state so new order starts fresh
        this.model.resetnewOrder();

        if(success){
            this.orderNum+=1
            //TEMPORARY DAY PROGRESSION, CHANGE OR REMOVE LATER TODO IMPORTANT DONT FORGET
            if(this.orderNum>ORDERS_PER_DAY){
                this.day+=1
                this.dayDisplay.text(`Day: ${this.day}`)
                this.orderNum=1
            }
            this.orderNumber.text(`Order Number: ${this.orderNum} / ${ORDERS_PER_DAY}`)
        
            for (let toppingList of this.model.toppingsOnPizza.values()){
                for (let i = 0; i < toppingList.length; i++){
                    toppingList[i].destroy();
                }
            }
            this.model.filled.clear();
            this.model.toppingsOnPizza.clear();
            for(let i=0;i<this.sliceArcs.length;i++){
                this.sliceArcs[i].destroy()
            }
            //get rid of on screen pizza, comment out if unwanted
            this.sliceArcs=[]
            this.model.sliceNum=0;
            this.model.pizzaNum=0
            this.pizzaGroup.destroyChildren()
            
            this.group.getLayer()?.batchDraw();
        }

        this.drawResultPopup(lines.join('\n'), success);
    }

    // popup showing what they have. If they are correct, closing it generates new order
    private drawResultPopup(lines: string, isSuccess: boolean): void {
        // remove any existing popup
        const popupGroup:Konva.Group=new Konva.Group()

        const overlay=new Konva.Rect({ 
            width: STAGE_WIDTH, 
            height: STAGE_HEIGHT, 
            fill: 'black', 
            opacity: 0.5, 
            listening: true 
        });

        const panel = new Konva.Rect({ 
            x:STAGE_WIDTH/4,
            y:STAGE_HEIGHT/4,
            width: STAGE_WIDTH/2, 
            height: STAGE_HEIGHT/2, 
            fill: '#F5C753', 
            cornerRadius: 8, 
            stroke: 'black', 
            strokeWidth: 4 
        });
        const title = new Konva.Text({ 
            x: panel.x()+panel.width()/2, 
            y: panel.y() +50, 
            text: isSuccess ? 'Correct!' : 'Incorrect', 
            fontSize: 30, 
            fill: isSuccess ? 'green':'red' ,
            align:'center'
        });
        title.offsetX(title.width()/2)

        const body = new Konva.Text({ 
            x: panel.x() + panel.width()/10, 
            y: panel.y() + 120,  
            text: lines, 
            fontSize: 24, 
            fill: 'black',
            align:'center'
        });
        const closeButton = new Konva.Group({ x: STAGE_WIDTH/2-60, y: 400 });
        const close = new Konva.Rect({ 
            width: 120, 
            height: 60, 
            fill: 'red', 
            cornerRadius: 8,
            stroke: 'black',
            strokeWidth: 4,
            
         });
        const closeText = new Konva.Text({ 
            x: 60,     
            y: 24,
            text: 'Close',
            fontSize: 18,
            fill: 'white' 
            });
        closeText.offsetX(closeText.width()/2);
        closeButton.add(close, closeText);

        popupGroup.add(overlay, panel,title,body, closeButton);
        this.group.add(popupGroup)

        closeButton.on('click', () => {
            popupGroup?.destroy();
            if (isSuccess) {
                for (let toppingList of this.model.toppingsOnPizza.values()){
                    for (let i = 0; i < toppingList.length; i++){
                        toppingList[i].destroy();
                    }
                }
                this.model.filled.clear();
                this.model.toppingsOnPizza.clear();
                this.pizzaGroup.getLayer()?.batchDraw();

                if (this.onOrderSuccess) this.onOrderSuccess(this.currentDifficulty);
            }
            this.group.getLayer()?.batchDraw();
        });
        this.group.getLayer()?.batchDraw();
    }



    drawBackground(){
        const backgroundGroup=new Konva.Group()
        
        const bg = new Konva.Rect({
            x: 0,
            y: 0,
            width: STAGE_WIDTH,
            height: STAGE_HEIGHT,
            fill: "#F5C753",
            listening:false
        });
        backgroundGroup.add(bg);

        const board=new Image()
        board.src='/board.png'
        board.onload=()=>{
            const boardIm=new Konva.Image({
                scaleX:0.8,
                scaleY:0.8,
                image:board,
                offsetX:board.width/2,
                offsetY:board.height/2,
                listening:false,
                x:STAGE_WIDTH/2+75,
                y:STAGE_HEIGHT*3/4-35
            })
            backgroundGroup.add(boardIm);
        }

        const blackBoard=new Image()
        blackBoard.src='/blackboard.png'
        blackBoard.onload=()=>{
            const blackBoardIm=new Konva.Image({
                scaleX:0.667, //lol
                scaleY:0.55,
                image:blackBoard,
                offsetX:blackBoard.width/2,
                offsetY:blackBoard.height/2,
                listening:false,
                x:148,
                y:STAGE_HEIGHT*3/4-42,
                rotationDeg:90
            })
            backgroundGroup.add(blackBoardIm);
        }

        const receipt=new Image()
        receipt.src='/receipt.png'
        receipt.onload=()=>{
            const reciptIm=new Konva.Image({
                scaleX:0.5, 
                scaleY:0.48,
                image:receipt,
                offsetX:receipt.width/2,
                offsetY:receipt.height/2,
                listening:false,
                x:170,
                y:STAGE_HEIGHT*1/4-47,
                rotationDeg:180
            })
            backgroundGroup.add(reciptIm);
        }

        const pan=new Image()
        pan.src='/pan.png'
        pan.onload=()=>{
            const panIm=new Konva.Image({
                scaleX:0.6, 
                scaleY:0.6,
                image:pan,
                offsetX:pan.width/2,
                offsetY:pan.height/2,
                listening:false,
                x:1090,
                y:STAGE_HEIGHT*1/3-10,

            })
            backgroundGroup.add(panIm);
        }
        bg.moveToBottom()
        this.group.add(backgroundGroup)
    }

    setDifficulty(d: Difficulty): void {
        this.currentDifficulty = d;
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