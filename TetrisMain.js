
var BLOCK_WIDTH = 28;
var BLOCK_HEIGHT = 28;

var FPS = 30;

// Keycode constants
var LEFT_KEY = 37;
var UP_KEY = 38;
var DOWN_KEY = 40;
var RIGHT_KEY = 39;
var N_KEY = 78;
var M_KEY = 77;

var DownSpeedIncrease = 8;

var TetrisAreaWidth = 10;
var TetrisAreaHeight = 20;

var GameOver = false;

var isDownKeyPressed = false;

var pxFallingBlockY = 0; // The Y Position of the falling block in pixels. This must be rounded to the nearest 28 and devided by 28 to get the array position
var pxFallingBlockX = 0; // The X Position of the falling block in pixels. This must be rounded to the nearest 28 to get the array position

var objFallingBlock = null; // This object stores an array which contains the falling block.
var objNextBlock = null; // This stores the block following the current one. Most tetris games allow the user to see whats comming

var TetrisGrid = null; // The array which stores the tetris grid for the blocks which have already landed
var BlockRotateState = 0; // Stores the rotation state of the block. This is mapped to the array index from the <blockposition> node in the blocks xml configuration file
var BlockFallingSpeed = 2; // Stores the speed at which the blocks fall down

var BlocksData = null; // Stores the blocks data configuration loaded from the xml file

var TetrisAreaXMargin = 310;
var TetrisAreaYMargin = 50;

var Score = 0;

var ctxBackground = null;
var ctxTetrisGrid = null;
var ctxFallingblock = null;

var CANVAS_WIDTH = 700;
var CANVAS_HEIGHT = 700;

var blockImage = null;

var NextBlock = null;



function main(cBlockInfo)
{

    // The New Game and New Game+ buttons are provided only for mobile devices 
    // as they don't generally have a phyical keyboard and it would otherwise be impossible to
    // start a new game.
    if (!isMobile())
    {
        var NKeyButton = document.getElementById("NKeyButton");
        var MKeyButton = document.getElementById("MKeyButton");

        NKeyButton.hidden = true;
        MKeyButton.hidden = true;        
    }

    blockImage = new Image();
    blockImage.src = "images/blocks.png";

    // Ensure the blocks image has loaded into memory before beginning
    blockImage.onload = function ()
    {
        Init(CANVAS_WIDTH, CANVAS_HEIGHT, cBlockInfo);
    }   
}

function Init(cWidth, cHeight, cBlockInfo)
{
    // Get Canvas element
    var canvasBackGround = document.getElementById('cvbackGround');
    var cvTetrisGrid = document.getElementById('cvTetrisGrid');
    var cvFallingBlock = document.getElementById('cvFallingBlock');

    try
    {
        // Try to grab the standard context. If it fails, fallback to experimental.
        ctxBackground = canvasBackGround.getContext("2d");
        ctxTetrisGrid = cvTetrisGrid.getContext("2d");
        ctxFallingblock = cvFallingBlock.getContext("2d");
    }
    catch (e)
    {
        console.log("Failed to get 2d context");
        console.log(e.message);
    }

    BlocksData = loadBlocks('normalblocks.xml');
    StartGame();

    setInterval(function ()
    {

        drawFallingBlock(ctxFallingblock, blockImage, objFallingBlock, TetrisGrid, TetrisAreaXMargin, TetrisAreaYMargin, Score);

        update();

    }, 1000 / FPS);


    $(document.body).on('dblclick', function (e)
    {
        e.preventDefault(); // Prevent double tap from zooming in on mobile devices as it could be distruptive to gameplay

        UpKey();
    });

    $(document.body).on('keydown', function (e)
    {
        switch (e.which)
        {
            case UP_KEY:

                e.preventDefault(); // prevent the broswer from scrolling up or down
                UpKey();

                break;

            case LEFT_KEY:

                e.preventDefault(); // prevent the broswer from scrolling up or down
                LeftKey();

                break;

            case RIGHT_KEY:

                e.preventDefault(); // prevent the broswer from scrolling up or down
                RightKey();
                break;

            case DOWN_KEY:

                e.preventDefault(); // prevent the broswer from scrolling up or down
                isDownKeyPressed = true;
                break;

            case N_KEY:

                e.preventDefault(); // prevent the broswer from scrolling up or down

                NKey();   
                break;

            case M_KEY:

                e.preventDefault(); // prevent the broswer from scrolling up or down
                MKey();
                break;
        }
    });

    $(document.body).on('keyup', function (e)
    {
        switch (e.which)
        {
            // key code for left arrow
            case 40:
                isDownKeyPressed = false;
                break;
        }
    });
}



