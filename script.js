// Prize & Blessing Configurations
// type: "prize" = phần thưởng thật (có ảnh), "blessing" = câu chúc (có emoji)
const PRIZES = [
    {
        id: "di-mao",
        name: "Dimao Vitamin D3",
        type: "prize",
        emoji: "💊",
        bgHex: "#F9A8D4",
        textHex: "#831843",
    },
    {
        id: "chuc_1",
        name: "Mẹ Tròn Con Vuông",
        type: "blessing",
        emoji: "🌸",
        desc: "Chúc mẹ có một hành trình vượt cạn an lành, suôn sẻ và nhẹ nhàng đón thiên thần nhỏ chào đời trong tiếng cười ấm áp.",
        bgHex: "#FDE68A",
        textHex: "#78350F",
    },
    {
        id: "fe-max",
        name: "Fe-max Iron Spray",
        type: "prize",
        emoji: "🩸",
        bgHex: "#FCA5A5",
        textHex: "#7F1D1D",
    },
    {
        id: "chuc_2",
        name: "Bé Khỏe Mẹ Vui",
        type: "blessing",
        emoji: "👶",
        desc: "Chúc em bé ngoan ngoãn phát triển khỏe mạnh mỗi ngày, luôn là niềm tự hào và nguồn năng lượng tích cực nhất của mẹ.",
        bgHex: "#86EFAC",
        textHex: "#14532D",
    },
    {
        id: "zihot",
        name: "Zihot Oral Spray",
        type: "prize",
        emoji: "✨",
        bgHex: "#C4B5FD",
        textHex: "#3B0764",
    },
    {
        id: "chuc_3",
        name: "Hạnh Phúc Đong Đầy",
        type: "blessing",
        emoji: "💕",
        desc: "Gửi tặng mẹ bầu những cái ôm ấm áp nhất. Chúc tổ ấm nhỏ luôn tràn ngập tình yêu thương và tiếng cười hạnh phúc chuẩn bị chào đón con.",
        bgHex: "#FDBA74",
        textHex: "#7C2D12",
    },
    {
        id: "chuc_4",
        name: "Thai Kỳ Bình An",
        type: "blessing",
        emoji: "🤰",
        desc: "Chúc mẹ một thai kỳ thật bình an, nhẹ nhàng và ngập tràn hạnh phúc. Mỗi ngày trôi qua đều là một trải nghiệm tuyệt vời đón chờ con yêu.",
        bgHex: "#93C5FD",
        textHex: "#1E3A5F",
    },
    {
        id: "chuc_5",
        name: "Vạn Sự Như Ý",
        type: "blessing",
        emoji: "🍀",
        desc: "Chúc mọi điều may mắn, suôn sẻ nhất sẽ đến với hai mẹ con. Chúc mẹ có một hành trình làm mẹ ngập tràn niềm vui và trọn vẹn hạnh phúc.",
        bgHex: "#F0ABFC",
        textHex: "#581C87",
    },
];

// Winning Configuration
// Set to a specific prize name (e.g. "Dimao Vitamin D3") to force that win,
// or set to "RANDOM" to use 20% win probability (50 physical prizes / 250 guests)
const CONFIGURABLE_WINNING_PRIZE = "RANDOM";
const GOOGLE_SHEETS_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbw--4PL43lqkKKzxyfc1Venw6IDqRzEVLG9VMBNmrm84uEH3MZ8xpxd1gaWjOqQMXiNAg/exec";
const LOCAL_STORAGE_KEY = "lucky_spin_participation";

// State Management
let registeredUser = {
    fullName: "Khách hàng",
    phoneNumber: "0909181752",
    gender: "Male"
};
let isSpinning = false;
let imagesLoaded = {};
let currentRotation = 0;
let previousSpinRecorded = null;

// DOM Selectors
const screenLanding = document.getElementById("screen-landing");
const screenSpin = document.getElementById("screen-spin");
const screenAlreadySpun = document.getElementById("screen-already-spun");

