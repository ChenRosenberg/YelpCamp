const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});
const { cloudinary } = require('../cloudinary');


module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
};

module.exports.renderNewForm = (req, res) => {
    // if(!req.isAuthenticated()){
    //     req.flash('error', 'You must be signed in');
    //     return res.redirect('/login');
    // }
    res.render('campgrounds/new');
};

module.exports.createCampground = async (req, res, next) => {
    //res.send(req.body); //<- this require that line:
    // router.use(express.urlencoded({extended: true}));
    //if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const geoData = await geocoder.forwardGeocode({
        //query: 'Yosemite, CA',
        query: req.body.campground.location,
        limit: 1
    }).send()
    // console.log(geoData);
    // res.send('OK!');
    //res.send(geoData.body.features[0].geometry.coordinates);    
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map( f => ({url: f.path, filename: f.filename}));
    // req.files -> from mullter
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res) => {
    //res.render('campgrounds/show');
    // console.log(req.params.id);
    const id = req.params.id;
    const campground = await Campground.findById( id ).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        } //this is the way to populate the author of the review
    }).populate('author');
    //console.log(campground);
    if(!campground){
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground }); 
};
module.exports.renderEditForm = async (req, res) => {
    const campground = await Campground.findById( req.params.id );
    if(!campground){
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }      
    res.render('campgrounds/edit', { campground }); 
};

module.exports.updateCampground = async (req,res) => {
    // res.send("It Worked");
    const { id } = req.params;
    console.log(req.body);
    //const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }); //instead we will use the next 2 lines, to check how is the update user
    // const campground = await Campground.findById(id);
    // if(!campground.author.equals(req.user._id)) {
    //     req.flash('error', 'You do not have permission to do that!')
    //     return res.redirect(`/campgrounds/${id}`);
    // }
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map( f => ({url: f.path, filename: f.filename}));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for(let filename of req.body.deleteImages ){
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}});
        console.log(campground);
    }
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${campground._id}`);

};

module.exports.deleteCampground = async(req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete( id );
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds');
};