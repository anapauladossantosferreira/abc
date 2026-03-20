const player = document.getElementById("player");
const obstacle = document.getElementById("obstacle");

// Pulo do jogador
function jump() {
    if (player.classList != "animate") {
        player.classList.add("animate");
        setTimeout(function() {
            player.classList.remove("animate");
        }, 500);
    }
}

document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        jump();
    }
});

// Detecção de colisão
let checkDead = setInterval(function() {
    let playerTop = parseInt(window.getComputedStyle(player).getPropertyValue("top"));
    let obstacleLeft = parseInt(window.getComputedStyle(obstacle).getPropertyValue("left"));
    
    if (obstacleLeft < 50 && obstacleLeft > 0 && playerTop >= 140) {
        obstacle.style.animation = "none";
        alert("Game Over!");
        obstacle.style.animation = "moveObstacle 1.5s infinite linear";
    }
}, 10);
