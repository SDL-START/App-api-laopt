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
    const appurl = `https://ecard-loto.web.app/#/kaenoi`;
    let items = [
      {
        title: "ຊ໋ອບປິງ",
        url: `${appurl}/shopping`,
        icon: "https://cdn-icons-png.flaticon.com/512/3082/3082011.png",
        iswebview: false,
        isneedlogin: false,
      },
      {
        title: "ໂປຣໂມຊັນ",
        url: `${appurl}/promotions`,
        icon: "https://cdn-icons-png.flaticon.com/512/1598/1598629.png",
        iswebview: true,
        isneedlogin: false,
      },
      {
        title: "ຂ່າວສານ",
        url: `${appurl}/news`,
        icon: "https://cdn-icons-png.flaticon.com/512/3655/3655420.png",
        iswebview: true,
        isneedlogin: false,
      },
    ];
    if (username != "2022224071x") {
      items = [
        {
          title: "ຊື້ເລກ",
          url: "/buylottery",
          icon: "https://cdn-icons-png.flaticon.com/512/536/536095.png",
          iswebview: false,
          isneedlogin: true,
        },
        {
          title: "ເລກອອກຜ່ານມາ",
          url: `${appurl}/resulthistory`,
          icon: "https://cdn-icons-png.flaticon.com/512/2972/2972431.png",
          iswebview: true,
          isneedlogin: true,
        },
        {
          title: "ປະຫວັດການຊື້ເລກ",
          url: `${appurl}/buyhistory`,
          icon: "https://cdn-icons-png.flaticon.com/512/1019/1019607.png",
          iswebview: true,
          isneedlogin: true,
        },
        {
          title: "ເລກເດັດ",
          url: `${appurl}/goodnumber`,
          icon: "https://cdn-icons-png.flaticon.com/512/709/709337.png",
          iswebview: true,
          isneedlogin: true,
        },
        // { title: "ໂອນເງິນ", url: "/transfer", icon: "bingo.png", iswebview: false, isneedlogin: true },
        // { title: "ຖອນເງິນ", url: "/withdraw", icon: "bingo.png", iswebview: false, isneedlogin: true },
        // { title: "ເຕີມເງິນ", url: "/topup", icon: "bingo.png", iswebview: false, isneedlogin: true },
        // { title: "ຈ່າຍບິນ", url: "/paybill", icon: "bingo.png", iswebview: false, isneedlogin: true },
        // {
        //   title: "ລາຍງານ",
        //   url: "/statement",
        //   icon: "https://cdn-icons-png.flaticon.com/512/1055/1055644.png",
        //   iswebview: false,
        //   isneedlogin: true,
        // },
        ...items,
      ];
    }
    return res.json(items);
  } catch (e) {
    return res.status(500).send({ message: e.message, e: e });
  }
});

