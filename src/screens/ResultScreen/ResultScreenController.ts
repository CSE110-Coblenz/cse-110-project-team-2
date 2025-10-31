import Konva from "konva";
import { ResultsScreenView } from "./ResultScreenView"; 

const stage = new Konva.Stage ({
    container: "app",
    width: 800,
    height: 600,
});

const layer = new Konva.Layer ();
stage.add(layer);

const view = new ResultsScreenView();
layer.add(view.getGroup());

view.show();
layer.draw();