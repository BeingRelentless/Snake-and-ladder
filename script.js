class SnakeAndLadderGame {
    constructor() {
        this.boardSize = 100;
        this.currentPlayer = 1;
        this.playerCount = 2;
        this.playerPositions = { 1: 1, 2: 1 };
        this.gameOver = false;
        this.isRolling = false;
        
        // Define snakes and ladders
        this.snakes = {
            16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78
        };
        
        this.ladders = {
            1: 38, 4: 14, 9: 21, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100
        };
        
        this.initializeGame();
        this.setupEventListeners();
    }
    
    initializeGame() {
        this.createGameBoard();
        this.updateUI();
        this.showInstructions();
    }
    
    createGameBoard() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';
        
        // Create board squares (numbered 1-100)
        for (let row = 9; row >= 0; row--) {
            for (let col = 0; col < 10; col++) {
                let squareNumber;
                
                // Snake pattern: odd rows go right-to-left, even rows go left-to-right (mirrored)
                if (row % 2 === 1) {
                    squareNumber = row * 10 + (9 - col) + 1;
                } else {
                    squareNumber = row * 10 + col + 1;
                }
                
                const square = document.createElement('div');
                square.className = 'board-square';
                square.dataset.square = squareNumber;
                
                // Add square number
                const numberSpan = document.createElement('span');
                numberSpan.className = 'square-number';
                numberSpan.textContent = squareNumber;
                square.appendChild(numberSpan);
                
                // Add players container
                const playersDiv = document.createElement('div');
                playersDiv.className = 'players';
                square.appendChild(playersDiv);
                
                // Mark special squares
                if (this.snakes[squareNumber]) {
                    square.classList.add('snake-head');
                    square.title = `Snake Head! Slide down to square ${this.snakes[squareNumber]}`;
                } else if (Object.values(this.snakes).includes(squareNumber)) {
                    square.classList.add('snake-tail');
                    const snakeHead = Object.keys(this.snakes).find(key => this.snakes[key] == squareNumber);
                    square.title = `Snake Tail (from square ${snakeHead})`;
                }
                
                if (this.ladders[squareNumber]) {
                    square.classList.add('ladder-bottom');
                    square.title = `Ladder Bottom! Climb up to square ${this.ladders[squareNumber]}`;
                } else if (Object.values(this.ladders).includes(squareNumber)) {
                    square.classList.add('ladder-top');
                    const ladderBottom = Object.keys(this.ladders).find(key => this.ladders[key] == squareNumber);
                    square.title = `Ladder Top (from square ${ladderBottom})`;
                }
                
                // Add hover effects for snake and ladder information
                square.addEventListener('mouseenter', () => {
                    this.showSquareInfo(squareNumber);
                });
                
                square.addEventListener('mouseleave', () => {
                    this.hideSquareInfo();
                });
                
                gameBoard.appendChild(square);
            }
        }
        
        this.updatePlayerPositions();
    }
    
    setupEventListeners() {
        // Roll dice button
        document.getElementById('roll-dice-btn').addEventListener('click', () => {
            this.rollDice();
        });
        
        // Reset game button
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetGame();
        });
        
        // Player count selector
        document.getElementById('player-count').addEventListener('change', (e) => {
            this.playerCount = parseInt(e.target.value);
            this.resetGame();
        });
        
        // Instructions modal
        document.getElementById('instructions-btn').addEventListener('click', () => {
            this.showInstructions();
        });
        
        document.getElementById('close-instructions').addEventListener('click', () => {
            this.hideInstructions();
        });
        
        // Play again button
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.hideWinModal();
            this.resetGame();
        });
        
        // Modal background click to close
        document.getElementById('instructions-modal').addEventListener('click', (e) => {
            if (e.target.id === 'instructions-modal') {
                this.hideInstructions();
            }
        });
        
        document.getElementById('win-modal').addEventListener('click', (e) => {
            if (e.target.id === 'win-modal') {
                this.hideWinModal();
                this.resetGame();
            }
        });
        
        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.gameOver && !this.isRolling) {
                e.preventDefault();
                this.rollDice();
            }
        });
    }
    
    rollDice() {
        if (this.gameOver || this.isRolling) return;
        
        this.isRolling = true;
        const rollBtn = document.getElementById('roll-dice-btn');
        const dice = document.getElementById('dice');
        
        rollBtn.disabled = true;
        dice.classList.add('rolling');
        
        // Generate random number between 1-6
        const diceValue = Math.floor(Math.random() * 6) + 1;
        
        // Animate dice roll
        setTimeout(() => {
            dice.classList.remove('rolling');
            this.updateDiceDisplay(diceValue);
            this.movePlayer(diceValue);
            
            setTimeout(() => {
                rollBtn.disabled = false;
                this.isRolling = false;
            }, 1000);
        }, 600);
        
        // Update dice result immediately
        document.getElementById('dice-result').textContent = 'Rolling...';
    }
    
    updateDiceDisplay(value) {
        const diceFace = document.getElementById('dice-face');
        diceFace.innerHTML = '';
        
        const dotsContainer = document.createElement('div');
        dotsContainer.className = `dice-dots ${this.getNumberWord(value)}`;
        
        for (let i = 0; i < value; i++) {
            const dot = document.createElement('div');
            dot.className = 'dice-dot';
            dotsContainer.appendChild(dot);
        }
        
        diceFace.appendChild(dotsContainer);
        document.getElementById('dice-result').textContent = `Rolled: ${value}`;
    }
    
    getNumberWord(num) {
        const words = ['', 'one', 'two', 'three', 'four', 'five', 'six'];
        return words[num];
    }
    
    movePlayer(steps) {
        const oldPosition = this.playerPositions[this.currentPlayer];
        let newPosition = oldPosition + steps;
        
        // Check if player exceeds 100
        if (newPosition > 100) {
            newPosition = oldPosition; // Stay in place if roll exceeds 100
            this.updateGameStatus(`Player ${this.currentPlayer} needs exactly ${100 - oldPosition} to win!`);
        } else {
            this.playerPositions[this.currentPlayer] = newPosition;
            
            // Animate movement
            this.animatePlayerMovement(oldPosition, newPosition);
            
            // Check for snakes and ladders
            if (this.snakes[newPosition]) {
                setTimeout(() => {
                    const slidePosition = this.snakes[newPosition];
                    this.playerPositions[this.currentPlayer] = slidePosition;
                    this.updateGameStatus(`Player ${this.currentPlayer} hit a snake! Slid down to ${slidePosition}.`);
                    this.animatePlayerMovement(newPosition, slidePosition);
                    this.updatePlayerPositions();
                    this.checkWinCondition();
                }, 1000);
                return;
            } else if (this.ladders[newPosition]) {
                setTimeout(() => {
                    const climbPosition = this.ladders[newPosition];
                    this.playerPositions[this.currentPlayer] = climbPosition;
                    this.updateGameStatus(`Player ${this.currentPlayer} found a ladder! Climbed up to ${climbPosition}.`);
                    this.animatePlayerMovement(newPosition, climbPosition);
                    this.updatePlayerPositions();
                    this.checkWinCondition();
                }, 1000);
                return;
            } else {
                this.updateGameStatus(`Player ${this.currentPlayer} moved to square ${newPosition}.`);
            }
        }
        
        setTimeout(() => {
            this.updatePlayerPositions();
            this.checkWinCondition();
        }, 1000);
    }
    
    animatePlayerMovement(fromPosition, toPosition) {
        const fromSquare = document.querySelector(`[data-square="${fromPosition}"]`);
        const toSquare = document.querySelector(`[data-square="${toPosition}"]`);
        
        if (fromSquare && toSquare) {
            const playerToken = fromSquare.querySelector(`.player${this.currentPlayer}`);
            if (playerToken) {
                playerToken.classList.add('moving');
                setTimeout(() => {
                    playerToken.classList.remove('moving');
                }, 500);
            }
        }
    }
    
    updatePlayerPositions() {
        // Clear all player tokens
        document.querySelectorAll('.player-token').forEach(token => {
            token.remove();
        });
        
        // Add player tokens to current positions
        for (let player = 1; player <= this.playerCount; player++) {
            const position = this.playerPositions[player];
            const square = document.querySelector(`[data-square="${position}"]`);
            if (square) {
                const playersDiv = square.querySelector('.players');
                const token = document.createElement('div');
                token.className = `player-token player${player}`;
                playersDiv.appendChild(token);
            }
        }
        
        // Update position displays
        for (let player = 1; player <= this.playerCount; player++) {
            const positionElement = document.getElementById(`player${player}-position`);
            if (positionElement) {
                positionElement.textContent = this.playerPositions[player];
            }
        }
    }
    
    checkWinCondition() {
        if (this.playerPositions[this.currentPlayer] >= 100) {
            this.gameOver = true;
            this.showWinModal(this.currentPlayer);
            return;
        }
        
        // Switch to next player
        this.switchPlayer();
    }
    
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        
        // Skip player 2 if single player mode
        if (this.playerCount === 1 && this.currentPlayer === 2) {
            this.currentPlayer = 1;
        }
        
        this.updateUI();
    }
    
    updateUI() {
        // Update current player display
        const currentPlayerInfo = document.getElementById('current-player-info');
        currentPlayerInfo.innerHTML = `
            <div class="player-piece player${this.currentPlayer}-piece"></div>
            <span>Player ${this.currentPlayer}</span>
        `;
        
        // Update player cards
        document.querySelectorAll('.player-card').forEach(card => {
            card.classList.remove('active');
        });
        document.getElementById(`player${this.currentPlayer}-card`).classList.add('active');
        
        // Show/hide player 2 card based on player count
        const player2Card = document.getElementById('player2-card');
        if (this.playerCount === 1) {
            player2Card.style.display = 'none';
        } else {
            player2Card.style.display = 'block';
        }
        
        // Update game status
        if (!this.gameOver) {
            this.updateGameStatus(`Player ${this.currentPlayer}'s turn. Click "Roll Dice" to play!`);
        }
    }
    
    updateGameStatus(message) {
        const statusElement = document.getElementById('game-status');
        const newMessage = document.createElement('p');
        newMessage.textContent = message;
        
        // Add new message at top and limit to 5 messages
        statusElement.insertBefore(newMessage, statusElement.firstChild);
        while (statusElement.children.length > 5) {
            statusElement.removeChild(statusElement.lastChild);
        }
    }
    
    showSquareInfo(squareNumber) {
        let infoMessage = '';
        
        if (this.snakes[squareNumber]) {
            infoMessage = `🐍 Snake Head on square ${squareNumber} → slides down to square ${this.snakes[squareNumber]}`;
        } else if (Object.values(this.snakes).includes(squareNumber)) {
            const snakeHead = Object.keys(this.snakes).find(key => this.snakes[key] == squareNumber);
            infoMessage = `🐍 Snake Tail on square ${squareNumber} ← from square ${snakeHead}`;
        } else if (this.ladders[squareNumber]) {
            infoMessage = `🪜 Ladder Bottom on square ${squareNumber} → climbs up to square ${this.ladders[squareNumber]}`;
        } else if (Object.values(this.ladders).includes(squareNumber)) {
            const ladderBottom = Object.keys(this.ladders).find(key => this.ladders[key] == squareNumber);
            infoMessage = `🪜 Ladder Top on square ${squareNumber} ← from square ${ladderBottom}`;
        }
        
        if (infoMessage) {
            // Create or update hover info element
            let hoverInfo = document.getElementById('hover-info');
            if (!hoverInfo) {
                hoverInfo = document.createElement('div');
                hoverInfo.id = 'hover-info';
                hoverInfo.style.cssText = `
                    position: fixed;
                    top: 10px;
                    right: 10px;
                    background: rgba(0,0,0,0.8);
                    color: white;
                    padding: 10px 15px;
                    border-radius: 8px;
                    font-size: 0.9em;
                    z-index: 1000;
                    max-width: 250px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                `;
                document.body.appendChild(hoverInfo);
            }
            hoverInfo.textContent = infoMessage;
            hoverInfo.style.display = 'block';
        }
    }
    
    hideSquareInfo() {
        const hoverInfo = document.getElementById('hover-info');
        if (hoverInfo) {
            hoverInfo.style.display = 'none';
        }
    }
    
    showWinModal(winner) {
        const winModal = document.getElementById('win-modal');
        const winnerPiece = document.getElementById('winner-piece');
        const winnerText = document.getElementById('winner-text');
        
        winnerPiece.className = `winner-piece player${winner}-piece`;
        winnerText.textContent = `Player ${winner} Wins!`;
        
        winModal.classList.add('show');
        
        // Play celebration animation
        this.celebrateWin();
    }
    
    hideWinModal() {
        document.getElementById('win-modal').classList.remove('show');
    }
    
    celebrateWin() {
        // Add confetti effect or celebration animation
        const winnerSquare = document.querySelector(`[data-square="100"]`);
        if (winnerSquare) {
            winnerSquare.style.animation = 'celebration 2s ease-in-out infinite';
        }
        
        setTimeout(() => {
            if (winnerSquare) {
                winnerSquare.style.animation = '';
            }
        }, 4000);
    }
    
    showInstructions() {
        document.getElementById('instructions-modal').classList.add('show');
    }
    
    hideInstructions() {
        document.getElementById('instructions-modal').classList.remove('show');
    }
    
    resetGame() {
        this.currentPlayer = 1;
        this.playerPositions = { 1: 1, 2: 1 };
        this.gameOver = false;
        this.isRolling = false;
        
        // Reset UI
        document.getElementById('roll-dice-btn').disabled = false;
        document.getElementById('dice-result').textContent = 'Roll to start!';
        document.getElementById('game-status').innerHTML = '<p>Game started! Player 1\'s turn.</p>';
        
        // Reset dice display
        this.updateDiceDisplay(1);
        
        this.updatePlayerPositions();
        this.updateUI();
        this.hideWinModal();
    }
}

// Add celebration keyframes to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes celebration {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); background: linear-gradient(45deg, #ffd700, #ff6b6b); }
    }
`;
document.head.appendChild(style);

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new SnakeAndLadderGame();
    
    // Add some helpful console commands for debugging
    window.game = game;
    console.log('Snake and Ladder Game loaded! Use window.game to access game methods.');
    console.log('Available commands: game.resetGame(), game.rollDice(), game.showInstructions()');
});

// Service Worker for offline play (optional)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {
        // Service worker registration failed, but game still works
    });
}

// Add touch support for mobile devices
document.addEventListener('touchstart', function() {}, {passive: true});

// Prevent zoom on double tap for mobile
let lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);


