import "dotenv/config";
import { setIntervalAsync } from "set-interval-async";
import ig from "../src/instagram.js";

(async () => {
  const username = process.env.USERNAME;
  const password = process.env.PASSWORD;

  await ig.login(username, password);

  const me = await ig.getUser(username);
  console.log(me);

  setIntervalAsync(async () => {
    await ig.approveAll();
    const inbox = await ig.getInbox();
    for (const thread of inbox) {
      const messages = await ig.getNotSeenMessages(thread, me.pk);
      for (const msg of messages) {
        console.log(`${thread.users[0].username} says: ${msg.text}`);
        await thread.markItemSeen(msg.item_id);
        await thread.broadcastText(msg.text);
      }
    }
  }, 10000);

  console.log("Running...");
})();
