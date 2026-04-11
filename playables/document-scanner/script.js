let cvReady = false;
let stream = null;
let videoElement = document.getElementById('video');
let captureButton = document.getElementById('captureButton');
let flashBtn = document.getElementById('flashBtn');
let editArea = document.getElementById('editArea');
let editCanvas = document.getElementById('editCanvas');
let ctxEdit = editCanvas.getContext('2d');
let resultCanvas = document.getElementById('resultCanvas');
let statusDiv = document.getElementById('statusMsg');
let resetCornersBtn = document.getElementById('resetCornersBtn');
let scanBtn = document.getElementById('scanBtn');
let savePdfBtn = document.getElementById('savePdfBtn');

let capturedImageData = null;
let currentCorners = [];
let draggingCorner = -1;
let originalWidth, originalHeight;
let flashEnabled = false;

function onOpenCvReady() {
    cvReady = true;
    statusDiv.textContent = 'OpenCV loaded. Starting camera...';
    startCamera();
}

async function startCamera() {
    try {
        // Request highest resolution possible
        const constraints = {
            video: {
                facingMode: 'environment',
                width: { ideal: 4096 },
                height: { ideal: 2160 }
            }
        };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoElement.srcObject = stream;
        await videoElement.play();
        statusDiv.textContent = 'Camera ready. Tap round button to capture.';
        await initFlash();
    } catch (err) {
        statusDiv.textContent = 'Camera error: ' + err.message;
    }
}

async function initFlash() {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    const capabilities = track.getCapabilities();
    if (capabilities.torch) {
        flashBtn.disabled = false;
        flashBtn.addEventListener('click', toggleFlash);
    } else {
        flashBtn.disabled = true;
        flashBtn.title = 'Flash not supported';
    }
}

async function toggleFlash() {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (!track) return;
    flashEnabled = !flashEnabled;
    await track.applyConstraints({ advanced: [{ torch: flashEnabled }] });
    flashBtn.textContent = flashEnabled ? 'Flash On' : 'Flash Off';
}

function capturePhoto() {
    const videoWidth = videoElement.videoWidth;
    const videoHeight = videoElement.videoHeight;
    if (!videoWidth || !videoHeight) {
        statusDiv.textContent = 'Video not ready.';
        return;
    }
    // Create temporary canvas at video's native resolution
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = videoWidth;
    tempCanvas.height = videoHeight;
    const ctx = tempCanvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0, videoWidth, videoHeight);
    capturedImageData = ctx.getImageData(0, 0, videoWidth, videoHeight);
    
    // Stop video stream to freeze
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        videoElement.srcObject = null;
        stream = null;
    }
    videoElement.style.display = 'none';
    captureButton.style.display = 'none';
    
    // Show captured image on a canvas (hidden but used for editing)
    const capturedCanvas = document.getElementById('capturedCanvas');
    capturedCanvas.width = videoWidth;
    capturedCanvas.height = videoHeight;
    capturedCanvas.style.display = 'block';
    capturedCanvas.getContext('2d').putImageData(capturedImageData, 0, 0);
    
    editArea.style.display = 'block';
    editCanvas.width = videoWidth;
    editCanvas.height = videoHeight;
    originalWidth = videoWidth;
    originalHeight = videoHeight;
    ctxEdit.putImageData(capturedImageData, 0, 0);
    detectDocumentEdges();
}

function detectDocumentEdges() {
    if (!cvReady) {
        statusDiv.textContent = 'OpenCV not ready yet.';
        return;
    }
    statusDiv.textContent = 'Detecting document edges...';
    let img = cv.matFromImageData(capturedImageData);
    let gray = new cv.Mat();
    cv.cvtColor(img, gray, cv.COLOR_RGBA2GRAY);
    let blurred = new cv.Mat();
    cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);
    let edges = new cv.Mat();
    cv.Canny(blurred, edges, 80, 160);
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
    
    let maxArea = 0;
    let largestContourIdx = -1;
    for (let i = 0; i < contours.size(); i++) {
        let contour = contours.get(i);
        let area = cv.contourArea(contour);
        if (area > maxArea) {
            maxArea = area;
            largestContourIdx = i;
        }
    }
    
    if (largestContourIdx !== -1 && maxArea > 1000) {
        let contour = contours.get(largestContourIdx);
        let peri = cv.arcLength(contour, true);
        let approx = new cv.Mat();
        cv.approxPolyDP(contour, approx, 0.02 * peri, true);
        if (approx.rows === 4) {
            let corners = [];
            for (let i = 0; i < 4; i++) {
                let point = approx.row(i);
                corners.push({ x: point.data32F[0], y: point.data32F[1] });
            }
            corners.sort((a, b) => a.y - b.y);
            let top = corners.slice(0, 2).sort((a, b) => a.x - b.x);
            let bottom = corners.slice(2, 4).sort((a, b) => a.x - b.x);
            currentCorners = [top[0], top[1], bottom[1], bottom[0]];
            statusDiv.textContent = 'Document detected. Adjust corners if needed, then click Apply Scan.';
        } else {
            setDefaultCorners();
            statusDiv.textContent = 'Could not detect 4 corners. Please adjust manually.';
        }
        approx.delete();
    } else {
        setDefaultCorners();
        statusDiv.textContent = 'No document found. Please adjust corners manually.';
    }
    img.delete(); gray.delete(); blurred.delete(); edges.delete(); contours.delete(); hierarchy.delete();
    drawCorners();
    enableCornerDragging();
}

