import Konva from "konva";
import type { View } from "../../types";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants";

export class GameScreenView implements View {
	private pizzaX = STAGE_WIDTH - 250;
	private pizzaY = STAGE_HEIGHT - 250;
	private rOuter = 200;
	private group: Konva.Group;
	private pizzaGroup = new Konva.Group();
	private base: Konva.Circle | undefined;
	private sliceArcs: Konva.Arc[] = [];
	private sliceNum: number = 0;
	private filled=new Set<number>();
    private filledText: Konva.Text;
	private toppingsOnPizza:Konva.Circle[]=[];

	constructor() {
		this.group = new Konva.Group({ visible: false });

        // Background
        const bg = new Konva.Rect({
            x: 0,
            y: 0,
            width: STAGE_WIDTH,
            height: STAGE_HEIGHT,
            fill: "#87CEEB", // Sky blue
        });
        this.group.add(bg);
        

        this.base=new Konva.Circle({
            stroke:"black",
            strokeWidth:4,
            radius:this.rOuter,
            fill:"yellow",
            x:this.pizzaX,
            y:this.pizzaY,
            listening:false
        })
        this.group.add(this.base)


        this.drawSlicesButton(20,20,4)
        this.drawSlicesButton(20,100,8)
        this.drawSlicesButton(20,180,12)


        const topping=new Konva.Group({
            x:20,
            y:500,
        });
        const rect = new Konva.Rect({
            width: 100,
            height: 50,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
        });
        var text = new Konva.Text({
            text: "Topping",
            fontSize: 20,
            fill: 'white',
            x: rect.width() / 2 - 20, // Adjust for text width
            y: rect.height() / 2 - 10, // Adjust for text height
        });
        topping.add(rect);
        topping.add(text);
        this.group.add(topping);

        topping.on("click",()=>{
            let pep=new Konva.Circle({
                stroke:"black",
                strokeWidth:4,
                radius:15,
                fill:"red",
                x:50,
                y:350,
                draggable:true,
                listening:true,
            })
            this.group.add(pep)
            pep.on("dragend",()=>{
                if(this.inPizza(pep.x(),pep.y())){
                    this.toppingsOnPizza.push(pep);
                    this.filled.add(this.sliceIndex(pep.x(),pep.y(),this.sliceNum))
                    this.updateFilledDisplay()
                }
                else{
                    this.filled.delete(this.sliceIndex(pep.x(),pep.y(),this.sliceNum));
                    const id=this.toppingsOnPizza.indexOf(pep);
                    if (id!==-1) {
                        this.toppingsOnPizza[id] = new Konva.Circle;
                    }
                    this.updateFilledDisplay()
                }
            })
        })
        this.group.add(this.pizzaGroup)

        //show which slices have toppings
        this.filledText = new Konva.Text({
            x: 520,
            y: 20,
            text: "Filled: (none)",
            fontSize: 16,
            fill: "black",
        });
        this.group.add(this.filledText);
        this.updateFilledDisplay();
	}

	drawSlicesButton(cx:number,cy:number,slices:number):void{
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
        var text = new Konva.Text({
            text: slices+' slices',
            fontSize: 20,
            fill: 'white',
            x: rect.width() / 2-30, 
            y: rect.height() / 2-10,
        });
        button.add(rect);
        button.add(text);
        this.group.add(button);

        button.on("click", ()=>{
            this.sliceNum=slices;
            this.drawPizza(this.sliceNum)
            this.base?.remove()
            for(let i=0;i<this.toppingsOnPizza.length;i++){
                this.toppingsOnPizza[i].remove()
            }
            this.toppingsOnPizza=[]
            this.filled.clear();
            this.updateFilledDisplay();

        })
    }
    

	drawPizza(slices: number): void {
		//reset pizza
		this.pizzaGroup.destroyChildren();

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

		let sliceID=new Konva.Text({
  					text: '',
  					fontSize: 20,
  					fill: 'black',
  					x: 150,
  					y: 20,
				});
		this.group.add(sliceID)
		for(let i:number=0;i<this.sliceArcs.length;i++){
			this.sliceArcs.at(i)?.on("mouseover",()=>{
				this.sliceArcs.at(i)?.scale({x:1.2,y:1.2})
				sliceID.text(this.sliceArcs.at(i)?.id())

			})
			this.sliceArcs.at(i)?.on("mouseout",()=>{
				this.sliceArcs.at(i)?.scale({x:1,y:1})
				sliceID.text('')

			})
		}
	}




	private inPizza(x:number,y:number):boolean{
        //calculate if midpoint of topping is on pizza
        return Math.pow((x-this.pizzaX),2)+Math.pow((y-this.pizzaY),2)<=Math.pow(this.rOuter,2)
    }
    private sliceIndex(x:number,y:number,sliceNum:number):number{
        //calculate which slice topping is on (midpoint)
        let ang = Math.atan2(y - this.pizzaY, x - this.pizzaX);
        if (ang < 0) ang+=Math.PI * 2;
        let id = Math.floor(ang/(Math.PI * 2)*sliceNum);
        return Math.max(0, Math.min(sliceNum - 1, id));
    }

	private updateFilledDisplay(): void {
        const arr=Array.from(this.filled).sort((a,b)=>a-b);
        //Filled: ${arr.join(", ")} and
        const text=`Topping fraction: ${arr.length} / ${this.sliceNum}`
        this.filledText.text(text);
        this.group.getLayer()?.draw();
    }

	getGroup(): Konva.Group {
		return this.group;
	}

	show(): void {
		this.group.visible(true);
		this.group.getLayer()?.draw();
	}

	hide(): void {
		this.group.visible(false);
		this.group.getLayer()?.draw();
	}
}