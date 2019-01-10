
//////////////////////////////////////////////////////////////////// DATABASE STRUCTURE ////////////////////////////////////////////////////////////////////
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/MonDash', { useNewUrlParser: true });

mongoose.Promise = global.Promise;

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function () { });

const LeopardSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, "You must enter a name for your new pet"],
        max: 100
    },

}, { timestamps: true });

const Leopard = mongoose.model('Animals', LeopardSchema);

//////////////////////////////////////////////////////////////////// EXPRESS VARIABLES ////////////////////////////////////////////////////////////////////
const moment = require("moment");

const express = require('express');

const flash = require('express-flash');

const app = express();

const bodyParser = require('body-parser');

const path = require('path');

const session = require('express-session');

//////////////////////////////////////////////////////////////////// APP INSTANTIATION ////////////////////////////////////////////////////////////////////
app.use(session({
    secret: 'keyboardkitteh',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, './public')));

app.use(flash());

app.set('views', path.join(__dirname, './views'));

app.set('view engine', 'ejs');

/////////////////////////////// GET ///////////////////////////////////// HOME PAGE ////////////////////////////////////////////////////////////////////

app.get('/', function (request, response) {
    Leopard.find({}, function (err, data) {
        response.render('index', { data });
    });
});
/////////////////////////////// GET ///////////////////////////////////// CREATE PAGE ////////////////////////////////////////////////////////////////////

app.get('/leopard/new', function (request, response) {
    response.render('new');
});
/////////////////////////////// POST ///////////////////////////////////// POST NEW LEOPARD ////////////////////////////////////////////////////////////////////
app.post('/leopard', function (request, response) {
    console.log("POST DATA", request.body);
    const newLeopard = new Leopard(request.body);
    newLeopard.save(function (err) {
        if (err) {
            console.log("Something went wrong!:", err);
            for (var key in err.errors) {
                request.flash('registration', err.errors[key].message);
            }
            response.redirect('/');
        } else {
            response.redirect('/');
        }
    });
});

/////////////////////////////// GET ///////////////////////////////////// LEOPARD INFO ////////////////////////////////////////////////////////////////////
app.get('/leopard/:id', function (request, response) {
    const leopard = Leopard.findOne({ _id: request.params.id }, function (err, leopard) {
        if (err) {
            console.log("Something went wrong!:", err);
            for (var key in err.errors) {
                request.flash('registration', err.errors[key].message);
            }
            response.redirect('/');
        } else {
            response.render('info', { leopard });
        }
    });
});


/////////////////////////////// GET ///////////////////////////////////// EDIT LEOPARD ////////////////////////////////////////////////////////////////////
app.get('/leopard/edit/:id', function (request, response) {
    Leopard.findOne({ _id: request.params.id }, function (err, leopard) {
        response.render('edit', {leopard});
    });
})



/////////////////////////////// POST ///////////////////////////////////// POST EDIT CHANGES ////////////////////////////////////////////////////////////////////

app.post('/leopard/edit/:id', function (request, response) {
    console.log("POST DATA", request.body);
    Leopard.update({ _id: request.params.id },
        {
            name: request.body.name,
        },
        function (err) {
            if (err) {
                console.log('something went wrong');
                for (var key in err.errors) {
                    request.flash('registration', err.errors[key].message);
                }
                response.redirect(`/leopard/edit/${request.params.id}`)
            }
            else {
                console.log('successfully the a Leopard!');
                response.redirect(`/leopard/${request.params.id}`);
            }

        });
});
/////////////////////////////// POST ///////////////////////////////////// DELETE LEOPARD ////////////////////////////////////////////////////////////////////

app.post('/leopard/destroy/:id', function (request, response) {
    console.log(request.params.id);
    Leopard.remove({ _id: request.params.id }, function (err) {
        console.log('deleted');

        response.redirect('/');
    })

});



app.listen(5000, function () {
    console.log("listening on port 5000");
});

