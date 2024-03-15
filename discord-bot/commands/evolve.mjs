import {
  getDynamoDBClient,
  getMonsterItem,
  getUserItem,
  updateUserInventory,
} from '../utils/aws-api.mjs';

// Discord command for roll
export async function executeEvolveCommand(userId, monsterId) {
  const client = getDynamoDBClient();
  // check that this monster can evolve
  const evolvedMonsterId = await getEvolvedMonsterId(client, monsterId);
  if (!evolvedMonsterId) {
    return getFailedResponse('This monster cannot be evolved.');
  }
  // check that there is enough monster in inventory
  const userItem = await getUserItem(client, userId);
  const inventory = userItem.Inventory;
  const evolveCondition = isUserMonsterCountEnough(inventory, monsterId);
  if (!evolveCondition) {
    return getFailedResponse('You do not have enough of this monster to undergo evolution!');
  }

  // proceed with evolution
  await addEvolutionUpdateToUserInventory(client, inventory, userId, monsterId, evolvedMonsterId);
  
  // create response
  const evolvedMonster = await getMonsterItem(client, evolvedMonsterId);
  return createEvolutionResponse(evolvedMonster);
}

async function getEvolvedMonsterId(client, monsterId) {
  const monster = await getMonsterItem(client, monsterId);
  if (!monster.Evolutions) {
    return;
  }
  const count = monster.Evolutions.length;
  const selectedIndex = Math.floor(Math.random() * count);
  return monster.Evolutions[selectedIndex];
}

async function addEvolutionUpdateToUserInventory(client, inventory, userId, monsterId, evolvedMonsterId) {
  // update consumed monsters
  if (inventory[monsterId] == 3) {
    inventory.delete(monsterId);
  } else {
    inventory[evolvedMonsterId] -= 3;
  }

  // update evolved monster
  if (!!inventory[evolvedMonsterId]) {
    inventory[evolvedMonsterId] += 1;
  } else {
    inventory[evolvedMonsterId] = 1;
  }
  await updateUserInventory(client, userId, inventory);
}

function isUserMonsterCountEnough(inventory, monsterId) {
  const count = inventory?.[monsterId];
  return !!count && count >= 3;
}

function getFailedResponse(message) {
  return  {
    statusCode: 200,
    body: JSON.stringify({
      'type': 4,
      'data': {
        content: message,
        tts: false,
      },
    }),
    headers: {
      'content-type': 'application/json',
    },
  };
}

function createEvolutionResponse(monster) {
  return {
    statusCode: 200,
    body: JSON.stringify({
      'type': 4,
      'data': {
        content: 'Congrats, your monster has evolved to:',
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