const btnGoToSpin = document.getElementById("btn-go-to-spin");
const btnSpin = document.getElementById("btn-spin");
const btnHub = document.getElementById("btn-hub");
const btnResetDemo = document.getElementById("btn-reset-demo");
const btnModalClose = document.getElementById("btn-modal-close");
const btnBackHome = document.getElementById("btn-back-home");

const resultModal = document.getElementById("result-modal");
const loadingOverlay = document.getElementById("loading-overlay");
const loadingMessage = document.getElementById("loading-message");

const wheelTarget = document.getElementById("wheel-rotation-target");
const wheelPointer = document.querySelector(".wheel-pointer");
const userNameDisplay = document.getElementById("user-name-display");
const userPhoneDisplay = document.getElementById("user-phone-display");

const alreadyPrizeName = document.getElementById("already-prize-name");
const alreadyPrizeImg = document.getElementById("already-prize-img");
const alreadyPrizeDesc = document.getElementById("already-prize-desc");
const alreadyPrizeBadgeLabel = document.getElementById("already-prize-badge-label");
const detailsName = document.getElementById("details-name");
const detailsPhone = document.getElementById("details-phone");

const modalPrizeName = document.getElementById("modal-prize-name");
const modalPrizeImg = document.getElementById("modal-prize-img");
const modalPrizeDesc = document.getElementById("modal-prize-desc");
const modalPrizeBadgeLabel = document.getElementById("modal-prize-badge-label");

// Init application
document.addEventListener("DOMContentLoaded", () => {
    // 1. Parse user details from URL
    parseUrlParams();

    // 2. Preload prize images for canvas rendering (only items with actual product images)
    preloadPrizeImages(() => {
        drawWheelCanvas();
    });

    // 3. Check for previous participation
    checkParticipation();

    // 4. Hook up event listeners
    btnGoToSpin.addEventListener("click", () => {
        showScreen("spin");
    });

    btnSpin.addEventListener("click", triggerSpin);
    btnHub.addEventListener("click", triggerSpin);
    btnModalClose.addEventListener("click", handleModalClose);
    btnBackHome.addEventListener("click", () => {
        showScreen("landing");
    });
    btnResetDemo.addEventListener("click", handleResetDemo);
});

// Switch active screen helper
function showScreen(screenId) {
    screenLanding.classList.remove("active");
    screenSpin.classList.remove("active");
    screenAlreadySpun.classList.remove("active");

    if (screenId === "landing") screenLanding.classList.add("active");
    else if (screenId === "spin") screenSpin.classList.add("active");
    else if (screenId === "alreadySpun") screenAlreadySpun.classList.add("active");
}

// Parse URL Search Parameters (matching Next.js page.tsx)
function parseUrlParams() {
    const params = new URLSearchParams(window.location.search);

    registeredUser.fullName = params.get("fullName") || params.get("name") || "Khách hàng";
    registeredUser.phoneNumber = params.get("phoneNumber") || params.get("phone") || "0909181752";

    const genderParam = params.get("gender") || "Male";
    if (genderParam.toLowerCase() === "female" || genderParam === "Nữ" || genderParam === "nữ") {
        registeredUser.gender = "Female";
    }

    // Update labels in real-time
    userNameDisplay.textContent = registeredUser.fullName;
    userPhoneDisplay.textContent = registeredUser.phoneNumber;
}

// Preload Images Helper – only load images for "prize" type items
function preloadPrizeImages(onAllLoaded) {
    const prizeItems = PRIZES.filter(p => p.type === "prize");
    let loadedCount = 0;

    if (prizeItems.length === 0) {
        onAllLoaded();
        return;
    }

    prizeItems.forEach((prize) => {
        const img = new Image();
        img.src = `public/images/${prize.id}.png`;
        img.onload = () => {
            imagesLoaded[prize.id] = img;
            loadedCount++;
            if (loadedCount === prizeItems.length) onAllLoaded();
        };
        img.onerror = () => {
            console.warn(`Failed to load image for prize: ${prize.id}`);
            loadedCount++;
            if (loadedCount === prizeItems.length) onAllLoaded();
        };
    });
}

