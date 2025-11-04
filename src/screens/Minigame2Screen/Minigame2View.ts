import Konva from "konva";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants";

export class Minigame2View {
    private group: Konva.Group;
    private carImage: Konva.Image | Konva.Circle | null = null;
    private obstacleText: Konva.Text;
    private timerText: Konva.Text;
    private roadDashes: Konva.Group;
    private roadAnimation: Konva.Animation;
    private puddles: Konva.Shape[] = [];
    private puddleSpawnInterval = 3500; // new puddle every 3.5 seconds
    private lastPuddleTime = 0;
    private onPuddleHit?: () => void;


    constructor() {
    this.group = new Konva.Group({ visible: false });

    // ========================= ROAD BACKGROUND ==========================
    const road = new Konva.Rect({
        x: 0,
        y: 0,
        width: STAGE_WIDTH,
        height: STAGE_HEIGHT,
        fill: "gray",
    })
    this.group.add(road);

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
    this.group.add(this.roadDashes);

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
    this.group.add(grassTop);
    this.group.add(grassBottom);

    // ========================= TEXT ELEMENTS ==========================
    // obstacle count
    this.obstacleText = new Konva.Text({
      x: 20,
      y: 20,
      text: "Obstacles hit: 0",
      fontSize: 24,
      fill: "black",
    });
    this.group.add(this.obstacleText);

    // timer display that counts down from game duration
    this.timerText = new Konva.Text({
        x: STAGE_WIDTH - 150,
        y: 20,
        text: "Time left: ${MINIGAME2_DURATION}",
        fontSize: 24,
        fill: "black",
    });
    this.group.add(this.timerText);

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
}

    setOnPuddleHit(callback: () => void): void {
        this.onPuddleHit = callback;
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

            // const isColliding = Konva.Util.haveIntersection(carBox, puddleBox);
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