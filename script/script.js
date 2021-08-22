
// Global Variables
// ========================================== //

let model;

var canvasWidth           = 300;
var canvasHeight          = 300;
var canvasStrokeStyle     = "white";
var canvasLineJoin        = "round";
var canvasLineWidth       = 100;
var canvasBackgroundColor = "black";
var canvasId              = "canvas";

var clickX = new Array();
var clickY = new Array();
var clickD = new Array();
var drawing;

document.getElementById('chart_box').innerHTML = "";
document.getElementById('chart_box').style.display = "none";

// End of Global Variables
// ========================================== //


// Create Canvas
// ========================================== //

var canvasBox = document.getElementById("canvas_box");
var canvas    = document.createElement("canvas");
canvas.setAttribute("width", canvasWidth);
canvas.setAttribute("height", canvasHeight);
canvas.setAttribute("id", canvasId);
canvas.style.backgroundColor = canvasBackgroundColor;
canvasBox.appendChild(canvas);
if (typeof G_vmlCanvasManager != 'undefined') {
    canvas = G_vmlCanvasManager.initElement(canvas);
}
ctx = canvas.getContext("2d");

// Mouse down function
$("#canvas").mousedown(function(e) {
    var rect = canvas.getBoundingClientRect();
    var mouseX = e.clientX - rect.left;
    var mouseY = e.clientY - rect.top;
    drawing = true;
    addUserGesture(mouseX, mouseY);
    drawOnCanvas();
});

// Touch start function
canvas.addEventListener("touchstart", function(e) {
    if (e.target == canvas){
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

// Mouse move function
$("#canvas").mousemove(function(e) {
    if (drawing){
        var rect = canvas.getBoundingClientRect();
        var mouseX = e.clientX - rect.left;
        var mouseY = e.clientY - rect.top;
        addUserGesture(mouseX, mouseY, true);
        drawOnCanvas();
    }
});

// Touch move function
canvas.addEventListener("touchmove", function(e) {
    if (e.target == canvas){
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

// Mouse up function
$("#canvas").mouseup(function(e) {
    drawing = false;
});

// Touch end function
canvas.addEventListener("touchend", function (e){
    if (e.target == canvas){
        e.preventDefault();
    }
    drawing = false;
}, false);

// Mouse leave function
$("#canvas").mouseleave(function(e) {
    drawing = false;
});

// Touch leave function
canvas.addEventListener("touchleave", function (e){
    if (e.target == canvas){
        e.preventDefault();
    }
    drawing = false;
}, false);

// Add click function
function addUserGesture(x, y, dragging){
    clickX.push(x);
    clickY.push(y);
    clickD.push(dragging);
}

// Re-Draw function
function drawOnCanvas(){
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.strokeStyle = canvasStrokeStyle;
    ctx.lineJoin = canvasLineJoin;
    ctx.lineWidth = canvas.lineWidth;

    for (var i = 0; i < clickX.length; i++){
        ctx.beginPath();
        if(clickD[i] && i){
            ctx.moveTo(clickX[i-1], clickY[i-1]);
        } else {
            ctx.moveTo(clickX[i]-1, clickY[i]);
        }
        ctx.lineTo(clickX[i], clickY[i]);
        ctx.closePath();
        ctx.stroke();
    }
}

// Clear canvas function
$("#clear-button").click(async function () {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    clickX = new Array();
    clickY = new Array();
    clickD = new Array();
    $(".prediction-text").empty();
    $("#result_box").addClass('d-none');
})

// End of Create Canvas
// ========================================== //


// Load Model
// ========================================== //

async function loadModel(){
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

function displayChart(data) {
	var select_model  = document.getElementById("select_model");
  	var select_option = "CNN";

	label = ['None','ي','و','ه','ن','م','ل','ك','ق','ف','غ','ع','ظ','ط','ض','ص','ش','س','ز','ر','ذ','د','خ','ح','ج','ث','ت','ب','ا'];
    labelName = ['None','yāʾ','wāw','hāʾ','nūn','mīm','lām','kāf','qāf','fāʾ','ghayn','ʿayn','ẓāʾ','ṭāʾ','ḍād','ṣād','shīn','sīn','zāy','rāʾ','dhāl','dāl','khāʾ','ḥāʾ','jīm','thāʾ','tāʾ','bāʾ','ʾalif'];
	if (firstTime == 0) {
		loadChart(label, data, select_option);
		firstTime = 1;
	} else {
		chart.destroy();
		loadChart(label, data, select_option);
	}
	document.getElementById('chart_box').style.display = "block";
}

function displayLabel(data) {
	var max = data[0];
    var maxIndex = 0;

    for (var i = 1; i < data.length; i++) {
        if (data[i] > max) {
            maxIndex = i;
            max = data[i];
        }
    }
	$(".prediction-text").html("Predicting you draw <b>"+label[maxIndex]+"("+labelName[maxIndex]+")"+"</b> with <b>"+Math.trunc( max*100 )+"%</b> confidence")
}

// End of
// Display Chart with Updated
// Drawing from Canvas
// ========================================== //