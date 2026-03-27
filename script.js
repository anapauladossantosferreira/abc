const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const teclas = {};
window.addEventListener("keydown", e => teclas[e.key] = true);
window.addEventListener("keyup", e => teclas[e.key] = false);

class Carro {
    constructor(x, y, cor, controles) {
        this.x = x;
        this.y = y;
        this.angulo = 0; // Em radianos
        this.velocidade = 0;
        this.cor = cor;
        this.controles = controles;
        
        // Propriedades físicas
        this.aceleracao = 0.15;
        this.friccao = 0.98;
        this.velGiro = 0.05;
    }

    atualizar() {
        // Acelerar / Ré
        if (teclas[this.controles.up]) this.velocidade += this.aceleracao;
        if (teclas[this.controles.down]) this.velocidade -= this.aceleracao;

        // Girar (apenas se estiver em movimento)
        if (Math.abs(this.velocidade) > 0.1) {
            const direcaoGiro = this.velocidade > 0 ? 1 : -1;
            if (teclas[this.controles.left]) this.angulo -= this.velGiro * direcaoGiro;
            if (teclas[this.controles.right]) this.angulo += this.velGiro * direcaoGiro;
        }

        // Aplicar Física
        this.velocidade *= this.friccao;
        this.x += Math.cos(this.angulo) * this.velocidade;
        this.y += Math.sin(this.angulo) * this.velocidade;

        // Limites da tela (teleporte)
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
    }

    desenhar() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angulo);
        
        // Corpo do carro
        ctx.fillStyle = this.cor;
        ctx.fillRect(-15, -10, 30, 20);
        
        // Faróis (para saber a frente)
        ctx.fillStyle = "yellow";
        ctx.fillRect(10, -8, 5, 4);
        ctx.fillRect(10, 4, 5, 4);
        
        ctx.restore();
    }
}

// Criar Jogadores
const p1 = new Carro(100, 300, "#ff4757", { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight" });
const p2 = new Carro(100, 350, "#1e90ff", { up: "w", down: "s", left: "a", right: "d" });

function loop() {
    // Fundo
    ctx.fillStyle = "#2f3542";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenhar "Pista" simples
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 2;
    for(let i=0; i<canvas.width; i+=50) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
    }

    p1.atualizar();
    p1.desenhar();

    p2.atualizar();
    p2.desenhar();

    requestAnimationFrame(loop);
}

loop();