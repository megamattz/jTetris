// This is an old Javascript Tetris I made a long time ago and submitted to Planet Source code


// Parent function which does the drawing of all the elements onto the canvas.
function drawFallingBlock(ctx, blockImage, FallingBlock, TetrisArea, TetrisAreaXMargin, TetrisAreaYMargin, Score)
{
    // Clear the vanvas of anything from the previous frame
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = "#000"; 

    // Draw the block which is currently falling down
    DrawBlock(ctx, FallingBlock, blockImage, pxFallingBlockX, pxFallingBlockY, BlockRotateState, TetrisAreaXMargin, TetrisAreaYMargin);
}

function DrawNextBlock(ctx,blockImage, NextBlock)
{

    // Draw the block which is currently falling down
    DrawBlock(ctx, NextBlock, blockImage, 100, 250, 0, 0, 0);
  
}

// Parent function which does the drawing of all the elements onto the canvas.
function drawTetrisGrid(ctx, blockImage, TetrisArea, TetrisAreaXMargin, TetrisAreaYMargin, Score, NextBlock)
{
    // Clear the vanvas of anything from the previous frame
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = "#000";

    // Draw the blocks which have already been placed on the grid
    DrawTetrisArea(ctx, TetrisArea, blockImage, TetrisAreaXMargin, TetrisAreaYMargin);

    // Draw the next block hint for the player
    DrawNextBlock(ctx, blockImage, NextBlock);
}

// Parent function which does the drawing of all the elements onto the canvas.
function drawBackGround(ctx, TetrisArea, TetrisAreaXMargin, TetrisAreaYMargin, Score)
{
    // Clear the vanvas of anything from the previous frame
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = "#000";

    DrawTetrisAreaBoundary(ctx, TetrisArea, TetrisAreaXMargin, TetrisAreaYMargin);

    DrawText(ctx, Score);
}


// Draws all the already landed blocks on the tetris area
function DrawTetrisArea(ctx, TetrisArea, blockImage, TetrisAreaXMargin, TetrisAreaYMargin)
{
    for (var n = 0; n < TetrisArea.length; n++)
    {
        var TetrisAreaLine = TetrisArea[n];

        for (var m = 0, len = TetrisAreaLine.length; m < len; m++)
        {
            var AreaChar = TetrisAreaLine[m];

            if (isNumeric(AreaChar))
            {
                var BlockNo = parseInt(AreaChar);
                DrawBlockPiece(ctx, blockImage, BlockNo, m * BLOCK_WIDTH, n * BLOCK_HEIGHT, TetrisAreaXMargin, TetrisAreaYMargin);
            }
        }
    }
}

// Draws a block onto the canvas. This is used to draw the falling block
// And the next block
function DrawBlock(ctx, block, blockImage, xPos, yFallingPos, RotateState, TetrisAreaXMargin, TetrisAreaYMargin)
{
    if (block == undefined) { return;}

    var BlockPos = block.blockposition[RotateState];

    for (var n = 0; n < BlockPos.blockline.length; n++)
    {
        var BlockLine = BlockPos.blockline[n];

        for (var m = 0, len = BlockLine.text.length; m < len; m++)
        {
            var BlockChar = BlockLine.text[m];

            if (isNumeric(BlockChar))
            {
                var xOffset = (m * BLOCK_WIDTH) + xPos;
                var yOffset = (n * BLOCK_HEIGHT) + yFallingPos;

                var BlockNo = parseInt(BlockChar);
                DrawBlockPiece(ctx, blockImage, BlockNo, xOffset, yOffset, TetrisAreaXMargin, TetrisAreaYMargin);
            }
        }
    }
}

// Draws a single block piece onto the canvas
function DrawBlockPiece(ctx, blockImage, blockNumber, x, y, TetrisAreaXMargin, TetrisAreaYMargin)
{
    var sx = BLOCK_WIDTH * blockNumber;

    x = x + TetrisAreaXMargin;
    y = y + TetrisAreaYMargin;

    ctx.drawImage(blockImage, sx, 0, BLOCK_WIDTH, BLOCK_HEIGHT, x, y, BLOCK_WIDTH, BLOCK_HEIGHT);
}

// Draws the blue box around the tetris area
function DrawTetrisAreaBoundary(ctx, TetrisArea, TetrisAreaXMargin, TetrisAreaYMargin)
{
    ctx.strokeStyle = "#0000FF";

    ctx.lineWidth = 5;

    var pxTetrisAreaHeight = TetrisArea.length * BLOCK_HEIGHT;
    var pxTetrisAreaWidth = TetrisArea[0].length * BLOCK_WIDTH;

    ctx.rect(TetrisAreaXMargin,
             TetrisAreaYMargin,
             pxTetrisAreaWidth,
             pxTetrisAreaHeight);

    ctx.stroke();

    // Draw a black line at the bottom to cover over some rendering artifacts
    ctx.strokeStyle = "#000000";
    ctx.beginPath();
    ctx.moveTo(TetrisAreaXMargin, TetrisAreaYMargin + pxTetrisAreaHeight + 5);
    ctx.lineTo(TetrisAreaXMargin + pxTetrisAreaWidth, TetrisAreaYMargin + pxTetrisAreaHeight + 5);
    ctx.stroke(); 
}

// Draws the text with keyboard controls and and the high scrore
function DrawText(ctx, Score)
{
    var KeyboardTextHeight = 24;

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 30px Arial";

    ctx.fillText("Score:", 40, 70);
    ctx.fillText(Score, 200, 70);


    ctx.fillStyle = "#FFFF00";
    ctx.font = "bold 20px Arial";

    ctx.fillText("Left Arrow", 40, 110);
    ctx.fillText("Right Arrow", 40, 110 + KeyboardTextHeight);
    ctx.fillText("Up Arrow", 40, 110 + (KeyboardTextHeight * 2));
    ctx.fillText("Down Arrow", 40, 110 + (KeyboardTextHeight * 3));
    ctx.fillText("N", 40, 110 + (KeyboardTextHeight * 4));
    ctx.fillText("M", 40, 110 + (KeyboardTextHeight * 5));

    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("Next", 40, 110 + (KeyboardTextHeight * 8));

    ctx.fillStyle = "#98FB98";

    ctx.fillText("Move Left", 180, 110);
    ctx.fillText("Move Right", 180, 110 + KeyboardTextHeight);
    ctx.fillText("Rotate", 180, 110 + (KeyboardTextHeight * 2));
    ctx.fillText("Accelerate", 180, 110 + (KeyboardTextHeight * 3));
    ctx.fillText("New Game", 180, 110 + (KeyboardTextHeight * 4));
    ctx.fillText("New Game+", 180, 110 + (KeyboardTextHeight * 5));
}


