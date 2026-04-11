// Initialize QR code
let qrCode;
let originalCanvas = null; // store the QR canvas for download

// Get DOM elements
const qrContainer = document.getElementById('qr-code-container');
const textInput = document.getElementById('qr-text');
const dotsColorPicker = document.getElementById('dots-color');
const dotsColorHex = document.getElementById('dots-color-hex');
const bgColorPicker = document.getElementById('bg-color');
const bgColorHex = document.getElementById('bg-color-hex');
const dotStyleSelect = document.getElementById('dot-style');
const cornerStyleSelect = document.getElementById('corner-style');
const logoFileInput = document.getElementById('logo-file');
const logoUploadArea = document.getElementById('logo-upload-area');
const captionInput = document.getElementById('caption-text');
const captionDisplay = document.getElementById('caption-display');
const downloadBtn = document.getElementById('download-btn');

// Border elements
const borderEnabled = document.getElementById('border-enabled');
const borderColorPicker = document.getElementById('border-color');
const borderColorHex = document.getElementById('border-color-hex');
const borderWidthInput = document.getElementById('border-width');
const borderRadiusInput = document.getElementById('border-radius');
const borderPaddingInput = document.getElementById('border-padding');

// Sync color pickers
function syncColorPickers() {
    dotsColorPicker.addEventListener('input', () => {
        dotsColorHex.value = dotsColorPicker.value;
        updateQRCode();
    });
    dotsColorHex.addEventListener('input', () => {
        dotsColorPicker.value = dotsColorHex.value;
        updateQRCode();
    });
    bgColorPicker.addEventListener('input', () => {
        bgColorHex.value = bgColorPicker.value;
        updateQRCode();
    });
    bgColorHex.addEventListener('input', () => {
        bgColorPicker.value = bgColorHex.value;
        updateQRCode();
    });
    borderColorPicker.addEventListener('input', () => {
        borderColorHex.value = borderColorPicker.value;
        updateQRCode();
    });
    borderColorHex.addEventListener('input', () => {
        borderColorPicker.value = borderColorHex.value;
        updateQRCode();
    });
}

// Update QR code (only the inner QR, not the border)
function updateQRCode() {
    const data = textInput.value.trim() || 'https://kevin-tchinda.github.io';
    const dotsColor = dotsColorPicker.value;
    const bgColor = bgColorPicker.value;
    const dotStyle = dotStyleSelect.value;
    const cornerStyle = cornerStyleSelect.value;
    
    const options = {
        width: 300,
        height: 300,
        data: data,
        dotsOptions: { color: dotsColor, type: dotStyle },
        backgroundOptions: { color: bgColor },
        cornersSquareOptions: { type: cornerStyle },
        image: null,
        imageOptions: { hideBackgroundDots: true, imageSize: 0.4, margin: 5 }
    };
    
    if (qrCode && qrCode._options && qrCode._options.image) {
        options.image = qrCode._options.image;
    }
    
    if (qrCode) {
        qrCode.update(options);
    } else {
        qrCode = new QRCodeStyling(options);
        qrContainer.innerHTML = '';
        qrCode.append(qrContainer);
    }
    
    // After update, store the canvas for download (wait a tick)
    setTimeout(() => {
        const canvas = qrContainer.querySelector('canvas');
        if (canvas) originalCanvas = canvas;
    }, 50);
    
    // Update caption
    const caption = captionInput.value.trim();
    captionDisplay.textContent = caption;
    captionDisplay.style.display = caption ? 'block' : 'none';
}

