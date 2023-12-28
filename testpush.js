const axios = require("axios");
const logger = require("./utils/logger");
const { sendpushtofirebasetoken } = require("./utils/myutil");
const title = "title test";
const body = "body test";
const token = `cfY6o6m6RiqyGmBEBa5D5C:APA91bGHlXcbBOAvDeUhWOdaFgU67uElarCEmcM3uuhS81dVSzggAhCjKuaG8bECzFNRa7wxeTlOfYkwZxM3DbR9TbwkMomLhkOsWArGXpLdYNa_9pz3RWG8PjyDWmbfEoxaIAR1bgkt`;
const firebasekey =
  "AAAASwogfRw:APA91bFctfImGG5j1g8IKtv27QqlKLLlr7KzCmc1g9zPOhLeN6PQ3vIlTJgA4inMFBegN7aE874kkC70wHfPJkWX0H3TW8bBeRtgQAXl0VOVBwh5Pr1LjLZ0A5WEgwB5TxDxsvLYPMCc";
// const firebasetoken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaG9uZSI6Ijg1NjIwMjIyMjQwNzEiLCJlbWFpbCI6Imxhb2RlYnVnQGdtYWlsLmNvbSIsImlhdCI6MTY1OTg5MDE2NX0.tX0nZnNtQWsc79OKozFPodAnCURaI-WXWmkCcsjyfU8`;
const firebasetoken = `eBPrIYUdR5-71jKzqKtKUZ:APA91bEZrXXTouQlIHA02CNLk0P0SbhO8jyGKKIKOY68TEkPfnppps23jzTv8GVCxYQwfIuMxVzrlVdvDsoFujLtsTh0_fMjaNzJSaHRFnhU6rC9MEt5g4w8iJrssbpWCA5szlzcUeY7`;
const notification = {
  title: title,
  body: body,
  icon: "@drawable/ic_launcher",
};
const data = {
  click_action: "FLUTTER_NOTIFICATION_CLICK",
  sound: "default",
  status: "done",
  screen: "screenA",
  data: notification,
};

sendpushtofirebasetoken(
  firebasetoken,
  "Your certificate has been paid",
  "Thank you. Your certificate has been paid successfully."
);
