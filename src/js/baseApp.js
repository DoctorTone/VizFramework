//Common base class for web apps

import { SceneConfig } from "./sceneConfig";
import * as THREE from "three";
//import * as TrackballControls from "three-trackballcontrols";
let TrackballControls = require("three-trackballcontrols");

export class BaseApp {
    constructor() {
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.controls = null;
        this.stats = null;
        this.container = null;
        this.mouse = new THREE.Vector2();
        this.pickingEnabled = false;
        this.pickedObjects = [];
        this.selectedObject = null;
        this.hoverObjects = [];
        this.elapsedTime = 0;
        this.clock = new THREE.Clock();
        this.clock.start();
        this.raycaster = new THREE.Raycaster();
        this.objectsPicked = false;
        this.tempVector = new THREE.Vector3();
    }

    init() {
        this.createRenderer();
        this.createCamera();
        this.createControls();
        /*
        this.stats = new Stats();
        container.appendChild(this.stats.dom);
        */
        this.statsShowing = false;
        //$("#Stats-output").hide();
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer( {antialias : true, alpha: true});
        this.renderer.setClearColor(SceneConfig.clearColour, 1.0);
        this.renderer.shadowMap.enabled = true;

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild( this.renderer.domElement );

        window.addEventListener('keydown', event => {
            this.keyDown(event);
        }, false);

        window.addEventListener('resize', event => {
            this.windowResize(event);
        }, false);

        this.renderer.domElement.addEventListener("mousedown", event => {
            this.mouseClicked(event);
        }, false);

        this.renderer.domElement.addEventListener("mouseup", event => {
            this.mouseUp(event);
        }, false);

        this.renderer.domElement.addEventListener("mousemove", event => {
            this.mouseMoved(event);
        }, false);
    }

    keyDown(event) {
        //Key press functionality
        switch(event.key) {
            case "s":
                if (this.stats) {
                    if (this.statsShowing) {
                        $("#Stats-output").hide();
                        this.statsShowing = false;
                    } else {
                        $("#Stats-output").show();
                        this.statsShowing = true;
                    }
                }
                break;
            case "p":
                console.log('Cam =', this.camera.position);
                console.log('Look =', this.controls.target);
        }
    }

    mouseClicked(event) {
        //Update mouse state
        event.preventDefault();
        if (!this.pickingEnabled) return;
        
        this.pickedObjects.length = 0;

        this.mouse.set((event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1);
        this.mouse.down = true;
        this.raycaster.setFromCamera(this.mouse, this.camera);
        let intersects = this.raycaster.intersectObjects( this.scene.children, true );
        if(intersects.length > 0) {
            this.selectedObject = intersects[0].object;
            //DEBUG
            console.log("Picked = ", this.selectedObject);
        }
    }

    mouseUp(event) {
        event.preventDefault();

        this.sliceScale = 1;
        this.renderUpdate = true;
        this.mouse.down = false;
    }

    mouseMoved(event) {
        //Update mouse state
        event.preventDefault();
        this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    }

    windowResize() {
        //Handle window resize
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize( window.innerWidth, window.innerHeight);
    }

    createScene() {
        let scene = new THREE.Scene();

        let ambientLight = new THREE.AmbientLight(SceneConfig.ambientLightColour);
        scene.add(ambientLight);

        /*
         var spotLight = new THREE.SpotLight(0xffffff);
         spotLight.position.set(100, 100, 200);
         spotLight.intensity = 1;
         this.scene.add(spotLight);
         */

        /*
         var directionalLight = new THREE.DirectionalLight( 0xffffff, 1.0 );
         directionalLight.position.set( 1, 1, 1 );
         this.scene.add( directionalLight );
         */


        let pointLight = new THREE.PointLight(SceneConfig.pointLightColour);
        pointLight.position.set(0,1000,1500);
        pointLight.name = 'PointLight';
        scene.add(pointLight);

        this.scene = scene;
    }

    getObjectByName(name) {
        return this.scene.getObjectByName(name);
    }

    createCamera() {
        let camNear = new THREE.Vector3(SceneConfig.CameraPos.x, SceneConfig.CameraPos.y, SceneConfig.CameraPos.z);
        this.camera = new THREE.PerspectiveCamera(SceneConfig.FOV, this.container.clientWidth / window.innerHeight, SceneConfig.NEAR_PLANE, SceneConfig.FAR_PLANE );
        this.camera.position.copy(camNear);
        this.camPosNear = camNear;
    }

    moveCamera(rotation) {
        //Rotate camera about lookat point
        this.cameraRotation += rotation;
        let lookAt = this.controls.target;
        this.tempVector.copy(this.camera.position);
        this.tempVector.y = 0;
        let radius = this.tempVector.distanceTo(lookAt);
        let deltaX = radius*Math.sin(this.cameraRotation);
        let deltaZ = radius*Math.cos(this.cameraRotation);
        this.camera.position.set(lookAt.x + deltaX, this.camera.position.y, lookAt.z + deltaZ);
    }

    createControls() {
        this.controls = new TrackballControls(this.camera, this.renderer.domElement);
        this.controls.rotateSpeed = 1.0;
        this.controls.zoomSpeed = 1.0;
        this.controls.panSpeed = 1.0;

        this.controls.staticMoving = true;
        this.controls.dynamicDampingFactor = 0.3;

        // Disable controls
        const controlsDisabled = false;
        this.controls.noRotate = controlsDisabled;
	    this.controls.noZoom = controlsDisabled;
        this.controls.noPan = controlsDisabled;
        
        this.controls.keys = [ 65, 83, 68 ];

        let lookAt = new THREE.Vector3(SceneConfig.LookAtPos.x, SceneConfig.LookAtPos.y, SceneConfig.LookAtPos.z);
        this.controls.target.copy(lookAt);
    }

    update() {
        //Do any updates
        this.controls.update();
        //this.stats.update();
    }

    run() {
        this.update();
        this.renderer.render( this.scene, this.camera );
        if(this.stats) this.stats.update();
        requestAnimationFrame(() => {
            this.run();
        });
    }

    initStats() {
        let stats = new Stats();

        stats.setMode(0); // 0: fps, 1: ms

        // Align top-left
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';

        $("#Stats-output").append( stats.domElement );

        return stats;
    }
}
