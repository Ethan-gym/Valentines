document.body.classList.add("locked");

let score = 0;
let finished = false;
let gameStarted = false;
let heartSpawner = null;

const gameArea = document.querySelector(".game-area");
const basket = document.querySelector(".basket");
const introMusic = document.getElementById("intro-music");

let scrollLocked = false;

function preventScroll(e) {
    if (scrollLocked) {
        e.preventDefault();
    }
}

function lockScroll() {
    scrollLocked = true;
    document.body.classList.add("locked");
    window.addEventListener("touchmove", preventScroll, { passive: false });
    window.addEventListener("wheel", preventScroll, { passive: false });
}

function unlockScroll() {
    scrollLocked = false;
    document.body.classList.remove("locked");
}


/* Scroll to game */
function startIntroMusic() {
    if (!introMusic) return;

    introMusic.volume = 0.6;
    introMusic.play().catch(() => {});
}

function fadeOutMusic(audio, duration = 500) {
    const step = audio.volume / (duration / 50);

    const fade = setInterval(() => {
        if (audio.volume > step) {
            audio.volume -= step;
        } else {
            audio.volume = 0;
            audio.pause();
            clearInterval(fade);
        }
    }, 50);
}

function goToGame() {
    unlockScroll();

    document.getElementById("game")
        .scrollIntoView({ behavior: "smooth" });

    setTimeout(lockScroll, 800); // relock after scroll
    startCountdown();
}


function startCountdown() {
    const countdown = document.getElementById("countdown");
    const messages = ["Are you ready?", "3", "2", "1","GO!"];
    let i = 0;

    countdown.classList.remove("hidden");
    countdown.innerText = messages[i];

    const interval = setInterval(() => {
        i++;

        if (i < messages.length) {
            countdown.innerText = messages[i];
        } else {
            clearInterval(interval);

            /* HARD REMOVE FROM INTERACTION */
            countdown.classList.add("hidden");

            startGame();
        }
    }, 800);
}


function startGame() {
    gameStarted = true;
    heartSpawner = setInterval(spawnHeart, 900);
}


/* Move basket (touch + mouse) */
function moveBasket(x) {
    const rect = gameArea.getBoundingClientRect();
    let pos = x - rect.left;
    pos = Math.max(20, Math.min(rect.width - 20, pos));
    basket.style.left = pos + "px";
}

gameArea.addEventListener("mousemove", e => moveBasket(e.clientX));
gameArea.addEventListener("touchmove", e => {
    moveBasket(e.touches[0].clientX);
});

/* Create falling hearts */
function spawnHeart() {
    if (!gameStarted || finished) return;

    const heart = document.createElement("div");

    /* Decide if real or fake */
    const isReal = Math.random() < 0.7; // 70% real, 30% fake
    heart.className = "heart";
    heart.innerText = isReal ? "💖" : "🤍";

    if (!isReal) heart.classList.add("fake");

    heart.style.left = Math.random() * 85 + "%";
    gameArea.appendChild(heart);

    let fall = 0;
    const fallSpeed = 2.5 + Math.random(); // slight variation

    const fallInterval = setInterval(() => {
        fall += fallSpeed;
        heart.style.top = fall + "px";

        const heartRect = heart.getBoundingClientRect();
        const basketRect = basket.getBoundingClientRect();

        /* Collision check */
        if (
            heartRect.bottom >= basketRect.top &&
            heartRect.left <= basketRect.right &&
            heartRect.right >= basketRect.left
        ) {
            clearInterval(fallInterval);
            heart.remove();

            if (isReal) {
                collectHeart();
            } else {
                fakeHeartFeedback();
            }
        }

        if (fall > 300) {
            clearInterval(fallInterval);
            heart.remove();
        }
    }, 16);
}

/* Collect heart */
function collectHeart() {
    basket.classList.add("catch");
    setTimeout(() => basket.classList.remove("catch"), 200);

    score++;
    document.getElementById("score").innerText = score;

    if (score >= 10 && !finished) {
        finished = true;
        clearInterval(heartSpawner);

        showWinCelebration();
    }


}

function checkCode() {
    const input = document.getElementById("codeInput").value.trim();
    const error = document.getElementById("codeError");
    const continueBtn = document.getElementById("codeContinueBtn");
    const ending = document.getElementById("ending");

    const correctCode = "19-11-2025";

    if (input === correctCode) {
        error.innerText = "";
        unlockScroll();

        /* Unlock the ending */
        ending.style.display = "flex";

        setTimeout(() => {
            continueBtn.hidden = false;
        }, 2000);

        /* Fade out intro music AFTER 2 seconds */
        setTimeout(() => {
            fadeOutMusic(introMusic, 2000);
        }, 2000);

        /* Visual success feedback */
        document.getElementById("codeInput").style.borderColor = "#4caf50";
    } else {
        error.innerText = "Hmm… that doesn’t look right 💭";
    }
}


/* Trigger ending animations */
function startEnding() {
    const fade = document.querySelector(".fade-overlay");
    const walk = document.querySelector(".walk");
    const credits = document.querySelector(".credits");
    const music = document.getElementById("bg-music");
    if (introMusic && !introMusic.paused) {
    introMusic.pause();
    introMusic.volume = 0;
    }
    /* Start walking */
    walk.classList.add("animate");

    /* Fade to black */
    setTimeout(() => {
        fade.classList.add("show");
    }, 4000);

    /* Fade back in */
    setTimeout(() => {
        fade.classList.remove("show");
    }, 6000);

    /* Start credits */
    setTimeout(() => {
        credits.classList.add("animate");
    }, 6500);

    /* MUSIC: start AFTER 5000ms (no fade-in) */
    setTimeout(() => {
        music.volume = 1.0;
        music.play().catch(() => {}); // iOS-safe
    }, 6000);

    /* Fade music out after 1 minute */
    setTimeout(() => {
        fadeOutMusic(music, 4000);
    }, 64000);

    setTimeout(() => {
        const replayBtn = document.getElementById("replayBtn");
        replayBtn.hidden = false;
        unlockScroll(); // optional: let them scroll freely now
    }, 68000); // appears after fade completes

}

function replayExperience() {
    location.reload();
}

function fakeHeartFeedback() {
    basket.classList.add("shake");
    setTimeout(() => basket.classList.remove("shake"), 250);
}

function goToCodeGame() {
    unlockScroll();

    document.getElementById("code-game")
        .scrollIntoView({ behavior: "smooth" });

    setTimeout(lockScroll, 800);
}


function goToEnding() {
    unlockScroll();

    document.getElementById("ending")
        .scrollIntoView({ behavior: "smooth" });

    setTimeout(lockScroll, 800);
    setTimeout(startEnding, 600);
}


function showWinCelebration() {
    const overlay = document.getElementById("winOverlay");
    const continueBtn = document.getElementById("continueBtn");

    overlay.classList.remove("hidden");

    // burst confetti
    for (let i = 0; i < 25; i++) {
        setTimeout(createConfetti, i * 80);
    }

    setTimeout(() => {
        unlockScroll();
        overlay.classList.add("hidden");
        continueBtn.hidden = false;
    }, 3000);
}



function createConfetti() {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.innerText = ["💖", "💕", "🎉", "✨"][Math.floor(Math.random() * 4)];

    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.animationDuration = 2 + Math.random() * 1.5 + "s";

    document.body.appendChild(confetti);

    setTimeout(() => confetti.remove(), 3000);
}
