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

    // MAPAS REVISADOS - Fase 4 agora tem caminhos bem largos (150px de abertura)
    const mapas = [
        { nome: "FASE 1: Aquecimento", obs: [] },
        { nome: "FASE 2: Estreito", obs: [{x: 450, y: 0, w: 100, h: 200}, {x: 450, y: 300, w: 100, h: 200}] },
        { nome: "FASE 3: Zig-Zag", obs: [{x: 300, y: 0, w: 60, h: 320}, {x: 600, y: 180, w: 60, h: 320}] },
        { nome: "FASE 4: O Corredor S", obs: [
            {x: 250, y: 0, w: 40, h: 350},   // Deixa 150px embaixo
            {x: 550, y: 150, w: 40, h: 350}, // Deixa 150px em cima
            {x: 800, y: 0, w: 40, h: 350}    // Deixa 150px embaixo
        ]},
        { nome: "FASE 5: LABIRINTO FINAL", obs: [
            {x: 200, y: 100, w: 100, h: 100}, 
            {x: 500, y: 250, w: 150, h: 40}, 
            {x: 750, y: 0, w: 40, h: 250},
            {x: 750, y: 350, w: 40, h: 150}
        ]}
    ];

    class Carro {
        constructor(x, y, cor, controles, id) {
            this.startX = x; this.startY = y;
            this.cor = cor; this.controles = controles; this.id = id;
            this.score = 0;
            this.largura = 36;
            this.altura = 18;
            this.reset();
        }

        reset() {
            this.x = this.startX; this.y = this.startY;
            this.angulo = 0; this.vel = 0; this.hp = 100;
            this.maxVel = 6 + (faseAtual * 1.2);
            atualizarHUD();
        }

        atualizar() {
            if (gameOver || this.hp <= 0) return;

            // Movimento básico
            if (teclas[this.controles.up]) this.vel += 0.25;
            if (teclas[this.controles.down]) this.vel -= 0.15;
            this.vel *= 0.96;

            if (this.vel > this.maxVel) this.vel = this.maxVel;

            if (Math.abs(this.vel) > 0.4) {
                const dir = this.vel > 0 ? 1 : -1;
                if (teclas[this.controles.left]) this.angulo -= 0.06 * dir;
                if (teclas[this.controles.right]) this.angulo += 0.06 * dir;
            }

            let nx = this.x + Math.cos(this.angulo) * this.vel;
            let ny = this.y + Math.sin(this.angulo) * this.vel;

            let colidiu = false;

            // Verificação de colisão com os retângulos
            mapas[faseAtual].obs.forEach(o => {
                if (nx + 10 > o.x && nx - 10 < o.x + o.w && ny + 10 > o.y && ny - 10 < o.y + o.h) {
                    colidiu = true;
                }
            });

            // Bordas da tela
            if (nx < 15 || nx > canvas.width - 15 || ny < 15 || ny > canvas.height - 15) colidiu = true;

            if (colidiu) {
                this.hp -= 4;
                this.vel = -this.vel * 0.5; // Rebate
                atualizarHUD();
            } else {
                this.x = nx;
                this.y = ny;
            }

            // Vitória da fase (Chegou na linha amarela)
            if (this.x > canvas.width - 25) {
                vencerFase(this);
            }
        }

        desenhar() {
            if (this.hp <= 0) return;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angulo);
            
            // Sombra
            ctx.fillStyle = "rgba(0,0,0,0.3)";
            ctx.fillRect(-this.largura/2 + 2, -this.altura/2 + 2, this.largura, this.altura);

            // Corpo
            ctx.fillStyle = this.cor;
            ctx.fillRect(-this.largura/2, -this.altura/2, this.largura, this.altura);
            
            // Vidro/Frente
            ctx.fillStyle = "rgba(255,255,255,0.4)";
            ctx.fillRect(4, -this.altura/2 + 2, 8, this.altura - 4);
            
            ctx.restore();
        }
    }

    const p1 = new Carro(60, 150, "#ff4757", {up: "arrowup", down: "arrowdown", left: "arrowleft", right: "arrowright"}, 1);
    const p2 = new Carro(60, 350, "#1e90ff", {up: "w", down: "s", left: "a", right: "d"}, 2);

    function vencerFase(quem) {
        quem.score += 50;
        faseAtual++;
        if (faseAtual >= mapas.length) {
            gameOver = true;
            document.getElementById("nomeFase").innerText = "CAMPEÕES!";
            document.getElementById("msg").innerText = "PARABÉNS! VOCÊS TERMINARAM TODAS AS FASES!";
        } else {
            p1.reset();
            p2.reset();
            document.getElementById("nomeFase").innerText = mapas[faseAtual].nome;
        }
        atualizarHUD();
    }

    function atualizarHUD() {
        document.getElementById("hp1").innerText = Math.max(0, p1.hp);
        document.getElementById("hp2").innerText = Math.max(0, p2.hp);
        document.getElementById("score1").innerText = p1.score;
        document.getElementById("score2").innerText = p2.score;

        if (p1.hp <= 0 && p2.hp <= 0) {
            gameOver = true;
            document.getElementById("msg").innerText = "GAME OVER - Ambos os carros foram destruídos!";
        }
    }

    function loop() {
        // Limpa fundo
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Desenha Linha de Chegada
        ctx.fillStyle = "#f1c40f";
        ctx.fillRect(canvas.width - 15, 0, 15, canvas.height);

        // Desenha Obstáculos
        ctx.fillStyle = "#444";
        ctx.strokeStyle = "#ff4500";
        ctx.lineWidth = 2;
        mapas[faseAtual].obs.forEach(o => {
            ctx.fillRect(o.x, o.y, o.w, o.h);
            ctx.strokeRect(o.x, o.y, o.w, o.h);
        });

        // Atualiza e Desenha Carros
        p1.atualizar();
        p1.desenhar();
        p2.atualizar();
        p2.desenhar();

        if (!gameOver) {
            requestAnimationFrame(loop);
        }
    }

    loop();
};