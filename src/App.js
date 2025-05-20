import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

const BACKEND_URL = "https://birthday-wall-backend.onrender.com";

function App() {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [year, setYear] = useState("1");
  const [posts, setPosts] = useState([]);
  const [selectedYear, setSelectedYear] = useState("All");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetch(`${BACKEND_URL}/posts`)
      .then((res) => res.json())
      .then((data) => setPosts(data));
  }, []);

  useEffect(() => {
    document.body.className = darkMode ? "dark" : "";
  }, [darkMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please choose a file");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("caption", caption);
    formData.append("year", year);

    const res = await fetch(`${BACKEND_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    const newPost = await res.json();
    setPosts([newPost, ...posts]);
    setCaption("");
    setFile(null);
  };

  return (
    <div className="container">
      <header className="intro">
        <h1>25 YEARS OF CAMWAL</h1>
        <p className="subtext">
          The silver-tongued snobby gangster has been terrorising the UK since conception.
        </p>
        <p>Here are some of your highlights.</p>
        <p>Enjoy.</p>
        <div style={{ marginTop: "1rem" }}>
          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>
      </header>

      <div className="filter">
        <label htmlFor="yearSelect">Select a Year:</label>
        <select
          id="yearSelect"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="All">All Years</option>
          {[...Array(25)].map((_, i) => (
            <option key={i + 1} value={String(i + 1)}>
              Year {i + 1}
            </option>
          ))}
        </select>
      </div>

      <section className="posts">
        <AnimatePresence>
          {posts
            .filter((post) => selectedYear === "All" || post.year === selectedYear)
            .map((post) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
              >
                <Post post={post} />
              </motion.div>
            ))}
        </AnimatePresence>
      </section>

      <section className="upload">
        <h2>Add Your Own Moment</h2>
        <form onSubmit={handleSubmit}>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          <input
            type="text"
            placeholder="Write a message..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            {[...Array(25)].map((_, i) => (
              <option key={i + 1} value={String(i + 1)}>
                Year {i + 1}
              </option>
            ))}
          </select>
          <button type="submit">Post</button>
        </form>
      </section>
    </div>
  );
}

function Post({ post }) {
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");

  useEffect(() => {
    fetch(`https://birthday-wall-backend.onrender.com/comments/${post._id}`)
      .then((res) => res.json())
      .then((data) => setComments(data));
  }, [post._id]);

  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    await fetch(`https://birthday-wall-backend.onrender.com/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: post._id, text: commentInput }),
    });

    setCommentInput("");
    const res = await fetch(`https://birthday-wall-backend.onrender.com/comments/${post._id}`);
    const data = await res.json();
    setComments(data);
  };

  return (
    <div className="post-card">
      {post.type === "image" ? (
        <img src={post.url} alt={post.caption} />
      ) : (
        <video controls>
          <source src={post.url} type="video/mp4" />
        </video>
      )}
      <p className="caption"><strong>{post.caption}</strong></p>
      <p className="year">Year {post.year}</p>

      <form className="comment-form" onSubmit={submitComment}>
        <input
          type="text"
          placeholder="Add a comment..."
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
        />
        <button type="submit">Comment</button>
      </form>

      <div className="comments">
        {comments.map((c, i) => (
          <div key={i} className="comment">💬 {c.text}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
