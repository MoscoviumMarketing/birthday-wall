import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState(null);
  const [year, setYear] = useState('1');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    const res = await fetch('http://localhost:5000/posts');
    const data = await res.json();
    setPosts(data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please upload a file.');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('caption', caption);
    formData.append('year', year);

    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      const newPost = await res.json();
      setPosts([newPost, ...posts]);
      setCaption('');
      setFile(null);
      setYear('1');
      document.querySelector('input[type="file"]').value = '';
    } catch (err) {
      alert('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>🎉 Happy Birthday Wall 🎂</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <br /><br />

        <input
          type="text"
          placeholder="Write a message..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          style={{ width: '100%', padding: '8px' }}
        />
        <br /><br />

        <label>
          Select Year:&nbsp;
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            {Array.from({ length: 25 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Year {i + 1}
              </option>
            ))}
          </select>
        </label>
        <br /><br />

        <button type="submit" disabled={loading}>
          {loading ? 'Posting...' : 'Post'}
        </button>
      </form>

      {posts.length === 0 ? (
        <p>No posts yet. Be the first to share something!</p>
      ) : (
        posts.map((post, idx) => (
          <div key={idx} style={{ marginBottom: '20px' }}>
            {post.type === 'image' ? (
              <img
                src={post.url}
                alt={post.caption || 'birthday image'}
                style={{ width: '100%', borderRadius: '8px' }}
              />
            ) : (
              <video controls style={{ width: '100%', borderRadius: '8px' }}>
                <source src={post.url} type="video/mp4" />
              </video>
            )}
            <p><strong>Year {post.year}</strong></p>
            <p>{post.caption}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default App;
