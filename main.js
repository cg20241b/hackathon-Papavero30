import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

// Pengaturan dasar scene Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Material shader khusus untuk efek animasi
const textMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0 }
    },
    vertexShader: `
        uniform float time;
        void main() {
            vec3 pos = position;
            pos.y += sin(time + position.x) * 0.1;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `,
    fragmentShader: `
        void main() {
            gl_FragColor = vec4(0.7, 0.2, 0.3, 1.0);
        }
    `
});

// Memuat font untuk teks 3D
const loader = new FontLoader();
loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function(font) {
    // Membuat geometri huruf 'l' di sisi kiri
    const letterGeometry = new TextGeometry('l', {
        font: font,
        size: 1,
        height: 0.2,
    });
    const letterMesh = new THREE.Mesh(letterGeometry, textMaterial);
    letterMesh.position.set(-2, 0, 0);
    scene.add(letterMesh);

    // Membuat geometri angka '0' di sisi kanan
    const numberGeometry = new TextGeometry('0', {
        font: font,
        size: 1,
        height: 0.2,
    });
    const numberMesh = new THREE.Mesh(numberGeometry, textMaterial);
    numberMesh.position.set(2, 0, 0);
    scene.add(numberMesh);
});

// Mengatur posisi kamera
camera.position.z = 5;

// Fungsi untuk menganimasikan scene
function animate() {
    requestAnimationFrame(animate);
    textMaterial.uniforms.time.value += 0.05;
    renderer.render(scene, camera);
}
animate();

// Menangani perubahan ukuran layar
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}