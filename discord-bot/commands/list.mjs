import {
  getDynamoDBClient,
  getMonsterItemBatch,
  getUserItem,
} from '../utils/aws-api.mjs';

// Discord command for list
export async function executeListCommand(userId) {
  const client = getDynamoDBClient();
  const userItem = await getUserItem(client, userId);
  const inventory = userItem.Inventory;
  const params = createGetBatchRequestParams(inventory);
  const monsterItems = await getMonsterItemBatch(client, userId, params);
  const monsterItemMap = createMonsterItemMap(monsterItems);
  const inventorySummary = createSummary(inventory, monsterItemMap);
  return createResponse(inventorySummary);
}

function createGetBatchRequestParams(inventory) {
  return Object.keys(inventory).map(
    id => {
      return {
        MonsterId: id,
      };
    },
  );
}

function createMonsterItemMap(monsterItems) {
  return monsterItems.reduce((map, obj) => {
    map[obj.MonsterId] = obj;
    return map;
  }, new Map());
}

function createSummary(inventory, relationMap) {
  let idText = '';
  let nameText = '';
  let quantityText = '';
  for (const [id, num] of Object.entries(inventory)) {
    idText = idText + '\n' + id;
    quantityText = quantityText + '\n' + num;
    nameText = nameText + '\n' + relationMap[id].Name;
  }
  return {
    title: 'Inventory',
    fields: [
      {
        name: 'Monster ID',
        value: idText,
        inline: true,
      },{
        name: 'Name',
        value: nameText,
        inline: true,
      },{
        name: 'Quantity',
        value: quantityText,
        inline: true,
      },
    ],
  };
}

function createResponse(table) {
  return {
    statusCode: 200,
    body: JSON.stringify({
      'type': 4,
      'data': {
        embeds: [table],
        tts: false,
      },
    }),
    headers: {
      'content-type': 'application/json',
    },
  };
}