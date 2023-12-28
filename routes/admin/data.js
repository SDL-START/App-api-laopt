const {PrismaClient} = require("@prisma/client");
const express = require("express");
const uploader = require("./../../utils/uploader");
const uuid = require("uuid");
const router = express.Router();
const prisma = new PrismaClient();

router.get("/translate", async (req, res) => {
  try {
    let translate = await prisma.translation.findMany();

    if (!translate) {
      return res.status(404).send({
        message: "Translation not found",
      });
    }

    return res.send({
      result: "OK",
      message: "Success",
      translate,
    });
  } catch (error) {
    return res.status(500).send({
      result: "ERROR",
      message: error.message,
    });
  }
});

router.post("/translate/save", async (req, res) => {
  const body = req.body;
  try {
    let updated = await prisma.translation.update({
      where: {
        id: body.id,
      },
      data: {
        translate: body.translate,
      },
    });

    if (!updated) {
      return res.status(404).send({
        message: `Failed to save ${body.word}`,
      });
    }

    return res.send({
      result: "OK",
      message: "Success",
    });
  } catch (error) {
    return res.status(500).send({
      result: "ERROR",
      message: error.message,
    });
  }
});

router.get("/insurance/types", async (req, res) => {
  try {
    let types = await prisma.insurancetype.findMany({
      where: {
        status: "ACTIVE",
        deleted: false,
      },
    });

    if (!types) {
      return res.status(404).send({
        message: "Insurance type not found",
      });
    }

    return res.send(types);
  } catch (error) {
    return res.status(500).send({
      result: "ERROR",
      message: error.message,
    });
  }
});

router.post("/insurance/type/add", async (req, res) => {
  try {
    const created = await prisma.insurancetype.create({
      data: {
        photo: req.body.photo,
        name: req.body.name,
        description: req.body.description,
      },
    });

    if (!created) {
      return res.status(404).send({
        message: "Can't add new insurance",
      });
    }

    return res.send(created);
  } catch (error) {
    return res.status(500).send({
      result: "ERROR",
      message: error.message,
    });
  }
});

router.post("/insurance/type/save", async (req, res) => {
  const body = req.body;
  try {
    let updated = await prisma.insurancetype.update({
      where: {
        id: body.id,
      },
      data: {
        name: body.name,
      },
    });

    if (!updated) {
      return res.status(404).send({
        message: `Failed to save ${body.name}`,
      });
    }

    return res.send({
      result: "OK",
      message: "Success",
    });
  } catch (error) {
    return res.status(500).send({
      result: "ERROR",
      message: error.message,
    });
  }
});

router.post("/insurance/type/delete/:id", async (req, res) => {
  const id = req.params.id;
  try {
    let updated = await prisma.insurancetype.update({
      where: {
        id: Number(id),
      },
      data: {
        status: 'HIDDEN',
        deleted: true,
      },
    });

    if (!updated) {
      return res.status(404).send({
        message: `Failed to delete ${id}`,
      });
    }

    return res.send({
      result: "OK",
      message: "Success",
    });
  } catch (error) {
    return res.status(500).send({
      result: "ERROR",
      message: error.message,
    });
  }
});

router.get("/insurance/packages", async (req, res) => {
  try {
    let items = await prisma.insurancepackage.findMany({
      where: {
        status: "ACTIVE",
      },
    });

    if (!items) {
      return res.status(404).send({
        message: "Insurance packages not found",
      });
    }

    return res.send(items);
  } catch (error) {
    return res.status(500).send({
      result: "ERROR",
      message: error.message,
    });
  }
});

router.post("/insurance/package/add", async (req, res) => {
  try {
    const created = await prisma.insurancepackage.create({
      data: {
        insurancetype_id: Number(req.body.insurance),
        employee_id: Number(1),//req.user.id,
        name: req.body.name,
        price: Number(req.body.price),
        period: Number(req.body.period),
        currency: 'LAK',
        terms: 'unknown',
      },
    });

    if (!created) {
      return res.status(404).send({
        message: "Can't add new package",
      });
    }

    return res.send(created);
  } catch (error) {
    return res.status(500).send({
      result: "ERROR",
      message: error.message,
    });
  }
});

