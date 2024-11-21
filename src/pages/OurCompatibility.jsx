import React, { useEffect, useState } from 'react';
import '../styles/ourcompatibility.css';
import { 
  getAccessToken, 
  redirectToAuthCodeFlow, 
  fetchProfile, 
  fetchPlaylist, 
  displayRecommendations, 
  createPlaylist 
} from '../services/spotifyApi';

function OurCompatibility() {
  const clientId = "b4c01840ec424a1aa275703fc29b8fac";
  const [profile, setProfile] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [userID, setUserID] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (!code) {
        // Redirect to Spotify auth flow if no code in URL
        await redirectToAuthCodeFlow(clientId);
        return;
      }

      try {
        const accessToken = await getAccessToken(clientId, code);
        setToken(accessToken);

        const { profile, userID } = await fetchProfile(accessToken);
        setProfile(profile);
        setUserID(userID);

        const fetchedPlaylists = await fetchPlaylist(accessToken, userID);
        setPlaylists(fetchedPlaylists);

        const fetchedRecommendations = await displayRecommendations(accessToken);
        setRecommendations(fetchedRecommendations);
      } catch (error) {
        console.error("Error during Spotify API calls:", error);
      }
    }

    fetchData();
  }, []);

  const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  const handleCreatePlaylist = async (track) => {
    try {
      const playlistName = "Ivory's Recommendations";
      const playlist = await createPlaylist(token, userID, playlistName, [track.uri]);
      alert(`Playlist created: ${playlist.name}`);
    } catch (error) {
      console.error("Error creating playlist:", error);
      alert("Failed to create the playlist. Please try again.");
    }
  };

  return (
    <div>
      <main className="main-content">
        <h1 className="ivory-le">Your Spotify</h1>

        <section id="user-profile">
          {profile && profile.images?.length > 0 && (
            <div className="profile-container">
              <h2 className="username">{profile.display_name}</h2>
              <img className="profile-pic" src={profile.images[0].url} alt="User Profile" />
            </div>
          )}
        </section>

        <section id="user-playlists">
          <div className="playlists-container">
            <p>Your 3 Playlists</p>
            {playlists && shuffleArray(playlists).slice(0, 3).map((playlist) => (
              <div key={playlist.id} className="playlist-container">
                <iframe
                  title={playlist.name}
                  src={`https://open.spotify.com/embed/playlist/${playlist.id}`}
                  width="100%"
                  height="380"
                  allowTransparency="true"
                  allow="encrypted-media"
                ></iframe>
              </div>
            ))}
          </div>
        </section>

        <section id="recommendations">
          <div className="recommendations-container">
            <p>My Recommendations for You</p>
            {recommendations.map((track) => (
              <div key={track.id} className="recommendation-container">
                <iframe
                  title={track.name}
                  src={`https://open.spotify.com/embed/track/${track.id}`}
                  width="300"
                  height="80"
                  allowTransparency="true"
                  allow="encrypted-media"
                ></iframe>
                <button 
                  className="addplaylist-button"
                  onClick={() => handleCreatePlaylist(track)}
                >
                  Add to Playlist
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default OurCompatibility;
 