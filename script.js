const canvas = document.getElementById("gameCanvas");const canvas = document.getElementById("gameCanvas");const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Estado do Jogo
let fase = 0;
const teclas = {};
const mapas = [
    { nome: "Fase 1: Aquecimento", obs: [] },
    { nome: "Fase 2: O Funil", obs: [{x: 350, y: 0, w: 100, h: 200}, {x: 350, y: 300, w: 100, h: 200}] },
    { nome: "Fase 3: Labirinto", obs: [{x: 200, y: 0, w: 50, h: 350}, {x: 500, y: 150, w: 50, h: 350}] }
];

window.addEventListener("keydown", e => teclas[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => teclas[e.key.toLowerCase()] = false);

class Carro {
    constructor(x, y, cor, ctrl, id) {
        this.origemX = x; this.origemY = y;
        this.cor = cor; this.ctrl = ctrl; this.id = id;
        this.reset();
    }

    reset() {
        this.x = this.origemX; this.y = this.origemY;
        this.hp = 100; this.angulo = 0; this.vel = 0;
    }

    atualizar() {
        // Controles
        if (teclas[this.ctrl.u]) this.vel += 0.3;
        if (teclas[this.ctrl.d]) this.vel -= 0.2;
        this.vel *= 0.96; // Fricção

        if (Math.abs(this.vel) > 0.5) {
            const direcao = this.vel > 0 ? 1 : -1;
            if (teclas[this.ctrl.l]) this.angulo -= 0.06 * direcao;
            if (teclas[this.ctrl.r]) this.angulo += 0.06 * direcao;
        }

        let nx = this.x + Math.cos(this.angulo) * this.vel;
        let ny = this.y + Math.sin(this.angulo) * this.vel;

        // Colisão simples
        let colidiu = false;
        mapas[fase].obs.forEach(o => {
            if (nx > o.x && nx < o.x + o.w && ny > o.y && ny < o.y + o.h) colidiu = true;
        });

        if (nx < 0 || nx > canvas.width || ny < 0 || ny > canvas.height) colidiu = true;

        if (colidiu) {
            this.vel = -this.vel * 0.5;
            this.hp -= 2;
        } else {
            this.x = nx; this.y = ny;
        }

        // Vitória
        if (this.x > canvas.width - 20) {
            fase = (fase + 1) % mapas.length;
            p1.reset(); p2.reset();
            document.getElementById("faseTxt").innerText = mapas[fase].nome;
        }
    }

    desenhar() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angulo);
        ctx.fillStyle = this.cor;
        ctx.fillRect(-20, -10, 40, 20);
        ctx.fillStyle = "white"; ctx.fillRect(15, -8