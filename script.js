// Aguarda o carregamento total da página para não dar erro de "canvas não encontrado"
window.onload = function() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 800;
    canvas.height = 500;

    const teclas = {};
    window.addEventListener("keydown", e => teclas[e.key.toLowerCase()] = true);
    window.addEventListener("keyup", e => teclas[e.key.toLowerCase()] = false);

    class Carro {
        constructor(x, y, cor, controles) {
            this.x = x;
            this.y = y;
            this.cor = cor;
            this.controles = controles;
            this.angulo = 0;
            this.vel = 0;
            this.hp = 100;
        }

        atualizar() {
            if (teclas[this.controles.up]) this.vel += 0.2;
            if (teclas[this.controles.down]) this.vel -= 0.2;
            
            this.vel *= 0.95; // Fricção
            
            if (Math.abs(this.vel) > 0.2) {
                const dir = this.vel > 0 ? 1 : -1;
                if (teclas[this.controles.left]) this.angulo -= 0.05 * dir;
                if (teclas[this.controles.right]) this.angulo += 0.05 * dir;
            }

            this.x += Math.cos(this.angulo) * this.vel;
            this.y += Math.sin(this.angulo) * this.vel;
        }

        desenhar() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angulo);
            ctx.fillStyle = this.cor;
            ctx.fillRect(-20, -10, 40, 20); // Desenha o corpo do carro
            ctx.fillStyle = "white"; 
            ctx.fillRect(15, -8, 5, 4); // Farol 1
            ctx.fillRect(15, 4, 5, 4);  // Farol 2
            ctx.restore();
        }
    }

    // Criando os carros em posições bem visíveis no centro/esquerda
    const p1 = new Carro(100, 150, "red", {up: "arrowup", down: "arrowdown", left: "arrowleft", right: "arrowright"});
    const p2 = new Carro(100, 350, "cyan", {up: "w", down: "s", left: "a", right: "d"});

    function loop() {
        // 1. Limpa a tela com uma cor de pista
        ctx.fillStyle = "#222"; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. Desenha bordas da pista
        ctx.strokeStyle = "white";
        ctx.lineWidth = 5;
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

        // 3. Atualiza e Desenha Jogadores
        p1.atualizar();
        p1.desenhar();

        p2.atualizar();
        p2.desenhar();

        requestAnimationFrame(loop);
    }

    console.log("Jogo iniciado com sucesso!");
    loop();
};