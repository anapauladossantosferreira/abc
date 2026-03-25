const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let faseAtual = 1;
const teclas = {};
window.addEventListener("keydown", e => teclas[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => teclas[e.key.toLowerCase()] = false);

// --- SONS ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function somExplosao() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.3);
}

// --- CONFIGURAÇÃO DE FASES ---
const mapas = {
    1: { nome: "FASE 1: Reta Final", obstaculos: [] },
    2: { nome: "FASE 2: Desvio Duplo", obstaculos: [{x: 400, y: 0, w: 50, h: 250}, {x: 400, y: 350, w: 50, h: 250}] },
    3: { nome: "FASE 3: Labirinto", obstaculos: [{x: 250, y: 150, w: 300, h: 40}, {x: 250, y: 400, w: 300, h: 40}, {x: 500, y: 0, w: 40, h: 200}] }
};

class Carro {
    constructor(x, y, cor, controles) {
        this.startX = x; this.startY = y;
        this.reset();
        this.cor = cor; this.controles = controles;
        this.largura = 34; this.altura = 18;
    }

    reset() {
        this.x = this.startX; this.y = this.startY;
        this.angulo = 0; this.velocidade = 0;
        this.maxVel = 8 + (faseAtual * 2); // Fica mais rápido a cada fase
    }

    atualizar() {
        if (teclas[this.controles.up]) this.velocidade += 0.4;
        if (teclas[this.controles.down]) this.velocidade -= 0.3;

        this.velocidade *= 0.96; // Fricção
        if (this.velocidade > this.maxVel) this.velocidade = this.maxVel;

        if (Math.abs(this.velocidade) > 0.5) {
            const dir = this.velocidade > 0 ? 1 : -1;
            if (teclas[this.controles.left]) this.angulo -= 0.08 * dir;
            if (teclas[this.controles.right]) this.angulo += 0.08 * dir;
        }

        let novaX = this.x + Math.cos(this.angulo) * this.velocidade;
        let novaY = this.y + Math.sin(this.angulo) * this.velocidade;

        // Colisão com Obstáculos e Bordas
        let colidiu = false;
        mapas[faseAtual].obstaculos.forEach(obs => {
            if (novaX > obs.x && novaX < obs.x + obs.w && novaY > obs.y && novaY < obs.y + obs.h) {
                colidiu = true;
            }
        });

        if (novaX < 0 || novaX > canvas.width || novaY < 0 || novaY > canvas.height) colidiu = true;

        if (colidiu) {
            somExplosao();
            this.velocidade = -this.velocidade * 0.5;
        } else {
            this.x = novaX;
            this.y = novaY;
        }

        // Vitória da Fase
        if (this.x > canvas.width - 30) proximaFase();
    }

    desenhar() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angulo);
        ctx.fillStyle = this.cor;
        ctx.fillRect(-17, -9, 34, 18);
        ctx.fillStyle = "white"; // Faróis
        ctx.fillRect(12, -8, 4, 4); ctx.fillRect(12, 4, 4, 4);
        ctx.restore();
    }
}

const p1 = new Carro(50, 200, "#ff4757", { up: "arrowup", down: "arrowdown", left: "arrowleft", right: "arrowright" });
const p2 = new Carro(50, 400, "#1e90ff", { up: "w", down: "s", left: "a", right: "d" });

function proximaFase() {
    faseAtual++;
    if (faseAtual > 3) {
        alert("PARABÉNS! VOCÊS ZERARAM O JOGO!");
        faseAtual = 1;
    }
    document.getElementById("faseTitulo").innerText = mapas[faseAtual].nome;
    p1.reset(); p2.reset();
}

function loop() {
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenhar Obstáculos
    ctx.fillStyle = "#555";
    mapas[faseAtual].obstaculos.forEach(obs => {
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        ctx.strokeStyle = "#777";
        ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
    });

    // Linha de Chegada
    ctx.fillStyle = "#f1c40f";
    ctx.fillRect(canvas.width - 15, 0, 15, canvas.height);

    p1.atualizar(); p1.desenhar();
    p2.atualizar(); p2.desenhar();

    // Batida entre carros
    let dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
    if (dist < 30) {
        somExplosao();
        p1.velocidade *= -1.5; p2.velocidade *= -1.5;
    }

    requestAnimationFrame(loop);
}

loop();