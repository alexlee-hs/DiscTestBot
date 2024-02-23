import {
  getDynamoDBClient,
  getMonsterItem,
  getRollRoster,
  getUserItem,
  updateUserInventory,
} from '../utils/aws-api.mjs';

// Discord command for roll
export async function executeRollCommand(userId) {
  const client = getDynamoDBClient();
  const monsterId = await rollMonsterId(client);
  const monster = await getMonsterItem(client, monsterId);
  await addMonsterToUserInventory(client, userId, monster);
  return createRollResponse(monster);
}

async function addMonsterToUserInventory(client, userId, monster) {
  const currentUserItem = await getUserItem(client, userId);
  let updatedInventory;
  if (!!currentUserItem) {
    // add monster to user inventory and update user entry
    updatedInventory = currentUserItem.Inventory;
    if (!!updatedInventory[monster.MonsterId]) {
      updatedInventory[monster.MonsterId] += 1;
    } else {
      updatedInventory[monster.MonsterId] = 1;
    }
  } else {
    // create user entry with monster in inventory
    updatedInventory= {
      [monster.MonsterId]: 1,
    };
  }
  await updateUserInventory(client, userId, updatedInventory);
}

function createRollResponse(monster) {
  return {
    statusCode: 200,
    body: JSON.stringify({
      'type': 4,
      'data': {
        content: 'Congrats, you have rolled:',
        tts: false,
        embeds: [{
          title: `${monster.Rarity} STAR - ${monster.Name}\nType: ${Array.from(monster.Type).join('/')}`,
          type: 'image',
          image: {
            url: `https://pad-static.chesterip.cc/media/monster-large/${monster.MonsterId}.png`,
          },
        }],
      },
    }),
    headers: {
      'content-type': 'application/json',
    },
  };
}

async function rollMonsterId(client) {
  const rarity = rollRarity();
  return await rollMonsterIdFromRarity(client, rarity);
}

async function rollMonsterIdFromRarity(client, rarity) {
  const res = await getRollRoster(client, rarity);
  const monsterList = res.MonsterList.split(',');
  const roll = Math.ceil(Math.random() * monsterList.length);
  return monsterList[roll];
}

function rollRarity() {
  const roll = Math.random();
  if (roll < .4) {
    return 3;
  } else if (roll < .8) {
    return 4;
  } else {
    return 5;
  }
}