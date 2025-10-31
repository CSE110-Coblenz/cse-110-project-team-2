import Konva from "konva";
import type { View } from "../../types";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants";

export class GameScreenView implements View {
	//main group 
    private group:Konva.Group;

    //pizza dimensions
    private pizzaX=STAGE_WIDTH-250;
    private pizzaY=STAGE_HEIGHT-250;
    private rOuter=200;

    //group of pizza slices
    private pizzaGroup = new Konva.Group();
    private sliceArcs: Konva.Arc[] = [];

    //list of Konva toppings currently on pizza
    private toppingsOnPizza=new Map<string,Konva.Circle[]>();

    //number of pizza slices
    private sliceNum:number=0;

    //shows how many pizza slices are filled by what toppings
    private filled=new Map<string,Set<number>>();

    //text to show slices and fullness
    private status:Konva.Text;

    constructor() {
        this.group = new Konva.Group({ visible: false });
        const bg = new Konva.Rect({
            x: 0,
            y: 0,
            width: STAGE_WIDTH,
            height: STAGE_HEIGHT,
            fill: "#87CEEB"
        });
        this.group.add(bg);
        

        this.drawSlicesButton(20,20,4)
        this.drawSlicesButton(20,100,8)
        this.drawSlicesButton(20,180,12)

        this.drawToppingsButton(20,550,20,300,"pepperoni","red",15)
        this.drawToppingsButton(20,480,60,300,"peppers","green",15)

        this.status = new Konva.Text({ x: 520, y: 20, text: '', fontSize: 16, fill: 'black' });
        this.group.add(this.pizzaGroup)
        this.group.add(this.status);

        
        
    }

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
        this.group.add(button);

        //remove all toppings on pizza when number of slices change
        button.on("click", ()=>{
            this.sliceNum=slices;
            this.drawPizza(this.sliceNum)
            for(let topping of this.toppingsOnPizza.values()){
                for(let i=0;i<topping.length;i++){
                    topping[i].destroy()
                }
                topping=[]
            }
            this.filled.clear();
            this.toppingsOnPizza.clear();
            this.updateFilledDisplay();

        })
    }


    private inPizza(x:number,y:number):boolean{
        //calculate if midpoint of topping is on pizza
        return Math.pow((x-this.pizzaX),2)+Math.pow((y-this.pizzaY),2)<=Math.pow(this.rOuter,2)
    }
    private sliceIndex(x:number,y:number):number{
        //calculate which slice topping is on (midpoint)
        if (this.sliceNum<=0) return 0;
        let ang = Math.atan2(y - this.pizzaY, x - this.pizzaX);
        if (ang < 0) ang+=Math.PI * 2;
        const id = Math.floor(ang/(Math.PI * 2)*this.sliceNum);
        return Math.max(0, Math.min(this.sliceNum - 1, id));
    }
    
    private drawPizza(slices: number): void {
        //reset pizza
        this.sliceArcs=[];
        this.pizzaGroup.destroyChildren();

        //build the base circle
        const pizzaBase = new Konva.Circle({
            x:this.pizzaX,
            y:this.pizzaY,
            radius:this.rOuter,
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
            const x2= this.pizzaX+this.rOuter*Math.cos(a);
            const y2= this.pizzaY+this.rOuter*Math.sin(a);
            this.pizzaGroup.add(
                new Konva.Line({
                    points:[this.pizzaX, this.pizzaY, x2, y2],
                    stroke:'black',
                    strokeWidth:4,
                    listening:false
                })
            );
        }
        //draw individual slices with ID
        for (let i=0;i<slices;i++) {
            const arc= new Konva.Arc({
                x:this.pizzaX,
                y:this.pizzaY,
                innerRadius:0,
                outerRadius:this.rOuter,
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

    //initialize values for every type of topping
    private typeCheck(type:string){
        if(!this.filled.has(type)){
            this.filled.set(type,new Set<number>());
        }
        if(!this.toppingsOnPizza.has(type)){
            this.toppingsOnPizza.set(type,[]);
        }
    }

    private drawToppingsButton(buttonX:number,buttonY:number, toppingX:number,toppingY:number, 
                                toppingName:string, toppingColor:string, toppingRadius:number):void{

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
            text: toppingName,
            fontSize: 20,
            fill: 'white',
            x: rect.width() / 2 - 40, 
            y: rect.height() / 2 - 10,
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
                name:toppingName
            })
            topping.setAttr("countedSlice",null)
            this.group.add(topping)

            //determine if and where the topping is
            topping.on("dragend",()=>{
                this.typeCheck(toppingName)
                if(this.inPizza(topping.x(),topping.y())){
                    //add to list of toppings on the pizza if its not there
                    if(!this.toppingsOnPizza.get(toppingName)!.includes(topping)){
                        this.toppingsOnPizza.get(toppingName)!.push(topping);
                    }
                    const previousSlice=topping.getAttr("countedSlice")
                    const currentSlice=this.sliceIndex(topping.x(),topping.y())

                    if (previousSlice!==null&&previousSlice!==currentSlice){
                        let removeSlice:boolean=true;
                        //if theres other toppings on the same slice, don't remove that filled spot when the topping moved to another slice
                        for(const otherSlices of this.toppingsOnPizza.get(toppingName)!){
                            if(otherSlices===topping){
                                continue
                            } 
                            if(otherSlices.getAttr("countedSlice")!==null&&otherSlices!.getAttr("countedSlice")===previousSlice){
                                removeSlice=false;
                                break;
                            }
                        }
                        if(removeSlice){
                            this.filled.get(toppingName)!.delete(topping.getAttr("countedSlice"))
                        }				
                    }
                    //update topping's location
                    topping.setAttr("countedSlice",currentSlice)
                    this.filled.get(toppingName)!.add(currentSlice)
                }
                else{
                    //if topping is not on pizza remove it from the on pizza list and the filled set
                    if(topping.getAttr("countedSlice")!==null){
                        this.filled.get(toppingName)!.delete(topping.getAttr("countedSlice"));
                        topping.setAttr("countedSlice", null);
                    }
                    const id=this.toppingsOnPizza.get(toppingName)!.indexOf(topping);
                    if (id!==-1) {
                        this.toppingsOnPizza.get(toppingName)!.splice(id,1);
                    }
                }
                this.updateFilledDisplay()
            })
        })
    }


    //display what toppings occupy what slices
    private updateFilledDisplay() {
        if (!this.sliceNum) { this.status.text(''); return; }
        const lines: string[] = [];
        for (const [type, set] of this.filled.entries()) {
            lines.push(`${type}: ${set.size} / ${this.sliceNum}`);
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