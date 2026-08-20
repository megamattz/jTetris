// This module contains the guts of the game logic. 

// The falling Tetris block is stores as a string array with 5 elements. Each element within the array
// contains a 5 character string. Each character in the string is a block piece. 
// An x indicates an empty space
// A numeric digit indicates an active block piece. This maps to the block ID to draw. Functionally all block pieces behave the same way 
// and the numers are just to allow for different block colours

// Example Block 

//[0] = x0xxx
//[1] = x0xxx
//[2] = x0xxx
//[3] = x0xxx
//[4] = xxxxx

// The blocks and their rotations are read in from an xml configuration file. 

// Generally when looping through the arrays the loop counter n indicates the y coordinate within the block 
// and the m loop counter indicates the x coordinate within the block 

// Determines if Left Movement is allowed
function CanMoveLeft(xPosArr, yPosArr, pxFallingBlockY, Block, TetrisArea, RotateState)
{
    if (GameOver)
    {
        return false;
    }

    var BlockPositions = Block.blockposition[RotateState];
    var LeftSpace = GetEmptyLeftSpace(xPosArr, Block, 5, RotateState);

    // Check if moving left does not put the block out of bounds
    if ((xPosArr + LeftSpace) <= 0)
    {
        return false;
    }

    // Check moving left does not collide with another block
    for (var n = BlockPositions.blockline.length - 1; n >= 0; n--)
    {
        var BlockLine = BlockPositions.blockline[n];  

        for (var m = 0, len = BlockLine.text.length; m < len; m++)
        {
            var BlockChar = BlockLine.text[m];
            if (isNumeric(BlockChar))
            {
                var yPosToCheck = yPosArr + n;
                var xPosToCheck = xPosArr + m - 1; // - 1 since we are checking the position to the LEFT

                // Prevent an issue were in invalid array element may get checked
                if (yPosToCheck >= TetrisAreaHeight)
                {
                    return false;
                }

                if  (isNumeric(TetrisArea[yPosToCheck][xPosToCheck]))
                {
                    return false;
                }

                // Since yPosArr is rounded up to the nearest 28, if the block is falling
                // midway between two other blocks, force it to wait until it is 90% down 
                var ibx = (pxFallingBlockY / BLOCK_HEIGHT) - yPosArr;

                if ((ibx < -0.1))
                {
                    if (isNumeric(TetrisArea[yPosToCheck - 1][xPosToCheck]))
                    {
                        return false;
                    }
                }
            }            
        }
    }

    return true;
}

// Determines if Right Movement is allowed
function CanMoveRight(xPosArr, yPosArr, pxFallingBlockY, Block, gridWidth, TetrisArea, RotateState)
{

    if (GameOver)
    {
        return false;
    }

    var BottomSpace = GetEmptybottomSpace(Block, 5, RotateState);
    var RightSpace = GetEmptyRightSpace(yPosArr, Block, 5, RotateState);
    var LeftSpace = GetEmptyLeftSpace(xPosArr, Block, 5, RotateState);
    var BlockPositions = Block.blockposition[RotateState];

    if (((xPosArr - RightSpace) + 6) > gridWidth)
    {
        return false;
    }
   
    // Check moving left does not collide with another block

    // number of active blocks
    for (var n = BlockPositions.blockline.length - 1; n >= 0; n--)
    {
        var BlockLine = BlockPositions.blockline[n];   // contains a line of blocks e.g 22xxx

        for (var m = 0, len = BlockLine.text.length; m < len; m++)
        {
            var BlockChar = BlockLine.text[m];
            if (isNumeric(BlockChar))
            {
                var yPosToCheck = yPosArr + n;
                var xPosToCheck = xPosArr + m + 1; // - 1 since we are checking the position to the LEFT

                // Prevent an issue were in invalid array element may get checked
                if (yPosToCheck >= TetrisAreaHeight)
                {
                    return false;
                }

                if (isNumeric(TetrisArea[yPosToCheck][xPosToCheck]))
                {
                    return false;
                }

                var ibx = (pxFallingBlockY / BLOCK_HEIGHT) - yPosArr;

                if ((ibx < -0.1))
                {
                    if (isNumeric(TetrisArea[yPosToCheck - 1][xPosToCheck]))
                    {
                        return false;
                    }
                }
            }
        }
    }

    return true;

}

