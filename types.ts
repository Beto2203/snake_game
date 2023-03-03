type SetNum = (number: number) => void;

interface SnakeGame {
    newGame: VoidFunction,
    setSize: SetNum,
    setSpeed: SetNum,
    setPlayers: (versus: boolean) => void;
}



interface HTMLDivElementWithTileNumber extends HTMLDivElement {
    dataset: {
        tileNumber: string,
    }
}