// Draw Canvas Wheel
function drawWheelCanvas() {
    const canvas = document.getElementById("wheel-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 20;
    const sliceAngle = (2 * Math.PI) / PRIZES.length;

    ctx.clearRect(0, 0, size, size);

    // Draw each prize/blessing slice
    PRIZES.forEach((prize, i) => {
        const angleStart = i * sliceAngle - Math.PI / 2;
        const angleEnd = angleStart + sliceAngle;

        // 1. Slice Background Color
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, radius, angleStart, angleEnd);
        ctx.closePath();
        ctx.fillStyle = prize.bgHex;
        ctx.fill();

        // 2. Glossy Radial overlay
        const grad = ctx.createRadialGradient(center, center, 40, center, center, radius);
        grad.addColorStop(0, "rgba(255, 255, 255, 0.22)");
        grad.addColorStop(0.7, "rgba(255, 255, 255, 0.05)");
        grad.addColorStop(1, "rgba(0, 0, 0, 0.1)");
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, radius, angleStart, angleEnd);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        // 3. Segment Divider borders
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.lineTo(center + Math.cos(angleStart) * radius, center + Math.sin(angleStart) * radius);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
        ctx.lineWidth = 3;
        ctx.stroke();

        // 4. Draw image (for prizes) or emoji (for blessings)
        const img = imagesLoaded[prize.id];
        if (prize.type === "prize" && img) {
            // Draw prize product image
            ctx.save();
            ctx.translate(center, center);
            ctx.rotate(angleStart + sliceAngle / 2);

            const imgSize = 75;
            ctx.drawImage(img, radius - 105, -imgSize / 2, imgSize, imgSize);
            ctx.restore();
        } else {
            // Draw emoji for blessings
            ctx.save();
            ctx.translate(center, center);
            ctx.rotate(angleStart + sliceAngle / 2);
            ctx.font = "52px serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(prize.emoji, radius - 68, 0);
            ctx.restore();
        }

        // 5. Draw text labels
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(angleStart + sliceAngle / 2);
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillStyle = prize.textHex;

        if (prize.name.length > 15) {
            ctx.font = "900 28px system-ui, sans-serif";
        } else {
            ctx.font = "900 34px system-ui, sans-serif";
        }

        ctx.shadowColor = "rgba(255, 255, 255, 0.6)";
        ctx.shadowBlur = 6;
        ctx.fillText(prize.name, radius - 130, 0);
        ctx.restore();
    });

    // 6. Draw Outer rose-gold border
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    const borderGrad = ctx.createLinearGradient(0, 0, size, size);
    borderGrad.addColorStop(0, "#F9A8D4");
    borderGrad.addColorStop(0.5, "#FDE68A");
    borderGrad.addColorStop(1, "#C4B5FD");
    ctx.strokeStyle = borderGrad;
    ctx.lineWidth = 14;
    ctx.stroke();

    // 7. Outer light bulbs / dots decoration
    const dotCount = 24;
    for (let i = 0; i < dotCount; i++) {
        const angle = (i * 2 * Math.PI) / dotCount;
        const x = center + Math.cos(angle) * (radius - 3);
        const y = center + Math.sin(angle) * (radius - 3);

        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);

        if (i % 3 === 0) {
            ctx.fillStyle = "#FDE68A";
        } else if (i % 3 === 1) {
            ctx.fillStyle = "#F9A8D4";
        } else {
            ctx.fillStyle = "#C4B5FD";
        }
        ctx.fill();
    }

    // 8. Draw center hub backing circle
    ctx.beginPath();
    ctx.arc(center, center, 65, 0, 2 * Math.PI);
    const hubGrad = ctx.createRadialGradient(center - 10, center - 10, 5, center, center, 65);
    hubGrad.addColorStop(0, "#FDF2F8");
    hubGrad.addColorStop(1, "#FBCFE8");
    ctx.fillStyle = hubGrad;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(center, center, 65, 0, 2 * Math.PI);
    ctx.strokeStyle = "#F9A8D4";
    ctx.lineWidth = 6;
    ctx.stroke();
}

