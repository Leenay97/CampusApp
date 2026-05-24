import { WebSocketServer } from 'ws';

export const wss = new WebSocketServer({ port: 4001 });

const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);

  ws.on('close', () => {
    clients.delete(ws);
  });
});

export function broadcast(event) {
  const msg = JSON.stringify(event);

  clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(msg);
    }
  });
}
