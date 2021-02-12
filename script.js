/* Contains references to UI elements. */
const UI = (() => {
    const canvas = document.getElementById('canvas');
    const startBtn = document.getElementById('startBtn');
    const resetBtn = document.getElementById('resetBtn');
    const rulesBtn = document.getElementById('rulesBtn');
    const closeRules = document.getElementById('close-rules');
    closeRules.addEventListener('click', e => {
        e.target.parentElement.classList.toggle('show-modal')
    })
    const ptsToWin = document.getElementById('ptsToWin')
    return {
        canvas: canvas,
        startBtn: startBtn,
        resetBtn: resetBtn,
        rulesBtn: rulesBtn,
        closeRules: closeRules,
        // Retrieves the current max points selected by user.
        ptsToWin: () => parseInt(ptsToWin.value, 10),
        // Generates a modal displaying who won and a trophy image. 
        displayWinner: (winner) => {
            const modal = document.createElement('div');
            modal.id = 'winner-modal';
            modal.className = 'modal show-modal';

            const closeBtn = document.createElement('button');
            closeBtn.innerText = 'x'
            closeBtn.id="close-rules";
            closeBtn.className = "btn";
            closeBtn.addEventListener('click', (e) => {
                e.target.parentElement.classList.toggle('show-modal')
            })
            modal.appendChild(closeBtn);

            const content = document.createElement('div');
            content.className = "modal-content";
            content.innerHTML = `
            <h3 class="winning-text">${winner} wins!</h3>
            <img class="trophy-img" src="./assets/trophy.png" />
            `;
            modal.appendChild(content);

            document.querySelector('body').appendChild(modal);
        }
    }
})();

// Constants
const HEIGHT_RATIO = 0.6
const BALL_RADIUS = UI.canvas.width * 0.005
UI.canvas.height = UI.canvas.width * HEIGHT_RATIO;
const CANVAS_HEIGHT = UI.canvas.height;
const CANVAS_WIDTH = UI.canvas.width;
const PADDLE_HEIGHT = UI.canvas.height * 0.24;
const PADDLE_WIDTH = UI.canvas.width * 0.02;

class Ball{
    /**
     * Contructs a Ball given a context, desired radius, and position to render in context.
     * @param {context} ctx 2d canvas context where it is rendered
     * @param {Number} radius Dimensions of the ball.
     * @param {Number} posX Starting x position in coordinate plane
     * @param {Number} posY Starting y posoition in coordintate place
     */
    constructor(ctx, radius, posX, posY){
        this.ctx = ctx;
        this.radius = radius;
        this.posX = posX;
        this.posY = posY;
        this.offsetPos = this.radius / 2;
        this.dx = 4; // Horizontal movement of ball.
        this.dy = 4; // Vertical movement of ball.
        this.velocity = 6; // Speed of the ball
    }
    /**
     * Draws a white circular object representing the ball on the current context.
     */
    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.posX + this.offsetPos, this.posY, this.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = 'white';
        this.ctx.fill();
        this.ctx.closePath();
    }
    /**
     * Changes the position of the ball relative to the dx and dy values.
     */
    move() {
        this.posX += this.dx;
        this.posY += this.dy;
    }
}

