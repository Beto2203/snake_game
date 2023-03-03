"use strict";
const snakeGame = (function () {
    let size = 21;
    let speed = 150;
    const container = document.getElementById('gameContainer') || document.createElement('section');
    let updateGameLoop;
    let appleCounterValue = 0;
    const appleCounter = document.getElementById('appleCounter');
    const menu = document.getElementById('menu');
    const select = document.getElementById('select');
    let record = localStorage.getItem('record');
    let twoPlayers = false;
    class SnakeObject {
        constructor(initialPos, playerClass) {
            this.length = 0;
            this.body = [];
            this.bodyNum = {};
            this.gameState = 'start';
            this._direction = 'up';
            this.alreadyMoved = false;
            this.playerClass = playerClass;
            this.push(findTile(initialPos + size * 2));
            this.push(findTile(initialPos + size));
            this.push(findTile(initialPos));
            this.head.classList.add('head');
        }
        set direction(value) {
            if (this._direction === value)
                return;
            this._direction = value;
            this.alreadyMoved = true;
        }
        get direction() {
            return this._direction;
        }
        get head() {
            return this.body[this.length - 1];
        }
        push(elem) {
            if (!elem || !elem.dataset.tileNumber)
                return;
            this.body.push(elem);
            const tileNum = elem.dataset.tileNumber;
            this.bodyNum[tileNum] = this.direction;
            elem.classList.add(this.playerClass);
            elem.classList.add('player');
            this.length++;
            if (this.length > 2)
                this.body[0].classList.add('tail');
        }
        reassignTail() {
            this.body[0].classList.remove('tail');
        }
        removeTail() {
            const tail = this.body.shift();
            const tailNum = tail.dataset.tileNumber;
            delete this.bodyNum[tailNum];
            tail.classList.remove(this.playerClass);
            tail.classList.remove('player');
            tail.classList.remove('tail');
            this.length--;
            this.body[0].classList.add('tail');
            return tail;
        }
        move() {
            const headElem = this.head;
            const head = +headElem.dataset.tileNumber;
            let newHead;
            switch (this.direction) {
                case 'up':
                    newHead = head - size;
                    break;
                case 'down':
                    newHead = head + size;
                    break;
                case "left":
                    newHead = head - 1;
                    break;
                case "right":
                    newHead = head + 1;
                    break;
            }
            const newHeadElem = findTile(newHead);
            if (newHeadElem && newHeadElem.classList.contains('head')) {
                return 'headCollision';
            }
            if ((newHead < 0 || newHead >= size * size
                || !newHeadElem
                || (!newHeadElem.classList.contains('tail') && (newHeadElem.classList.contains('player') || newHeadElem.classList.contains(this.playerClass)))
                ||
                    ((newHeadElem.classList.contains('leftLimit')
                        && headElem.classList.contains('rightLimit'))
                        ||
                            (headElem.classList.contains('leftLimit')
                                && newHeadElem.classList.contains('rightLimit'))))) {
                return 'end';
            }
            headElem.classList.remove('head');
            newHeadElem.classList.add('head');
            this.push(newHeadElem);
            if (newHeadElem.classList.contains('appleContainer')) {
                this.reassignTail();
                return 'eat';
            }
            this.removeTail();
            return 'move';
        }
        ;
    }
    let snake;
    let snake2;
    let players = [];
    function findTile(tileNum) {
        return document.querySelector(`[data-tile-number="${tileNum}"]`);
    }
    const createNewGame = () => {
        appleCounterValue = 0;
        appleCounter.innerText = 'record:' + ((record) ? `${record}` : '0');
        menu.classList.add('hide');
        const game = document.createElement('section');
        game.id = 'game';
        game.classList.add('nes-container', 'is-rounded', 'is-dark');
        container.appendChild(game);
        const tile = document.createElement('div');
        for (let i = 0; i < size * size; i++) {
            const tileClone = tile.cloneNode();
            if ((i + 1) % size === 0)
                tileClone.classList.add('rightLimit');
            else if (i % size === 0)
                tileClone.classList.add('leftLimit');
            tileClone.dataset.tileNumber = i.toString();
            game.appendChild(tileClone);
        }
        game.style.gridTemplateColumns = `repeat(auto-fill, ${(game.offsetWidth - 18) / size}px)`;
        game.style.gridTemplateRows = `repeat(auto-fill, ${(game.offsetHeight - 18) / size}px)`;
        let startPos = (size * Math.floor(size / 2));
        if (twoPlayers) {
            snake = new SnakeObject(startPos + size - 2, 'snake');
            snake2 = new SnakeObject(startPos + 2, 'snake2');
            players.push(snake2);
        }
        else {
            snake = new SnakeObject(startPos + Math.floor((size - 1) / 2), 'snake');
        }
        players.push(snake);
        createPlayerTwoControls();
    };
    const deleteGame = () => {
        if (updateGameLoop)
            clearInterval(updateGameLoop);
        if (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    };
    function gameLoop() {
        let apple;
        let appleElement = document.createElement('div');
        appleElement.classList.add('apple');
        const newApple = () => {
            while (true) {
                const rand = Math.floor(Math.random() * size * size);
                if (!snake.bodyNum[rand]) {
                    const newAppleTile = findTile(rand);
                    newAppleTile.classList.add('appleContainer');
                    newAppleTile.appendChild(appleElement);
                    return newAppleTile;
                }
            }
        };
        apple = newApple();
        const eat = () => {
            apple.classList.remove('appleContainer');
            apple.removeChild(apple.firstChild);
            apple = newApple();
            appleCounterValue++;
            appleCounter.innerText = appleCounterValue.toString();
        };
        updateGameLoop = setInterval(() => {
            let states = [];
            for (const player of players) {
                const state = player.move();
                states.push(state);
                player.alreadyMoved = false;
                if (state === 'headCollision')
                    break;
            }
            if (twoPlayers) {
                if (states[0] === 'headCollision' || states[1] === 'headCollision') {
                    gameOver(players[0].length > players[1].length
                        ? players[0].playerClass
                        : players[0].length === players[1].length
                            ? 'tie'
                            : players[1].playerClass);
                }
                switch (states[0] + ' ' + states[1]) {
                    case 'end end':
                        gameOver('tie');
                        break;
                    case 'end eat':
                        eat();
                        gameOver(players[1].playerClass);
                        break;
                    case 'end move':
                        gameOver(players[1].playerClass);
                        break;
                    case 'eat end':
                        eat();
                        gameOver(players[0].playerClass);
                        break;
                    case 'move end':
                        gameOver(players[0].playerClass);
                        break;
                    case 'move move':
                        break;
                    case 'move eat':
                        eat();
                        break;
                    case 'eat move':
                        eat();
                        break;
                }
            }
            else {
                switch (states[0]) {
                    case "eat":
                        eat();
                        break;
                    case "end":
                        gameOver(players[0].playerClass);
                        break;
                }
            }
        }, speed);
        window.addEventListener('keydown', (ev) => {
            if (ev.key === ' ') {
                clearInterval(updateGameLoop);
            }
        });
        const gameOver = (result) => {
            clearInterval(updateGameLoop);
            let newRecord = false;
            if (twoPlayers) {
                removePlayerTwoControls();
                if (result === 'tie') {
                    select.innerHTML = `TIE!!`;
                }
                else {
                    select.innerHTML = `Player ${result === 'snake' ? 'One' : 'Two'} Wins!!`;
                }
            }
            else {
                if (!record || +record < appleCounterValue) {
                    localStorage.setItem('record', appleCounterValue.toString());
                    record = appleCounterValue.toString();
                    newRecord = true;
                }
                select.innerHTML = `${(newRecord) ? '<p style="color: gold">New Record!!</p>' : '<p style="color: orangered">You Lost</p>'}`;
            }
            select.innerHTML += `Try again?`;
            appleCounter.innerText = 'record:' + ((record) ? `${record}` : '0');
            menu.classList.remove('hide');
            players = [];
        };
    }
    const playerTwoControlsListener = (ev) => {
        if (snake2.alreadyMoved)
            return;
        switch (ev.key) {
            case 'S':
            case 's':
                if (snake2.direction !== 'up') {
                    snake2.direction = 'down';
                }
                break;
            case 'W':
            case 'w':
                if (snake2.direction !== 'down') {
                    snake2.direction = 'up';
                }
                break;
            case 'D':
            case 'd':
                if (snake2.direction !== 'left') {
                    snake2.direction = 'right';
                }
                break;
            case 'A':
            case 'a':
                if (snake2.direction !== 'right') {
                    snake2.direction = 'left';
                }
        }
    };
    function createPlayerTwoControls() {
        if (twoPlayers) {
            window.addEventListener('keydown', playerTwoControlsListener);
        }
    }
    function removePlayerTwoControls() {
        window.removeEventListener('keydown', playerTwoControlsListener);
    }
    window.addEventListener('keydown', (ev) => {
        if (snake.alreadyMoved)
            return;
        switch (ev.key) {
            case 'Down':
            case 'ArrowDown':
                if (snake.direction !== 'up') {
                    snake.direction = 'down';
                }
                break;
            case 'Up':
            case 'ArrowUp':
                if (snake.direction !== 'down') {
                    snake.direction = 'up';
                }
                break;
            case 'Right':
            case 'ArrowRight':
                if (snake.direction !== 'left') {
                    snake.direction = 'right';
                }
                break;
            case 'Left':
            case 'ArrowLeft':
                if (snake.direction !== 'right') {
                    snake.direction = 'left';
                }
        }
    });
    return {
        newGame() {
            deleteGame();
            createNewGame();
            gameLoop();
        },
        setSize(newSize) {
            if (newSize > 40 || newSize < 5) {
                alert('Please insert a size within the indicated constraints');
                return;
            }
            size = newSize;
            this.newGame();
        },
        setSpeed(newSpeed) {
            if (newSpeed > 500 || newSpeed < 50) {
                alert('Please insert a speed within the indicated constraints');
                return;
            }
            speed = newSpeed;
        },
        setPlayers(versus) {
            twoPlayers = versus;
        }
    };
})();
// TODO: add an option to select the size of the grid
window.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter')
        snakeGame.newGame();
});
const startGame = document.getElementById('start');
const easy = document.getElementById('easy');
const normal = document.getElementById('normal');
const hard = document.getElementById('hard');
const single = document.getElementById('single');
const versus = document.getElementById('versus');
startGame.addEventListener('click', () => {
    snakeGame.newGame();
});
easy.addEventListener('click', () => {
    normal.classList.remove('is-primary');
    hard.classList.remove('is-primary');
    easy.classList.add('is-primary');
    snakeGame.setSpeed(200);
});
normal.addEventListener('click', () => {
    easy.classList.remove('is-primary');
    hard.classList.remove('is-primary');
    normal.classList.add('is-primary');
    snakeGame.setSpeed(150);
});
hard.addEventListener('click', () => {
    easy.classList.remove('is-primary');
    normal.classList.remove('is-primary');
    hard.classList.add('is-primary');
    snakeGame.setSpeed(120);
});
single.addEventListener('click', () => {
    snakeGame.setPlayers(false);
    single.classList.add('is-primary');
    versus.classList.remove('is-primary');
});
versus.addEventListener('click', () => {
    snakeGame.setPlayers(true);
    versus.classList.add('is-primary');
    single.classList.remove('is-primary');
});