function setDefaultCorners() {
    const margin = 60;
    currentCorners = [
        { x: margin, y: margin },
        { x: originalWidth - margin, y: margin },
        { x: originalWidth - margin, y: originalHeight - margin },
        { x: margin, y: originalHeight - margin }
    ];
}

function drawCorners() {
    ctxEdit.putImageData(capturedImageData, 0, 0);
    ctxEdit.beginPath();
    for (let i = 0; i < currentCorners.length; i++) {
        const c = currentCorners[i];
        if (i === 0) ctxEdit.moveTo(c.x, c.y);
        else ctxEdit.lineTo(c.x, c.y);
    }
    ctxEdit.closePath();
    ctxEdit.strokeStyle = '#4CAF50';
    ctxEdit.lineWidth = 6;
    ctxEdit.stroke();
    for (let i = 0; i < currentCorners.length; i++) {
        const c = currentCorners[i];
        ctxEdit.fillStyle = '#C45C3A';
        ctxEdit.beginPath();
        ctxEdit.arc(c.x, c.y, 22, 0, 2 * Math.PI);
        ctxEdit.fill();
        ctxEdit.fillStyle = '#FFFFFF';
        ctxEdit.beginPath();
        ctxEdit.arc(c.x, c.y, 12, 0, 2 * Math.PI);
        ctxEdit.fill();
    }
}

function enableCornerDragging() {
    function getCanvasCoords(e) {
        const rect = editCanvas.getBoundingClientRect();
        const scaleX = editCanvas.width / rect.width;
        const scaleY = editCanvas.height / rect.height;
        let clientX, clientY;
        if (e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
            e.preventDefault();
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        let x = (clientX - rect.left) * scaleX;
        let y = (clientY - rect.top) * scaleY;
        x = Math.min(Math.max(x, 0), editCanvas.width);
        y = Math.min(Math.max(y, 0), editCanvas.height);
        return { x, y };
    }
    
    function onMouseDown(e) {
        const pos = getCanvasCoords(e);
        for (let i = 0; i < currentCorners.length; i++) {
            const dx = pos.x - currentCorners[i].x;
            const dy = pos.y - currentCorners[i].y;
            if (Math.hypot(dx, dy) < 35) {   // larger hit radius
                draggingCorner = i;
                break;
            }
        }
        if (draggingCorner !== -1) {
            e.preventDefault();
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
            window.addEventListener('touchmove', onMouseMove);
            window.addEventListener('touchend', onMouseUp);
        }
    }
    
    function onMouseMove(e) {
        if (draggingCorner === -1) return;
        const pos = getCanvasCoords(e);
        currentCorners[draggingCorner] = pos;
        drawCorners();
    }
    
    function onMouseUp() {
        draggingCorner = -1;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        window.removeEventListener('touchmove', onMouseMove);
        window.removeEventListener('touchend', onMouseUp);
    }
    
    editCanvas.addEventListener('mousedown', onMouseDown);
    editCanvas.addEventListener('touchstart', onMouseDown);
}

function resetCorners() {
    setDefaultCorners();
    drawCorners();
    statusDiv.textContent = 'Corners reset. Adjust as needed.';
}

function applyScan() {
    if (!capturedImageData || currentCorners.length !== 4) {
        statusDiv.textContent = 'No image or corners missing.';
        return;
    }
    statusDiv.textContent = 'Applying perspective correction...';
    let srcMat = cv.matFromImageData(capturedImageData);
    let srcPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
        currentCorners[0].x, currentCorners[0].y,
        currentCorners[1].x, currentCorners[1].y,
        currentCorners[2].x, currentCorners[2].y,
        currentCorners[3].x, currentCorners[3].y
    ]);
    
    const width = Math.hypot(currentCorners[1].x - currentCorners[0].x, currentCorners[1].y - currentCorners[0].y);
    const height = Math.hypot(currentCorners[2].x - currentCorners[1].x, currentCorners[2].y - currentCorners[1].y);
    const dstWidth = Math.round(width);
    const dstHeight = Math.round(height);
    
    let dstPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
        0, 0,
        dstWidth, 0,
        dstWidth, dstHeight,
        0, dstHeight
    ]);
    
    let M = cv.getPerspectiveTransform(srcPoints, dstPoints);
    let warped = new cv.Mat();
    cv.warpPerspective(srcMat, warped, M, new cv.Size(dstWidth, dstHeight));
    
    resultCanvas.width = dstWidth;
    resultCanvas.height = dstHeight;
    resultCanvas.style.width = '100%';
    resultCanvas.style.height = 'auto';
    cv.imshow(resultCanvas, warped);
    resultCanvas.style.display = 'block';
    statusDiv.textContent = 'Scan complete. You can save as PNG or PDF.';
    
    srcPoints.delete(); dstPoints.delete(); M.delete(); warped.delete(); srcMat.delete();
}

function saveAsPDF() {
    if (!resultCanvas || resultCanvas.width === 0) {
        statusDiv.textContent = 'No scanned image to save.';
        return;
    }
    const { jsPDF } = window.jspdf;
    const imgData = resultCanvas.toDataURL('image/png');
    const imgWidth = resultCanvas.width;
    const imgHeight = resultCanvas.height;
    // A4 dimensions in mm (portrait)
    const pdfWidth = 210;
    const pdfHeight = (imgHeight / imgWidth) * pdfWidth;
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('scanned_document.pdf');
    statusDiv.textContent = 'PDF saved.';
}

captureButton.addEventListener('click', capturePhoto);
resetCornersBtn.addEventListener('click', resetCorners);
scanBtn.addEventListener('click', applyScan);
savePdfBtn.addEventListener('click', saveAsPDF);