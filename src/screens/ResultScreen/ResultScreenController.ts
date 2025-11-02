import Konva from "konva";
import { ResultsScreenView } from "./ResultScreenView"; 
import {STAGE_WIDTH, STAGE_HEIGHT} from "../../constants";

const stage = new Konva.Stage ({
    container: "container",
    width: 800,
    height: 600,
});

const layer = new Konva.Layer ();
stage.add(layer);

function placeHolderScreen(text: string, fill = "#111"): Konva.Group {
    const g  = new Konva.Group({visible: false, listening: true});
    g.add(new Konva.Rect({x: 0, y: 0, width: 800, height: 600, fill}));
    g.add(new Konva.Text({x: 20, y: 20, text, fontSize: 28, fill: "white"}));
    return g;
}

const wrongOrderScreen = placeHolderScreen("Wrong Orders", "#1f2937");
const endGameScreen = placeHolderScreen("End game", "#374151");
const nextDayScreen = placeHolderScreen("Next day", "#0ff766e");

layer.add(wrongOrderScreen);
layer.add(endGameScreen);
layer.add(nextDayScreen);

const results = new ResultsScreenView();
layer.add(results.getGroup());

const show = (g: Konva.Group) => {
    [results.getGroup(), wrongOrderScreen, endGameScreen, nextDayScreen].forEach(s => s.visible(false));
    g.visible(true);
    layer.draw();
};

results.onViewWrongOrders = () => show(wrongOrderScreen);
results.onEndGame = () => show(endGameScreen);
results.onNextDay = () => show(nextDayScreen);

show(results.getGroup());
