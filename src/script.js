import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import testVertexShader from './shaders/test/vertex.glsl'
import testFragmentShader from './shaders/test/fragment.glsl'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { GroundedSkybox } from 'three/addons/objects/GroundedSkybox.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'



// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
const material = new THREE.ShaderMaterial({
    vertexShader: testVertexShader,
    fragmentShader: testFragmentShader,
    side: THREE.DoubleSide,
    uniforms: {
        uTime: {value: 0}
    }
})

/**
 * GLTF Models
 */
const gltfLoader = new GLTFLoader();

let group = null;

gltfLoader.load('./models/carModel/CarModel.glb', (car) => {
    console.log(car);
    const carBody = car.scene.children[0];
    const carSkin = car.scene.children[1];

    const carScale = 500
    carBody.scale.set(carScale , carScale, carScale);
    carSkin.scale.set(carScale , carScale, carScale);

    group = new THREE.Group();
    group.add(carBody, carSkin);
    group.castShadow = true;

    group.rotation.y = Math.PI * 0.09;

    scene.add(group);


    carSkin.traverse((child) => {
        if (child.isMesh) {
            child.material = material;
        }
    }); 
});


/**
 * Environment maps
 */

const rgbeLoader = new RGBELoader();

rgbeLoader.load('./envMap/zwartkops_curve_sunset_4k.hdr', (envMap) => {
    envMap.mapping = THREE.EquirectangularReflectionMapping;
    
    const skybox = new GroundedSkybox(envMap, 15, 70);
    skybox.position.y = 15;
    skybox.receiveShadow = true;
    scene.add(skybox);
})

/**
 * Lights
 */
const light = new THREE.AmbientLight( 0xffffff ); // soft white light
scene.add( light );

const sun = new THREE.DirectionalLight(0xffffff, 1.0);
sun.position.set(42.67, 23.01, 27.92);
sun.castShadow = true;
scene.add(sun);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(-4.5, 19.6, 38.3);
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableZoom = true;
controls.minDistance = 20;
controls.maxDistance = 40;
controls.maxPolarAngle = Math.PI * 0.35;
controls.enablePan = false;
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.needsUpdate = true;

/**
 * Animate
 */

const clock = new THREE.Clock();

const tick = () =>
{
    // Update controls
    controls.update()

    console.log(controls.zoom0);
    material.uniforms.uTime.value = clock.getElapsedTime();

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()