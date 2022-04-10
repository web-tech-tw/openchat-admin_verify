"use strict";

require('dotenv').config();

const http_status = require('http-status-codes');

const
    app = require('./src/init/express'),
    constant = require('./src/init/const'),
    ctx = {
        now: () => Math.floor(new Date().getTime() / 1000),
        cache: require('./src/init/cache'),
        database: require('./src/init/database'),
        hash_secret: require('./src/init/hash_secret')
    },
    util = {
        hash: require('./src/utils/hash')
    },
    schema = {
        application: require("./src/schemas/application"),
        room: require("./src/schemas/room")
    };

app.get('/', (req, res) => {
    res.redirect(http_status.MOVED_PERMANENTLY, process.env.WEBSITE_URL);
});

app.post('/room', async (req, res) => {
    if (!(req?.body?.display_name)) {
        res.sendStatus(http_status.BAD_REQUEST);
        return;
    }
    const Room = ctx.database.model('Room', schema.room);
    const room_id = util.hash(ctx, req.body.display_name, 24);
    if (await Room.findOne({_id: room_id})) {
        res.sendStatus(http_status.CONFLICT);
        return;
    }
    const metadata = {_id: room_id, display_name: req.body.display_name};
    const room = await (new Room(metadata)).save();
    res.status(http_status.CREATED).send(room);
});

app.post('/application', async (req, res) => {
    if (!(req?.body?.room_id)) {
        res.sendStatus(http_status.BAD_REQUEST);
        return;
    }
    const Room = ctx.database.model('Room', schema.room);
    const room = await Room.findOne({_id: req.body.room_id});
    if (!room) {
        res.sendStatus(http_status.NOT_FOUND);
        return;
    }
    const Application = ctx.database.model('Application', schema.application);
    const metadata = {
        code: "",
        room_id: room._id,
        user_agent: req.useragent,
        ip_address: req?.clientIp || req.ip,
        created_at: ctx.now()
    };
    const application = await (new Application(metadata)).save();
    res.status(http_status.CREATED).send(application);
});

app.listen(process.env.HTTP_PORT, process.env.HTTP_HOSTNAME, () => {
    console.log(constant.APP_NAME)
    console.log('====')
    console.log('Application is listening at')
    console.log(`http://localhost:${process.env.HTTP_PORT}`)
});
