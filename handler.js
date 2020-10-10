const middy = require("@middy/core");
const cors = require("@middy/http-cors");
const connectToDatabase = require("./db");
const Note = require("./models/Note");
const Avatar = require("./models/Avatar");
const Challenge = require("./models/Challenge");
const Message = require("./models/Message");
const MessageTrigger = require("./models/MessageTrigger");
require("dotenv").config({ path: "./.env" });
("use strict");

const apiWrapper = (method) => {
  return middy((event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    method(event, context, callback);
  }).use(cors());
};

const createAvatar = (event, context, callback) => {
  connectToDatabase().then(() => {
    Avatar.create(JSON.parse(event.body))
      .then((avatar) =>
        callback(null, {
          statusCode: 200,
          body: JSON.stringify(avatar),
        })
      )
      .catch((err) =>
        callback(null, {
          statusCode: err.statusCode || 500,
          body: JSON.stringify(err),
        })
      );
  });
};

const getAvatar = (event, context, callback) => {
  connectToDatabase().then(() => {
    Avatar.findById(event.pathParameters.id)
      .populate("messageTriggerList")
      .then((avatar) =>
        callback(null, {
          statusCode: 200,
          body: JSON.stringify(avatar),
        })
      )
      .catch((err) =>
        callback(null, {
          statusCode: err.statusCode || 500,
          body: JSON.stringify(err),
        })
      );
  });
};

const getAvatarList = (event, context, callback) => {
  connectToDatabase().then(() => {
    Avatar.find()
      .populate("messageTriggerList")
      .then((avatarList) =>
        callback(null, {
          statusCode: 200,
          body: JSON.stringify(avatarList),
        })
      )
      .catch((err) =>
        callback(null, {
          statusCode: err.statusCode || 500,
          body: JSON.stringify(err),
        })
      );
  });
};

const createChallenge = (event, context, callback) => {
  connectToDatabase().then(() => {
    const body = JSON.parse(event.body);
    Avatar.findById(body.avatarId).exec(function (err, avatar) {
      if (avatar) {
        let challengeId = null;
        Challenge.create({
          title: body.title,
          startAt: body.startAt,
          endAt: body.endAt,
          avatar: null,
        })
          .then((challenge) => {
            challengeId = challenge._id;
            Challenge.findByIdAndUpdate(
              challengeId,
              {
                $set: {
                  avatar: avatar._id,
                },
              },
              function (err, result) {
                console.log(err, result);
              }
            )
              .then((challenge) => {
                Avatar.findById(body.avatarId)
                  .populate("messageTriggerList")
                  .exec(function (err, avatar) {
                    const startMessageTrigger = avatar.messageTriggerList.find(
                      (messageTrigger) => {
                        return messageTrigger.type === "start";
                      }
                    );
                    console.log("startMessageTrigger : ", startMessageTrigger);
                    if (startMessageTrigger) {
                      Message.create({
                        avatarUrl: startMessageTrigger.avatarUrl,
                        contents: startMessageTrigger.contents,
                      }).then((message) =>
                        Challenge.findByIdAndUpdate(challenge._id, {
                          $push: { messageList: message },
                        })
                          .then(() => {
                            callback(null, {
                              statusCode: 200,
                              body: JSON.stringify(challenge),
                            });
                          })
                          .catch((err) =>
                            callback(null, {
                              statusCode: err.statusCode || 500,
                              body: JSON.stringify(err),
                            })
                          )
                          .catch((err) =>
                            callback(null, {
                              statusCode: err.statusCode || 500,
                              body: JSON.stringify(err),
                            })
                          )
                      );
                    }
                  });
                callback(null, {
                  statusCode: 200,
                  body: JSON.stringify(challenge),
                });
              })
              .catch((err) =>
                callback(null, {
                  statusCode: err.statusCode || 500,
                  body: JSON.stringify(err),
                })
              );
          })
          .catch((err) =>
            callback(null, {
              statusCode: err.statusCode || 500,
              body: JSON.stringify(err),
            })
          );
      } else {
        callback(null, {
          statusCode: err.statusCode || 500,
          body: JSON.stringify(err),
        });
      }
    });
  });
};

const getChallenge = (event, context, callback) => {
  connectToDatabase().then(() => {
    Challenge.findById(event.pathParameters.id)
      .populate("messageList")
      .populate("avatar")
      .then((challenge) => {
        console.log(challenge);
        callback(null, {
          statusCode: 200,
          body: JSON.stringify(challenge),
        });
      })
      .catch((err) =>
        callback(null, {
          statusCode: err.statusCode || 500,
          body: JSON.stringify(err),
        })
      );
  });
};

const getChallengeList = (event, context, callback) => {
  connectToDatabase().then(() => {
    Challenge.find()
      .populate("messageList")
      .populate("avatar")
      .then((challengeList) =>
        callback(null, {
          statusCode: 200,
          body: JSON.stringify(challengeList),
        })
      )
      .catch((err) =>
        callback(null, {
          statusCode: err.statusCode || 500,
          body: JSON.stringify(err),
        })
      );
  });
};