$(function ()
{
    // Provide basic support for mobile devices swiping.
    $("#cvbackGround").swipe({

        swipe: function (event, direction, distance, duration, fingerCount, fingerData)
        {            

            if (direction == "left")
            {
                LeftKey();

                if (distance > 300)
                {
                    LeftKey();
                }
            }
            else if (direction == "right")
            {
                RightKey();

                if (distance > 300)
                {
                    RightKey();
                }
            }
            else if (direction == "up")
            {
                UpKey();
            }
            else if (direction == "down")
            {
                isDownKeyPressed = true; // emulate holding down the arrow key until the block lands
            }
        
        },
        threshold: 0
    });


});

function MKey()
{
    BlocksData = loadBlocks('wierdblocks.xml');

    StartGame();


    // Redraw in case the grid size has changed
    drawBackGround(ctxBackground, TetrisGrid, TetrisAreaXMargin, TetrisAreaYMargin, Score);

    drawTetrisGrid(ctxTetrisGrid, blockImage,
    TetrisGrid, TetrisAreaXMargin, TetrisAreaYMargin, Score, objNextBlock);
}

function NKey()
{
    BlocksData = loadBlocks('normalblocks.xml');

    StartGame();

    // Redraw in case the grid size has changed
    drawBackGround(ctxBackground, TetrisGrid, TetrisAreaXMargin, TetrisAreaYMargin, Score);

    drawTetrisGrid(ctxTetrisGrid, blockImage,
    TetrisGrid, TetrisAreaXMargin, TetrisAreaYMargin, Score, objNextBlock);
}

function UpKey()
{
    if (CanRotate(TetrisGrid, pxFallingBlockX / BLOCK_WIDTH, GetNearest(pxFallingBlockY) / BLOCK_HEIGHT, objFallingBlock, BlockRotateState))
    {
        BlockRotateState = GetNextRotationState(objFallingBlock, BlockRotateState);
    }
    else
    {
        // If rotation would be allowed with a wall kick, then move the x position by that amount and peform the rotation
        var WallKick = CanRotateWithWallkick(TetrisGrid, pxFallingBlockX / BLOCK_WIDTH,
            GetNearest(pxFallingBlockY) / BLOCK_HEIGHT, objFallingBlock, BlockRotateState);

        if (isNumeric(WallKick))
        {
            pxFallingBlockX = pxFallingBlockX + (WallKick * BLOCK_WIDTH);
            BlockRotateState = GetNextRotationState(objFallingBlock, BlockRotateState);
        }
    }
}

function LeftKey()
{
    if (CanMoveLeft(pxFallingBlockX / BLOCK_WIDTH, GetNearest(pxFallingBlockY) / BLOCK_HEIGHT, pxFallingBlockY,
                 objFallingBlock, TetrisGrid, BlockRotateState))
    {
        pxFallingBlockX = pxFallingBlockX - BLOCK_WIDTH;
    }
}

function RightKey()
{
    if (CanMoveRight(pxFallingBlockX / BLOCK_WIDTH, GetNearest(pxFallingBlockY) / BLOCK_HEIGHT, pxFallingBlockY,
                objFallingBlock, TetrisAreaWidth, TetrisGrid, BlockRotateState))
    {
        pxFallingBlockX = pxFallingBlockX + BLOCK_WIDTH;
    }
}


