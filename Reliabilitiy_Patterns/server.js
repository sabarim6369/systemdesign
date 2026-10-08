import express from "express";
import crypto from "crypto";
import redisClient from "./redisClient.js";
import { resolve } from "dns";

const app = express();

app.use(express.json());


app.post("/payments", async (req, res) => {

    try {


        const idempotencyKey =
            req.headers["idempotency-key"];


        // --------------------------------
        // 2. Validate key
        // --------------------------------

        if (!idempotencyKey) {

            return res.status(400).json({
                success: false,
                message: "Idempotency-Key header is required"
            });

        }


        // --------------------------------
        // 3. Create Redis key
        // --------------------------------

        const redisKey =
            `idempotency:payment:${idempotencyKey}`;


        // --------------------------------
        // 4. Try to acquire the key
        // --------------------------------

        const acquired = await redisClient.set(
            redisKey,
            JSON.stringify({
                status: "PROCESSING"
            }),
            {
                NX: true,
                EX: 60
            }
        );

        //NX: true   means:  Set this key ONLY if the key does NOT already exist.


        // --------------------------------
        // 5. If key already exists
        // --------------------------------

        if (!acquired) {

            const existingData =
                await redisClient.get(redisKey);


            // Another request is currently processing
            if (existingData) {

                const parsedData =
                    JSON.parse(existingData);


                if (parsedData.status === "PROCESSING") {

                    return res.status(409).json({
                        success: false,
                        message: "Request is already being processed"
                    });

                }


                // Previous request already completed
                return res.status(200).json(
                    parsedData
                );
            }
        }


        // --------------------------------
        // 6. Process payment
        // --------------------------------

        console.log(
            "Processing payment..."
        );

        const payment =
            await processPayment(req.body.amount);


        // --------------------------------
        // 7. Store final result in Redis
        // --------------------------------

        await redisClient.set(
            redisKey,
            JSON.stringify(payment),
            {
                EX: 86400
            }
        );


        // --------------------------------
        // 8. Return response
        // --------------------------------

        return res.status(200).json(payment);


    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});



async function processPayment(amount) {

    await new Promise(resolve => {
        setTimeout(resolve, 3000);
    });
  

    const paymentId =
        crypto.randomUUID();


    console.log(
        `Payment processed: ${paymentId}`
    );


    return {

        success: true,

        paymentId,

        amount,

        status: "SUCCESS"
    };
}


app.listen(3000, () => {

    console.log(
        "Server running on http://localhost:3000"
    );

});