class Paddle{
    /**
     * Draws a paddle given a context to render it, size in width and height, and
     * the starting position.
     * @param {context} ctx 2d canvas context where it is rendered
     * @param {Number} posX Starting x position in coordinate plane
     * @param {Number} posY Starting y posoition in coordintate place 
     * @param {Number} w Width of the paddle
     * @param {Number} h Height of the paddle
     */
    constructor(ctx, posX, posY, w, h){
        this.ctx = ctx;
        this.posX = posX;
        this.posY = posY;
        this.w = w;
        this.h = h;
        this.offsetX = this.w / 2;
        this.offsetY = this.h / 2;
        this.dy = 0; // Vertical movement of paddle.
        this.velocity = 8; // Speed of paddle.
    }
    /**
     * Draws a white rectangular object representing the paddle on the current context.
     */
    draw(){
        this.ctx.beginPath();
        this.ctx.rect(this.posX, this.posY, this.w, this.h);
        this.ctx.fillStyle = 'white';
        this.ctx.fill();
        this.ctx.closePath();
    }
    /**
     * Changes the vertical position of the ball relative to the dy values.
     */
    move(){
        this.posY += this.dy;
        // Check to ensure paddle is not moved by player outside of canvas dimensions
        if (this.posY + this.h > CANVAS_HEIGHT){
            this.posY = CANVAS_HEIGHT - this.h;
        }
        if (this.posY < 0) {
            this.posY = 0;
        }
    }
}