// The falling block is stored on a 5x5 grid. This function returns the number of empty
// spaces on the left side of the grid
function GetEmptyLeftSpace(xPosArr, Block, gridWidth, RotateState)
{
    var BlockPositions = Block.blockposition[RotateState];
    var FirstBlockLine = 5;

    // Loop through each line of block pieces and find out which one has the longest 
    // number of active blocks
    for (var n = 0; n < BlockPositions.blockline.length; n++)
    {
        var BlockLine = BlockPositions.blockline[n]   // contains a line of blocks e.g 22xxx


        for (var m = 0, len = BlockLine.text.length; m < len; m++)
        {
            var BlockChar = BlockLine.text[m];
            var isBlockActive = isNumeric(BlockChar);

            if (isBlockActive)
            {
                if (m < FirstBlockLine)
                {
                    FirstBlockLine = m;
                }               
                
            }
        }
    }

    return FirstBlockLine;
}

// The falling block is stored on a 5x5 grid. This function returns the number of empty
// spaces on the right side of the grid
function GetEmptyRightSpace(xPosArr, Block, gridWidth, RotateState)
{
    var BlockPositions = Block.blockposition[RotateState];
    var WidestBlockLine = 0;

    // Loop through each line of block pieces and find out which one has the longest 
    // number of active blocks
    for (var n = 0; n < BlockPositions.blockline.length; n++)
    {
        var BlockLine = BlockPositions.blockline[n];   // contains a line of blocks e.g 22xxx

        for (var m = 0, len = BlockLine.text.length; m < len; m++)
        {
            var BlockChar = BlockLine.text[m];
            var isBlockActive = isNumeric(BlockChar);            

            if (isBlockActive && (WidestBlockLine < (m + 1)))
            {
                WidestBlockLine = (m + 1);             
            }
        }
    }

    // the number of empty blocks of the right size will be the total size of the array minus the sidest block
    return gridWidth - WidestBlockLine;
}

// Gets the number of empty spaces on the bottom of the falling block
function GetEmptybottomSpace(Block, gridHeight, RotateState)
{
    var BlockPositions = Block.blockposition[RotateState];

    var BottomSpace = 0;

    // number of active blocks
    for (var n = BlockPositions.blockline.length - 1; n > 0; n--)
    {
        var BlockLine = BlockPositions.blockline[n];   // contains a line of blocks e.g 22xxx

        for (var m = 0, len = BlockLine.text.length; m < len; m++)
        {
            var BlockChar = BlockLine.text[m];
            var isBlockActive = isNumeric(BlockChar);

            if (isBlockActive)
            {
                return BottomSpace;
            }
        }

        BottomSpace = gridHeight - n;
    }

    return BottomSpace;
}

// Checks if a block has landed
function HasLanded(xPosArr, yPosArr, Block, gridWidth, tetrisAreaHeight, TetrisArea, RotateState)
{
    var BlockPositions = Block.blockposition[RotateState];

    var BottomSpace = GetEmptybottomSpace(Block, 5, RotateState);
    var RightSpace = GetEmptyRightSpace(yPosArr, Block, 5, RotateState);
    var LeftSpace = GetEmptyLeftSpace(xPosArr, Block, 5, RotateState);

    // Check if the block has reached the edge of the area
    if (yPosArr + 5 - BottomSpace > TetrisAreaHeight)
    {
        return true;
    }

    // Check of any of the blocks below are filled

    // number of active blocks
    for (var n = BlockPositions.blockline.length - 1; n >= 0; n--)
    {
        var BlockLine = BlockPositions.blockline[n];   // contains a line of blocks e.g 22xxx

        for (var m = 0, len = BlockLine.text.length; m < len; m++)
        {
            var BlockChar = BlockLine.text[m];
            var isBlockActive = isNumeric(BlockChar);

            if (isBlockActive)
            {
                // Check if the block has reached the edge of the area
                var BlockBelowOnGridY = yPosArr + n;
                var BlockBelowOnGridX = xPosArr + m;

                var BlockBelowOnGridChar = TetrisArea[BlockBelowOnGridY][BlockBelowOnGridX];

                if (isNumeric(BlockBelowOnGridChar))
                {
                    return true;
                }             
            }
        }       
    }

    return false;
}


