import Konva from "konva";
import { STAGE_WIDTH, STAGE_HEIGHT, MINIGAME_POPUP_HEIGHT, MINIGAME_POPUP_WIDTH } from "../../constants";
import { FONTS } from "../../fonts";
import { createMenuSettingsPopup } from "../../BackButtonPopup";

export class Minigame2View {
    private group: Konva.Group;
    private carImage: Konva.Image | Konva.Circle | null = null;
    private obstacleText: Konva.Text;
    private timerText: Konva.Text;
    private roadDashes: Konva.Group;
    private roadAnimation: Konva.Animation;
    private puddles: Konva.Shape[] = [];
    private puddleSpawnInterval = 2000; // new puddle every 2 seconds
    private lastPuddleTime = 0;
    private onPuddleHit?: () => void;
    private onResultsButtonClick?: () => void;
    private summaryNodes: Konva.Node[] = [];

    private settingsPopup: Konva.Group | null = null;
    private onBackToMenuClick: () => void;
    private onInstructionsClick: () => void;


    constructor(onBackToMenuClick: () => void,
                onInstructionsClick: () => void) {
    this.group = new Konva.Group({ visible: false });
    this.onBackToMenuClick = onBackToMenuClick;
    this.onInstructionsClick = onInstructionsClick;

    // ========================= ROAD BACKGROUND ==========================
    const road = new Konva.Rect({
        x: 0,
        y: 0,
        width: STAGE_WIDTH,
        height: STAGE_HEIGHT,
        fill: "gray",
    })

    // road dashes
    const dashCount = 15;        // number of dashes visible at once
    const dashWidth = 60;
    const dashHeight = 10;
    const dashSpacing = 40;
    const roadCenterY = (STAGE_HEIGHT / 2) - (dashHeight / 2);

    this.roadDashes = new Konva.Group();

    for (let i = 0; i < dashCount; i++) {
        const dash = new Konva.Rect({
            x: i * (dashWidth + dashSpacing),
            y: roadCenterY,
            width: dashWidth,
            height: dashHeight,
            fill: "yellow",
        });
        this.roadDashes.add(dash);
    }
    this.group.add(road, this.roadDashes);

    // ====================== ANIMATION FOR ROAD MOVEMENT =======================
    const speed = 5;
    this.roadAnimation = new Konva.Animation((frame) => {
    if (!frame) return;

    // move the dashed lines
    this.roadDashes.x(this.roadDashes.x() - speed);
    if (this.roadDashes.x() < -(dashWidth + dashSpacing)) {
        this.roadDashes.x(0);
    }

    // move puddles
    for (const puddle of this.puddles) {
        puddle.x(puddle.x() - speed);
    }

    // remove puddles that have moved off the screen
    this.puddles = this.puddles.filter((puddle) => {
        if (puddle.x() + puddle.getClientRect().width < 0) {
            puddle.destroy();
            return false;
        }
        return true;
    });

    // periodically spawn new puddles
    const now = frame.time;
    if (now - this.lastPuddleTime > this.puddleSpawnInterval) {
        this.spawnPuddle();
        this.lastPuddleTime = now;
    }

    this.checkCollisions();

    }, this.group.getLayer());

    // ========================= GREEN GRASS STRIPS ========================
    const grassTop = new Konva.Rect({
        x: 0,
        y: 0,
        width: STAGE_WIDTH,
        height: STAGE_HEIGHT / 5,
        fill: "green",
    })
    const grassBottom = new Konva.Rect({
        x: 0,
        y: STAGE_HEIGHT - (STAGE_HEIGHT / 5),
        width: STAGE_WIDTH,
        height: STAGE_HEIGHT / 5,
        fill: "green",
    })
    this.group.add(grassTop, grassBottom);

    // ========================= TEXT ELEMENTS ==========================
    // obstacle count
    this.obstacleText = new Konva.Text({
      x: 30,
      y: 30,
      text: "Obstacles hit: 0",
      fontSize: 30,
      fontFamily: FONTS.BODY,
      fill: "black",
    });

    // timer display that counts down from 30 seconds
    this.timerText = new Konva.Text({
        x: STAGE_WIDTH - 230,
        y: 30,
        text: "Time left: 30",
        fontSize: 30,
        fontFamily: FONTS.BODY,
        fill: "black",
    });
    this.group.add(this.timerText, this.obstacleText);

    // ========================= DELIVERY CAR IMAGE ==========================
    Konva.Image.fromURL("/deliverycar.png", (img) => {
        img.width(200);
        img.height(200);
        img.x(250);
        img.y(STAGE_HEIGHT / 3 + 15);

        img.rotation(90);

        this.carImage = img;
        this.group.add(img);
        this.group.getLayer()?.draw();
    });

    // SETTINGS BUTTON (top-right corner)
    const settingsGroup = new Konva.Group({ x: STAGE_WIDTH - 180, y: STAGE_HEIGHT - 70 });

    const settingsBtn = new Konva.Rect({
        width: 160,
        height: 50,
        fill: "#d84315",
        cornerRadius: 8,
        stroke: "#b71c1c",
        strokeWidth: 2,
    });

    const settingsText = new Konva.Text({
        x: 80,
        y: 25,
        text: "⚙︎  |  𝓲",
        fontFamily: FONTS.BUTTON,
        fontSize: 30,
        fill: "white",
    });
    settingsText.offsetX(settingsText.width() / 2);
    settingsText.offsetY(settingsText.height() / 2);

    settingsGroup.add(settingsBtn, settingsText);

    // clicking opens/closes popup
    settingsGroup.on("click tap", () => {
        if (this.settingsPopup) {
            this.settingsPopup.destroy();
            this.settingsPopup = null;
            this.group.getLayer()?.draw();
            return;
        }

        this.settingsPopup = createMenuSettingsPopup({
            onBackToMenu: onBackToMenuClick,
            onInstructions: onInstructionsClick,
            onClose: () => {
                this.settingsPopup = null;
                this.group.getLayer()?.draw();
            },
        });

        this.group.add(this.settingsPopup);
        this.group.getLayer()?.draw();
    });

    // Add all elements to the main group
    this.group.add(settingsGroup);
}

