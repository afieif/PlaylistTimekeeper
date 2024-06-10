require('dotenv').config();
const express = require('express')
const cors = require('cors');
const app = express()
const port = process.env.PORT || 3001;
const apiKey = process.env.API_KEY;
const playlistApi = 'https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails'
const videoApi = 'https://www.googleapis.com/youtube/v3/videos?part=contentDetails'
const playlistDetails = 'https://www.googleapis.com/youtube/v3/playlists?part=snippet'

app.use(cors())

app.get('/',(req,res)=>{
    console.log('recvd')
    res.json({"Status":"Running"})
})

app.get('/time/:id', async (req, res) => {
    const playlistId = req.params.id;
    let nextPageToken = '';
    let time = [];

    try {
        do {
            const url = `${playlistApi}&playlistId=${playlistId}&key=${apiKey}&maxResults=50${nextPageToken ? '&pageToken=' + nextPageToken : ''}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            let videos = []
            const data = await response.json();
            videos = videos.concat(data.items.map(item => item.contentDetails.videoId));
            nextPageToken = data.nextPageToken || '';

            const videoIds = JSON.stringify(videos).replaceAll('"','').replaceAll('[','').replaceAll(']','')
            let videoUrl = `${videoApi}&id=${videoIds}&key=${apiKey}`
            const response2 = await fetch(videoUrl)
            if (!response2.ok) {
                throw new Error('Network response was not ok');
            }
            const data2 = await response2.json();
            console.log(data2.items.map(item => item.contentDetails.duration))
            time = time.concat(data2.items.map(item => item.contentDetails.duration))

        } while (nextPageToken);

        function parseDuration(duration) {
            const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
            const hours = match[1] ? parseInt(match[1]) : 0;
            const minutes = match[2] ? parseInt(match[2]) : 0;
            const seconds = match[3] ? parseInt(match[3]) : 0;
            return hours * 3600 + minutes * 60 + seconds;
        }
        
        // Convert durations to total seconds
        const totalSeconds = time.reduce((acc, t) => acc + parseDuration(t), 0);
        
        // Calculate total time in hours and minutes
        const totalMinutes = Math.floor(totalSeconds / 60);
        const totalHours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;

        const url = `${playlistDetails}&id=${playlistId}&key=${apiKey}`
        const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        const data = await response.json();
        const playlistTitle = data.items[0].snippet.title;
        const channelTitle = data.items[0].snippet.channelTitle;
        const thumbnailUrl = data.items[0].snippet.thumbnails.high.url;

        res.json({ "H": totalHours, "M": remainingMinutes, playlistTitle, channelTitle, thumbnailUrl });
        


    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})