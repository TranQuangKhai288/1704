// ============================================
// BIRTHDAY INTRO SYSTEM
// ============================================
const introStoryTexts = [
  "Gửi đến người con gái mà anh yêu, người đã thay đổi con người anh. ",
  "Trước kia, mọi thứ cứ trôi qua bình lặng, lặp đi lặp lại một cách đơn điệu. Không có gì đặc biệt, không có gì đáng nhớ.",
  "Rồi ngày em đến, mọi thứ anh làm đều có ý nghĩa hơn, đều có suy nghĩ về em ở trong đó. Anh cảm thấy mình thật may mắn khi có em ở bên.",
  "Nhưng mà vì con người của anh trước kia, anh đã không thể ở bên em được lâu hơn như là mình mong muốn.",
  "Nhưng mà giờ anh đã thay đổi rồi, anh sẽ hông làm gì khiến em phải bất an hay lo lắng nữa. Cho dù không làm em cười, anh cũng sẽ ở bên em quài cho tới khi em chán thôi.",
  "Chúc em iu tuổi mới xinh hơn nữa, giỏi hơn nữa, iu anh nhìu hơn nữa, ở bên anh nhiều hơn nữa. A iu em ở mọi vũ trụ 😘",
];

let introCurrentScene = 0;
let introTypingInterval = null;
let introAutoTimer = null;
let introParticlesCtx = null;
let introParticlesCanvas = null;
let introParticles = [];
let introAnimationId = null;

function initTapToStart() {
  const tapOverlay = document.getElementById("tap-to-start-overlay");
  if (!tapOverlay) return;

  let hasStarted = false;

  const startExperience = () => {
    if (hasStarted) return;
    hasStarted = true;

    // Play audio unmute
    const bgMusic = document.getElementById("bg-music");
    if (bgMusic && bgMusic.muted) {
      bgMusic.muted = false;
      bgMusic.play().catch(() => {});
    }

    // Hide tap overlay
    tapOverlay.classList.add("exiting");
    setTimeout(() => {
      tapOverlay.classList.add("hidden");
      // NOW start the intro after modal is dismissed
      initIntroSystem();
    }, 600);

    // Remove listeners
    document.removeEventListener("click", startExperience, true);
    document.removeEventListener("touchstart", startExperience, { capture: true });
  };

  // Listen for any click/touch to start
  document.addEventListener("click", startExperience, true);
  document.addEventListener("touchstart", startExperience, { capture: true, passive: true });
}

function initIntroSystem() {
  document.body.classList.add("intro-active");

  initIntroParticles();
  initSparkles();
  setupIntroEvents();

  // Auto-advance scene 1 after 4 seconds
  introAutoTimer = setTimeout(() => advanceIntroScene(), 4500);
}

function initIntroParticles() {
  introParticlesCanvas = document.getElementById("intro-particles");
  if (!introParticlesCanvas) return;

  introParticlesCtx = introParticlesCanvas.getContext("2d");
  introParticlesCanvas.width = window.innerWidth;
  introParticlesCanvas.height = window.innerHeight;

  // Create floating hearts and stars
  for (let i = 0; i < 50; i++) {
    introParticles.push({
      x: Math.random() * introParticlesCanvas.width,
      y: Math.random() * introParticlesCanvas.height,
      size: Math.random() * 12 + 4,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: -Math.random() * 0.8 - 0.2,
      opacity: Math.random() * 0.5 + 0.1,
      opacitySpeed: Math.random() * 0.008 + 0.003,
      type: Math.random() > 0.5 ? "heart" : "star",
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
    });
  }

  animateIntroParticles();

  window.addEventListener("resize", () => {
    if (introParticlesCanvas) {
      introParticlesCanvas.width = window.innerWidth;
      introParticlesCanvas.height = window.innerHeight;
    }
  });
}

