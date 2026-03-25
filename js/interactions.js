let zoomScale = 1, pointX = 0, pointY = 0, isPanning = false, startPos = { x: 0, y: 0 };
let currentSvg = null; 

function resetZoom() { 
    zoomScale = 1; pointX = 0; pointY = 0; 
    applyTransform(); 
}

function applyTransform() {
function resetZoom() { zoomScale = 1; pointX = 0; pointY = 0; applyTransform(); }

function applyTransform() {
    // PERBAIKAN 1: Cari SVG hanya di Halaman yang sedang Aktif (agar Distribusi bisa di-zoom)
    const activePage = document.querySelector('.page-section.active');
    const svg = activePage ? activePage.querySelector('.diagram-wrapper.active svg') : null;
    if (svg) svg.style.transform = `translate3d(${pointX}px, ${pointY}px, 0) scale(${zoomScale})`;
}

function initBoilerInteractions() {
    // PERBAIKAN 2: Batasi jangkauan interaksi hanya pada Halaman yang Aktif
    const activePage = document.querySelector('.page-section.active');
    if (!activePage) return;
    
    const container = activePage.querySelector('.diagram-wrapper.active');
    const svg = container ? container.querySelector('svg') : null;
    if (!container || !svg) return;

    // SCROLL ZOOM
    container.onwheel = (e) => {
        e.preventDefault();
        const delta = e.wheelDelta ? e.wheelDelta : -e.deltaY;
        const xs = (e.clientX - pointX) / zoomScale;
        const ys = (e.clientY - pointY) / zoomScale;
        
        if (delta > 0) zoomScale *= 1.1; 
        else zoomScale /= 1.1;
        
        zoomScale = Math.min(Math.max(0.1, zoomScale), 15); 
        pointX = e.clientX - xs * zoomScale;
        pointY = e.clientY - ys * zoomScale;
        applyTransform();
    };

    // A. SCROLL MOUSE (DESKTOP)
    wrapper.onwheel = (e) => {
        e.preventDefault();
        const xs = (e.clientX - posX) / scale;
        const ys = (e.clientY - posY) / scale;
        scale *= (e.deltaY > 0) ? 0.9 : 1.1;
        scale = Math.min(Math.max(0.1, scale), 15);
        posX = e.clientX - xs * scale;
        posY = e.clientY - ys * scale;
        apply();
    };

    // B. DRAG PAN (DESKTOP)
    wrapper.onmousedown = (e) => {
        if (e.button !== 0) return;
        isDragging = true;
        startX = e.clientX - posX;
        startY = e.clientY - posY;
        wrapper.style.cursor = 'grabbing';
    };

    // -- EVENT: MOUSE UP (PAN END) --
    window.onmouseup = () => {
        isPanning = false;
        if(container) container.style.cursor = 'grab';
    // HOVER TOOLTIP
    const popup = document.getElementById('info-popup');
    svg.querySelectorAll('*').forEach(el => {
        const id = (el.getAttribute('id') || '').toUpperCase();
        
        // PERBAIKAN 3: Abaikan elemen Group (<g>) agar tidak merusak fungsi tombol Filter STEAM
        if (el.tagName === 'g' || el.tagName === 'defs' || id === 'STM01' || id.startsWith('LINE')) { 
            el.style.pointerEvents = 'none'; 
            return; 
        }
        
        let key = Object.keys(equipInfo).find(k => id.includes(k) || el.textContent.toUpperCase().includes(k));
        if (key) {
                el.style.cursor = 'help'; 
                el.style.pointerEvents = 'all';
                el.onmouseenter = () => {
                    document.getElementById('popup-title').innerText = equipInfo[key].title;
                    document.getElementById('popup-body').innerText = equipInfo[key].body;
                    popup.classList.add('visible');
                };
                el.onmousemove = (e) => { popup.style.left = (e.clientX + 20) + 'px'; popup.style.top = (e.clientY + 20) + 'px'; };
                el.onmouseleave = () => popup.classList.remove('visible');
        }
    });

    // PERBAIKAN 4: Injeksi Animasi Paksa untuk Api, Asap, dan Kipas
    svg.querySelectorAll('[id*="GLOW" i], [id*="FIRE" i], [id*="FURNACE" i]').forEach(el => el.classList.add('furnace-glow'));
    svg.querySelectorAll('[id*="SMOKE" i], [id*="ASAP" i]').forEach(el => el.classList.add('smoke-anim'));
    svg.querySelectorAll('[id^="blade" i]').forEach(f => f.classList.add('fan-spin'));
}

// PERBAIKAN 5: Radar Observer Otomatis saat ganti tab
window.addEventListener('load', () => {
    initBoilerInteractions();
    const observer = new MutationObserver(initBoilerInteractions);
    document.querySelectorAll('.diagram-wrapper').forEach(w => observer.observe(w, { childList: true }));
});
