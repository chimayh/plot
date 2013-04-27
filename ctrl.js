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
    $scope.cache = [];
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

    $scope.colors = ['red', 'blue', 'green', 'orange', 'violet', 'black'];
    $scope.currentColor = 'red';

    $scope.brushes = ['onepoint', 'random', 'Gausssian'];
    $scope.currentBrush = 'random';

    $scope.canvasTop = 1;
    $scope.canvasLeft = 0;
    $scope.canvasRight = 1;
    $scope.canvasBottom = 0;


    $scope.draw = function(){
        clearCanvas(canvas, context);
        context.lineWidth = 3;
        data = ''
        /*
        for(i=0; i<points.length; i++){
            drawPoint(canvas, context, points[i].x, points[i].y, points[i].color);
            scaled = $scope.rescale(points[i]);
            data += scaled.x.toFixed(3) + ' ' + scaled.y.toFixed(3) + ' ' + points[i].color + "\n";
        }
        */
        for(i=0; i<points.length; i++){
            for(var j=0; j<20; j++){
                drawPoint(canvas, context, points[i][j].x, points[i][j].y, points[i][j].color);
                scaled = $scope.rescale(points[i][j]);
                data += scaled.x.toFixed(3) + ' ' + scaled.y.toFixed(3) + ' ' + points[i][j].color + "\n";
                $scope.count++
            }
        }
        $('.datlist').html(data);
        $('#download').replaceWith(downloadAsFile('data.txt', data));
    }

    $scope.clear = function(){
        points = [];
        $scope.data = points;
        clearCanvas(canvas, context);
        clearList();
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
        brushCtx.arc(canvas.width/2, canvas.height/2 , $scope.radius*((100-$scope.brushWidth)/100), -$scope.eangl*Math.PI/180, -$scope.sangl*Math.PI/180, false);
        brushCtx.fill();
        brushCtx.closePath();
    };

    $scope.move = function(e){
        $scope.x = e.offsetX;
        $scope.y = e.offsetY;
        $scope.scaledX = $scope.rescale({x:$scope.x, y:$scope.y}).x;
        $scope.scaledY = $scope.rescale({x:$scope.x, y:$scope.y}).y;
        $scope.changeBrush();
        $scope.style = {
            top: e.offsetY - canvas.height/2+'px',
            left: e.offsetX - canvas.width/2+'px'
        };
    };

    $scope.addPoint = function(e){
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
                    tmplist = Array();
                    for(var i=0; i<$scope.num; i++){
                        tmpR = Math.floor(Math.random()*(rMax2 - rMin2) + rMin2);
                        tmpTh = Math.random()*(thMax - thMin) + thMin;
                        tmpx = Math.sqrt(tmpR) * Math.cos(tmpTh);
                        tmpy = - Math.sqrt(tmpR) * Math.sin(tmpTh);
                        tmpx *= $scope.scalex/100.0;
                        tmpy *= $scope.scaley/100.0;
                        tmpx2 = tmpx*Math.cos(tmprot) - tmpy*Math.sin(tmprot);
                        tmpy2 = tmpx*Math.sin(tmprot) + tmpy*Math.cos(tmprot);
                        //points.push({x: tmpx2+e.offsetX , y: tmpy2+e.offsetY, color: $scope.currentColor});
                        tmplist.push({x: tmpx2+e.offsetX , y: tmpy2+e.offsetY, color: $scope.currentColor});
                    }
                    points.push(tmplist);
                    break;
                case 'Gaussian':
                    muX = e.offsetX; 
                    muY = e.offsetY;
                    s = $scope.radius;
                    for(var i=0; i<$scope.num; i++){
                        x = Math.random();
                        y = Math.random();
                        c = Math.sqrt(-2.0 * Math.log(x));
                        z1 = c * Math.cos(2.0 * Math.PI * y) * s + muX;
                        z2 = c * Math.sin(2.0 * Math.PI * y) * s + muY;
                        console.log(z1);
                        points.push({x: z1, y: z2, color: $scope.currentColor});
                    }
                    break;
                default :
                    break;
            }
            $scope.draw();
        }

    $(document).keydown(function(e){
        keychar = String.fromCharCode(e.keyCode);
        console.log(keychar);
        switch(keychar){
            case "D":
                $scope.clear();
                break;
            case "U":
                $scope.undo();
                break;
            case "R":
                $scope.redo();
                break;
        }
    });

    $('#clustering').click(function(){
        var txt = $('.datlist').html();
        console.log(txt);
        $.post('/wsgi/fcm', {
            fcmType: $scope.fcmType,
            points: txt,
            fParam: $scope.fParam,
            lambda: $scope.lambda,
            cls: $scope.cls,
            canvasTop: $scope.canvasTop,
            canvasLeft: $scope.canvasLeft,
            canvasRight: $scope.canvasRight,
            canvasBottom: $scope.canvasBottom
        })
            .done(function(data){
                $('#result').fadeOut('fast')
                .fadeIn('fast')
                .css('background-image', 'url("/wsgi/static/img.png?'+(new Date()).getTime()+'")');
                console.log(data);
            });
    });

    function downloadAsFile(fileName, content){
        var blob = new Blob([content]);
        var url = window.URL || window.webkitURL;
        var blobURL = url.createObjectURL(blob);
        var a = document.createElement('a');
        a.download = fileName;
        a.href = blobURL;
        a.id = 'download';
        a.innerHTML = 'download';
        console.log(a);
        return a;
    }

    $scope.rescale = function(point){
        result = [];
        size = 500.0;
        t = Number($scope.canvasTop);
        l = Number($scope.canvasLeft);
        r = Number($scope.canvasRight);
        b = Number($scope.canvasBottom);
        vRange = t - b;
        hRange = r - l;
        result.x = Number((point.x / size) * hRange + l);
        result.y = Number( (((size - point.y) / size) * vRange + b));
        return result;
    }

    $scope.undo = function(){
        //var l = points.length;
        //$scope.cache.push(points.slice(l-1, l));
        //$scope.cache.push(points.slice(l-1, l));
        //console.log($scope.cache);
        //points = points.slice(0, l-1);
        if (points.length != 0){
            $scope.cache.push(points.pop());
            $scope.draw();
        }
    }
    $scope.redo = function(){
        if ($scope.cache.length != 0){
            console.log('redo');
            points.push($scope.cache.pop());
            $scope.draw();
        }
    }


    function clearCanvas(canvas, context){
        $scope.count = 0;
        context.clearRect(0,0,canvas.width, canvas.height);
        context.lineWidth = 0.5;
        for(i=0; i<500; i+=50){
            context.strokeStyle = 'black';
            context.beginPath();
            context.moveTo(0, i);
            context.lineTo(500, i);
            context.moveTo(i, 0);
            context.lineTo(i, 500);
            context.stroke();
        }
    }


}





function clearList(){
    $('.datlist').html('');
}

function drawPoint(canvas, context, x, y, color){
    context.strokeStyle = color;
    context.beginPath();
    context.arc(x, y, 3, 0, Math.PI*2, true);
    context.closePath();
    context.stroke();
}
