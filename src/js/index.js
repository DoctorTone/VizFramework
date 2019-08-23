import $ from "jquery";
import * as THREE from "three";
import { BaseApp } from "./baseApp";
import { APPCONFIG } from "./appConfig";
import { LabelManager } from "./LabelManager";
import controlkit from "controlkit";
import bootstrap from "bootstrap";

import exampleData from "../../data/exampleData.json";

class Framework extends BaseApp {
    constructor() {
        super();
        this.barMaterials = [];
        this.labelManager = new LabelManager();
        this.cameraRotate = false;
        this.rotSpeed = Math.PI/20;
        this.rotDirection = 1;
        this.zoomingIn = false;
        this.zoomingOut = false;
        this.zoomSpeed = APPCONFIG.ZOOM_SPEED;

        //Temp variables
        this.tempVec = new THREE.Vector3();
    }

    setContainer(container) {
        this.container = container;
    }

    init(container) {
        this.container = container;
        super.init(container);
    }

    addGroundPlane() {
        const groundGeom = new THREE.PlaneBufferGeometry(APPCONFIG.GROUND_WIDTH, APPCONFIG.GROUND_HEIGHT, APPCONFIG.GROUND_SEGMENTS);
        const groundMat = new THREE.MeshLambertMaterial( {color: APPCONFIG.GROUND_MATERIAL} );
        const ground = new THREE.Mesh(groundGeom, groundMat);
        ground.rotation.x = -Math.PI/2;
        ground.position.y = 0;
        this.root.add(ground);
    }

    createBarMaterials() {
        let barMaterial;
        for(let row=0; row<APPCONFIG.NUM_ROWS; ++row) {
            barMaterial = new THREE.MeshLambertMaterial( {color: APPCONFIG.BAR_COLOURS[row], transparent: true, opacity: 1} );
            this.barMaterials.push(barMaterial);
        }
    }

    createGUI() {
        let monthConfig = {
            Jan: true,
            Feb: true,
            Mar: true,
            Apr: true,
            May: true,
            Jun: true,
            Jul: true,
            Aug: true,
            Sep: true,
            Oct: true,
            Nov: true,
            Dec: true
        };

        let gapMonthConfig = {
            Month: 1,
            range: [1, 3]
        };

        let trendConfig = {
            Year1: false
        };

        let transparentConfig = {
            Year1: false
        };

        let valueConfig = {
            Year1: false
        };

        let scaleYearConfig = {
            Year1: 1,
            range: [0.1, 3]
        };

        let guiWidth = $('#guiWidth').css("width");
        guiWidth = parseInt(guiWidth, 10);
        let gui = new controlkit();
        gui.addPanel( {label: "Configuration", width: guiWidth, enable: false})
            .addSubGroup( {label: "Gaps", enable: false} )
                .addSlider(gapMonthConfig, "Month", "range", {
                    onChange: () => {
                        this.scaleBars(gapMonthConfig.Month, gapYearConfig.Year);
                    },
                    onFinish: () => {
                        this.scaleBars(gapMonthConfig.Month, gapYearConfig.Year);
                    }
                })
            .addSubGroup( {label: "Transparent", enable: false} )
                .addCheckbox(transparentConfig, "Year1", {
                    onChange: () => {
                        this.toggleTransparency("Year1");
                    }
                })
            .addSubGroup( {label: "Trends", enable: false} )
                .addCheckbox(trendConfig, "Year1", {
                    onChange: () => {
                        this.toggleTrend("Year1");
                    }
                })
            .addSubGroup( {label: "Scales", enable: false} )
                .addSlider(scaleYearConfig, "Year1", "range", {
                    onChange: () => {
                        this.scaleYears("Year1", scaleYearConfig.Year1);
                    },
                    onFinish: () => {
                        this.scaleYears("Year1", scaleYearConfig.Year1);
                    }
                })
            .addSubGroup( {label: "Values", enable: false} )
                .addCheckbox(valueConfig, "Year1", {
                    onChange: () => {
                        this.toggleValues("Year1");
                    }
                })
            
        this.gui = gui;
    }

