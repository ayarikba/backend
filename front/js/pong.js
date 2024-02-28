// //import { gameRoomCode } from './main.js';

// if (typeof initializeGame === 'undefined') {
	
// 	const initializeGame = () => {
// 		const canvas = document.getElementById('gameCanvas');
//         const ctx = canvas.getContext('2d');
        
//         // Share the WebSocket connection among tabs
//         const roomName = gameRoomCode;  // Use the room name from the context
//         const socket = new WebSocket('ws://' + "127.0.0.1:8000" + '/ws/game/' + roomName + '/');
//         // Event listener for keyboard input
//         document.addEventListener('keydown', handleKeyDown);
//         document.addEventListener('keyup', handleKeyUp);

//         let paddle1Y = 250;
//         let paddle2Y = 250;
//         let ballX = 450;
//         let ballY = 300;
//         let score1 = 0;
//         let score2 = 0;

//         function handleKeyDown(e) {
//             if (e.key === 'w' && paddle1Y > 0) {
//                 paddle1Y -= 10;
//             } else if (e.key === 's' && paddle1Y < canvas.height - 100) {
//                 paddle1Y += 10;
//             } else if (e.key === 'ArrowUp' && paddle2Y > 0) {
//                 paddle2Y -= 10;
//             } else if (e.key === 'ArrowDown' && paddle2Y < canvas.height - 100) {
//                 paddle2Y += 10;
//             }

//             sendPaddlePositions();
//         }

//         function handleKeyUp(e) {
//             // Handle key release events if needed
//         }

//         function sendPaddlePositions() {
//             // Send paddle positions to the server
//             const data = {
//                 'paddle1Y': paddle1Y,
//                 'paddle2Y': paddle2Y,
//             };
//             socket.send(JSON.stringify(data));
//         }

//         socket.onmessage = function (event) {
//             const data = JSON.parse(event.data);

//             // Update game state based on received data
//             paddle1Y = data.paddle1Y;
//             paddle2Y = data.paddle2Y;
//             ballX = data.ballX;
//             ballY = data.ballY;
//             score1 = data.score1;
//             score2 = data.score2;

//             // Draw game elements
//             drawGame();
//         };

//         function drawGame() {
//             // Clear the canvas
//             ctx.clearRect(0, 0, canvas.width, canvas.height);

//             // Draw paddles
//             ctx.fillRect(0, paddle1Y, 10, 100);
//             ctx.fillRect(canvas.width - 10, paddle2Y, 10, 100);

//             // Draw ball
//             ctx.beginPath();
//             ctx.arc(ballX, ballY, 10, 0, Math.PI * 2);
//             ctx.fill();

//             // Draw scores
//             ctx.font = '24px Arial';
//             ctx.fillText('Score: ' + score1 + ' - ' + score2, canvas.width / 2 - 70, 30);
//         }

//         // Initial setup
//         function setup() {
//             // Perform any initial setup here
//         }

//         // Start the game loop
//         setup();
// 	};
// 	initializeGame();
// }
