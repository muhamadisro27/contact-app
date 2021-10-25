const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const app = express();
const port = 4000;
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const { body, validationResult, check } = require("express-validator");
const methodOverride = require("method-override");

require("./db.js");

const Contact = require("./models/contacts");

// Method RESTful
app.use(methodOverride("_method"));

// Setup Engine EJS
app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Setup Flash Message
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

app.get("/", async (req, res) => {
  const contacts = await Contact.find()
    .then((contact) => {
      return contact;
    })
    .catch((err) => {
      return console.log(err);
    });

  res.render("index", {
    title: "Halaman Index",
    nama: "Muhamad Isro s",
    layout: "partials/main",
    contacts,
  });
  // res.send("ok");
});

app.get("/about", (req, res) => {
  res.render("about", {
    title: "Halaman About",
    layout: "partials/main",
  });
});

app.get("/contact", async (req, res) => {
  const contacts = await Contact.find()
    .then((contact) => {
      return contact;
    })
    .catch((err) => {
      return console.log(err);
    });
  res.render("contact", {
    title: "Halaman Contact",
    layout: "partials/main",
    contacts,
    msg: req.flash("msg"),
  });
});

app.get("/contact/post", (req, res) => {
  res.render("add-contact", {
    layout: "partials/main",
    title: "Halaman Tambah Data",
  });
});

app.post(
  "/contact",
  [
    body("nama").custom(async (value) => {
      const duplikat = await Contact.findOne({ nama: value });
      if (duplikat) {
        throw new Error("Nama kontak sudah digunakan!");
      }
      return true;
    }),
    check("email", "Email tidak valid !").isEmail(),
    check("nohp", "Nomor hp tidak valid !").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // return res.status(400).json({ errors: errors.array() });
      res.render("add-contact", {
        title: "Form Tambah Data Kontak",
        layout: "partials/main",
        errors: errors.array(),
      });
    } else {
      Contact.insertMany(req.body, (error, result) => {
        // flash message
        req.flash("msg", "Data Kontak Berhasil ditambahkan!");
        res.redirect("/contact");
      });
    }
  }
);

// Detail
app.get("/contact/:nama", async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });
  res.render("detail", {
    title: "Halaman Detail Kontak",
    layout: "partials/main",
    contact,
  });
});

// Edit Form
app.get("/contact/edit/:nama", async (req, res) => {
  // Mengecek data apakah yang di klik sama dengan yang di database
  const contact = await Contact.findOne({ nama: req.params.nama })
    .then((contact) => {
      return contact;
    })
    .catch((err) => {
      return console.log(err);
    });

  res.render("edit-contact", {
    title: "Halaman Edit Kontak",
    layout: "partials/main",
    contact,
  });
});

// Edit Process

app.put(
  "/contact",
  [
    body("nama").custom(async (value, { req }) => {
      const duplikat = await Contact.findOne({ nama: value });
      if (value !== req.body.oldNama && duplikat) {
        throw new Error("Nama kontak sudah digunakan!");
      }
      return true;
    }),
    check("email", "Email tidak valid !").isEmail(),
    check("nohp", "Nomor hp tidak valid !").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("edit-contact", {
        title: "Form Edit Data Kontak",
        layout: "partials/main",
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      Contact.updateOne(
        { _id: req.body._id },
        {
          $set: {
            nama: req.body.nama,
            nim: req.body.nim,
            nohp: req.body.nohp,
            email: req.body.email,
          },
        }
      ).then((result) => {
        req.flash("msg", "Data Kontak Berhasil diubah!");
        res.redirect("/contact");
      });
    }
  }
);

// Delete
// app.get("/contact/delete/:nama", async (req, res) => {
//   const contact = await Contact.findOne({ nama: req.params.nama });
// res.send(contact);
//   if (!contact) {
//     res.status(404);
//     res.send(`<h1>404 not found</h1>`);
//   } else {
//     Contact.deleteOne({ _id: contact._id }, (err, result) => {
//       req.flash("msg", "Data Kontak Berhasil dihapus!");
//       res.redirect("/contact");
//     });
//   }
// });

app.delete("/contact", (req, res) => {
  // res.send(req.body);
  Contact.deleteOne({ nama: req.body.nama }).then((result) => {
    req.flash("msg", "Data Kontak Berhasil dihapus!");
    res.redirect("/contact");
  });
});

app.use("/", (req, res) => {
  res.status(404);
  res.send("<h1>404</h1>");
});

app.listen(port, () => {
  console.log(`app berjalan pada port http://localhost:${port}...`);
});