function drawHeart(ctx, x, y, size, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  const s = size / 10;
  ctx.moveTo(0, s * 3);
  ctx.bezierCurveTo(-s * 5, -s * 2, -s * 9, s * 2, 0, s * 9);
  ctx.bezierCurveTo(s * 9, s * 2, s * 5, -s * 2, 0, s * 3);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function drawStar(ctx, x, y, size, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  const spikes = 4;
  const outerR = size / 2;
  const innerR = outerR * 0.4;
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / spikes) * i - Math.PI / 2;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function animateIntroParticles() {
  if (!introParticlesCtx || !introParticlesCanvas) return;

  introParticlesCtx.clearRect(
    0,
    0,
    introParticlesCanvas.width,
    introParticlesCanvas.height,
  );

  for (let p of introParticles) {
    p.x += p.speedX;
    p.y += p.speedY;
    p.rotation += p.rotSpeed;
    p.opacity += p.opacitySpeed;

    if (p.opacity > 0.6 || p.opacity < 0.05) p.opacitySpeed = -p.opacitySpeed;

    // Reset when off screen
    if (p.y < -20) {
      p.y = introParticlesCanvas.height + 20;
      p.x = Math.random() * introParticlesCanvas.width;
    }
    if (p.x < -20) p.x = introParticlesCanvas.width + 20;
    if (p.x > introParticlesCanvas.width + 20) p.x = -20;

    introParticlesCtx.save();
    introParticlesCtx.globalAlpha = p.opacity;
    introParticlesCtx.translate(p.x, p.y);
    introParticlesCtx.rotate(p.rotation);
    introParticlesCtx.translate(-p.x, -p.y);

    if (p.type === "heart") {
      drawHeart(
        introParticlesCtx,
        p.x,
        p.y,
        p.size,
        `rgba(244, 114, 182, ${p.opacity})`,
      );
    } else {
      drawStar(
        introParticlesCtx,
        p.x,
        p.y,
        p.size,
        `rgba(251, 191, 36, ${p.opacity})`,
      );
    }

    introParticlesCtx.restore();
  }

  introAnimationId = requestAnimationFrame(animateIntroParticles);
}

function initSparkles() {
  const container = document.querySelector(".sparkle-container");
  if (!container) return;

  for (let i = 0; i < 25; i++) {
    const sparkle = document.createElement("div");
    sparkle.className = "sparkle";
    sparkle.style.left = Math.random() * 100 + "%";
    sparkle.style.top = Math.random() * 100 + "%";
    sparkle.style.animationDelay = Math.random() * 3 + "s";
    sparkle.style.animationDuration = Math.random() * 2 + 1.5 + "s";

    const colors = [
      "rgba(244, 114, 182, 0.8)",
      "rgba(251, 191, 36, 0.8)",
      "rgba(192, 132, 252, 0.8)",
      "rgba(255, 255, 255, 0.9)",
    ];
    sparkle.style.background =
      colors[Math.floor(Math.random() * colors.length)];
    sparkle.style.boxShadow = `0 0 6px ${sparkle.style.background}`;

    container.appendChild(sparkle);
  }
}

function introTypeText(elementId, text, speed = 45) {
  return new Promise((resolve) => {
    const el = document.getElementById(elementId);
    if (!el) {
      resolve();
      return;
    }

    el.innerHTML = "";
    el.classList.add("typing-active");
    let idx = 0;

    clearInterval(introTypingInterval);

    introTypingInterval = setInterval(() => {
      if (idx < text.length) {
        el.innerHTML += text.charAt(idx);
        idx++;
      } else {
        clearInterval(introTypingInterval);
        el.classList.remove("typing-active");
        resolve();
      }
    }, speed);
  });
}

function advanceIntroScene() {
  clearTimeout(introAutoTimer);
  clearInterval(introTypingInterval);

  const scenes = document.querySelectorAll(".intro-scene");
  const dots = document.querySelectorAll(".progress-dot");

  // Exit current scene
  if (scenes[introCurrentScene]) {
    scenes[introCurrentScene].classList.remove("active");
    scenes[introCurrentScene].classList.add("exit-up");
  }
  if (dots[introCurrentScene]) {
    dots[introCurrentScene].classList.remove("active");
  }

  introCurrentScene++;

  if (introCurrentScene >= scenes.length) {
    return; // All scenes done
  }

  // Show next scene
  setTimeout(() => {
    if (scenes[introCurrentScene]) {
      scenes[introCurrentScene].classList.add("active");
    }
    if (dots[introCurrentScene]) {
      dots[introCurrentScene].classList.add("active");
    }

    // Handle typing for story scenes (Scenes 2 to 7, indices 1 to 6)
    if (introCurrentScene >= 1 && introCurrentScene <= 6) {
      const textIndex = introCurrentScene - 1;
      const elementId = `story-text-${introCurrentScene}`;

      setTimeout(async () => {
        await introTypeText(elementId, introStoryTexts[textIndex], 45);

        // Auto-advance for all but the last scene
        if (introCurrentScene < 6) {
          introAutoTimer = setTimeout(() => advanceIntroScene(), 3000);
        }
      }, 800);
    }
  }, 600);
}

function exitIntro() {
  clearTimeout(introAutoTimer);
  clearInterval(introTypingInterval);

  const introOverlay = document.getElementById("intro-overlay");
  introOverlay.classList.add("exiting");

  // Show galaxy
  document.body.classList.remove("intro-active");

  // Cleanup after transition and show tutorial
  setTimeout(() => {
    introOverlay.classList.add("hidden");
    if (introAnimationId) cancelAnimationFrame(introAnimationId);
    introParticles = [];

    // Show tutorial after intro fades out
    showTutorial();
  }, 1600);
}

// ============================================
// TUTORIAL SYSTEM
// ============================================
function showTutorial() {
  const tutorialOverlay = document.getElementById("tutorial-overlay");
  if (tutorialOverlay) {
    tutorialOverlay.classList.remove("hidden");
  }
}

function closeTutorial() {
  const tutorialOverlay = document.getElementById("tutorial-overlay");
  if (tutorialOverlay) {
    tutorialOverlay.style.opacity = "0";
    setTimeout(() => {
      tutorialOverlay.classList.add("hidden");
      tutorialOverlay.style.opacity = "1"; // Reset for future if needed
    }, 800);
  }
}

function setupIntroEvents() {
  // Click on intro overlay to advance (except on button)
  const introOverlay = document.getElementById("intro-overlay");
  introOverlay.addEventListener("click", (e) => {
    if (e.target.closest("#enter-universe-btn")) return;
    if (e.target.closest(".progress-dot")) return;

    if (introCurrentScene < 6) {
      advanceIntroScene();
    }
  });

  // Enter universe button
  const enterBtn = document.getElementById("enter-universe-btn");
  if (enterBtn) {
    enterBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      exitIntro();
    });
  }

  // Progress dot clicks
  document.querySelectorAll(".progress-dot").forEach((dot) => {
    dot.addEventListener("click", (e) => {
      e.stopPropagation();
      const targetScene = parseInt(dot.dataset.scene);
      if (targetScene > introCurrentScene) {
        // Fast forward
        while (introCurrentScene < targetScene) {
          advanceIntroScene();
        }
      }
    });
  });

  // Tutorial close button
  const tutorialCloseBtn = document.getElementById("tutorial-close-btn");
  if (tutorialCloseBtn) {
    tutorialCloseBtn.addEventListener("click", closeTutorial);
  }

  // Keyboard support
  document.addEventListener("keydown", (e) => {
    const introOverlay = document.getElementById("intro-overlay");
    if (
      introOverlay.classList.contains("hidden") ||
      introOverlay.classList.contains("exiting")
    )
      return;

    if (e.key === " " || e.key === "ArrowRight" || e.key === "Enter") {
      e.preventDefault();
      if (introCurrentScene < 6) {
        advanceIntroScene();
      } else {
        exitIntro();
      }
    }
  });

  // Touch swipe support
  let touchStartY = 0;
  introOverlay.addEventListener(
    "touchstart",
    (e) => {
      touchStartY = e.touches[0].clientY;
    },
    { passive: true },
  );

  introOverlay.addEventListener(
    "touchend",
    (e) => {
      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;

      if (Math.abs(diff) > 50) {
        if (introCurrentScene < 6) {
          advanceIntroScene();
        }
      }
    },
    { passive: true },
  );
}

