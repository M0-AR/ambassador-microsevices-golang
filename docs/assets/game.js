/* Synapse: a small 3D neural network explainer with optional speech narration. */
import * as THREE from "./vendor/three.module.min.js";

const canvas = document.getElementById("neural-canvas");
const growBtn = document.getElementById("game-grow");
const resetBtn = document.getElementById("game-reset");
const narrateBtn = document.getElementById("game-narrate");
const logEl = document.getElementById("game-log");
const barEl = document.getElementById("game-bar");
const progressEl = document.getElementById("game-progress-label");
const labelsEl = document.getElementById("layer-labels");
const noWebgl = document.getElementById("no-webgl");

const steps = [
  {
    text: "This is the input layer. Each node is one measurable signal — a customer's past orders, browsing depth, and how recently they bought.",
    caption: "Input layer · raw signals enter the network"
  },
  {
    text: "Now a hidden layer. Every connection carries a weight, learned from examples. Together, the weights turn raw signals into patterns.",
    caption: "Hidden layer 1 · weights turn signals into patterns"
  },
  {
    text: "A second hidden layer combines those patterns. Early layers notice simple things; deeper layers notice combinations — like a lapsed big spender who browsed twice this week.",
    caption: "Hidden layer 2 · patterns combine into behavior"
  },
  {
    text: "The output layer turns everything into a prediction. One node estimates the probability of another purchase.",
    caption: "Output layer · the network makes a prediction"
  },
  {
    text: "Forward pass: data flows left to right, and each layer transforms it. The network doesn't know anything yet — these weights are still untrained.",
    caption: "Forward pass · data moves left to right"
  },
  {
    text: "Training compares the prediction with the truth, then nudges every weight in the direction that reduces the error. Repeat across thousands of examples, and the network tunes itself. That's it.",
    caption: "Training · compare, correct, repeat"
  }
];

const LAYERS = [
  { count: 3, x: -3.1, color: 0xf0b35b },
  { count: 5, x: -1.05, color: 0x7ee2b8 },
  { count: 4, x: 1.05, color: 0x7ee2b8 },
  { count: 2, x: 3.1, color: 0x8ab4f8 }
];

let step = 0;
let narrate = true;
let speechOK = "speechSynthesis" in window;
let webglOK = false;
let renderer = null;
let scene = null;
let camera = null;
let group = null;
let clock = null;
let nodes = [];
let edges = [];
let stars = null;
let raf = 0;
let waveStart = 0;

const drag = { active: false, x: 0, y: 0, targetX: 0.08, targetY: -0.28 };
const view = { zoom: 9.6, targetZoom: 9.6 };
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setProgress() {
  if (barEl) barEl.style.width = (step / steps.length) * 100 + "%";
  if (progressEl) progressEl.textContent = step + " / " + steps.length;
  if (growBtn) {
    growBtn.disabled = step >= steps.length;
    growBtn.textContent = step >= steps.length ? "Fully grown" : step === 0 ? "Grow network" : "Add next layer";
  }
}

function logStep(index) {
  if (!logEl) return;
  Array.from(logEl.children).forEach((line) => line.classList.remove("active"));
  const line = document.createElement("div");
  line.className = "line active";
  line.innerHTML = `<b>${index + 1}</b><span>${steps[index].caption}</span>`;
  logEl.appendChild(line);
  logEl.scrollTop = logEl.scrollHeight;
}

function speak(text) {
  if (!narrate || !speechOK) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.02;
    utterance.pitch = 0.98;
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  } catch (error) { /* speech is optional */ }
}

function stopSpeech() {
  if (!speechOK) return;
  try { window.speechSynthesis.cancel(); } catch (error) { /* optional */ }
}

function buildScene() {
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (error) {
    webglOK = false;
    return;
  }
  webglOK = true;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0.35, view.zoom);
  camera.lookAt(0, 0, 0);

  group = new THREE.Group();
  group.rotation.x = 0.08;
  group.rotation.y = -0.28;
  scene.add(group);

  scene.add(new THREE.AmbientLight(0x9fe8c8, 0.55));
  const key = new THREE.PointLight(0x7ee2b8, 45, 30);
  key.position.set(4, 5, 6);
  scene.add(key);
  const warm = new THREE.PointLight(0xf0b35b, 26, 26);
  warm.position.set(-5, -3, 4);
  scene.add(warm);

  const starGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(220 * 3);
  for (let i = 0; i < 220; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 26;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 18 - 4;
  }
  starGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0x7ee2b8, size: 0.035, transparent: true, opacity: 0.36 }));
  scene.add(stars);
}

