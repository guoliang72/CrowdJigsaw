var requrl = window.location.protocol + '//' + window.location.host + '/';
var loadReady = false;
var socket = io.connect(requrl);

$('#undo_help').css('display', 'none');
$('#guess_menu').css('display', 'none');
$('#share_menu').css('display', 'none');
$('#addon_menu').css('display', 'none');

var undoStep = -1;
$('#undo_button').css('display', 'none');

$(document).ready(function () {
    loadReady = true;
});
$("#loading").fadeOut();

/*
* Drawer functions
*/
$('.zoomIn').click(function () {
    puzzle.zoom(.1);
});

$('.zoomOut').click(function () {
    puzzle.zoom(-.1);
});

// $('.help').mousedown(function () {
//     puzzle.showLastResult();
// });

$('.restart').click(function () {
    // document.execCommand('Refresh');
    window.location.reload();
    // var puzzle = new JigsawPuzzle(config);
});


$('#quit_button').on('click', function (event) {
    $('#quitLabel').text('Are You Sure to Quit?');
    $('#ensure_quit_dialog').modal({
        keyboard: true
    });
});

$('#zoomin_button').on('click', function () {
    puzzle.zoom(.1);
});

$('#zoomout_button').on('click', function () {
    puzzle.zoom(-.1);
});


$('#center_button').on('click', function () {
    puzzle.focusToCenter();
});

$('#help_button').on('click', function (event) {
    puzzle.askHelp();
});

$('.menu_png img').mousedown(function () {
    $(this).css("background-color", "rgba(200, 200, 200, 0.9)")
});

$('.menu_png img').mouseup(function () {
    $(this).css("background-color", "rgba(200, 200, 200, 0)")
});

$('.menu_png img').mouseover(function () {
    $(this).css("background-color", "rgba(200, 200, 200, 0.9)")
});

$('.menu_png img').mouseout(function () {
    $(this).css("background-color", "rgba(200, 200, 200, 0)")
});



var hintedLinksNum = undefined;
var totalHintsNum = 0;
var correctHintsNum = 0;
var tilePoint = undefined;
var someonelock = -1;
var backConflictTile = new Array();
// document.querySelector('#show_steps').addEventListener('click', function () {
//     $('#steps').fadeToggle('slow');
// });
// document.querySelector('#show_timer').addEventListener('click', function () {
//     $('#timer').fadeToggle('slow');
// });

/*
* Jigsaw functions
*/
Array.prototype.remove = function (start, end) {
    this.splice(start, end);
    return this;
}

view.currentScroll = new Point(0, 0);
var scrollVector = new Point(0, 0);
var scrollMargin = 32;

var imgWidth = $('.puzzle-image').css('width').replace('px', '');
var imgHeight = $('.puzzle-image').css('height').replace('px', '');

if (level == 3) {
    tileWidth = 32;
}
if (level == 4) {
    imgWidth = 1024;
    imgHeight = 1024;
}

var config = ({
    zoomScaleOnDrag: 1.25,
    imgName: 'puzzle-image',
    tileShape: 'straight', // curved or straight or voronoi
    tileWidth: tileWidth,
    showHints: true,
    shadowWidth: 120,
    dragMode: 'tile-First',// tile-First or group-First
    allowOverlap: false //whether allows overLap
});

var directions = [
    new Point(0, -1),
    new Point(1, 0),
    new Point(0, 1),
    new Point(-1, 0)
];

var oppositiveEdges = [2, 3, 0, 1]; // 0(up)<->2(bottom), 1(right)<->3(left) 
/**
 * Start building the puzzle
 */
if (roundShape == 'square') {
    config.tileShape = 'straight';
}
else {
    config.tileShape = 'curved';
}

if (level == 1) {
    config.level = 1;
    //config others here
} else if (level == 2) {
    config.level = 2;
    //config others here    
}

var puzzle = new JigsawPuzzle(config);
/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent) ? puzzle.zoom(-0.5) : puzzle.zoom(-0.1);

var time = 0;
var t;
//var startTime = (new Date()).getTime(); //compute from when the user ready
var startTime = serverStartTime; //compute from when the round start at server-side
function timedCount() {
    time = Math.floor(((new Date()).getTime() - startTime) / 1000);
    var hours = Math.floor(time / 3600);
    var minutes = Math.floor((time - hours * 3600) / 60);
    var seconds = time - hours * 3600 - minutes * 60;
    if (hours >= 0 && hours <= 9) hours = '0' + hours;
    if (minutes >= 0 && minutes <= 9) minutes = '0' + minutes;
    if (seconds >= 0 && seconds <= 9) seconds = '0' + seconds;
    document.getElementById('timer').innerHTML = hours + ":" + minutes + ":" + seconds;
    t = setTimeout(timedCount, 1000);
}

if (puzzle)
    timedCount();

// $('#myselect').change(function () {
//     if (puzzle) {
//         if (this.value == "DragTileFirst") {
//             puzzle.dragMode = "tile-First";
//         }
//         else {
//             puzzle.dragMode = "group-First";
//         }
//     }
// });


var path;
var movePath = false;
var globalSelectedIndexs = new Array();
$('.puzzle-image').css('margin', '-' + imgHeight / 2 + 'px 0 0 -' + imgWidth / 2 + 'px');

var downTime, alreadyDragged, dragTime, draggingGroup;
var mousedowned = false;
var timeoutFunction;
function sleep(numberMillis){
        var now = new Date(); 
        var exitTime = now.getTime() + numberMillis; 
        while (true) { 
            now = new Date(); 
            if (now.getTime() > exitTime) 
            return;
        }
    }
window.alert = function(str) {
           if(document.querySelectorAll("div.shieldClass").length!=0){
            return false;
           }
            //  遮罩层
            var shield = document.createElement("DIV");
            shield.className = "shieldClass";
            shield.id = "shield";
            shield.style.position = "absolute";
            shield.style.left = "0px";
            shield.style.top = "0px";
            shield.style.width = "100%";
            shield.style.height = "100%";
            //弹出对话框时的背景颜色
            shield.style.background = "#111";
            shield.style.textAlign = "center";
            shield.style.zIndex = "25000";
            shield.style.opacity = "0.4";
            //背景透明 IE有效
            var alertFram = document.createElement("DIV");
            alertFram.className = "alertFramClass";
            alertFram.id = "alertFram";
            alertFram.style.position = "absolute";
            alertFram.style.left = "50%";
            alertFram.style.top = "40%";
            alertFram.style.background = "rgba(0,0,0,0.7)";
            alertFram.style.textAlign = "center";
            alertFram.style.zIndex = "25001";
            alertFram.style.borderRadius="6px";
            strHtml = "<p style='text-align:center;padding:15px 15px;font-size:12px;font-weight: normal;color:#fff'>" + str +"</p>"
            alertFram.innerHTML = strHtml;
            document.body.appendChild(alertFram);
            document.body.appendChild(shield);
            var o = document.getElementById("alertFram");
            var body=document.getElementsByTagName("body")[0]
            var w = o.offsetWidth; //宽度
                o.style.marginLeft="-"+w/2+"px";
            setTimeout(function(){
                var shieldDom=document.querySelectorAll("div.shieldClass");  
                var alertFramDom=document.querySelectorAll("div.alertFramClass");  
               for(var i=0;i<shieldDom.length;i++){
                 body.removeChild(shieldDom[i]);
               };
               for(var j=0;j<alertFramDom.length;j++){
                 body.removeChild(alertFramDom[j]);
              };
            },1000);
           
}
function onMouseDown(event) {
    console.log("onMouseDown player_name:",player_name);
    console.log("onMouseDown someonelock:",someonelock);
    var puzzle_selectTile = puzzle.findSelectTileAndLocked(event.point);
    tilePoint = event.point;

}



function onFrame(event) {
    // Each frame, rotate the path by 3 degrees:
    puzzle.animation();
}

function onMouseUp(event) {
    console.log("onMouseUp");
    console.log("onMouseUp event.point:",event.point);
    
    if (timeoutFunction) {
        clearTimeout(timeoutFunction);
    }
    // puzzle.releaseTile();  
    // mousedowned = false;
    console.log("onMouseUp username:",player_name);
    socket.emit('tileRelease',{round_id: roundID,username: player_name,selected_tiles:globalSelectedIndexs});
    globalSelectedIndexs.length = 0;
}


function onMouseDrag(event) {
    if(someonelock == 1){
        return;
    }
    mousedowned = true;
    if (timeoutFunction) {
        clearTimeout(timeoutFunction);
    }
    puzzle.dragTile(event.delta);
    
}

$(window).bind('mousewheel', function (e) {
    if (e.originalEvent.wheelDelta > 0) {
        puzzle.zoom(.1);
    }
    else {
        puzzle.zoom(-.1);
    }
});

function onKeyDown(event) {
    if (event.event.ctrlKey && event.key == "z") {
        // undo a step
        if (puzzle.steps != undoStep) {
            puzzle.undoNextStep();
        }
    }
}

function onKeyUp(event) {
    switch (event.key) {
        case 'z':
            puzzle.zoom(.1);
            break;
        case 'x':
            puzzle.zoom(-.1);
            break;
    }
}

function getOriginImage(config) {
    var raster = undefined;
    if (config.level == 4) {
        var path = new Path.Rectangle(new Point(0, 0), new Size(config.imgWidth, config.imgHeight));
        path.fillColor = config.imgName;
        raster = path.rasterize();
        path.remove();
    }
    else {
        raster = new Raster(config.imgName);
        if (originSize) {
            imageWidth = raster.size.width;
            imageHeight = raster.size.height;
            tilesPerRow = Math.floor(imageWidth / tileWidth);
            tilesPerColumn = Math.floor(imageHeight / tileWidth);
            console.log(imageWidth, tilesPerRow);
            console.log(imageHeight, tilesPerColumn);
        }
        else {
            raster.setSize(imageWidth, imageHeight);
        }
    }
    return raster;
}