router.post("/insurance/package/save", async (req, res) => {
  const body = req.body;
  try {
    let updated = await prisma.insurancepackage.update({
      where: {
        id: body.id,
      },
      data: {
        name: body.name,
        price: Number(body.price),
        period: Number(body.period),
      },
    });

    if (!updated) {
      return res.status(404).send({
        message: `Failed to save ${body.name}`,
      });
    }

    return res.send({
      result: "OK",
      message: "Success",
    });
  } catch (error) {
    return res.status(500).send({
      result: "ERROR",
      message: error.message,
    });
  }
});

router.post("/insurance/package/delete/:id", async (req, res) => {
  const id = req.params.id;
  try {
    let updated = await prisma.insurancepackage.update({
      where: {
        id: Number(id),
      },
      data: {
        status: 'HIDDEN',
      },
    });

    if (!updated) {
      return res.status(404).send({
        message: `Failed to delete ${id}`,
      });
    }

    return res.send({
      result: "OK",
      message: "Success",
    });
  } catch (error) {
    return res.status(500).send({
      result: "ERROR",
      message: error.message,
    });
  }
});

router.get("/app/menu", async (req, res) => {
  try {
    let menus = await prisma.menu.findMany();

    if (!menus) {
      return res.status(404).send({
        message: "Menus not found",
      });
    }

    return res.send({
      result: "OK",
      message: "Success",
      menus,
    });
  } catch (error) {
    return res.status(500).send({
      result: "ERROR",
      message: error.message,
    });
  }
});

router.put("/app/menu", async (req, res) => {
  const body = req.body
  try {
    let updated = await prisma.menu.update({
      where: {
        id: Number(body.id),
      },
      data: {
        icon: body.icon,
      },
    });

    if (!updated) {
      return res.status(404).send({
        message: `Failed to updated ${body.id}`,
      });
    }

    return res.send({
      result: "OK",
      message: "Success",
    });
  } catch (error) {
    return res.status(500).send({
      result: "ERROR",
      message: error.message,
    });
  }
});

router.get("/countries", async (req, res) => {
  try {
    const items = await prisma.country.findMany();
    return res.send(items);
  } catch (e) {
    return res.status(500).send({message: e.message});
  }
});

router.get("/provinces", async (req, res) => {
  try {
    const items = await prisma.province.findMany();
    return res.send(items);
  } catch (e) {
    return res.status(500).send({message: e.message});
  }
});

router.get("/hospitals", async (req, res) => {
  try {
    const hospitals = await prisma.hospital.findMany({
      where: {
        deleted: false
      }
    });
    return res.send(hospitals);
  } catch (e) {
    return res.status(500).send({message: e.message});
  }
});

router.post("/hospital/create", async (req, res) => {
  const body = req.body;
  //TODO: validate req
  try {
    const created = await prisma.hospital.create({
      data: {
        hospitaltype: body.type,
        name: body.name,
        address: body.address,
        tel: body.tel,
        lat: body.lat,
        lng: body.lng,
        images: body.images,
        employee_id: Number(1)
      }
    });

    if (!created) {
      return res.status(404).send({
        message: `Create service locations failed`,
      });
    }

    return res.send(created);
  } catch (e) {
    return res.status(500).send({message: e.message});
  }
});

router.get("/hospital/:id", async (req, res) => {
  try {
    const hospital = await prisma.hospital.findFirst({
      where: {
        id: Number(req.params.id)
      }
    });

    if (!hospital) {
      return res.status(404).send({
        message: `Hospital locations not found`,
      });
    }

    return res.send(hospital);
  } catch (e) {
    return res.status(500).send({message: e.message});
  }
});

