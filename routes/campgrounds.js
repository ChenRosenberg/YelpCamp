const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const multer  = require('multer');
const {storage} = require('../cloudinary'); //not need to add 'index' file, node look for inex file
// const upload = multer({ dest: 'uploads/' });
const upload = multer({ storage });

const Campground = require('../models/campground');
const { route } = require('express/lib/application');

const printReq = (req, res, next) => {
    console.log(req.body);
    next();
}
router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, printReq, upload.array('image'), validateCampground,  catchAsync(campgrounds.createCampground))
    // .post(upload.array('image'), (req, res) => {
    //     console.log(req.body, req.files);
    //     res.send('It Worked?!')
    // })
// router.get('/', catchAsync(campgrounds.index));
// router.post('/', isLoggedIn, printReq, validateCampground, catchAsync(campgrounds.createCampground));

// Or We will use 'try{}catch{}'
// router.post('/campgrounds', async (req, res, next) => {
//     //res.send(req.body); //<- this require that line:
//     // router.use(express.urlencoded({extended: true}));
//     try {
//         const campground = new Campground(req.body.campground);
//         await campground.save();
//         res.redirect(`/campgrounds/${campground._id}`);
//     }catch(e){
//         next(e);
//     }
// });

//this have to be before going to id!!!
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

    //instead the next three lines:
// router.get('/:id', catchAsync(campgrounds.showCampground));

// router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground));

// router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;