class Pong{
    /**
     * Renders the ball and the two player paddles on the canvas. Also, sets up the event listeners for the controls 
     */
    constructor(canvas){
        this.ctx = canvas.getContext('2d');
        // Places the paddles in opposite ends of the canvas and a ball in the middle.
        this.ball = new Ball(this.ctx, 10, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        this.p1 = new Paddle(this.ctx, 10, CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2, PADDLE_WIDTH, PADDLE_HEIGHT);
        this.p2 = new Paddle(this.ctx, CANVAS_WIDTH - PADDLE_WIDTH - 10, CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2, PADDLE_WIDTH, PADDLE_HEIGHT);
        // Initializes both player scores to 0
        this.p1Score = 0;
        this.p2Score = 0;
        // Ball will not move when update function is called without a player starting.
        this.isGameStart = false;
        // Readies the keyboard event handlers and button event handlers for starting/reseting game.
        this.assignControlListeners(this.p1, 'w', 's');
        this.assignControlListeners(this.p2);
        this.gameStateListeners();
        UI.closeRules;
    }
    /**
     * Assigns 'keydown' event handler for moving a paddle
     * up and down, and a 'keyup' event handler for stopping paddle movement.
     * Default controls for a paddle is the Up and Down arrow keys.
     * @param {Paddle} paddle 
     * @param {String} up 
     * @param {String} down 
     */
    assignControlListeners(paddle, up='ArrowUp', down='ArrowDown') {
        document.addEventListener('keydown', e => {
            e.preventDefault();
            if(e.key === up || e.key === 'Up') paddle.dy = -paddle.velocity;
            else if (e.key === down || e.key === 'Down') paddle.dy = paddle.velocity;
        });
        document.addEventListener('keyup', e => {
            e.preventDefault();
            if(e.key === up || e.key === down || e.key === 'Up' || e.key === 'Down') 
                paddle.dy = 0;
        });
    }
    /**
     * Start game if the 'Start' button is clicked, or reset the score and ball/paddle
     * positions if the 'Reset' button is clicked.
     */
    gameStateListeners(){
        UI.startBtn.addEventListener('click', () => {
            const winnerModal = document.getElementById('winner-modal');
            if (winnerModal) 
                winnerModal.remove();
            this.isGameStart = true;
            // Reset ball position
            this.resetBallPos();
            // Ball is served randomly at start.
            this.ball.dx = Math.random() > 0.5 ? this.ball.dx : -this.ball.dx;
            this.ball.dy = Math.random() > 0.5 ? this.ball.dy : -this.ball.dy;
        });
        UI.resetBtn.addEventListener('click', () => {
            const winnerModal = document.getElementById('winner-modal');
            if (winnerModal) 
                winnerModal.remove();
            // Reset game
            this.isGameStart = false;
            // Reset ball position
            this.resetBallPos();
            // Reset paddle positions
            this.p1.posY = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
            this.p2.posY = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
            // Reset score
            this.p1Score = 0;
            this.p2Score = 0;
        });
        UI.rulesBtn.addEventListener('click', (e) => {
            const target = document.querySelector(`#${e.target.dataset.target}`);
            target.classList.toggle(`show-${e.target.dataset.toggle}`);
        })
    }
    /**
     * Ball bounces off paddle by heading in the opposite direction
     */
    ballPaddleCollisions(){
        // Paddle 1 Collision
        const p1RightWall = this.p1.posX + this.p1.w;
        const p1TopWall = this.p1.posY;
        const p1BottomWall = this.p1.posY  + this.p1.h;
        if (
            this.ball.posX < p1RightWall &&
            this.ball.posY > p1TopWall &&
            this.ball.posY < p1BottomWall){ // dx becomes positive (ball goes right)
                this.ball.dx = -this.ball.dx;
        }
        //Paddle 2 Collision
        const p2LeftWall = this.p2.posX;
        const p2TopWall = this.p2.posY;
        const p2BottomWall = this.p2.posY + this.p2.h;
        if (
            this.ball.posX > p2LeftWall &&
            this.ball.posY > p2TopWall &&
            this.ball.posY < p2BottomWall){ // dx becomes negative (ball goes left)
            this.ball.dx = -this.ball.dx;
        }
    }
    /**
     * Handle ball and wall collisions: Ball bounces off top and bottom walls;
     * Players scores on the left and right walls.
     */
    ballWallCollisions() {
        // Paddle 1 scored
        if(this.ball.posX + this.ball.radius > CANVAS_WIDTH) {
            this.p1Score++;
            //console.log("Player 1 Score: " + this.p1Score);
            this.resetBallPos();
        }
        // Paddle 2 scored
        if(this.ball.posX < 0){
            this.p2Score++;
            //console.log("Player 2 Score: " + this.p2Score);
            this.resetBallPos();
        }
        // Ball top and bottom wall collision
        if (this.ball.posY + this.ball.radius > CANVAS_HEIGHT || this.ball.posY - this.ball.radius < 0){
            this.ball.dy = -this.ball.dy;
        }
    }
    /**
     * Render the current score on the canvas  
     */
    drawScore() {
        // Draw score text
        this.ctx.font = "18px monospace"
        this.ctx.fillStyle = "white";
        this.ctx.fillText(`P1: ${this.p1Score}`, 15, 30);
        this.ctx.fillText(`P2: ${this.p2Score}`, CANVAS_WIDTH - 100, 30);
    }
    /**
     * Draw the current game state on the canvas.
     */
    drawGame(){
        // Clear canvas
        this.ctx.clearRect(0, 0, canvas.width, canvas.height)
        // Draw ball and paddles
        this.ball.draw();
        this.p1.draw();
        this.p2.draw();  
        this.drawScore(); 
    }
    /**
     * Reset the ball position to the center of the canvas.
     */
    resetBallPos(){
        this.ball.posX = CANVAS_WIDTH / 2;
        this.ball.posY = CANVAS_HEIGHT / 2;
    }
    /**
     * Uses the requestAnimationFrame function on itself to redraw the game.
     */
    update() {
        // Wait until player starts game from UI to move ball.
        if(this.isGameStart) { 
            this.ball.move();
        }
        // Stop game and show that P1 won.
        if(this.p1Score > this.p2Score && this.p1Score ===  UI.ptsToWin()) {
            this.isGameStart = false;
            if (!document.getElementById('winner-modal'))
                UI.displayWinner("P1");
        }
        // Stop game and show that P2 won.
        if(this.p2Score > this.p1Score && this.p2Score === UI.ptsToWin()) {
            this.isGameStart = false;
            if (!document.getElementById('winner-modal'))
                UI.displayWinner("P2");
        }
        this.p1.move();
        this.p2.move();
        this.ballPaddleCollisions();
        this.ballWallCollisions();
        this.drawGame();
        window.requestAnimationFrame(this.update.bind(this));
    }
}

const main = () => {  
    const game = new Pong(UI.canvas);
    game.update();
}

main();

