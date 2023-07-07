import { ChatGPTAPI } from "chatgpt";
import "dotenv/config";
import { setIntervalAsync } from "set-interval-async";
import { getContext, updateContext } from "./src/context.js";
import ig from "./src/instagram.js";

(async () => {
  const username = process.env.USERNAME;
  const password = process.env.PASSWORD;

  const chatgpt = new ChatGPTAPI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  await ig.login(username, password);

  const me = await ig.getUser(username);

  setIntervalAsync(async () => {
    await ig.approveAll();
    const inbox = await ig.getInbox();
    for (const thread of inbox) {
      const messages = await ig.getNotSeenMessages(thread, me.pk);
      for (const msg of messages) {
        const context = getContext(thread.threadId);
        console.log(`${thread.users[0].username} says: ${msg.text}`);
        await thread.markItemSeen(msg.item_id);
        const result = await chatgpt.sendMessage(msg.text, context);
        for (const response of result.text.split("\n\n")) {
          await thread.broadcastText(response);
        }
        updateContext(thread.threadId, {
          // conversationId: result.conversationId,
          parentMessageId: result.id,
        });
      }
    }
  }, 10000);

  console.log("Running...");
})();
