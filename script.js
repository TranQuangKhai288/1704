let isWarping = false; // Biến trạng thái để kiểm soát tốc độ sao
let typingInterval;
let currentScale = 1; // Biến lưu trữ cự ly zoom hiện tại của camera

// --- HỆ THỐNG VẬT LÝ ---
let galaxyAngle = 0;       // Góc quay quanh trục Y hiện tại
let baseSpeed = 0.05;      // Tốc độ quay tự do rất chậm theo yêu cầu
let inertiaVelocity = baseSpeed;

let tiltX = -20;           // Ngẩng góc nhìn xéo từ đỉnh xuống theo yêu cầu
let tiltZ = 5;             // Góc nghiêng mặt phẳng

let isDragging = false;
let hasDragged = false;    // Cờ báo hiệu phân biệt Click và Swipe
let startX = 0, startY = 0, lastX = 0;
// -----------------------

document.addEventListener('DOMContentLoaded', async () => {
    initStarfield();
    initStardust();
    initBeltStars();
    setupOverlay();
    setupScrollZoom();
    setupPhysics(); // Kích hoạt hệ thống văng quán tính & Camera mượt

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
        for (let i = 0; i < 18; i++) {
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

                if (isWarping) {
                    ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, size / 2 + 0.3)})`;
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
    for (let r = 90; r <= 400; r += 75) {
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
    for (let i = 0; i < 160; i++) {
        // Nới rộng bán kính ra một chút xíu (50 đến 400)
        const r = 50 + Math.random() * 350;
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
        dust.style.left = (-size / 2) + 'px';
        dust.style.top = (-size / 2) + 'px';
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

    // Thêm 60 hành tinh với 3 mẫu hình khối: Sao Thổ 3D, Cầu Khí 3D, Thiên Thạch Pha Lê
    for (let i = 0; i < 60; i++) {
        const currentRadius = 90 + Math.random() * 330;
        const theta = Math.random() * Math.PI * 2;
        const finalX = Math.cos(theta) * currentRadius;
        const finalZ = Math.sin(theta) * currentRadius;
        const heightVariation = 110;
        const finalY = (Math.random() * heightVariation) - (heightVariation / 2);

        // Khung giữ vị trí 3D không đổi
        const wrapper = document.createElement('div');
        wrapper.style.position = 'absolute';
        wrapper.style.transform = `translate3d(${finalX}px, ${finalY}px, ${finalZ}px)`;
        wrapper.style.transformStyle = 'preserve-3d';

        const typeRand = Math.random();
        const size = Math.random() * 8 + 3; // Thu nhỏ lại theo yêu cầu (3 -> 11)

        if (typeRand < 0.25) {
            // Mẫu 1: Hành tinh có vành đai kiểu Sao Thổ (Saturn)
            const ring = document.createElement('div');
            ring.className = 'planet-ring';
            ring.style.width = (size * 2.5) + 'px';
            ring.style.height = (size * 2.5) + 'px';
            ring.style.left = (-size * 1.25) + 'px';
            ring.style.top = (-size * 1.25) + 'px';
            ring.style.transform = `rotateX(${Math.random() * 180}deg) rotateY(${Math.random() * 180}deg)`;

            const core = document.createElement('div');
            core.className = 'planet-core billboard color-saturn';
            core.style.width = size + 'px';
            core.style.height = size + 'px';
            core.style.left = (-size / 2) + 'px';
            core.style.top = (-size / 2) + 'px';

            wrapper.appendChild(ring);
            wrapper.appendChild(core);

        } else if (typeRand < 0.6) {
            // Mẫu 2: Quả cầu Khí đa màu sắc 3D (Gas Giant)
            const core = document.createElement('div');
            const colors = ['color-blue', 'color-pink', 'color-gold', 'color-green', 'color-purple', 'color-red', 'color-cyan'];
            core.className = `planet-core billboard ${colors[Math.floor(Math.random() * colors.length)]}`;
            core.style.width = size + 'px';
            core.style.height = size + 'px';
            core.style.left = (-size / 2) + 'px';
            core.style.top = (-size / 2) + 'px';

            wrapper.appendChild(core);
        } else {
            // Mẫu 3: Thiên thạch pha lê (Bản sắc nhọn không bo viền)
            const crystal = document.createElement('div');
            crystal.className = 'crystal-asteroid';
            crystal.style.width = size + 'px';
            crystal.style.height = size + 'px';
            crystal.style.left = (-size / 2) + 'px';
            crystal.style.top = (-size / 2) + 'px';
            // Cố định một góc xoay ngẫu nhiên trôi nổi trong không gian
            crystal.style.transform = `rotateX(${Math.random() * 360}deg) rotateY(${Math.random() * 360}deg) rotateZ(${Math.random() * 360}deg)`;

            wrapper.appendChild(crystal);
        }

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
        // Tán ảnh ra rộng hơn 1 tí nhưng vẫn giữ mật độ dày dồn về mặt trời (90 đến 420)
        const currentRadius = 90 + Math.random() * 330;
        const theta = Math.random() * Math.PI * 2;

        const finalX = Math.cos(theta) * currentRadius;
        const finalZ = Math.sin(theta) * currentRadius;

        // Độ nhấp nhô mỏng dần ở rìa và xoáy, thu hẹp còn 90
        const heightVariation = 90;
        const finalY = (Math.random() * heightVariation) - (heightVariation / 2);

        // Góc xoay để card luôn hướng về mặt trời
        const rotY = Math.atan2(finalX, finalZ) * (180 / Math.PI);
        const rotX = Math.atan2(finalY, Math.sqrt(finalX * finalX + finalZ * finalZ)) * (180 / Math.PI);

        const card = document.createElement('div');
        card.className = 'image-card';
        card.style.transform = `translate3d(${finalX}px, ${finalY}px, ${finalZ}px) rotateY(${rotY}deg) rotateX(${-rotX}deg)`;

        const imgSrc = data[i].image;

        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = "Universe Memory";

        img.onerror = function () { this.src = ''; }

        card.appendChild(img);

        card.addEventListener('click', (e) => {
            // Chặn tuyệt đối việc mở ảnh nếu người dùng thực chất đang kéo lướt màn hình
            if (hasDragged) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }

            const randomTemplateNum = Math.floor(Math.random() * 3) + 1;
            openOverlay(imgSrc, `Vũ trụ nhánh #${i + 1}`, data[i].message, randomTemplateNum);
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
    // Đã gỡ .paused do Javascript tự ngưng Physics lúc isWarping = true

    overlayImg.src = imgSrc;

    // CHỜ XONG ANIMATION BAY RA MỚI HIỆN VŨ TRỤ
    setTimeout(() => {
        isWarping = false; // Ngừng warp

        // Hiện overlay nền vũ trụ lên
        overlay.className = `universe-${templateNum} active`;
        overlayContent.className = `overlay-content template-${templateNum}`;

        // Đợi nền Vũ trụ sáng lên một chút rồi mới gõ chữ
        setTimeout(() => {
            if (overlay.classList.contains('active')) {
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

    }, 800); // Thời gian fade out của overlay  
}

// ----------------------------------------------------
// THUẬT TOÁN ĐỘNG HỌC (VUỐT VÀ NÉM VỚI QUÁN TÍNH)
// ----------------------------------------------------
function setupPhysics() {
    const container = document.getElementById('universe-container');
    const scene = document.getElementById('galaxy-scene');

    container.addEventListener('mousedown', dragStart);
    container.addEventListener('touchstart', dragStart, { passive: false });

    document.addEventListener('mousemove', dragMove);
    document.addEventListener('touchmove', dragMove, { passive: false });

    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('touchend', dragEnd);

    function dragStart(e) {
        if (isWarping || document.getElementById('overlay').classList.contains('active')) return;

        // Bắt đầu túm lấy màn hình
        isDragging = true;
        hasDragged = false; // Reset cờ kéo mỗi lần nhấp chuột mới

        const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;

        startX = clientX;
        startY = clientY;
        lastX = clientX;
        container.style.cursor = 'grabbing';
    }

    function dragMove(e) {
        if (!isDragging) return;

        const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;

        /** 1. Kéo Lên/Xuống để lật góc máy ảnh **/
        const deltaY = clientY - startY;
        const deltaX = clientX - lastX;

        // Cắm cờ nếu người dùng đã trượt tay quá biên độ nhẹ (chắc chắn là họ đang Drag chứ không phải rung tay khi Click)
        if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
            hasDragged = true;
        }

        tiltX += deltaY * 0.2; // Rê chuột để lật mâm thiên hà

        // Mở biên độ lật cho máy ảnh được tự do ngắm từ đỉnh chóp (-80) xuống thẳng đáy (80)
        tiltX = Math.max(-80, Math.min(tiltX, 80));

        // Reset chốt startY để lật mượt
        startY = clientY;

        /** 2. Trượt Trái/Phải để ném dải Ngân Hà xoay vòng vòng **/
        // Chú ý: deltaX đã được khai báo ở trên để dùng chung cho việc bắt sự kiện vuốt.

        // Quay trực tiếp theo ngón tay
        galaxyAngle += deltaX * 0.4;

        // Lực vận tốc ngay thời điểm ngón tay vuốt (để truyền lực cho khoảnh khắc thả tay)
        inertiaVelocity = deltaX * 0.5;

        lastX = clientX;
    }

    function dragEnd() {
        if (!isDragging) return;
        isDragging = false;
        container.style.cursor = 'default';
        //inertiaVelocity sẽ bảo toàn và bay tiếp
    }

    // Heartbeat tính toán Vật Lý liên tục (60 FPS)
    function renderPhysics() {
        // Chỉ diễn ra khi người dùng đang ở ngoài màn hình chính (không trong Warp Speed)
        if (!isWarping) {
            if (!isDragging) {
                // Định luật ma sát không gian: Lực đẩy dần triệt tiêu từ từ trở về lại Vận Tốc Nhỏ Chuẩn ban đầu bằng hiệu ứng Nội Suy (Lerp)
                inertiaVelocity += (baseSpeed - inertiaVelocity) * 0.05;
                galaxyAngle += inertiaVelocity;
            }
        }

        // Cập nhật DOM Matrix thay vì chạy CSS Keyframes
        scene.style.transform = `rotateX(${tiltX}deg) rotateZ(${tiltZ}deg) rotateY(${galaxyAngle}deg)`;

        // Thuật toán Billboarding: Ép các Khối cầu Ảo giác luôn nhìn chằm chằm vào Camera
        // Giúp giữ vững bề mặt ánh sáng Gradient trông tròn xoe 3D dưới mọi góc độ
        const billboards = document.querySelectorAll('.billboard');
        const counterTransform = `rotateY(${-galaxyAngle}deg) rotateZ(${-tiltZ}deg) rotateX(${-tiltX}deg)`;
        for (let i = 0; i < billboards.length; i++) {
            billboards[i].style.transform = counterTransform;
        }

        requestAnimationFrame(renderPhysics);
    }

    renderPhysics();
}
