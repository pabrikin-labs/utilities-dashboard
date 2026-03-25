// HAPUS bagian const equipInfo dari file ini. Kita murni menggunakan database dari main.js!

let zoomScale = 1, pointX = 0, pointY = 0, isPanning = false, startPos = { x: 0, y: 0 };
let currentSvg = null; // Menyimpan referensi diagram yang sedang dilihat

function resetZoom() { 
    zoomScale = 1; pointX = 0; pointY = 0; 
    applyTransform(); 
}

function applyTransform() {
    if (currentSvg) {
        currentSvg.style.transform = `translate3d(${pointX}px, ${pointY}px, 0) scale(${zoomScale})`;
    }
}

// ==========================================
// 1. FUNGSI INTI: MEMASANG INTERAKSI KE SVG
// ==========================================
function attachInteractions(svg) {
    if (!svg) return;
    currentSvg = svg;
    
    // Pastikan container menangkap event mouse/wheel
    const container = svg.parentElement;
    if (!container) return;

    // Reset posisi saat diagram baru dimuat
    resetZoom();

    // -- FITUR: SCROLL ZOOM --
    container.onwheel = (e) => {
        e.preventDefault();
        const delta = e.wheelDelta ? e.wheelDelta : -e.deltaY;
        const xs = (e.clientX - pointX) / zoomScale;
        const ys = (e.clientY - pointY) / zoomScale;
        
        if (delta > 0) zoomScale *= 1.1; 
        else zoomScale /= 1.1;
        
        zoomScale = Math.min(Math.max(0.1, zoomScale), 15); // Batas zoom in/out
        pointX = e.clientX - xs * zoomScale;
        pointY = e.clientY - ys * zoomScale;
        applyTransform();
    };

    // -- FITUR: DRAG PAN (GESER) --
    container.onmousedown = (e) => { 
        e.preventDefault(); 
        startPos = { x: e.clientX - pointX, y: e.clientY - pointY }; 
        isPanning = true; 
        container.style.cursor = 'grabbing';
    };
    window.onmousemove = (e) => { 
        if (!isPanning) return; 
        pointX = e.clientX - startPos.x; 
        pointY = e.clientY - startPos.y; 
        applyTransform(); 
    };
    window.onmouseup = () => {
        isPanning = false;
        if(container) container.style.cursor = 'grab';
    };

    // -- FITUR: HOVER TOOLTIP --
    const popup = document.getElementById('info-popup');
    // Cek apakah equipInfo dari main.js sudah terbaca
    if (popup && typeof equipInfo !== 'undefined') {
        svg.querySelectorAll('*').forEach(el => {
            const id = (el.getAttribute('id') || '').toUpperCase();
            
            // Abaikan garis pipa atau elemen kosong agar tidak error
            if (id === 'STM01' || id.startsWith('LINE') || el.tagName === 'g') return; 
            
            // Cari kecocokan ID dengan database equipInfo
            let key = Object.keys(equipInfo).find(k => id.includes(k) || (el.textContent && el.textContent.toUpperCase().includes(k)));
            
            if (key) {
                el.style.cursor = 'help'; 
                el.style.pointerEvents = 'all';
                el.onmouseenter = () => {
                    document.getElementById('popup-title').innerText = equipInfo[key].title;
                    document.getElementById('popup-body').innerText = equipInfo[key].body;
                    popup.classList.add('visible');
                };
                el.onmousemove = (e) => {
                    popup.style.left = (e.clientX + 20) + 'px';
                    popup.style.top = (e.clientY + 20) + 'px';
                };
                el.onmouseleave = () => popup.classList.remove('visible');
            }
        });
    }

    // -- TRIGGER ANIMASI KHUSUS --
    const fire = svg.getElementById('GLOW FIRE') || svg.querySelector('[id="GLOW FIRE"]');
    if (fire) fire.classList.add('furnace-glow');
    svg.querySelectorAll('[id^="blade"], [id^="BLADE"]').forEach(f => f.classList.add('fan-spin'));
}

// ==========================================
// 2. PEMICU MANUAL SAAT GANTI HALAMAN
// ==========================================
function initZoomAndPan() {
    const activeContainer = document.querySelector('.diagram-wrapper.active');
    if (!activeContainer) return;
    
    const svg = activeContainer.querySelector('svg');
    if (svg) attachInteractions(svg);
}

// ==========================================
// 3. RADAR PINTAR (MUTATION OBSERVER)
// ==========================================
// Radar ini dengan sabar menunggu file SVG selesai disuntikkan oleh main.js
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach(node => {
                if (node.tagName && node.tagName.toLowerCase() === 'svg') {
                    // Begitu SVG masuk ke wadah yang aktif, langsung pasang interaksinya!
                    if (node.parentElement.classList.contains('active')) {
                        attachInteractions(node);
                    }
                }
            });
        }
    });
});

// Nyalakan radar saat halaman pertama kali diload
window.addEventListener('load', () => {
    document.querySelectorAll('.diagram-wrapper').forEach(wrapper => {
        observer.observe(wrapper, { childList: true });
    });
    
    // Tembakan ekstra untuk memastikan sistem tidak terlewat
    setTimeout(initZoomAndPan, 500);
});

// ==========================================
// 4. ALIAS GLOBAL (Agar tidak error saat dipanggil oleh menu di HTML)
// ==========================================
window.initBoilerInteractions = initZoomAndPan;
window.initZoomAndPan = initZoomAndPan;
window.resetZoom = resetZoom;