// ============================================
// ORIGINAL CODE BEGINS
// ============================================
let isWarping = false; // Biến trạng thái để kiểm soát tốc độ sao
let typingInterval;
let currentScale = 1; // Biến lưu trữ cự ly zoom hiện tại của camera

// --- HỆ THỐNG VẬT LÝ ---
let galaxyAngle = 0; // Góc quay quanh trục Y hiện tại
let baseSpeed = 0.05; // Tốc độ quay tự do rất chậm theo yêu cầu
let inertiaVelocity = baseSpeed;

let tiltX = -20; // Ngẩng góc nhìn xéo từ đỉnh xuống theo yêu cầu
let tiltZ = 5; // Góc nghiêng mặt phẳng

let isDragging = false;
let hasDragged = false; // Cờ báo hiệu phân biệt Click và Swipe
let startX = 0,
  startY = 0,
  lastX = 0;
// -----------------------

const processData = (rawData) => {
  // Hỗ trợ cả 2 định dạng: mảng cũ và object bóc tách mới
  if (Array.isArray(rawData)) {
    if (rawData.length === 0) return rawData;
    const birthdayMessage = rawData.pop();
    for (let i = rawData.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rawData[i], rawData[j]] = [rawData[j], rawData[i]];
    }
    return [...rawData, birthdayMessage];
  } else if (rawData.images && rawData.messages) {
    let combinedData = [];
    const images = rawData.images;
    let availableMessages = [...rawData.messages];

    // Xáo trộn mảng tin nhắn
    for (let i = availableMessages.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableMessages[i], availableMessages[j]] = [
        availableMessages[j],
        availableMessages[i],
      ];
    }

    // Ghép ảnh với các tin nhắn ngẫu nhiên (xoay vòng nếu tin nhắn ít hơn ảnh)
    for (let i = 0; i < images.length; i++) {
      if (i === images.length - 1 && rawData.birthdayMessage) {
        // Ảnh cuối cùng luôn là chốt hạ hiển thị Lời chúc sinh nhật
        combinedData.push({
          image: images[i],
          message: rawData.birthdayMessage,
        });
      } else {
        combinedData.push({
          image: images[i],
          message: availableMessages[i % availableMessages.length],
        });
      }
    }
    return combinedData;
  }
  return [];
};