// Peforms an AJAX call to load the blocks from an external file. This allows for new block types to 
// be added mroe easily
function loadBlocks(BlocksFile)
{
    var BlockData = null;

    $.ajax({
        async: false,
        type: 'GET',
        url: BlocksFile,
        dataType: 'text',
        success: function (data)
        {
            BlockData = parseBlockData(data);
        },
        error: function (xhr, ajaxOptions, thrownError)
        {
            var Message = "Failed on ajax call to get " + BlocksFile + "\n"
                + "This project needs to be run from a web server. \n\n" +
                "Error message: " + thrownError;
            alert(Message);
        }
    });

    return BlockData;
}

// Randomly selects a new block index from the list
function getNextBlock(blockData)
{

    var BlockIndex = getRandomInt(0, blockData.block.length - 1);
    return blockData.block[BlockIndex];
}

// Parses the blocks file into an array of block objects
function parseBlockData(blockData)
{
    var BlockData = $.xml2json(blockData, true);

    var tmp = JSON.stringify(BlockData);

    TetrisAreaWidth = parseInt(BlockData.tetrisareaidth[0].text);
    TetrisAreaHeight = parseInt(BlockData.tetrisareaheight[0].text);


    return BlockData;
}

// Places the falling block onto the Tetris grid
function Placeblock(TetrisArea, TetrisAreaXPos, TetrisAreaYPos, Block, RotateState)
{
    // if FallingBlockYPos it means the game is over so don't allow any mroe block to be placed
    if (FallingBlockYPos <= 0)
    {
        return;
    }

    var BlockPos = Block.blockposition[RotateState];

    var FallingBlockXPos = TetrisAreaXPos;
    var FallingBlockYPos = TetrisAreaYPos - 1;


    var BottomSpace = GetEmptybottomSpace(Block, 5, RotateState);
    var RightSpace = GetEmptyRightSpace(FallingBlockXPos, Block, 5, RotateState);
    var LeftSpace = GetEmptyLeftSpace(FallingBlockXPos, Block, 5, RotateState);

    for (var n = 0; n < BlockPos.blockline.length - BottomSpace; n++)
    {
        var Block = "";

        var BlockLine = BlockPos.blockline[n];

        for (var m = LeftSpace, len = BlockLine.text.length - RightSpace; m < len; m++)
        {
            var BlockChar = BlockLine.text[m];

            if (isNumeric(BlockChar))
            {
                TetrisArea = SetTetrisAreaPiece(TetrisArea, BlockChar, m + FallingBlockXPos, n + FallingBlockYPos);
            }

        }
    }

    return TetrisArea;
}

// Tetris has a concept of "wall kicking". This basically means if a block cannot be rotated normally however a move to the left of right
// would make the rotation valid then the block should autiomatically be moved left or right and then rotated.

// This function returns a numeric value if wall kicking with the offset that would make the rotation permissable. If rotation 
// is still not permissable even with wall kicking then an x is returned
function CanRotateWithWallkick(TetrisArea, TetrisAreaXPos, TetrisAreaYPos, Block, RotateState)
{

    if (GameOver)
    {
        return 'x';
    }

    if (CanRotate(TetrisArea, TetrisAreaXPos, TetrisAreaYPos, Block, RotateState))
    {
        return 0;
    }

    if (CanRotate(TetrisArea, TetrisAreaXPos + 1, TetrisAreaYPos, Block, RotateState))
    {
        return 1;
    }

    if (CanRotate(TetrisArea, TetrisAreaXPos - 1, TetrisAreaYPos, Block, RotateState))
    {
        return -1;
    }

    if (CanRotate(TetrisArea, TetrisAreaXPos + 2, TetrisAreaYPos, Block, RotateState))
    {
        return 2;
    }

    if (CanRotate(TetrisArea, TetrisAreaXPos - 2, TetrisAreaYPos, Block, RotateState))
    {
        return -2;
    }

    return "x";
}

