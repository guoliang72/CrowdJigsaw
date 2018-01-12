var mongoose = require("mongoose"); 
// create the user schema
var UserSchema = new mongoose.Schema({
    userid: { type: Number, required: true, unique: true, index: true },
    username: { type: String, required: true, unique: true, index: true },
    avatar: { type: String, default: 'images/placeholder.png' },
    password: { type: String }, // encrypted with crypto
    last_online_time:  { type: String }, // formatted time, e.g. 2017-10-31 14:00:20
    register_time: { type: String }, // formatted time, e.g. 2017-10-31 14:00:20
    admin: { type: Boolean, default: false }, // only admin can new rounds&see images
    records: [
        {
            round_id: { type: Number }, // participated rounds
            join_time: { type: String },
            start_time: { type: String, default: "-1" }, // formatted time, e.g. 2017-10-31 14:00:20
            end_time: { type: String, default: "-1" }, // formatted time, e.g. 2017-10-31 14:00:20
            steps: { type: String, default: "-1" }, // -1=unfininshed
            time: { type: String, default: "-1" }, // hour:min:sec, e.g. 16:41
            contribution: { type: Number, default: -1 }// a contribution score, calculated when one round end
        }
    ],
    save_game: {
        round_id: { type: Number },
        steps: { type: Number },
        time: { type: Number },
        tiles: { type: String},
        shape_array: { type: String}
    }
},
    // When no collection argument is passed, Mongoose pluralizes the name.
    { collection: 'users' }
);

// UserSchema.set('collection', 'users');
// var User = mongoose.model('User', UserSchema, 'users');
console.log('User Schema Created.');

exports.User = mongoose.model('User', UserSchema);