document.addEventListener("DOMContentLoaded", async () => {
  // Start audio system
  initAudio();

  // Show tap-to-start overlay first (intro will start after user taps)
  initTapToStart();

  // Init galaxy background systems (but intro will start after tap)
  initStarfield();
  initStardust();
  initBeltStars();
  setupOverlay();
  setupScrollZoom();
  setupPhysics(); // Kích hoạt hệ thống văng quán tính & Camera mượt

  try {
    const response = await fetch("data.json");
    if (!response.ok) throw new Error("Network response was not ok");
    let rawData = await response.json();
    const data = processData(rawData);
    initGalaxy(data);
  } catch (e) {
    console.warn(
      "Could not load data.json. Falling back to hardcoded image list.",
    );
    const fallbackData = [];
    const fallbackImages = [
      "images/anh1.png",
      "images/anh2.jpg",
      "images/anh3.jpeg",
      "images/anh4.jpeg",
      "images/anh5.jpeg",
      "images/anh6.jpg",
      "images/anh7.jpge",
      "images/anh8.jpg",
      "images/anh9.jpeg",
      // "images/anh10.jpg",
      // "images/anh11.jpg",
      // "images/anh12.jpg",
      // "images/anh13.jpg",
      // "images/anh14.jpg",
      // "images/anh15.jpg",
      // "images/anh16.jpg",
      // "images/anh17.jpg",
      // "images/anh18.jpg"
    ];
    const phamCau = [
      "Vũ trụ Cyberpunk",
      "Vũ trụ Vĩnh Hằng",
      "Khúc ca Ngân Hà",
      "Định mệnh Không Gian",
    ];
    for (let i = 0; i < 18; i++) {
      fallbackData.push({
        image: fallbackImages[i % fallbackImages.length],
        message:
          phamCau[Math.floor(Math.random() * phamCau.length)] +
          " - Gặp em ở điểm kết thúc của thời gian.",
      });
    }
    initGalaxy(shuffleMessages(fallbackData));
  }
});

function initStarfield() {
  const canvas = document.getElementById("starfield");
  const ctx = canvas.getContext("2d");

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
      speedAlpha: Math.random() * 0.02 + 0.005,
    });
  }

  function animateStars() {
    if (isWarping) {
      ctx.fillStyle = "rgba(2, 1, 8, 0.2)";
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
          if (star.alpha > 1 || star.alpha < 0.1)
            star.speedAlpha = -star.speedAlpha;
        }

        ctx.fill();
      }
    }
    requestAnimationFrame(animateStars);
  }

  animateStars();

  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

