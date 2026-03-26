const canvas = document.getElementById("gameCanvas");const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 1000;
canvas.height = 500;

const teclas = {};
window.addEventListener("keydown", e => teclas[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => teclas[e.key.toLowerCase()] = false);

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(freq, type, dur, vol = 0.2) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    g.gain.setValueAtTime(vol, audioCtx.currentTime);
    osc.connect(g); g.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + dur);
}

// --- CONFIGURAÇÃO DE FASES (CORRIGIDA) ---
const fases = [
    { n: "Fase 1: Aquecimento", obs: [] },
    { n: "Fase 2: Estreito", obs: [{x: 400, y: 0, w: 50, h: 200}, {x: 400, y: 300, w: 50, h: 200}] },
    { n: "Fase 3: Zig-Zag", obs: [{x: 250, y: 0, w: 40, h: 350}, {x: 550, y: 150, w: 40, h: 350}] },
    { n: "Fase 4: A Chicane (CORRIGIDA)", obs: [
        {x: 300, y: 0, w: 30, h: 350},   // Deixa espaço embaixo
        {x: 600, y: 150, w: 30, h: 350}  // Deixa espaço em cima
    ]},
    { n: "Fase 5: CAOS FINAL", obs: [
        {x: 200, y: 100, w: 100, h: 100}, {x: 500, y: 300, w: 100, h: 100}, 
        {x: 800, y: 150, w: 50, h: 50}, {x: 400, y: 0, w: 30, h: 150}
    ]}
];

let faseAtual = 0;
let gameOver = false;
let itens = []; // [ {x, y, tipo: 'cura' ou 'nitro'} ]

class Carro {
    constructor(x, y, cor, controles, id) {
        this.startX = x; this.startY = y;
        this.cor = cor; this.controles = controles; this.id = id;
        this.reset();
        this.score = 0;
    }

    reset() {
        this.x = this.startX; this.y = this.startY;
        this.hp = 100; this.angulo = 0; this.vel = 0;
        this.nitro = 100;
        this.maxVelBase = 7 + faseAtual;
    }

    atualizar() {
        if (gameOver || this.hp <= 0) return;

        let multAcel = 1;
        // Sistema de Nitro (Shift para P1, CapsLock ou Espaço para P2)
        const usandoNitro = (this.id === 1 && teclas["shift"]) || (this.id === 2 && teclas[" "]);
        if (usandoNitro && this.nitro > 0) {
            multAcel = 2;
            this.nitro -= 1.5;
            if (Math.random() > 0.5) playSound(200 + Math.random()*100, 'sine', 0.05, 0.05);
        } else if (this.nitro < 100) {
            this.nitro += 0.1; // Recarga lenta
        }

        if (teclas[this.controles.up]) this.vel += 0.3 * multAcel;
        if (teclas[this.controles.down]) this.vel -= 0.2;
        this.vel *= 0.97;

        let maxV = usandoNitro && this.nitro > 0 ? this.maxVelBase * 1.5 : this.maxVelBase;
        if (this.vel > maxV) this.vel = maxV;

        if (Math.abs(this.vel) > 0.5) {
            const d = this.vel > 0 ? 1 : -1;
            if (teclas[this.controles.left]) this.angulo -= 0.07 * d;
            if (teclas[this.controles.right]) this.angulo += 0.07 * d;
        }

        let nx = this.x + Math.cos(this.angulo) * this.vel;
        let ny = this.y + Math.sin(this.angulo) * this.vel;

        // Colisão
        let bateu = false;
        fases[faseAtual].obs.forEach(o => {
            if (nx > o.x && nx < o.x + o.w && ny > o.y && ny < o.y + o.h) bateu = true;
        });
        if (nx < 0 || nx > canvas.width || ny < 0 || ny > canvas.height) bateu = true;

        if (bateu) {
            this.hp -= 8;
            this.vel = -this.vel * 0.5;
            playSound(80, 'sawtooth', 0.3);
            atualizarHUD();
        } else {
            this.x = nx; this.y = ny;
        }

        // Coletar Itens
        itens.forEach((item, index) => {
            if (Math.hypot(this.x - item.x, this.y - item.y) < 30) {
                if (item.tipo === 'cura') { this.hp = Math.min(100, this.hp + 30); playSound(600, 'sine', 0.2); }
                if (item.tipo === 'nitro') { this.nitro = 100; playSound(800, 'triangle', 0.2); }
                itens.splice(index, 1);
                atualizarHUD();
            }
        });

        if (this.x > canvas.width - 20) vencerFase(this);
    }

    desenhar() {
        if (this.hp <= 0) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angulo);
        ctx.fillStyle = this.cor;
        ctx.fillRect(-20, -10, 40, 20);
        // Chamas do Nitro
        const usandoNitro = (this.id === 1 && teclas["shift"]) || (this.id === 2 && teclas[" "]);
        if (usandoNitro && this.nitro > 0) {
            ctx.fillStyle = "orange";
            ctx.fillRect(-30, -5, 10, 10);
        }
        ctx.restore();
    }
}

const p1 = new Carro(50, 150, "#ff4757", {up: "arrowup", down: "arrowdown", left: "arrowleft", right: "arrowright"}, 1);
const p2 = new Carro(50, 350, "#1e90ff", {up: "w", down: "s", left: "a", right: "d"}, 2);

function spawnItens() {
    itens = [];
    for(let i=0; i<3; i++) {
        itens.push({
            x: 200 + Math.random() * 600,
            y: 50 + Math.random() * 400,
            tipo: Math.random() > 0.5 ? 'cura' : 'nitro'
        });
    }
}

function vencerFase(v) {
    v.score += 100 + v.hp;
    faseAtual++;
    if (faseAtual >= fases.length) {
        document.getElementById("msg").innerText = "CAMPEÃO FINAL!";
        gameOver = true;
    } else {
        p1.reset(); p2.reset();
        spawnItens();
        document.getElementById("faseNome").innerText = fases[faseAtual].n;
    }
    atualizarHUD();
}

function atualizarHUD() {
    document.getElementById("hp1").innerText = Math.max(0, this.p1.hp);
    document.getElementById("hp2").innerText = Math.max(0, this.p2.hp);
    document.getElementById("bar1").style.width = p1.hp + "%";
    document.getElementById("bar2").style.width = p2.hp + "%";
}

function loop() {
    ctx.fillStyle = "#111"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Obstáculos
    ctx.fillStyle = "#444";
    fases[faseAtual].obs.forEach(o => { ctx.fillRect(o.x, o.y, o.w, o.h); });

    // Desenhar Itens
    itens.forEach(item => {
        ctx.fillStyle = item.tipo === 'cura' ? "#2ecc71" : "#f1c40f";
        ctx.beginPath(); ctx.arc(item.x, item.y, 10, 0, Math.PI*2); ctx.fill();
    });

    p1.atualizar(); p1.desenhar();
    p2.atualizar(); p2.desenhar();

    if (!gameOver) requestAnimationFrame(loop);
}

spawnItens();
loop();