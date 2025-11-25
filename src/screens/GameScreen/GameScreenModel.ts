import {PIZZA, ToppingType} from "../../constants";
import { PlacedTopping } from "../../data/OrderResult";

export class GameScreenModel{

    public placedToppings:PlacedTopping[]=[];
    resetnewOrder() {
      this.placedToppings=[];
    }
    registerPlacedTopping(x:number,y:number, type:ToppingType, pizzaIndex: 0|1) {
      this.placedToppings.push({x,y,type, pizzaIndex});
    }
    

    //list of Konva toppings currently on pizza
    toppingsOnPizza=new Map<ToppingType,any[]>();

    //number of pizza slices
    sliceNum:number=0;

    //number of pizzas
    pizzaNum:number=0;

    //shows how many pizza slices are filled by what toppings
    filled=new Map<ToppingType,Set<number>>();

    //calculate if midpoint of topping is on pizza
    inPizza(x:number,y:number, pizzaX:number,rOuter:number):boolean{
      return Math.pow((x-pizzaX),2)+Math.pow((y-PIZZA.pizzaY),2)<=Math.pow(rOuter,2)
    }

    //calculate which slice topping is on (midpoint)
    sliceIndex(x:number,y:number, pizzaX:number):number{
      if (this.sliceNum<=0) return 0;
      let ang = Math.atan2(y-PIZZA.pizzaY, x-pizzaX);
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