router.get("/getproducts", async (req, res) => {
  try {
    const items = [
      {
        id: 1,
        name: "Samsung Galaxy S21",
        price: "9,000000",
        image:
          "https://img.freepik.com/free-psd/premium-mobile-phone-screen-mockup-template_53876-65749.jpg?w=1480&t=st=1660495721~exp=1660496321~hmac=060c82c2394a411352bd10814b10fefd689ee888b541d66bffce7149754cedec",
      },
      {
        id: 2,
        name: "Samsung Smart TV",
        price: "10,000,000",
        image:
          "https://img.freepik.com/free-vector/tv-screen-wall-with-neon-light_134830-819.jpg?w=1480&t=st=1660495766~exp=1660496366~hmac=ddad19ee64d43884d49e0e1d31f2ca2b735b45e974bef0fd6154cb3e2c517588",
      },
      {
        id: 3,
        name: "Bicycle",
        price: "5,000,000",
        image:
          "https://img.freepik.com/free-photo/vintage-metal-white-bicycle-toy-wooden-table_155003-6411.jpg?w=1800&t=st=1664097094~exp=1664097694~hmac=2ad3a1050966ba1e10af2f22fc1bbb77d144228bf562fc69b574881b30c3b3f1",
      },
      {
        id: 4,
        name: "Headphones Sterio",
        price: "1,000,000",
        image:
          "https://img.freepik.com/free-photo/headphones-audio-listen_74190-571.jpg?w=2000&t=st=1664097183~exp=1664097783~hmac=9c3506d4348b30e49b9cdf601512bfd04428c5edaa6d71632d3e3354c0969e42",
      },
      {
        id: 5,
        name: "Camera Optical",
        price: "3,000,000",
        image:
          "https://img.freepik.com/free-vector/camera-accessory_1284-13130.jpg?w=1480&t=st=1664097278~exp=1664097878~hmac=1c9a6770a42794668291b8df27eb7c97f3588fde329ce6457ecae2a8fa8157a6",
      },
      {
        id: 6,
        name: "Smart Watch",
        price: "4,000,000",
        image:
          "https://img.freepik.com/free-psd/realistic-smart-watch-mockup_165789-534.jpg?w=2000&t=st=1664097379~exp=1664097979~hmac=25df76ac5b28cb9ee877e56444cf0963d6775b8e0e6c55caa110bc14e70c7008",
      },
      {
        id: 7,
        name: "Laptop Bag",
        price: "500,000",
        image:
          "https://img.freepik.com/free-photo/man-packing-away-his-laptop-into-bag_53876-95806.jpg?w=2000&t=st=1664097333~exp=1664097933~hmac=1ef3d72d08103ef20dcafdb6011b368ee3cca7cf8846bba10edb41d65929c106",
      },
      {
        id: 8,
        name: "Scooter",
        price: "12,500,000",
        image:
          "https://img.freepik.com/free-photo/retro-moto-scooter-street-urban-style_613910-15470.jpg?w=2000&t=st=1664097429~exp=1664098029~hmac=560d78aeab129f80f70d9b55673c9df2944e65ab4ccf2f507ab2a2d8ab333847",
      },
      {
        id: 9,
        name: "Sofa Minimal",
        price: "14,500,000",
        image:
          "https://img.freepik.com/free-photo/white-wall-living-room-have-sofa-decoration-3d-rendering_41470-3282.jpg?w=1800&t=st=1664097533~exp=1664098133~hmac=6a00f097283c2e183ba60add59eb9a07aea342207631d7cff8eede74967435cd",
      },
      {
        id: 10,
        name: "Bed Wood",
        price: "11,500,000",
        image:
          "https://img.freepik.com/free-photo/bedroom-interior-farmhouse-style-white-wall-mockup-3d-rendering_41470-3761.jpg?w=1800&t=st=1664097641~exp=1664098241~hmac=4f2f6497332d812d345af7602d764045df4759f137fe29642fe7a5984ac035b4",
      },
    ];
    return res.json(items);
  } catch (e) {
    return res.status(500).send({ message: e.message, e: e });
  }
});

router.get("/getbanks", async (req, res) => {
  try {
    const items = [
      {
        code: "LDB",
        name: "ທະນາຄານ ພັດທະນາລາວ",
        image: "http://192.168.100.7:8000/images/ldb.png",
      },
      {
        code: "JDB",
        name: "ທະນາຄານ ຮ່ວມພັດທະນາ",
        image: "http://192.168.100.7:8000/images/jdb.png",
      },
      {
        code: "LVB",
        name: "ທະນາຄານ ລາວ-ຫວຽດ",
        image: "http://192.168.100.7:8000/images/lvb.png",
      },
      {
        code: "mmoney",
        name: "M-Money",
        image: "http://192.168.100.7:8000/images/mmoney.png",
      },
      {
        code: "umoney",
        name: "U-Money",
        image: "http://192.168.100.7:8000/images/umoney.jpeg",
      },
    ];
    return res.json(items);
  } catch (e) {
    return res.status(500).send({ message: e.message, e: e });
  }
});

router.get("/getsliders", async (req, res) => {
  return res.send([
    "https://img.freepik.com/free-vector/colorful-gradient-sale-background_23-2148829907.jpg?w=1800&t=st=1661098042~exp=1661098642~hmac=48ca03f2bc9594ce3ceba4d6594fe57708f8cb44b7a0d66b9848f9648c20f0be",
    "https://img.freepik.com/free-vector/creative-coming-soon-teaser-background_23-2148894969.jpg?w=1800&t=st=1661098049~exp=1661098649~hmac=043cd5eb6624b8b9f7b44bc3b93c812d3bd549e10e0d187c41945250d5ffca8f",
    "https://img.freepik.com/free-vector/gradient-sale-background_23-2148934477.jpg?w=1800&t=st=1661098050~exp=1661098650~hmac=d8b80f67edd96d513a5cf1d5c872b041ad0f3b35b656e0cd1209793e8fc36377",
  ]);
});

module.exports = router;
