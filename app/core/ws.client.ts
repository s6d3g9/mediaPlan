// TODO: WebSocket / Redis Pub/Sub client — placeholder for messenger integration
export function useWsClient() {
  let ws: WebSocket | null = null

  function connect(_url: string) {
    // TODO: connect to WebSocket server backed by Redis Pub/Sub
  }

  function disconnect() {
    ws?.close()
    ws = null
  }

  function send(_payload: unknown) {
    // TODO: send message over WebSocket
  }

  return { connect, disconnect, send }
}