function JigsawPuzzle(config) {

    socket.on('someoneSolved', function (data) {
        if (data.round_id == roundID) {
            $.amaran({
                'title': 'someoneSolved',
                'message': data.player_name + ' has solved the puzzle!',
                'inEffect': 'slideRight',
                'cssanimationOut': 'zoomOutUp',
                'position': "top right",
                'delay': 3000,
                'closeOnClick': true,
                'closeButton': true
            });
        }
    });

    this.forceLeace = function(text)
    {
        $('#cancel-button').attr('disabled',"true");

        $('#quitLabel').text(text);
        $('#ensure_quit_dialog').modal({
            keyboard: false,
            backdrop: false
        });
    }
    ////
    socket.on('forceLeave', function (data) {
        if (data.round_id == roundID) {
            instance.forceLeace('Three Players Have Finished the Puzzle. Please Quit.');
        }
    });

    socket.on('gameSaved', function (data) {
        if (data.success == true && data.round_id == roundID) {
            console.log("Saved.");
        } else {
            console.log(data.err);
        }
    });
   
    socket.on('roundChanged', function (data) {
        console.log(data);
        if (data.username == player_name && data.round_id == roundID) {
            if(data.action == "quit"){
                if(players_num == 1){
                    window.location = '/home';
                }
                else{
                    window.location = '/roundrank/' + roundID;
                }
            }
            else {
                //$('.rating-body').css('display', 'inline');
                $('#apply-button').removeAttr('disabled');
                $('#submit-button').removeAttr('disabled');
                $('#cancel-button').removeAttr('disabled');
            }
            
        }
    });

    socket.on('roundPlayersChanged', function (data) {
        console.log(data);
        if (data.username == player_name && data.round_id == roundID) {
            if(data.action == "quit"){
                if(players_num == 1){
                    window.location = '/home';
                }
                else{
                    window.location = '/roundrank/' + roundID;
                }
            }
            else {
                //$('.rating-body').css('display', 'inline');
                $('#apply-button').removeAttr('disabled');
                $('#submit-button').removeAttr('disabled');
                $('#cancel-button').removeAttr('disabled');
            }
            
        }
    });

    var instance = this; // the current object(which calls the function)
    this.tileShape = config.tileShape;
    this.level = config.level;

    this.currentZoom = 1;
    this.zoomScaleOnDrag = config.zoomScaleOnDrag;
    this.imgName = config.imgName;
    this.shadowWidth = config.shadowWidth;
    this.tileWidth = config.tileWidth;
    this.originImage = getOriginImage(config);
    this.imgSize = this.originImage.size;
    this.imgWidth = imageWidth;
    this.imgHeight = imageHeight;
    this.tilesPerRow = tilesPerRow;
    this.tilesPerColumn = tilesPerColumn,
        this.puzzleImage = this.originImage.getSubRaster(new Rectangle(0, 0, this.tilesPerRow * this.tileWidth, this.tilesPerColumn * this.tileWidth));
    this.puzzleImage.size *= Math.max((this.tileWidth / 2) / this.puzzleImage.size.width,
        (this.tileWidth / 2) / this.puzzleImage.size.height) + 1
    this.puzzleImage.position = view.center;

    this.originImage.visible = false;
    this.puzzleImage.visible = false;

    this.dragMode = config.dragMode;

    this.showHints = config.showHints;

    this.tilesNum = this.tilesPerRow * this.tilesPerColumn;

    if (this.tileShape == "voronoi") {
        this.tileMarginWidth = this.tileWidth * 0.5;
    }
    else {
        this.tileMarginWidth = this.tileWidth * ((100 / this.tileWidth - 1) / 2);
    }
    this.selectedTile = undefined;
    this.selectedGroup = undefined;

    this.saveShapeArray = shapeArray;
    this.saveTilePositions = undefined;
    this.saveHintedLinks = undefined;
    this.shapeArray = undefined;
    this.tiles = undefined;
    this.edgesKept = undefined;
    this.edgesDropped = undefined;
    this.groups = undefined; // a connected subgraph as a group
    this.sizes = undefined; // number of edges as the size
    this.askHelpTimeout = undefined; // time past since last action
    this.lastStepTime = 0;
    this.thisStepTime = 0;
    this.linksChangedCount = 0;

    this.dfsGraphLinksMap = new Array();
    this.subGraphData = new Array();
    this.removeLinksData = new Array();
    this.subGraphNodesCount = 0;

    this.hintsShowing = false;
    this.undoing = false;
    this.draging = false;

    this.shadowScale = 1.5;

    this.steps = 0;
    this.realSteps = 0;
    this.realStepsCounted = false;

    this.gameStarted = false;

    this.allowOverlap = config.allowOverlap;

    this.gameFinished = false;

    this.maxSubGraphSize = 0;

    this.unsureHintsColor = ["red"];
    this.colorBorderWidth = 10;

    this.hintedTilesMap = new Array();

    this.hintAroundTilesMap = new Array();

    this.getHintsArray = new Array();

    this.multiHintsMap = {};

    $.amaran({
        'title': 'startRound',
        'message': 'Round ' + roundID + ': ' + this.tilesPerRow + ' * ' + this.tilesPerColumn,
        'inEffect': 'slideRight',
        'cssanimationOut': 'zoomOutUp',
        'position': "top right",
        'delay': 2000,
        'closeOnClick': true,
        'closeButton': true
    });
    console.log('Round ' + roundID + ': ' + this.tilesPerRow + ' * ' + this.tilesPerColumn);

    loadGame();
    this.alert = function(str) {
           if(document.querySelectorAll("div.shieldClass").length!=0){
            return false;
           }
            //  遮罩层
            var shield = document.createElement("DIV");
            shield.className = "shieldClass";
            shield.id = "shield";
            shield.style.position = "absolute";
            shield.style.left = "0px";
            shield.style.top = "0px";
            shield.style.width = "100%";
            shield.style.height = "100%";
            //弹出对话框时的背景颜色
            shield.style.background = "#111";
            shield.style.textAlign = "center";
            shield.style.zIndex = "25000";
            shield.style.opacity = "0.4";
            //背景透明 IE有效
            var alertFram = document.createElement("DIV");
            alertFram.className = "alertFramClass";
            alertFram.id = "alertFram";
            alertFram.style.position = "absolute";
            alertFram.style.left = "50%";
            alertFram.style.top = "40%";
            alertFram.style.background = "rgba(0,0,0,0.7)";
            alertFram.style.textAlign = "center";
            alertFram.style.zIndex = "25001";
            alertFram.style.borderRadius="6px";
            strHtml = "<p style='text-align:center;padding:15px 15px;font-size:12px;font-weight: normal;color:#fff'>" + str +"</p>"
            alertFram.innerHTML = strHtml;
            document.body.appendChild(alertFram);
            document.body.appendChild(shield);
            var o = document.getElementById("alertFram");
            var body=document.getElementsByTagName("body")[0]
            var w = o.offsetWidth; //宽度
                o.style.marginLeft="-"+w/2+"px";
            setTimeout(function(){
                var shieldDom=document.querySelectorAll("div.shieldClass");  
                var alertFramDom=document.querySelectorAll("div.alertFramClass");  
               for(var i=0;i<shieldDom.length;i++){
                 body.removeChild(shieldDom[i]);
               };
               for(var j=0;j<alertFramDom.length;j++){
                 body.removeChild(alertFramDom[j]);
              };
            },1000);
           
}
    this.findSelectTileAndLocked = function(point) {
        var cellPosition = new Point(
            Math.round(point.x / instance.tileWidth),//returns int closest to arg
            Math.round(point.y / instance.tileWidth));
        var hitResult = project.hitTest(point);
        if (!hitResult || hitResult.type != "pixel") {
            instance.selectedTile = null;
            return;
        }
        var img = hitResult.item;
        var tile = img.parent.parent;
        // console.log(tile.name);
        if (tile.picking) {
            instance.selectedTile = null;
            return;
        }
        if (tile && tile.name) {
            instance.selectedTile = new Array();
            if (instance.dragMode == "tile-First") {
                instance.selectedTile.push(tile);
            }
            else {
                DFSTiles(tile, instance.selectedTile, new Point(0, 0));
            }
        }
        else {
            instance.selectedTile = null;
        }
        var selectedTileIndexes = new Array();
        if(instance.selectedTile != null){

            for (var i = 0; i < instance.selectedTile.length; i++) {
                selectedTileIndexes.push(getTileIndex(instance.selectedTile[i]));
            }
        }
        socket.emit('tileSelect',{round_id: roundID,username: player_name,selected_tiles:selectedTileIndexes});
        instance.tileSelectTimeout = setTimeout(function () {
            clearTimeout(instance.tileSelectTimeout);
            instance.tileSelectTimeout = null;
        }, 500);
        instance.selectedTile.length=0;
        return selectedTileIndexes;
    }
    function createAndPlaceTiles(needIntro) {
        
        if (instance.tileShape == "voronoi") {
            instance.tiles = createVoronoiTiles(instance.tilesPerRow, instance.tilesPerColumn);
        }
        else {
            instance.tiles = createTiles(instance.tilesPerRow, instance.tilesPerColumn);
        }
        
        sharedPlaceTiles(instance.tilesPerRow, instance.tilesPerColumn);
        instance.edgesKept = new Array();
        instance.edgesDropped = new Array();
        instance.groups = new Array();
        instance.sizes = new Array();

        for (var i = 0; i < instance.tiles.length; i++) {
            var tile = instance.tiles[i];
            refreshAroundTiles(tile, false);
            tile.aroundTilesChanged = false;
            tile.preStep = instance.step - 2;
            tile.preCellPosition = tile.cellPosition;
            if (!tile.subGraphSize) {
                tile.subGraphSize = 0;
                tile.nodesCount = 1;
            }
            instance.groups[i] = i;
            instance.sizes[i] = 0;
            tile.wantToMoveAway = -1;
        }

        if (instance.saveHintedLinks) {
            for (var i = 0; i < instance.saveHintedLinks.length; i++) {
                var tile = instance.tiles[i];
                tile.hintedLinks = instance.saveHintedLinks[i];
            }
        }

        for (var i = 0; i < instance.tiles.length; i++) {
            var tile = instance.tiles[i];
            computeSubGraph(tile);
        }

        uploadGraphData();

        instance.focusToCenter();

        if (!instance.saveTilePositions) {
            saveGame();
        }
        else {
            if (!instance.gameFinished) {
                var errors = checkTiles();
                if (errors == 0) {
                    finishGame();
                }
            }
        }

        instance.gameStarted = true;

    }
    function createAndPlaceTiles1(needIntro) {
        
        if (instance.tileShape == "voronoi") {
            instance.tiles = createVoronoiTiles(instance.tilesPerRow, instance.tilesPerColumn);
        }
        else {
            instance.tiles = createTiles(instance.tilesPerRow, instance.tilesPerColumn);
        }
        
        sharedPlaceTiles(instance.tilesPerRow, instance.tilesPerColumn);
        instance.edgesKept = new Array();
        instance.edgesDropped = new Array();
        instance.groups = new Array();
        instance.sizes = new Array();

        for (var i = 0; i < instance.tiles.length; i++) {
            var tile = instance.tiles[i];
            refreshAroundTiles(tile, false);
            tile.aroundTilesChanged = false;
            tile.preStep = instance.step - 2;
            tile.preCellPosition = tile.cellPosition;
            if (!tile.subGraphSize) {
                tile.subGraphSize = 0;
                tile.nodesCount = 1;
            }
            instance.groups[i] = i;
            instance.sizes[i] = 0;
            tile.wantToMoveAway = -1;
        }

        if (instance.saveHintedLinks) {
            for (var i = 0; i < instance.saveHintedLinks.length; i++) {
                var tile = instance.tiles[i];
                tile.hintedLinks = instance.saveHintedLinks[i];
            }
        }

        for (var i = 0; i < instance.tiles.length; i++) {
            var tile = instance.tiles[i];
            computeSubGraph(tile);
        }

        uploadGraphData();

        instance.focusToCenter();

        if (!instance.saveTilePositions) {
            saveGame();
        }
        else {
            if (!instance.gameFinished) {
                var errors = checkTiles();
                if (errors == 0) {
                    finishGame();
                }
            }
        }

        instance.gameStarted = true;

    }
    function refreshAroundTiles(tile, beHinted) {
        var tileIndex = getTileIndex(tile);

        var cellPosition = tile.cellPosition;

        var topTile = getTileAtCellPosition(cellPosition + new Point(0, -1));
        var rightTile = getTileAtCellPosition(cellPosition + new Point(1, 0));
        var bottomTile = getTileAtCellPosition(cellPosition + new Point(0, 1));
        var leftTile = getTileAtCellPosition(cellPosition + new Point(-1, 0));

        var aroundTiles = new Array(getTileIndex(topTile), getTileIndex(rightTile),
            getTileIndex(bottomTile), getTileIndex(leftTile));

        var aroundTilesChanged = false;

        if (!tile.aroundTiles) {
            tile.aroundTiles = new Array(-1, -1, -1, -1);
        }

        for (var i = 0; i < aroundTiles.length; i++) {
            if (!beHinted) {
                if (aroundTiles[i] == -1 && tile.aroundTiles[i] != -1) { // add conflict record to both tile connected before
                    tile.conflictTiles[tile.aroundTiles[i]] = true;
                    var neighborTile = instance.tiles[tile.aroundTiles[i]];
                    neighborTile.conflictTiles[tileIndex] = true;
                }

                if (tile.aroundTiles[i] == -1 && aroundTiles[i] != -1) { // remove conflict record to both tile
                    tile.conflictTiles[aroundTiles[i]] = false;
                    var neighborTile = instance.tiles[aroundTiles[i]];
                    neighborTile.conflictTiles[tileIndex] = false;
                }
            }

            if (tile.aroundTiles[i] != aroundTiles[i]) {
                aroundTilesChanged = true;

                if (beHinted) {
                    tile.hintedLinks[i] = aroundTiles[i];
                }
                else {
                    instance.linksChangedCount += 1;
                    if (tile.hintedLinks[i] >= 0) {
                        tile.hintedLinks[i] = Math.floor(tile.hintedLinks[i]) + 0.5;
                    }
                }
            }
        }
        if (aroundTilesChanged) {
            if (instance.gameStarted && !instance.realStepsCounted && !beHinted) {
                instance.realSteps += 1;
                document.getElementById("steps").innerHTML = instance.realSteps;

                instance.lastStepTime = instance.thisStepTime;
                instance.thisStepTime = time;
                clearTimeout(instance.askHelpTimeout);
                var delta = Number(instance.thisStepTime - instance.lastStepTime);
                if (delta >= 2 && instance.linksChangedCount >= 0) {
                    console.log("Delta", delta);
                    instance.linksChangedCount = 0;
                    // instance.askHelpTimeout = setTimeout(askHelp, 5000 * delta);
                }
                
                instance.realStepsCounted = true;
            }

            tile.oldAroundTiles = tile.aroundTiles;
            tile.aroundTiles = aroundTiles;
            tile.aroundTilesChanged = aroundTilesChanged;

            var sum = 0;
            var allLinksHinted = true;
            var allAroundByTiles = true;
            for (var i = 0; i < tile.aroundTiles.length; i++) {
                sum += tile.aroundTiles[i];
                if (tile.aroundTiles[i] < 0) {
                    allAroundByTiles = false;
                }
                if (tile.aroundTiles[i] >= 0 && tile.hintedLinks[i] != tile.aroundTiles[i]) {
                    allLinksHinted = false;
                }

                if (tile.aroundTiles[i] != tile.oldAroundTiles[i]) {
                    if (tile.oldAroundTiles[i] >= 0) {
                        var neighborTile = instance.tiles[tile.oldAroundTiles[i]];
                        refreshAroundTiles(neighborTile, beHinted);
                    }
                    if (tile.aroundTiles[i] >= 0) {
                        var neighborTile = instance.tiles[tile.aroundTiles[i]];
                        refreshAroundTiles(neighborTile, beHinted);
                    }
                }
            }
            if (sum == -4) {
                tile.noAroundTiles = true;
                tile.allLinksHinted = false;
            }
            else {
                tile.noAroundTiles = false;
                tile.allLinksHinted = allLinksHinted;
            }
            tile.allAroundByTiles = allAroundByTiles;
        }

        if (!tile.oldAroundTiles) {
            tile.oldAroundTiles = new Array(-1, -1, -1, -1);
        }
    }

    this.focusToCenter = function () {
        var leftUpPoint = new Point(10000, 10000);
        var rightBottomPoint = new Point(-10000, -10000);
        for (var i = 0; i < instance.tiles.length; i++) {
            var position = instance.tiles[i].position;
            if (position.x < leftUpPoint.x) {
                leftUpPoint.x = position.x;
            }
            if (position.y < leftUpPoint.y) {
                leftUpPoint.y = position.y;
            }
            if (position.x > rightBottomPoint.x) {
                rightBottomPoint.x = position.x;
            }
            if (position.y > rightBottomPoint.y) {
                rightBottomPoint.y = position.y;
            }
        }
        var centerPoint = (leftUpPoint + rightBottomPoint) / 2;
        view.scrollBy(centerPoint - view.center / 1.25);
    }

    this.calcHintedTile = function () {
        hintedLinksNum = {
            totalLinks: 0,
            normalLinks: 0,
            hintedLinks: 0,
            correctLinks: 0
        };
        if(!instance.tiles){
            return;
        }
        for (var i = 0; i < instance.tiles.length; i++) {
            var tile = instance.tiles[i];
            for (var j = 0; j < tile.hintedLinks.length; j++) {
                if (tile.aroundTiles[j] >= 0) {
                    var correctIndex = i + directions[j].x + directions[j].y * instance.tilesPerRow;
                    if(tile.aroundTiles[j] == correctIndex){
                        hintedLinksNum.correctLinks += 1;
                    }
                    if (tile.hintedLinks[j] >= 0 && Math.floor(tile.hintedLinks[j]) == tile.aroundTiles[j]) {
                        hintedLinksNum.hintedLinks += 1;
                    }
                    else {
                        hintedLinksNum.normalLinks += 1;
                    }
                    hintedLinksNum.totalLinks += 1;
                }
            }
        }
    }

    function finishGame() {
        instance.gameFinished = true;

        clearTimeout(t);

        instance.calcHintedTile();

        $('#finish_dialog').modal({
            keyboard: false,
            backdrop: false
        });

        /**          
         * Once one person solves the puzzle, the round is over          
         * Send a msg to the server and the server broadcast it to all players          
         **/
        steps = Number(document.getElementById("steps").innerHTML);

        socket.emit('iSolved', {
            round_id: roundID,
            player_name: player_name,
            steps: steps,
            startTime: startTime,
            totalLinks: hintedLinksNum.totalLinks,
            hintedLinks: hintedLinksNum.hintedLinks,
            correctLinks: hintedLinksNum.correctLinks,
            totalHintsNum: totalHintsNum,
            correctHintsNum: correctHintsNum
        });

        sendRecord(true, 5);
    }

    function sharedPlaceTiles(xTileCount, yTileCount) {
        var tiles = instance.tiles;
        var tileIndexes = instance.tileIndexes;
        if (instance.saveTilePositions) {
            for (var i = 0; i < instance.saveTilePositions.length; i++) {
                var tilePos = instance.saveTilePositions[i];
                var tile = instance.tiles[tilePos.index];
                placeTile(tile, new Point(tilePos.x, tilePos.y));
                tile.subGraphSize = tilePos.subGraphSize;
                tile.nodesCount = tilePos.nodesCount;
                tile.moved = false; // if one tile just clicked or actually moved(if moved, opacity=1)
                tile.aroundTilesChanged = false;
                tile.noAroundTiles = true;
                tile.aroundTiles = new Array(-1, -1, -1, -1);
                tile.hintedLinks = new Array(-1, -1, -1, -1);
                tile.conflictTiles = new Array();
                tile.positionMoved = false;
            }
            return;
        }
        // randomly select tiles and place them one by one 
        for (var y = 0; y < yTileCount; y++) {
            for (var x = 0; x < xTileCount; x++) {
                var index1 = instance.randomSequence[y * xTileCount + x];
                var tile = tiles[index1];

                var position = view.center -
                    new Point(instance.tileWidth, instance.tileWidth / 2) +
                    new Point(instance.tileWidth * (x * 2 + ((y % 2))), instance.tileWidth * (y * 1)) -
                    new Point(instance.puzzleImage.size.width, instance.puzzleImage.size.height / 2);

                var cellPosition = new Point(
                    Math.round(position.x / instance.tileWidth),//returns int closest to arg
                    Math.round(position.y / instance.tileWidth));

                tile.position = cellPosition * instance.tileWidth; // round position(actual (x,y) in the canvas)
                tile.cellPosition = cellPosition; // cell position(in which grid the tile is)
                tile.relativePosition = new Point(0, 0);
                tile.moved = false; // if one tile just clicked or actually moved(if moved, opacity=1)
                tile.aroundTilesChanged = false;
                tile.noAroundTiles = true;
                tile.aroundTiles = new Array(-1, -1, -1, -1);
                tile.hintedLinks = new Array(-1, -1, -1, -1);
                tile.conflictTiles = new Array();
                tile.positionMoved = false;
            }
        }
    }
    function randomPlaceTiles(xTileCount, yTileCount) {
        var tiles = instance.tiles;
        var tileIndexes = instance.tileIndexes;
        if (instance.saveTilePositions) {
            for (var i = 0; i < instance.saveTilePositions.length; i++) {
                var tilePos = instance.saveTilePositions[i];
                var tile = instance.tiles[tilePos.index];
                placeTile(tile, new Point(tilePos.x, tilePos.y));
                tile.subGraphSize = tilePos.subGraphSize;
                tile.nodesCount = tilePos.nodesCount;
                tile.moved = false; // if one tile just clicked or actually moved(if moved, opacity=1)
                tile.aroundTilesChanged = false;
                tile.noAroundTiles = true;
                tile.aroundTiles = new Array(-1, -1, -1, -1);
                tile.hintedLinks = new Array(-1, -1, -1, -1);
                tile.conflictTiles = new Array();
                tile.positionMoved = false;
            }
            return;
        }
        // randomly select tiles and place them one by one 
        for (var y = 0; y < yTileCount; y++) {
            for (var x = 0; x < xTileCount; x++) {

                var index1 = Math.floor(Math.random() * tileIndexes.length);
                var index2 = tileIndexes[index1];
                var tile = tiles[index2];
                tileIndexes.remove(index1, 1);

                var position = view.center -
                    new Point(instance.tileWidth, instance.tileWidth / 2) +
                    new Point(instance.tileWidth * (x * 2 + ((y % 2))), instance.tileWidth * (y * 1)) -
                    new Point(instance.puzzleImage.size.width, instance.puzzleImage.size.height / 2);

                var cellPosition = new Point(
                    Math.round(position.x / instance.tileWidth),//returns int closest to arg
                    Math.round(position.y / instance.tileWidth));

                tile.position = cellPosition * instance.tileWidth; // round position(actual (x,y) in the canvas)
                tile.cellPosition = cellPosition; // cell position(in which grid the tile is)
                tile.relativePosition = new Point(0, 0);
                tile.moved = false; // if one tile just clicked or actually moved(if moved, opacity=1)
                tile.aroundTilesChanged = false;
                tile.noAroundTiles = true;
                tile.aroundTiles = new Array(-1, -1, -1, -1);
                tile.hintedLinks = new Array(-1, -1, -1, -1);
                tile.conflictTiles = new Array();
                tile.positionMoved = false;
            }
        }
    }

    function createTiles(xTileCount, yTileCount) {
        var tiles = new Array();
        var tileRatio = instance.tileWidth / 100.0;
        if (instance.saveShapeArray) {
            instance.shapeArray = instance.saveShapeArray;
        }
        else {
            instance.shapeArray = getRandomShapes(xTileCount, yTileCount);
        }
        var tileIndexes = new Array();
        for (var y = 0; y < yTileCount; y++) {
            for (var x = 0; x < xTileCount; x++) {

                var shape = instance.shapeArray[y * xTileCount + x];

                var maskMap = getMask(tileRatio, shape.topTab, shape.rightTab, shape.bottomTab, shape.leftTab, instance.tileWidth);

                var mask = maskMap.mask;

                var topEdge = maskMap.topEdge;
                topEdge.strokeWidth = instance.colorBorderWidth;
                topEdge.visible = false;

                var rightEdge = maskMap.rightEdge;
                rightEdge.strokeWidth = instance.colorBorderWidth;
                rightEdge.visible = false;

                var bottomEdge = maskMap.bottomEdge;
                bottomEdge.strokeWidth = instance.colorBorderWidth;
                bottomEdge.visible = false;

                var leftEdge = maskMap.leftEdge;
                leftEdge.strokeWidth = instance.colorBorderWidth;
                leftEdge.visible = false;

                var offset = new Point(instance.tileWidth * x, instance.tileWidth * y);
                offset += new Point(instance.tileWidth / 4, instance.tileWidth / 4);
                var img = getTileRaster(
                    instance.puzzleImage,
                    new Size(instance.tileWidth, instance.tileWidth),
                    offset
                );
                var border = mask.clone();
                border.strokeColor = 'grey'; //grey
                border.strokeWidth = (hasBorder == "true") ? 2 : 0;

                var colorBorder = mask.clone();
                colorBorder.strokeWidth = instance.colorBorderWidth;
                colorBorder.visible = false;

                // each tile is a group of
                var tile = new Group(mask, img, border);
                tile.clipped = true;
                tile = new Group(topEdge, rightEdge, bottomEdge, leftEdge, colorBorder, tile);
                tile.topEdge = topEdge;
                tile.rightEdge = rightEdge;
                tile.bottomEdge = bottomEdge;
                tile.leftEdge = leftEdge;
                tile.colorBorder = colorBorder;
                tile.differentColor = new Array();
                tile.colorDirection = new Array();

                tile.picking = false;
                tile.alreadyHinted = false;
                tile.opacity = 1;
                tile.pivot = new Point(instance.tileWidth / 2, instance.tileWidth / 2);

                tile.shape = shape;
                tile.imagePosition = new Point(x, y);

                // tile fixed index/unique id
                tile.findex = y * xTileCount + x;
                //console.log(tile.findex);
                tiles.push(tile);
                tile.name = "tile-" + tileIndexes.length;
                tileIndexes.push(tileIndexes.length);
            }
        }
        instance.tileIndexes = tileIndexes;
        return tiles;
    }

    function showUnsureHintColor(tileIndex, hintTilesIndexs, direction, colorIndex) {
        showColorBorder(tileIndex, direction, colorIndex, true);
        for (var i = 0; i < hintTilesIndexs.length; i++) {
            var reverseDirection = 4;
            if (direction % 2 == 0) {
                reverseDirection = 2 - direction;
            }
            else {
                reverseDirection = 4 - direction;
            }
            showColorBorder(hintTilesIndexs[i], reverseDirection, colorIndex, true);
        }
    }

    function getRandomShapes(width, height) {
        var shapeArray = new Array();

        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {

                var topTab = undefined;
                var rightTab = undefined;
                var bottomTab = undefined;
                var leftTab = undefined;

                if (y == 0) {
                    topTab = (hasEdge == "true") ? 0 : getRandomTabValue();
                }

                if (y == height - 1) {
                    bottomTab = (hasEdge == "true") ? 0 : getRandomTabValue();
                }

                if (x == 0) {
                    leftTab = (hasEdge == "true") ? 0 : getRandomTabValue();
                }

                if (x == width - 1) {
                    rightTab = (hasEdge == "true") ? 0 : getRandomTabValue();
                }

                shapeArray.push(
                    ({
                        topTab: topTab,
                        rightTab: rightTab,
                        bottomTab: bottomTab,
                        leftTab: leftTab
                    })
                );
            }
        }

        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {

                var shape = shapeArray[y * width + x];

                var shapeRight = (x < width - 1) ?
                    shapeArray[y * width + (x + 1)] :
                    undefined;

                var shapeBottom = (y < height - 1) ?
                    shapeArray[(y + 1) * width + x] :
                    undefined;

                shape.rightTab = (x < width - 1) ?
                    getRandomTabValue() :
                    shape.rightTab;

                if (shapeRight)
                    shapeRight.leftTab = -shape.rightTab;

                shape.bottomTab = (y < height - 1) ?
                    getRandomTabValue() :
                    shape.bottomTab;

                if (shapeBottom)
                    shapeBottom.topTab = -shape.bottomTab;
            }
        }
        return shapeArray;
    }

    function getRandomTabValue() {
        //math.floor() returns max int <= arg
        switch (instance.tileShape) {
            case 'straight': {
                return 0;
                break;
            }
            case 'curved': {
                return Math.pow(-1, Math.floor(Math.random() * 2));;
                break;
            }
            default: {
                return 0;
            }
        }
    }

    function getMask(tileRatio, topTab, rightTab, bottomTab, leftTab, tileWidth) {

        var curvyCoords = [
            0, 0, 35, 15, 37, 5,
            37, 5, 40, 0, 38, -5,
            38, -5, 20, -20, 50, -20,
            50, -20, 80, -20, 62, -5,
            62, -5, 60, 0, 63, 5,
            63, 5, 65, 15, 100, 0
        ];

        var mask = new Path();
        var tileCenter = view.center;

        var topLeftEdge = new Point(0, 0);

        mask.moveTo(topLeftEdge);
        var topEdge = new Path();
        topEdge.moveTo(topLeftEdge);
        //Top
        for (var i = 0; i < curvyCoords.length / 6; i++) {
            var p1 = topLeftEdge + new Point(curvyCoords[i * 6 + 0] * tileRatio, topTab * curvyCoords[i * 6 + 1] * tileRatio);
            var p2 = topLeftEdge + new Point(curvyCoords[i * 6 + 2] * tileRatio, topTab * curvyCoords[i * 6 + 3] * tileRatio);
            var p3 = topLeftEdge + new Point(curvyCoords[i * 6 + 4] * tileRatio, topTab * curvyCoords[i * 6 + 5] * tileRatio);

            mask.cubicCurveTo(p1, p2, p3);
            topEdge.cubicCurveTo(p1, p2, p3);
        }

        //Right
        var topRightEdge = topLeftEdge + new Point(tileWidth, 0);
        var rightEdge = new Path();
        rightEdge.moveTo(topRightEdge);
        for (var i = 0; i < curvyCoords.length / 6; i++) {
            var p1 = topRightEdge + new Point(-rightTab * curvyCoords[i * 6 + 1] * tileRatio, curvyCoords[i * 6 + 0] * tileRatio);
            var p2 = topRightEdge + new Point(-rightTab * curvyCoords[i * 6 + 3] * tileRatio, curvyCoords[i * 6 + 2] * tileRatio);
            var p3 = topRightEdge + new Point(-rightTab * curvyCoords[i * 6 + 5] * tileRatio, curvyCoords[i * 6 + 4] * tileRatio);

            mask.cubicCurveTo(p1, p2, p3);
            rightEdge.cubicCurveTo(p1, p2, p3);
        }

        //Bottom
        var bottomRightEdge = topRightEdge + new Point(0, tileWidth);
        var bottomEdge = new Path();
        bottomEdge.moveTo(bottomRightEdge);
        for (var i = 0; i < curvyCoords.length / 6; i++) {
            var p1 = bottomRightEdge - new Point(curvyCoords[i * 6 + 0] * tileRatio, bottomTab * curvyCoords[i * 6 + 1] * tileRatio);
            var p2 = bottomRightEdge - new Point(curvyCoords[i * 6 + 2] * tileRatio, bottomTab * curvyCoords[i * 6 + 3] * tileRatio);
            var p3 = bottomRightEdge - new Point(curvyCoords[i * 6 + 4] * tileRatio, bottomTab * curvyCoords[i * 6 + 5] * tileRatio);

            mask.cubicCurveTo(p1, p2, p3);
            bottomEdge.cubicCurveTo(p1, p2, p3);
        }

        //Left
        var bottomLeftEdge = bottomRightEdge - new Point(tileWidth, 0);
        var leftEdge = new Path();
        leftEdge.moveTo(bottomLeftEdge);
        for (var i = 0; i < curvyCoords.length / 6; i++) {
            var p1 = bottomLeftEdge - new Point(-leftTab * curvyCoords[i * 6 + 1] * tileRatio, curvyCoords[i * 6 + 0] * tileRatio);
            var p2 = bottomLeftEdge - new Point(-leftTab * curvyCoords[i * 6 + 3] * tileRatio, curvyCoords[i * 6 + 2] * tileRatio);
            var p3 = bottomLeftEdge - new Point(-leftTab * curvyCoords[i * 6 + 5] * tileRatio, curvyCoords[i * 6 + 4] * tileRatio);

            mask.cubicCurveTo(p1, p2, p3);
            leftEdge.cubicCurveTo(p1, p2, p3);
        }
        maskMap = {
            mask: mask,
            topEdge: topEdge,
            rightEdge: rightEdge,
            bottomEdge: bottomEdge,
            leftEdge: leftEdge
        };
        return maskMap;
    }

    var hitOptions = {
        segments: true,
        stroke: true,
        fill: true,
        tolerance: 5
    };

    function createVoronoiTiles(xTileCount, yTileCount) {
        var tiles = new Array();
        var tileIndexes = new Array();
        for (var y = 0; y < yTileCount; y++) {
            for (var x = 0; x < xTileCount; x++) {
                var tileIndex = tileIndexes.length;
                var topLeftPoint = new Point(0, 0);
                var topRightPoint = new Point(0, 0);
                var bottomLeftPoint = new Point(0, 0);
                var bottomRightPoint = new Point(0, 0);

                bottomRightPoint.x = Math.round(instance.tileWidth / 2 + Math.random() * instance.tileWidth);
                bottomRightPoint.y = Math.round(instance.tileWidth / 2 + Math.random() * instance.tileWidth);

                if (x > 0) {
                    var leftTile = tiles[tileIndex - 1];
                    topLeftPoint = leftTile.topRightPoint - new Point(instance.tileWidth, 0);
                    bottomLeftPoint = leftTile.bottomRightPoint - new Point(instance.tileWidth, 0);
                }

                if (y > 0) {
                    var topTile = tiles[tileIndex - instance.tilesPerRow];
                    topLeftPoint = topTile.bottomLeftPoint - new Point(0, instance.tileWidth);
                    topRightPoint = topTile.bottomRightPoint - new Point(0, instance.tileWidth);
                }

                if (x == 0) {
                    if (y == 0) {
                        topRightPoint.x = Math.round(instance.tileWidth / 2 + Math.random() * instance.tileWidth);

                        bottomLeftPoint.y = Math.round(instance.tileWidth / 2 + Math.random() * instance.tileWidth);

                        bottomRightPoint.x = Math.round(instance.tileWidth / 2 + Math.random() * instance.tileWidth);
                        bottomRightPoint.y = Math.round(instance.tileWidth / 2 + Math.random() * instance.tileWidth);
                    }
                    else if (y == yTileCount - 1) {
                        bottomLeftPoint.y = instance.tileWidth;

                        bottomRightPoint.x = Math.round(instance.tileWidth / 2 + Math.random() * instance.tileWidth);
                        bottomRightPoint.y = instance.tileWidth;
                    }
                    else {
                        bottomLeftPoint.y = Math.round(instance.tileWidth / 2 + Math.random() * instance.tileWidth);;

                        bottomRightPoint.x = Math.round(instance.tileWidth / 2 + Math.random() * instance.tileWidth);
                        bottomRightPoint.y = Math.round(instance.tileWidth / 2 + Math.random() * instance.tileWidth);
                    }
                }
                else if (x == xTileCount - 1) {
                    if (y == 0) {
                        topRightPoint.x = instance.tileWidth;

                        bottomRightPoint.x = instance.tileWidth;
                        bottomRightPoint.y = Math.round(instance.tileWidth / 2 + Math.random() * instance.tileWidth);
                    }
                    else if (y == yTileCount - 1) {
                        bottomRightPoint.x = instance.tileWidth;
                        bottomRightPoint.y = instance.tileWidth;
                    }
                    else {
                        bottomRightPoint.x = instance.tileWidth;
                        bottomRightPoint.y = Math.round(instance.tileWidth / 2 + Math.random() * instance.tileWidth);
                    }
                }
                else {
                    if (y == 0) {
                        topRightPoint.x = Math.round(instance.tileWidth / 2 + Math.random() * instance.tileWidth);

                        bottomRightPoint.x = Math.round(instance.tileWidth / 2 + Math.random() * instance.tileWidth);
                        bottomRightPoint.y = Math.round(instance.tileWidth / 2 + Math.random() * instance.tileWidth);
                    }
                    else if (y == yTileCount - 1) {
                        bottomRightPoint.x = Math.round(instance.tileWidth / 2 + Math.random() * instance.tileWidth);
                        bottomRightPoint.y = instance.tileWidth;
                    }
                    else {
                        bottomRightPoint.x = Math.round(instance.tileWidth / 2 + Math.random() * instance.tileWidth);
                        bottomRightPoint.y = Math.round(instance.tileWidth / 2 + Math.random() * instance.tileWidth);
                    }
                }

                var mask = new Path();
                mask.moveTo(topLeftPoint);
                mask.lineTo(topRightPoint);
                mask.lineTo(bottomRightPoint);
                mask.lineTo(bottomLeftPoint);
                mask.closePath();
                mask.opacity = 0.01;
                mask.strokeColor = '#fff'; //white

                var img = getTileRaster(
                    instance.puzzleImage,
                    new Size(instance.tileWidth, instance.tileWidth),
                    new Point(instance.tileWidth * x, instance.tileWidth * y)
                );

                //var border = mask.clone();
                //border.strokeColor = 'red'; //grey
                //border.strokeWidth = 0;

                // each tile is a group of
                var tile = new Group(mask, img);
                tile.topRightPoint = topRightPoint;
                tile.topLeftPoint = topLeftPoint;
                tile.bottomLeftPoint = bottomLeftPoint;
                tile.bottomRightPoint = bottomRightPoint;
                tile.picking = false;
                tile.clipped = true;
                tile.opacity = 1;
                tile.pivot = new Point(instance.tileWidth / 2, instance.tileWidth / 2);

                tile.imagePosition = new Point(x, y);

                // tile fixed index/unique id
                tile.findex = y * xTileCount + x;
                //console.log(tile.findex);
                tiles.push(tile);
                tile.name = "tile-" + tileIndexes.length;
                tileIndexes.push(tileIndexes.length);
            }
        }
        instance.tileIndexes = tileIndexes;
        return tiles;
    }


    function getTileRaster(sourceRaster, size, offset) {
        var targetRaster = new Raster('empty');
        var tileWithMarginWidth = size.width + instance.tileMarginWidth * 2;
        var imageData = sourceRaster.getImageData(new Rectangle(
            offset.x - instance.tileMarginWidth,
            offset.y - instance.tileMarginWidth,
            tileWithMarginWidth,
            tileWithMarginWidth));
        targetRaster.setImageData(imageData, new Point(0, 0))
        targetRaster.position = new Point(instance.tileWidth / 2, instance.tileWidth / 2);
        return targetRaster;
    }

    function getTileIndex(tile) {
        if (tile && tile.name) {
            return Number(tile.name.substr(5));
        }
        return -1;
    }

    this.pickTile = function (point) {
        if (instance.hintsShowing) {
            return;
        }
        findSelectTile(point);
        
        if (instance.selectedTile) {
            $('html,body').css('cursor', 'move');
            if (!instance.selectedTile[0].picking) {
                for (var i = 0; i < instance.selectedTile.length; i++) {
                    instance.selectedTile[i].picking = true;
                }
            }
            else {
                instance.releaseTile();
                return;
            }

            instance.draging = true;
            if(instance.selectedTile != null){
                for (var i = 0; i < instance.selectedTile.length; i++) {
                    globalSelectedIndexs.push(getTileIndex(instance.selectedTile[i]));
                }
            }
            var pos = new Point(instance.selectedTile[0].position.x, instance.selectedTile[0].position.y);
            for (var i = 0; i < instance.selectedTile.length; i++) {
                var tile = instance.selectedTile[i];
                tile.opacity = 0.5;
                tile.position = pos + tile.relativePosition * instance.tileWidth;
                tile.originPosition = tile.cellPosition;
            }
            return instance.selectedTile.length;
        }
        return 0;
    }

    function moveAwayDelay(tile, d) {
        if ((tile.wantToMoveAway >= 0 && tile.wantToMoveAway != d) || !tile.noAroundTiles) {
            return false;
        }
        tile.wantToMoveAway = d;
        var cellPositionAfter = tile.cellPosition + directions[d];

        for (var i = 0; i < 4; i++) {
            var neighborTile = getTileAtCellPosition(cellPositionAfter + directions[i]);
            if (neighborTile != undefined && tile != neighborTile) {
                var canMoveAway = moveAwayDelay(neighborTile, d);
                if (!canMoveAway) {
                    return false;
                }
            }
        }

        return true;
    }

    function allMoveAway() {
        for (var i = 0; i < instance.tiles.length; i++) {
            var tile = instance.tiles[i];
            if (tile.wantToMoveAway >= 0 && tile.noAroundTiles) {
                placeTile(tile, tile.cellPosition + directions[tile.wantToMoveAway]);
                tile.wantToMoveAway = -1;
            }
        }
    }

    function checkConflict(tiles, centerCellPosition) {
        if (Math.abs(centerCellPosition.x) > 70 || Math.abs(centerCellPosition.y) > 50) {
            return true;
        }
        var hasConflict = false;
        if (this.allowOverlap)
            return hasConflict;
        var onlyOneTile = (tiles.length == 1);
        for (var i = 0; i < tiles.length; i++) {
            var tile = tiles[i];
            var tileIndex = getTileIndex(tile);

            var cellPosition = centerCellPosition + tile.relativePosition;
            var roundPosition = cellPosition * instance.tileWidth;

            var alreadyPlacedTile = (getTileAtCellPosition(cellPosition) != undefined);
            hasConflict = hasConflict || alreadyPlacedTile;
            if (!hasConflict && instance.tileShape != "voronoi") {
                var topTile = getTileAtCellPosition(cellPosition + new Point(0, -1));
                var rightTile = getTileAtCellPosition(cellPosition + new Point(1, 0));
                var bottomTile = getTileAtCellPosition(cellPosition + new Point(0, 1));
                var leftTile = getTileAtCellPosition(cellPosition + new Point(-1, 0));

                var hintAroundTiles = undefined;
                if (instance.hintsShowing) {
                    hintAroundTiles = instance.hintAroundTilesMap[tileIndex];
                }

                var topTileConflict = (topTile != undefined) && (!(topTile.shape.bottomTab + tile.shape.topTab == 0) ||
                    (instance.tileShape == 'curved' && topTile.shape.bottomTab == 0 && tile.shape.topTab == 0));
                if (hintAroundTiles) {
                    topTileConflict = topTileConflict || (topTile != undefined) && (getTileIndex(topTile) != hintAroundTiles[0]);
                    if (topTileConflict && tile.aroundTiles[0] < 0 && onlyOneTile) {
                        var canMoveAway = false;//moveAwayDelay(topTile, 0);
                        if (canMoveAway) {
                            topTileConflict = false;
                        }
                    }
                }

                var rightTileConflict = (rightTile != undefined) && (!(rightTile.shape.leftTab + tile.shape.rightTab == 0) ||
                    (instance.tileShape == 'curved' && rightTile.shape.leftTab == 0 && tile.shape.rightTab == 0));
                if (hintAroundTiles) {
                    rightTileConflict = rightTileConflict || (rightTile != undefined) && (getTileIndex(rightTile) != hintAroundTiles[1]);
                    if (rightTileConflict && tile.aroundTiles[1] < 0 && onlyOneTile) {
                        var canMoveAway = false;//moveAwayDelay(rightTile, 1);
                        if (canMoveAway) {
                            rightTileConflict = false;
                        }
                    }
                }

                var bottomTileConflict = (bottomTile != undefined) && (!(bottomTile.shape.topTab + tile.shape.bottomTab == 0) ||
                    (instance.tileShape == 'curved' && bottomTile.shape.topTab == 0 && tile.shape.bottomTab == 0));
                if (hintAroundTiles) {
                    bottomTileConflict = bottomTileConflict || (bottomTile != undefined) && (getTileIndex(bottomTile) != hintAroundTiles[2]);
                    if (bottomTileConflict && tile.aroundTiles[2] < 0 && onlyOneTile) {
                        var canMoveAway = false;//moveAwayDelay(bottomTile, 2);
                        if (canMoveAway) {
                            bottomTileConflict = false;
                        }
                    }
                }

                var leftTileConflict = (leftTile != undefined) && (!(leftTile.shape.rightTab + tile.shape.leftTab == 0) ||
                    (instance.tileShape == 'curved' && leftTile.shape.rightTab == 0 && tile.shape.leftTab == 0));
                if (hintAroundTiles) {
                    leftTileConflict = leftTileConflict || (leftTile != undefined) && (getTileIndex(leftTile) != hintAroundTiles[3]);
                    if (leftTileConflict && tile.aroundTiles[3] < 0 && onlyOneTile) {
                        var canMoveAway = false;//moveAwayDelay(leftTile, 3);
                        if (canMoveAway) {
                            leftTileConflict = false;
                        }
                    }
                }

                var aroundConflict = topTileConflict || bottomTileConflict || rightTileConflict || leftTileConflict;
                var hasConflict = aroundConflict || hasConflict;
            }
        }
        if (!hasConflict) {
            allMoveAway();
        }
        return hasConflict;
    }

    function placeTile(tile, cellPosition) {
        var roundPosition = cellPosition * instance.tileWidth;
        if (instance.hintsShowing) {
            tile.preStep = instance.steps - 1;
        }
        else {
            tile.preStep = instance.steps;
        }
        tile.preCellPosition = tile.cellPosition;
        tile.position = roundPosition;
        if (tile.originPosition) {
            if (cellPosition == tile.originPosition) {
                tile.positionMoved = false;
            }
            else {
                tile.positionMoved = true;
            }
        }
        else {
            tile.positionMoved = false;
        }
        tile.cellPosition = cellPosition;
        tile.relativePosition = new Point(0, 0);
    }

    this.undoNextStep = function () {
        instance.undoing = true;

        var tilesMoved = false;

        for (var i = 0; i < instance.tiles.length; i++) {
            var tile = instance.tiles[i];
            tile.beenUndo = false;
            if (tile.preStep == instance.steps - 1) {
                tile.beenUndo = true;
                placeTile(tile, tile.preCellPosition);
                tilesMoved = true;
            }
        }

        for (var i = 0; i < instance.tiles.length; i++) {
            var tile = instance.tiles[i];
            if (tile.beenUndo) {
                refreshAroundTiles(tile, false);
            }
        }

        for (var i = 0; i < instance.tiles.length; i++) {
            var tile = instance.tiles[i];
            if (tile.beenUndo) {
                if (tile.aroundTilesChanged) {
                    computeSubGraph(tile);
                }
                tile.beenUndo = false;
            }
        }

        uploadGraphData();

        if (tilesMoved) {
            instance.steps += 1;
            instance.realStepsCounted = false;

            document.getElementById("steps").innerHTML = instance.realSteps;
            undoStep = instance.steps;
            $('#undo_button').css('display', 'none');
            saveGame();
            normalizeTiles();
        }

        instance.undoing = false;
    }

    function generateLinksTags(x, y, direction, beHinted) {
        switch (direction) {
            case 0: return { x: Number(y), y: Number(x), tag: "T-B", beHinted: beHinted };
            case 1: return { x: Number(x), y: Number(y), tag: "L-R", beHinted: beHinted };
            case 2: return { x: Number(x), y: Number(y), tag: "T-B", beHinted: beHinted };
            case 3: return { x: Number(y), y: Number(x), tag: "L-R", beHinted: beHinted };
        }
    }

    function dfsGraph(tileIndex) {
        if (instance.dfsGraphLinksMap[tileIndex]) {
            return;
        }
        instance.dfsGraphLinksMap[tileIndex] = new Array();
        instance.subGraphNodesCount += 1;
        var tile = instance.tiles[tileIndex];
        for (var i = 0; i < tile.aroundTiles.length; i++) {
            var aroundTileIndex = tile.aroundTiles[i];
            if (aroundTileIndex < 0 || (instance.dfsGraphLinksMap[aroundTileIndex] &&
                instance.dfsGraphLinksMap[aroundTileIndex][tileIndex])) {
                continue;
            }
            instance.dfsGraphLinksMap[tileIndex][aroundTileIndex] = true;
            var beHinted = (aroundTileIndex == Math.floor(tile.hintedLinks[i]));
            instance.subGraphData.push(generateLinksTags(tileIndex, aroundTileIndex, i, beHinted));
            dfsGraph(aroundTileIndex);
        }
    }

    function updateGraphSize(preSize) {
        var size = instance.subGraphData.length - preSize;
        var nodes = instance.subGraphNodesCount;
        for (var i = preSize; i < instance.subGraphData.length; i++) {
            instance.subGraphData[i].size = size;
            instance.subGraphData[i].nodes = nodes;
        }
    }

    function showAskHelpHints(data, reverse) {
        var changeForIteration = false;
        var len = data.length;

        for (var i = 0; i < len; i++) {
            var index = reverse ? (len - 1 - i) : i;
            for (var j = 0; j < 4; j++) {
                if (data[index][j] > -1) {
                    var tile = instance.tiles[index];
                    if (tile.subGraphSize == instance.maxSubGraphSize && !tile.allAroundByTiles) {
                        var shouldSaveThis = showHints(index, data[index], -1);
                        normalizeTiles(true);
                        changeForIteration = changeForIteration || shouldSaveThis;
                    }
                    break;
                }
            }
        }

        uploadHintedSubGraph();
        normalizeTiles();

        return changeForIteration;
    }

    function askHelp() {
        if(players_num == 1){
            return;
        }

        console.log("Asking for help...");
        clearTimeout(instance.askHelpTimeout);

        if (mousedowned || instance.hintsShowing) {
            return;
        }

        $('#show_hints_dialog').modal({
            keyboard: false,
            backdrop: false
        }).show();

        // socket.emit("fetchHints", {
        //     round_id: roundID,
        //     player_name: player_name,
        //     tilesNum: instance.tilesNum
        // });
    }

    function computeMultiHintsConflict(sureHints, indexes) {
        var tilesMap = {};
        var indexesMap = {};
        for (var i = 0; i < indexes.length; i++) {
            indexesMap[indexes[i]] = true;
        }

        for (var i = 0; i < sureHints.length; i++) {
            if (indexes.length > 0 && !indexesMap[i]) {
                continue;
            }
            var hintTiles = sureHints[i];
            for (var j = 0; j < hintTiles.length; j++) {
                var hintTileIndex = hintTiles[j];
                if (hintTileIndex >= 0) {
                    if (!tilesMap[hintTileIndex]) {
                        tilesMap[hintTileIndex] = [0, 0, 0, 0];
                    }
                    tilesMap[hintTileIndex][j] += 1;
                }
            }
        }
        //console.log(tilesMap);
        instance.multiHintsMap = tilesMap;
    }

    // socket.on("proactiveHints", function (data) {
    //     console.log(data);
    //     if (!mousedowned && !instance.hintsShowing && data && data.sureHints) {
    //         if (!instance.hintsShowing) {
    //             instance.hintsShowing = true;
    //         }
    //         else {
    //             return;
    //         }

    //         var shouldSave = false;

    //         instance.hintAroundTilesMap = data.sureHints;
    //         computeMultiHintsConflict(data.sureHints, []);
    //         /*
    //         for (var t = 0; t < 1; t++) {
    //             var changeForIteration = false;

    //             var changeForThis = showAskHelpHints(data.sureHints, false);
    //             changeForIteration = changeForIteration || changeForThis;

    //             changeForThis = showAskHelpHints(data.sureHints, true);
    //             changeForIteration = changeForIteration || changeForThis;

    //             shouldSave = shouldSave || changeForIteration;

    //             if (!changeForIteration) {
    //                 break;
    //             }
    //         }*/

    //         var strongHintsNeededTiles = new Array();
    //         for (var index = 0; index < instance.tiles.length; index++) {
    //             var tile = instance.tiles[index];
    //             for (var j = 0; j < 4; j++) {
    //                 if (tile.aroundTiles[j] < 0 && data.sureHints[index][j] > -1) {
    //                     strongHintsNeededTiles.push(index);
    //                     break;
    //                 }
    //             }
    //         }

    //         var shouldSave = showStrongAndWeakHints(data.sureHints, strongHintsNeededTiles);

    //         if (shouldSave) {
    //             saveGame();
    //         }

    //         uploadHintedSubGraph();
    //         normalizeTiles();

    //         $("#show_hints_dialog").modal().hide();

    //         // judge the hint tiles
    //         if (!instance.gameFinished) {
    //             var errors = checkTiles();
    //             if (errors == 0) {
    //                 finishGame();
    //             }
    //         }

    //         if (!shouldSave){
    //             processUnsureHints(data.unsureHints);
    //         }
    //         instance.hintsShowing = false;
    //     }
    //     else {
    //         $("#show_hints_dialog").modal().hide();
    //     }
    // });

    this.releaseTile = function () {
        if (instance.draging) {
            if (!instance.selectedTile || !instance.selectedTile[0]) {
                instance.selectedTile = null;
                instance.draging = false;
                return;
            }
            var centerCellPosition = new Point(
                Math.round(instance.selectedTile[0].position.x / instance.tileWidth),
                Math.round(instance.selectedTile[0].position.y / instance.tileWidth));

            var originCenterCellPostion = instance.selectedTile[0].originPosition;

            // console.log("releaseTile cellPosition : x : " + centerCellPosition.x + " y : " + centerCellPosition.y);
            var hasConflict = checkConflict(instance.selectedTile, centerCellPosition);
            for (var i = 0; i < instance.selectedTile.length; i++) {
                instance.selectedTile[i].picking = false;
            }

            var tilesMoved = false;
            for (var i = 0; i < instance.selectedTile.length; i++) {
                var tile = instance.selectedTile[i];
                var cellPosition = undefined;
                if (hasConflict) {
                    cellPosition = originCenterCellPostion + tile.relativePosition;
                    for (var j = 0; j < instance.saveTilePositions.length; j++) {
                        var tilePos = instance.saveTilePositions[j];
                        var tile1 = instance.tiles[tilePos.index];
                        var savetileIndex = getTileIndex(tile1);
                        var tileIndex =getTileIndex(tile);
                            if(tileIndex == savetileIndex){
                                placeTile(tile1, new Point(tilePos.x, tilePos.y));
                            }
                    }
                }
                else {
                    cellPosition = centerCellPosition + tile.relativePosition;
                    placeTile(tile, cellPosition);
                }
                
                tilesMoved = tilesMoved || tile.positionMoved;

                // if (tile.differentColor.length > 0) {
                //     var tileIndex = getTileIndex(tile);
                //     for (var j = 0; j < tile.differentColor.length; j++) {
                //         showColorBorder(tileIndex, tile.differentColor[j], tile.colorDirection[j], false);
                //     }
                // }


            }

            for (var i = 0; i < instance.selectedTile.length; i++) {
                refreshAroundTiles(instance.selectedTile[i], false);
            }

            for (var i = 0; i < instance.selectedTile.length; i++) {
                var tile = instance.selectedTile[i];
                if (tile.aroundTilesChanged) {
                    computeSubGraph(tile);
                }
            }

            uploadGraphData();

            if (tilesMoved && !instance.gameFinished) {
                instance.steps += 1;
                instance.realStepsCounted = false;

                document.getElementById("steps").innerHTML = instance.realSteps;
                $('#undo_button').css('display', 'inline');
                saveGame();
            }

            if (!hasConflict /*&& instance.showHints*/) {
                var selectedTileIndexes = new Array();
                for (var i = 0; i < instance.selectedTile.length; i++) {
                    selectedTileIndexes.push(getTileIndex(instance.selectedTile[i]));
                }
                //getHints(roundID, selectedTileIndexes);
            }

            for (var i = 0; i < instance.selectedTile.length; i++) {
                instance.selectedTile[i].opacity = 1;
            }

            instance.selectedTile = null;
            instance.draging = false;

            if (!instance.gameFinished) {
                var errors = checkTiles();
                if (errors == 0) {
                    finishGame();
                    clearTimeout(instance.askHelpTimeout);
                }
            }
            $('html,body').css('cursor', 'default');
            normalizeTiles();
        }
    }

    /**
     *  Update links in the background graph
     *  Check which case it is in the 4 cases, and call the corrosponding method:
     *  *  When one link is created:
     *  1, If the link does not exist, create a link;
     *  2, If the link already exists, update: append the user to the supporter list of the selected tile;
     *  *  When one link is destroyed:
     *  1, If the user is the only one supporter, remove;
     *  2, Else update: remove the user from the supporter list of the 2 tiles
     */

    /**
    * Check links change of the selected tile(s), and update the database
    * @param selectedTileIndex  Number the selected tile index
    * @param aroundTilesBefore  Tiles indexes around the selected before one step
    * @param aroundTilesAfter  Tiles indexes around the selected after one step
    * e.g. ({
        "round_id":0,
        "selectedTile": 1,
        "aroundTiles":[{
            "before": -1,
            "after": 3
        },{
            "before": -1,
            "after": -1
        },{
                "before": 2,
            "after": 3
        },{
                "before": -1,
            "after": -1
        }]
    })
    */
    function computeSubGraph(tile) {
        instance.subGraphNodesCount = 0;

        var selectedTileIndex = getTileIndex(tile);
        var aroundTilesBefore = tile.oldAroundTiles;
        var aroundTilesAfter = tile.aroundTiles;

        var preSize = instance.subGraphData.length;
        dfsGraph(selectedTileIndex);
        if (preSize < instance.subGraphData.length) {
            updateGraphSize(preSize);
        }
        instance.subGraphNodesCount = 0;

        for (var i = 0; i < 4; i++) {
            if (aroundTilesBefore[i] >= 0) {
                preSize = instance.subGraphData.length;
                dfsGraph(aroundTilesBefore[i]);
                if (preSize < instance.subGraphData.length) {
                    updateGraphSize(preSize);
                }
                instance.subGraphNodesCount = 0;

                if (aroundTilesBefore[i] != aroundTilesAfter[i]) {
                    var beHinted = (aroundTilesBefore[i] == Math.floor(tile.hintedLinks[i]));
                    removeLink = generateLinksTags(selectedTileIndex, aroundTilesBefore[i], i, beHinted);
                    removeLink.size = -tile.subGraphSize;
                    removeLink.nodes = tile.nodesCount;
                    instance.removeLinksData.push(removeLink);
                }
            }
            if (aroundTilesAfter[i] >= 0) { // useless
                preSize = instance.subGraphData.length;
                dfsGraph(aroundTilesAfter[i]);
                if (preSize < instance.subGraphData.length) {
                    updateGraphSize(preSize);
                }
                instance.subGraphNodesCount = 0;
            }
        }

        return true;
    }

    function uploadGraphData() {
        instance.subGraphData = instance.removeLinksData.concat(instance.subGraphData);
        //console.log(instance.subGraphData);
        instance.getHintsArray = new Array();
        for (var i = 0; i < instance.subGraphData.length; i++) {
            var linksData = instance.subGraphData[i];
            var xTile = instance.tiles[linksData.x];
            var yTile = instance.tiles[linksData.y];
            if (linksData.size < 0) {
                xTile.subGraphSize = 0;
                yTile.subGraphSize = 0;
                xTile.nodesCount = 1;
                yTile.nodesCount = 1;
            }
            else {
                xTile.subGraphSize = linksData.size;
                yTile.subGraphSize = linksData.size;
                xTile.nodesCount = linksData.nodes;
                yTile.nodesCount = linksData.nodes;
                if (!xTile.allAroundByTiles) {
                    instance.getHintsArray[linksData.x] = true;
                }
                if (!yTile.allAroundByTiles) {
                    instance.getHintsArray[linksData.y] = true;
                }
            }
        }

        instance.maxSubGraphSize = 0;
        for (var i = 0; i < instance.tiles.length; i++) {
            var tile = instance.tiles[i];
            if (tile.subGraphSize > instance.maxSubGraphSize) {
                instance.maxSubGraphSize = tile.subGraphSize;
            }
        }

        if (instance.subGraphData.length > 0) {
            var param = {
                player_name: player_name,
                round_id: roundID,
                edges: instance.subGraphData
            };
            //console.log(param);
            if(players_num > 1){
                //socket.emit("upload", param);
            }
        }

        instance.dfsGraphLinksMap = new Array();
        instance.subGraphData = new Array();
        instance.removeLinksData = new Array();
    }

    function hideAllColorBorder() {
        for (var i = 0; i < instance.tiles.length; i++) {
            var tile = instance.tiles[i];
            if (tile.differentColor.length > 0) {
                tile.topEdge.visible = false;
                tile.rightEdge.visible = false;
                tile.bottomEdge.visible = false;
                tile.leftEdge.visible = false;
                tile.colorBorder.visible = false;
                tile.differentColor = new Array();
                tile.colorDirection = new Array();
            }
            tile.opacity = 1;
        }
    }

    function hideColorBorder(index) {
        var tile = instance.tiles[index];
        if (tile.differentColor.length > 0) {
            tile.topEdge.visible = false;
            tile.rightEdge.visible = false;
            tile.bottomEdge.visible = false;
            tile.leftEdge.visible = false;
            tile.colorBorder.visible = false;
        }
        for (var i = 0; i < instance.tiles.length; i++) {
            var tile = instance.tiles[i];
            if (tile.differentColor.length == 0) {
                tile.opacity = 1;
            }
        }
    }

    function setGradientStrockColor(path, color) {
        path.strokeColor = {
            gradient: {
                stops: [[color, 0.7], ['white', 1]],
                radial: true
            },
            origin: path.position,
            destination: path.bounds
        };
    }

    function showColorBorder(index, direction, colorIndex, pushToArray) {
        var tile = instance.tiles[index];
        console.log("unsureHintsColor:"+instance.unsureHintsColor[colorIndex]);
        switch (direction) {
            case 0:
                tile.topEdge.visible = true;
                setGradientStrockColor(tile.topEdge, instance.unsureHintsColor[colorIndex]);
                break;
            case 1:
                tile.rightEdge.visible = true;
                setGradientStrockColor(tile.rightEdge, instance.unsureHintsColor[colorIndex]);
                break;
            case 2:
                tile.bottomEdge.visible = true;
                setGradientStrockColor(tile.bottomEdge, instance.unsureHintsColor[colorIndex]);
                break;
            case 3:
                tile.leftEdge.visible = true;
                setGradientStrockColor(tile.leftEdge, instance.unsureHintsColor[colorIndex]);
                break;
            default:
                tile.colorBorder.visible = true;
                setGradientStrockColor(tile.colorBorder, instance.unsureHintsColor[colorIndex]);
                break;
        }
        if (pushToArray) {
            var repeated = false;
            for (var i = 0; i < tile.differentColor.length; i++) {
                if (tile.differentColor[i] == direction) {
                    repeated = true;
                }
            }
            if (!repeated) {
                tile.differentColor.push(direction);
                tile.colorDirection.push(colorIndex);
            }
        }
    }

    function normalizeTiles(forAskHelp) {
        for (var i = 0; i < instance.tiles.length; i++) {
            var tile = instance.tiles[i];
            var position = tile.position;

            var cellPosition = new Point(
                Math.round(position.x / instance.tileWidth),//returns int closest to arg
                Math.round(position.y / instance.tileWidth));

            tile.position = cellPosition * instance.tileWidth; // round position(actual (x,y) in the canvas)
            tile.cellPosition = cellPosition; // cell position(in which grid the tile is)

            tile.relativePosition = new Point(0, 0);
            tile.picking = false;
            tile.moved = false; // if one tile just clicked or actually moved(if moved, opacity=1)
            if (!forAskHelp) {
                tile.aroundTilesChanged = false;
            }
            tile.wantToMoveAway = -1;
            tile.positionMoved = false;
        }
    }

    function checkHints(selectedTileIndex, dir, hintIndex) {
        if (hintIndex < 0) {
            return;
        }
        totalHintsNum += 1;
        var correctIndex = selectedTileIndex + directions[dir].x + directions[dir].y * instance.tilesPerRow;
        if (hintIndex == correctIndex) {
            correctHintsNum += 1;
        }
    }

    function uploadHintedSubGraph() {
        for (var i in instance.hintedTilesMap) {
            var tile = instance.tiles[i];
            refreshAroundTiles(tile, true);
        }

        for (var i in instance.hintedTilesMap) {
            var tile = instance.tiles[i];
            if (tile.aroundTilesChanged) {
                computeSubGraph(tile);
            }
        }

        uploadGraphData();
        instance.hintedTilesMap = new Array();
    }

    function getHints(round_id, selectedTileIndexes) {
        // var hintTileIndexes=new Array(-1,-1,-1,-1);
        var currentStep = instance.steps;
        var getHintsIndex = new Array();
        for (var i = 0; i < instance.getHintsArray.length; i++) {
            if (instance.getHintsArray[i]) {
                getHintsIndex.push(i);
            }
        }
    }

    function focusOnTile(tile) {
        view.scrollBy(tile.position - view.center);
    }

    function processUnsureHints(unsureHints, indexes) {
        if (!unsureHints) {
            return;
        }
        hideAllColorBorder();
        var indexesMap = {};
        if (indexes) {
            for (var i = 0; i < indexes.length; i++) {
                indexesMap[indexes[i]] = true;
            }
        }
        var colorIndex = 0;
        for (var i = 0; i < unsureHints.length; i++) {
            if (unsureHints[i] && colorIndex < instance.unsureHintsColor.length) {
                var unsureHint = unsureHints[i];
                var index = unsureHint.index;
                if (!indexes || indexesMap[index]) {
                    for (var d = 0; d < 4; d++) {
                        if (unsureHint.aroundTiles[d].length > 0 &&
                            instance.tiles[index].aroundTiles[d] < 0) {
                            //showUnsureHintColor(index, unsureHint.aroundTiles[d], d, colorIndex);
                            if (colorIndex == 0) {
                                focusOnTile(instance.tiles[index]);
                            }
                            colorIndex += 1;
                            if (colorIndex >= instance.unsureHintsColor.length) {
                                break;
                            }
                        }
                    }
                }
            }
            else {
                break;
            }
        }
        if (colorIndex > 0) {
            for (var i = 0; i < instance.tiles.length; i++) {
                var tile = instance.tiles[i];
                if (!tile.differentColor || tile.differentColor.length == 0) {
                    tile.opacity = 0.25;
                }
            }
        }
    }

    function countBidirectionLinks(sureHints){
        var bidirectionLinks = new Array();
        for (var i = 0; i < sureHints.length; i++) {
            bidirectionLinks[i] = {
                count: 0,
                aroundTiles: [false, false, false, false]
            }
            for (var j = 0; j < 4; j++) {
                var oppositiveTileIndex = sureHints[i][j];
                if(oppositiveTileIndex != -1){
                    var oppositiveEdge = oppositiveEdges[j];
                    if(i == sureHints[oppositiveTileIndex][oppositiveEdge]){
                        bidirectionLinks[i].count += 1;
                        bidirectionLinks[i].aroundTiles[j] = true;
                    }
                }
            }
        }
        return bidirectionLinks;
    }

    function showStrongAndWeakHints(sureHints, strongHintsNeededTiles){
        var shouldSave = false;

        var bidirectionLinks = countBidirectionLinks(sureHints);
        var weakHintsNeededTiles = new Array();
        while(strongHintsNeededTiles.length > 0){
            var index = strongHintsNeededTiles.shift();
            var tile = instance.tiles[index];
            for (var j = 0; j < 4; j++) {
                if(tile.aroundTiles[j] >= 0){
                    continue;
                }
                var hintTileIndex = sureHints[index][j];
                if (hintTileIndex > -1) {
                    var hintTile = instance.tiles[hintTileIndex];
                    if(bidirectionLinks[index].aroundTiles[j] && hintTile.noAroundTiles){
                        var shouldSaveThis = showHints(index, sureHints[index], j);
                        normalizeTiles(true);
                        shouldSave = shouldSave || shouldSaveThis;
                        if(tile.aroundTiles[j] >= 0){
                            strongHintsNeededTiles.push(hintTileIndex);
                        }
                    }
                    else{
                        weakHintsNeededTiles.push(index);
                    }
                }
            }
        }
 
        for (var i = 0; i < weakHintsNeededTiles.length; i++) {
            var index = weakHintsNeededTiles[i];
            for (var j = 0; j < 4; j++) {
                if (sureHints[index][j] > -1 && bidirectionLinks[index].aroundTiles[j]) {
                    var shouldSaveThis = showHints(index, sureHints[index], -1);
                    normalizeTiles(true);
                    shouldSave = shouldSave || shouldSaveThis;
                }
            }
        }
        return shouldSave;
    }

    // socket.on("reactiveHints", function (data) {
    //     console.log("hints:", data);
    //     if (data.sureHints.length == 0) {
    //         return;
    //     }
    //     var currentStep = data.currentStep;
    //     if (!mousedowned && currentStep == instance.steps) {
    //         instance.hintsShowing = true;

    //         instance.hintAroundTilesMap = data.sureHints;
    //         computeMultiHintsConflict(data.sureHints, data.indexes);

    //         var strongHintsNeededTiles = new Array();
    //         for (var i = 0; i < data.indexes.length; i++) {
    //             var index = data.indexes[i];
    //             var tile = instance.tiles[index];
    //             for (var j = 0; j < 4; j++) {
    //                 if (tile.aroundTiles[j] < 0 && data.sureHints[index][j] > -1) {
    //                     strongHintsNeededTiles.push(index);
    //                     break;
    //                 }
    //             }
    //         }

    //         var shouldSave = showStrongAndWeakHints(data.sureHints, strongHintsNeededTiles);

    //         if (shouldSave) {
    //             saveGame();
    //         }

    //         uploadHintedSubGraph();
    //         normalizeTiles();

    //         // judge the hint tiles
    //         if (!instance.gameFinished) {
    //             var errors = checkTiles();
    //             if (errors == 0) {
    //                 finishGame();
    //             }
    //         }

    //         if (!shouldSave){
    //             processUnsureHints(data.unsureHints, data.selectedTileIndexes);
    //         }

    //         instance.hintsShowing = false;
    //     }
    // });

    function showHints(selectedTileIndex, hintTiles, direction) {
        var tile = instance.tiles[selectedTileIndex];

        var shouldSave = false;

        var cellPosition = tile.cellPosition;

        if (!hintTiles) {
            return;
        }

        var hintTilesCount = 0;
        for (var j = 0; j < hintTiles.length; j++) {
            if(direction >= 0 && j != direction){
                continue;
            }

            var correctTileIndex = hintTiles[j];
            if (correctTileIndex < 0) {
                continue;
            }

            if (instance.multiHintsMap[correctTileIndex] &&
                instance.multiHintsMap[correctTileIndex][j] > 1) {
                //console.log("multiHints conflictTile");
                continue;
            }

            if (tile.aroundTiles && tile.aroundTiles[j] >= 0) {
                //console.log("already has aroundTiles", tile.aroundTiles[j], "in direction", j);
                continue;
            }


            if (tile.conflictTiles[correctTileIndex]) {
                //console.log("conflictTile");
                continue;
            }

            var correctTile = instance.tiles[correctTileIndex];

            if (correctTile.picking) {
                continue;
            }

            var correctCellposition = cellPosition + directions[j];

            var groupTiles = new Array();

            DFSTiles(correctTile, groupTiles, new Point(0, 0));

            var sameGroup = false;
            for (var i = 0; i < groupTiles.length; i++) {
                if (getTileIndex(groupTiles[i]) == selectedTileIndex) {
                    sameGroup = true;
                    break;
                }
            }

            if (sameGroup) {
                if (correctTile.allLinksHinted) {
                    groupTiles = new Array();
                    groupTiles.push(correctTile);
                }
                else {
                    continue;
                }
            }

            for (var i = 0; i < groupTiles.length; i++) {
                groupTiles[i].picking = true;
            }

            var hasConflict = checkConflict(groupTiles, correctCellposition);
            if (hasConflict && correctTile.allLinksHinted) {
                for (var i = 0; i < groupTiles.length; i++) {
                    groupTiles[i].picking = false;
                }

                groupTiles = new Array();
                groupTiles.push(correctTile);
                for (var i = 0; i < groupTiles.length; i++) {
                    groupTiles[i].picking = true;
                }
                hasConflict = checkConflict(groupTiles, correctCellposition);
            }


            if (!hasConflict) {
                //checkHints(selectedTileIndex, j, correctTileIndex);

                for (var i = 0; i < groupTiles.length; i++) {
                    var hintTile = groupTiles[i];
                    placeTile(hintTile, correctCellposition + hintTile.relativePosition);
                    if (hintTile.positionMoved) {
                        instance.hintedTilesMap[getTileIndex(hintTile)] = true;
                    }
                    shouldSave = shouldSave || hintTile.positionMoved;
                    hintTile.relativePosition = new Point(0, 0);
                    hintTile.alreadyHinted = true;
                    hintTile.picking = false;
                    //console.log("put", hintTile.name, "in position", hintTile.cellPosition, hintTile.positionMoved);
                }

                for (var i = 0; i < groupTiles.length; i++) {
                    var hintTile = groupTiles[i];
                    refreshAroundTiles(hintTile, true);
                    hintTile.picking = false;
                }

                hintTilesCount += groupTiles.length;
            }
        }
        if (hintTilesCount) {
            tile.alreadyHinted = true;
        }

        return shouldSave;
    }

    function getTileAtCellPosition(cellPosition) {
        var roundPosition = cellPosition * instance.tileWidth;
        var retTile = undefined;
        var hitResults = project.hitTestAll(roundPosition);
        for (var i = 0; i < hitResults.length; i++) {
            var hitResult = hitResults[i];
            if (hitResult.type != "pixel") {
                continue;
            }
            var img = hitResult.item;
            var tile = img.parent.parent;
            if (!tile.picking) {
                retTile = tile;
            }
        }
        return retTile;
    }

    this.animation = function () {
        var changeOpacity = function (path) {
            var speed = 0.005;
            var upperBound = 0.7;
            var lowwerBound = 0.1;
            if (path.reverse) {
                path.opacity += speed;
                if (path.opacity >= upperBound) {
                    path.reverse = false;
                }
            }
            else {
                path.opacity -= speed;
                if (path.opacity <= lowwerBound) {
                    path.reverse = true;
                }
            }
        }

        // for (var i = 0; i < instance.tiles.length; i++) {
        //     var tile = instance.tiles[i];
        //     if (tile.differentColor.length > 0) {
        //         for (var j = 0; j < tile.differentColor.length; j++) {
        //             var edgeIndex = tile.differentColor[j];
        //             switch (edgeIndex) {
        //                 case 0:
        //                     //tile.topEdge.strokeColor.hue += 1;
        //                     changeOpacity(tile.topEdge);
        //                     break;
        //                 case 1:
        //                     //tile.rightEdge.strokeColor.hue += 1;
        //                     changeOpacity(tile.rightEdge);
        //                     break;
        //                 case 2:
        //                     //tile.bottomEdge.strokeColor.hue += 1;
        //                     changeOpacity(tile.bottomEdge);
        //                     break;
        //                 case 3:
        //                     //tile.leftEdge.strokeColor.hue += 1;
        //                     changeOpacity(tile.leftEdge);
        //                     break;
        //                 default:
        //                     //tile.colorBorder.strokeColor.hue += 1;
        //                     changeOpacity(tile.colorBorder);
        //                     break;
        //             }
        //         }
        //     }
        // }
    }

    this.dragTile = function (delta) {
        if (instance.draging) {
            if (!instance.selectedTile || !instance.selectedTile[0]) {
                instance.selectedTile = null;
                instance.draging = false;
                return;
            }
            var centerPosition = instance.selectedTile[0].position;
            if (instance.selectedTile[0].differentColor.length > 0) {
                hideColorBorder(getTileIndex(instance.selectedTile[0]));
            }
            else {
                hideAllColorBorder();
            }
            for (var i = 0; i < instance.selectedTile.length; i++) {
                var tile = instance.selectedTile[i];
                tile.opacity = 1;
                tile.position = centerPosition + tile.relativePosition * instance.tileWidth + delta;
            }
        }
        else if (!instance.tileSelectTimeout) {
            var currentScroll = view.currentScroll - delta * instance.currentZoom;
            view.scrollBy(currentScroll);
            view.currentScroll = currentScroll;
        }
    }

    function DFSTiles(tile, array, relativePosition) {
        for (var i = 0; i < array.length; i++) {
            if (array[i] == tile)
                return;
        }
        tile.relativePosition = relativePosition;
        tile.originPosition = tile.cellPosition;
        array.push(tile);
        for (var i = 0; i < 4; i++) {
            var newTileIndex = tile.aroundTiles[i];
            if (newTileIndex >= 0) {
                var newTile = instance.tiles[newTileIndex];
                DFSTiles(newTile, array, relativePosition + directions[i]);
            }
        }
    }

    function findSelectTile(point) {
        var cellPosition = new Point(
            Math.round(point.x / instance.tileWidth),//returns int closest to arg
            Math.round(point.y / instance.tileWidth));
        var hitResult = project.hitTest(point);
        if (!hitResult || hitResult.type != "pixel") {
            instance.selectedTile = null;
            return;
        }
        var img = hitResult.item;
        var tile = img.parent.parent;
        // console.log(tile.name);
        if (tile.picking) {
            instance.selectedTile = null;
            return;
        }
        if (tile && tile.name) {
            instance.selectedTile = new Array();
            if (instance.dragMode == "tile-First") {
                instance.selectedTile.push(tile);
            }
            else {
                DFSTiles(tile, instance.selectedTile, new Point(0, 0));
            }
        }
        else {
            instance.selectedTile = null;
        }
    }

    this.dragTileOrTiles = function () {
        if (instance.dragMode == "tile-First") {
            instance.dragDFSTile();
        }
        else {
            instance.dragOnlyTile();
        }
    }

    this.dragOnlyTile = function () {
        if (instance.selectedTile) {
            for (var i = 1; i < instance.selectedTile.length; i++) {
                instance.selectedTile[i].opacity = 0.5;
                instance.selectedTile[i].picking = false;
            }
            var tile = instance.selectedTile[0];
            instance.selectedTile = new Array();
            instance.selectedTile.push(tile);
        }
    }

    this.dragDFSTile = function () {
        if (instance.selectedTile) {
            var tile = instance.selectedTile[0];
            instance.selectedTile = new Array();
            DFSTiles(tile, instance.selectedTile, new Point(0, 0));
            for (var i = 0; i < instance.selectedTile.length; i++) {
                instance.selectedTile[i].opacity = 0.5;
                instance.selectedTile[i].picking = instance.selectedTile[0].picking;
            }
        }
    }

    this.zoom = function (zoomDelta) {
        var newZoom = instance.currentZoom + zoomDelta;
        if (newZoom >= 0.2 && newZoom <= 5) {
            view.zoom = instance.currentZoom = newZoom;
        }
    }

    function checkTiles() {
        var errors = 0;
        var firstTile = instance.tiles[0];
        var firstCellPosition = firstTile.cellPosition;

        for (var y = 0; y < instance.tilesPerColumn; y++) {
            for (var x = 0; x < instance.tilesPerRow; x++) {
                var index = y * instance.tilesPerRow + x;
                var cellPosition = instance.tiles[index].cellPosition;

                if (cellPosition != firstCellPosition + new Point(x, y)) {
                    errors++;
                }
            }
        }

        return errors;
    }

    this.showLastResult = function () {
        var visible = instance.puzzleImage.visible;
        for (var i = 0; i < instance.tiles.length; i++) {
            instance.tiles[i].visible = visible;
        }
        instance.puzzleImage.visible = !visible;
    }

    function saveGame() {
        var tilePositions = new Array();
        var tileHintedLinks = new Array();
        for (var i = 0; i < instance.tiles.length; i++) {
            var tile = instance.tiles[i];
            var tilePos = {
                index: i,
                subGraphSize: tile.subGraphSize,
                nodesCount: tile.nodesCount,
                x: tile.cellPosition.x,
                y: tile.cellPosition.y,
            };
            tilePositions.push(tilePos);
            tileHintedLinks.push(tile.hintedLinks);
        }

        socket.emit('share_saveGame', {
            seq_num: instance.seq_num || 1,
            round_id: roundID,
            player_name: player_name,
            steps: instance.steps,
            realSteps: instance.realSteps,
            startTime: startTime,
            maxSubGraphSize: instance.maxSubGraphSize,
            tiles: JSON.stringify(tilePositions),
            tileHintedLinks: JSON.stringify(tileHintedLinks),
            totalHintsNum: totalHintsNum,
            correctHintsNum: correctHintsNum
        });
    }

    socket.on('isLock',function(data){
        console.log("lock:"+data.lock);
        clearTimeout(instance.tileSelectTimeout);
        instance.tileSelectTimeout = null;
        someonelock = data.lock;
        if(someonelock!=1){
            mousedowned = true;
            var tilesCount = puzzle.pickTile(tilePoint);
            if (tilesCount > 0) {
                timeoutFunction = setTimeout(puzzle.dragTileOrTiles, 500);
            }
        }else{
            for(var i=0;i<data.slockTileIndexes.length;i++){
                var tile = instance.tiles[data.slockTileIndexes[i]];
                tile.colorBorder.visible = true;
                setGradientStrockColor(tile.colorBorder, 'red');
            }
            
        }
        console.log("get someonelock:",someonelock);

         var selectedTileIndexes = new Array();
            if(instance.selectedTile != null){
                for (var i = 0; i < instance.selectedTile.length; i++) {
                    selectedTileIndexes.push(getTileIndex(instance.selectedTile[i]));
                }
            }
            //console.log("aaaaaaaaaaaaa");
            if(!data.gameData){
                createAndPlaceTiles1(true);
                console.log('create tiles in reload');
                return;
            }

            var gameData = data.gameData;
            var needIntro = !gameData.round_id;
            if (gameData.round_id == roundID) {

                startTime = gameData.startTime;
                instance.seq_num = gameData.seq_num || 1;
                instance.maxSubGraphSize = gameData.maxSubGraphSize;
                instance.steps = gameData.steps;
                instance.realSteps = gameData.realSteps;
                document.getElementById("steps").innerHTML = instance.realSteps;
                instance.saveTilePositions = JSON.parse(gameData.tiles);
                instance.saveHintedLinks = JSON.parse(gameData.tileHintedLinks);
                totalHintsNum = gameData.totalHintsNum;
                correctHintsNum = gameData.correctHintsNum;
            } 
            
            //console.log("roundid:"+roundID);
            
            for (var i = 0; i < instance.saveTilePositions.length; i++) {
                var isConflict = false;
                var tilePos = instance.saveTilePositions[i];
                var tile = instance.tiles[tilePos.index];
                var tileIndex = getTileIndex(tile);
                if(selectedTileIndexes.length!=0){
                    for(var j = 0;j < selectedTileIndexes.length;j++){
                        if(tileIndex == selectedTileIndexes[j]){
                            isConflict = true;
                        }
                    }
                }
                if(!isConflict && !tile.picking){
                    placeTile(tile, new Point(tilePos.x, tilePos.y));
                }
                tile.moved = false; // if one tile just clicked or actually moved(if moved, opacity=1)

            }
            setTimeout(function(){
                for(var i=0;i<data.slockTileIndexes.length;i++){
                    var tile = instance.tiles[data.slockTileIndexes[i]];
                    tile.topEdge.visible = false;
                    tile.rightEdge.visible = false;
                    tile.bottomEdge.visible = false;
                    tile.leftEdge.visible = false;
                    tile.colorBorder.visible = false;
                    tile.differentColor = new Array();
                    tile.colorDirection = new Array();
                    tile.opacity = 1;
                }  
            
            },2000);

            if (!instance.gameFinished) {
                var errors = checkTiles();
                if (errors == 0) {
                    finishGame();
                }
            }
    });
    socket.on('drag',function(data){
        console.log("some one draging");
        var ca = document.getElementById("canvas");
        ca.getContext("2d").clearRect(0, 0, ca.width, ca.height);
        mousedowned = true;
        if (timeoutFunction) {
            clearTimeout(timeoutFunction);
        }
        puzzle.dragTile(data.Delta);
        
    });
   
    socket.on('loadGameSuccess', function (data) {
        //console.log("loadGame username:"+data.username);
        if (data.username == player_name) {
            if(!data.gameData){
                console.log("nogameData", data);
                instance.randomSequence = data.randomSeq;
                createAndPlaceTiles(true);
                return;
            }
            console.log("hasgameData:"+data.gameData);
            // someoneOp = 0;
            var gameData = data.gameData;
            var needIntro = !gameData.round_id;
            if (gameData.round_id == roundID) {
                $.amaran({
                    'title': 'loadGame',
                    'message': 'Progress loaded.',
                    'inEffect': 'slideRight',
                    'cssanimationOut': 'zoomOutUp',
                    'position': "top right",
                    'delay': 2000,
                    'closeOnClick': true,
                    'closeButton': true
                });
                startTime = gameData.startTime;
                instance.seq_num = gameData.seq_num || 1;
                instance.maxSubGraphSize = gameData.maxSubGraphSize;
                instance.steps = gameData.steps;
                instance.realSteps = gameData.realSteps;
                document.getElementById("steps").innerHTML = instance.realSteps;
                instance.saveTilePositions = JSON.parse(gameData.tiles);
                instance.saveHintedLinks = JSON.parse(gameData.tileHintedLinks);
                totalHintsNum = gameData.totalHintsNum;
                correctHintsNum = gameData.correctHintsNum;
            }
            console.log("roundid:"+roundID);
            createAndPlaceTiles(needIntro);
        }
    });
    socket.on('updateSaveGame', function (data) {
        if (!instance.tiles) {
            return;
        }
        var gameData = data.gameData;
        if (gameData && gameData.round_id == roundID) {
            startTime = gameData.startTime;
            instance.seq_num = gameData.seq_num || 1;
            instance.maxSubGraphSize = gameData.maxSubGraphSize;
            instance.steps = gameData.steps;
            instance.realSteps = gameData.realSteps;
            document.getElementById("steps").innerHTML = instance.realSteps;
            instance.saveTilePositions = JSON.parse(gameData.tiles);
            instance.saveHintedLinks = JSON.parse(gameData.tileHintedLinks);
            totalHintsNum = gameData.totalHintsNum;
            correctHintsNum = gameData.correctHintsNum;
            for (var i = 0; i < instance.saveTilePositions.length; i++) {
                var tilePos = instance.saveTilePositions[i];
                var tile = instance.tiles[tilePos.index];
                if(!tile.picking){
                    placeTile(tile, new Point(tilePos.x, tilePos.y));
                }
                tile.moved = false; // if one tile just clicked or actually moved(if moved, opacity=1)

            }
            if (!instance.gameFinished) {
                var errors = checkTiles();
                if (errors == 0) {
                    finishGame();
                }
            }
        } 
    });
    socket.on('updateTiles', function (data) {
        if (!instance.tiles) {
            return;
        }
        var selectedTileIndexes = new Array();
        if(instance.selectedTile != null){
            for (var i = 0; i < instance.selectedTile.length; i++) {
                    selectedTileIndexes.push(getTileIndex(instance.selectedTile[i]));
            }
        }
        if(!data.gameData){
            createAndPlaceTiles1(true);
            return;
        }
        var gameData = data.gameData;
        var needIntro = !gameData.round_id;
        if (gameData.round_id == roundID) {
            startTime = gameData.startTime;
            instance.seq_num = gameData.seq_num || 1;
            instance.maxSubGraphSize = gameData.maxSubGraphSize;
            instance.steps = gameData.steps;
            instance.realSteps = gameData.realSteps;
            document.getElementById("steps").innerHTML = instance.realSteps;
            instance.saveTilePositions = JSON.parse(gameData.tiles);
            instance.saveHintedLinks = JSON.parse(gameData.tileHintedLinks);
            totalHintsNum = gameData.totalHintsNum;
            correctHintsNum = gameData.correctHintsNum;
        } 
        
        for (var i = 0; i < instance.saveTilePositions.length; i++) {
            var isConflict = false;
            var tilePos = instance.saveTilePositions[i];
            var tile = instance.tiles[tilePos.index];
            var tileIndex = getTileIndex(tile);
            if(selectedTileIndexes.length!=0){
                for(var j = 0;j < selectedTileIndexes.length;j++){
                    if(tileIndex == selectedTileIndexes[j]){
                        isConflict = true;
                        //backConflictTile.push();
                    }
                }
            }
            if(!isConflict && !tile.picking){
                placeTile(tile, new Point(tilePos.x, tilePos.y));
            }
            tile.moved = false; // if one tile just clicked or actually moved(if moved, opacity=1)

        }
        puzzle.releaseTile();  
        mousedowned = false;
        someonelock = -1;

        if (!instance.gameFinished) {
            var errors = checkTiles();
            if (errors == 0) {
                finishGame();
            }
        }
    });
    socket.on('reloadGameSuccess', function (data) {
        console.log('reloadGameSuccess username:'+data.username);
        //if (data.username == player_name) {
            var selectedTileIndexes = new Array();
            if(instance.selectedTile != null){
                for (var i = 0; i < instance.selectedTile.length; i++) {
                        selectedTileIndexes.push(getTileIndex(instance.selectedTile[i]));
                }
            }
            //console.log("aaaaaaaaaaaaa");
            if(!data.gameData){
                createAndPlaceTiles1(true);
                console.log('create tiles in reload');
                return;
            }
            //reset()
            // someoneOp = 0;
            var gameData = data.gameData;
            var needIntro = !gameData.round_id;
            if (gameData.round_id == roundID) {
                // $.amaran({
                //     'title': 'reloadGame',
                //     //'message': 'Progress reloaded.',
                //     'inEffect': 'slideRight',
                //     'cssanimationOut': 'zoomOutUp',
                //     'position': "top right",
                //     'delay': 2000,
                //     'closeOnClick': true,
                //     'closeButton': true
                // });
                startTime = gameData.startTime;
                instance.seq_num = gameData.seq_num || 1;
                instance.maxSubGraphSize = gameData.maxSubGraphSize;
                instance.steps = gameData.steps;
                instance.realSteps = gameData.realSteps;
                document.getElementById("steps").innerHTML = instance.realSteps;
                instance.saveTilePositions = JSON.parse(gameData.tiles);
                instance.saveHintedLinks = JSON.parse(gameData.tileHintedLinks);
                totalHintsNum = gameData.totalHintsNum;
                correctHintsNum = gameData.correctHintsNum;
            } 
            
            console.log("roundid:"+roundID);
            
            for (var i = 0; i < instance.saveTilePositions.length; i++) {
                var isConflict = false;
                var tilePos = instance.saveTilePositions[i];
                var tile = instance.tiles[tilePos.index];
                var tileIndex = getTileIndex(tile);
                if(selectedTileIndexes.length!=0){
                    for(var j = 0;j < selectedTileIndexes.length;j++){
                        if(tileIndex == selectedTileIndexes[j]){
                            isConflict = true;
                            console.log("aaaaaaaaaaaa");
                        }
                    }
                }
                if(!isConflict){
                    placeTile(tile, new Point(tilePos.x, tilePos.y));
                }
                tile.moved = false; // if one tile just clicked or actually moved(if moved, opacity=1)

            }
            //reset();

        //}
    });
    function loadGame() {
        socket.emit('share_loadGame', {round_id: roundID,username: player_name});
    }
    function reloadPage(){
        window.location.reload()
    }
    function findDestination(groupsArray, idx) {
        if (idx == 0) {
            return new Point(0, 0);
        }
        var group_p = groupsArray[idx];
        var img_width = instance.puzzleImage.size.width;
        var img_height = instance.puzzleImage.size.height;
        var last_idx = idx - 1;
        var des = new Point(groupsArray[last_idx].offset);
        des.x += groupsArray[last_idx].width + 1;
        if ((des.x + group_p.width) * instance.tileWidth > img_width * 2) {
            des.x = 0;
            for (var j = 0; j < idx; j++) {
                var t_group = groupsArray[j];
                des.y = Math.max(des.y, groupsArray[j].offset.y + 1 + groupsArray[j].height);
            }
        }
        //console.log(des);
        return des;
    }
    function reset() {
        //console.log('reset.........');
        var groupsArray = new Array();
        var singleArray = new Array()
        for (var i = 0; i < instance.tiles.length; i++) {
            var tile = instance.tiles[i];
            if (tile.picking) {
                continue;
            }
            var groupTiles = new Array();
            DFSTiles(tile, groupTiles, new Point(0, 0));
            var links = 0;
            var leftTopPoint = new Point(groupTiles[0].cellPosition.x, 
                groupTiles[0].cellPosition.y);
            var rightBottomPoint = new Point(groupTiles[0].cellPosition.x, 
                groupTiles[0].cellPosition.y);
            for (var j = 0; j < groupTiles.length; j++) {
                var gt = groupTiles[j]; 
                gt.picking = true;
                leftTopPoint.x = Math.min(leftTopPoint.x, gt.cellPosition.x);
                leftTopPoint.y = Math.min(leftTopPoint.y, gt.cellPosition.y);
                rightBottomPoint.x = Math.max(rightBottomPoint.x, gt.cellPosition.x);
                rightBottomPoint.y = Math.max(rightBottomPoint.y, gt.cellPosition.y);
                for (var d = 0; d < 4; d++) {
                    if (gt.aroundTiles[d] >= 0) {
                        links += 1;
                    }
                }
            }
            if (links == 0) {
                singleArray.push({
                    tile: tile,
                    x: tile.cellPosition.x,
                    y: tile.cellPosition.y,
                    index: i
                });
                continue;
            }
            var nodes = groupTiles.length;
            links /= 2;
            groupsArray.push({
                nodes: nodes,
                links: links,
                ratio: links * links / nodes,
                groupTiles: groupTiles,
                width: rightBottomPoint.x - leftTopPoint.x + 1, 
                height: rightBottomPoint.y - leftTopPoint.y + 1,
                offset: new Point(0, 0)
            });
        }
        if (groupsArray.length == 0) {
            return;
        }
        var originPosition = new Point(groupsArray[0].groupTiles[0].position);
        groupsArray.sort(function (a, b) {
            return b.ratio - a.ratio;
        });
        singleArray.sort(function (a, b) {
            if (a.y == b.y) {
                return a.x - b.x;
            }
            return a.y - b.y;
        });
        //console.log(groupsArray);
        var width = instance.puzzleImage.size.width;
        var height = instance.puzzleImage.size.height;
        var rootPosition = view.center - new Point(width, height);
        var rootCellPosition = new Point(0, 0); 
        //console.log(rootCellPosition);
        var group_width = 0
        var group_height = 0;       
        for (var i = 0; i < groupsArray.length; i++) {
            var group = groupsArray[i];
            var destination = findDestination(groupsArray, i);
            group.offset = destination;
            group_height = Math.max(destination.y + group.height, group_height);
            group_width = Math.max(destination.x + group.width, group_width);
            destination += rootCellPosition;
            //console.log(destination);
            for (var j = 0; j < group.groupTiles.length; j++) {
                var tile = group.groupTiles[j];
                placeTile(tile, destination + tile.relativePosition);
                tile.relativePosition = new Point(0, 0);
                tile.picking = false;
            }
        }
        // var afterPosition = new Point(groupsArray[0].groupTiles[0].position);
        // //console.log(singleArray);
        // // randomly select tiles and place them one by one 
        // rootCellPosition.y += group_height + 1;
        // var xTileCount = instance.tilesPerRow;
        // var yTileCount = Math.ceil(singleArray.length / xTileCount);
        // for (var y = 0; y < yTileCount; y++) {
        //     for (var x = 0; x < xTileCount; x++) {
        //         var idx = y * xTileCount + x;
        //         if (idx >= singleArray.length) {
        //             break;
        //         }
        //         var single = singleArray[idx];
        //         var tile = single.tile;

        //         var cellPosition = new Point(rootCellPosition.x + (x * 2 + ((y % 2))),
        //             rootCellPosition.y + y);

        //         tile.position = cellPosition * instance.tileWidth; // round position(actual (x,y) in the canvas)
        //         tile.cellPosition = cellPosition; // cell position(in which grid the tile is)
        //     }
        // }
        // normalizeTiles();
        // var delta = afterPosition - originPosition;
        // var currentScroll = view.currentScroll + delta * instance.currentZoom;
        // view.scrollBy(currentScroll);
    }
}


