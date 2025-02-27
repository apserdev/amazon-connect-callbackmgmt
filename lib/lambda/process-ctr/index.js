'use strict';
const { Buffer } = require('buffer');
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { UpdateCommand } = require('@aws-sdk/lib-dynamodb');


const CALL_TYPE_CB = process.env.CALL_TYPE_CB;
const CB_STATUS = process.env.CB_STATUS;
const TABLE_NAME = process.env.TableName;
let db;

const handler = async (event, context, callback) => {

    if(!CALL_TYPE_CB || !CB_STATUS) {
        throw new Error('Required environment variables not found!');
    }

    console.log('process-ctr: event =', event);

    const recordCount = Array.isArray(event?.Records) ? event.Records.length : 0;
    console.log(`process-ctr: recordCount = ${recordCount}`);
    if(recordCount < 1) {
        console.log('process-ctr: No records kinesis records found. Done');
        return;
    }

    db = db || new DynamoDBClient({ region: process.env.AWS_REGION, maxAttempts: 5 });

    for(const rec of event.Records) {
        const encodedData = rec?.kinesis?.data;
        if(!encodedData) continue;
        await processRecord(encodedData);
    }

} // handler

const processRecord = async (encodedData) => {

    const json = Buffer.from(encodedData, 'base64').toString('utf8');
    const data = JSON.parse(json);
    const attributes = data.Attributes;

    if(attributes?._entry !== CALL_TYPE_CB) {
        console.log('process-ctr: Not a callback. Ignored.');
        return;
    }

    const cbStatus = attributes.CallBackStatus;
    if(cbStatus !== CB_STATUS) {
        console.warn(`process-ctr: Unexpected callback status = [${cbStatus}].`);
        return;
    }

    const nextContactId = data.NextContactId;
    if(!nextContactId) {
        console.warn('process-ctr: NextContactId not found.');
        return;
    }

    const phoneNo = attributes.CallbackNumber;
    const queueName = attributes.QueueName;    
    await updateCallback(phoneNo, queueName, nextContactId);
};

const updateCallback = async (phoneNo, queueName, nextContactId) => {
    
    const req = {
        TableName: TABLE_NAME,
        Key: { PhoneNumber: phoneNo, QueueName: queueName },
        UpdateExpression: 'SET NextContactId = :nextContactId',
        ExpressionAttributeValues: { ':nextContactId': { S: nextContactId } }
    };

    try {
        console.log('process-ctr: req =', req);
        const resp = await db.send(new UpdateCommand(req));
        console.log('process-ctr: data =', resp);
    } catch(ex) {
        console.error('process-ctr: ', ex);
        throw ex;
    }

    return;
};

exports.handler = handler;