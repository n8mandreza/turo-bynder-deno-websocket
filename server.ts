const subscribers = new Set<WebSocket>();

Deno.serve({
    port: 80,
    handler: async (request) => {
        // If the request is a websocket upgrade,
        // we need to use the Deno.upgradeWebSocket helper
        if (request.headers.get("upgrade") === "websocket") {
            const { socket, response } = Deno.upgradeWebSocket(request);

            subscribers.add(socket);

            socket.onopen = () => {
                console.log("CONNECTED");
            };

            socket.onmessage = (event) => {
                console.log(`RECEIVED: ${event.data}`);
                
                try {
                    const message = JSON.parse(event.data);

                    if (message && message.message === "SAVE_ACCESS_TOKEN") {
                        const accessToken = message.accessToken
                        const refreshToken = message.refreshToken

                        console.log(`Forwarding Access Token: ${accessToken} and Refresh Token: ${refreshToken}`);
                        
                        // Broadcasting to all subscribers
                        for (const subscriber of subscribers) {
                          if (subscriber !== socket) { // Optional: prevent sending back to the sender
                            subscriber.send(JSON.stringify({
                              message: 'SAVE_ACCESS_TOKEN',
                              accessToken,
                              refreshToken
                            }));
                          }
                        }
                    }
                } catch (error) {
                    console.error("Failed to parse message as JSON:", error);
                }
            };

            socket.onclose = () => {
                console.log("DISCONNECTED");
                subscribers.delete(socket);
            };

            socket.onerror = (error) => {
                console.error("ERROR:", error);
            };

            return response;
        } else {
            // If the request is a normal HTTP request,
            // we serve the client HTML file.
            const file = await Deno.open("./index.html", { read: true });
            return new Response(file.readable);
        }
    },
});