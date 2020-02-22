import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateItemRequest } from '../../requests/CreateItemRequest'
import {createItem} from "../../businessLogic/Item";

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const authorization = event.headers.Authorization;
    const split = authorization.split(' ');
    const jwtToken = split[1];

    const newItem: CreateItemRequest = JSON.parse(event.body);
    const Item = await createItem(newItem, jwtToken);

    return {
        statusCode: 201,
        headers: {
            "Access-Control-Allow-Origin": "*",
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
            "item": Item
        }),
    }
};