// Play Web Audio click tick sound effects
function playTickSound(duration) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    try {
        const audioCtx = new AudioContextClass();
        const totalTicks = 35;

        for (let i = 0; i < totalTicks; i++) {
            const progress = i / totalTicks;
            const delay = duration * Math.pow(progress, 2.5);

            setTimeout(() => {
                try {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();

                    osc.type = "sine";
                    osc.frequency.setValueAtTime(500 - progress * 200, audioCtx.currentTime);
                    gain.gain.setValueAtTime(0.07 * (1 - progress), audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);

                    osc.connect(gain);
                    gain.connect(audioCtx.destination);

                    osc.start();
                    osc.stop(audioCtx.currentTime + 0.05);
                } catch (e) {
                    // Ignore sound generation errors on target browser
                }
            }, delay * 1000);
        }
    } catch (e) {
        // AudioContext browser compatibility blocker
    }
}

// Local Storage state validation
function checkParticipation() {
    try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.hasSpun) {
                previousSpinRecorded = parsed;
                renderAlreadySpunScreen(parsed);
                showScreen("alreadySpun");
            }
        }
    } catch (e) {
        console.error("Failed to read from localStorage", e);
    }
}

// Render the completed spin screen
function renderAlreadySpunScreen(data) {
    const prizeData = getPrizeDataByName(data.prize);
    alreadyPrizeName.textContent = data.prize;

    if (prizeData && prizeData.type === "prize") {
        alreadyPrizeImg.src = `public/images/${prizeData.id}.png`;
        alreadyPrizeImg.style.display = "block";
        alreadyPrizeDesc.style.display = "none";
        alreadyPrizeBadgeLabel.textContent = "🎁 Phần thưởng của bạn";
        // Remove old emoji if exists
        const oldEmoji = alreadyPrizeImg.parentElement.querySelector(".blessing-emoji-display");
        if (oldEmoji) oldEmoji.remove();
    } else {
        // For blessings, show the emoji instead of an image
        alreadyPrizeImg.style.display = "none";
        alreadyPrizeBadgeLabel.textContent = "🌸 Lời chúc của bạn";
        
        if (prizeData && prizeData.desc) {
            alreadyPrizeDesc.textContent = `"${prizeData.desc}"`;
            alreadyPrizeDesc.style.display = "block";
        } else {
            alreadyPrizeDesc.style.display = "none";
        }

        const frame = alreadyPrizeImg.parentElement;
        const oldEmoji = frame.querySelector(".blessing-emoji-display");
        if (oldEmoji) oldEmoji.remove();
        const emojiDiv = document.createElement("div");
        emojiDiv.className = "blessing-emoji-display";
        emojiDiv.style.cssText = "font-size: 64px; line-height: 1;";
        emojiDiv.textContent = prizeData ? prizeData.emoji : "🌸";
        frame.appendChild(emojiDiv);
    }

    detailsName.textContent = `👤 ${data.fullName}`;
    detailsPhone.textContent = `📱 ${data.phoneNumber}`;
}

// Get prize data by name helper
function getPrizeDataByName(prizeName) {
    return PRIZES.find(p => p.name.toLowerCase() === prizeName.toLowerCase()) || null;
}

// Get ID by name helper
function getPrizeIdByName(prizeName) {
    const found = PRIZES.find(p => p.name.toLowerCase() === prizeName.toLowerCase());
    return found ? found.id : "di-mao";
}

