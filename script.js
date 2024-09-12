const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const editorToggle = document.getElementById('editor-toggle');
const editor = document.getElementById('editor');
const editorText = document.getElementById('editor-text');
const updateLab = document.getElementById('update-lab');
const createWallButton = document.getElementById('create-wall');
const removeWallButton = document.getElementById('remove-wall');
const gameOverDiv = document.getElementById('game-over');
const restartGameButton = document.getElementById('restart-game');

const TILE_SIZE = 20;
const WALL_COLOR = '#888';
const PATH_COLOR = '#222';
const PLAYER_COLOR = '#0F0';
const CHASER_COLOR = '#F00';
const CHASER_RANGE = 5;
const WIDTH = 20;
const HEIGHT = 14;

let maze = `
####################
#...........#......#
#.#.#####.#.#.####.#
#.#.#...#.#...#....#
#.#.#.#.#.#.###.###.#
#.#.#.#.#.#.#.....#.#
#.#.#.#.#.#.#.###.#.#
#.#.#.#.#...#...#.#.#
#.#.#.#.#.###.###.#.#
#.#.#...#.......#...#
#.#.##############.##
#....................#
##################.#
####################
`;

const player = { x: 1, y: 1 };
const chaser = { x: 18, y: 13 };
let currentMode = 'create'; // 'create' or 'remove'
let gameOver = false;

function drawMaze() {
    const rows = maze.trim().split('\n');
    canvas.width = WIDTH * TILE_SIZE;
    canvas.height = HEIGHT * TILE_SIZE;
    
    for (let y = 0; y < rows.length; y++) {
        for (let x = 0; x < rows[y].length; x++) {
            const tile = rows[y][x];
            ctx.fillStyle = tile === '#' ? WALL_COLOR : PATH_COLOR;
            ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }

    // Draw player
    ctx.fillStyle = PLAYER_COLOR;
    ctx.fillRect(player.x * TILE_SIZE, player.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

    // Draw chaser
    ctx.fillStyle = CHASER_COLOR;
    ctx.fillRect(chaser.x * TILE_SIZE, chaser.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
}

function toggleEditor() {
    if (editor.style.display === 'none') {
        editor.style.display = 'block';
        editorText.value = maze;
    } else {
        editor.style.display = 'none';
    }
}

function updateMaze() {
    maze = editorText.value;
    drawMaze();
    toggleEditor();
}

function setMode(mode) {
    currentMode = mode;
    if (mode === 'create') {
        canvas.classList.add('create-wall-cursor');
        canvas.classList.remove('remove-wall-cursor');
    } else {
        canvas.classList.add('remove-wall-cursor');
        canvas.classList.remove('create-wall-cursor');
    }
}

function handleCanvasClick(event) {
    if (gameOver) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / TILE_SIZE);
    const y = Math.floor((event.clientY - rect.top) / TILE_SIZE);
    
    const rows = maze.trim().split('\n');
    let row = rows[y].split('');
    
    if (currentMode === 'create') {
        row[x] = '#';
    } else if (currentMode === 'remove') {
        row[x] = '.';
    }
    
    rows[y] = row.join('');
    maze = rows.join('\n');
    
    drawMaze();
}

function movePlayer(dx, dy) {
    if (gameOver) return;

    const newX = player.x + dx;
    const newY = player.y + dy;

    const rows = maze.trim().split('\n');
    if (rows[newY] && rows[newY][newX] !== '#') {
        player.x = newX;
        player.y = newY;
    }

    checkCollision();
    drawMaze();
}

function moveChaser() {
    if (gameOver) return;

    // Calcula la distancia entre el perseguidor y el jugador
    const distanceX = Math.abs(player.x - chaser.x);
    const distanceY = Math.abs(player.y - chaser.y);

    // Verifica si el jugador está dentro del rango de distancia
    if (distanceX <= CHASER_RANGE && distanceY <= CHASER_RANGE) {
        // Calcula la dirección en la que el perseguidor debe moverse
        const dx = Math.sign(player.x - chaser.x);
        const dy = Math.sign(player.y - chaser.y);

        // Calcula la nueva posición del perseguidor
        const newX = chaser.x + dx;
        const newY = chaser.y + dy;

        // Obtiene el laberinto en formato de filas
        const rows = maze.trim().split('\n');

        // Verifica que la nueva posición esté dentro de los límites del laberinto y no sea una pared
        if (rows[newY] && rows[newY][newX] !== '#' && newX >= 0 && newY >= 0 && newX < rows[0].length && newY < rows.length) {
            chaser.x = newX;
            chaser.y = newY;
        }

        // Verifica si el jugador y el perseguidor se han colisionado
        checkCollision();
    }

    drawMaze();
}


function checkCollision() {
    if (player.x === chaser.x && player.y === chaser.y) {
        explode();
    }
}

function explode() {
    gameOver = true;
    gameOverDiv.style.display = 'block';

    const rows = maze.trim().split('\n');
    const startX = Math.max(0, chaser.x - 1);
    const endX = Math.min(WIDTH - 1, chaser.x + 1);
    const startY = Math.max(0, chaser.y - 1);
    const endY = Math.min(HEIGHT - 1, chaser.y + 1);

    for (let y = startY; y <= endY; y++) {
        let row = rows[y].split('');
        for (let x = startX; x <= endX; x++) {
            if (Math.abs(x - chaser.x) + Math.abs(y - chaser.y) <= 2) {
                row[x] = '.';
            }
        }
        rows[y] = row.join('');
    }

    maze = rows.join('\n');
    drawMaze();
}

function restartGame() {
    player.x = 1;
    player.y = 1;
    chaser.x = 18;
    chaser.y = 13;
    maze = `
####################
#...........#......#
#.#.#####.#.#.####.#
#.#.#...#.#...#....#
#.#.#.#.#.#.###.###.#
#.#.#.#.#.#.#.....#.#
#.#.#.#.#.#.#.###.#.#
#.#.#.#.#...#...#.#.#
#.#.#.#.#.###.###.#.#
#.#.#...#.......#...#
#.#.##############.##
#....................#
##################.#
####################
`;
    gameOver = false;
    gameOverDiv.style.display = 'none';
    drawMaze();
}

// Event listeners
editorToggle.addEventListener('click', toggleEditor);
updateLab.addEventListener('click', updateMaze);
createWallButton.addEventListener('click', () => setMode('create'));
removeWallButton.addEventListener('click', () => setMode('remove'));
canvas.addEventListener('click', handleCanvasClick);
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            movePlayer(0, -1);
            break;
        case 'ArrowDown':
            movePlayer(0, 1);
            break;
        case 'ArrowLeft':
            movePlayer(-1, 0);
            break;
        case 'ArrowRight':
            movePlayer(1, 0);
            break;
    }
});

restartGameButton.addEventListener('click', restartGame);

// Inicializa el canvas con el laberinto
drawMaze();

// Mueve al perseguidor cada segundo
setInterval(moveChaser, 500);
