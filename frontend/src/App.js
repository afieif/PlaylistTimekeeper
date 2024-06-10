import './App.css';
import { useState } from 'react';

function App() {
  const [playlist, setPlaylist] = useState('');
  const [result, setResult] = useState(null);
  const [loading,setLoading] = useState(false);

  async function getTime() {
    try {
      setLoading(true);
      const playlistId = extractPlaylistId(playlist);
      const response = await fetch(`https://playlisttimekeeper.onrender.com/time/${playlistId}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log(data);
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function extractPlaylistId(urlOrId) {
    const match = urlOrId.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:playlist\?list=|watch\?v=[^&]*&list=|embed\/videoseries\?list=|user\/(?:[^\/]*)\/(?:[^\/]*)\/[^\/]*\/[^\/]*\/([^\/?&]*))(.*)/);
    if (match && match[2]) {
      return match[2];
    }
    return urlOrId;
  }

  return (
    <div className="App">
      <h1>Playlist Timekeeper ⏰</h1>
      <div className='input'>
        <input 
          type='text' 
          value={playlist} 
          onChange={e => setPlaylist(e.target.value)} 
          placeholder="Enter Playlist ID or URL" 
        />
        <button onClick={getTime}>Check</button>
      </div>
      {result && (
        <div className="result">
          <img src={result.thumbnailUrl} alt={result.playlistTitle} />
          <h3>{result.playlistTitle}</h3>
          <p>Channel: {result.channelTitle}</p>
          <p>Total time: {result.H} hours and {result.M} minutes</p>
        </div>
      )}
      {loading && (<div className="skeleton">
          <div className="skeleton-thumbnail"></div>
          <div className="skeleton-text"></div>
          <div className="skeleton-text short"></div>
        </div>)}
    </div>
  );
}

export default App;
