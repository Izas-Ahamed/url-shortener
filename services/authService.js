const monk = require("monk");
const yup = require("yup");
const bcrypt = require("bcryptjs");
const db = monk(process.env.MONGODB_URI);
const users = db.get("users");

const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email("Please enter valid email Id 😕")
    .required("Please enter email Id"),
  password: yup
    .string()
    .min(4, "Invalid password! ☹️")
    .required("Please enter password"),
});

const signUpSchema = yup.object().shape({
  name: yup
    .string()
    .min(4, "Name should be atleast 4 letters 🙃")
    .required("Please enter name!"),
  email: yup
    .string()
    .email("Please enter valid email Id 😕")
    .required("Please enter email Id!"),
  password: yup
    .string()
    .min(4, "Password requires atleast 3 characters 🙃")
    .required("Please enter password!"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Confirm Password doesn't match! 😅"),
});

exports.login = async (req, res) => {
  try {
    await loginSchema.validateSync(
      {
        email: req.body.email,
        password: req.body.password,
      },
      { abortEarly: false }
    );

    const user = await users.findOne({ email: req.body.email });

    if (!user)
      return res.render("login", {
        errorMessage: "Account not found! 😕",
        successMessage: null,
        isLoggedIn: null,
        email: req.body.email,
        password: req.body.password,
      });

    const isVerified = await bcrypt.compare(req.body.password, user.password);

    if (!isVerified)
      return res.render("login", {
        errorMessage: "Invalid Password ☹️",
        successMessage: null,
        isLoggedIn: null,
        email: req.body.email,
        password: null,
      });

    req.session.isLoggedIn = true;
    req.session.user = user;
    res.redirect("/shortUrl");
  } catch (e) {
    res.render("login", {
      errorMessage: e.inner ? e.inner[0].message : e.message,
      successMessage: null,
      email: e.inner && e.inner[0].path == "email" ? "" : req.body.email,
      password:
        e.inner && e.inner[0].path == "password" ? "" : req.body.password,
      isLoggedIn: null,
    });
  }
};

exports.signup = async (req, res) => {
  try {
    await signUpSchema.validateSync(
      {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
      },
      { abortEarly: false }
    );

    const user = await users.findOne({ email: req.body.email });

    if (user)
      return res.render("signup", {
        errorMessage: "emailId Already Exists 🔎!",
        successMessage: null,
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        isLoggedIn: null,
      });

    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    await users.insert({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });

    res.render("signup", {
      errorMessage: null,
      successMessage: "Account created successfully! 😀",
      name: null,
      email: null,
      password: null,
      confirmPassword: null,
      isLoggedIn: req.session.isLoggedIn,
    });
  } catch (e) {
    res.render("signup", {
      errorMessage: e.inner && e.inner[0].message,
      successMessage: null,
      name: e.inner && e.inner[0].path == "name" ? "" : req.body.name,
      email: e.inner && e.inner[0].path == "email" ? "" : req.body.email,
      password:
        e.inner && e.inner[0].path == "password" ? "" : req.body.password,
      confirmPassword:
        e.inner && e.inner[0].path == "confirmPassword"
          ? ""
          : req.body.confirmPassword,
      isLoggedIn: req.session.isLoggedIn,
    });
  }
};
