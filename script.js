const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Configurações dos Carros
class Carro {
    constructor(x, y, cor, controles) {
        this.x = x;
        this.y = y;
        this.largura = 40;
        this.altura = 20;
        this.cor = cor;
        this.velocidade = 0;
        this.aceleracao = 0.2;
        this.friccao = 0.05;
        this.maxVel = 5;
        this.controles = controles; // { up, down }
    }

    desenhar() {
        ctx.fillStyle = this.cor;
        ctx.fillRect(this.x, this.y, this.largura, this.altura);
    }

    atualizar(teclas) {
        // Movimentação
        if (teclas[this.controles.up]) {
            this.velocidade += this.aceleracao;
        } else if (teclas[this.controles.down]) {
            this.velocidade -= this.aceleracao;
        }

        // Limite de velocidade e inércia
        if (this.velocidade > this.maxVel) this.velocidade = this.maxVel;
        if (this.velocidade < 0) this.velocidade = 0;
        this.velocidade *= (1 - this.friccao);

        this.x += this.velocidade;

        // Verificar Vitoria
        if (this.x > canvas.width - this.largura) {
            alert("O carro " + this.cor + " venceu!");
            this.resetar();
        }
    }

    resetar() {
        this.x = 20;
        this.velocidade = 0;
    }
}

// Instâncias
const p1 = new Carro(20, 100, "red", { up: "ArrowRight", down: "ArrowLeft" });
const p2 = new Carro(20, 250, "cyan", { up: "d", down: "a" });

const teclas = {};

window.addEventListener("keydown", (e) => teclas[e.key] = true);
window.addEventListener("keyup", (e) => teclas[e.key] = false);

// Loop principal
function gameLoop() {
    // Limpar tela
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenhar Linha de Chegada
    ctx.strokeStyle = "white";
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(750, 0);
    ctx.lineTo(750, 400);
    ctx.stroke();

    // Atualizar e Desenhar Carros
    p1.atualizar(teclas);
    p1.desenhar();
    
    p2.atualizar(teclas);
    p2.desenhar();

    requestAnimationFrame(gameLoop);
}

gameLoop();