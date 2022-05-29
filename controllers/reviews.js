const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    //res.send('You made it');
    const { id } = req.params;
    const campground = await Campground.findById( id );
    //res.send(campground);
    const review = new Review(req.body.review);
    //res.send(review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${campground._id}/`);
};

module.exports.deleteReview = async (req, res) => {
    //res.send('Delete me!');
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/campgrounds/${id}`)
};