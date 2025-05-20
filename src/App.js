import React, { useState, useEffect } from "react";

const BACKEND_URL = "https://birthday-wall-backend.onrender.com";

function App() {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [year, setYear] = useState("1");
  const [posts, setPosts] = useState([]);
  const [selectedYear, setSelectedYear] = useState("All");

  useEffect(() => {
    fetch(`${BACKEND_URL}/posts`)
      .then(res => res.json())
      .then(data => setPosts(data));
  }, []);

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
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h1>🎉 Happy Birthday Wall 🎂</h1>

      {/* Upload Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <input
          type="text"
          placeholder="Write a message..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          style={{ width: "100%", margin: "10px 0" }}
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

      {/* Filter Dropdown */}
      <div style={{ marginBottom: "20px" }}>
        <strong>Filter by Year:</strong>{" "}
        <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
          <option value="All">All Years</option>
          {[...Array(25)].map((_, i) => (
            <option key={i + 1} value={String(i + 1)}>
              Year {i + 1}
            </option>
          ))}
        </select>
      </div>

      {/* Posts */}
      {posts
        .filter((post) => selectedYear === "All" || post.year === selectedYear)
        .map((post) => (
          <Post key={post._id} post={post} />
        ))}
    </div>
  );
}

function Post({ post }) {
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");

  useEffect(() => {
    fetch(`https://birthday-wall-backend.onrender.com/comments/${post._id}`)
      .then(res => res.json())
      .then(data => setComments(data));
  }, [post._id]);

const submitComment = async (e) => {
  e.preventDefault();
  if (!commentInput.trim()) return;

  try {
    const res = await fetch(`https://birthday-wall-backend.onrender.com/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: post._id, text: commentInput }),
    });

    if (!res.ok) throw new Error("Failed to submit comment");

    setCommentInput("");

    const updated = await fetch(`https://birthday-wall-backend.onrender.com/comments/${post._id}`);
    const data = await updated.json();
    setComments(data);
  } catch (err) {
    console.error("❌ Comment error:", err);
    alert("Something went wrong posting your comment.");
  }
};

  return (
    <div style={{ border: "1px solid #ccc", padding: 10, marginBottom: 20 }}>
      {post.type === "image" ? (
        <img src={post.url} alt={post.caption} style={{ maxWidth: "100%" }} />
      ) : (
        <video controls style={{ maxWidth: "100%" }}>
          <source src={post.url} type="video/mp4" />
        </video>
      )}
      <p><strong>{post.caption}</strong></p>
      <p><em>Year {post.year}</em></p>

      {/* Comments Section */}
      <div style={{ marginTop: 10 }}>
        <form onSubmit={submitComment}>
          <input
            type="text"
            value={commentInput}
            placeholder="Add a comment..."
            onChange={(e) => setCommentInput(e.target.value)}
            style={{ width: "80%" }}
          />
          <button type="submit">Post</button>
        </form>

        {comments.map((c, i) => (
          <div key={i} style={{ fontSize: "0.9em", paddingTop: 5 }}>
            💬 {c.text}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
