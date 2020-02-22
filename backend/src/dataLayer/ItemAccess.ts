import * as AWS from "aws-sdk";
import {DocumentClient} from "aws-sdk/clients/dynamodb";
import {Types} from 'aws-sdk/clients/s3';
import {Item} from "../models/Item";
import {ItemUpdate} from "../models/ItemUpdate";

export class ItemAccess {
    constructor(
        private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly s3Client: Types = new AWS.S3({signatureVersion: 'v4'}),
        private readonly itemsTable = process.env.ITEMS_TABLE,
        private readonly attachmentTable = process.env.ATTACHMENT_TABLE,
        private readonly s3BucketName = process.env.S3_BUCKET_NAME) {
    }

    async getAllItems(userId: string): Promise<Item[]> {
        const params = {
            TableName: this.itemsTable,
            KeyConditionExpression: "#userId = :userId",
            ExpressionAttributeNames: {
                "#userId": "userId"
            },
            ExpressionAttributeValues: {
                ":userId": userId
            }
        };

        const result = await this.docClient.query(params).promise();
        const items = result.Items;

        return items as Item[]
    }

    async getItem(itemId: string, userId: string) {
        const params = {
            TableName: this.itemsTable,
            KeyConditionExpression: 'userId = :userId AND itemId = :itemId',
            ExpressionAttributeValues: {
                ':itemId': itemId,
                ':userId': userId,
            },
            ScanIndexForward: false
        };

        const result = await this.docClient.query(params).promise();
        const items = result.Items;
        return items[0];
    }

    async createItem(item: Item): Promise<Item> {
        const params = {
            TableName: this.itemsTable,
            Item: item,
        };

        await this.docClient.put(params).promise();
        return item as Item;
    };

    async createAttachment(item) {
        const attachmentItem = {
            ...item,
            attachmentUrl: `https://${this.s3BucketName}.s3.amazonaws.com/${item.attachmentId}`
        };
        const params = {
            TableName: this.attachmentTable,
            Item: attachmentItem,
        };

        await this.docClient.put(params).promise();

        return attachmentItem as Item;
    }

    async updateItem(itemUpdate: ItemUpdate, itemId: string, userId: string): Promise<ItemUpdate> {
        const params = {
            TableName: this.itemsTable,
            Key: {
                "userId": userId,
                "itemId": itemId
            },
            UpdateExpression: "set #a = :a, #b = :b, #c = :c",
            ExpressionAttributeNames: {
                "#a": "name",
                "#b": "date",
                "#c": "description"
            },
            ExpressionAttributeValues: {
                ":a": itemUpdate['name'],
                ":b": itemUpdate['date'],
                ":c": itemUpdate['description']
            },
            ReturnValues: "ALL_NEW"
        };

        const result = await this.docClient.update(params).promise();
        const attributes = result.Attributes;

        return attributes as ItemUpdate;
    };

    async updateItemAttachment(itemId, attachmentUrl, userId): Promise<Item> {
        const item = await this.getItem(itemId, userId);
        const updatedItem = {
            itemId: itemId,
            userId: userId,
            createdAt: item.createdAt,
            name: item.name,
            date:item.date,
            description: item.description,
            attachmentUrl: attachmentUrl
        };
        await this.docClient.put({
            TableName: this.itemsTable,
            Item: updatedItem
        }).promise();
        return updatedItem as Item;
    };

    async deleteItem(itemId: string, userId: string): Promise<string> {
        const params = {
            TableName: this.itemsTable,
            Key: {
                "userId": userId,
                "itemId": itemId
            },
        };

        await this.docClient.delete(params).promise();
        return "" as string;
    }

    async generateUploadUrl(attachmentId: string): Promise<string> {
        const url = this.s3Client.getSignedUrl('putObject', {
            Bucket: this.s3BucketName,
            Key: attachmentId,
            Expires: 1000,
        });
        return url as string;
    }

    async getAttachment(itemId: string) {
        const params = {
            TableName: this.attachmentTable,
            KeyConditionExpression: 'itemId = :itemId',
            ExpressionAttributeValues: {
                ':itemId': itemId
            },
            ScanIndexForward: false
        };

        const result = await this.docClient.query(params).promise();
        return result.Items;
    }
}
