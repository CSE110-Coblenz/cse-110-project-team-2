import Konva from "konva";
import { STAGE_WIDTH, STAGE_HEIGHT } from "./constants";
import { FONTS } from "./fonts";

type MenuSettingsPopupOpts = {
  onBackToMenu: () => void;
  onInstructions: () => void;
  // when popup is destroyed
  onClose?: () => void; 
};

export function createMenuSettingsPopup({
  onBackToMenu,
  onInstructions,
  onClose,

}: MenuSettingsPopupOpts): Konva.Group {
  const popupWidth = 250;
  const popupHeight = 160;

  const popup = new Konva.Group({
    x: STAGE_WIDTH / 2 - popupWidth / 2,
    y: STAGE_HEIGHT / 2 - popupHeight / 2,

  });

  const background = new Konva.Rect({
    width: popupWidth,
    height: popupHeight,
    fill: "white",
    stroke: "black",
    cornerRadius: 8,
    shadowBlur: 10,
    
  });
  

  const title = new Konva.Text({
    text: "SETTINGS",
    x: 0, // popupWidth / 2,
    y: 20,
    width: popupWidth,
    align: "center",
    fontFamily: FONTS.SUBHEADER,
    fontSize: 18,
    fill: "black",
  });

  // Back to menu button
  const menuButtonGroup = new Konva.Group({ x: 20, y: 60 });

  const menuRect = new Konva.Rect({
    width: popupWidth - 40,
    height: 35,
    fill: "#d84315",
    cornerRadius: 6,
    stroke: "#b71c1c",
    strokeWidth: 2,
  });

  const menuText = new Konva.Text({
    text: "Back to Menu",
    x: 0,
    y: 8,
    width: popupWidth - 40,
    align: "center",
    fontFamily: FONTS.BUTTON,
    fontSize: 16,
    fill: "white",
    listening: false,
  });

  menuButtonGroup.add(menuRect, menuText );

  menuButtonGroup.on("click tap", () => {
    onBackToMenu();
    if (onClose) onClose();
    popup.destroy();
  });

  // Instructions button
  const instructionsButtonGroup = new Konva.Group({ x: 20, y: 105 });

  const instructionsRect = new Konva.Rect({
    width: popupWidth - 40,
    height: 35,
    fill: "#d84315",
    cornerRadius: 6,
    stroke: "#b71c1c",
    strokeWidth: 2,
  });

  const instructionsText = new Konva.Text({
    text: "Instructions",
    x: 0,
    y: 8,
    width: popupWidth - 40,
    align: "center",
    fontFamily: FONTS.BUTTON,
    fontSize: 16,
    fill: "white",
    listening: false,
  });

  instructionsButtonGroup.add(instructionsRect, instructionsText);
  
  instructionsButtonGroup.on("click tap", () => {
    onInstructions();
    if (onClose) onClose();
    popup.destroy();
  });

  // Close button for the popup
  const closePopup = new Konva.Text({
    text: "X",
    //x: 270,
    x: popupWidth - 30,
    y: 10,
    fontSize: 20,
    fill: "black",
  });

  // Event handler to close the settings popup
  closePopup.on("click tap", () => {
    if (onClose) onClose();
    popup.destroy();
  });


  popup.add(background, title, closePopup, menuButtonGroup, instructionsButtonGroup);

  return popup;
}
