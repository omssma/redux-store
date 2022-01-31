const faker = require('faker');

const db = require('../config/connection');
const { User } = require('../models/index');

db.once('open', async () => {
    try {
        await db.dropDatabase();
        console.log('Database has been dropped.');
    } catch (error) {
        console.error(error);
    };
    
    process.exit(0);
});