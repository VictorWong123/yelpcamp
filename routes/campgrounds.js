const express = require('express')
const router = express.Router()
const catchAsync = require('.././utils/catchAsync')
const Campground = require('.././models/campground')
const { campgroundSchema, reviewSchema } = require('.././schemas')


const validateCampground = (req, res, next) => {

    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new Error(msg);
    }
    next();
};


router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find()
    res.render('campgrounds/index', { campgrounds })
}))

router.get('/new', (req, res) => {
    res.render('campgrounds/new')
})
router.post('/', validateCampground, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid campground data', 400)

    const campground = new Campground(req.body.campground)
    await campground.save()
    req.flash("success", "Successfully made new campground")
    res.redirect(`/campgrounds/${campground._id}`)
}))
router.get('/:id', catchAsync(async (req, res) => {
    const campgrounds = await Campground.findById(req.params.id).populate('reviews')
    if (!campgrounds) {
        req.flash('error', "Cannot find campground")
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campgrounds })
}))
router.get('/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground })
}))

router.put('/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    req.flash("success", "Successfully updated campground")
    res.redirect(`/campgrounds/${campground._id}`)

}))

router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', "Successfully deleted campground")


    res.redirect('/campgrounds');
}))

module.exports = router