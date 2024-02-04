export class ConnectFour{
    constructor(){
        this.pos = []

        this.ROWS = 6
        this.COLS = 7
        this.STILL_PLAYING = 0
        this.WON = 1
        this.DRAW = 2

        this.player = '🔴'
        this.AI = '🔵'
        this.otherPlayer = ''
        this.timeLimit = ''
        this.playerColor = ''
        this.emptySquare = '.'
        this.colsFilled = new Array(this.COLS).fill(0)
        this.rowEl = []
        this.colEl = []
        this.gameOver = true
        this.winDrawLose = 0
        this.WinningTiles = []
        this.initBoard()
        this.generateBoard()
    }

    Clear(){
        this.clearBoard()
        this.colsFilled = new Array(this.COLS).fill(0)
        this.initBoard()
        console.log(this.pos)
        console.log(this.colsFilled)
        this.gameOver = true
    }

    Start(settings){
        this.gameOver = false
        this.otherPlayer = settings[0]
        this.timeLimit = settings[1]
        console.log(this.otherPlayer)
        console.log(this.timeLimit)
    }


    initBoard(){
        this.pos = []
        for(let i = 0; i < this.ROWS; i++){
            let temp = [];
            for(let j = 0; j < this.COLS; j++){
                temp[j] = this.emptySquare
            }
            this.pos.push(temp)
        }
    }

    changePlayer(player){
        if(player === '🔴'){
           return '🔵'
        }
        else{
            return '🔴'
        }
    }

    Play(col){
        if(this.gameOver == false){
            // Make players move, check for win/draw, change player
            if(this.makeMovePlayer(col) == false) return
            this.evaluateGameState()
            this.player = this.changePlayer(this.player)
            
            // Get AI move, make the move, check for win/draw, change player
            if(this.otherPlayer == 'AI'){
                let moveAI = this.getMoveAI(100)
                if(this.makeMovePlayer(moveAI) == false) return
                this.evaluateGameState()
                this.player = this.changePlayer(this.player);
            }
        }
        else{
            // console.log("GAME OVER")
        }
    }

    evaluateGameState(){
        let gameState = this.isOver(this.pos, this.player)

        if(gameState == this.WON){
            this.showWinner();
            this.gameOver = true
            return
        }
        else if(gameState == this.DRAW){
            this.gameOver = true
            // console.log("DRAW")
            return
        }
    }

    getMoveAI(N){
        const playerAI = this.player
        // console.log(playerAI)
        let winCounts = {}
        let validMoves = this.getValidMoves(this.pos)
        validMoves.forEach((move) => {
            winCounts[move] = 0
        })
        let sim_pos_initial = JSON.parse(JSON.stringify(this.pos))
        let gameState = this.STILL_PLAYING

        validMoves.forEach((col) => {
            for(let i = 0; i < N; i++){ // Simulate N games with the move
                let sim_pos = JSON.parse(JSON.stringify(sim_pos_initial))
                gameState = this.SimulateGame(sim_pos, col, playerAI) // Simulate with current move until end
                if(gameState == this.WON){
                    winCounts[col]++
                }else if(gameState == this.DRAW){
                    winCounts[col] += 0.5
                }
            }
        })
        // console.log(winCounts)
        let mostWins = Math.max.apply(null, Object.values(winCounts))
        let bestMove = Object.keys(winCounts).find(function(a) {
            return winCounts[a] === mostWins;
          })
        return bestMove
    }

    SimulateGame(sim_pos, col, playerAI){
        let colsCopy = [...this.colsFilled] // Shallow copy of cols filled
        colsCopy[col]++
        let row = this.ROWS - colsCopy[col]  
        sim_pos[row][col] = playerAI        // Make first move
        let player = this.changePlayer(playerAI)
        while(true){
            let moves = this.getValidMoves(sim_pos)
            if(moves.length == 0){
                return -1
            }
            let random_col = moves[Math.floor(Math.random() * moves.length)] 
            // console.log(random_col)
            
            colsCopy[random_col]++
            row = this.ROWS - colsCopy[random_col]
            sim_pos[row][random_col] = player
            
            let gameState = this.isOver(sim_pos, player)

            if(gameState == this.WON && player == playerAI){
                return 1
            }
            else if(gameState == this.WON && player != playerAI){
                return -1
            }
            if(gameState == this.DRAW){
                console.log(`DRAW`)
                return 2
            }

            player = this.changePlayer(player)
        }
    }

    makeMovePlayer(col) {
        if(this.colsFilled[col] < this.ROWS){ // Can insert into selected col
            this.colsFilled[col]++;
            let pieceRow = this.ROWS - this.colsFilled[col]
            this.pos[pieceRow][col] = this.player; // Insert into the board data
            // console.log(this.pos)
            this.updateBoard(pieceRow, col) // Add to the board on page
            return true
        }else {
            // console.log("COL FULL")
            return false
        }
    }
    showWinner(){
        this.WinningTiles.forEach((e) => {
            let cell = document.querySelector(`tr.row-${e.row} > td.col-${e.col}`)
            cell.className += " winner"
        });
        console.log(`Player ${this.player} has Won!`)
    }
    getValidMoves(pos){
        let validMoves = []
        for(let i = 0; i < this.COLS; i++){
            if(pos[0][i] == this.emptySquare){
                validMoves.push(i)
            }
        }
        return validMoves
    }
    updateBoard(row, col){
        let cell = document.querySelector(`tr.row-${row} > td.col-${col}`)
        cell.innerText = this.player
    }
    clearBoard(){
        this.rowEl.forEach((row) => {
            const cols = row.querySelectorAll('td')
            cols.forEach((col) => {
                if(col.className.includes('winner')){
                    col.className = col.className.replace('winner','').trim()
                }
                col.innerText = ''
            })
        })
    }
    isOver(pos, player) {
        for(let row = 0; row < this.ROWS; row++) { // Check for consecutive pieces in a row
            let consecutivePiecesRow = 0
            let WinningTiles = []
            this.WinningTiles = WinningTiles
            let topRowFilled = this.COLS
            for(let col = 0; col < this.COLS; col++){
                if(pos[row][col] === player) {
                    WinningTiles.push({row,col})
                    consecutivePiecesRow++;
                }
                else{
                    consecutivePiecesRow = 0
                }
                if(consecutivePiecesRow == 4){
                    this.WinningTiles = WinningTiles
                    this.winDrawLose = this.WON
                    return this.WON 
                }

                if(pos[row][col] !== this.emptySquare && row === 0){ // Check for draw
                    if(--topRowFilled == 0){
                        this.WinningTiles = []
                        this.winDrawLose = this.DRAW
                        // console.log("ITS A DRAW")
                        return this.DRAW
                    }
                }
            }
        }

        for(let col = 0; col < this.COLS; col++){ // Check for consecutive pieces in a col
            let consecutivePiecesCol = 0
            let WinningTiles = []
            for(let row = 0; row < this.ROWS; row++){
                if(pos[row][col] === player) {
                    WinningTiles.push({row,col})
                    consecutivePiecesCol++;
                }
                else{
                    consecutivePiecesCol = 0
                }
                if(consecutivePiecesCol == 4){
                    this.WinningTiles = WinningTiles
                    this.winDrawLose = this.WON
                    return this.WON
                }
            }
        }
        let diagonalColIt = this.COLS - 4
        let diagonalRowIt = this.ROWS - 4
        for(let row = 0; row <= diagonalRowIt; row++){ // Check for diagonals
            for(let col = 0; col <= diagonalColIt; col++){
                let WinningTilesPri = []
                let WinningTilesSec = []
                let consecutivePiecesDiaPri = 0
                let consecutivePiecesDiaSec = 0
                for(let diaCnt = 0; diaCnt < 4; diaCnt++){
                    let rowDiaPri = row + diaCnt
                    let colDiaPri = col + diaCnt
                    let rowDiaSec = row + diaCnt
                    let colDiaSec = this.ROWS - col - diaCnt
                    if(pos[rowDiaPri][colDiaPri] === player){ // Check for primary diagonals
                        WinningTilesPri.push({"row":rowDiaPri,"col":colDiaPri})
                        consecutivePiecesDiaPri++
                    }
                    else{
                        consecutivePiecesDiaPri = 0;
                    }
                    if(consecutivePiecesDiaPri == 4){
                        this.WinningTiles = WinningTilesPri
                        // console.log(WinningTilesPri)
                        this.winDrawLose = this.WON
                        return this.WON
                    }

                    if(pos[rowDiaSec][colDiaSec] === player){ // Check for secondary diagonals
                        WinningTilesSec.push({"row":rowDiaSec, "col":colDiaSec})
                        consecutivePiecesDiaSec++
                    }
                    else{
                        consecutivePiecesDiaSec = 0;
                    }
                    if(consecutivePiecesDiaSec == 4){
                        this.WinningTiles = WinningTilesSec
                        // console.log(WinningTilesSec)
                        this.winDrawLose = this.WON
                        return this.WON
                    }
                }
            }
        }
        return this.STILL_PLAYING
    }
    generateBoard(){
        const game = document.getElementById('connectfour')
        for (let row = 0; row < this.ROWS; row++) {
            let rowEl = document.createElement('tr'); // Use 'tr' for table row
            rowEl.className = `row-${row}`
            game.appendChild(rowEl);
            this.rowEl[row] = rowEl
    
            for (let col = 0; col < this.COLS; col++) {
                let colEl = document.createElement('td'); // Use 'td' for table data/cell
                colEl.className = `col-${col}`
                colEl.addEventListener('click', () => { this.Play(col) });
                colEl.textContent = ``;
                rowEl.appendChild(colEl);
                this.colEl[col] = colEl
            }
        }
    }
}
