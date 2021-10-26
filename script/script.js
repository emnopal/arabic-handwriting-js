
// Global Variables
// ========================================== //

let model;

var canvasWidth = 320;
var canvasHeight = 320;
var canvasStrokeStyle = "white";
var canvasLineJoin = "round";
var canvasLineWidth = 20;
var canvasBackgroundColor = "black";
var canvasId = "canvas";

var clickX = new Array();
var clickY = new Array();
var clickD = new Array();
var drawing;

//document.getElementById('chart_box').innerHTML = "";
//document.getElementById('chart_box').style.display = "none";

// End of Global Variables
// ========================================== //


// Create Canvas
// ========================================== //

var canvasBox = document.getElementById('canvas_box');
var canvas = document.createElement("canvas");

canvas.setAttribute("width", canvasWidth);
canvas.setAttribute("height", canvasHeight);
canvas.setAttribute("id", canvasId);
canvas.style.backgroundColor = canvasBackgroundColor;
canvasBox.appendChild(canvas);
if (typeof G_vmlCanvasManager != 'undefined') {
    canvas = G_vmlCanvasManager.initElement(canvas);
}

ctx = canvas.getContext("2d");

//---------------------
// MOUSE DOWN function
//---------------------
$("#canvas").mousedown(function (e) {
    var rect = canvas.getBoundingClientRect();
    var mouseX = e.clientX - rect.left;;
    var mouseY = e.clientY - rect.top;
    drawing = true;
    addUserGesture(mouseX, mouseY);
    drawOnCanvas();
});

//-----------------------
// TOUCH START function
//-----------------------
canvas.addEventListener("touchstart", function (e) {
    if (e.target == canvas) {
        e.preventDefault();
    }

    var rect = canvas.getBoundingClientRect();
    var touch = e.touches[0];

    var mouseX = touch.clientX - rect.left;
    var mouseY = touch.clientY - rect.top;

    drawing = true;
    addUserGesture(mouseX, mouseY);
    drawOnCanvas();

}, false);

//---------------------
// MOUSE MOVE function
//---------------------
$("#canvas").mousemove(function (e) {
    if (drawing) {
        var rect = canvas.getBoundingClientRect();
        var mouseX = e.clientX - rect.left;;
        var mouseY = e.clientY - rect.top;
        addUserGesture(mouseX, mouseY, true);
        drawOnCanvas();
    }
});

//---------------------
// TOUCH MOVE function
//---------------------
canvas.addEventListener("touchmove", function (e) {
    if (e.target == canvas) {
        e.preventDefault();
    }
    if (drawing) {
        var rect = canvas.getBoundingClientRect();
        var touch = e.touches[0];

        var mouseX = touch.clientX - rect.left;
        var mouseY = touch.clientY - rect.top;

        addUserGesture(mouseX, mouseY, true);
        drawOnCanvas();
    }
}, false);

//-------------------
// MOUSE UP function
//-------------------
$("#canvas").mouseup(function (e) {
    drawing = false;
});

//---------------------
// TOUCH END function
//---------------------
canvas.addEventListener("touchend", function (e) {
    if (e.target == canvas) {
        e.preventDefault();
    }
    drawing = false;
}, false);

//----------------------
// MOUSE LEAVE function
//----------------------
$("#canvas").mouseleave(function (e) {
    drawing = false;
});

//-----------------------
// TOUCH LEAVE function
//-----------------------
canvas.addEventListener("touchleave", function (e) {
    if (e.target == canvas) {
        e.preventDefault();
    }
    drawing = false;
}, false);

//--------------------
// ADD CLICK function
//--------------------
function addUserGesture(x, y, dragging) {
    clickX.push(x);
    clickY.push(y);
    clickD.push(dragging);
}

