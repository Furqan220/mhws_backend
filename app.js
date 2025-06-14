require('dotenv').config();
const cookieParser = require("cookie-parser");
const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const dayjs = require('dayjs');
const admin = require('firebase-admin');
const cron = require('node-cron');
const userModel = require('./models/user');
const assessmentModel = require('./models/assessment');
const exercisesModel = require('./models/exercises');
const moodJournal = require('./models/moodJournal');
const sleepJournal = require('./models/sleepJournal');
const griefJournal = require('./models/griefJournal');
const reservation = require('./models/reservation');
const images = require('./models/images');
const notification = require('./models/notification');
const serviceAccount = require('./config/push-notification-key.json');
const calmExercise = require('./models/calmExercise');
const anxietyRelease = require('./models/anxietyRelease');
const frustrationExercise = require('./models/frustration');
const breathingExercise = require('./models/breathing');
const betterSleepExercise = require('./models/betterSleep');
const improvePerformanceExercise = require('./models/improvePerformance');
const helpSupport = require('./models/helpSupport');
const termsPolicy = require('./models/termsPolicy');
const reportProblem = require('./models/reportProblem');
const feedback = require('./models/feedback');
const mongoose = require("mongoose");


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname,'public')));
app.use(cookieParser());
// app.use("/notification", require("./routes/app.routes"));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


mongoose
  .connect(process.env.DB_CONN_LIVE, {
    // useNewUrlParser : true
  })
  .then((conn) => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.log(err.name, err.message);
    console.log("Mongo Db connection error occured! Shutting down ...");
    server.close(() => {
      process.exit(1);
    });
  });
 


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

cron.schedule('* * * * *', async () => {
  const now = new Date();
  const currentTime = now.toTimeString().split(':').slice(0, 2).join(':'); // "HH:mm"

  try {
    const notifications = await notification.find({ notificationTime: currentTime });

    for (const notif of notifications) {
      const message = {
        token: notif.deviceToken,
        notification: {
          title: 'Reminder',
          body: notif.message,
        },
      };

      try {
        await admin.messaging().send(message);
        console.log(`Notification sent to ${notif.deviceToken} at ${currentTime}`);
        res.send('kuch to garbar hai daya');
      } catch (err) {
        console.error(`Failed to send notification:`, err);
      }
    }
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.send('not sent');
  }
});




const transporter = nodemailer.createTransport({
  service: 'gmail',
  secure: true,
  host: 'smtp.gmail.com',
  port: 465,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
});


app.get('/', (req, res) => {
  console.log("Hello world");
})

app.post('/create', async (req, res) => {
  try {
    let { username, email, mobile, password } = req.body;

    if (!username || !email || !mobile || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const createdUser = await userModel.create({
      username,
      email,
      password: hash,
      mobile,
    });

    res.status(201).json({ message: "User created successfully", userId: createdUser._id });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// app.post('/login', async (req,res) => {
//     let user = await userModel.findOne({email: req.body.email});
//     if(!user) return res.send("Something went wrong!");

//     bcrypt.compare(req.body.password,user.password,(err,result) =>{
//         if(result) {
//             res.send("you can login");
//             const token = jwt.sign({ id: user._id }, env.JWTSECRET, { expiresIn: '1h' });
//              res.json({ token });
//         }
//         else{
//             res.send("you cant login");
//         }
//     })
// })

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        console.error("Bcrypt error:", err);
        return res.status(500).json({ message: "Error during login" });
      }

      if (result) {
        const token = jwt.sign({ id: user._id }, process.env.JWTSECRET, { expiresIn: '1h' });
        return res.status(200).json({ message: "Login successful", token });
      } else {
        return res.status(401).json({ message: "Invalid email or password" });
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});



// app.post('/otp', async (req,res) => {
//     let user = await userModel.findOne({email: req.body.email});
//     if(!user) return res.send("User not found");
//     const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

//     let mailOptions = {
//         from: process.env.EMAIL,
//         to: user.email,
//         subject: "Sending email using Node.js",
//         text: otp
//     };

//     transporter.sendMail(mailOptions,(error,info) => {
//         if(error){
//             console.log(error);
//             return res.status(500).json({ message: "Failed to send email" });
//         }
//         else{
//             console.log(info.response);
//             return res.status(500).json({ message: "Email sent successfully" });
//         }
//     });
// });

app.post('/otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ message: "Failed to send email" });
      }

      console.log("Email sent:", info.response);
      return res.status(200).json({ message: "OTP sent successfully" });
    });

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});


