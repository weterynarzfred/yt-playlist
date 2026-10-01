let player;

export function initPlayer({ onReady, onPlaying, onEnded, onError }) {
  window.onYouTubeIframeAPIReady = () => {
    player = new YT.Player('player', {
      height: '360',
      width: '640',
      events: {
        onReady,
        onStateChange: event => {
          if (event.data === YT.PlayerState.PLAYING) onPlaying();
          if (event.data === YT.PlayerState.ENDED && player.getCurrentTime() > 0) onEnded();
        },
        onError: event => onError(event.data),
      },
    });
  };

  const script = document.createElement('script');
  script.src = 'https://www.youtube.com/iframe_api';
  document.head.append(script);
}

export function loadVideo({ videoId, startTime, endTime }) {
  player.loadVideoById({
    videoId,
    ...(startTime && { startSeconds: Number(startTime) }),
    ...(endTime && { endSeconds: Number(endTime) }),
  });
}

export const getPlayerTitle = () => player.getVideoData().title;
