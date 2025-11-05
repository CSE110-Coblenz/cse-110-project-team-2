import { STAGE_HEIGHT,STAGE_WIDTH,PIZZA, ToppingType} from "../../constants";
export class GameScreenModel{

    //pizza dimensions
    pizzaX=STAGE_WIDTH-250;
    pizzaY=STAGE_HEIGHT-250;
    rOuter=PIZZA.R_OUTER;

    //list of Konva toppings currently on pizza
    toppingsOnPizza=new Map<ToppingType,any[]>();

    //number of pizza slices
    sliceNum:number=0;

    //shows how many pizza slices are filled by what toppings
    filled=new Map<ToppingType,Set<number>>();

    //calculate if midpoint of topping is on pizza
    inPizza(x:number,y:number):boolean{
      return Math.pow((x-this.pizzaX),2)+Math.pow((y-this.pizzaY),2)<=Math.pow(this.rOuter,2)
    }

    //calculate which slice topping is on (midpoint)
    sliceIndex(x:number,y:number):number{
      if (this.sliceNum<=0) return 0;
      let ang = Math.atan2(y - this.pizzaY, x - this.pizzaX);
      if (ang < 0) ang+=Math.PI * 2;
      const id = Math.floor(ang/(Math.PI * 2)*this.sliceNum);
      return Math.max(0, Math.min(this.sliceNum - 1, id));
    }

    //create value set/array for Map if not present
    typeCheck(type:ToppingType){
    if(!this.filled.has(type)){
      this.filled.set(type,new Set<number>());
    }
    if(!this.toppingsOnPizza.has(type)){
      this.toppingsOnPizza.set(type,[]);
    }
    }
}