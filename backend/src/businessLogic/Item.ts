import {Item} from "../models/Item";
import {ItemAccess} from "../dataLayer/ItemAccess";
import {parseUserId} from "../auth/utils";
import {CreateItemRequest} from "../requests/CreateItemRequest";
import {UpdateItemRequest} from "../requests/UpdateItemRequest";
import {ItemUpdate} from "../models/ItemUpdate";

const uuidv4 = require('uuid/v4');
const itemAccess = new ItemAccess();

export async function getAllItems(jwtToken: string): Promise<Item[]> {
    const userId = parseUserId(jwtToken);
    return itemAccess.getAllItems(userId);
}

export function createItem(createItemRequest: CreateItemRequest, jwtToken: string): Promise<Item> {
    const userId = parseUserId(jwtToken);
    return itemAccess.createItem({
        userId: userId,
        itemId: uuidv4(),
        createdAt: new Date().getTime().toString(),
        description: false,
        ...createItemRequest,
    });
}

export function createAttachment(itemId: string, attachmentId: string, event: any, jwtToken: string) {
    const timestamp = new Date().toISOString();
    const newAttach = JSON.parse(event.body);
    const newItem = {
        itemId,
        timestamp,
        attachmentId,
        userId: parseUserId(jwtToken),
        ...newAttach,
    };
    return itemAccess.createAttachment(newItem);
}

export function updateItem(updateItemRequest: UpdateItemRequest, itemId: string, jwtToken: string): Promise<ItemUpdate> {
    const userId = parseUserId(jwtToken);
    return itemAccess.updateItem(updateItemRequest, itemId, userId);
}

export function deleteItem(itemId: string, jwtToken: string): Promise<string> {
    const userId = parseUserId(jwtToken);
    return itemAccess.deleteItem(itemId, userId);
}

export function generateUploadUrl(itemId: string): Promise<string> {
    return itemAccess.generateUploadUrl(itemId);
}

export function getItemAttachment(itemId: string) {
    return itemAccess.getAttachment(itemId);
}

export function updateItemAttachment(itemId: string, attachmentUrl: any, jwtToken: any) {
    const userId = parseUserId(jwtToken);
    return itemAccess.updateItemAttachment(itemId, attachmentUrl, userId);
}
