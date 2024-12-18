        var canvas = document.getElementById('game');
        var score = document.getElementById('score');
        var table = document.getElementById('table');
        var context = canvas.getContext('2d');

        
        // for(let i = 0; i < 25; i++){
        //     var a = document.createElement("a");
        //     for(let j = 0; j < 25; j++){
        //         var label = document.createElement("label");
        //         label.id = i + '@' + j;
        //         label.textContent = "0 ";
        //         label.style.color = "white";
        //         a.appendChild(label);
        //     }
        //     table.appendChild(a);
        // }
        

        var row = new Array(25);
        var grids = new Array(25);

        var grid = 16;
        var speed = 0;

        var snake = {
            x: 160,
            y: 160,

            dx: grid,
            dy: 0,

            cells:[],

            maxCells: 4,

            state: 0,
        };

        var apple = {
            x: getRandomInt(0, 25) * grid,
            y: getRandomInt(0, 25) * grid
        };

        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        }

        function loop(){
            if(snake.state === 0){
                return;
            }

            requestAnimationFrame(loop);
            
            //Change snake speed here, the higher the value the slower the snake
            if(++speed < 8){
                return;
            }
            
            speed = 0;
            context.clearRect(0, 0, canvas.width, canvas.height);
            row.fill(0);
            for(let i = 0; i < 25; i++){
                grids[i] = row.slice();
            }

            snake.x += snake.dx;
            snake.y += snake.dy;

            snake.cells.unshift({x: snake.x, y: snake.y});

            if(snake.cells.length > snake.maxCells){
                var toRemove = snake.cells.pop();
                grids[toRemove.y / 16][toRemove.x / 16] = 0;
            }

            context.fillStyle = 'red';
            context.fillRect(apple.x, apple.y, grid - 1, grid - 1);
            grids[apple.y / 16][apple.x / 16] = 3;

            context.fillStyle = 'green';
            snake.cells.forEach(function(cell, index) {
                context.fillRect(cell.x, cell.y, grid - 1, grid - 1);

                if(cell.x === apple.x && cell.y === apple.y){
                    snake.maxCells++;
                    score.innerText = "Score: " + (snake.maxCells - 4);

                    grids[apple.y / 16][apple.x / 16] = 0;

                    apple.x = getRandomInt(0, 25) * grid;
                    apple.y = getRandomInt(0, 25) * grid;

                    grids[apple.y / 16][apple.x / 16] = 3;
                }

                for(var i = index + 1; i < snake.cells.length; i++){
                    
                    if(cell.x === snake.cells[i].x && cell.y === snake.cells[i].y || (snake.x < 0 || snake.x >= canvas.width) || (snake.y < 0 || snake.y >= canvas.width)) {
                        snake.state = 0;

                        // updateTable(grids);
                        saveToFile(grids, snake.maxCells - 4, snake.state);

                        snake.x = 160;
                        snake.y = 160;
                        snake.cells = [];
                        snake.maxCells = 4;
                        snake.dx = grid;
                        snake.dy = 0;

                        score.innerText = "Score: 0";

                        grids[apple.y / 16][apple.x / 16] = 0;

                        apple.x = getRandomInt(0, 25) * grid;
                        apple.y = getRandomInt(0, 25) * grid;

                        context.clearRect(0, 0, canvas.width, canvas.height);
                        row.fill(0);
                        for(let i = 0; i < 25; i++){
                            grids[i] = row.slice();
                        }

                        grids[snake.y / 16][snake.x / 16] = 2;
                        grids[apple.y / 16][apple.x / 16] = 3;
                    }
                }
                grids[cell.y / 16][cell.x / 16] = 1;
            });
            grids[snake.y / 16][snake.x / 16] = 2;

            // updateTable(grids);
            saveToFile(grids, snake.maxCells - 4, snake.state);
        }

        // function updateTable(grids){
        //     for(let i = 0; i < 25; i++){
        //         for(let j = 0; j < 25; j++){
        //             var label = document.getElementById(i+'@'+j);
                    
        //             label.innerText = grids[i][j] + " ";
        //         }
        //     }
        //     return;
        // }

        function saveToFile(grids, score, state) {
            let json = grids.map((row, y) => row.map((col, x) => ({
                x: x,
                y: y,
                value: col
            })));

            const fullJson = {
                Arrays: json,
                Score: score,
                State: state
            }

            const jsonContent = JSON.stringify(fullJson, null, 2);

            fetch('http://localhost:3000/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: jsonContent
            })
            .then(response => response.text())
            .then(data => console.log(data))
            .catch(error => console.error('Error:', error));
        }
        
        document.addEventListener('keydown', function(e) {
            
            if(e.which === 37 && snake.dx === 0){
                snake.dx = -grid;
                snake.dy = 0;
            }

            else if(e.which === 38 && snake.dy === 0){
                snake.dy = -grid;
                snake.dx = 0;
            }

            else if(e.which === 39 && snake.dx === 0){
                snake.dx = grid;
                snake.dy = 0;
            }

            else if(e.which === 40 && snake.dy === 0){
                snake.dy = grid;
                snake.dx = 0;
            }
        });
        
        document.addEventListener('keypress', function(e) {
            if(e.which === 32 && snake.state != 1){
                snake.state = 1;
                requestAnimationFrame(loop);
            }
        });
