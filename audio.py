import yt_dlp

def download_mp3(url):
    # Configuration options for yt-dlp
    ydl_opts = {
        'format': 'bestaudio/best',  # Select the best quality audio
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',   # Convert to MP3
            'preferredquality': '192', # Bitrate
        }],
        'outtmpl': '%(title)s.%(ext)s', # Name the file based on the video title
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

if __name__ == "__main__":
    video_url = input("Enter the YouTube URL: ")
    download_mp3(video_url)