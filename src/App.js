import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { useWindowSize } from "@react-hook/window-size";
import "./App.css";

const BACKEND_URL = "https://birthday-wall-backend.onrender.com";

function App() {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [year, setYear] = useState("1");
  const [posts, setPosts] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [width, height] = useWindowSize();

  useEffect(() => {
    fetch(`${BACKEND_URL}/posts`)
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort((a, b) => a.year - b.year);
        setPosts(sorted);
      });
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
    setPosts((prev) => [...prev, newPost].sort((a, b) => a.year - b.year));
    setCaption("");
    setFile(null);
  };

  const revealVideo = () => {
    setShowVideo(true);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
  };

  return (
    <div className="container">
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={300}
          recycle={false}
        />
      )}

      <header className="intro">
        <h1>25 YEARS OF CAMWAL</h1>

        <div className="intro-video">
          {!showVideo ? (
            <button
              onClick={revealVideo}
              className="press-button"
            >
              🎁 PRESS ME
            </button>
          ) : (
            <>
              <p className="video-caption">📽️ Cameo from James Buckley</p>
              <video
                controls
                autoPlay
                style={{
                  maxWidth: "100%",
                  borderRadius: "12px",
                  margin: "1rem 0",
                }}
              >
                <source
                  src="https://res.cloudinary.com/dcq80vvq9/video/upload/v1747924051/camwal-intro.mp4_nscm3j.mp4"
                  type="video/mp4"
                />
              </video>
            </>
          )}
        </div>

        <p className="subtext">
          THE SILVER-TONGUED SNOBBY GANGSTER HAS BEEN TERRORISING THE UK SINCE CONCEPTION.
        </p>
        <p>HERE ARE SOME OF YOUR HIGHLIGHTS.</p>
        <p>ENJOY.</p>

        <div style={{ marginTop: "1rem" }}>
          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>
      </header>

      <section className="posts">
        {posts.map((post) => (
          <motion.div
            key={post._id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Post post={post} />
          </motion.div>
        ))}
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
          <div key={i} className="comment">
            💬 {c.text}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