function initStardust() {
  const scene = document.getElementById("galaxy-scene");

  // Tạo 5 đường orbital rings (đường ray ánh sáng phát quang)
  for (let r = 90; r <= 400; r += 75) {
    const ring = document.createElement("div");
    ring.className = "orbital-ring";
    ring.style.width = r * 2 + "px";
    ring.style.height = r * 2 + "px";
    ring.style.left = -r + "px";
    ring.style.top = -r + "px";
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

    const dust = document.createElement("div");
    dust.className = "stardust";

    const size = Math.random() * 2.5 + 0.5; // kích thước bé (0.5->3)
    dust.style.width = size + "px";
    dust.style.height = size + "px";
    dust.style.left = -size / 2 + "px";
    dust.style.top = -size / 2 + "px";
    dust.style.transform = `translate3d(${x}px, ${y}px, ${z}px)`;

    // Random màu sắc để bớt đơn điệu (Phục hồi đổ bóng)
    if (Math.random() > 0.8) {
      dust.style.background = "#fde047";
      dust.style.boxShadow = "0 0 10px #fde047";
    }

    scene.appendChild(dust);
  }
}

function initBeltStars() {
  const scene = document.getElementById("galaxy-scene");

  // Thêm 60 hành tinh với 3 mẫu hình khối: Sao Thổ 3D, Cầu Khí 3D, Thiên Thạch Pha Lê
  for (let i = 0; i < 60; i++) {
    const currentRadius = 90 + Math.random() * 330;
    const theta = Math.random() * Math.PI * 2;
    const finalX = Math.cos(theta) * currentRadius;
    const finalZ = Math.sin(theta) * currentRadius;
    const heightVariation = 110;
    const finalY = Math.random() * heightVariation - heightVariation / 2;

    // Khung giữ vị trí 3D không đổi
    const wrapper = document.createElement("div");
    wrapper.style.position = "absolute";
    wrapper.style.transform = `translate3d(${finalX}px, ${finalY}px, ${finalZ}px)`;
    wrapper.style.transformStyle = "preserve-3d";

    const typeRand = Math.random();
    const size = Math.random() * 8 + 3; // Thu nhỏ lại theo yêu cầu (3 -> 11)

    if (typeRand < 0.25) {
      // Mẫu 1: Hành tinh có vành đai kiểu Sao Thổ (Saturn)
      const ring = document.createElement("div");
      ring.className = "planet-ring";
      ring.style.width = size * 2.5 + "px";
      ring.style.height = size * 2.5 + "px";
      ring.style.left = -size * 1.25 + "px";
      ring.style.top = -size * 1.25 + "px";
      ring.style.transform = `rotateX(${Math.random() * 180}deg) rotateY(${Math.random() * 180}deg)`;

      const core = document.createElement("div");
      core.className = "planet-core billboard color-saturn";
      core.style.width = size + "px";
      core.style.height = size + "px";
      core.style.left = -size / 2 + "px";
      core.style.top = -size / 2 + "px";

      wrapper.appendChild(ring);
      wrapper.appendChild(core);
    } else if (typeRand < 0.6) {
      // Mẫu 2: Quả cầu Khí đa màu sắc 3D (Gas Giant)
      const core = document.createElement("div");
      const colors = [
        "color-blue",
        "color-pink",
        "color-gold",
        "color-green",
        "color-purple",
        "color-red",
        "color-cyan",
      ];
      core.className = `planet-core billboard ${colors[Math.floor(Math.random() * colors.length)]}`;
      core.style.width = size + "px";
      core.style.height = size + "px";
      core.style.left = -size / 2 + "px";
      core.style.top = -size / 2 + "px";

      wrapper.appendChild(core);
    } else {
      // Mẫu 3: Thiên thạch pha lê (Bản sắc nhọn không bo viền)
      const crystal = document.createElement("div");
      crystal.className = "crystal-asteroid";
      crystal.style.width = size + "px";
      crystal.style.height = size + "px";
      crystal.style.left = -size / 2 + "px";
      crystal.style.top = -size / 2 + "px";
      // Cố định một góc xoay ngẫu nhiên trôi nổi trong không gian
      crystal.style.transform = `rotateX(${Math.random() * 360}deg) rotateY(${Math.random() * 360}deg) rotateZ(${Math.random() * 360}deg)`;

      wrapper.appendChild(crystal);
    }

    scene.appendChild(wrapper);
  }
}

