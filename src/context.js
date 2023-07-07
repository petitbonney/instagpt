const contexts = {};
const timeLimit = 300000; // 5 minutes

const getContext = (userId) => {
  let context = contexts[userId];
  if (context) {
    context.lastSeen = Date.now();
  }
  return context;
};

const updateContext = (userId, context) => {
  if (!contexts[userId]) {
    contexts[userId] = {};
  }
  Object.assign(contexts[userId], context);
};

const resetContext = (userId) => {
  delete contexts[userId];
};

const cleanUnactiveContext = () => {
  const users = Object.keys(contexts);
  users.forEach((userId) => {
    const lastSeen = contexts[userId].lastSeen;
    if (Date.now() - lastSeen - timeLimit >= 0) {
      resetContext(userId);
    }
  });
};

setInterval(cleanUnactiveContext, timeLimit);

export { getContext, updateContext };
