import nacl from 'tweetnacl';
import { executeRollCommand } from './commands/roll.mjs';
import { executeListCommand } from './commands/list.mjs';

export const handler = async (event) => {
  try {
    if (!verifyEventForDiscord(event)) {
      console.log('invalid');
      return {
        statusCode: 401,
        body: JSON.stringify('invalid request signature'),
      };
    }

    const body = JSON.parse(event.body);
    switch (body.type) {
      case 1:
        return {
          statusCode: 200,
          body: JSON.stringify({ type: 1 }),
        };
      case 2:
        return await handleCommand(body.data.name, body);
      default:
        return {
          statusCode: 404,
        };
    }
  } catch (error) {
    console.log( 'ERROR: ' + error);
    return {
      statusCode: 501,
      body: JSON.stringify({
        type: 4,
        data: { content: 'pong' },
      }),
      headers: {
            'content-type': 'application/json',
      },
    };
  }
};

function verifyEventForDiscord(event) {
  const PUBLIC_KEY = process.env.PUBLIC_KEY;
  console.log(event);
  const signature = event.headers['x-signature-ed25519'];
  const timestamp = event.headers['x-signature-timestamp'];
  const strBody = event.body; // should be string, for successful sign

  return nacl.sign.detached.verify(
    Buffer.from(timestamp + strBody),
    Buffer.from(signature, 'hex'),
    Buffer.from(PUBLIC_KEY, 'hex'),
  );
}

async function handleCommand(cmd, body) {
  switch (cmd) {
    case 'roll':
      return await executeRollCommand(body.member.user.id);
    case 'list':
      return await executeListCommand(body.member.user.id);
    case 'evolve':
      return;
    default:
      console.log('unknown command');
      return {
        statusCode: 400,
      };
  }
}