function initGalaxy(sourceData) {
  const scene = document.getElementById("galaxy-scene");

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
    const finalY = Math.random() * heightVariation - heightVariation / 2;

    // Góc xoay để card luôn hướng về mặt trời
    const rotY = Math.atan2(finalX, finalZ) * (180 / Math.PI);
    const rotX =
      Math.atan2(finalY, Math.sqrt(finalX * finalX + finalZ * finalZ)) *
      (180 / Math.PI);

    const card = document.createElement("div");
    card.className = "image-card";
    card.style.transform = `translate3d(${finalX}px, ${finalY}px, ${finalZ}px) rotateY(${rotY}deg) rotateX(${-rotX}deg)`;

    const imgSrc = data[i].image;

    const img = document.createElement("img");
    img.src = imgSrc;
    img.alt = "Universe Memory";

    img.onerror = function () {
      this.src = "";
    };

    card.appendChild(img);

    card.addEventListener("click", (e) => {
      // Chặn tuyệt đối việc mở ảnh nếu người dùng thực chất đang kéo lướt màn hình
      if (hasDragged) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Tự động phân tích kích thước ảnh thật trước khi hiển thị
      const tempImg = new window.Image();
      tempImg.onload = () => {
        const ratio = tempImg.width / tempImg.height;
        let pool = [];

        if (ratio > 1.2) {
          // Ảnh Ngang (Landscape) -> Chọn các layout xếp dọc (nằm trên/dưới chữ) hoặc rộng rãi
          pool = [4, 6, 10, 11];
        } else if (ratio >= 0.8 && ratio <= 1.2) {
          // Ảnh Vuông (Square) -> Các layout đóng khung mạnh, cổ điển
          pool = [1, 6, 8, 11];
        } else {
          // Ảnh Dọc (Portrait) -> Chọn các layout tách lề trái/phải sang trọng
          pool = [2, 3, 5, 7, 9];
        }

        const randomTemplateNum = pool[Math.floor(Math.random() * pool.length)];
        openOverlay(
          imgSrc,
          `Vũ trụ nhánh #${i + 1}`,
          data[i].message,
          randomTemplateNum,
        );
      };

      // Fallback lỡ như mạng lỗi không đo được ảnh
      tempImg.onerror = () => {
        const randomTemplateNum = Math.floor(Math.random() * 11) + 1;
        openOverlay(
          imgSrc,
          `Vũ trụ nhánh #${i + 1}`,
          data[i].message,
          randomTemplateNum,
        );
      };

      tempImg.src = imgSrc;
    });

    scene.appendChild(card);
  }
}

function setupOverlay() {
  const overlay = document.getElementById("overlay");
  const closeBtn = document.getElementById("close-btn");

  closeBtn.addEventListener("click", () => closeOverlay());

  overlay.addEventListener("click", (e) => {
    if (
      e.target === overlay ||
      e.target.classList.contains("overlay-background")
    ) {
      closeOverlay();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("active")) {
      closeOverlay();
    }
  });
}

// Thêm logic cuộn chuột để zoom tự do trên máy tính
function setupScrollZoom() {
  const container = document.getElementById("universe-container");

  window.addEventListener("wheel", (e) => {
    const overlay = document.getElementById("overlay");
    const tutorialOverlay = document.getElementById("tutorial-overlay");

    // Vô hiệu hóa thao tác cuộn nếu đang coi template, đang bay warp speed hoặc đang hiện tutorial
    if (
      overlay.classList.contains("active") ||
      isWarping ||
      (tutorialOverlay && !tutorialOverlay.classList.contains("hidden"))
    )
      return;

    const zoomSpeed = 0.15;
    if (e.deltaY < 0) {
      currentScale += zoomSpeed; // Cuộn lên -> Bay tới trước
    } else {
      currentScale -= zoomSpeed; // Cuộn xuống -> Lùi lại
    }

    // Khóa giới hạn từ 0.3x (chạy lùi ra xa tít) đến cực đại 4.5x (kế bên mặt trời)
    currentScale = Math.max(0.3, Math.min(currentScale, 4.5));

    container.style.transition = "transform 0.15s ease-out";
    container.style.transform = `scale(${currentScale})`;
  });
}

