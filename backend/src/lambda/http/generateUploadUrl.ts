import 'source-map-support/register'
import {generateUploadUrl, getItemAttachment, createAttachment, updateItemAttachment} from "../../businessLogic/Item";
import * as uuid from 'uuid';

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';

const s3BucketName = process.env.S3_BUCKET_NAME;
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const authorization = event.headers.Authorization;
    const split = authorization.split(' ');
    const jwtToken = split[1];

    const itemId = event.pathParameters.itemId;

    const attachmentId = uuid.v4();
    const URL = await generateUploadUrl(attachmentId);

    const newItem = await createAttachmentItem(itemId, attachmentId, event, jwtToken);
    const Attachments = await getItemAttachment(itemId);
    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
            uploadUrl: URL,
            attachmentUrl: Attachments,
            newItem: newItem
        })
    };
};

async function createAttachmentItem(itemId: string, attachmentId: string, event: any, jwtToken: string) {
    const newAttachment = await createAttachment(itemId, attachmentId, event, jwtToken);
    const attachmentURL = `${s3BucketName}.s3.amazonaws.com/${attachmentId}`;
    await updateItemAttachment(itemId, attachmentURL, jwtToken);
    return newAttachment;
}
