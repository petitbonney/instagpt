import fs from "fs";
import { IgApiClient } from "instagram-private-api";

const STATE_PATH = "./state.json";

const ig = new IgApiClient();

const readState = () => JSON.parse(fs.readFileSync(STATE_PATH));
const saveState = (state) =>
  fs.writeFileSync(STATE_PATH, JSON.stringify(state), { flag: "w" });

const login = async (username, password) => {
  if (fs.existsSync(STATE_PATH)) {
    // Use saved state
    const state = readState(STATE_PATH);
    await ig.state.deserialize(state);
  } else {
    // Basic login
    ig.state.generateDevice(username);
    await ig.account.login(username, password);
    // Save state
    const state = await ig.state.serialize();
    saveState(state);
  }
};

const getUser = async (username) => {
  const results = await ig.search.users(username);
  return results.find((user) => user.username === username) || results[0];
};

const zipThreads = (records, items) => {
  const threads = [];
  for (const r of records) {
    let thread = r;
    for (const i of items) {
      if (i.thread_id === r.threadId) {
        thread = Object.assign(r, i);
      }
    }
    threads.push(thread);
  }
  return threads;
};

const getInbox = async () => {
  const inbox = await ig.feed.directInbox();
  const records = await inbox.records();
  const items = await inbox.items();
  return zipThreads(records, items);
};

const getPending = async () => {
  const inbox = await ig.feed.directPending();
  const items = await inbox.items();
  const records = await inbox.records();
  return zipThreads(items, records);
};

const approveAll = async () => {
  const pending = await getPending();
  const threadIds = new Set();
  pending.forEach((th) => threadIds.add(th.thread_id));
  return await ig.directThread.approveMultiple(Array.from(threadIds));
};

const getNotSeenMessages = (thread, pk) => {
  const lastSeen = thread.last_seen_at[pk];
  if (lastSeen == undefined) {
    return thread.items;
  } else {
    const lastSeenAt = parseInt(lastSeen.timestamp);
    return thread.items.filter((x) => parseInt(x.timestamp) > lastSeenAt);
  }
};

export default {
  login,
  getUser,
  getInbox,
  getPending,
  approveAll,
  getNotSeenMessages,
};
