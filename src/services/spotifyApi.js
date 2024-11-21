// spotifyApi.js

async function getAccessToken(clientId, code) {
    const verifier = localStorage.getItem("verifier");

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", "https://ivoryle82.github.io/portfolio/compatibility");
    params.append("code_verifier", verifier);

    try {
        const result = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params
        });

        if (!result.ok) {
            throw new Error(`Failed to fetch access token: ${result.status} ${result.statusText}`);
        }

        const data = await result.json();
        console.log("Access Token Retrieved:", data.access_token);
        return data.access_token;
    } catch (error) {
        console.error("Error fetching access token:", error);
        throw error; // Rethrow to handle it in the calling function
    }
}


async function redirectToAuthCodeFlow(clientId) {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", "https://ivoryle82.github.io/portfolio/compatibility");
    params.append("scope", "user-read-private user-read-email playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateCodeVerifier(length) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

async function fetchProfile(token) {
    try {
        const result = await fetch("https://api.spotify.com/v1/me", {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` }
        });

        const profile = await result.json();
        console.log("Fetched Profile:", profile);
        const userID = profile.id;

        return { profile, userID };
        
    } catch (error) {
        console.error("Error fetching profile:", error);
        // Optionally handle the error here
        return { profile: null, userID: null };
    }
}

async function fetchPlaylist(token, userID) {
    try {
        const result = await fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` }
        });

        const playlistsResponse = await result.json();
        const playlists = playlistsResponse.items;
        
        // Fetch tracks for each playlist
        const playlistsWithTracks = await Promise.all(playlists.map(async (playlist) => {
            const tracksResult = await fetch(playlist.tracks.href, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!tracksResult.ok) {
                throw new Error(`Failed to fetch tracks for playlist ${playlist.id}: ${tracksResult.status} ${tracksResult.statusText}`);
            }
            const tracksData = await tracksResult.json();
            return { ...playlist, tracks: tracksData };
        }));

        return playlistsWithTracks;
    } catch (error) {
        console.error("Error fetching playlists:", error);
        return null;
    }
}

async function getAvailableGenreSeeds(token) {
    const url = 'https://api.spotify.com/v1/recommendations/available-genre-seeds';

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch available genre seeds: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
        } catch (error) {
            console.error('Error fetching available genre seeds:', error);
            return null;
        }
    }

    async function createPlaylist(token, userID, playlistName, tracks) {
        const url = `https://api.spotify.com/v1/users/${userID}/playlists`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`, // Assuming token is accessible
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: playlistName,
                    public: false, // Set to true if you want the playlist to be public
                    description: 'This is based on the genres that you listen too'
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to create playlist: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const playlistId = data.id;

            // Add tracks to the playlist
            if (tracks && tracks.length > 0) {
                await addTracksToPlaylist(token, playlistId, tracks); // Pass playlistId here
            }

            return data;
        } catch (error) {
            console.error('Error creating playlist:', error);
            return null;
        }
    }

    async function addTracksToPlaylist(token, playlistID, tracks) {
        const url = `https://api.spotify.com/v1/playlists/${playlistID}/tracks`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`, // Assuming token is accessible
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    uris: tracks
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to add tracks to playlist: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error adding tracks to playlist:', error);
            return null;
        }
    }


    async function displayRecommendations(token) {
        const queryParams = new URLSearchParams();
    
        // Fetch available genre seeds
        const availableGenres = await getAvailableGenreSeeds(token);
        if (availableGenres && availableGenres.genres && availableGenres.genres.length > 0) {
            const randomGenre = availableGenres.genres[Math.floor(Math.random() * availableGenres.genres.length)];
            queryParams.append('seed_genres', randomGenre);
        }
        queryParams.append('limit', 5); // Limit set to 5
    
        const url = `https://api.spotify.com/v1/recommendations?${queryParams.toString()}`;
    
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
    
            if (!response.ok) {
                throw new Error(`Failed to fetch recommendations: ${response.status} ${response.statusText}`);
            }
    
            const data = await response.json();
            // Display recommendation list
            console.log('Recommendations:', data.tracks);
            return data.tracks;
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            return null;
        }
    }
    
    // Display recommendation list and ask user if they want to create playlist
    async function displayRecommendationsAndAskCreatePlaylist(token,userID) {
        const tracks = await displayRecommendations(token);
        if (tracks && tracks.length > 0) {
            /* eslint-disable no-restricted-globals */
            const createPlaylist = confirm('Do you want to create a playlist with these recommendations?');
            /* eslint-enable no-restricted-globals */

            if (createPlaylist) {
                // Call function to create playlist
                createPlaylist(token, userID, "Ivory's Recommended Playlist", tracks.map(track => track.uri));
            } else {
                console.log('Playlist creation cancelled.');
            }
        } else {
            console.log('No recommendations available.');
        }
    }
    

export { getAccessToken, redirectToAuthCodeFlow, fetchProfile, fetchPlaylist, generateCodeVerifier, displayRecommendations, displayRecommendationsAndAskCreatePlaylist, createPlaylist};
