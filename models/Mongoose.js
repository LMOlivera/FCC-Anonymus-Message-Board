//Every model requires Mongoose to be able to connect to the database
const mongoose = require('mongoose');

mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false)
mongoose.connect(process.env.MLAB_URI, {useNewUrlParser: true});

module.exports = mongoose;