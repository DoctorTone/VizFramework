// General parameters for this app

const APPCONFIG = {
    ROOT_ROTATE: Math.PI/4,
    BAR_COLOUR : 0xfff000,
    BAR_RADIUS: 5,
    BAR_HEIGHT: 10,
    BAR_SEGMENTS: 16,
    NUM_BARS_PER_ROW: 12,
    NUM_ROWS: 1,
    barStartPos: {
        x: -165,
        y: 0,
        z: 90
    },
    BAR_INC_X: 30,
    BAR_COLOURS: [
        0xff0000,
        0x00ff00,
        0x0000ff,
        0xffff00,
        0x00ffff
    ],
    LABEL_SCALE: {
        x: 20,
        y: 5,
        z: 1
    },
    LABEL_HEIGHT: 2,
    LABEL_TEXTCOLOUR: "rgba(255, 255, 255, 1.0)",
    VALUE_OFFSET: 5,
    VALUE_SCALE: {
        x: 17.5,
        y: 8.5,
        z: 1
    },
    RIGHT: 1,
    LEFT: 0,
    UP: 2,
    DOWN: 3,
    ZOOM_SPEED: 0.1
}

export { APPCONFIG };