app.post('/update-password', async (req, res) => {
  let { newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    let user = await userModel.findOneAndUpdate({ password: hashedPassword });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});



app.post('/submit-assessment', async (req, res) => {
  try {
    let {
      gender,
      pleasure,
      controlWorrying,
      feelBad,
      mood,
      selfHarm,
      physicalDistress,
      sleepQuality,
      medications,
      feelTired,
      feelNervous,
      stressLevel
    } = req.body;

    if (controlWorrying >= 0 && controlWorrying <= 25) {
      controlWorrying = 1;
    } else if (controlWorrying <= 50) {
      controlWorrying = 2;
    } else if (controlWorrying <= 75) {
      controlWorrying = 3;
    } else if (controlWorrying <= 100) {
      controlWorrying = 4;
    } else {
      return res.status(400).json({ message: "Invalid controlWorrying value" });
    }

    const mentalState =
      gender +
      pleasure +
      controlWorrying +
      feelBad +
      mood +
      selfHarm +
      physicalDistress +
      sleepQuality +
      medications +
      feelTired +
      feelNervous +
      stressLevel;

    const newAssessment = new assessmentModel({
      gender,
      pleasure,
      controlWorrying,
      feelBad,
      mood,
      selfHarm,
      physicalDistress,
      sleepQuality,
      medications,
      feelTired,
      feelNervous,
      stressLevel,
      mentalState
    });

    await newAssessment.save();

    let result;
    if (mentalState >= 12 && mentalState <= 21) {
      result = "Minimal";
    } else if (mentalState >= 22 && mentalState <= 30) {
      result = "Mild";
    } else if (mentalState >= 31 && mentalState <= 39) {
      result = "Moderate";
    } else {
      result = "Severe";
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('Error submitting assessment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/mood-journal-create', async (req, res) => {

  try {
    let moodTracking = await moodJournal.create(req.body);
    res.status(201).json(
      {
        message: "mood created",
        data: moodTracking
      });
  }
  catch (error) {
    res.status(400).json({ error: error.message });
  }
})

app.post('/upload-mood-image', upload.single('image'), async (req, res) => {
  try {
    const { moodValue } = req.body;

    if (!moodValue || !req.file) {
      return res.status(400).json({ error: 'Mood value and image are required' });
    }

    const moodInt = parseInt(moodValue);

    // Deletes existing image for this moodValue to allow replacement
    await images.deleteOne({ moodValue: moodInt });

    const newImage = new images({
      moodValue: moodInt,
      imageData: req.file.buffer,
      contentType: req.file.mimetype
    });

    await newImage.save();

    res.status(201).json({ message: `Image uploaded for mood ${moodInt}` });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.get('/get-mood-data', async (req, res) => {
  try {
    const moodEntries = await moodJournal.find().sort({ createdAt: -1 });

    if (!moodEntries.length) {
      return res.status(404).json({ message: 'No mood entries found' });
    }

    const entriesWithImages = await Promise.all(
      moodEntries.map(async (entry) => {
        const moodValue = entry.rateMood;
        const moodImage = await images.findOne({ moodValue });

        let imageData = null;
        if (moodImage) {
          imageData = `data:${moodImage.contentType};base64,${moodImage.imageData.toString('base64')}`;
        }

        return {
          ...entry.toObject(),
          image: imageData
        };
      })
    );

    res.json({
      title: "Mood Journal",
      content: entriesWithImages
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


app.get('/get-mood-graph-data', async (req, res) => {
  try {
    const moodEntries = await moodJournal.find().sort({ createdAt: 1 });

    if (!moodEntries.length) {
      return res.status(404).json({ message: 'No mood data found' });
    }

    const graphData = moodEntries.map(entry => ({
      date: entry.createdAt.toISOString().split('T')[0],
      rateMood: entry.rateMood
    }));

    res.json({
      data: graphData
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to prepare graph data' });
  }
});


app.get('/get-sleep-graph-data', async (req, res) => {
  try {
    const sleepEntries = await sleepJournal.find().sort({ createdAt: 1 });

    if (!sleepEntries.length) {
      return res.status(404).json({ message: 'No sleep data found' });
    }

    const graphData = sleepEntries.map(entry => ({
      date: entry.createdAt.toISOString().split('T')[0],
      rateSleep: entry.rateSleep
    }));

    res.json({
      data: graphData
    });
  } catch (error) {
    console.error('Error fetching sleep graph data:', error);
    res.status(500).json({ error: 'Failed to prepare sleep graph data' });
  }
});



app.post('/sleep-journal-create', async (req, res) => {

  try {
    let sleepTracking = await sleepJournal.create(req.body);
    res.status(201).json(
      {
        message: "mood created",
        data: sleepTracking
      });
  }
  catch (error) {
    res.status(400).json({ error: error.message });
  }
})

app.get('/get-sleep-data', async (req, res) => {

  try {
    const getSleepData = await sleepJournal.find().sort({ createdAt: -1 });

    if (!getSleepData.length) {
      return res.status(404).json({ message: 'No entries found' });
    }

    res.json({
      title: "Sleep Journal",
      content: getSleepData
    });

  }
  catch (error) {
    res.status(500).json({ error: 'Error fetching data' });
  }
});

app.post('/grief-text', async (req, res) => {

  try {
    const newText = await griefJournal.create(req.body);

    res.status(201).json({ message: 'Text saved', data: newText });
  }
  catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/grief-text', async (req, res) => {

  try {
    const textEntry = await griefJournal.find().sort({ createdAt: -1 });
    if (!textEntry) {
      return res.status(404).json({ message: 'No text found' });
    }

    res.json({
      title: "Grief Journal",
      content: textEntry
    });
  }
  catch (error) {
    res.status(500).json({ error: 'Error retrieving text' });
  }
});

app.post('/reserve-date', async (req, res) => {
  const { date, userId } = req.body;

  try {
    const targetDate = new Date(date);
    targetDate.setMinutes(0, 0, 0);

    const exists = await reservation.findOne({ date: targetDate });

    if (exists) {
      return res.status(409).json({ message: 'This time slot is already reserved' });
    }

    const newReservation = new reservation({
      date: targetDate,
      userId,
    });

    await newReservation.save();
    res.status(201).json({ message: 'Time slot successfully reserved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.get('/available-slots', async (req, res) => {
  try {
    const today = dayjs().startOf('day');
    const daysAhead = 30;

    const dateList = Array.from({ length: daysAhead }, (_, i) =>
      today.add(i, 'day')
    );

    const HOURS = Array.from({ length: 9 }, (_, i) => 9 + i); // 9–17

    const start = today.toDate();
    const end = today.add(daysAhead, 'day').toDate();

    const reservations = await reservation.find({
      date: { $gte: start, $lt: end },
    });

    const reservedSet = new Set(
      reservations.map(r => new Date(r.date).toISOString())
    );

    const availableSlots = [];

    for (const day of dateList) {
      for (const hour of HOURS) {
        const slot = day.hour(hour).minute(0).second(0).millisecond(0);
        const slotISO = slot.toDate().toISOString();

        if (!reservedSet.has(slotISO)) {
          availableSlots.push(slot.format('YYYY-MM-DDTHH:mm'));
        }
      }
    }

    res.json({ availableSlots });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


app.post('/set-user-notification', async (req, res) => {
  try {
    const { deviceToken, notificationTime, message } = req.body;

    if (!deviceToken || !notificationTime || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    await notification.findOneAndUpdate(
      { deviceToken },
      { notificationTime, message },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: 'Notification saved successfully' });
  } catch (err) {
    console.error('Error saving user notification:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


app.post('/add-calm-exercise', async (req, res) => {
  try {
    const { day, title, description } = req.body;

    if (!day || !title || !description) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const exercise = new calmExercise({ day, title, description });
    await exercise.save();

    res.status(201).json({ message: 'Calm exercise added successfully.' });
  } catch (error) {
    console.error('Error adding calm exercise:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/get-calm-exercises', async (req, res) => {
  try {
    const exercises = await calmExercise.find().sort({ day: 1 });
    res.status(200).json({ exercises });
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/add-anxiety-release', async (req, res) => {
  try {
    const { day, title, description } = req.body;

    if (!day || !title || !description) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existing = await anxietyRelease.findOne({ day });
    if (existing) {
      return res.status(409).json({ message: 'Exercise for this day already exists' });
    }

    const exercise = new anxietyRelease({ day, title, description });
    await exercise.save();

    res.status(201).json({ message: 'Anxiety release exercise added' });
  } catch (error) {
    console.error('Add error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/get-anxiety-release', async (req, res) => {
  try {
    const exercises = await anxietyRelease.find().sort({ day: 1 });

    if (!exercises.length) {
      return res.status(404).json({ message: 'No anxiety release exercises found' });
    }

    res.status(200).json({ exercises });
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/add-frustration-exercise', async (req, res) => {
  try {
    const { day, title, description } = req.body;

    if (!day || !title || !description) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const exists = await frustrationExercise.findOne({ day });
    if (exists) {
      return res.status(409).json({ message: 'Exercise for this day already exists' });
    }

    const exercise = new frustrationExercise({ day, title, description });
    await exercise.save();

    res.status(201).json({ message: 'Frustration exercise added' });
  } catch (error) {
    console.error('Error adding frustration exercise:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/get-frustration-exercises', async (req, res) => {
  try {
    const exercises = await frustrationExercise.find().sort({ day: 1 });

    if (!exercises.length) {
      return res.status(404).json({ message: 'No frustration exercises found' });
    }

    res.status(200).json({ exercises });
  } catch (error) {
    console.error('Error fetching frustration exercises:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/add-breathing-exercise', async (req, res) => {
  try {
    const { day, title, description } = req.body;

    if (!day || !title || !description) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const exists = await breathingExercise.findOne({ day });
    if (exists) {
      return res.status(409).json({ message: 'Exercise for this day already exists' });
    }

    const exercise = new breathingExercise({ day, title, description });
    await exercise.save();

    res.status(201).json({ message: 'Breathing exercise added successfully' });
  } catch (error) {
    console.error('Error adding breathing exercise:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/get-breathing-exercises', async (req, res) => {
  try {
    const exercises = await breathingExercise.find().sort({ day: 1 });

    if (!exercises.length) {
      return res.status(404).json({ message: 'No breathing exercises found' });
    }

    res.status(200).json({ exercises });
  } catch (error) {
    console.error('Error fetching breathing exercises:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/add-better-sleep-exercise', async (req, res) => {
  try {
    const { day, title, description } = req.body;

    if (!day || !title || !description) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const exists = await betterSleepExercise.findOne({ day });
    if (exists) {
      return res.status(409).json({ message: 'Exercise for this day already exists' });
    }

    const exercise = new betterSleepExercise({ day, title, description });
    await exercise.save();

    res.status(201).json({ message: 'Better Sleep exercise added successfully' });
  } catch (error) {
    console.error('Error adding Better Sleep exercise:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/get-better-sleep-exercises', async (req, res) => {
  try {
    const exercises = await betterSleepExercise.find().sort({ day: 1 });

    if (!exercises.length) {
      return res.status(404).json({ message: 'No sleep exercises found' });
    }

    res.status(200).json({ exercises });
  } catch (error) {
    console.error('Error fetching sleep exercises:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/add-improve-performance-exercise', async (req, res) => {
  try {
    const { day, title, description } = req.body;

    if (!day || !title || !description) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const exists = await improvePerformanceExercise.findOne({ day });
    if (exists) {
      return res.status(409).json({ message: 'Exercise for this day already exists' });
    }

    const exercise = new improvePerformanceExercise({ day, title, description });
    await exercise.save();

    res.status(201).json({ message: 'Improve Performance exercise added successfully' });
  } catch (error) {
    console.error('Error adding Improve Performance exercise:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/get-improve-performance-exercises', async (req, res) => {
  try {
    const exercises = await improvePerformanceExercise.find().sort({ day: 1 });

    if (!exercises.length) {
      return res.status(404).json({ message: 'No improve performance exercises found' });
    }

    res.status(200).json({ exercises });
  } catch (error) {
    console.error('Error fetching improve performance exercises:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


app.post('/create-help-support', async (req, res) => {
  try {
    const { faqs, contact } = req.body;

    if (!faqs || !contact) {
      return res.status(400).json({ error: 'FAQs and contact details are required' });
    }

    // await helpSupport.deleteMany();

    const newHelp = new helpSupport({ faqs, contact });
    await newHelp.save();

    res.status(201).json({ message: 'Help & Support content created successfully' });
  } catch (error) {
    console.error('Creation error:', error);
    res.status(500).json({ error: 'Failed to create Help & Support content' });
  }
});

app.get('/get-help-support', async (req, res) => {
  try {
    const helpSupportData = await helpSupport.find();

    if (!helpSupportData.length) {
      return res.status(404).json({ message: 'No Help & Support content found' });
    }

    res.json(helpSupportData);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to load help and support content' });
  }
});

app.post('/create-terms-policy', async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const newPolicy = new termsPolicy({ title, content });
    await newPolicy.save();

    res.status(201).json({ message: 'Terms & Policy content created successfully' });
  } catch (error) {
    console.error('Creation error:', error);
    res.status(500).json({ error: 'Failed to create Terms & Policy content' });
  }
});

app.get('/get-terms-policies', async (req, res) => {
  try {
    const policies = await termsPolicy.find();

    if (!policies.length) {
      return res.status(404).json({ message: 'No Terms & Policies found' });
    }

    res.json(policies);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to load Terms & Policies' });
  }
});

app.post('/report-problem', async (req, res) => {
  try {
    const { title, comment } = req.body;

    if (!title || !comment) {
      return res.status(400).json({ error: 'Title and comment are required' });
    }

    const report = new reportProblem({ title, comment });
    await report.save();

    res.status(201).json({ message: 'Issue reported successfully' });
  } catch (error) {
    console.error('Error reporting issue:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/get-reported-problems', async (req, res) => {
  try {
    const reports = await reportProblem.find().sort({ createdAt: -1 });
    res.status(200).json({ reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/submit-feedback', async (req, res) => {
  try {
    const { name, email, rating, message } = req.body;

    if (!rating || !message) {
      return res.status(400).json({ error: 'Rating and message are required.' });
    }

    const Feedback = new feedback({
      name,
      email,
      rating,
      message
    });

    await Feedback.save();
    res.status(201).json({ message: 'Thank you for your feedback!' });

  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/get-feedback', async (req, res) => {
  try {
    const feedbackList = await feedback.find().sort({ createdAt: -1 });
    res.status(200).json({ feedback: feedbackList });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.listen(3000);