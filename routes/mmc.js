const express = require("express");
const router = express.Router();

router.get("/getversions", async (req, res) => {
  return res.json({
    web: "1.0.0+1",
    app: "1.0.0+4",
  });
});

router.get("/getmenus", async (req, res) => {
  try {
    const username = req.query["username"];
    const appurl = `https://ecard-loto.web.app/#`;
    let items = [
      {
        title: "ຊ໋ອບປິ້ງ",
        url: `${appurl}/shopping?app=mmc`,
        icon: "http://appsource.amazonlao.com:8000/images/mmc/shopping.png",
        iswebview: true,
        isneedlogin: false,
      },
      {
        title: "ໂປຣໂມຊັນ",
        url: `${appurl}/promotions?app=mmc`,
        icon: "http://appsource.amazonlao.com:8000/images/mmc/promotion.png",
        iswebview: true,
        isneedlogin: false,
      },
      {
        title: "ຂ່າວສານ",
        url: `${appurl}/news?app=mmc`,
        icon: "http://appsource.amazonlao.com:8000/images/mmc/news.png",
        iswebview: true,
        isneedlogin: false,
      },
    ];
    if (username != "2054931221") {
      items = [
        {
          title: "ຊື້ເລກ",
          url: `${appurl}/buy?app=mmc`,
          icon: "http://appsource.amazonlao.com:8000/images/mmc/lottery.png",
          iswebview: true,
          isneedlogin: true,
        },
        {
          title: "ປະຫວັດການຊື້ເລກ",
          url: `${appurl}/buyhistory?app=mmc`,
          icon: "http://appsource.amazonlao.com:8000/images/mmc/history.png",
          iswebview: true,
          isneedlogin: true,
        },
        {
          title: "ເລກອອກຜ່ານມາ",
          url: `${appurl}/resulthistory?app=mmc`,
          icon: "http://appsource.amazonlao.com:8000/images/mmc/lotterytime.png",
          iswebview: true,
          isneedlogin: true,
        },
        {
          title: "ເລກເດັດ",
          url: `${appurl}/goodnumber?app=mmc`,
          icon: "https://cdn-icons-png.flaticon.com/512/709/709337.png",
          icon: "http://appsource.amazonlao.com:8000/images/mmc/lekdet.png",
          iswebview: true,
          isneedlogin: true,
        },
        {
          title: "ຊ໋ອບປິ້ງ",
          url: `${appurl}/shopping?app=mmc`,
          icon: "http://appsource.amazonlao.com:8000/images/mmc/shopping.png",
          iswebview: true,
          isneedlogin: false,
        },
      ];
    }
    return res.json(items);
  } catch (e) {
    return res.status(500).send({ message: e.message, e: e });
  }
});

router.get("/getproduct/:id", async (req, res) => {
  try {
    const id = Number(req.params["id"]);
    const p = products[id];
    if (!p) {
      return res.status(404).send({ message: "Not found" });
    }
    return res.json(p);
  } catch (e) {
    return res.status(500).send({ message: e.message, e: e });
  }
});

router.post("/buyproduct", async (req, res) => {
  try {
    const id = Number(req.body["id"]);
    const item = req.body["item"];
    return res.json({
      id: id,
      item: item,
    });
  } catch (e) {
    return res.status(500).send({ message: e.message, e: e });
  }
});

router.get("/getsliders", async (req, res) => {
  return res.send([
    "https://img.freepik.com/free-photo/musician-playing-piano-jazz-day_23-2149324191.jpg?w=2000&t=st=1667314568~exp=1667315168~hmac=3ce18528df36168c90a930c7aca8a4bd2886ef7a24ae9307f419d904217ad00c",
    "https://img.freepik.com/free-vector/world-music-day-gradient-background_23-2149397900.jpg?w=2000&t=st=1667314596~exp=1667315196~hmac=e96f45750192c21a0a49483da9e2e1609d23899188ce7afa7236ef16774b0e1f",
    "https://img.freepik.com/free-photo/asian-man-with-acoustic-guitar-during-sunset_1150-18982.jpg?w=2000&t=st=1667314624~exp=1667315224~hmac=d4eb526caeda54afbc813b6c99569998cd851be4e0300c5fd35bf1d5bf38a405",
    "https://img.freepik.com/free-photo/drummer-plays-snare-drum-with-splashing-water_169016-14187.jpg?w=2000&t=st=1667314691~exp=1667315291~hmac=a547969f00218aa76c5bb0be615953df869b76be502eb171ac59ddb203070130",
    "https://img.freepik.com/free-photo/wooden-table-there-are-musical-keys-acoustic-guitar-bass-guitar-sound-mixer-headphones-computer-drum-sticks_169016-9505.jpg?w=2000&t=st=1667316332~exp=1667316932~hmac=4ee7a01f88c8e429310e2c2d8c774c404b266711bac36ff5505ad078f4bc333a",
    "https://img.freepik.com/free-photo/microphone-mixer_1921-180.jpg?w=2000&t=st=1667316404~exp=1667317004~hmac=8bbbfaae5996ec2086c841c112cf7c3796966e1528954fb139c8de45bb30f845",
  ]);
});

