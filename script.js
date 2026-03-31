window.onload = function() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 1000;
    canvas.height = 500;

    let faseAtual = 0;
    let gameOver = false;
    const teclas = {};

    window.addEventListener("keydown", e => teclas[e.key.toLowerCase()] = true);
    window.addEventListener("keyup", e => teclas[e.key.toLowerCase()] = false);

    // Definição das 5 Fases (Caminhos Corrigidos)
    const mapas = [
        { nome: "FASE 1: Aquecimento", obs: [] },
        { nome: "FASE 2: Estreito", obs: [{x: 450, y: 0, w: 100, h: 200}, {x: 450, y: 300, w: 100, h: 200}] },
        { nome: "FASE 3: Zig-Zag", obs: [{x: 300, y: 0, w: 50, h: 350}, {x: 600, y: 150, w: 50, h: 350}] },
        { nome: "FASE 4: O Labirinto", obs: [{x: 200, y: 200, w: 600, h: 40}, {x: 400, y: 0, w: 40, h: 200}, {x: 600, y: 240, w: 40, h: 300}] },
        { nome: "FASE 5: CAOS TOTAL", obs: [{x: 200, y: 100, w: 100, h: 100}, {x: 500, y: 300, w: 100, h: 100}, {x: 800, y: 50, w: 50, h: 400}]}
    ];

    class Carro {
        constructor(x, y, cor, controles, id) {
            this.startX = x; this.startY = y;
            this.cor = cor; this.controles = controles; this.id = id;
            this.score = 0;
            this.reset();
        }

        reset() {
            this.x = this.startX; this.y = this.startY;
            this.angulo = 0; this.vel = 0; this.hp = 100;
            this.maxVel = 6 + (faseAtual * 1.5);
        }

        atualizar() {
            if (gameOver || this.hp <= 0) return;

            // Controles
            if (teclas[this.controles.up]) this.vel += 0.3;
            if (teclas[this.controles.down]) this.vel -= 0.2;
            this.vel *= 0.96;

            if (this.vel > this.maxVel) this.vel = this.maxVel;

            if (Math.abs(this.vel) > 0.5) {
                const dir = this.vel > 0 ? 1 : -1;
                if (teclas[this.controles.left]) this.angulo -= 0.07 * dir;
                if (teclas[this.controles.right]) this.angulo += 0.07 * dir;
            }

            let nx = this.x + Math.cos(this.angulo) * this.vel;
            let ny = this.y + Math.sin(this.angulo) * this.vel;

            // Colisão com Obstáculos
            let colidiu = false;
            mapas[faseAtual].obs.forEach(o => {
                if (nx > o.x && nx < o.x + o.w && ny > o.y && ny < o.y + o.h) colidiu = true;
            });

            // Colisão Bordas
            if (nx < 0 || nx > canvas.width || ny < 0 || ny > canvas.height) colidiu = true;

            if (colidiu) {
                this.hp -= 5;
                this.vel = -this.vel * 0.6;
                document.getElementById("hp" + this.id).innerText = this.hp;
            } else {
                this.x = nx;
                this.y = ny;
            }

            // Chegar ao fim (Lado direito)
            if (this.x > canvas.width - 20) {
                this.score += 100;
                document.getElementById("score" + this.id).innerText = this.score;
                proximaFase();
            }
        }

        desenhar() {
            if (this.hp <= 0) return;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angulo);
            ctx.fillStyle = this.cor;
            ctx.fillRect(-20, -10, 40, 20);
            ctx.fillStyle = "white";
            ctx.fillRect(15, -8, 5, 4); ctx.fillRect(15, 4, 5, 4);
            ctx.restore();
        }
    }

    const p1 = new Carro(50, 150, "#ff4757", {up: "arrowup", down: "arrowdown", left: "arrowleft", right: "arrowright"}, 1);
    const p2 = new Carro(50, 350, "#1e90ff", {up: "w", down: "s", left: "a", right: "d"}, 2);

    function proximaFase() {
        faseAtual++;
        if (faseAtual >= mapas.length) {
            document.getElementById("nomeFase").innerText = "VITÓRIA!";
            document.getElementById("msg").innerText = "Vocês zeraram o jogo!";
            gameOver = true;
        } else {
            p1.reset(); p2.reset();
            document.getElementById("nomeFase").innerText = mapas[faseAtual].nome;
            document.getElementById("hp1").innerText = 100;
            document.getElementById("hp2").innerText = 100;
        }
    }

    function loop() {
        ctx.fillStyle = "#222";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Desenhar Obstáculos
        ctx.fillStyle = "#555";
        mapas[faseAtual].obs.forEach(o => {
            ctx.fillRect(o.x, o.y, o.w, o.h);
            ctx.strokeStyle = "orange";
            ctx.strokeRect(o.x, o.y, o.w, o.h);
        });

        // Linha de Chegada
        ctx.fillStyle = "gold";
        ctx.fillRect(canvas.width - 15, 0, 15, canvas.height);

        p1.atualizar(); p1.desenhar();
        p2.atualizar(); p2.desenhar();

        if (p1.hp <= 0 && p2.hp <= 0) {
            gameOver = true;
            document.getElementById("msg").innerText = "GAME OVER!";
        }

        requestAnimationFrame(loop);
    }

    loop();
};