    setOnPuddleHit(callback: () => void): void {
        this.onPuddleHit = callback;
    }

    setOnResultsButtonClick(callback: () => void): void {
        this.onResultsButtonClick = callback;
    }

    private checkCollisions(): void {
        if (!this.carImage) return;

        const carBox = this.carImage.getClientRect(); // get bounding box of car
        const carPadding = 30; // tighten collision area a bit
        const carX = carBox.x + carPadding;
        const carY = carBox.y + carPadding;
        const carW = carBox.width - carPadding * 2;
        const carH = carBox.height - carPadding * 2;

        for (const puddle of this.puddles) {
            const puddleBox = puddle.getClientRect(); // get bounding box of the puddle
            const puddlePadding = 30; // shrink puddle hitbox a little
            const puddleX = puddleBox.x + puddlePadding;
            const puddleY = puddleBox.y + puddlePadding;
            const puddleW = puddleBox.width - puddlePadding * 2;
            const puddleH = puddleBox.height - puddlePadding * 2;

            const isColliding =
                carX < puddleX + puddleW &&
                carX + carW > puddleX &&
                carY < puddleY + puddleH &&
                carY + carH > puddleY;

            if (isColliding && !(puddle as any)._alreadyHit) {
                (puddle as any)._alreadyHit = true; // mark puddle as hit
                this.onPuddleHit?.(); // notify controller
            }
        }
    }

    private spawnPuddle(): void {
        const roadTop = STAGE_HEIGHT / 5;
        const roadBottom = STAGE_HEIGHT - STAGE_HEIGHT / 5;

        const puddleWidth = 100 + Math.random() * 60;
        const puddleHeight = 60 + Math.random() * 40;
        const puddleX = STAGE_WIDTH + puddleWidth;
        const puddleY = roadTop + Math.random() * (roadBottom - roadTop);

        // create a random blobby shape
        const numPoints = 6 + Math.floor(Math.random() * 4);
        const points: number[] = [];
        for (let i = 0; i < numPoints; i++) {
            const angle = (Math.PI * 2 * i) / numPoints;
            const radius = puddleWidth / 2 + (Math.random() - 0.5) * 20;
            const px = radius * Math.cos(angle);
            const py = radius * Math.sin(angle) * (puddleHeight / puddleWidth);
            points.push(px, py);
        }

        const puddle = new Konva.Line({
            points,
            fill: "rgba(30, 144, 255, 0.5)",
            stroke: "rgba(0, 0, 100, 0.4)",
            strokeWidth: 2,
            closed: true,
            tension: 0.5,
            x: puddleX,
            y: puddleY,
        });

        this.group.add(puddle);
        this.puddles.push(puddle);

        // ensure puddle renders below the car
        if (this.carImage) {
            this.carImage.moveToTop();
        }
        this.group.getLayer()?.draw();
        }

    moveCarUp(): void {
        if (this.carImage) {
            const newY = Math.max(
            STAGE_HEIGHT / 5 - 50,  // don’t go onto grass
            this.carImage.y() - 5
            );

            this.carImage.y(newY);
            this.group.getLayer()?.draw();
        }
        }

    moveCarDown(): void {
        if (this.carImage) {
            const maxY = STAGE_HEIGHT - STAGE_HEIGHT / 5 - 150; // don’t go onto grass
            const newY = Math.min(maxY, this.carImage.y() + 5);
            this.carImage.y(newY);
            this.group.getLayer()?.draw();
        }
    }

    updateTimer(timeRemaining: number): void {
        this.timerText.text(`Time left: ${timeRemaining}`);
        this.group.getLayer()?.draw();
    }