function startTypingEffect(element, text, speed = 40) {
  element.innerHTML = "";
  element.classList.add("typing-cursor");
  let idx = 0;

  clearInterval(typingInterval);

  typingInterval = setInterval(() => {
    if (idx < text.length) {
      element.innerHTML += text.charAt(idx);
      idx++;
    } else {
      clearInterval(typingInterval);
      element.classList.remove("typing-cursor");
    }
  }, speed);
}

function openOverlay(imgSrc, title, message, templateNum) {
  const scene = document.getElementById("galaxy-scene");
  const container = document.getElementById("universe-container");
  const overlay = document.getElementById("overlay");
  const overlayContent = document.querySelector(".overlay-content");
  const overlayImg = document.getElementById("overlay-image");

  const badge =
    document.querySelector(".universe-badge") || document.createElement("span");
  badge.className = "universe-badge";
  badge.textContent = `Dòng thời gian ${templateNum}`;

  const h1Title =
    document.querySelector("#overlay-title code") ||
    document.createElement("div");
  h1Title.innerHTML = title;

  const overlayTitleWrapper = document.getElementById("overlay-title");
  overlayTitleWrapper.innerHTML = "";
  overlayTitleWrapper.appendChild(badge);
  overlayTitleWrapper.innerHTML += "<br>";
  overlayTitleWrapper.innerHTML += title;

  const overlayMessage = document.getElementById("overlay-message");
  overlayMessage.textContent = "";
  overlayMessage.classList.remove("typing-cursor");
  clearInterval(typingInterval);

  // Kích hoạt Warp speed animation
  isWarping = true;

  // Zoom vũ trụ và CHẬM LẠI thời gian mờ (opacity 1.5s mới mờ dần)
  // để người dùng kịp ngắm cảnh camera lao vào các hành tinh gần mặt trời nhất
  container.style.transition =
    "transform 1.8s cubic-bezier(0.25, 1, 0.5, 1), opacity 1.5s ease-in 0.3s";
  container.style.transform = "scale(4.5)";
  container.style.opacity = "0";
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
      if (overlay.classList.contains("active")) {
        startTypingEffect(overlayMessage, message, 50);
      }
    }, 1200); // Overlay mất 1s để mờ sáng lên
  }, 1800); // 1.8 giây là thời gian animation scale(10) hoàn thành
}

function closeOverlay() {
  const scene = document.getElementById("galaxy-scene");
  const container = document.getElementById("universe-container");
  const overlay = document.getElementById("overlay");
  const overlayMessage = document.getElementById("overlay-message");

  clearInterval(typingInterval);
  overlayMessage.innerHTML = "";

  // 1. Tắt overlay trước
  overlay.classList.remove("active");

  // 2. Chờ overlay hoàn toàn tắt đi thì mới hiện lại dải ngân hà
  setTimeout(() => {
    // Overlay thành dạng ẩn hẳn (display none)
    overlay.classList.add("hidden");

    // Reset scale về trạng thái mặc định 1x
    currentScale = 1;
    container.style.transition =
      "transform 1.5s cubic-bezier(0.25, 1, 0.5, 1), opacity 1s ease-out";
    container.style.transform = `scale(${currentScale})`;
    container.style.opacity = "1";
  }, 800); // Thời gian fade out của overlay
}

