import $ from "jquery";
import * as THREE from "three";
import { BaseApp } from "./baseApp";
import { APPCONFIG } from "./appConfig";
import { LabelManager } from "./LabelManager";
import controlkit from "controlkit";
import bootstrap from "bootstrap";

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
    }
}

$(document).ready( () => {
    
    const container = document.getElementById("WebGL-Output");
    const app = new Framework();
    app.setContainer(container);

    app.init(container);
    app.createScene();

    app.run();
});
