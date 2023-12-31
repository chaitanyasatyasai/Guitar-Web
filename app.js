const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
var passwordHash = require('password-hash');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

const serviceAccount = require('./key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),

});


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('.'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/signup.html'));
  console.log("started");
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, "/login.html"));
});

app.get('/guitar', (req, res) => {
  res.sendFile(path.join(__dirname, "/e.html"));
});


app.post('/signupSubmit', async (req, res) => {
  const  mail = req.body.mail;
  const username = req.body.name;
  const password = passwordHash.generate(req.body.password);
  try {
    console.log('Email:', mail);
    const userRef = admin.firestore().collection('users').doc(mail);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      res.status(400).json({ error: 'Account with this email already exists' });
    } else {
      await userRef.set({ username, password });
      res.redirect('/login');
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.post('/loginSubmit', async (req, res) => {
  const mail = req.body.mail;
  const password = req.body.password;
  try {
    const userDoc = await admin.firestore().collection('users').doc(mail).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (passwordHash.verify(password, userData.password)) {
        res.redirect(`/guitar`);
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});