    createScene() {
        // Init base createsScene
        super.createScene();
        // Create root object.
        this.root = new THREE.Object3D();
        this.addToScene(this.root);

        // Add ground
        this.addGroundPlane();

        /*
        // Add bars to scene
        const barGeom = new THREE.CylinderBufferGeometry(APPCONFIG.BAR_RADIUS, APPCONFIG.BAR_RADIUS, APPCONFIG.BAR_HEIGHT, APPCONFIG.BAR_SEGMENTS, APPCONFIG.BAR_SEGMENTS);
        const bars = [];
        this.createBarMaterials();
        let barMesh;
        let label;
        let labelProperty;
        let yearData;
        let monthData;
        let currentYear;
        let currentGroup;
        let currentValueGroup;
        // Lines
        let monthlyLinePositions = [];
        
        for(let row=0; row<APPCONFIG.NUM_ROWS; ++row) {
            currentYear = row + 1;
            // Create group
            currentGroup = new THREE.Group();
            currentGroup.name = "Year" + currentYear;
            this.root.add(currentGroup);

            currentValueGroup = new THREE.Group();
            currentValueGroup.name = "ValuesYear" + currentYear;
            currentValueGroup.visible = false;
            
            this.root.add(currentValueGroup);

            let linePositions = [];
            let labelValue;

            for(let bar=0; bar<APPCONFIG.NUM_BARS_PER_ROW; ++bar) {
                // Label properties
                labelProperty = {};
                labelProperty.position = new THREE.Vector3();

                // Create mesh
                barMesh = new THREE.Mesh(barGeom, this.barMaterials[row]);
                barMesh.name = currentGroup.name + APPCONFIG.MONTHS[bar];
                bars.push(barMesh);
                barMesh.position.set(APPCONFIG.barStartPos.x + (APPCONFIG.BAR_INC_X * bar), APPCONFIG.barStartPos.y, APPCONFIG.barStartPos.z + (APPCONFIG.BAR_INC_Z * row));

                yearData = exampleData["Year" + currentYear];
                monthData = yearData[bar].sales;
                if (monthData === 0) {
                    monthData = 0.001;
                }
                barMesh.scale.set(1, monthData, 1);
                barMesh.position.y += (monthData * 5);
                currentGroup.add(barMesh);

                // Lines
                linePositions.push(barMesh.position.x, barMesh.position.y*2, barMesh.position.z);

                // Value labels
                labelProperty.position.copy(barMesh.position);
                labelProperty.position.y *= 2;
                labelProperty.position.y += APPCONFIG.VALUE_OFFSET;
                labelProperty.visibility = true;
                labelProperty.scale = APPCONFIG.VALUE_SCALE;
                if (monthData < 0.5) {
                    monthData = 0;
                }
                labelValue = (row * APPCONFIG.NUM_BARS_PER_ROW) + bar;
                label = this.labelManager.create("valueLabel" + labelValue, monthData, labelProperty);
                currentValueGroup.add(label.getSprite());

                // Labels
                if (row === 0) {
                    labelProperty.position.copy(barMesh.position);
                    labelProperty.position.y = APPCONFIG.LABEL_HEIGHT;
                    labelProperty.position.add(APPCONFIG.LABEL_MONTH_OFFSET);
                    labelProperty.scale = APPCONFIG.LABEL_SCALE;
                    labelProperty.visibility = true;
                    labelProperty.textColour = APPCONFIG.LABEL_TEXTCOLOUR;
                    labelProperty.multiLine = false;
                    label = this.labelManager.create("monthLabel" + bar, APPCONFIG.MONTHS[bar], labelProperty);
                    this.root.add(label.getSprite());
                }

                if (bar === 0) {
                    labelProperty.position.copy(barMesh.position);
                    labelProperty.position.y = APPCONFIG.LABEL_HEIGHT;
                    labelProperty.position.add(APPCONFIG.LABEL_YEAR_OFFSET);
                    labelProperty.scale = APPCONFIG.LABEL_SCALE;
                    labelProperty.visibility = true;
                    labelProperty.textColour = APPCONFIG.LABEL_TEXTCOLOUR;
                    labelProperty.multiLine = false;
                    label = this.labelManager.create("yearLabel" + row, APPCONFIG.YEARS[row], labelProperty);
                    this.root.add(label.getSprite());
                }
            }
            monthlyLinePositions.push(linePositions);
        }

        this.bars = bars;

        this.createGUI();
        */
    }