// ----------------------------------------------------
// THUẬT TOÁN ĐỘNG HỌC (VUỐT VÀ NÉM VỚI QUÁN TÍNH)
// ----------------------------------------------------
function setupPhysics() {
  const container = document.getElementById("universe-container");
  const scene = document.getElementById("galaxy-scene");

  container.addEventListener("mousedown", dragStart);
  container.addEventListener("touchstart", dragStart, { passive: false });

  document.addEventListener("mousemove", dragMove);
  document.addEventListener("touchmove", dragMove, { passive: false });

  document.addEventListener("mouseup", dragEnd);
  document.addEventListener("touchend", dragEnd);

  function dragStart(e) {
    const tutorialOverlay = document.getElementById("tutorial-overlay");
    if (
      isWarping ||
      document.getElementById("overlay").classList.contains("active") ||
      (tutorialOverlay && !tutorialOverlay.classList.contains("hidden"))
    )
      return;

    // Bắt đầu túm lấy màn hình
    isDragging = true;
    hasDragged = false; // Reset cờ kéo mỗi lần nhấp chuột mới

    const clientX = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
    const clientY = e.type.includes("mouse") ? e.clientY : e.touches[0].clientY;

    startX = clientX;
    startY = clientY;
    lastX = clientX;
    container.style.cursor = "grabbing";
  }

  function dragMove(e) {
    if (!isDragging) return;

    const clientX = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
    const clientY = e.type.includes("mouse") ? e.clientY : e.touches[0].clientY;

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
    container.style.cursor = "default";
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
    const billboards = document.querySelectorAll(".billboard");
    const counterTransform = `rotateY(${-galaxyAngle}deg) rotateZ(${-tiltZ}deg) rotateX(${-tiltX}deg)`;
    for (let i = 0; i < billboards.length; i++) {
      billboards[i].style.transform = counterTransform;
    }

    requestAnimationFrame(renderPhysics);
  }

  renderPhysics();
}

// ============================================
// AUDIO SYSTEM
// ============================================
function initAudio() {
  const bgMusic = document.getElementById("bg-music");
  const musicControl = document.getElementById("music-control");
  let hasUnmuted = false;

  if (!bgMusic || !musicControl) return;

  bgMusic.volume = 0.2; // Set default volume to 30%

  const tryUnmuteAndPlay = () => {
    if (!hasUnmuted) {
      bgMusic.muted = false;
      bgMusic
        .play()
        .then(() => {
          hasUnmuted = true;
          musicControl.classList.add("playing");
          musicControl.classList.remove("muted");

          // Remove interaction listeners once successfully played
          document.removeEventListener("click", tryUnmuteAndPlay, true);
          document.removeEventListener("touchstart", tryUnmuteAndPlay, true);
          document.removeEventListener("keydown", tryUnmuteAndPlay);
        })
        .catch((e) => {
          console.log("Failed to play audio:", e);
        });
    }
  };

  // Chạy autoplay khi click/touch bất kỳ đâu trên màn hình (dùng capture phase để catch tất cả)
  document.addEventListener("click", tryUnmuteAndPlay, true);
  document.addEventListener("touchstart", tryUnmuteAndPlay, {
    capture: true,
    passive: true,
  });
  document.addEventListener("keydown", tryUnmuteAndPlay);

  // 3. Hiển thị Panel chỉnh âm lượng khi bấm vào icon
  const volumePanel = document.getElementById("volume-panel");
  const volumeSlider = document.getElementById("volume-slider");

  musicControl.addEventListener("click", (e) => {
    e.stopPropagation(); // Ngăn sự kiện click làm chuyển scene

    // Bật/tắt hiển thị panel âm lượng
    if (volumePanel) {
      volumePanel.classList.toggle("active");
    }

    // Nếu nhạc đang bị pause nhưng người dùng chạm vào nút nhạc, tự động phát lại
    if (bgMusic.paused && bgMusic.volume > 0) {
      bgMusic.play();
      musicControl.classList.add("playing");
      musicControl.classList.remove("muted");
      hasPlayed = true;
    }
  });

  // 4. Kéo thanh trượt để chỉnh âm thanh
  if (volumeSlider) {
    volumeSlider.addEventListener("input", (e) => {
      e.stopPropagation();
      const newVolume = parseFloat(e.target.value);
      bgMusic.volume = newVolume;

      // Cập nhật giao diện của biểu tượng dựa theo âm lượng
      if (newVolume === 0) {
        musicControl.classList.remove("playing");
        musicControl.classList.add("muted");
      } else {
        musicControl.classList.remove("muted");
        if (!bgMusic.paused) {
          musicControl.classList.add("playing");
        }
      }
    });

    // Chạm/kéo thanh trượt cũng không làm chuyển scene
    volumeSlider.addEventListener("click", (e) => e.stopPropagation());
    volumeSlider.addEventListener("touchstart", (e) => e.stopPropagation());
  }

  // 5. Đóng panel âm lượng khi bấm ra ngoài
  document.addEventListener("click", (e) => {
    if (
      volumePanel &&
      !musicControl.contains(e.target) &&
      !volumePanel.contains(e.target)
    ) {
      volumePanel.classList.remove("active");
    }
  });
}