function NewBlock()
{
      
    // On the first run the next block will be null
    if (objNextBlock == null || objNextBlock == undefined)
    {
        objNextBlock = getNextBlock(BlocksData);
    }

    // Since the player can see what's comming objFallingBlock stores the block which is falling
    // while objNextBlock stores the block which will appear next
    objFallingBlock = jQuery.extend({}, objNextBlock); 
    objNextBlock = getNextBlock(BlocksData);

    isDownKeyPressed = false;

    BlockRotateState = 0;

    pxFallingBlockY = 0;
    pxFallingBlockX = StartingBlockX();;

    // Redraw the background so the score is updated
    drawTetrisGrid(ctxTetrisGrid, blockImage,
          TetrisGrid, TetrisAreaXMargin, TetrisAreaYMargin, Score, objNextBlock);
}

// Checks if the player has scored a row and increments the score if so
function CheckCompleteRow()
{
    var NumRowsComplete = 0;


    for (var n = 0; n < TetrisGrid.length; n++)
    {
        if (CheckLine(TetrisGrid, n))
        {
            NumRowsComplete = NumRowsComplete + 1;
            TetrisGrid[n] = GetEmptyTetrisAreaRow();
            ShiftDown(TetrisGrid, n);
        }
    }

    if (NumRowsComplete == 1)
    {
        Score = Score + 10;
    }
    else if (NumRowsComplete == 2)
    {
        Score = Score + 40;
    }
    else if (NumRowsComplete == 3)
    {
        Score = Score + 80;
    }
    else if (NumRowsComplete == 4)
    {
        Score = Score + 200;
    }
    else if (NumRowsComplete == 5)
    {
        Score = Score + 1000;
    }

    // Make the blocks fall faster when the score gets higher
    BlockFallingSpeed = 1 + Math.round(Score / 150);

    // Redraw the background so the score is updated
    drawBackGround(ctxBackground, TetrisGrid, TetrisAreaXMargin, TetrisAreaYMargin, Score);
}

// Restarts the game
function StartGame()
{
    SetupTetrisArea();
    BlockRotateState = 0;
    BlockFallingSpeed = 1;
    pxFallingBlockY = 0;
    
    Score = 0;

    GameOver = false;
    isDownKeyPressed = false;

    drawBackGround(ctxBackground, 
        TetrisGrid, TetrisAreaXMargin, TetrisAreaYMargin, Score);

    NewBlock();
    NewBlock();
}

// Gets the ideal starting block where it should fall down from
function StartingBlockX()
{
    var XPos = (parseInt(Math.round(TetrisAreaWidth / 2)) - 2) * BLOCK_WIDTH;

    return XPos;

}

function update() 
{
    if (GameOver)
    {
        return;
    }

    var HasblockLanded = HasLanded(pxFallingBlockX / BLOCK_WIDTH,
        GetNearest(pxFallingBlockY) / BLOCK_HEIGHT,
       objFallingBlock,
        5,
        TetrisAreaHeight,
        TetrisGrid,
        BlockRotateState);


    if (!HasblockLanded)
    {
        if (isDownKeyPressed)
        {
            pxFallingBlockY = pxFallingBlockY + BlockFallingSpeed + DownSpeedIncrease;
        }
        else
        {
            pxFallingBlockY = pxFallingBlockY + BlockFallingSpeed;
        }        
    }
    else
    {
        TetrisGrid = Placeblock(TetrisGrid, pxFallingBlockX / BLOCK_WIDTH,
            GetNearest(pxFallingBlockY) / BLOCK_HEIGHT, objFallingBlock, BlockRotateState);


        CheckCompleteRow();

        drawTetrisGrid(ctxTetrisGrid, blockImage,
            TetrisGrid, TetrisAreaXMargin, TetrisAreaYMargin, Score, objNextBlock)

        NewBlock();
    }
}

// Returns a new row of 'x's which is the width of the Tetris grid. 
function GetEmptyTetrisAreaRow()
{
    var EmptyLine = "";

    for (var m = 0; m < TetrisAreaWidth; m++)
    {
        EmptyLine = EmptyLine + "x";
    }

    return EmptyLine;
}

// Sets up the a new empty Tetris grid 
function SetupTetrisArea()
{
    TetrisGrid = [];

    for (var n = 0; n < TetrisAreaHeight; n++)
    {
        TetrisGrid.push(GetEmptyTetrisAreaRow());
    }
}






   
    