//-------------------
// RE DRAW function
//-------------------
function drawOnCanvas() {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.strokeStyle = canvasStrokeStyle;
    ctx.lineJoin = canvasLineJoin;
    ctx.lineWidth = canvasLineWidth;

    for (var i = 0; i < clickX.length; i++) {
        ctx.beginPath();
        if (clickD[i] && i) {
            ctx.moveTo(clickX[i - 1], clickY[i - 1]);
        } else {
            ctx.moveTo(clickX[i] - 1, clickY[i]);
        }
        ctx.lineTo(clickX[i], clickY[i]);
        ctx.closePath();
        ctx.stroke();
    }
}

//------------------------
// CLEAR CANVAS function
//------------------------
$("#clear-button").click(async function () {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    clickX = new Array();
    clickY = new Array();
    clickD = new Array();
    $(".prediction-text").empty();
    $("#result_box").addClass('d-none');
});

// End of Create Canvas
// ========================================== //


// Load Model
// ========================================== //

async function loadModel() {
    console.log("Loading Model ...");

    model = undefined; // Clear the model variable

    // load model from disk using HTTP requests
    model = await tf.loadLayersModel("../model/arabic_handwriting_js/model.json");

    console.log("Model has loaded")
}

loadModel();

// End of Load Model
// ========================================== //


// Preprocess the Canvas
// ========================================== //

function preprocessCanvas(image) {
    // resize the input image to target size of (1, 32, 32)
    let tensor = tf.browser.fromPixels(image)
        .resizeNearestNeighbor([32, 32])
        .mean(2)
        .expandDims(2)
        .expandDims()
        .toFloat();
    console.log(tensor.shape);
    return tensor.div(255.0);
}

// End of Preprocess the Canvas
// ========================================== //


// Predict Function 
// ========================================== //

$("#predict-button").click(async function () {
    // get image data from canvas
    var imageData = canvas.toDataURL();

    // preprocess canvas
    let tensor = preprocessCanvas(canvas);

    // make predictions on the preprocessed image tensor
    let predictions = await model.predict(tensor).data();

    // get the model's prediction results
    let results = Array.from(predictions);

    // display the predictions in chart
    $("#result_box").removeClass('d-none');
    displayChart(results);
    displayLabel(results);

    console.log(results);
});

// End of Predict Function 
// ========================================== //


// Chart to Display Predictions
// ========================================== //

var chart = "";
var firstTime = 0;
function loadChart(label, data, modelSelected) {
    var ctx = document.getElementById('chart_box').getContext('2d');
    chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'bar',

        // The data for our dataset
        data: {
            labels: label,
            datasets: [{
                label: modelSelected + " prediction",
                backgroundColor: '#f50057',
                borderColor: 'rgb(255, 99, 132)',
                data: data,
            }]
        },

        // Configuration options go here
        options: {}
    });
}

// End of Chart to Display Predictions
// ========================================== //


// Display Chart with Updated
// Drawing from Canvas
// ========================================== //


/*

['أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ى']

*/

var label = ['أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ى']
var labelName = ['ʾalif', 'bāʾ', 'tāʾ', 'thāʾ', 'jīm', 'ḥāʾ', 'khāʾ', 'dāl', 'dhāl', 'rāʾ', 'zāy', 'sīn', 'shīn', 'ṣād', 'ḍād', 'ṭāʾ', 'ẓāʾ', 'ʿayn', 'ghayn', 'fāʾ', 'qāf', 'kāf', 'lām', 'mīm', 'nūn', 'hāʾ', 'wāw', 'yāʾ'];

function displayChart(data) {
    var select_model = document.getElementById("select_model");
    var select_option = "CNN";

    if (firstTime == 0) {
        loadChart(labelName, data, select_option);
        firstTime = 1;
    } else {
        chart.destroy();
        loadChart(labelName, data, select_option);
    }
    document.getElementById('chart_box').style.display = "block";
}

function displayLabel(data) {
    var maxVal = Math.max(...data);
    var maxIndex = data.indexOf(maxVal);
    $(".prediction-text").html('Predict: <b>' + label[maxIndex] + " (" + labelName[maxIndex] + ")" + "</b> with:  <b>" + Math.trunc(maxVal * 100) + "%</b> accuracy")
}

// End of
// Display Chart with Updated
// Drawing from Canvas
// ========================================== //