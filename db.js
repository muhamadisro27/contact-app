const mongoose = require("mongoose");
const uri = "mongodb://127.0.0.1:27017/belajar-mongodb";
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

// Menambah 1 data
// const contact1 = new Contact({
//   nama: "Muhamad Isro",
//   nim: "932018003",
//   nohp: "08123232323",
//   email: "isro@gmail.com",
// });

// contact1.save().then((res) => console.log(res));