    // helper to clear previous summary display
    clearSummary(): void {
        if(this.summaryNodes.length === 0) return;
        this.summaryNodes.forEach(node => node.destroy());  
        this.summaryNodes = [];
        this.group.getLayer()?.draw();
    }

    showSummary(obstaclesHit: number, tip: number, review: string): void {
       this.clearSummary();
        // background overlay
        const overlay = new Konva.Rect({
            x: 0,
            y: 0,
            width: STAGE_WIDTH,
            height: STAGE_HEIGHT,
            fill: "rgba(0, 0, 0, 0.5)",
        });

        // summary box
        const boxWidth = MINIGAME_POPUP_WIDTH;
        const boxHeight = MINIGAME_POPUP_HEIGHT;
        const popup = new Konva.Rect({
            x: (STAGE_WIDTH - boxWidth) / 2,
            y: (STAGE_HEIGHT - boxHeight) / 2,
            width: boxWidth,
            height: boxHeight,
            fill: "#bdbdbd",
            stroke: "#9e9e9e",
            strokeWidth: 3,
            cornerRadius: 20,
            shadowColor: "gray",
            shadowBlur: 10,
        });

        // title
        const titleText = new Konva.Text({
            x: (STAGE_WIDTH - boxWidth) / 2,
            y: (STAGE_HEIGHT - boxHeight) / 2 + 20,
            width: boxWidth,
            align: "center",
            text: "🍕 Delivery Complete! 🍕",
            fontSize: 30,
            fontStyle: "bold",
            fontFamily: FONTS.HEADER,
            fill: "#333",
        });

        // obstacles text
        const summaryText = new Konva.Text({
            x: (STAGE_WIDTH - boxWidth) / 2,
            y: (STAGE_HEIGHT - boxHeight) / 2 + 100,
            width: boxWidth,
            align: "center",
            text: `Obstacles hit: ${obstaclesHit}`,
            fontSize: 22,
            fontFamily: FONTS.BODY,
            fill: "#555",
        });

        // tip text
        const tipText = new Konva.Text({
            x: (STAGE_WIDTH - boxWidth) / 2,
            y: (STAGE_HEIGHT - boxHeight) / 2 + 170,
            width: boxWidth,
            align: "center",
            text: tip > 0 ? `💰 Tip earned: $${tip.toFixed(2)}` : `💸 No tip earned`,
            fontSize: 26,
            fontStyle: "bold",
            fontFamily: FONTS.HEADER,
            fill: tip > 0 ? "#2e7d32" : "#c62828",
        });

        // review text
        const reviewText = new Konva.Text({
            x: (STAGE_WIDTH - boxWidth) / 2 + 40,
            y: (STAGE_HEIGHT - boxHeight) / 2 + 220,
            width: boxWidth - 80,
            align: "center",
            text: `Customer Review: "${review}"`,
            fontSize: 18,
            fontFamily: FONTS.BODY,
            fill: "#333",
        });

        this.group.add(overlay, popup, titleText, summaryText, tipText, reviewText);

        // ==================== RESULTS BUTTON ====================
        const buttonWidth = 150;
        const buttonHeight = 50;
        const buttonX = (STAGE_WIDTH - buttonWidth) / 2;
        const buttonY = (STAGE_HEIGHT - boxHeight) / 2 + boxHeight + 20;

        const buttonGroup = new Konva.Group({
            x: buttonX,
            y: buttonY,
            listening: true,
        });

        const resultsButton = new Konva.Rect({
            width: buttonWidth,
            height: buttonHeight,
            fill: "#e57467ff",
            cornerRadius: 10,
            shadowColor: "black",
            shadowBlur: 5,
        });

        const buttonLabel = new Konva.Text({
            y: 13,
            width: buttonWidth,
            align: "center",
            text: "Results",
            fontSize: 22,
            fontStyle: "bold",
            fontFamily: FONTS.BUTTON,
            fill: "white",
        });

        // single click handler
        buttonGroup.on("click", () => {
            this.onResultsButtonClick?.();
        });

        buttonGroup.add(resultsButton, buttonLabel);
        this.group.add(buttonGroup);

        this.group.add(overlay, popup, titleText, summaryText, tipText, reviewText, buttonGroup);
        this.summaryNodes = [overlay, popup, titleText, summaryText, tipText, reviewText, buttonGroup];

        this.group.getLayer()?.draw();
        // Michelle next steps: add hover effect?
    }

    getGroup(): Konva.Group {
        return this.group;
    }

    updateObstacleCount(count: number): void {
        this.obstacleText.text(`Obstacles: ${count}`);
    }

    stopAnimation(): void {
        this.roadAnimation?.stop();
    }

    show(): void {
        this.group.visible(true);
        this.roadAnimation?.start();
        this.group.getLayer()?.draw();
    }

    hide(): void {
        this.group.visible(false);
        this.roadAnimation?.stop();
        this.group.getLayer()?.draw();
    }
}