    update() {
        let delta = this.clock.getDelta();

        if (this.cameraRotate) {
            this.root.rotation[this.rotAxis] += (this.rotSpeed * this.rotDirection * delta);
        }

        if(this.zoomingIn) {
            this.tempVec.copy(this.camera.position);
            this.tempVec.multiplyScalar(this.zoomSpeed * delta);
            this.root.position.add(this.tempVec);
            //DEBUG
            //console.log("Root = ", this.root.position);
        }

        if(this.zoomingOut) {
            this.tempVec.copy(this.camera.position);
            this.tempVec.multiplyScalar(this.zoomSpeed * delta);
            this.root.position.sub(this.tempVec);
            //DEBUG
            //console.log("Root = ", this.root.position);
        }

        super.update();
    }

    zoomIn(status) {
        this.zoomingIn = status;
    }

    zoomOut(status) {
        this.zoomingOut = status;
    }
}

$(document).ready( () => {
    
    const container = document.getElementById("WebGL-Output");
    const app = new Framework();
    app.setContainer(container);

    app.init(container);
    app.createScene();

    app.run();

    // Elements
    let rotateLeft = $("#rotateLeft");
    let rotateRight = $("#rotateRight");
    let rotateUp = $("#rotateUp");
    let rotateDown = $("#rotateDown");
    let zoomIn = $("#zoomIn");
    let zoomOut = $("#zoomOut");

    // Mouse interaction
    rotateLeft.on("mousedown", () => {
        app.rotateCamera(true, APPCONFIG.LEFT);
    });

    rotateLeft.on("mouseup", () => {
        app.rotateCamera(false);
    });

    rotateRight.on("mousedown", () => {
        app.rotateCamera(true, APPCONFIG.RIGHT);
    });

    rotateRight.on("mouseup", () => {
        app.rotateCamera(false);
    });

    rotateUp.on("mousedown", () => {
        app.rotateCamera(true, APPCONFIG.UP);
    });

    rotateUp.on("mouseup", () => {
        app.rotateCamera(false);
    });

    rotateDown.on("mousedown", () => {
        app.rotateCamera(true, APPCONFIG.DOWN);
    });

    rotateDown.on("mouseup", () => {
        app.rotateCamera(false);
    });

    zoomIn.on("mousedown", () => {
        app.zoomIn(true);
    });

    zoomIn.on("mouseup", () => {
        app.zoomIn(false);
    });

    zoomOut.on("mousedown", () => {
        app.zoomOut(true);
    });

    zoomOut.on("mouseup", () => {
        app.zoomOut(false);
    });

    zoomOut.on("mousedown", () => {
        app.zoomOut(true);
    });

    zoomOut.on("mouseup", () => {
        app.zoomOut(false);
    });

    // Touch interaction
    rotateLeft.on("touchstart", () => {
        app.rotateCamera(true, APPCONFIG.LEFT);
    });

    rotateLeft.on("touchend", () => {
        app.rotateCamera(false);
    });

    rotateRight.on("touchstart", () => {
        app.rotateCamera(true, APPCONFIG.RIGHT);
    });

    rotateRight.on("touchend", () => {
        app.rotateCamera(false);
    });

    rotateUp.on("touchstart", () => {
        app.rotateCamera(true, APPCONFIG.UP);
    });

    rotateUp.on("touchend", () => {
        app.rotateCamera(false);
    });

    rotateDown.on("touchstart", () => {
        app.rotateCamera(true, APPCONFIG.DOWN);
    });

    rotateDown.on("touchend", () => {
        app.rotateCamera(false);
    });

    zoomIn.on("touchstart", () => {
        app.zoomIn(true);
    });

    zoomIn.on("touchend", () => {
        app.zoomIn(false);
    });

    zoomOut.on("touchstart", () => {
        app.zoomOut(true);
    });

    zoomOut.on("touchend", () => {
        app.zoomOut(false);
    });

    $("#info").on("click", () => {
        $("#infoModal").modal();
    });
});
