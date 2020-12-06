const router = require("express").Router();
const database = require("../database");

router.post("/create", async(req, res) => {
    const {
        event_eid,
        vendor_uid,
        customer_uid,
    } = req.body;
    
    try {
        await database.exec`
INSERT INTO transactions (t_event_eid, t_vendor_uid, t_customer_uid, t_status_tsid)
VALUES (${event_eid}, ${vendor_uid}, ${customer_uid}, 1)
`;
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

router.post("/add/:id", async(req, res) => {
    const id = parseInt(req.params.id);
    const { items } = req.body;
    if (items.length === 0) 
        return res.sendStatus(400);
    try {
        for (const item of items)
            await database.exec`
INSERT INTO transaction_item (ti_item, ti_quantity, ti_price, ti_details, ti_tid) 
VALUES (${item.name}, ${item.quantity}, ${item.price}, ${item.details}, ${id})
`;
        res.sendStatus(200);
    } catch (err) {
        res.send(err);
    }
})

router.get("/get/:id", async(req, res) => {
    const id = parseInt(req.params.id);
    try {
        const trans = await database.exec`SELECT * from transactions WHERE t_id = ${id}`;
        const items = await database.exec`SELECT * from transaction_item WHERE ti_tid = ${id}`;
        return res.json({
            ...trans,
            items
        });
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
})


router.post("/setPaymentStatus/:id", async(req, resp) => {
    const id = parseInt(req.params.id);
    //! need file send
    try {
        const res = await database.exec`
UPDATE transactions
SET t_status_tsid = 2
WHERE t_id = ${id}
`;
        if (res.affectedRows === 1)
            resp.sendStatus(200)
        else
            resp.sendStatus(400);
    } catch (err) {
        console.error(err);
        resp.sendStatus(500);
    }
})

router.post("/setTrackingNumber/:id", async (req, resp) => {
    const t_id = parseInt(req.params.id);
    const { 
        tracking_number: trackingNumber
    } = req.body

    if (!trackingNumber) 
        return resp.sendStatus(400);

    try {
        const res = await database.exec`
UPDATE transactions
SET t_status_tsid = 3, 
t_tracking_id = ${trackingNumber}
WHERE t_id = ${t_id} AND t_status_tsid = 2
`;
        if (res.affectedRows === 1)
            resp.sendStatus(200)
        else
            resp.sendStatus(400);
    } catch (err) {
        console.error(err);
        resp.sendStatus(500);
    }
});

router.post("/setAcceptStatus/:id", async(req, resp) => {
    try {
        const t_id = parseInt(req.params.id);
        const res = await database.exec`
UPDATE transactions
SET t_status_tsid = 4
WHERE t_id = ${t_id} AND t_status_tsid = 3
`;
        if (res.affectedRows === 1)
            resp.sendStatus(200)
        else
            resp.sendStatus(400);
    } catch (err) {
        console.error(err);
        resp.sendStatus(500);
    }
});

module.exports = router;
