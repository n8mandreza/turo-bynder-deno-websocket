// Import the necessary dependencies from the Deno standard library
import { serve } from "https://deno.land/std/http/server.ts";
import { acceptable, acceptWebSocket, WebSocket } from "https://deno.land/std/ws/mod.ts";

// Create an HTTP server using Deno's serve function
const server = serve({ port: 8080 });
console.log("HTTP server started on http://localhost:8080");

// Handle incoming HTTP requests
for await (const req of server) {
  // Check if the request is a WebSocket upgrade request
  if (acceptable(req)) {
    acceptWebSocket({
      conn: req.conn,
      bufReader: req.r,
      bufWriter: req.w,
      headers: req.headers,
    })
      .then(handleWebSocket)
      .catch((err) => console.error(`Failed to accept WebSocket: ${err}`));
  }
}

// Define the function to handle WebSocket connections and messages
async function handleWebSocket(ws: WebSocket) {
  console.log("WebSocket connected");

  for await (const msg of ws) {
    if (typeof msg === "string") {
      // Handle incoming text messages
      console.log("Received message:", msg);

      // Check if the message is of type 'SAVE_ACCESS_TOKEN'
      try {
        const data = JSON.parse(msg);
        if (data.message === 'SAVE_ACCESS_TOKEN') {
          // Handle the SAVE_ACCESS_TOKEN message
          console.log("Received SAVE_ACCESS_TOKEN message");
          console.log("Access Token:", data.accessToken);
          
          // Implement your logic to save the access token or perform any necessary actions here
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }

      // Echo the message back to the client
      await ws.send(msg);
    }
  }

  console.log("WebSocket disconnected");
}
