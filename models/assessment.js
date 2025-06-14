const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
    pleasure: { type: Number, enum:[1,2,3,4], required: true },
    gender: { type: Number, enum: [1,2], required: true },
    controlWorrying: { type: Number, min:0, max:100, required: true },
    feelBad: { type: Number, enum:[1,2,3,4], required: true },
    mood: { type: Number, enum:[1,2,3], required: true },
    selfHarm: { type: Number, enum:[1,2], required: true },
    physicalDistress: { type: Number, enum:[1,2], required: true },
    sleepQuality: { type: Number, enum: [1,2,3,4,5], required: true },
    medications: { type: Number, enum:[1,2,3,4], required: true },
    feelTired: { type: Number, enum:[1,2,3,4]},
    feelNervous: { type: Number, enum:[1,2,3,4,5]},
    stressLevel: { type: Number, enum:[1,2,3,4,5], required: true },
    mentalState: {type: Number},
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Assessment', assessmentSchema);
