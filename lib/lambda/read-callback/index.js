'use strict';
const { DynamoDBClient, GetItemCommand } = require('@aws-sdk/client-dynamodb');

let db;

const handler = async (event) => {
    
    console.log('read-callback: event =', event);

    db = db || new DynamoDBClient({ region: process.env.AWS_REGION, maxAttempts: 5 });
    const phoneNo = event.Details.ContactData.Attributes.CallbackNumber;
    const queue = event.Details.ContactData.Queue.Name;
    console.log(`read-callback: phoneNumber = [${phoneNo}], queue = [${queue}]`);

    const req = {
        TableName: process.env.TableName,
        Key: { PhoneNumber: { S: phoneNo }, QueueName: { S: queue } }
    };

    console.log('read-callback: req =', JSON.stringify(req));
    const resp = await db.send(new GetItemCommand(req));
    console.log('read-callback: resp =', resp);
    const item = resp?.Item;
    if(!item) return { CallBackStatus: 'NotFound' };
    
    return {
        CallBackStatus: item.CallBackStatus?.S,
        NextContactId: item.NextContactId?.M?.S?.S,
        Time: item.timeStamp?.S,
        Date: item.dateStamp?.S
    };
};

exports.handler = handler;