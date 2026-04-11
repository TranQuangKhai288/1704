let isWarping = false; // Biến trạng thái để kiểm soát tốc độ sao
let typingInterval;
let currentScale = 1; // Biến lưu trữ cự ly zoom hiện tại của camera

document.addEventListener('DOMContentLoaded', async () => {
    initStarfield();
    initStardust();
    initBeltStars();
    setupOverlay();
    setupScrollZoom();
    
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        initGalaxy(data);
    } catch (e) {
        console.warn('Could not load data.json. Falling back to hardcoded image list.');
        const fallbackData = [];
        const fallbackImages = [
            "images/1cbf1184-e528-4d6e-9a08-72523f0f87fa.jpg",
            "images/2cb3f010-770d-4eb4-b2de-149d2346fac3.jpg",
            "images/54f5317a-54d1-40e5-8c2b-a5d9f9f0d199.jpg",
            "images/a2fcce55-9c50-4f6a-ae57-ee98be36cd0b.jpg",
            "images/da600ce8-fd62-4966-8f4b-7cabf6d50c66.jpg",
            "images/dfe29a45-e514-4bc2-aba8-8de04f3e978b.jpg"
        ];
        const phamCau = ["Vũ trụ Cyberpunk", "Vũ trụ Vĩnh Hằng", "Khúc ca Ngân Hà", "Định mệnh Không Gian"];
        for(let i=0; i<18; i++){
            fallbackData.push({
                image: fallbackImages[i % fallbackImages.length],
                message: phamCau[Math.floor(Math.random() * phamCau.length)] + " - Gặp em ở điểm kết thúc của thời gian."
            });
        }
        initGalaxy(fallbackData);
    }
});