// Trigger Spin Logic (Physics calculations & animation)
function triggerSpin() {
    if (isSpinning) return;

    // Disable inputs to avoid double click bugs
    isSpinning = true;
    btnSpin.disabled = true;
    btnHub.disabled = true;

    // Determine target prize name (support RANDOM or forced override)
    let finalWinningPrizeName = CONFIGURABLE_WINNING_PRIZE;
    if (CONFIGURABLE_WINNING_PRIZE.toUpperCase() === "RANDOM") {
        // 50 physical prizes for 250 participants = 20% win probability
        // 80% probability of getting a beautiful blessing
        const winChance = Math.random() * 100;
        if (winChance < 20) {
            // Win a physical product (20% chance) - shared equally among 3 products
            const physicalProducts = PRIZES.filter(p => p.type === "prize");
            const chosenProduct = physicalProducts[Math.floor(Math.random() * physicalProducts.length)];
            finalWinningPrizeName = chosenProduct.name;
        } else {
            // Get a blessing (80% chance) - shared equally among 5 blessings
            const blessings = PRIZES.filter(p => p.type === "blessing");
            const chosenBlessing = blessings[Math.floor(Math.random() * blessings.length)];
            finalWinningPrizeName = chosenBlessing.name;
        }
    }

    // Find target index for the configured prize
    const targetPrizeIndex = PRIZES.findIndex(
        (p) => p.name.toLowerCase() === finalWinningPrizeName.toLowerCase()
    );
    const prizeIndex = targetPrizeIndex !== -1 ? targetPrizeIndex : 0;

    // Calculate spinning parameters
    const spinDuration = 6 + Math.random() * 2; // 6 to 8 seconds duration
    const extraRotations = 8 + Math.floor(Math.random() * 3); // 8 to 10 extra turns
    const randomOffset = Math.random() * 28 - 14; // offset from slice separator lines
    const segmentAngle = 360 / PRIZES.length;

    // Calculate ending angle
    const targetAngle = extraRotations * 360 - prizeIndex * segmentAngle - segmentAngle / 2 + randomOffset;
    currentRotation = targetAngle;

    // Apply styling transition
    wheelTarget.style.transition = `transform ${spinDuration}s cubic-bezier(0.2, 0.8, 0.1, 1)`;
    wheelTarget.style.transform = `rotate(${targetAngle}deg)`;
    wheelPointer.classList.add("wiggle");

    // Haptic vibrations (if supported)
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
    }

    // Sound FX tick ticking
    playTickSound(spinDuration);

    // Await spin completion
    setTimeout(() => {
        isSpinning = false;
        wheelPointer.classList.remove("wiggle");

        if (navigator.vibrate) {
            navigator.vibrate(200);
        }

        onSpinComplete(PRIZES[prizeIndex].name);
    }, spinDuration * 1000);
}

// Handle completed spin logic
async function onSpinComplete(prizeName) {
    showLoading("Đang lưu kết quả...");

    // 1. Submit Google sheet result
    let success = false;
    try {
        const response = await submitSpinResult(registeredUser, prizeName);
        success = response.success;
    } catch (e) {
        console.error("Submission failed", e);
    }

    // 2. Persist to Local Storage
    const data = {
        hasSpun: true,
        prize: prizeName,
        fullName: registeredUser.fullName,
        phoneNumber: registeredUser.phoneNumber,
        gender: registeredUser.gender
    };

    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        previousSpinRecorded = data;
        renderAlreadySpunScreen(data);
    } catch (e) {
        console.error("Failed to save to localStorage", e);
    }

    hideLoading();

    // 3. Show Winner Modal & confetti
    showModal(prizeName);
}

