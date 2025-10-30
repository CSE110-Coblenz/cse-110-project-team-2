import Konva from "konva";

export class GameScreenView{
	private STAGE_HEIGHT=600;
	private STAGE_WIDTH=800;
	private pizzaX=this.STAGE_WIDTH-250;
	private pizzaY=this.STAGE_HEIGHT-250;
	private rOuter=200;
	private group:Konva.Group;
	private pizzaGroup = new Konva.Group();
	private base:Konva.Circle
	private sliceNum:number=0;

	constructor() {
		this.group = new Konva.Group({ visible: false });

		// Background
		const bg = new Konva.Rect({
			x: 0,
			y: 0,
			width: this.STAGE_WIDTH,
			height: this.STAGE_HEIGHT,
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


		this.group.add(this.pizzaGroup)


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
const stage = new Konva.Stage({
  container: 'Pizza Project',       
  width: 800,            
  height: 600,           
});

const layer = new Konva.Layer();
stage.add(layer);

const game = new GameScreenView();
layer.add(game.getGroup());
game.show();             // make it visible
layer.draw();