/**
 * Game Finish
 */
(function () {
    if(players_num == 1){
        $('.rating-body').css('display', 'none');
    }
    else{
        // $('#apply-button').attr('disabled',"true");
        // $('#submit-button').attr('disabled',"true");
        // $('.rb-rating').rating({
        //     'showCaption': false,
        //     'showClear': false,
        //     'stars': '5',
        //     'min': '0',
        //     'max': '5',
        //     'step': '0.5',
        //     'size': 'xs',
        //     // 'starCaptions': { 0: 'NO', 1: 'Too Bad', 2: 'Little Help', 3: 'Just So So', 4: 'Great Help', 5: 'Excellent!' }
        // });
        // $('.rb-rating').change(function (event){
        //     $('#apply-button').removeAttr("disabled");
        //     $('#submit-button').removeAttr("disabled");
        // })
        $('.rating-body').css('display', 'none');
    }
    $('#submit-button').click(function (event) {
        // player's rating for the hint(what he thinks about the function)
        var rating = $("#rating2").val();

        sendRecord(true, rating);
        quitRound(roundID);
    });

    $('#quit').click(function (event) {
        $('#quitLabel').text('Are You Sure to Quit?');
        $('#ensure_quit_dialog').modal({
            keyboard: true
        });
    });

    $('#apply-button').click(function (event) {
        var rating = $("#rating").val();
        puzzle.calcHintedTile();

        sendRecord(false, rating);
        quitRound(roundID);
    });
}());

