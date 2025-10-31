import Konva from "konva";
import { STAGE_HEIGHT,STAGE_WIDTH } from "../../constants";
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