const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Ajuste do tamanho do canvas
canvas.width = 800;
canvas.height = 500;

let score1 = 0;
let score2 = 0;
const teclas = {};

// Captura de teclas
window.addEventListener("keydown", e => teclas[e.key] = true);
window.addEventListener("keyup", e => teclas[e.key] = false);

class Carro {
    constructor(x, y, cor, controles, nome) {
        this.startX = x;
        this.startY = y;
        this.nome = nome;
        this.reset();
        this.cor = cor;
        this.controles = controles;
        
        this.largura = 30;
        this.altura = 18;
        this.aceleracao = 0.2;
        this.friccao = 0.97;
        this.velGiro = 0.06;
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.angulo = 0;
        this.velocidade = 0;
    }

    atualizar() {
        if (teclas[this.controles.up]) this.velocidade += this.aceleracao;
        if (teclas[this.controles.down]) this.velocidade -= this.aceleracao;

        if (Math.abs(this.velocidade) > 0.2) {
            const direcaoGiro = this.velocidade > 0 ? 1 : -1;
            if (teclas[this.controles.left]) this.angulo -= this.velGiro * direcaoGiro;
            if (teclas[this.controles.right]) this.angulo += this.velGiro * direcaoGiro;
        }

        this.velocidade *= this.friccao;
        this.x += Math.cos(this.angulo) * this.velocidade;
        this.y += Math.sin(this.angulo) * this.velocidade;

        // Colisão simples com bordas
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
            this.velocidade *= -0.5; // Rebate levemente
        }

        // Condição de vitória (Chegar no lado direito)
        if (this.x > canvas.width - 40) {
            vitoria(this);
        }
    }

    desenhar() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angulo);
        
        // Sombra
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.fillRect(-this.largura/2 + 2, -this.altura/2 + 2, this.largura, this.altura);

        // Corpo
        ctx.fillStyle = this.cor;
        ctx.fillRect(-this.largura/2, -this.altura/2, this.largura, this.altura);
        
        // Detalhe frontal (vidro)
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fillRect(5, -this.altura/2 + 2, 5, this.altura - 4);
        
        ctx.restore();
    }
}

const p1 = new Carro(50, 150, "#ff4757", { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight" }, "Player 1");
const p2 = new Carro(50, 350, "#1e90ff", { up: "w", down: "s", left: "a", right: "d" }, "Player 2");

function vitoria(vencedor) {
    if (vencedor.nome === "Player 1") score1++;
    else score2++;

    document.getElementById("scoreP1").innerText = `Player 1: ${score1}`;
    document.getElementById("scoreP2").innerText = `Player 2: ${score2}`;
    
    p1.reset();
    p2.reset();
}

function desenharCenario() {
    // Grama/Pista
    ctx.fillStyle = "#2c3e50";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Linha de Chegada
    ctx.fillStyle = "#f1c40f";
    for(let i=0; i<canvas.height; i+=20) {
        if(i % 40 === 0) ctx.fillRect(canvas.width - 20, i, 20, 20);
    }
}

function loop() {
    desenharCenario();

    p1.atualizar();
    p1.desenhar();

    p2.atualizar();
    p2.desenhar();

    requestAnimationFrame(loop);
}

loop();