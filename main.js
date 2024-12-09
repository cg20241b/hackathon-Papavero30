import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

// Pengaturan dasar scene Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Set renderer background to black
renderer.setClearColor(0x000000);

// Modifikasi material cube untuk efek matahari dengan glow yang lebih kuat
const glowingCubeMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0 }
    },
    vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
            float intensity = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
            
            // Core white color
            vec3 coreColor = vec3(1.0, 1.0, 1.0);
            
            // Outer glow color (soft yellow-white)
            vec3 glowColor = vec3(1.0, 0.9, 0.7);
            
            // Combine core and glow
            vec3 finalColor = mix(coreColor, glowColor, intensity);
            
            // Add extra bloom effect
            float bloom = pow(intensity, 1.5) * 3.0;
            finalColor += glowColor * bloom;
            
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending
});

// Update shader for alphabet and digit with different specular properties
const createAlphabetMaterial = (baseColor) => {
    return new THREE.ShaderMaterial({
        uniforms: {
            lightPos: { value: new THREE.Vector3(0, 0, 0) },
            baseColor: { value: baseColor },
            time: { value: 0 }
        },
        vertexShader: `
            varying vec3 vPosition;
            varying vec3 vNormal;
            uniform float time;
            
            void main() {
                vPosition = position;
                vNormal = normalize(normalMatrix * normal);
                vec3 pos = position;
                pos.y += sin(time + position.x) * 0.1;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 lightPos;
            uniform vec3 baseColor;
            varying vec3 vPosition;
            varying vec3 vNormal;
            
            void main() {
                // Ambient light (using 0.400 as per requirement)
                float ambientStrength = 0.400;
                vec3 ambient = ambientStrength * baseColor;
                
                // Diffuse lighting
                vec3 lightDir = normalize(lightPos - vPosition);
                float diff = max(dot(vNormal, lightDir), 0.0);
                vec3 diffuse = diff * baseColor;
                
                // Plastic-like specular (Blinn-Phong)
                vec3 viewDir = normalize(-vPosition);
                vec3 halfDir = normalize(lightDir + viewDir);
                float spec = pow(max(dot(vNormal, halfDir), 0.0), 32.0);
                vec3 specular = vec3(0.5) * spec;
                
                vec3 result = ambient + diffuse + specular;
                gl_FragColor = vec4(result, 1.0);
            }
        `
    });
};

const createDigitMaterial = (baseColor) => {
    return new THREE.ShaderMaterial({
        uniforms: {
            lightPos: { value: new THREE.Vector3(0, 0, 0) },
            baseColor: { value: baseColor },
            time: { value: 0 }
        },
        vertexShader: `
            varying vec3 vPosition;
            varying vec3 vNormal;
            uniform float time;
            
            void main() {
                vPosition = position;
                vNormal = normalize(normalMatrix * normal);
                vec3 pos = position;
                pos.y += sin(time + position.x) * 0.1;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 lightPos;
            uniform vec3 baseColor;
            varying vec3 vPosition;
            varying vec3 vNormal;
            
            void main() {
                // Ambient light (using 0.400 as per requirement)
                float ambientStrength = 0.400;
                vec3 ambient = ambientStrength * baseColor;
                
                // Diffuse lighting
                vec3 lightDir = normalize(lightPos - vPosition);
                float diff = max(dot(vNormal, lightDir), 0.0);
                vec3 diffuse = diff * baseColor;
                
                // Metallic specular
                vec3 viewDir = normalize(-vPosition);
                vec3 reflectDir = reflect(-lightDir, vNormal);
                float spec = pow(max(dot(viewDir, reflectDir), 0.0), 64.0);
                vec3 specular = baseColor * spec * 2.0; // Metallic reflection related to base color
                
                vec3 result = ambient + diffuse + specular;
                gl_FragColor = vec4(result, 1.0);
            }
        `
    });
};

// Update material definitions with new shader materials
const letterMaterial = createAlphabetMaterial(new THREE.Vector3(0.545, 0.0, 0.545));
const numberMaterial = createDigitMaterial(new THREE.Vector3(0.0, 0.545, 0.0));

// Buat cube bercahaya dengan ukuran lebih kecil
const cubeGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
const cube = new THREE.Mesh(cubeGeometry, glowingCubeMaterial);
cube.position.set(0, 0, 0);

// Tambahkan outer glow mesh
const glowGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
const glowMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0 }
    },
    vertexShader: `
        varying vec3 vNormal;
        void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        varying vec3 vNormal;
        void main() {
            float intensity = pow(0.8 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
            vec3 glowColor = vec3(1.0, 0.9, 0.7); // Soft yellow-white glow
            gl_FragColor = vec4(glowColor, intensity * 0.5);
        }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide
});

const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
cube.add(glowMesh);
scene.add(cube);

// Add point light
const light = new THREE.PointLight(0xffffff, 1, 10);
light.position.set(0, 0, 0);
scene.add(light);

// Memuat font untuk teks 3D
const loader = new FontLoader();
loader.load('/font/Race Sport_Regular.json', function(font) {
    // Membuat geometri huruf 'l' di sisi kiri
    const letterGeometry = new TextGeometry('l', {
        font: font,
        size: 1,
        height: 0.2,
        curveSegments: 12,
        bevelEnabled: false
    });
    const letterMesh = new THREE.Mesh(letterGeometry, letterMaterial);
    letterMesh.position.set(-1.5, 0, 0);
    scene.add(letterMesh);

    // Membuat geometri angka '0' di sisi kanan
    const numberGeometry = new TextGeometry('0', {
        font: font, 
        size: 1,
        height: 0.2,
        curveSegments: 12,
        bevelEnabled: false
    });
    const numberMesh = new THREE.Mesh(numberGeometry, numberMaterial);
    numberMesh.position.set(1.5, 0, 0);
    scene.add(numberMesh);
});

// Mengatur posisi kamera
camera.position.z = 5;

// Fungsi untuk menganimasikan scene
function animate() {
    requestAnimationFrame(animate);
    
    // Update waktu untuk animasi
    letterMaterial.uniforms.time.value += 0.05;
    numberMaterial.uniforms.time.value += 0.05;
    
    // Animasi posisi dan rotasi cube
    const time = Date.now() * 0.001;
    cube.position.x = Math.sin(time) * 0.5;
    cube.position.y = Math.cos(time) * 0.3;
    
    // Tambahkan rotasi cube yang lebih halus
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    cube.rotation.z += 0.005;
    
    // Animate glow intensity
    glowMaterial.uniforms.time.value += 0.02;
    
    // Update posisi cahaya
    letterMaterial.uniforms.lightPos.value.copy(cube.position);
    numberMaterial.uniforms.lightPos.value.copy(cube.position);
    
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