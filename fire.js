window.addEventListener('DOMContentLoaded', async function () {
    const canvas = document.getElementById('renderCanvas');
    const engine = new BABYLON.Engine(canvas, true, { antialias: true });
    const scene = new BABYLON.Scene(engine);

    // Background Color
    scene.clearColor = new BABYLON.Color3(0.9, 0.95, 1);
    scene.imageProcessingConfiguration.contrast = 1.6;
    scene.imageProcessingConfiguration.exposure = 1.2;
    scene.environmentTexture = BABYLON.CubeTexture.CreateFromPrefilteredData(
        "https://playground.babylonjs.com/textures/environment.env", scene
    );

    // Camera
    const camera = new BABYLON.ArcRotateCamera("cinematicCamera",
        BABYLON.Tools.ToRadians(135),
        BABYLON.Tools.ToRadians(65),
        25,
        new BABYLON.Vector3(0, 3, 0),
        scene);

    camera.attachControl(canvas, true);
    camera.wheelDeltaPercentage = 0.01;
    camera.panningSensibility = 50;
    camera.lowerRadiusLimit = 10;
    camera.upperRadiusLimit = 40;


    // Lighting
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 1.2;

    // Floor with Texture
    const floor = BABYLON.MeshBuilder.CreateGround("floor", { width: 20, height: 20 }, scene);
    const floorMat = new BABYLON.StandardMaterial("floorMat", scene);
    floorMat.diffuseTexture = new BABYLON.Texture("assets/Floor.jpg", scene);
    floorMat.diffuseTexture.uScale = 4;
    floorMat.diffuseTexture.vScale = 4;
    floor.material = floorMat;


    // Walls
    const wallMat = new BABYLON.StandardMaterial("wallMat", scene);
    wallMat.diffuseTexture = new BABYLON.Texture("assets/wall.jpg", scene);
    wallMat.diffuseTexture.uScale = 2;
    wallMat.diffuseTexture.vScale = 2;

    const wallPositions = [
        { x: 0, y: 3, z: -10, ry: 0 },
        { x: 0, y: 3, z: 10, ry: 0 },
        { x: -10, y: 3, z: 0, ry: Math.PI / 2 },
        { x: 10, y: 3, z: 0, ry: Math.PI / 2 }
    ];

    wallPositions.forEach((pos, i) => {
        const solidWall = BABYLON.MeshBuilder.CreateBox(`wall${i}`, { width: 20, height: 6, depth: 0.3 }, scene);
        solidWall.position.set(pos.x, pos.y, pos.z);
        solidWall.rotation.y = pos.ry;

        const windowHole = BABYLON.MeshBuilder.CreateBox("windowHole", {
            width: 4, height: 2, depth: 0.4
        }, scene);
        windowHole.position.set(pos.x, 3, pos.z);
        if (pos.ry === 0) windowHole.position.z += 0.01;
        else windowHole.position.x += 0.01;

        const wallCSG = BABYLON.CSG.FromMesh(solidWall);
        const windowCSG = BABYLON.CSG.FromMesh(windowHole);
        const finalWall = wallCSG.subtract(windowCSG).toMesh(`wallWithWindow${i}`, null, scene);
        finalWall.material = wallMat;

        solidWall.dispose();
        windowHole.dispose();
    });

    // Table
    const table = BABYLON.MeshBuilder.CreateBox("table", { width: 3, height: 0.3, depth: 2 }, scene);
    table.position.set(0, 0.15, -3);
    const tableMat = new BABYLON.StandardMaterial("tableMat", scene);
    tableMat.diffuseColor = new BABYLON.Color3(0.6, 0.4, 0.2);
    table.material = tableMat;

    // Fire Particle System
    const fireEmitter = new BABYLON.TransformNode("fireEmitter", scene);
    fireEmitter.position.set(0, 0.9, -3);

    const fireSystem = new BABYLON.ParticleSystem("fire", 2000, scene);
    fireSystem.particleTexture = new BABYLON.Texture("https://playground.babylonjs.com/textures/flame.png", scene);
    fireSystem.emitter = fireEmitter;
    fireSystem.color1 = new BABYLON.Color4(1, 0.5, 0, 1.0);
    fireSystem.color2 = new BABYLON.Color4(1, 0, 0, 1.0);
    fireSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0.0);
    fireSystem.minSize = 0.2;
    fireSystem.maxSize = 0.6;
    fireSystem.minLifeTime = 0.3;
    fireSystem.maxLifeTime = 1.0;
    fireSystem.emitRate = 800;
    fireSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    fireSystem.direction1 = new BABYLON.Vector3(0, 1, 0);
    fireSystem.direction2 = new BABYLON.Vector3(0, 1, 0);
    fireSystem.minEmitPower = 1;
    fireSystem.maxEmitPower = 2;
    fireSystem.updateSpeed = 0.01;
    fireSystem.start();

    const fireLight = new BABYLON.PointLight("fireLight", fireEmitter.position.clone(), scene);
    fireLight.intensity = 1.2;
    fireLight.diffuse = new BABYLON.Color3(1, 0.3, 0);

    // Fire Extinguisher Model 
    const extinguisherBody = BABYLON.MeshBuilder.CreateCylinder("extinguisherBody", {
        height: 1.2, diameter: 0.3
    }, scene);
    extinguisherBody.position.set(2, 0.6, -2);
    const bodyMat = new BABYLON.StandardMaterial("bodyMat", scene);
    bodyMat.diffuseColor = new BABYLON.Color3(1, 0, 0);
    bodyMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
    extinguisherBody.material = bodyMat;

    const topCap = BABYLON.MeshBuilder.CreateCylinder("topCap", {
        height: 0.1, diameter: 0.32
    }, scene);
    topCap.position.set(2, 1.2, -2);
    const metalMat = new BABYLON.StandardMaterial("metalMat", scene);
    metalMat.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8);
    metalMat.specularColor = new BABYLON.Color3(1, 1, 1);
    topCap.material = metalMat;

    const hose = BABYLON.MeshBuilder.CreateTube("hose", {
        path: [
            new BABYLON.Vector3(2, 1.15, -2),
            new BABYLON.Vector3(2.1, 1.1, -2.1),
            new BABYLON.Vector3(2.2, 1, -2.2)
        ],
        radius: 0.03
    }, scene);
    const hoseMat = new BABYLON.StandardMaterial("hoseMat", scene);
    hoseMat.diffuseColor = new BABYLON.Color3(0, 0, 0);
    hose.material = hoseMat;

    const pin = BABYLON.MeshBuilder.CreateBox("pin", {
        width: 0.02, height: 0.1, depth: 0.02
    }, scene);
    pin.position.set(2, 1.25, -2);
    pin.material = metalMat;

    // Spray Effect
    const sprayEmitter = new BABYLON.TransformNode("sprayEmitter", scene);
    sprayEmitter.position.set(2.2, 1, -2.2);

    const spraySystem = new BABYLON.ParticleSystem("spray", 500, scene);
    spraySystem.particleTexture = new BABYLON.Texture("https://playground.babylonjs.com/textures/flare.png", scene);
    spraySystem.emitter = sprayEmitter;
    spraySystem.color1 = new BABYLON.Color4(1, 1, 1, 1);
    spraySystem.color2 = new BABYLON.Color4(1, 1, 1, 0.6);
    spraySystem.colorDead = new BABYLON.Color4(1, 1, 1, 0);
    spraySystem.minSize = 0.1;
    spraySystem.maxSize = 0.2;
    spraySystem.minLifeTime = 0.2;
    spraySystem.maxLifeTime = 0.4;
    spraySystem.emitRate = 1000;
    spraySystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
    spraySystem.direction1 = new BABYLON.Vector3(1, 0, -1);
    spraySystem.direction2 = new BABYLON.Vector3(1.2, -0.1, -1.2);
    spraySystem.minEmitPower = 1;
    spraySystem.maxEmitPower = 2;
    spraySystem.gravity = new BABYLON.Vector3(0, -1, 0);
    spraySystem.updateSpeed = 0.01;

    // Spray Sound
    const spraySound = new BABYLON.Sound("spraySound", "./assets/spray.mp3", scene, null, {
        loop: false,
        autoplay: false,
        volume: 0.7
    });


    // Interaction
    extinguisherBody.actionManager = new BABYLON.ActionManager(scene);
    extinguisherBody.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
            spraySystem.start();
            spraySound.play();
            fireSystem.stop();
            fireLight.dispose();
            alert("✅ Fire extinguished with spray!");
            setTimeout(() => {
                spraySystem.stop();
                spraySound.stop();
            }, 2000);
        })
    );

    // 🪑 Mentor Chair
    const chairSeat = BABYLON.MeshBuilder.CreateBox("chairSeat", {
        width: 0.6,
        height: 0.1,
        depth: 0.6
    }, scene);
    chairSeat.position.set(3, 0.5, -5);

    const chairBack = BABYLON.MeshBuilder.CreateBox("chairBack", {
        width: 0.6,
        height: 0.6,
        depth: 0.05
    }, scene);
    chairBack.position.set(3, 0.85, -5.25);

    // Legs
    const legMaterial = new BABYLON.StandardMaterial("legMat", scene);
    legMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    const legPositions = [
        [2.75, 0.25, -4.75],
        [3.25, 0.25, -4.75],
        [2.75, 0.25, -5.25],
        [3.25, 0.25, -5.25],
    ];
    legPositions.forEach((pos, index) => {
        const leg = BABYLON.MeshBuilder.CreateCylinder(`chairLeg${index}`, {
            height: 0.5,
            diameter: 0.05
        }, scene);
        leg.position.set(...pos);
        leg.material = legMaterial;
    });

    // Chair Material
    const chairMat = new BABYLON.StandardMaterial("chairMat", scene);
    chairMat.diffuseColor = new BABYLON.Color3(0.6, 0.3, 0.2);
    chairSeat.material = chairMat;
    chairBack.material = chairMat;

    // ✅ Make clickable + Add action
    chairSeat.isPickable = true;
    chairSeat.actionManager = new BABYLON.ActionManager(scene);
    chairSeat.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
        alert(
            "🧯 How to Use a Fire Extinguisher (P.A.S.S.):\n\n" +
            "⿡ P - Pull the pin\n" +
            "⿢ A - Aim at the base of the fire\n" +
            "⿣ S - Squeeze the handle\n" +
            "⿤ S - Sweep side to side\n\n" +
            "✅ Be calm and stay safe!"
        );
    }));

      // ---------- XR Setup ----------
      const xr = await scene.createDefaultXRExperienceAsync({
        uiOptions: { sessionMode: "immersive-ar", referenceSpaceType: "local-floor" },
        optionalFeatures: true
    });
      

    //Render loop
    engine.runRenderLoop(() => scene.render());
    window.addEventListener('resize', () => engine.resize());
});
