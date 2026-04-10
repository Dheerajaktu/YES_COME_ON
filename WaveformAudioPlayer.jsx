import React from 'react';
import './WaveformAudioPlayer.css';

class WaveformAudioPlayer extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      isPlaying: false,
      currentProgress: 29, // Start at 29 seconds as shown in reference
      totalDuration: 174, // 2:54 in seconds
      playbackSpeed: 1.0,
      speedIndex: 2, // Start at 1.0x
      waveBars: []
    };
    
    this.speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    this.playbackInterval = null;
    
    // Refs
    this.waveformContainerRef = React.createRef();
    this.audioRef = React.createRef();
  }
  
  componentDidMount() {
    this.generateWaveform();
    this.setupKeyboardControls();
  }
  
  componentWillUnmount() {
    this.stopPlayback();
    document.removeEventListener('keydown', this.handleKeyPress);
  }
  
  // Generate waveform bars
  generateWaveform = () => {
    const numBars = 150;
    const waveBars = [];
    
    for (let i = 0; i < numBars; i++) {
      const height = Math.random() * 60 + 20;
      const isPlayed = i < numBars * (this.state.currentProgress / this.state.totalDuration);
      
      waveBars.push({
        id: i,
        height: height,
        isPlayed: isPlayed
      });
    }
    
    this.setState({ waveBars });
  }
  
  // Update waveform position
  updateWaveform = () => {
    const { currentProgress, totalDuration, waveBars } = this.state;
    const playedBarCount = Math.floor(waveBars.length * (currentProgress / totalDuration));
    
    const updatedBars = waveBars.map((bar, index) => ({
      ...bar,
      isPlayed: index < playedBarCount
    }));
    
    this.setState({ waveBars: updatedBars });
  }
  
  // Play/Pause toggle
  togglePlayPause = () => {
    const { isPlaying } = this.state;
    
    if (!isPlaying) {
      this.startPlayback();
    } else {
      this.stopPlayback();
    }
    
    this.setState({ isPlaying: !isPlaying });
  }
  
  // Start playback
  startPlayback = () => {
    this.playbackInterval = setInterval(() => {
      const { currentProgress, totalDuration, playbackSpeed } = this.state;
      
      if (currentProgress < totalDuration) {
        this.setState(
          { currentProgress: currentProgress + playbackSpeed * 0.1 },
          () => this.updateWaveform()
        );
      } else {
        this.setState({ 
          currentProgress: totalDuration,
          isPlaying: false 
        }, () => {
          this.updateWaveform();
          this.stopPlayback();
        });
      }
    }, 100);
  }
  
  // Stop playback
  stopPlayback = () => {
    if (this.playbackInterval) {
      clearInterval(this.playbackInterval);
      this.playbackInterval = null;
    }
  }
  
  // Change playback speed
  changeSpeed = () => {
    const { speedIndex } = this.state;
    const newSpeedIndex = (speedIndex + 1) % this.speeds.length;
    const newSpeed = this.speeds[newSpeedIndex];
    
    this.setState({
      speedIndex: newSpeedIndex,
      playbackSpeed: newSpeed
    });
  }
  
  // Rewind 10 seconds
  rewind = () => {
    this.setState(
      prevState => ({
        currentProgress: Math.max(0, prevState.currentProgress - 10)
      }),
      () => this.updateWaveform()
    );
  }
  
  // Forward 10 seconds
  forward = () => {
    this.setState(
      prevState => ({
        currentProgress: Math.min(prevState.totalDuration, prevState.currentProgress + 10)
      }),
      () => this.updateWaveform()
    );
  }
  
  // Seek on waveform click
  handleWaveformClick = (e) => {
    if (this.waveformContainerRef.current) {
      const rect = this.waveformContainerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percent = clickX / rect.width;
      const newProgress = percent * this.state.totalDuration;
      
      this.setState(
        { currentProgress: newProgress },
        () => this.updateWaveform()
      );
    }
  }
  
  // Format time helper
  formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  
  // Keyboard controls
  setupKeyboardControls = () => {
    document.addEventListener('keydown', this.handleKeyPress);
  }
  
  handleKeyPress = (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      this.togglePlayPause();
    } else if (e.code === 'ArrowLeft') {
      this.rewind();
    } else if (e.code === 'ArrowRight') {
      this.forward();
    }
  }
  
  render() {
    const { isPlaying, currentProgress, totalDuration, playbackSpeed, waveBars } = this.state;
    const timeBubblePosition = (currentProgress / totalDuration) * 100;
    
    return (
      <div className="waveform-player-body">
        <div className="audio-player">
          <div className="header">
            <div className="left-tags">
              <span className="ref-id">Ref. ID - 75433</span>
              <span className="tag neutral">Neutral</span>
              <span className="tag resolved">Resolved</span>
            </div>
            <div className="right-ref">Reference ID: STR-20251124-MUM-09</div>
          </div>

          <div 
            className="waveform-container" 
            ref={this.waveformContainerRef}
            onClick={this.handleWaveformClick}
          >
            <div className="waveform">
              {waveBars.map((bar) => (
                <div
                  key={bar.id}
                  className={`wave-bar ${bar.isPlayed ? 'played' : 'inactive'}`}
                  style={{ height: `${bar.height}%` }}
                />
              ))}
            </div>
            
            <div 
              className="time-bubble"
              style={{ left: `${timeBubblePosition}%` }}
            >
              {this.formatTime(currentProgress)}
            </div>
          </div>

          <div className="controls-section">
            <div className="controls">
              <button 
                className="play-pause-btn" 
                onClick={this.togglePlayPause}
              >
                {!isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="player-svg">
                    <path d="M8 5v14l11-7z" fill="#5a4a35"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="player-svg">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="#5a4a35"/>
                  </svg>
                )}
              </button>

              <div 
                className="speed-control" 
                onClick={this.changeSpeed}
              >
                {playbackSpeed}x
              </div>

              <button 
                className="control-btn" 
                onClick={this.rewind}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="player-svg">
                  <path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" fill="#5a5a5a"/>
                </svg>
              </button>

              <button 
                className="control-btn" 
                onClick={this.forward}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="player-svg">
                  <path d="M12.01 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z" fill="#5a5a5a"/>
                </svg>
              </button>
            </div>

            <div className="time-display">
              <span>{this.formatTime(currentProgress)}</span>
              <span>/</span>
              <span>{this.formatTime(totalDuration)}</span>

              <button className="menu-btn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="player-svg">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="#5a5a5a"/>
                </svg>
              </button>
            </div>
          </div>

          <audio ref={this.audioRef} src="" preload="metadata"></audio>
        </div>
      </div>
    );
  }
}

export default WaveformAudioPlayer;
