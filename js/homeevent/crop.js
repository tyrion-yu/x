/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	/**
	 * @fileOverview 图片canvas剪裁上传
	 * @author 俞天麟
	 */

	var CANVAS_WIDTH = 360;
	var CANVAS_HEIGHT = 360;

	var $chooseBox = $('.choose-pic');
	var $fileInput = $chooseBox.find('input');
	var $fileBtn = $chooseBox.find('a');

	var $leftCanvasBox = $('.edit-pic');

	var image = new Image();

	var $operationBox = $('.btn-op-group');

	var $canvasImage = $('canvas.img');
	var ctxImage = $canvasImage[0].getContext('2d');
	var $canvasMask = $('canvas.clip');
	var ctxMask = $canvasMask[0].getContext('2d');

	var $leftCanvases = $('canvas.img,canvas.clip');

	var $canvasPreview = $('.preview');
	var ctxPreview = $canvasPreview[0].getContext('2d');

	var clipObj = {
	    left: 0,
	    top: 0,
	    radius: 0, // 遮罩上小方块的宽
	    width: 0, // 遮罩的宽
	    height: 0,
	    cursor: '' // scale || move
	};

	ctxImage.fillStyle = 'white';

	// 画布旋转次数
	var rotation = 0;

	$fileBtn.on('click', function () {
	    $fileInput.click();
	});

	$fileInput.on('change', function () {
	    handleFile(this.files[0]);
	});

	$(document).on('dragenter dragover drop', function (e) {
	    e.preventDefault();
	});

	$chooseBox.on('drop', function (e) {
	    e.preventDefault();

	    var oFileList = e.originalEvent.dataTransfer.files;
	    handleFile(oFileList[0]);
	});

	$operationBox.find('a').on('click', function (e) {
	    e.preventDefault();
	    var action = $(this).attr('action-type');

	    if (action == 'back') {
	        hideCanvas();
	    }

	    if (action == 'rotate') {
	        rotation++;
	        draw();
	    }
	});

	var startX, startY; // 起始坐标
	var vectorX, vectorY;
	var originLeft, originTop, originRadius; // 初始大方块的值
	var operateState = ''; // 'moving' || 'scaling'
	$canvasMask.on('mousemove', function (e) {

	    if (operateState) {

	        vectorX = e.offsetX - startX;
	        vectorY = e.offsetY - startY;

	        if (operateState == 'moving') {
	            clipObj.left = originLeft + vectorX;
	            clipObj.top = originTop + vectorY;

	            // 边界限定
	            if (clipObj.left < 0) {
	                clipObj.left = 0;
	            } else if (clipObj.left + originRadius > clipObj.width) {
	                clipObj.left = clipObj.width - originRadius
	            }

	            if (clipObj.top < 0) {
	                clipObj.top = 0;
	            } else if (clipObj.top + originRadius > clipObj.height) {
	                clipObj.top = clipObj.height - originRadius
	            }

	            drawClipMask();
	        } else if (operateState == 'scaling') {
	            if (vectorX * vectorY > 0) {
	                if (vectorX > 0) {
	                    vectorX = Math.min.apply(null, [vectorX, vectorY]);
	                } else {
	                    vectorX = Math.max.apply(null, [vectorX, vectorY]);
	                }
	                clipObj.radius = originRadius + vectorX;
	                if (clipObj.radius < 50) clipObj.radius = 50;
	                drawClipMask();
	            }
	        }
	    } else {
	        setCursor(e);
	    }
	}).on('mousedown', function (e) {
	    startX = e.offsetX;
	    startY = e.offsetY;
	    originLeft = clipObj.left;
	    originTop = clipObj.top;
	    originRadius = clipObj.radius;

	    if (clipObj.cursor == 'move') {
	        operateState = 'moving';
	    }

	    if (clipObj.cursor == 'scale') {
	        operateState = 'scaling';
	    }
	});

	$('.ui-btn-main').on('click', function () {
	    outputImage();
	});

	$('body').on('mouseup', function () {
	    operateState = '';
	    clipObj.cursor = '';
	});

	/**
	 * 导出图片
	 */
	function outputImage() {
	    var image = $canvasPreview[0].toDataURL("image/png");
	    window.open(image);
	}

	/**
	 * 拿到图片后进行canvas初始化
	 * @param file
	 */
	function handleFile(file) {
	    if (file.type.indexOf('image') === -1) {
	        console.log('文件不是图片');
	        return;
	    }

	    var nFileSize = ((file.size) / 1024).toFixed(2);
	    console.log('图片大小 ', nFileSize, 'kb');

	    var reader = new FileReader();
	    reader.onload = function () {
	        setImageURL(reader.result);
	        draw();
	        showCanvas();
	    };
	    reader.readAsDataURL(file);
	}

	/**
	 * 设置图片的url
	 * @param url
	 */
	function setImageURL(url) {
	    image.src = url;
	}

	/**
	 * 根据传来的宽高作画, 并且调整canvas自身的宽高
	 */
	function draw() {
	    var size = getScaleSize();

	    if(!size){
	        alert('图片的宽或者高不能小于100px');
	        return;
	    }

	    var imageWidth = size.width;
	    var imageHeight = size.height;

	    rotation %= 4;
	    var degree = rotation * 90 * Math.PI / 180;

	    // 用白色涂满画板（重置）
	    ctxImage.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

	    if (rotation % 2 !== 0) {
	        $leftCanvases.attr('width', imageHeight).attr('height', imageWidth);
	        clipObj.width = imageHeight;
	        clipObj.height = imageWidth;
	    } else {
	        $leftCanvases.attr('width', imageWidth).attr('height', imageHeight);
	        clipObj.width = imageWidth;
	        clipObj.height = imageHeight;
	    }

	    ctxImage.rotate(degree);

	    switch (rotation) {
	        case 0:
	            ctxImage.drawImage(image, 0, 0, imageWidth, imageHeight);
	            break;
	        case 1:
	            ctxImage.drawImage(image, 0, -imageHeight, imageWidth, imageHeight);
	            break;
	        case 2:
	            ctxImage.drawImage(image, -imageWidth, -imageHeight, imageWidth, imageHeight);
	            break;
	        case 3:
	            ctxImage.drawImage(image, -imageWidth, 0, imageWidth, imageHeight);
	            break;
	        default:
	    }

	    // 图片显示之后 显示剪裁遮罩
	    setSquare();
	    drawClipMask();
	}

	/**
	 * 根据上传图片的尺寸得到适应canvas的尺寸
	 * @return {Object}
	 * {
	 *    width: {Number},
	 *    height: {Number}
	 * }
	 */
	function getScaleSize() {
	    var _width = image.width;
	    var _height = image.height;

	    if (_width < 100 || _height < 100) {
	        return null;
	    }

	    // 恰好不需要缩放
	    if (_width < CANVAS_WIDTH && _height < CANVAS_HEIGHT) {
	        return {
	            width: _width,
	            height: _height
	        }
	    }

	    // 宽略胜一筹的情况
	    if (_width > _height) {
	        return {
	            width: CANVAS_WIDTH,
	            height: Math.floor(CANVAS_WIDTH * _height / _width)
	        }
	    } else {
	        return {
	            width: Math.floor(CANVAS_HEIGHT * _width / _height),
	            height: CANVAS_HEIGHT
	        }
	    }
	}

	/**
	 * 隐藏图片选择模块，展示画布模块
	 */
	function showCanvas() {
	    $operationBox.removeClass('Hide');
	    $chooseBox.addClass('Hide');
	    $leftCanvasBox.removeClass('Hide');
	}

	/**
	 * 反之...
	 */
	function hideCanvas() {
	    $operationBox.addClass('Hide');
	    $chooseBox.removeClass('Hide');
	    $leftCanvasBox.addClass('Hide');
	}

	/**
	 * 设置剪裁区遮罩
	 */
	function setMask() {
	    ctxMask.fillStyle = "rgba(255, 255, 255, 0.8)";
	    ctxMask.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	    ctxMask.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	}

	/**
	 * 画出剪裁遮罩
	 */
	function drawClipMask() {
	    setMask();
	    drawSquare();

	    // 遮罩出现后，显示预览图
	    drawPreview();
	}

	/**
	 * 设置剪裁区方块参数
	 */
	function setSquare() {
	    clipObj.radius = Math.min.apply(null, [clipObj.width, clipObj.height]) - 13;
	    clipObj.left = Math.floor((clipObj.width - clipObj.radius) / 2) || 0;
	    clipObj.top = Math.floor((clipObj.height - clipObj.radius) / 2) || 0;
	}

	/**
	 * 画出剪裁区方块
	 */
	function drawSquare() {
	    ctxMask.clearRect(clipObj.left, clipObj.top, clipObj.radius, clipObj.radius);

	    // 小正方形
	    var l = clipObj.left + clipObj.radius - 5;
	    var t = clipObj.top + clipObj.radius - 5;

	    ctxMask.fillStyle = 'black';
	    ctxMask.strokeRect(l, t, 10, 10);
	    ctxMask.fillStyle = 'white';
	    ctxMask.fillRect(l, t, 10, 10);
	}

	/**
	 * 勾画预览图
	 */

	ctxPreview.fillStyle = 'white';
	function drawPreview() {
	    ctxPreview.fillRect(0, 0, 120, 120);
	    ctxPreview.drawImage($canvasImage[0], clipObj.left, clipObj.top, clipObj.radius, clipObj.radius, 0, 0, 120, 120)
	}

	/**
	 * 设置剪裁区光标样式
	 */
	function setCursor(e) {
	    var x = e.offsetX;
	    var y = e.offsetY;

	    // 小方块
	    var smL = clipObj.left + clipObj.radius - 5;
	    var smT = clipObj.top + clipObj.radius - 5;

	    if (x > smL && x < smL + 10
	        && y > smT && y < smT + 10) {
	        clipObj.cursor = 'scale';
	        return $canvasMask.css('cursor', 'nw-resize')
	    }

	    // 大方块
	    if (x > clipObj.left && x < clipObj.left + clipObj.radius
	        && y > clipObj.top && y < clipObj.top + clipObj.radius) {
	        clipObj.cursor = 'move';
	        return $canvasMask.css('cursor', 'move');
	    }

	    clipObj.cursor = '';
	    $canvasMask.css('cursor', '');
	}


/***/ }
/******/ ]);