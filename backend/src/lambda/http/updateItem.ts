import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateItemRequest } from '../../requests/UpdateItemRequest'
import {updateItem} from "../../businessLogic/Item";

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // DONE: Update an item with the provided id using values in the "updatedTodo" object
    const authorization = event.headers.Authorization;
    const split = authorization.split(' ');
    const jwtToken = split[1];

    const itemId = event.pathParameters.itemId;
    const updatedTodo: UpdateItemRequest = JSON.parse(event.body);

    const toDoItem = await updateItem(updatedTodo, itemId, jwtToken);

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
            "item": toDoItem
        }),
    }
}