function nodePosition(layerIndex, nodeIndex) {
  const layer = LAYERS[layerIndex];
  const spread = 0.62;
  const y = (nodeIndex - (layer.count - 1) / 2) * spread;
  const z = Math.sin((layerIndex + 1) * (nodeIndex + 2)) * 0.12;
  return new THREE.Vector3(layer.x, y, z);
}

function addNode(layerIndex, nodeIndex) {
  if (!webglOK) return;
  const layer = LAYERS[layerIndex];
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.115, 20, 20),
    new THREE.MeshStandardMaterial({
      color: layer.color,
      emissive: layer.color,
      emissiveIntensity: 0.55,
      roughness: 0.35,
      metalness: 0.1,
      transparent: true,
      opacity: 0.98
    })
  );
  mesh.position.copy(nodePosition(layerIndex, nodeIndex));
  mesh.scale.setScalar(0.01);
  mesh.userData = { layer: layerIndex, target: 1, born: performance.now() };
  group.add(mesh);
  nodes.push(mesh);
}

function addEdge(a, b) {
  if (!webglOK) return;
  const geometry = new THREE.BufferGeometry().setFromPoints([a.position.clone(), b.position.clone()]);
  const material = new THREE.LineBasicMaterial({ color: 0x7ee2b8, transparent: true, opacity: 0 });
  const line = new THREE.Line(geometry, material);
  line.userData = { target: 0.16, born: performance.now() };
  group.add(line);
  edges.push(line);
}

function nodesOfLayer(index) {
  return nodes.filter((mesh) => mesh.userData.layer === index);
}

function connectLayers(fromLayer, toLayer) {
  nodesOfLayer(fromLayer).forEach((a) => {
    nodesOfLayer(toLayer).forEach((b) => addEdge(a, b));
  });
}

function grow() {
  if (step >= steps.length) return;
  step += 1;
  setProgress();
  logStep(step - 1);

  if (webglOK) {
    if (step === 1) {
      for (let i = 0; i < LAYERS[0].count; i += 1) addNode(0, i);
    } else if (step === 2) {
      for (let i = 0; i < LAYERS[1].count; i += 1) addNode(1, i);
      connectLayers(0, 1);
    } else if (step === 3) {
      for (let i = 0; i < LAYERS[2].count; i += 1) addNode(2, i);
      connectLayers(1, 2);
    } else if (step === 4) {
      for (let i = 0; i < LAYERS[3].count; i += 1) addNode(3, i);
      connectLayers(2, 3);
    } else if (step === 5) {
      waveStart = performance.now();
    }
  }

  speak(steps[step - 1].text);
}

function reset(announce) {
  step = 0;
  stopSpeech();
  if (webglOK) {
    nodes.forEach((mesh) => { group.remove(mesh); mesh.geometry.dispose(); mesh.material.dispose(); });
    edges.forEach((line) => { group.remove(line); line.geometry.dispose(); line.material.dispose(); });
    nodes = [];
    edges = [];
    waveStart = 0;
    group.rotation.set(0.08, -0.28, 0);
    drag.targetX = 0.08;
    drag.targetY = -0.28;
  }
  if (logEl) logEl.innerHTML = "";
  setProgress();
  if (announce) {
    logStep(0);
    logEl.firstChild.classList.remove("active");
  }
}

