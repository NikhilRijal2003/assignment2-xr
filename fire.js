window.addEventListener('DOMContentLoaded', async function(){
    const canvas = document.getElementById('renderCanvas');
    const engine = new BABYLON.Engine(canvas, true);
    const scene = new BABYLON.Scene(engine);

    // Background Color
    scene.clearColor = new BABYLON.Color3(0.9, 0.95, 1);

    // Camera
    const camera = new BABYLON.ArcRotateCamera("camera",
        BABYLON.Tools.ToRadians(45),
        BABYLON.Tools.ToRadians(70),
        20, new BABYLON.Vector3(0,2,0), scene);
    camera.attachControl(canvas, true);

    // Lighting
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 1.0;

        // Floor with Texture
        const floor = BABYLON.MeshBuilder.CreateGround("floor", { width: 20, height: 20 }, scene);
        const floorMat = new BABYLON.StandardMaterial("floorMat", scene);
        floorMat.diffuseTexture = new BABYLON.Texture("Assets/Floor.jpg", scene); 
        floorMat.diffuseTexture.uScale = 4;
        floorMat.diffuseTexture.vScale = 4;
        floor.material = floorMat;
    
        // Ceiling
        const ceiling = BABYLON.MeshBuilder.CreateGround("ceiling", { width: 20, height: 20 }, scene);
        ceiling.rotation.x = Math.PI;
        ceiling.position.y = 6;
        const ceilingMat = new BABYLON.StandardMaterial("ceilingMat", scene);
        ceilingMat.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.9);
        ceiling.material = ceilingMat;
    

    // Render loop
    engine.runRenderLoop(() => scene.render());
    window.addEventListener('resize', () => engine.resize());
});
