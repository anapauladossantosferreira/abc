const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 1000;
canvas.height = 600;

const teclas = {};
window.addEventListener("keydown", e => teclas[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => teclas[e.key.toLowerCase()] = false);

// --- MOTOR DE ÁUDIO (Gera som de batida) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playCrashSound() {
    const oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(100, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
    
    oscillator.connect(gain);
    gain.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.2);
}

class Carro {
    constructor(x, y, cor, controles, nome) {
        this.x = x;
        this.y = y;
        this.angulo = 0;
        this.velocidade = 0;
        this.cor = cor;
        this.controles = controles;
        this.nome = nome;
        
        // Atributos de "Velocidade Máxima"
        this.largura = 40;
        this.altura = 20;
        this.aceleracao = 0.4; // Mais rápido
        this.maxVel = 12;      // Velocidade máxima alta
        this.friccao = 0.96;
        this.velGiro = 0.08;
        this.raioColisao = 18; // Para detectar batidas
    }

    atualizar() {
        if (teclas[this.controles.up]) this.velocidade += this.aceleracao;
        if (teclas[this.controles.down]) this.velocidade -= this.aceleracao * 0.5;

        if (this.velocidade > this.maxVel) this.velocidade = this.maxVel;
        if (this.velocidade < -this.maxVel/2) this.velocidade = -this.maxVel/2;

        if (Math.abs(this.velocidade) > 0.2) {
            const dir = this.velocidade > 0 ? 1 : -1;
            if (teclas[this.controles.left]) this.angulo -= this.velGiro * dir;
            if (teclas[this.controles.right]) this.angulo += this.velGiro * dir;
        }

        this.velocidade *= this.friccao;
        this.x += Math.cos(this.angulo) * this.velocidade;
        this.y += Math.sin(this.angulo) * this.velocidade;

        // Limites da pista
        if (this.x < 0 || this.x > canvas.width) this.velocidade *= -0.7;
        if (this.y < 0 || this.y > canvas.height) this.velocidade *= -0.7;
    }

    desenhar() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angulo);
        
        // Corpo do Carro (Design mais realista)
        ctx.fillStyle = this.cor;
        ctx.fillRect(-this.largura/2, -this.altura/2, this.largura, this.altura);
        
        // Teto/Vidros
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(-5, -7, 15, 14);
        
        // Faróis
        ctx.fillStyle = "yellow";
        ctx.fillRect(this.largura/2 - 5, -this.altura/2 + 2, 5, 4);
        ctx.fillRect(this.largura/2 - 5, this.altura/2 - 6, 5, 4);
        
        ctx.restore();
    }
}

const p1 = new Carro(100, 200, "#ff4757", { up: "arrowup", down: "arrowdown", left: "arrowleft", right: "arrowright" }, "P1");
const p2 = new Carro(100, 400, "#1e90ff", { up: "w", down: "s", left: "a", right: "d" }, "P2");

function checkCollision(c1, c2) {
    const dx = c1.x - c2.x;
    const dy = c1.y - c2.y;
    const distancia = Math.sqrt(dx * dx + dy * dy);

    if (distancia < (c1.raioColisao + c2.raioColisao)) {
        playCrashSound();
        
        // Efeito de ricochete (troca de energia)
        let tempVel = c1.velocidade;
        c1.velocidade = c2.velocidade * 1.2;
        c2.velocidade = tempVel * 1.2;
        
        // Empurra os carros para não ficarem presos
        const overlap = (c1.raioColisao + c2.raioColisao) - distancia;
        const nx = dx / distancia;
        const ny = dy / distancia;
        c1.x += nx * overlap;
        c1.y += ny * overlap;
    }
}

function loop() {
    // Fundo asfalto
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Linhas da estrada
    ctx.strokeStyle = "#444";
    ctx.setLineDash([20, 20]);
    ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);

    p1.atualizar();
    p2.atualizar();
    
    checkCollision(p1, p2);

    p1.desenhar();
    p2.desenhar();

    requestAnimationFrame(loop);
}

// Iniciar após primeiro clique (necessário para áudio no navegador)
window.addEventListener('click', () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
}, { once: true });

loop();