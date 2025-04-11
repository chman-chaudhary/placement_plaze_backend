// /routes/comment.js
const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");
const Blog = require("../models/Blog");
const { verifyToken } = require("../middleware/auth");

// ✅ Create a new comment or reply
router.post("/:blogId", verifyToken, async (req, res) => {
  const { content, parentCommentId } = req.body;
  const { blogId } = req.params;

  try {
    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const comment = new Comment({
      content,
      blogId,
      userId: req.user.userId,
      parentCommentId: parentCommentId || null,
    });

    await comment.save();
    res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to post comment" });
  }
});

// ✅ Get all comments for a blog (including nested replies)
router.get("/:blogId", async (req, res) => {
  try {
    const comments = await Comment.find({ blogId: req.params.blogId })
      .populate("userId", "email profileImage")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
});

// ✅ Delete a comment
router.delete("/:commentId", verifyToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.userId.toString() !== req.user.userId)
      return res
        .status(403)
        .json({ message: "Not authorized to delete this comment" });

    await comment.deleteOne();
    await Comment.deleteMany({ parentCommentId: comment._id }); // optional: also delete replies

    res.json({ message: "Comment deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete comment" });
  }
});

module.exports = router;
