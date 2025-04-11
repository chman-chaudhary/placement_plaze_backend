// routes/blog.js
const express = require("express");
const Blog = require("../models/Blog");
const { verifyToken } = require("../middleware/auth");
const router = express.Router();

const upload = require("../middleware/upload");

// Create Blog
router.post("/", verifyToken, upload.single("image"), async (req, res) => {
  const { title, description } = req.body;
  const image = req.file ? req.file.path : null;
  try {
    const blog = new Blog({
      userId: req.user.userId,
      title,
      description,
      image,
    });
    await blog.save();
    res.status(201).json(blog);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create blog" });
  }
});

// Read All Blogs
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ _id: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching blogs" });
  }
});

// Read Single Blog
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    res.json(blog);
  } catch (err) {
    res.status(404).json({ message: "Blog not found" });
  }
});

// Update Blog
router.put("/:id", verifyToken, upload.single("image"), async (req, res) => {
  const { title, description } = req.body;
  const image = req.file ? req.file.path : undefined;

  try {
    const blog = await Blog.findById(req.params.id);
    if (blog.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    blog.title = title || blog.title;
    blog.description = description || blog.description;
    if (image) blog.image = image;

    await blog.save();
    res.json(blog);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error updating blog" });
  }
});

// Delete Blog
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (blog.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await blog.deleteOne();
    res.json({ message: "Blog deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error deleting blog" });
  }
});

module.exports = router;
