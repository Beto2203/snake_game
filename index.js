"use strict";
const snakeGame = (function () {
    let size = 20;
    let speed = 150;
    const container = document.getElementById('gameContainer') || document.createElement('section');
    let updateGameLoop;
    let alreadyMoved = false;
    let appleCounterValue = 0;
    const appleCounter = document.getElementById('appleCounter');
    const menu = document.getElementById('menu');
    const select = document.getElementById('select');
    let record = localStorage.getItem('record');
    class SnakeObject {
        constructor(initialPos) {
            this.length = 0;
            this.body = [];
            this.bodyNum = {};
            this._direction = 'up';
            this.push(findTile(initialPos + size * 2));
            this.push(findTile(initialPos + size));
            this.push(findTile(initialPos));
            this.head.classList.add('head');
        }
        set direction(value) {
            if (this._direction === value)
                return;
            this._direction = value;
            alreadyMoved = true;
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
            elem.classList.add('snake');
            this.length++;
        }
        removeTail() {
            const tail = this.body.shift();
            const tailNum = tail.dataset.tileNumber;
            delete this.bodyNum[tailNum];
            tail.classList.remove('snake');
            this.length--;
            return tail;
        }
    }
    let snake;
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
        const mid = (size * Math.floor(size / 2)) + Math.floor((size - 1) / 2);
        snake = new SnakeObject(mid);
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
        const move = () => {
            const headElem = snake.head;
            const head = +headElem.dataset.tileNumber;
            let newHead;
            switch (snake.direction) {
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
            if (newHead < 0 || newHead >= size * size
                || !newHeadElem || newHeadElem.classList.contains('snake')
                ||
                    ((newHeadElem.classList.contains('leftLimit')
                        && headElem.classList.contains('rightLimit'))
                        ||
                            (headElem.classList.contains('leftLimit')
                                && newHeadElem.classList.contains('rightLimit')))) {
                return false;
            }
            headElem.classList.remove('head');
            newHeadElem.classList.add('head');
            snake.push(newHeadElem);
            if (newHeadElem.classList.contains('appleContainer')) {
                eat();
            }
            else {
                snake.removeTail();
            }
            return true;
        };
        const eat = () => {
            apple.classList.remove('appleContainer');
            apple.removeChild(apple.firstChild);
            apple = newApple();
            appleCounterValue++;
            appleCounter.innerText = appleCounterValue.toString();
        };
        updateGameLoop = setInterval(() => {
            if (!move())
                gameOver();
            alreadyMoved = false;
        }, speed);
        const gameOver = () => {
            clearInterval(updateGameLoop);
            let newRecord = false;
            if (!record || +record < appleCounterValue) {
                localStorage.setItem('record', appleCounterValue.toString());
                record = appleCounterValue.toString();
                newRecord = true;
            }
            appleCounter.innerText = 'record:' + ((record) ? `${record}` : '0');
            menu.classList.remove('hide');
            select.innerHTML = `${(newRecord) ? '<p style="color: gold">New Record!!</p>' : '<p style="color: orangered">You Lost</p>'} <p>Your points: ${appleCounterValue}</p> Try again?`;
        };
    }
    window.addEventListener('keydown', (ev) => {
        if (alreadyMoved)
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
// TODO: Add a new mode for two players to compete for the apples, try with only one apple at the same time, then 2 apples and even 3.
// TODO: Make the website responsive