$('#undo_button').on('click', function (event) {
    if (puzzle.steps != undoStep) {
        puzzle.undoNextStep();
    }
});

$('#undo_button').mousedown(function () {
    $('#undo_button').css("background-color", "rgba(200, 200, 200, 0.9)")
});

$('#undo_button').mouseup(function () {
    $('#undo_button').css("background-color", "rgba(200, 200, 200, 0)")
});

$('#undo_button').mouseover(function () {
    $('#undo_button').css("background-color", "rgba(200, 200, 200, 0.9)")
});

$('#undo_button').mouseout(function () {
    $('#undo_button').css("background-color", "rgba(200, 200, 200, 0)")
});

$('.returnCenter').click(function () {
    puzzle.focusToCenter();
});

/**
 * Send personal records to the server at the end of one game
 */
function sendRecord(finished, rating) {
    var params = {
        round_id: roundID,
        player_name: player_name,
        finished: finished,
        steps: puzzle.realSteps,
        startTime: startTime,
        totalLinks: hintedLinksNum.totalLinks,
        hintedLinks: hintedLinksNum.hintedLinks,
        correctLinks: hintedLinksNum.correctLinks,
        totalHintsNum: totalHintsNum,
        correctHintsNum: correctHintsNum,
        rating: rating
    };
    socket.emit('saveRecord', params);
}

function quitRound(roundID) {
    if(players_num == 1){
        socket.emit('quitRound', {round_id:roundID, username: player_name});
    }
    else{
        var randomTime = Math.random() * 1000;
        $('#quitLabel').text('Quiting...');
        $('#msgLabel').text('Quiting...');
        $('.rating-body').css('display', 'none');
        $('#apply-button').attr('disabled',"true");
        $('#submit-button').attr('disabled',"true");
        $('#cancel-button').attr('disabled',"true");
        setTimeout(function(){ 
            socket.emit('quitRound', {round_id:roundID, username: player_name});
        }, randomTime);
    }
}

if(solved_players >= 3){
    puzzle.forceLeace('Three Players Have Finished the Puzzle. Please Quit.');
}


$(document).ready(function(e) { 
    var counter = 0;
    if (window.history && window.history.pushState) {
        $(window).on('popstate', function () {
            window.history.pushState('forward', null, '#');
            window.history.forward(1);
            $('#quitLabel').text('Are You Sure to Quit?');
            $('#ensure_quit_dialog').modal({
                keyboard: true
            });
        });
    }
 
    window.history.pushState('forward', null, '#'); //在IE中必须得有这两行
    window.history.forward(1);
});