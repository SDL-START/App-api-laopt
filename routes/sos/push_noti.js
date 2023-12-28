const axios = require("axios");
const firebaseKey = process.env.FIREBASE_FCM;

const pushNoti = (token, title, body) => {
  try {
    axios
      .post(
        "https://fcm.googleapis.com/fcm/send",
        {
          notification: {
            title: title,
            body: body,
            sound: "default",
            icon: "@drawable/ic_launcher",
          },
          content_available: true,
          priority: "high",
          to: token,
        },
        {
          headers: {
            Authorization: "key=" + firebaseKey,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        console.log("RESPONSE", response.data);
      })
      .catch((error) => {
        console.log("ERROR", error);
      });
  } catch (e) {
    console.log("ERROR", e);
  }
};
module.exports = pushNoti