function initStarfield() {
    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const stars = [];
    const numStars = 600; 
    
    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: Math.random() * canvas.width - canvas.width / 2,
            y: Math.random() * canvas.height - canvas.height / 2,
            z: Math.random() * canvas.width,
            alpha: Math.random(),
            speedAlpha: Math.random() * 0.02 + 0.005
        });
    }

    function animateStars() {
        if (isWarping) {
            ctx.fillStyle = 'rgba(2, 1, 8, 0.2)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        for (let star of stars) {
            if (isWarping) {
                star.z -= 15; 
                if (star.z <= 0) {
                    star.z = canvas.width;
                    star.x = Math.random() * canvas.width - cx;
                    star.y = Math.random() * canvas.height - cy;
                }
            } else {
                star.z -= 0.5; 
                if (star.z <= 0) {
                    star.z = canvas.width;
                }
            }

            const k = 120.0 / star.z;
            const px = star.x * k + cx;
            const py = star.y * k + cy;

            if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
                const size = (1 - star.z / canvas.width) * 3; 
                
                ctx.beginPath();
                ctx.arc(px, py, size, 0, Math.PI * 2);

                if(isWarping) {
                    ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, size/2 + 0.3)})`;
                } else {
                    ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
                    star.alpha += star.speedAlpha;
                    if (star.alpha > 1 || star.alpha < 0.1) star.speedAlpha = -star.speedAlpha;
                }
                
                ctx.fill();
            }
        }
        requestAnimationFrame(animateStars);
    }
    
    animateStars();

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

function initStardust() {
    const scene = document.getElementById('galaxy-scene');
    
    // Tạo 5 đường orbital rings (đường ray ánh sáng phát quang)
    for(let r = 80; r <= 360; r += 70) {
        const ring = document.createElement('div');
        ring.className = 'orbital-ring';
        ring.style.width = (r * 2) + 'px';
        ring.style.height = (r * 2) + 'px';
        ring.style.left = (-r) + 'px';
        ring.style.top = (-r) + 'px';
        // Đặt nằm ngửa song song với mặt phẳng XZ
        ring.style.transform = `rotateX(90deg)`;
        scene.appendChild(ring);
    }

    // Tạo 160 hạt stardust theo yêu cầu
    for(let i = 0; i < 160; i++) {
        // Thu hẹp bán kính lại thêm nữa (40 đến 360)
        const r = 40 + Math.random() * 320; 
        const theta = Math.random() * Math.PI * 2;
        // Chiều cao ngẫu nhiên (nhiễu loạn thu hẹp lại 100)
        const y = (Math.random() - 0.5) * (Math.random() * 100); 
        const x = Math.cos(theta) * r;
        const z = Math.sin(theta) * r;

        const dust = document.createElement('div');
        dust.className = 'stardust';
        
        const size = Math.random() * 2.5 + 0.5; // kích thước bé (0.5->3)
        dust.style.width = size + 'px';
        dust.style.height = size + 'px';
        dust.style.left = (-size/2) + 'px';
        dust.style.top = (-size/2) + 'px';
        dust.style.transform = `translate3d(${x}px, ${y}px, ${z}px)`;
        
        // Random màu sắc để bớt đơn điệu (Phục hồi đổ bóng)
        if (Math.random() > 0.8) {
            dust.style.background = '#fde047'; 
            dust.style.boxShadow = '0 0 10px #fde047';
        }
        
        scene.appendChild(dust);
    }
}

function initBeltStars() {
    const scene = document.getElementById('galaxy-scene');
    
    // Thêm 60 tiểu hành tinh/ngôi sao tĩnh xen lẫn cùng vành đai ảnh
    for(let i = 0; i < 60; i++) {
        // Tán đều theo bán kính (bỏ sqrt) để vùng nằm gần mặt trời sẽ xuất hiện nhiều vật thể bằng vòng ngoài
        const currentRadius = 80 + Math.random() * 300;
        const theta = Math.random() * Math.PI * 2;
        const finalX = Math.cos(theta) * currentRadius;
        const finalZ = Math.sin(theta) * currentRadius;
        const heightVariation = 110;
        const finalY = (Math.random() * heightVariation) - (heightVariation / 2);

        // Khung giữ vị trí 3D
        const wrapper = document.createElement('div');
        wrapper.style.position = 'absolute';
        wrapper.style.transform = `translate3d(${finalX}px, ${finalY}px, ${finalZ}px)`;
        wrapper.style.transformStyle = 'preserve-3d';
        
        // Vật thể pha lê (đứng yên nhưng góc quay ngẫu nhiên)
        const star = document.createElement('div');
        star.className = 'belt-star';
        
        // Random màu sắc
        const colors = ['color-1', 'color-2', 'color-3'];
        star.classList.add(colors[Math.floor(Math.random() * colors.length)]);
        
        // Random kích thước từ nhỏ đến vừa
        const size = Math.random() * 12 + 4; 
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        star.style.left = (-size/2) + 'px';
        star.style.top = (-size/2) + 'px';
        
        // Cố định góc xoay tĩnh để tiết kiệm GPU thay vì animation
        star.style.transform = `rotateX(${Math.random()*360}deg) rotateY(${Math.random()*360}deg) rotateZ(${Math.random()*360}deg)`;
        
        wrapper.appendChild(star);
        scene.appendChild(wrapper);
    }
}

function initGalaxy(sourceData) {
    const scene = document.getElementById('galaxy-scene');
    
    // Giảm mật độ ảnh xuống còn 45
    let denseData = [];
    while (denseData.length < 80) {
        denseData = denseData.concat(sourceData);
    }
    const numImages = 45; 
    const data = denseData.slice(0, numImages);
    
    for (let i = 0; i < numImages; i++) {
        // Loại bỏ tỷ lệ diện tích (sqrt) để ưu tiên kéo tỉ trọng ảnh dồn về mặt trời ngang bằng rìa đĩa 
        const currentRadius = 80 + Math.random() * 300;
        const theta = Math.random() * Math.PI * 2;

        const finalX = Math.cos(theta) * currentRadius;
        const finalZ = Math.sin(theta) * currentRadius;
        
        // Độ nhấp nhô mỏng dần ở rìa và xoáy, thu hẹp còn 90
        const heightVariation = 90;
        const finalY = (Math.random() * heightVariation) - (heightVariation / 2);

        // Góc xoay để card luôn hướng về mặt trời
        const rotY = Math.atan2(finalX, finalZ) * (180 / Math.PI);
        const rotX = Math.atan2(finalY, Math.sqrt(finalX*finalX + finalZ*finalZ)) * (180 / Math.PI);

        const card = document.createElement('div');
        card.className = 'image-card';
        card.style.transform = `translate3d(${finalX}px, ${finalY}px, ${finalZ}px) rotateY(${rotY}deg) rotateX(${-rotX}deg)`;
        
        const imgSrc = data[i].image;
        
        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = "Universe Memory";
        
        img.onerror = function() { this.src = ''; }
        
        card.appendChild(img);
        
        card.addEventListener('click', () => {
            const randomTemplateNum = Math.floor(Math.random() * 3) + 1;
            openOverlay(imgSrc, `Vũ trụ nhánh #${i+1}`, data[i].message, randomTemplateNum);
        });
        
        scene.appendChild(card);
    }
}

function setupOverlay() {
    const overlay = document.getElementById('overlay');
    const closeBtn = document.getElementById('close-btn');
    
    closeBtn.addEventListener('click', () => closeOverlay());

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.classList.contains('overlay-background')) {
            closeOverlay();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closeOverlay();
        }
    });
}

