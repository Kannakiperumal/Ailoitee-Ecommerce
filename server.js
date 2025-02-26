const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const sequelize = require('./config/database');

require('dotenv').config();

const routes = require('./routes/index');
const swaggerDocs = require('./config/swagger');

const app = express();

app.use(helmet());
app.use(cors());
app.use(cors({
    origin: '*', 
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


sequelize.authenticate()
    .then( () => {
        console.log("Database Connected Successfully");
        return sequelize.sync();
    })
    .then( () => {
        console.log("Tables are synced")
    })
    .catch( (err) => {
        console.log("Database Connection failed", err)
    });

app.use("/api", routes);
swaggerDocs(app);


const Port = process.env.PORT || 5000;

app.listen(Port, () => {
    console.log(`Server running on Port ${Port}`);
})