const createMessageTrigger = (event, context, callback) => {
  connectToDatabase().then(() => {
    MessageTrigger.create(JSON.parse(event.body))
      .then((messageTrigger) => {
        Avatar.findOneAndUpdate(
          { _id: JSON.parse(event.body).avatarId },
          {
            $push: {
              messageTriggerList: messageTrigger._id,
            },
          },
          function (err, result) {
            if (err) {
              console.log(err);
            } else {
              console.log(result);
            }
          }
        );
      })
      .then((messageTrigger) =>
        callback(null, {
          statusCode: 200,
          body: JSON.stringify(messageTrigger),
        })
      )
      .catch((err) =>
        callback(null, {
          statusCode: err.statusCode || 500,
          body: JSON.stringify(err),
        })
      );
  });
};

const getMessageTrigger = (event, context, callback) => {
  connectToDatabase().then(() => {
    MessageTrigger.findById(event.pathParameters.id)
      .then((messageTrigger) =>
        callback(null, {
          statusCode: 200,
          body: JSON.stringify(messageTrigger),
        })
      )
      .catch((err) =>
        callback(null, {
          statusCode: err.statusCode || 500,
          body: JSON.stringify(err),
        })
      );
  });
};

const getMessageTriggerList = (event, context, callback) => {
  connectToDatabase().then(() => {
    MessageTrigger.find()
      .then((messageTriggerList) =>
        callback(null, {
          statusCode: 200,
          body: JSON.stringify(messageTriggerList),
        })
      )
      .catch((err) =>
        callback(null, {
          statusCode: err.statusCode || 500,
          body: JSON.stringify(err),
        })
      );
  });
};

const createMessage = (event, context, callback) => {
  connectToDatabase().then(() => {
    const { challengeId, trigger } = JSON.parse(event.body);
    // user message
    Message.create({
      avatarUrl: null,
      contents: trigger,
    })
      .then((message) => {
        Challenge.findByIdAndUpdate(challengeId, {
          $push: {
            messageList: message._id,
          },
        })
          .then((challenge) => {
            // console.log(challenge);
            const avatarId = challenge.avatar;
            console.log(avatarId);
            Avatar.findById(avatarId)
              .populate("messageTriggerList")
              .exec(function (err, avatar) {
                // console.log(avatar);
                const messageTrigger = avatar.messageTriggerList.find(
                  (messageTrigger) => {
                    return messageTrigger.trigger === trigger;
                  }
                );
                if (messageTrigger) {
                  Message.create({
                    avatarUrl: messageTrigger.avatarUrl,
                    contents: messageTrigger.contents,
                  })
                    .then((message) => {
                      console.log(message);
                      console.log(challengeId);
                      Challenge.findByIdAndUpdate(challengeId, {
                        $push: {
                          messageList: message._id,
                        },
                      }).then(() => {
                        callback(null, {
                          statusCode: 200,
                          body: JSON.stringify(message),
                        });
                      });
                    })
                    .catch((err) =>
                      callback(null, {
                        statusCode: err.statusCode || 500,
                        body: JSON.stringify(err),
                      })
                    );
                }
              });
          })
          .catch((err) =>
            callback(null, {
              statusCode: err.statusCode || 500,
              body: JSON.stringify(err),
            })
          );
      })
      .catch((err) =>
        callback(null, {
          statusCode: err.statusCode || 500,
          body: JSON.stringify(err),
        })
      );
  });
};

const getMessageList = (event, context, callback) => {
  connectToDatabase().then(() => {
    const challengeId = event.pathParameters.id;
    Challenge.findOne({ _id: challengeId })
      .populate("messageList")
      .then((messageList) =>
        callback(null, {
          statusCode: 200,
          body: JSON.stringify(messageList),
        })
      )
      .catch((err) =>
        callback(null, {
          statusCode: err.statusCode || 500,
          body: JSON.stringify(err),
        })
      );
  });
};

const getTriggerList = (event, context, callback) => {
  connectToDatabase().then(() => {
    const challengeId = event.pathParameters.challengeId;
    Challenge.findById(challengeId)
      .then((challenge) => {
        const avatarId = challenge.avatar;
        Avatar.findById(avatarId)
          .populate("messageTriggerList")
          .then((avatar) => {
            const messageTriggerList = avatar.messageTriggerList;
            const triggerList = messageTriggerList
              .filter((messageTrigger) => messageTrigger.trigger)
              .map((messageTrigger) => messageTrigger.trigger);
            callback(null, {
              statusCode: 200,
              body: JSON.stringify(triggerList),
            });
          })
          .catch((err) =>
            callback(null, {
              statusCode: err.statusCode || 500,
              body: JSON.stringify(err),
            })
          );
      })
      .catch((err) =>
        callback(null, {
          statusCode: err.statusCode || 500,
          body: JSON.stringify(err),
        })
      );
  });
};

module.exports = {
  createAvatar: apiWrapper(createAvatar),
  getAvatar: apiWrapper(getAvatar),
  getAvatarList: apiWrapper(getAvatarList),
  createChallenge: apiWrapper(createChallenge),
  getChallenge: apiWrapper(getChallenge),
  getChallengeList: apiWrapper(getChallengeList),
  createMessageTrigger: apiWrapper(createMessageTrigger),
  getMessageTrigger: apiWrapper(getMessageTrigger),
  getMessageTriggerList: apiWrapper(getMessageTriggerList),
  createMessage: apiWrapper(createMessage),
  getMessageList: apiWrapper(getMessageList),
  getTriggerList: apiWrapper(getTriggerList),
};