// Checks if rotation is possible
function CanRotate(TetrisArea, TetrisAreaXPos, TetrisAreaYPos, Block, RotateState)
{
    var BottomSpace = GetEmptybottomSpace(Block, 5, RotateState);
    var RightSpace = GetEmptyRightSpace(TetrisAreaXPos, Block, 5, RotateState);
    var LeftSpace = GetEmptyLeftSpace(TetrisAreaXPos, Block, 5, RotateState);

    // Get what the new rotate state will be
    var NewRotateState = GetNextRotationState(Block, RotateState);

    // Get the new empty space once the block is rotated
    var NewBottomSpace = GetEmptybottomSpace(Block, 5, NewRotateState);
    var NewRightSpace = GetEmptyRightSpace(TetrisAreaXPos, Block, 5, NewRotateState);
    var NewLeftSpace = GetEmptyLeftSpace(TetrisAreaXPos, Block, 5, NewRotateState);

    // check if the rotation would cause the block to go outside the boundary
    if ((NewLeftSpace + TetrisAreaXPos) < 0)
    {
        return false;
    }

    if ((TetrisAreaXPos + (5 - NewRightSpace) > TetrisAreaWidth))
    {
        return false;
    }

    BlockPos = Block.blockposition[NewRotateState];

    // check if the rotation would overlap another already placed block
    for (var n = 0; n < BlockPos.blockline.length - NewBottomSpace; n++)
    {
        var Block = "";

        var BlockLine = BlockPos.blockline[n];

        for (var m = NewLeftSpace, len = BlockLine.text.length - NewRightSpace; m < len; m++)
        {
            var BlockChar = BlockLine.text[m];

            if (isNumeric(BlockChar))
            {
                var xPosOnTetrisGrid = TetrisAreaXPos + m;
                var yPosOnTetrisGrid = TetrisAreaYPos + n;
                              
                if (isNumeric(TetrisArea[yPosOnTetrisGrid][xPosOnTetrisGrid]))
                {
                    return false;
                }               
            }
        }
    }

    return true;

}

// Get the next state of rotation. Different block types may have 1,2 or 4 rotate states. 
function GetNextRotationState(Block, RotateState)
{
    var NewRotateState = -1;

    if (RotateState >= Block.blockposition.length - 1)
    {
        NewRotateState = 0;
    }
    else
    {
        NewRotateState = RotateState + 1;
    }

    RotateState = NewRotateState;

    return NewRotateState;
}

// Sets an indiviual block piece on the tetris area
function SetTetrisAreaPiece(TetrisArea, BlockNo, x, y)
{
    // Game over
    if (y <= -1)
    {
        GameOver = true;
        return TetrisArea;
    }

    var TetrisAreaLine = TetrisArea[y];
    var TetrisAreaLineNew = "";

    for (var m = 0, len = TetrisAreaLine.length; m < len; m++)
    {
        if (m != x)
        {
            TetrisAreaLineNew = TetrisAreaLineNew + TetrisAreaLine[m];
        }
        else
        {
            TetrisAreaLineNew = TetrisAreaLineNew + BlockNo;
        }
    }

    TetrisArea[y] = TetrisAreaLineNew;

    return TetrisArea;
}

// Checks if a complete line has been made
function CheckLine(TetrisArea, y)
{
    var LineHasEmptyPieces = false;

    for (var m = 0, len = TetrisArea[y].length; m < len; m++)
    {
        if (!isNumeric(TetrisArea[y][m]))
        {
            LineHasEmptyPieces = true;
        }
    }

    return !LineHasEmptyPieces;
}

// Shifts the blocks downwards from the y position (i.e after a line has been scored)
function ShiftDown(TetrisArea, y)
{
    for (var n = y ; n > 0; n--)
    {
        TetrisArea[n] = TetrisArea[n - 1]
    }
    
    TetrisArea[0] = GetEmptyTetrisAreaRow();

    drawTetrisGrid(ctxTetrisGrid, blockImage,
          TetrisGrid, TetrisAreaXMargin, TetrisAreaYMargin, Score, objNextBlock);
}