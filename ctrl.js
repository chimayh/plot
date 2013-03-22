//ctrl.js

//var mouse = {x: null, y:null, color: null};
var points = Array();

var mainCtr = function($scope){
    canvas = document.getElementById('myCanvas');
    context = canvas.getContext('2d');
    skin = document.getElementById('skin');
    brushCtx = skin.getContext('2d');
    
    clearCanvas(canvas, context);
    clearCanvas(skin, brushCtx);
    context.lineWidth = 2;

    $scope.data = points;
    $scope.count = 0;
    $scope.num = 20;
    $scope.radius = 50;
    $scope.brushWidth = 100;
    $scope.rotate = 0;
    $scope.sangl = 0;
    $scope.eangl = 360;
    $scope.scalex = 100;
    $scope.scaley = 100;

    $scope.fParam = 120;
    $scope.lambda = 120;
    $scope.fcmTypes = ['sfcm', 'efcm', 'efcmy', 'efca', 'fcma'];
    $scope.fcmType = 'sfcm';

    $scope.colors = ['red', 'blue', 'green', 'orange', 'violet', 'brown', 'black'];
    $scope.currentColor = 'red';

    $scope.brushes = ['onepoint', 'random', 'line'];
    $scope.currentBrush = 'random';

    $scope.draw = function(e){
        addPoint(e);
        clearCanvas(canvas, context);
        for(i=0; i<points.length; i++){
            drawPoint(canvas, context, points[i].x, points[i].y, points[i].color);
        }
    }

    $scope.clear = function(){
        points = [];
        $scope.data = points;
        clearCanvas(canvas, context);
    }

    $scope.changeColor = function(color){
        $scope.currentColor = color;
    }

    $scope.changeBrush = function(){
        posx = $scope.x / ($scope.scalex/100);
        posy = $scope.y / ($scope.scaley/100);
        brushCtx.setTransform(1,0,0,1,0,0);
        brushCtx.clearRect(0,0,skin.width, skin.height);
        brushCtx.brushWidth = $scope.brushWidth;
        brushCtx.beginPath();
        brushCtx.translate(canvas.width/2, canvas.height/2);
        brushCtx.rotate($scope.rotate*Math.PI/180);
        brushCtx.scale($scope.scalex/100, $scope.scaley/100);
        brushCtx.translate(-canvas.width/2, -canvas.height/2);
        brushCtx.arc(canvas.width/2, canvas.height/2 , $scope.radius, -$scope.sangl*Math.PI/180, -$scope.eangl*Math.PI/180, true);
        brushCtx.stroke();
        brushCtx.closePath();
    };

    $scope.move = function(e){
        $scope.x = e.offsetX;
        $scope.y = e.offsetY;
        $scope.changeBrush();
        $scope.style = {
            top:e.offsetY - canvas.height/2+'px',
            left:e.offsetX - canvas.width/2+'px'
        };
    };

    addPoint = function(e){
            switch($scope.currentBrush){
                case 'onepoint':
                    tmpx = e.offsetX; 
                    tmpy = e.offsetY;
                    points.push({x: tmpx, y: tmpy, color: $scope.currentColor});
                    break;
                case 'random':
                    rMax2 = Math.pow($scope.radius,2);
                    rMin2 = Math.pow($scope.radius * (1.0 - $scope.brushWidth/100.0), 2);
                    thMax = $scope.eangl*Math.PI/180;
                    thMin = $scope.sangl*Math.PI/180;
                    tmprot = $scope.rotate*Math.PI/180;
                    for(var i=0; i<$scope.num; i++){
                        tmpR = Math.floor(Math.random()*(rMax2 - rMin2) + rMin2);
                        tmpTh = Math.random()*(thMax - thMin) + thMin;
                        tmpx = Math.sqrt(tmpR) * Math.cos(tmpTh);
                        tmpy = - Math.sqrt(tmpR) * Math.sin(tmpTh);
                        tmpx *= $scope.scalex/100.0;
                        tmpy *= $scope.scaley/100.0;
                        tmpx2 = tmpx*Math.cos(tmprot) - tmpy*Math.sin(tmprot);
                        tmpy2 = tmpx*Math.sin(tmprot) + tmpy*Math.cos(tmprot);
                        points.push({x: tmpx2+e.offsetX , y: tmpy2+e.offsetY, color: $scope.currentColor});
                    }
                    break;
                case 'line':
                    startX = mouse.downX;
                    startY = mouse.downY;
                    endX = mouse.upX;
                    endY = mouse.upY;
                    for(var i=0; i<$scope.num; i++){
                        tmpx = (startX - endX)*i/$scope.num + e.offsetX;
                        tmpy = (startY - endY)*i/$scope.num + e.offsetY;
                        points.push({x: tmpx, y: tmpy, color: $scope.currentColor});
                    }
                    break;
                default :
                    break;
            }
        }

    $(document).keydown(function(e){
        keychar = String.fromCharCode(e.keyCode);
        console.log(keychar);
        switch(keychar){
            case "D":
                $scope.clear();
                break;
        }
    });

    $('#clustering').click(function(){
        var txt = $('.datlist').text();
        $.post('/wsgi/fcm', {
            fcmType: $scope.fcmType,
            points: txt,
            fParam: $scope.fParam,
            lambda: $scope.lambda
        })
            .done(function(data){
                $('#result').fadeOut('fast')
                .fadeIn('fast')
                .css('background-image', 'url("/wsgi/static/img.png?'+(new Date()).getTime()+'")');
                console.log(data);
            });
    });


}

function clearCanvas(canvas, context){
    context.clearRect(0,0,canvas.width, canvas.height);
}



function drawPoint(canvas, context, x, y, color){
    context.strokeStyle = color;
    context.beginPath();
    context.arc(x, y, 3, 0, Math.PI*2, true);
    context.closePath();
    context.stroke();
}

$(function(){
    $('#copyButton').click(function(){
        var txt = $('.datlist').text();
        txt = txt.replace(/ /g,"");
        txt = txt.replace(/^\s*\n/g,"");
        txt = txt.replace(/\n\n/g,"\n");
        $('#forcopy').text(txt).select();
    });
    $('#myCanvas').click(function(){
        $('#forcopy').text("");
    });
});
