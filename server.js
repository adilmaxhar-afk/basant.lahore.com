const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.use(express.static(__dirname));

let players = {};

io.on("connection", socket => {

    players[socket.id] = {
        x: 300,
        y: 200,
        hp: 5,
        rupees: 0,
        color: "red"
    };

    socket.on("move", data => {
        let p = players[socket.id];
        if (p) {
            p.x = data.x;
            p.y = data.y;
        }
    });

    socket.on("buy", data => {
        let p = players[socket.id];
        if (p && p.rupees >= data.price) {
            p.rupees -= data.price;
            p.color = data.color;
        }
    });

    socket.on("disconnect", () => {
        delete players[socket.id];
    });

    setInterval(() => {

        let ids = Object.keys(players);

        // PvP collision (kite cutting)
        for (let i = 0; i < ids.length; i++) {
            for (let j = i + 1; j < ids.length; j++) {

                let a = players[ids[i]];
                let b = players[ids[j]];

                if (
                    a.x < b.x + 30 &&
                    a.x + 30 > b.x &&
                    a.y < b.y + 30 &&
                    a.y + 30 > b.y
                ) {
                    b.hp -= 1;

                    if (b.hp <= 0) {
                        a.rupees += 10;
                        b.hp = 5;
                        b.x = Math.random() * 800;
                        b.y = Math.random() * 600;
                    }
                }
            }
        }

        io.emit("players", players);

    }, 50);
});

server.listen(3000, () => {
    console.log("Running on http://localhost:3000");
});
