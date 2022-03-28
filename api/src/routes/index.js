const { Router } = require("express");
const axios = require("axios");
const router = Router();

//Controllers
//get deliveries
const getAllDel = async () => {
  try {
    const allDel = await axios.get(
      `https://firestore.googleapis.com/v1/projects/kiwibot-9b2a9/databases/(default)/documents/deliveries`
    );
    console.log("esto debo mapear", allDel.data.documents);
    const delInfo = await allDel.data.documents.map((e) => {
      console.log("atributo", e.name);
      return {
        id: e.name.slice(64),
        creation_date: e.fields.creation_date.timestamValue,
        state: e.fields.state.stringValue,
        pickup_lat: e.fields.pickup.mapValue.fields.pickup_lat.doubleValue,
        pickup_lon: e.fields.pickup.mapValue.fields.pickup_lon.doubleValue,
        dropoff_lat: e.fields.dropoff.mapValue.fields.dropoff_lat.doubleValue,
        dropoff_lon: e.fields.dropoff.mapValue.fields.dropoff_lon.doubleValue,
        zone_id: e.fields.zone_id.stringValue,
        creation_date: e.fields.creation_date.timestampValue,
      };
    });
    return delInfo;
  } catch (error) {
    console.log("Error in the All_call controller", error);
  }
};
//get delivery by ID
const getDelById = async (id) => {
  try {
    const delById = await axios.get(
      `https://firestore.googleapis.com/v1/projects/kiwibot-9b2a9/databases/(default)/documents/deliveries/${id}`
    );
    return delById.data;
  } catch (error) {
    console.log("Error in the ID controller", error);
  }
};
//POST A DELIVERY
const postDelivery = async (
  zone_id,
  dropoff_lat,
  dropoff_lon,
  pickup_lat,
  pickup_lon
) => {
  axios
    .post(
      "https://firestore.googleapis.com/v1/projects/kiwibot-9b2a9/databases/(default)/documents/deliveries",
      {
        fields: {
          zone_id: {
            stringValue: zone_id,
          },
          dropoff: {
            mapValue: {
              fields: {
                dropoff_lat: {
                  doubleValue: dropoff_lat,
                },
                dropoff_lon: {
                  doubleValue: dropoff_lon,
                },
              },
            },
          },
          pickup: {
            mapValue: {
              fields: {
                pickup_lat: {
                  doubleValue: pickup_lat,
                },
                pickup_lon: {
                  doubleValue: pickup_lon,
                },
              },
            },
          },
          state: {
            stringValue: "pending",
          },
          creation_date: {
            timestampValue: new Date(),
          },
        },
      }
    )
    .then((res) => {
      console.log("Post created");
    });
};
//POST A BOT

const postBot = async (dropoff_lat, dropoff_lon, zone_id) => {
  axios
    .post(
      "https://firestore.googleapis.com/v1/projects/kiwibot-9b2a9/databases/(default)/documents/bots",
      {
        fields: {
          status: { stringValue: "available" },
          location: {
            mapValue: {
              fields: {
                dropoff_lat: {
                  doubleValue: dropoff_lat,
                },
                dropoff_lon: {
                  doubleValue: dropoff_lon,
                },
              },
            },
          },
          zone_id: {
            stringValue: zone_id,
          },
        },
      }
    )
    .then((res) => {
      console.log("Post created");
    });
};
const updateDel = async (bot, id) => {
  axios
    .patch(
      `https://firestore.googleapis.com/v1/projects/kiwibot-9b2a9/databases/(default)/documents/bots/${id}?updateMask.fieldPaths=state&updateMask.fieldPaths=bot&updateMask`,
      {
        fields: {
          bot: {
            stringValue: bot,
          },

          state: {
            stringValue: "assigned",
          },
        },
      }
    )
    .then((doc) => {
      console.log("Document successfully updated!");
    });
};

//**********************************************//
//POST A DELIVERY
router.post("/delivery", async (req, res) => {
  const { zone_id, dropoff_lat, dropoff_lon, pickup_lat, pickup_lon } =
    req.body;
  const newDelivery = await postDelivery(
    zone_id,
    dropoff_lat,
    dropoff_lon,
    pickup_lat,
    pickup_lon
  );
  res.send("Delivery created");
});

//POST A BOT
router.post("/bot", async (req, res) => {
  const { dropoff_lat, dropoff_lon, zone_id } = req.body;
  const newBot = await postBot(dropoff_lat, dropoff_lon, zone_id);
  res.send("Bot created");
});
//GET ALL DELIVERIES
router.get("/delivery", async (req, res) => {
  const allDelivery = await getAllDel();
  //console.log(allDelivery);
  res.status(200).json(allDelivery);
});

//GET DELIVERY BY ID
router.get("/delivery/:id", async (req, res) => {
  const { id } = req.params;
  const delivery = await getDelById(id);
  delivery.fields
    ? res.status(200).json(delivery.fields)
    : res.status(404).send("Delivery not found");
});

module.exports = router;
