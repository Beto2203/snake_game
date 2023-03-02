"use strict";
const snakeGame = (function () {
    let size = 20;
    let speed = 300;
    const container = document.getElementById('gameContainer') || document.createElement('section');
    let updateGameLoop;
    let alreadyMoved = false;
    let appleCounterValue = 0;
    const appleCounter = document.getElementById('appleCounter');
    class SnakeObject {
        constructor() {
            this.length = 0;
            this.body = [];
            this.bodyNum = {};
            this._direction = 'up';
        }
        set direction(value) {
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
        appleCounter.innerText = appleCounterValue.toString();
        const game = document.createElement('section');
        game.id = 'game';
        game.classList.add('nes-container', 'is-rounded', 'is-dark');
        container.appendChild(game);
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(`
            #game {
                grid-template-columns: repeat(auto-fill, ${(game.offsetWidth - 18) / size}px);
                grid-template-rows: repeat(auto-fill, ${(game.offsetHeight - 18) / size}px);
            }`);
        document.adoptedStyleSheets = [sheet];
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
        snake = new SnakeObject();
        const mid = (size * Math.floor(size / 2)) + Math.floor((size - 1) / 2);
        snake.push(findTile(mid + size * 2));
        snake.push(findTile(mid + size));
        snake.push(findTile(mid));
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
        const newApple = () => {
            while (true) {
                const rand = Math.floor(Math.random() * size * size);
                if (!snake.bodyNum[rand]) {
                    const newAppleTile = findTile(rand);
                    newAppleTile.classList.add('apple');
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
                        || newHeadElem.classList.contains('rightLimit'))
                        &&
                            (headElem.classList.contains('leftLimit')
                                || headElem.classList.contains('rightLimit')))) {
                return false;
            }
            snake.push(newHeadElem);
            if (newHeadElem.classList.contains('apple')) {
                eat();
            }
            else {
                snake.removeTail();
            }
            return true;
        };
        const eat = () => {
            apple.classList.remove('apple');
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
            console.log('END');
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
                alert('Please insert a number within the indicated constraints');
                return;
            }
            size = newSize;
            this.newGame();
        },
        setSpeed(newSpeed) {
            if (newSpeed > 1000 || newSpeed < 50) {
                alert('Please insert a speed within the indicated constraints');
                return;
            }
            speed = newSpeed;
        }
    };
})();
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
    snakeGame.setSpeed(300);
});
normal.addEventListener('click', () => {
    easy.classList.remove('is-primary');
    hard.classList.remove('is-primary');
    normal.classList.add('is-primary');
    snakeGame.setSpeed(200);
});
hard.addEventListener('click', () => {
    easy.classList.remove('is-primary');
    normal.classList.remove('is-primary');
    hard.classList.add('is-primary');
    snakeGame.setSpeed(150);
});
