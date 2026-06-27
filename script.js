const canvas = document.getElementById('takeoffCanvas');
const ctx = canvas.getContext('2d');

let animationFrameId;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let stars = [];
let jetParticles = [];
let syncing = false;

let airplane = {
    x: 0,
    y: 0,
    scale: 0.1,
    speedY: 4,
    targetY: 0,
    state: 'runway'
};

function initStars() {

    stars = [];

    for (let i = 0; i < 120; i++) {

        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2,
            speed: Math.random() * 0.8 + 0.2
        });

    }

}

function drawAirplane(ctx, x, y, scale) {

    ctx.save();

    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.shadowBlur = 25;
    ctx.shadowColor = "#ff0055";

    ctx.fillStyle = '#ff0055';

    ctx.fillRect(-12, 70, 8, 12);
    ctx.fillRect(4, 70, 8, 12);

    ctx.shadowBlur = 15;
    ctx.shadowColor = "#00f3ff";

    ctx.strokeStyle = '#00f3ff';
    ctx.lineWidth = 3;

    ctx.fillStyle = '#050510';

    ctx.beginPath();

    ctx.moveTo(0, -90);
    ctx.lineTo(12, -20);
    ctx.lineTo(85, 35);
    ctx.lineTo(15, 40);
    ctx.lineTo(12, 70);
    ctx.lineTo(0, 60);
    ctx.lineTo(-12, 70);
    ctx.lineTo(-15, 40);
    ctx.lineTo(-85, 35);
    ctx.lineTo(-12, -20);

    ctx.closePath();

    ctx.fill();
    ctx.stroke();

    ctx.restore();
}

function animateScene() {

    ctx.fillStyle = 'rgba(5, 5, 10, 0.3)';
    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.fillStyle = '#ffffff';

    stars.forEach(star => {

        ctx.beginPath();

        ctx.arc(
            star.x,
            star.y,
            star.radius,
            0,
            Math.PI * 2
        );

        ctx.fill();

        star.y +=
            star.speed *
            (
                airplane.state === 'supersonic'
                ? 30
                : 1.5
            );

        if (star.y > canvas.height) {
            star.y = 0;
        }

    });

    if (airplane.y < canvas.height + 100) {

        for (let i = 0; i < 3; i++) {

            jetParticles.push({

                x:
                    airplane.x +
                    (
                        Math.random() * 16 - 8
                    ),

                y:
                    airplane.y +
                    (
                        60 *
                        airplane.scale
                    ),

                vx:
                    Math.random() * 2 - 1,

                vy:
                    Math.random() * 4 + 5,

                alpha: 1,

                color:
                    Math.random() > 0.4
                    ? '#ff0055'
                    : '#00f3ff'

            });

        }

    }
    jetParticles.forEach((p, idx) => {

    p.x += p.vx;

    p.y +=
        p.vy *
        (
            airplane.state === 'supersonic'
            ? 2
            : 1
        );

    p.alpha -= 0.025;

    if (p.alpha <= 0) {

        jetParticles.splice(idx, 1);

    } else {

        ctx.save();

        ctx.globalAlpha = p.alpha;

        ctx.fillStyle = p.color;

        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            Math.random() * 3 * airplane.scale + 1,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();
    }

});

if (airplane.state === 'runway') {

    airplane.y -= airplane.speedY;

    airplane.scale += 0.0025;

    if (
        airplane.y <=
        canvas.height * 0.7
    ) {

        airplane.state = 'liftoff';

    }

}
else if (
    airplane.state === 'liftoff'
) {

    airplane.y -=
        (
            airplane.y -
            airplane.targetY
        ) * 0.04 + 1.5;

    airplane.scale += 0.003;

    if (
        airplane.y <=
        airplane.targetY + 10
    ) {

        airplane.state = 'supersonic';

    }

}
else if (
    airplane.state === 'supersonic'
) {

    airplane.y -= airplane.speedY;

    airplane.speedY *= 1.14;

    airplane.scale -= 0.006;

}

if (airplane.y > -200) {

    drawAirplane(
        ctx,
        airplane.x,
        airplane.y,
        airplane.scale
    );

    animationFrameId =
        requestAnimationFrame(
            animateScene
        );

}
else {

    cancelAnimationFrame(
        animationFrameId
    );

    alert(
        "Core Interface Authorized. Welcome Pilot."
    );

    window.location.href =
        "home.html";

}

}

function handleLogin(event) {

    if (event) {

        event.preventDefault();
        event.stopPropagation();

    }

    const portal =
        document.getElementById(
            'loginPortal'
        );

    portal.classList.add(
        'hide-portal'
    );

    portal.style.display = 'none';

    canvas.style.display = 'block';

    resizeCanvas();

    initStars();

    airplane.x =
        canvas.width / 2;

    airplane.y =
        canvas.height + 100;

    airplane.scale = 0.15;

    airplane.speedY = 4;

    airplane.targetY =
        canvas.height * 0.4;

    airplane.state = 'runway';

    jetParticles = [];

    animateScene();

}

async function loginOffline(username) {

    const db =
        await openDB();

    const tx =
        db.transaction(
            "users",
            "readonly"
        );

    const store =
        tx.objectStore(
            "users"
        );

    return new Promise(resolve => {

        const request =
            store.get(username);

        request.onsuccess = () => {

            resolve(
                request.result
            );

        };

        request.onerror = () =>
            resolve(null);

    });

}