router.get("/getproducts", async (req, res) => {
  try {
    return res.json([
      {
        name: "Yamaha acoustic guitar",
        price: "1.700.000",
        image:
          "https://firebasestorage.googleapis.com/v0/b/sinxai-255ac.appspot.com/o/WhatsApp%20Image%202022-10-20%20at%201.59.31%20PM%20(1).jpeg?alt=media&token=12aeb2df-b4b0-40b9-9384-64b7f66a8897",
        desc: `•	ຍີຫໍ yamaha
    •	ຊື່: F310
    •	ສີ ເປັນສີໄມ້  
    •	ລຳຕົວ ເປັນຊົງດັງເດີມແບບຕາເວັນຕົກ
    •	ໄມ້ຫນ້າເປັນສະປູຣດ (spruce)
    •	ດ້ານຂ້າງ ແລະ ດ້ານຫລັງເປັນໄມ້ ເມີລັນຕິກ(meranti)
    •	ຄໍເປັນໄມ້ ນາໂຕ້
    •	Fingerboard ແລະBridgeໄມ້ດູ່
    •	Nut ແລະ Saddle ເປັນ ຢູເຣນຽມ
    •	Pic guard ສີດຳ
    •	ລູກບິດດ້ານຫລັງກົມເຄືອບໂດຍ ໂຄຣມຽ້ນ
    •	ຄວາມຍາວຂອງສາຍກີຕ້າ 25 ນິວ
    •	ຄອບໄບດິ້ງສີດຳ
    •	ລຳໂຕເຄືອບເງົາ ຄໍເຄືອບດ້ານ 
    •	ຄວາມຍາວ505mm (19 7/8″)
    •	ຄວາມກວ້າງ 412mm (16 1/4″)
    •	ຄວາມກ້ວາງ Nut 43 ມມ (1 11/16”)`,
      },
      {
        name: "Yamaha acoustic guitar",
        price: "2.900.000",
        image:
          "https://firebasestorage.googleapis.com/v0/b/sinxai-255ac.appspot.com/o/WhatsApp%20Image%202022-10-20%20at%201.59.32%20PM%20(1).jpeg?alt=media&token=2988e0a2-a2a9-4a24-ad2d-24a4173085e3",
        desc: `•	ຍີຫໍ yamaha
    •	ຊື່: F310P ສີ ເປັນສີໄມ້ 
    •	ສີ: ສີໄມ້ 
    •	ລຳຕົວ ເປັນຊົງດັງເດີມແບບຕາເວັນຕົກ
    •	ໄມ້ຫນ້າເປັນສະປູຣດ (spruce) 
    •	ດ້ານຂ້າງ ແລະ ດ້ານຫລັງເປັນໄມ້ ເມີລັນຕິກ(meranti)
    •	ຄໍເປັນໄມ້ ນາໂຕ້
    •	Fingerboard ແລະBirdgeໄມ້ດູ່
    •	Nut ແລະ Saddle ເປັນ ຢູເຣນຽມ
    •	Pic guard ສີດຳ
    •	ລູກບິດດ້ານຫລັງກົມເຄືອບໂດຍ ໂຄຣມຽ້ນ
    •	ຄວາມຍາວຂອງສາຍກີຕ້າ 25 ນິວ
    •	ຄອບໄບດິ້ງສີດຳ
    •	ລຳໂຕເຄືອບເງົາ ຄໍເຄືອບດ້ານ 
    •	ຂະໜາດສາຍກີ ເບີ 10
    •	ຄວາມຍາວ505mm (19 7/8″)
    •	ຄວາມ ກວ້າງ 412mm (16 1/4″)
    •	ຄວາມກ້ວາງ Nut 43 ມມ (1 11/16”)`,
      },
      {
        name: "Yamaha Classical Guitar",
        price: "3.000.000",
        image:
          "https://firebasestorage.googleapis.com/v0/b/sinxai-255ac.appspot.com/o/WhatsApp%20Image%202022-10-20%20at%201.59.32%20PM.jpeg?alt=media&token=399ca47e-1287-41f8-8091-32bb5a21b18f",
        desc: `•	ຍີຫໍ yamaha
    •	ຊື່: Yamaha CX40
    •	ສີ:ນໍ້າຕານແດງ
    •	ກີຕ້າຄລາດສິກໄຟຟ້າ
    •	ໄມ້ດ້ານຫນ້າເປັນ Spruce
    •	ດ້ານແລະດ້ານຫຼັງຂອງ meranti
    •	ຄໍເປັນໄມ້ເນໂຕ້
    •	Fingerboard ໄມ້ດູ່
    •	Bridgeເປັນໄມ້ດູ່
    •	ຄວາມໜາຂອງກີຕ້າແມ່ນ 94-100 ມມ.
    •	ຄວາມກວ້າງຂອງຄໍ 52 ມມ.
    •	ຂະໜາດຄວາມຍາວ 650 ມມ.
    •	ພາຍນອກເເມ່ນເຄືອບເງົາ
    •	ລະບົບໄຟຟ້າລຸ້ນ CP-200 ( Mono way)
    `,
      },
      {
        name: "Yamaha acoustic guitar",
        price: "1,200,000",
        image:
          "https://firebasestorage.googleapis.com/v0/b/sinxai-255ac.appspot.com/o/WhatsApp%20Image%202022-10-20%20at%201.59.33%20PM.jpeg?alt=media&token=ab8fc2d4-27a4-4c0a-8bec-e8d3c797c842",
        desc: `	•	ຍີຫໍ:Yamaha
    •	ຊື່ FS-100C
    •	ຄວາມຍາວຂອງສາຍ 634 ມມ ຫລື 25 ນິວ 
    •	ຕວາມຍາວຂອງລຳຕົວ 474 ມມ 
    •	ຄວາມຍາວທັ້ງຫມົດ1021 ມມ 
    •	ຄວາມກ້ວາງຂອງລຳຕົວ380ມມ
    •	ດ້ານຂ້າງ ແລະ ດ້ານຫລັງ ເປັນໄມ້ ດູ
    •	ຄໍ ເປັນໄມ້ນາໂຕ້
    •	Fingerboard  ແລະ Bridgeເປັນໄມ້ດູ່
    •	Nuts and saddlesແມ່ນເຮັດຈາກຢູເຣນຽມ
    •	ລູກບິດ ເຮັດດ້ວຍເຫລັກຫຈຸມ chrome
    •	ຂອບກີຕາສີດຳ
    •	Pic guard ສີດຳ
    •	ລຳຕົວເຄືອບເງົາ ຄໍເຄືອບດ້ານ`,
      },
      {
        name: "yamaha Bass",
        price: "4.500.000",
        image:
          "https://firebasestorage.googleapis.com/v0/b/sinxai-255ac.appspot.com/o/WhatsApp%20Image%202022-10-20%20at%201.59.31%20PM.jpeg?alt=media&token=e6f079c0-637e-4f28-b33d-fe669b339307",
        desc: `•	ຊື່Yamaha TRBX305  Basses 
    •	ມີ 5 ສາຍ ລໍາຕົວຊົງ TRBX 
    •	ຕົວເປັນໄມ້ ຮອກການີ 5ອັນ ປະກອບກັນ 
    •	ລູກບິດ Die-cast
    •	Fingerboard ໄມ້ ໂຣດວູດ
    •	24 ເຟຮດ 
    •	ຄວາມຍາວສະເກວ 34ນິ້ວ
    •	ປິກອັບຄໍ M3 Ceramic Dual-coil Humbucker
    •	ປຸມຄອນໂທຣ ແບຣນ 1Volume, 1 Balance, Active EQ 2  ສະວິກ EQ 5ທາງ`,
      },
      {
        name: "yamaha mixer",
        price: "2.500.000",
        image:
          "https://firebasestorage.googleapis.com/v0/b/sinxai-255ac.appspot.com/o/WhatsApp%20Image%202022-10-20%20at%201.59.29%20PM%20(1).jpeg?alt=media&token=d3e9c611-3d75-43ce-8ca0-c724bbe4c665",
        desc: `•	ຊື:  yamaha mixer MGO6X 
    •	 ເປັນມິກເຊີທີມີ input 6 ຊ່ອງ
    •	ສາມາດຕໍໄມ້ໂຄຣໂຟນສູງສຸດໄດ້2 ໂຕ ລວມທັ້ງຫມົດ 6 input ໂດຍແບ່ງ ເປັນຊ່ອງ 2 ໂມໂນ 2 ສະເຕີລິໂອ
    •	ຊ່ອງຕໍສັນຍານອອກ 2 ສະເຕລິໂອ
    •	ມີລະບົບເອັຟເຟັກ SPX 6 ໂປຣແກຣມ
    •	ມີ PAD ສະວິກ ທຸກໆຊ່ອງໂມໂນ
    •	ມີໄຟລ້ຽງ +48 V ສຳລັບໄມ້ ໂຄຮໂຟນ 
    •	ມີຊອ່ງຕໍສັນຍານອອກແບບ XLR
    •	ໂຕເຄື່ອງເປັນໂລຫະ
    •	ຂະໜາດ 149 x 62 x 202 ມມ.
    •	ນໍ້າໜັກ 0.9 kg`,
      },
      {
        name: "Yamaha mixer",
        price: "6.000.000",
        image:
          "https://firebasestorage.googleapis.com/v0/b/sinxai-255ac.appspot.com/o/WhatsApp%20Image%202022-10-20%20at%201.59.30%20PM%20(2).jpeg?alt=media&token=fb44df22-2afe-4812-81ce-05dae3568598",
        desc: `•	ຊື:  MG10XU 
    •	 ເປັນມິກເຊີທີມີ input 10 ຊ່ອງ
    •	ສາມາດຕໍໄມ້ໂຄຣໂຟນ ສູງສຸດໄດ້ເຖິງ 4 ໄມ້ ລວມທັ້ງໝົດ 10 Input ໂດຍແບ່ງເປັນ 4 ຊ່ອງໂມໂນ 3ຊອງສະເຕຣີໂອ
    •	ຊ່ອງຕໍສັນຍານອອກ 1 ສະເຕຣິໂອ
    •	ມີຊ່ອງຕໍສັນຍານ1 AUX (ຮ່ວມFX)
    •	ມີລະບົບ D-PRE ໄມ້preamp ດ້ວຍວົງຈອນກັບຂອງDarlington
    •	ມີ compressor ແບບ 1Konb
    •	ມີລະບົບເອຟເຟັກ SPX 24 ໂປຣແກຣມ
    •	ຟັງຊັ້ນສຽງ24 bit]}}/19 KHz2in /2out USB
    •	ສາມາດຕໍເຂົ້າ iPadໄດ້ ໂດຍໃຊ້ iPad Connection Kit.
    •	ມີເວີຊັນດາວໂຫຼດຊອບແວ Cubase Al DAW.
    •	ມີປຸ່ມ PAD ສຳ ລັບທຸກໆຊ່ອງໂມໂນ
    •	ມີໄຟລຽງ+48 V ສຳ ລັບໄມໂຄຄອນເຊີ
    •	ມີຊອ່ງຕໍ່ ສັນຍານອອກແບບXLR,ສາມາດໃຊ້ກັບລະບົບ
    ໄຟຟ້າໄດ້ທົວໂລກ
    •	ຕົວເຄື່ອງເປັນໂລຫະຂະໜາດ244*71*294
    •	ນໍ້າໜັກ2.1 kg
    `,
      },
      {
        name: "Yamaha mixer",
        price: "12.500.000",
        image:
          "https://firebasestorage.googleapis.com/v0/b/sinxai-255ac.appspot.com/o/WhatsApp%20Image%202022-10-20%20at%201.59.30%20PM.jpeg?alt=media&token=49735e52-283e-479d-be55-5ab9838f3883",
        desc: `	•	ຊື່ MG16XU
    •	ມີມິກເຊີ 16 ຊ່ອງ
    •	ຊ່ອງຕໍ່ສັນຍານແບບ D-Pre
    •	ລະບົບ ໂມໂນ 8 ຊ່ອງ, ລະບົບ stereo 4 ຊ່ອງ
    •	ຊ່ອງ output ແບບ XLR ແລະ TRS
    •	ຊ່ອງສຽງ USBແບບ 24-bit 
    •	ເຮັດວຽກຮ່ວມກັບ iPad2 ຂື້ນໄປ
    •	ເອຟເຟັກ SPX ຟຖ ແບບ
    •	ມີລະບົບ Cubase AI
    •	ຊ່ອງສັນຍານອອກຊະນິດ 2 AUX (ລວມ FX)
    •	ມີລະບົບ D-PRE ໄມ້preamp ດ້ວຍວົງຈອນກັບຂອງDarlington
    •	ມັນມີລະບົບ compressor 1- Knob
    •	ມີສະວິດ PAD ສໍາລັບຊ່ອຕໍ່ສັນຍານໂມໂນ
    •	ສາມາດໃຊ້ກັບລະບົບໄຟຟ້າໄດ້້ທົ່ວໂລກ
    •	ຂະໜາດຕົວເຄື່ອງ 5.1 x 10.5 x 19.7 ນິ້ວ ,ນໍ້າໜັກ 9.5kg
    `,
      },
      {
        name: "Yamaha mixer",
        price: "13.000.000",
        image:
          "https://firebasestorage.googleapis.com/v0/b/sinxai-255ac.appspot.com/o/WhatsApp%20Image%202022-10-20%20at%201.59.30%20PM.jpeg?alt=media&token=49735e52-283e-479d-be55-5ab9838f3883",
        desc: `•	ຊື: EMX 5
    •	ພາວເວີ ມິກເຊີ 12ອິນພຸດN 
    •	ຊ່ອງສຽງແບບ XLR 12ຊ່ອງ
    •	ຊ່ອງສຽງ ແບບTS stereo 2 ຊ່ອງ
    •	ຊ່ອງສຽງແບບRCA stereo 2 ຊ່ອງ
    •	EQ ສາມາດປັບໄດ້ 3 ແຖບສຽງ
    •	ລະບົບເອຟເຟັກ SPX 24 ແບບ
    •	ມີລະບົບ Master EQ ຢູ່ໃນ 1 ປຸ່ມ
    •	ມີລະບົບປ້ອງກັນFeedback
    •	Speak processor ພ້ອມດ້ວຍ preset
    •	ກຳລັງໄຟ 630-460 ວັດ
    •	ແຮງຕ້ານໄຟ 4-8 ໂອມ
    •	ສາມາດເຊື່ອມຕໍ່ໄມໂຄຣໂຟນ ແລະ MP3 ໄດ້
    `,
      },
      {
        name: "Yamaha powered speaker",
        price: "13.000.000",
        image:
          "https://firebasestorage.googleapis.com/v0/b/sinxai-255ac.appspot.com/o/WhatsApp%20Image%202022-10-20%20at%201.59.25%20PM%20(1).jpeg?alt=media&token=0033061c-2d14-4d03-9fb4-0b137d151dd7",
        desc: `•	ຊື: EMX 5
    •	ພາວເວີ ມິກເຊີ 12ອິນພຸດN 
    •	ຊ່ອງສຽງແບບ XLR 12ຊ່ອງ
    •	ຊ່ອງສຽງ ແບບTS stereo 2 ຊ່ອງ
    •	ຊ່ອງສຽງແບບRCA stereo 2 ຊ່ອງ
    •	EQ ສາມາດປັບໄດ້ 3 ແຖບສຽງ
    •	ລະບົບເອຟເຟັກ SPX 24 ແບບ
    •	ມີລະບົບ Master EQ ຢູ່ໃນ 1 ປຸ່ມ
    •	ມີລະບົບປ້ອງກັນFeedback
    •	Speak processor ພ້ອມດ້ວຍ preset
    •	ກຳລັງໄຟ 630-460 ວັດ
    •	ແຮງຕ້ານໄຟ 4-8 ໂອມ
    •	ສາມາດເຊື່ອມຕໍ່ໄມໂຄຣໂຟນ ແລະ MP3 ໄດ້
    `,
      },
      {
        name: "Yamaha powered speaker",
        price: "12.800.000",
        image:
          "https://firebasestorage.googleapis.com/v0/b/sinxai-255ac.appspot.com/o/WhatsApp%20Image%202022-10-20%20at%201.59.25%20PM%20(2).jpeg?alt=media&token=f8846be8-6ace-4854-b688-6122f7882eea",
        desc: `	•	ຊື: DXR8
    •	ລຳ ໂພງ  18 ນິ້ວ ແບບ Dual 2 ທາງ 
    •	ລຳ ໂພງ Bi-amp powered ປະເພດ Bass-Reflex
    •	ຊ່ວງຄວາມຖີ່ 57Hz - 20kHz
    •	ໄດເວີ LF ຂະໜາດ 15 ນິ້ວ
    •	ໄດເວີ HF ຂະ ໜາດ 1.4 ນິ້ວ 
    •	LFພາເວີແອັມ  600 ວັດ (RMS)
    •	 HFພາເວີແອັມ  100 ວັດ (RMS) 
    •	ພະລັງງານທັງໝົດ 700 ວັດ
    •	ຊ່ອງ input XLR, RCA ແລະ ແຈັກ
    •	ຊ່ອງ output ແບບ XLR
    •	ຄ່າ SPL ສູງສຸດ 129dB 
    •	ຂະ ໜາດ 280 x 458 x 280 ມມ.
    •	ນໍ້າໜັກ 22.5 ກກ.
    `,
      },
      {
        name: "Yamaha powered speaker",
        price: "14.000.000",
        image:
          "https://firebasestorage.googleapis.com/v0/b/sinxai-255ac.appspot.com/o/WhatsApp%20Image%202022-10-20%20at%201.59.25%20PM.jpeg?alt=media&token=029b38a8-c913-40fe-8633-393f75c8398b",
        desc: `	•	ຊື: DXR10
    •	ລຳ ໂພງ  18 ນິ້ວ ແບບ Dual 2 ທາງ
    •	ລຳ ໂພງ Bi-amp powered ປະເພດ Bass-Reflex
    •	ຊ່ວງຄວາມຖີ່ 57Hz - 20kHz
    •	LFໄດເວີ ຂະໜາດ 10 ນິ້ວ 
    •	HFໄດເວີ ຂະ ໜາດ 1.4 ນິ້ວ 
    •	LFພາເວີແອັມ  600 ວັດ (RMS)
    •	 HFພາເວີແອັມ  100 ວັດ (RMS) 
    •	ພະລັງງານທັງໝົດ 700 ວັດ 
    •	ຊ່ອງ input XLR, RCA ແລະ ແຈັກ
    •	ຊ່ອງ output ແບບ XLR
    •	ຄ່າ SPL ສູງສຸດ 131dB
    •	ຂະ ໜາດ 305 x 502 x 310 ມມ.
    •	ນໍ້າໜັກ 14.6 ກກ.
    `,
      },
      {
        name: "Yamaha powered speaker",
        price: "13.000.000",
        image:
          "https://firebasestorage.googleapis.com/v0/b/sinxai-255ac.appspot.com/o/WhatsApp%20Image%202022-10-20%20at%201.59.26%20PM%20(1).jpeg?alt=media&token=cde219c6-0c97-40de-b696-846ab74d9379",
        desc: `•	ຊື: DXR12
    •	ລຳ ໂພງ  18 ນິ້ວ ແບບ Dual 2 ທາງ
    •	ລຳ ໂພງ Bi-amp powered ປະເພດ Bass-Reflex
    •	ຊ່ວງຄວາມຖີ່ 57Hz - 20kHz
    •	LFໄດເວີ ຂະໜາດ 15 ນິ້ວ
    •	HFໄດເວີ ຂະ ໜາດ 1.4 ນິ້ວ 
    •	LFພາເວີແອັມ  600 ວັດ (RMS) 
    •	 HFພາເວີແອັມ  100 ວັດ (RMS) 
    •	ພະລັງງານທັງໝົດ 700 ວັດ
    •	ຊ່ອງ input XLR, RCA ແລະ ແຈັກ
    •	ຊ່ອງ output ແບບ XLR
    •	ຄ່າ SPL ສູງສຸດ 132 dB
    •	ຂະ ໜາດ 362 x 601x 350 ມມ.
    •	ນໍ້າໜັກ 29.3 ກກ
    `,
      },
      {
        name: "Yamaha powered speaker",
        price: "16.500.000",
        image:
          "https://firebasestorage.googleapis.com/v0/b/sinxai-255ac.appspot.com/o/WhatsApp%20Image%202022-10-20%20at%201.59.26%20PM.jpeg?alt=media&token=895173fb-fec7-4cb6-b8b4-ed53145e59bb",
        desc: `	•	ຊື: DXR15
    •	ບຸບເຟີ ຂະໜາດ 15 ນິ້ວ
    •	ລຳ ໂພງແບບໂຄນ ຂະໜາດ15 ນິ້ວລຳໂພງແບບ Voice coil ຂະໜາດ 2.5 ນິ້ວ
    •	ຊ່ວງຄວາມຖີ່ 40Hz - 150Hz
    •	ຄ່າ Dynamic 1020w/continuous 800w
    •	ຄວາມຖີ່ 40Hz-150Hz
    •	ຊ່ອງຕໍ່ Input ແບບ LR-3-31x2,THRU:XL3-32x2
    •	ລະບົບProcessors D-XSUB:BOOST,xtended-lfnormal
    •	ລະບົບ Cooling Natural convection
    •	ການໃຊ້ໄຟຟ້າ 100V-240V,50HZ/60Hz
    •	ພະລັງງານທັງໝົດ 1020 ວັດ
    •	ຊ່ອງ input ແລະ  output ແບບ XLR
    •	ຄ່າ SPL ສູງສຸດ 135 dB
    •	ຂະ ໜາດ 460 x 611x 614 ມມ.
    •	ນໍ້າໜັກ 30 ກກ
    `,
      },
      {
        name: "Yamaha subwoofer",
        price: "12.500.000",
        image:
          "https://firebasestorage.googleapis.com/v0/b/sinxai-255ac.appspot.com/o/WhatsApp%20Image%202022-10-20%20at%201.59.27%20PM.jpeg?alt=media&token=508a232f-52c4-4607-8337-840fd5c17e11",
        desc: `	•	ຊື:powered subwoofer DXS12 
    •	ລຳໂພງຊັບເບດ ມິແອັມໃນຕົວ ລຳໂພງຂະໜາດ12ນິ້ວ
    •	ກຳລັງຂັບ1020w/continuous 800w Class-D amplifier, Band-Pass Type Enclosure, D-XSUB Bass Processing, Selectable X-Over 80/100/120 Hz
    `,
      },
      {
        name: "Yamaha subwoofer",
        price: "25.000.000",
        image:
          "https://firebasestorage.googleapis.com/v0/b/sinxai-255ac.appspot.com/o/WhatsApp%20Image%202022-10-20%20at%201.59.28%20PM.jpeg?alt=media&token=e23776be-6117-4c64-81b0-73c95f515e2d",
        desc: `	•	ຊື:powered subwoofer DXS18
    •	ກຳລັງໄຟ18 ວັດ
    •	ພາເວີແອັມ class-D
    •	ຄືີນຄວາມຖີ່ 32-120Hz
    •	ຄວາມຖີ່ທີເລືອກກໄດ້ຈາກ x-OVER 3ລະດັບ 80/100/120Hz
    •	Polemount ຂະໜາດ 35 ມມ
    •	Input ລະ output ແບບ XLR
    •	ຂະໜາດ 563x683x721ມມ
    •	ນໍ້າໜັກ 47.7ກກ`,
      },
      {
        name: "Yamaha subwoofer",
        price: "13.500.000",
        image:
          "https://firebasestorage.googleapis.com/v0/b/sinxai-255ac.appspot.com/o/WhatsApp%20Image%202022-10-20%20at%201.59.29%20PM.jpeg?alt=media&token=718168d1-227e-4b25-8e22-45c7ee9d807d",
        desc: `	•	ຊື:  STAGEPAS 400BT 
    •	ກຳລັງໄຟຟ້າ 680W (340W + 340W)
    •	ລຳໂພງ LFຂະໜາດ 10 ນິ້ວແລະລຳໂພງ HFຂໜາດ 4 ນິ້ວ
    •	output 10 ຊ່ອງ
    •	ການຖ່າຍທອດສຽງ Bluetooth
    •	1-Knob Master EQ ດ້ວຍການເພີ່ມສຽງເບດສະເໝືອນຈິງ
    •	ເອັຟເຟັກ reverb ດິຈິຕອນທີ່ມີຄວາມລະອຽດ SPX
    •	3 ຊ່ອງ EQ ຂະຫນາດໃຫຍ່
    •	ຊ່ອງ input ແບບສະເຕຣິໂອ ແລະໂມໂນ
    •	Input Hi-Z (ຄວາມຕ້ານທານສູງ)
    •	ໃຊ້ພະລັງງານ Phantom
    •	ມີຕົວເຊື່ອມຕໍ່ສໍາລັບຈໍແລະ subwoofer.
    •	ຕົວເລືອກ Reverb Modulator`,
      },
      {
        name: "Yamaha subwoofer",
        price: "3.900.000",
        image:
          "https://firebasestorage.googleapis.com/v0/b/sinxai-255ac.appspot.com/o/WhatsApp%20Image%202022-10-20%20at%201.59.25%20PM%20(1).jpeg?alt=media&token=0033061c-2d14-4d03-9fb4-0b137d151dd7",
        desc: `	•	ຊື່ sonogenic SHS-500RD  
    •	ມີຟັງຊັນ JMA 
    •	ມີ 48 ໂນດ 
    •	ມີ 30 ສຽງຄຸນນະພາບສູງ 
    •	ການເຊື່ອມຕໍ່ MIDI ເຊື່ຶອມຕໍ່ບູລທູດ
    `,
      },
      {
        name: "Yamaha recorder",
        price: "1.770.000",
        image:
          "https://firebasestorage.googleapis.com/v0/b/sinxai-255ac.appspot.com/o/WhatsApp%20Image%202022-10-20%20at%201.59.24%20PM.jpeg?alt=media&token=4d616231-df18-43a5-80e6-b06491610a4d",
        desc: `	•	ຊື່ YRB- 302BII
    •	ນໍ້າໜັກ 1.62 ກກ
    •	ການວາງ ນິວມື ແບບ baroque
    •	ລໍາໂຕ ເຮັດຈາກປລາສຕິກ
    •	Build ເບສ
    •	ຄີ F
    •	ຊີ້ນສວນມີ 4 ອັນ
    `,
      },
      {
        name: "Yamaha recorder",
        price: "584.000",
        image:
          "https://firebasestorage.googleapis.com/v0/b/sinxai-255ac.appspot.com/o/WhatsApp%20Image%202022-10-20%20at%201.59.24%20PM.jpeg?alt=media&token=4d616231-df18-43a5-80e6-b06491610a4d",
        desc: `	•	ຊື່ YRT-304BII
    •	ຄີ C
    •	ລໍາໂຕ ເຮັດຈາກປລາສຕິກ
    •	ຊີ້ນສວນມີ 3 ອັນ
    `,
      },
      {
        name: "Yamaha recorder",
        price: "584.000",
        image:
          "https://firebasestorage.googleapis.com/v0/b/sinxai-255ac.appspot.com/o/WhatsApp%20Image%202022-10-20%20at%201.59.24%20PM.jpeg?alt=media&token=4d616231-df18-43a5-80e6-b06491610a4d",
        desc: `	•	ຊື່ YRA-28BIII
    •	ວັດສະດຸ ປລາສຕິກ 
    •	ຄີ F
    •	ນໍ້າໜັກ 0.53 
    •	ຊິ້ນສວນ 3 ອັນ 
    `,
      },
      {
        name: "Yamaha recorder",
        price: "584.000",
        image:
          "https://firebasestorage.googleapis.com/v0/b/sinxai-255ac.appspot.com/o/WhatsApp%20Image%202022-10-20%20at%201.59.24%20PM.jpeg?alt=media&token=4d616231-df18-43a5-80e6-b06491610a4d",
        desc: `	•	ຊື່ YRS-24B
    •	ຄີ C 
    •	ຊິນສວນ 3 ອັນ
    •	ວັດສະດຸ ABS ເຣສິນ
    `,
      },
    ]);
  } catch (e) {
    return res.status(500).send({ message: e.message, e: e });
  }
});

module.exports = router;
