const express =require('express'),
bodyParser    = require('body-parser'),
expressSanitizer= require('express-sanitizer'),
methodOverride=require('method-override'),
mongoose      = require('mongoose'),
app           = express(),
port          = 3000;

mongoose.connect('mongodb://localhost/restful_blog_app', {useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false});
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

//Mongoose model config
const blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type:Date, default:Date.now}
});

const Blog = mongoose.model("Blog", blogSchema);

//RESTful routes

app.get("/", (req,res)=>{
    res.redirect("/blogs");
})

//index route
app.get("/blogs", (req,res)=>{
    Blog.find({}, (err,blogs)=> {
        if(err){
            console.log(err)
        } else {
            res.render("index", {blogs: blogs});
        }
    })
})

//new route
app.get('/blogs/new', (req, res)=> {
    res.render('new');
})

//create new blog
app.post('/blogs', (req, res)=>{
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create({ 
        title: req.body.blog.title,
        image: req.body.blog.image,
        body: req.body.blog.body }, (err, blog)=> {
        if(err) {
            console.log(err);
        } else {
            console.log("new blog created");
        }
    })
    res.redirect('/');
})

// show route
app.get('/blogs/:id', (req, res)=> {
    Blog.findById(req.params.id, (err, foundBlog)=> {
        if(err){
            res.redirect('/');
        } else {
            res.render("show", {blog: foundBlog});
        }
    })
})

//edit route
app.get('/blogs/:id/edit', (req, res)=> {
    Blog.findById(req.params.id, (err, foundBlog) =>{
        if(err){
            res.redirect('/blogs');
        } else {
            res.render("edit", {blog: foundBlog});
        }
    })
})

//update route
app.put('/blogs/:id', (req, res)=> {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err,updatedBlog)=> {
        if(err){
            res.redirect('/blogs');
        } else {
            res.redirect('/blogs/' + req.params.id);
        }
    })
})

//delete route
app.delete('/blogs/:id', (req, res)=>{
    Blog.findByIdAndDelete(req.params.id, (err)=>{
        if(err){
            res.redirect('/blogs');
        } else {
            res.redirect('/blogs');
        }
    })
})

app.listen(port, () => {
    console.log(`Listening on ${port}`)
})
