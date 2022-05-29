const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

main().catch(err => console.log(`OH No! Mongo Connecton Error: ${err}`));

async function main() {
  await mongoose.connect('mongodb://localhost:27017/yelp-camp');
  console.log("Mongo connection Open");

};

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection Error:'));
db.once('open', () => {
    console.log('Database connected');
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async() => {
     await Campground.deleteMany({});
    //  const c = new Campground({title: 'purple field'});
    //  await c.save();
    for (let i=0; i<300; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) +10;
        const camp = new Campground({
            author: '62781fdd1647357fc9ba79fa',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            //image: 'https://source.unsplash.com/collection/483251',
            price,
            geometry: { 
              type: 'Point', 
              coordinates: [
                cities[random1000].longitude,
                cities[random1000].latitude
              ]
            },
            images: [
                {
                  url: 'https://res.cloudinary.com/besiyata/image/upload/v1653296166/YelpCamp/pimmptbgn1f2occekd9z.jpg',
                  filename: 'YelpCamp/pimmptbgn1f2occekd9z'               
                },
                {
                  url: 'https://res.cloudinary.com/besiyata/image/upload/v1653296166/YelpCamp/jojtfoqdve5xs5qyxtxa.jpg',
                  filename: 'YelpCamp/jojtfoqdve5xs5qyxtxa'
                },
                {
                  url: 'https://res.cloudinary.com/besiyata/image/upload/v1653296166/YelpCamp/tkh2tucmsumx93rs2gmq.jpg',
                  filename: 'YelpCamp/tkh2tucmsumx93rs2gmq'
                },
                {
                  url: 'https://res.cloudinary.com/besiyata/image/upload/v1653296166/YelpCamp/n8lup8n5u1u6jsy2xrio.png',
                  filename: 'YelpCamp/n8lup8n5u1u6jsy2xrio'
                }
              ],
            description: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Possimus corporis eos sit quibusdam deleniti nostrum itaque, nulla autem, iste amet rem facere. Animi quasi libero adipisci sint voluptas, ab corrupti!",
            //price: price //<-instead this, use the next line
            price

        });
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})