// Thêm logic cuộn chuột để zoom tự do trên máy tính
function setupScrollZoom() {
    const container = document.getElementById('universe-container');
    
    window.addEventListener('wheel', (e) => {
        const overlay = document.getElementById('overlay');
        
        // Vô hiệu hóa thao tác cuộn nếu đang coi template hoặc đang bay warp speed
        if (overlay.classList.contains('active') || isWarping) return;
        
        const zoomSpeed = 0.15;
        if (e.deltaY < 0) {
            currentScale += zoomSpeed; // Cuộn lên -> Bay tới trước
        } else {
            currentScale -= zoomSpeed; // Cuộn xuống -> Lùi lại
        }
        
        // Khóa giới hạn từ 0.3x (chạy lùi ra xa tít) đến cực đại 4.5x (kế bên mặt trời)
        currentScale = Math.max(0.3, Math.min(currentScale, 4.5));
        
        container.style.transition = 'transform 0.15s ease-out';
        container.style.transform = `scale(${currentScale})`;
    });
}

function startTypingEffect(element, text, speed = 40) {
    element.innerHTML = ''; 
    element.classList.add('typing-cursor');
    let idx = 0;

    clearInterval(typingInterval);
    
    typingInterval = setInterval(() => {
        if (idx < text.length) {
            element.innerHTML += text.charAt(idx);
            idx++;
        } else {
            clearInterval(typingInterval);
            element.classList.remove('typing-cursor');
        }
    }, speed);
}

function openOverlay(imgSrc, title, message, templateNum) {
    const scene = document.getElementById('galaxy-scene');
    const container = document.getElementById('universe-container');
    const overlay = document.getElementById('overlay');
    const overlayContent = document.querySelector('.overlay-content');
    const overlayImg = document.getElementById('overlay-image');
    
    const badge = document.querySelector('.universe-badge') || document.createElement('span');
    badge.className = 'universe-badge';
    badge.textContent = `Dòng thời gian ${templateNum}`;
    
    const h1Title = document.querySelector('#overlay-title code') || document.createElement('div');
    h1Title.innerHTML = title;
    
    const overlayTitleWrapper = document.getElementById('overlay-title');
    overlayTitleWrapper.innerHTML = '';
    overlayTitleWrapper.appendChild(badge);
    overlayTitleWrapper.innerHTML += '<br>';
    overlayTitleWrapper.innerHTML += title;

    const overlayMessage = document.getElementById('overlay-message');
    overlayMessage.textContent = ''; 
    overlayMessage.classList.remove('typing-cursor'); 
    clearInterval(typingInterval);

    // Kích hoạt Warp speed animation
    isWarping = true;
    
    // Zoom vũ trụ và CHẬM LẠI thời gian mờ (opacity 1.5s mới mờ dần) 
    // để người dùng kịp ngắm cảnh camera lao vào các hành tinh gần mặt trời nhất
    container.style.transition = 'transform 1.8s cubic-bezier(0.25, 1, 0.5, 1), opacity 1.5s ease-in 0.3s';
    container.style.transform = 'scale(4.5)';
    container.style.opacity = '0';
    scene.classList.add('paused');

    overlayImg.src = imgSrc;
    
    // CHỜ XONG ANIMATION BAY RA MỚI HIỆN VŨ TRỤ
    setTimeout(() => {
        isWarping = false; // Ngừng warp
        
        // Hiện overlay nền vũ trụ lên
        overlay.className = `universe-${templateNum} active`;
        overlayContent.className = `overlay-content template-${templateNum}`;

        // Đợi nền Vũ trụ sáng lên một chút rồi mới gõ chữ
        setTimeout(() => {
            if(overlay.classList.contains('active')) {
                startTypingEffect(overlayMessage, message, 50);
            }
        }, 1200); // Overlay mất 1s để mờ sáng lên

    }, 1800); // 1.8 giây là thời gian animation scale(10) hoàn thành
}

function closeOverlay() {
    const scene = document.getElementById('galaxy-scene');
    const container = document.getElementById('universe-container');
    const overlay = document.getElementById('overlay');
    const overlayMessage = document.getElementById('overlay-message');
    
    clearInterval(typingInterval);
    overlayMessage.innerHTML = '';

    // 1. Tắt overlay trước
    overlay.classList.remove('active');
    
    // 2. Chờ overlay hoàn toàn tắt đi thì mới hiện lại dải ngân hà
    setTimeout(() => {
        // Overlay thành dạng ẩn hẳn (display none)
        overlay.classList.add('hidden');
        
        // Reset scale về trạng thái mặc định 1x
        currentScale = 1;
        container.style.transition = 'transform 1.5s cubic-bezier(0.25, 1, 0.5, 1), opacity 1s ease-out';
        container.style.transform = `scale(${currentScale})`;
        container.style.opacity = '1';
        
        setTimeout(() => {
            scene.classList.remove('paused');
        }, 1500);

    }, 800); // Thời gian fade out của overlay  
}