async function saveUserLocally(username) {

    const db =
        await openDB();

    const tx =
        db.transaction(
            "users",
            "readwrite"
        );

    const store =
        tx.objectStore(
            "users"
        );

    store.put({

        username: username,

        lastLogin:
            new Date()
            .toISOString()

    });

}
const DB_NAME = "PilotPortal";
const DB_VERSION = 2;

function openDB() {

    return new Promise((resolve, reject) => {

        const request =
            indexedDB.open(
                DB_NAME,
                DB_VERSION
            );

        request.onupgradeneeded = (event) => {

            const db =
                event.target.result;

            if (
                !db.objectStoreNames.contains(
                    "users"
                )
            ) {

                db.createObjectStore(
                    "users",
                    {
                        keyPath: "username"
                    }
                );

            }

            if (
                !db.objectStoreNames.contains(
                    "pendingUsers"
                )
            ) {

                db.createObjectStore(
                    "pendingUsers",
                    {
                        keyPath: "username"
                    }
                );

            }

        };

        request.onsuccess = () =>
            resolve(
                request.result
            );

        request.onerror = () =>
            reject(
                request.error
            );

    });

}

async function savePendingUser(
    username,
    password
) {

    const db =
        await openDB();

    const tx =
        db.transaction(
            "pendingUsers",
            "readwrite"
        );

    const store =
        tx.objectStore(
            "pendingUsers"
        );

    store.put({

        username,
        password,

        createdAt:
            Date.now()

    });

}

async function syncPendingUsers() {

    if (syncing) {
        return;
    }

    syncing = true;

    try {

        const db =
            await openDB();

        const tx =
            db.transaction(
                "pendingUsers",
                "readonly"
            );

        const store =
            tx.objectStore(
                "pendingUsers"
            );

        const request =
            store.getAll();

        request.onsuccess =
        async () => {

            const users =
                request.result;

            for (
                const user of users
            ) {

                try {

                    const response =
                        await fetch(
                            "https://beds-heat-make-pixel.trycloudflare.com/register",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                    "application/json"
                                },

                                body: JSON.stringify({
                                    username:
                                        user.username,

                                    password:
                                        user.password
                                })
                            }
                        );

                    if (!response.ok) {

                        throw new Error(
                            "Server Error"
                        );

                    }

                    const result =
                        await response.json();

                    if (
                        result.success ||
                        result.message ===
                        "User already exists"
                    ) {

                        const deleteTx =
                            db.transaction(
                                "pendingUsers",
                                "readwrite"
                            );

                        deleteTx
                        .objectStore(
                            "pendingUsers"
                        )
                        .delete(
                            user.username
                        );

                        console.log(
                            "Synced:",
                            user.username
                        );

                    }

                } catch (err) {

                    console.log(
                        "Still offline"
                    );

                }

            }

            syncing = false;

        };

        request.onerror = () => {

            syncing = false;

        };

    } catch (err) {

        syncing = false;

    }

}
async function loginUser(event) {

    event.preventDefault();

    const username =
        document.getElementById(
            "username"
        ).value;

    const password =
        document.getElementById(
            "password"
        ).value;

    try {

        const response =
            await fetch(
                "https://beds-heat-make-pixel.trycloudflare.com/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                        "application/json"
                    },

                    body: JSON.stringify({
                        username,
                        password
                    })
                }
            );

        if (!response.ok) {

            throw new Error(
                "Server Error"
            );

        }

        const result =
            await response.json();

        if (result.success) {

            await saveUserLocally(
                username
            );

            localStorage.setItem(
                "loggedIn",
                "true"
            );

            localStorage.setItem(
                "username",
                username
            );

            handleLogin();

        } else {

            alert(
                result.message
            );

        }

    } catch (error) {

        const localUser =
            await loginOffline(
                username
            );

        if (localUser) {

            localStorage.setItem(
                "loggedIn",
                "true"
            );

            localStorage.setItem(
                "username",
                username
            );

            alert(
                "Offline Mode Activated"
            );

            handleLogin();

        } else {

            alert(
                "Server Offline and user not cached"
            );

        }

    }

}

async function registerUser() {

    const username =
        document.getElementById(
            "username"
        ).value.trim();

    const password =
        document.getElementById(
            "password"
        ).value;

    if (!username || !password) {

        alert(
            "Please enter username and password"
        );

        return;

    }

    try {

        const response =
            await fetch(
                "https://beds-heat-make-pixel.trycloudflare.com/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                        "application/json"
                    },

                    body: JSON.stringify({
                        username,
                        password
                    })
                }
            );

        if (!response.ok) {

            throw new Error(
                "Server Error"
            );

        }

        const result =
            await response.json();

        if (result.success) {

            await saveUserLocally(
                username
            );

            alert(
                "Account created successfully!"
            );

        } else {

            alert(
                result.message
            );

        }

    } catch (error) {

        await savePendingUser(
            username,
            password
        );

        await saveUserLocally(
            username
        );

        alert(
            "Offline registration saved. Will sync automatically."
        );

    }

}

window.addEventListener(
    "online",
    () => {

        syncPendingUsers();

    }
);

syncPendingUsers();
