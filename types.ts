type SetNum = (number: number) => void;

interface SnakeGame {
    newGame: VoidFunction,
    setSize: SetNum,
    setSpeed: SetNum,
}



interface HTMLDivElementWithTileNumber extends HTMLDivElement {
    dataset: {
        tileNumber: string,
    }
}