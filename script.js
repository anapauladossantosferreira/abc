const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 1000;
canvas.height = 500;

const teclas = {};
window.addEventListener("keydown", e => teclas[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => teclas[e.key.toLowerCase()] = false);

// --- SONS ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(freq, type, dur) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + dur);
    g.gain.setValueAtTime(0.2, audioCtx.currentTime);
    osc.connect(g); g.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + dur);
}

// --- MAPAS (5 FASES) ---
const fases = [
    { n: "Fase 1: Aquecimento", obs: [] },
    { n: "Fase 2: Estreito", obs: [{x: 300, y: 0, w: 40, h: 350}, {x: 600, y: 150, w: 40, h: 350}] },
    { n: "Fase 3: Zig-Zag", obs: [{x: 200, y: 0, w: 30, h: 400}, {x: 400, y: 100, w: 30, h: 400}, {x: 700, y: 0, w: 30, h: 400}] },
    { n: "Fase 4: Labirinto", obs: [{x: 200, y: 200, w: 600, h: 30}, {x: 400, y: 0, w: 30, h: 200}, {x: 600, y: 230, w: 30, h: 300}] },
    { n: "Fase 5: CAOS TOTAL", obs: [{x: 150, y: 150, w: 100, h: 100}, {x: 450, y: 250, w: 100, h: 100}, {x: 750, y: 50, w: 100, h: 100}, {x: 300, y: 400, w: 400, h: 30}] }
];

let faseAtual = 0;
let gameOver = false;

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
        this.maxVel = 7 + faseAtual;
    }

    atualizar() {
        if (gameOver || this.hp <= 0) return;

        if (teclas[this.controles.up]) this.vel += 0.3;
        if (teclas[this.controles.down]) this.vel -= 0.2;
        this.vel *= 0.97;

        if (Math.abs(this.vel) > 0.5) {
            const d = this.vel > 0 ? 1 : -1;
            if (teclas[this.controles.left]) this.angulo -= 0.07 * d;
            if (teclas[this.controles.right]) this.angulo += 0.07 * d;
        }

        let nx = this.x + Math.cos(this.angulo) * this.vel;
        let ny = this.y + Math.sin(this.angulo) * this.vel;

        // Colisão Paredes/Obs
        let bateu = false;
        fases[faseAtual].obs.forEach(o => {
            if (nx > o.x && nx < o.x + o.w && ny > o.y && ny < o.y + o.h) bateu = true;
        });
        if (nx < 0 || nx > canvas.width || ny < 0 || ny > canvas.height) bateu = true;

        if (bateu) {
            this.hp -= 5;
            this.vel = -this.vel * 0.8;
            playSound(100, 'sawtooth', 0.2);
            atualizarHUD();
        } else {
            this.x = nx; this.y = ny;
        }

        if (this.x > canvas.width - 20) vencerFase(this);
    }

    desenhar() {
        if (this.hp <= 0) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angulo);
        ctx.fillStyle = this.cor;
        ctx.fillRect(-20, -10, 40, 20);
        ctx.fillStyle = "white"; ctx.fillRect(15, -8, 5, 4); ctx.fillRect(15, 4, 5, 4);
        ctx.restore();
    }
}

const p1 = new Carro(50, 150, "#ff4757", {up: "arrowup", down: "arrowdown", left: "arrowleft", right: "arrowright"}, 1);
const p2 = new Carro(50, 350, "#1e90ff", {up: "w", down: "s", left: "a", right: "d"}, 2);

function vencerFase(vencedor) {
    vencedor.score += 100 + (vencedor.hp);
    faseAtual++;
    if (faseAtual >= fases.length) {
        document.getElementById("msg").innerText = "VITÓRIA FINAL!";
        gameOver = true;
    } else {
        p1.reset(); p2.reset();
        document.getElementById("faseNome").innerText = fases[faseAtual].n;
        playSound(500, 'sine', 0.5);
    }
    atualizarHUD();
}

function atualizarHUD() {
    document.getElementById("hp1").innerText = p1.hp;
    document.getElementById("hp2").innerText = p2.hp;
    document.getElementById("score1").innerText = p1.score;
    document.getElementById("score2").innerText = p2.score;
    document.getElementById("bar1").style.width = p1.hp + "%";
    document.getElementById("bar2").style.width = p2.hp + "%";

    if (p1.hp <= 0 && p2.hp <= 0) {
        gameOver = true;
        document.getElementById("msg").innerText = "GAME OVER!";
    }
}

function loop() {
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Obstáculos
    ctx.fillStyle = "#444";
    fases[faseAtual].obs.forEach(o => {
        ctx.fillRect(o.x, o.y, o.w, o.h);
        ctx.strokeStyle = "#ff4500"; ctx.strokeRect(o.x, o.y, o.w, o.h);
    });

    // Chegada
    ctx.fillStyle = "gold"; ctx.fillRect(canvas.width - 10, 0, 10, canvas.height);

    p1.atualizar(); p1.desenhar();
    p2.atualizar(); p2.desenhar();

    // Colisão entre carros
    let dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
    if (dist < 30 && p1.hp > 0 && p2.hp > 0) {
        p1.hp -= 1; p2.hp -= 1;
        p1.vel *= -1.2; p2.vel *= -1.2;
        playSound(150, 'square', 0.1);
        atualizarHUD();
    }

    if (!gameOver) requestAnimationFrame(loop);
}

loop();