router.post("/hospital/delete/:id", async (req, res) => {
  const id = req.params.id;
  try {
    let updated = await prisma.hospital.update({
      where: {
        id: Number(id),
      },
      data: {
        deleted: true,
      },
    });

    if (!updated) {
      return res.status(404).send({
        message: `Failed to delete ${id}`,
      });
    }

    return res.send({
      result: "OK",
      message: "Success",
    });
  } catch (error) {
    return res.status(500).send({
      result: "ERROR",
      message: error.message,
    });
  }
});

router.get("/servicelocations", async (req, res) => {
  try {
    const serviceLocations = await prisma.servicelocation.findMany({
      where: {
        deleted: false
      }
    });

    if (!serviceLocations) {
      return res.status(404).send({
        message: `Service locations not found`,
      });
    }

    return res.send(serviceLocations);
  } catch (e) {
    return res.status(500).send({message: e.message});
  }
});

router.get("/servicelocation/:id", async (req, res) => {
  try {
    const serviceLocation = await prisma.servicelocation.findFirst({
      where: {
        id: Number(req.params.id)
      }
    });

    if (!serviceLocation) {
      return res.status(404).send({
        message: `Service locations not found`,
      });
    }

    return res.send(serviceLocation);
  } catch (e) {
    return res.status(500).send({message: e.message});
  }
});

router.post("/servicelocation/create", async (req, res) => {
  const body = req.body;
  //TODO: validate req
  try {
    const created = await prisma.servicelocation.create({
      data: {
        name: body.name,
        address: body.address,
        tel: body.tel,
        lat: body.lat,
        lng: body.lng,
        images: body.images
      }
    });

    if (!created) {
      return res.status(404).send({
        message: `Create service locations failed`,
      });
    }

    return res.send(created);
  } catch (e) {
    return res.status(500).send({message: e.message});
  }
});

router.post("/servicelocation/update", async (req, res) => {
  const body = req.body;
  //TODO: validate req
  try {
    const updated = await prisma.servicelocation.update({
      where: {
        id: Number(body.id)
      },
      data: {
        name: body.name,
        address: body.address,
        tel: body.tel,
        lat: body.lat,
        lng: body.lng,
        images: body.images
      }
    });

    if (!updated) {
      return res.status(404).send({
        message: `Updated service locations failed`,
      });
    }

    return res.send(updated);
  } catch (e) {
    return res.status(500).send({message: e.message});
  }
});

router.post("/hospital/update", async (req, res) => {
  const body = req.body;
  //TODO: validate req
  try {
    const updated = await prisma.hospital.update({
      where: {
        id: Number(body.id)
      },
      data: {
        hospitaltype: body.type,
        name: body.name,
        address: body.address,
        tel: body.tel,
        lat: body.lat,
        lng: body.lng,
        images: body.images
      }
    });

    if (!updated) {
      return res.status(404).send({
        message: `Updated hospital failed`,
      });
    }

    return res.send(updated);
  } catch (e) {
    return res.status(500).send({message: e.message});
  }
});

router.post("/servicelocation/delete/:id", async (req, res) => {
  const id = req.params.id;
  try {
    let updated = await prisma.servicelocation.update({
      where: {
        id: Number(id),
      },
      data: {
        deleted: true,
      },
    });

    if (!updated) {
      return res.status(404).send({
        message: `Failed to delete ${id}`,
      });
    }

    return res.send({
      result: "OK",
      message: "Success",
    });
  } catch (error) {
    return res.status(500).send({
      result: "ERROR",
      message: error.message,
    });
  }
});

router.post("/upload", uploader.single(), async (req, res) => {
  try {
    return res.send({
      uid: uuid.v1(),
      name: req.files.file[0].filename,
      status: 'success',
      url: `${req.protocol}://${req.headers.host}/${req.files.file[0].path}`.replace('uploads', 'public'),
    });
  } catch (e) {
    return res.status(500).send({message: e.message});
  }
});

module.exports = router;