function resize() {
  if (!webglOK || !renderer) return;
  const parent = canvas.parentElement;
  const width = parent.clientWidth;
  const height = parent.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function animate() {
  raf = requestAnimationFrame(animate);
  if (!webglOK) return;
  const now = performance.now();
  const t = now / 1000;

  if (group) {
    if (!drag.active && !reduceMotion) {
      drag.targetY += 0.00055;
    }
    group.rotation.x += (drag.targetX - group.rotation.x) * 0.08;
    group.rotation.y += (drag.targetY - group.rotation.y) * 0.08;
  }

  view.zoom += (view.targetZoom - view.zoom) * 0.09;
  if (camera) {
    camera.position.z = view.zoom;
    camera.lookAt(0, 0, 0);
  }

  nodes.forEach((mesh) => {
    const age = (now - mesh.userData.born) / 640;
    const target = age >= 1 ? 1 : Math.min(1, age);
    const eased = 1 - Math.pow(1 - target, 3);
    let scale = eased;
    if (waveStart && step >= 5) {
      const wave = Math.sin(t * 3.2 - mesh.userData.layer * 1.1);
      scale *= 1 + Math.max(0, wave) * 0.14;
      mesh.material.emissiveIntensity = 0.55 + Math.max(0, wave) * 0.9;
    }
    if (step === steps.length) {
      mesh.material.emissiveIntensity = 0.7 + Math.sin(t * 1.6 + mesh.userData.layer) * 0.18;
    }
    mesh.scale.setScalar(Math.max(0.01, scale));
  });

  edges.forEach((line) => {
    const age = (now - line.userData.born) / 720;
    const target = age >= 1 ? line.userData.target : line.userData.target * Math.max(0, age);
    line.material.opacity += (target - line.material.opacity) * 0.18;
  });

  if (stars) stars.rotation.y = t * 0.01;

  renderer.render(scene, camera);
}

function initInteractions() {
  if (labelsEl) {
    labelsEl.innerHTML = "<span>Input</span><span>Hidden 1</span><span>Hidden 2</span><span>Prediction</span>";
  }

  narrateBtn.setAttribute("aria-pressed", "true");
  narrateBtn.setAttribute("aria-label", "Disable narration");

  if (!speechOK) {
    narrate = false;
    narrateBtn.disabled = true;
    narrateBtn.setAttribute("aria-pressed", "false");
    narrateBtn.setAttribute("aria-label", "Narration is not supported in this browser");
    narrateBtn.title = "Narration is not supported in this browser";
  }

  growBtn.addEventListener("click", grow);

  resetBtn.addEventListener("click", () => {
    reset(false);
    speak("Reset. Let's grow the network again.");
  });

  narrateBtn.addEventListener("click", () => {
    narrate = !narrate;
    narrateBtn.setAttribute("aria-pressed", narrate ? "true" : "false");
    narrateBtn.setAttribute("aria-label", narrate ? "Disable narration" : "Enable narration");
    if (!narrate) stopSpeech();
    else if (step > 0) speak(steps[step - 1].text);
  });

  if (webglOK) {
    canvas.addEventListener("pointerdown", (event) => {
      drag.active = true;
      drag.x = event.clientX;
      drag.y = event.clientY;
      canvas.setPointerCapture(event.pointerId);
    });

    canvas.addEventListener("pointermove", (event) => {
      if (!drag.active) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      drag.x = event.clientX;
      drag.y = event.clientY;
      drag.targetY += dx * 0.006;
      drag.targetX = Math.max(-0.7, Math.min(0.7, drag.targetX + dy * 0.005));
    });

    const release = () => { drag.active = false; };
    canvas.addEventListener("pointerup", release);
    canvas.addEventListener("pointercancel", release);

    canvas.addEventListener("wheel", (event) => {
      event.preventDefault();
      view.targetZoom = Math.max(6.4, Math.min(14, view.targetZoom + event.deltaY * 0.0035));
    }, { passive: false });

    window.addEventListener("resize", resize);
  }

  setProgress();
  if (step === 0) {
    showWelcome();
  }
}

function showWelcome() {
  if (!logEl) return;
  logEl.innerHTML = '<div class="line active"><b>0</b><span>Press “Grow network”. The canvas assembles a tiny model while the narrator explains each part out loud.</span></div>';
}

function boot() {
  if (noWebgl) noWebgl.hidden = true;
  if (!canvas) return;

  if (!window.WebGLRenderingContext) {
    webglOK = false;
  } else {
    buildScene();
  }

  if (!webglOK) {
    canvas.hidden = true;
    if (noWebgl) noWebgl.hidden = false;
    setProgress();
    if (labelsEl) labelsEl.innerHTML = "";
  } else {
    resize();
    animate();
  }

  initInteractions();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}

window.addEventListener("pagehide", () => {
  cancelAnimationFrame(raf);
  stopSpeech();
});