// Modal management
function showModal(prizeName) {
    const prizeData = getPrizeDataByName(prizeName);
    modalPrizeName.textContent = prizeName;

    if (prizeData && prizeData.type === "prize") {
        modalPrizeImg.src = `public/images/${prizeData.id}.png`;
        modalPrizeImg.style.display = "block";
        modalPrizeDesc.style.display = "none";
        modalPrizeBadgeLabel.textContent = "🎁 Phần thưởng của bạn";
        const oldEmoji = modalPrizeImg.parentElement.querySelector(".blessing-emoji-display");
        if (oldEmoji) oldEmoji.remove();
    } else {
        // For blessings, show the emoji
        modalPrizeImg.style.display = "none";
        modalPrizeBadgeLabel.textContent = "🌸 Lời chúc của bạn";
        
        if (prizeData && prizeData.desc) {
            modalPrizeDesc.textContent = `"${prizeData.desc}"`;
            modalPrizeDesc.style.display = "block";
        } else {
            modalPrizeDesc.style.display = "none";
        }

        const frame = modalPrizeImg.parentElement;
        const oldEmoji = frame.querySelector(".blessing-emoji-display");
        if (oldEmoji) oldEmoji.remove();
        const emojiDiv = document.createElement("div");
        emojiDiv.className = "blessing-emoji-display";
        emojiDiv.style.cssText = "font-size: 80px; line-height: 1;";
        emojiDiv.textContent = prizeData ? prizeData.emoji : "🌸";
        frame.appendChild(emojiDiv);
    }

    resultModal.classList.add("active");

    // Update modal text based on type
    const modalTitle = document.querySelector(".modal-congrats-title");
    const modalSubtitle = document.querySelector(".modal-congrats-subtitle");
    const modalTrophy = document.querySelector(".modal-trophy");

    if (prizeData && prizeData.type === "blessing") {
        modalTrophy.textContent = prizeData.emoji;
        modalTitle.textContent = "Lời chúc dành cho bạn!";
        modalSubtitle.textContent = "Mẹ & Bé gửi đến bạn lời chúc tốt đẹp nhất 💕";
    } else {
        modalTrophy.textContent = "🏆";
        modalTitle.textContent = "Chúc mừng!";
        modalSubtitle.textContent = "Bạn đã nhận được phần thưởng đặc biệt từ Mẹ & Bé 💕";
    }

    // Confetti shower
    triggerConfettiExplosion();
}

function handleModalClose() {
    resultModal.classList.remove("active");
    showScreen("alreadySpun");
}

// Confetti blast particles
function triggerConfettiExplosion() {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const colors = ["#F9A8D4", "#FDE68A", "#C4B5FD", "#86EFAC", "#FCA5A5", "#93C5FD"];

    const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);

        const particleCount = 50 * (timeLeft / duration);

        // Left side explosion
        confetti({
            particleCount,
            spread: 360,
            ticks: 60,
            startVelocity: 30,
            colors,
            origin: { x: Math.random() * 0.4 + 0.1, y: Math.random() - 0.2 },
            zIndex: 120,
        });

        // Right side explosion
        confetti({
            particleCount,
            spread: 360,
            ticks: 60,
            startVelocity: 30,
            colors,
            origin: { x: Math.random() * 0.4 + 0.5, y: Math.random() - 0.2 },
            zIndex: 120,
        });
    }, 250);
}

// Google Sheets API submission
async function submitSpinResult(formData, prizeName) {
    try {
        const timestamp = new Date().toISOString();

        if (!GOOGLE_SHEETS_WEBAPP_URL) {
            console.warn("GOOGLE_SHEETS_WEBAPP_URL not configured. Simulating success.");
            await new Promise((resolve) => setTimeout(resolve, 800));
            return { success: true };
        }

        const prizeData = getPrizeDataByName(prizeName);
        const resultType = prizeData && prizeData.type === "prize" ? "Phần thưởng" : "Lời chúc";

        const jsonPayload = {
            "Thời gian": timestamp,
            "Phone": formData.phoneNumber,
            "Tên phần thưởng": prizeName,
            "Loại": resultType,
        };

        // POST to sheets endpoint using no-cors mode
        await fetch(GOOGLE_SHEETS_WEBAPP_URL, {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(jsonPayload),
        });

        return { success: true };
    } catch (e) {
        console.error("Failed to submit result to sheet URL", e);
        return { success: false, error: e.message };
    }
}

// Loading overlay helpers
function showLoading(message) {
    loadingMessage.textContent = message;
    loadingOverlay.classList.add("active");
}

function hideLoading() {
    loadingOverlay.classList.remove("active");
}

// Reset LocalStorage demo helper
function handleResetDemo() {
    if (confirm("Reset trạng thái lượt chơi để quay thử lại?")) {
        try {
            localStorage.removeItem(LOCAL_STORAGE_KEY);

            // Reset wheel positions
            wheelTarget.style.transition = "none";
            wheelTarget.style.transform = "rotate(0deg)";
            currentRotation = 0;

            // Reset buttons
            btnSpin.disabled = false;
            btnHub.disabled = false;

            // Go back to landing page
            showScreen("landing");
            window.location.reload();
        } catch (e) {
            console.error("Reset failed", e);
        }
    }
}
