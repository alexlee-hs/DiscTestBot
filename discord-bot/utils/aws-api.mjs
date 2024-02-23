import { DynamoDBClient  } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  BatchGetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

// internal api for aws-sdk

export function getDynamoDBClient() {
  const client = new DynamoDBClient({});
  return DynamoDBDocumentClient.from(client);
}

export async function getUserItem(client, userId) {
  const getCommand = new GetCommand({
    TableName: 'PAD_USER_DB',
    Key: {
      UserId: userId,
    },
  });
  const response = await client.send(getCommand);
  return response.Item;
}

export async function getMonsterItem(client, monsterId) {
  const getCommand = new GetCommand({
    TableName: 'PAD_MONSTER_DB',
    Key: {
      MonsterId: monsterId,
    },
  });
  const response = await client.send(getCommand);
  return response.Item;
}

export async function getMonsterItemBatch(client, userId, params) {
  const getCommand = new BatchGetCommand({
    RequestItems: {
      'PAD_MONSTER_DB': {
        Keys: params,
      },
    },
  });
  const response = await client.send(getCommand);
  return response.Responses['PAD_MONSTER_DB'];
}

export async function getRollRoster(client, rarity) {
  const getCommand = new GetCommand({
    TableName: 'PAD_ROLL_DB',
    Key: {
      Rarity: rarity,
    },
  });
  const response = await client.send(getCommand);
  return response.Item;
}

export async function updateUserInventory(client, userId, inventory) {
  const getCommand = new UpdateCommand({
    TableName: 'PAD_USER_DB',
    Key: {
      UserId: userId,
    },
    UpdateExpression: "set Inventory = :attrValue",
    ExpressionAttributeValues: {
        ":attrValue": inventory,
    },
  });
  await client.send(getCommand);
}