// Download with border
function downloadWithBorder() {
    if (!originalCanvas) {
        alert('No QR code generated yet.');
        return;
    }
    
    const border = borderEnabled.checked;
    const borderColor = borderColorPicker.value;
    const borderWidth = parseInt(borderWidthInput.value, 10) || 0;
    const borderRadius = parseInt(borderRadiusInput.value, 10) || 0;
    const padding = parseInt(borderPaddingInput.value, 10) || 0;
    
    // Get original QR canvas
    const qrCanvas = originalCanvas;
    const qrWidth = qrCanvas.width;
    const qrHeight = qrCanvas.height;
    
    // Calculate final canvas dimensions
    const finalWidth = qrWidth + padding * 2 + borderWidth * 2;
    const finalHeight = qrHeight + padding * 2 + borderWidth * 2;
    
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = finalWidth;
    finalCanvas.height = finalHeight;
    const ctx = finalCanvas.getContext('2d');
    
    // Draw background (if border is enabled, we fill with border color? Actually border is drawn as a stroke, so we need a background first)
    if (border) {
        // Fill background with border color? Actually we want a border stroke, so we fill the whole area with transparent? Better: draw the border shape and fill with white (or background of QR)
        // We'll draw a rounded rectangle for the border
        ctx.save();
        // Clear canvas (transparent)
        ctx.clearRect(0, 0, finalWidth, finalHeight);
        
        // Draw the border background (same as QR background? To avoid transparency issues, we use the QR background color)
        // We don't know the QR background color here, but we can get it from options. Simpler: fill with white.
        // However, to match the QR's own background, we can read the pixel at (0,0) from the QR canvas? That may be complex.
        // For simplicity, we assume the QR background is opaque. We'll just draw the border as a stroke on a transparent canvas, and then draw the QR on top.
        // But the border stroke will be over the QR edges if not careful.
        // Better: draw the border as a filled rounded rectangle with the QR's background color (extract from QR canvas?).
        // Since the QR's background color is already set, we can simply draw the QR onto the final canvas with an offset, and then draw a border stroke around it.
        // Let's do that.
        
        // Draw QR image onto final canvas with padding
        ctx.drawImage(qrCanvas, padding + borderWidth, padding + borderWidth, qrWidth, qrHeight);
        
        // Now draw border (stroke)
        ctx.beginPath();
        ctx.roundRect(padding + borderWidth / 2, padding + borderWidth / 2, qrWidth + borderWidth, qrHeight + borderWidth, borderRadius);
        ctx.lineWidth = borderWidth;
        ctx.strokeStyle = borderColor;
        ctx.stroke();
    } else {
        // No border: just draw QR without extra space
        finalCanvas.width = qrWidth;
        finalCanvas.height = qrHeight;
        ctx.drawImage(qrCanvas, 0, 0);
    }
    
    // Download
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = finalCanvas.toDataURL('image/png');
    link.click();
}

// Helper: CanvasRenderingContext2D.roundRect
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.moveTo(x+r, y);
        this.lineTo(x+w-r, y);
        this.quadraticCurveTo(x+w, y, x+w, y+r);
        this.lineTo(x+w, y+h-r);
        this.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
        this.lineTo(x+r, y+h);
        this.quadraticCurveTo(x, y+h, x, y+h-r);
        this.lineTo(x, y+r);
        this.quadraticCurveTo(x, y, x+r, y);
        return this;
    };
}

// Event listeners
textInput.addEventListener('input', updateQRCode);
dotStyleSelect.addEventListener('change', updateQRCode);
cornerStyleSelect.addEventListener('change', updateQRCode);
captionInput.addEventListener('input', updateQRCode);
borderEnabled.addEventListener('change', () => { updateQRCode(); }); // just to refresh (though border not in preview)
borderWidthInput.addEventListener('input', () => {});
borderRadiusInput.addEventListener('input', () => {});
borderPaddingInput.addEventListener('input', () => {});
// Color pickers already synced

logoUploadArea.addEventListener('click', () => logoFileInput.click());
logoFileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const imgData = e.target.result;
            if (qrCode) {
                qrCode.update({ image: imgData });
            } else {
                updateQRCode(); // will handle if qrCode not initialized
                setTimeout(() => {
                    qrCode.update({ image: imgData });
                }, 100);
            }
        };
        reader.readAsDataURL(file);
    }
});

downloadBtn.addEventListener('click', downloadWithBorder);

// Initialize
syncColorPickers();
updateQRCode();