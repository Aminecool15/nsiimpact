// Testimonials Audio Player Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Audio files mapping
    const audioFiles = {
        1: 'son/merah_temoin.MP3',
        2: 'son/sarah_temoin.mp3',
        3: 'son/journaliste_temoin.mp3'
    };

    // DOM Elements
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const testimonialContent = document.getElementById('testimonial-content');
    const testimonialTexts = {
        1: document.getElementById('testimonial-1-text'),
        2: document.getElementById('testimonial-2-text'),
        3: document.getElementById('testimonial-3-text')
    };
    const noTestimonialSelected = document.getElementById('no-testimonial-selected');
    
    // Audio Player Elements
    const audioPlayer = document.getElementById('audio-player');
    const audioSource = audioPlayer.querySelector('source');
    const playBtn = document.getElementById('play-btn');
    const playIcon = playBtn.querySelector('i');
    const skipBackBtn = document.getElementById('skip-back');
    const skipForwardBtn = document.getElementById('skip-forward');
    const volumeBtn = document.getElementById('volume-btn');
    const volumeIcon = volumeBtn.querySelector('i');
    const volumeControl = document.getElementById('volume-control');
    const progressBar = document.getElementById('progress-bar');
    const currentTimeDisplay = document.getElementById('current-time');
    const durationDisplay = document.getElementById('current-testimonial-duration');
    const testimonialTitle = document.getElementById('current-testimonial-title');
    
    // Current testimonial state
    let currentTestimonial = null;
    
    // Show testimonial function
    window.showTestimonial = function(id) {
        // Reset previous active testimonial
        if (currentTestimonial) {
            document.getElementById(`testimonial-${currentTestimonial}`).classList.remove('active');
            testimonialTexts[currentTestimonial].style.display = 'none';
        }
        
        // Set new active testimonial
        currentTestimonial = id;
        document.getElementById(`testimonial-${id}`).classList.add('active');
        
        // Show testimonial content
        testimonialContent.classList.remove('hidden');
        noTestimonialSelected.style.display = 'none';
        
        // Show the correct testimonial text
        Object.values(testimonialTexts).forEach(text => text.style.display = 'none');
        testimonialTexts[id].style.display = 'block';
        
        // Set audio source
        audioSource.src = audioFiles[id];
        audioPlayer.load();
        
        // Update title based on testimonial
        const titles = {
            1: 'Merah - Enfance troublée',
            2: 'Sarah - 20 ans, ancienne étudiante',
            3: 'Journaliste - Enquête sur les recruteurs'
        };
        testimonialTitle.textContent = titles[id];
        
        // Reset player UI
        playIcon.className = 'fas fa-play';
        progressBar.style.width = '0%';
        currentTimeDisplay.textContent = '0:00';
    };
    
    // Audio player functionality
    playBtn.addEventListener('click', function() {
        if (audioPlayer.paused) {
            audioPlayer.play();
            playIcon.className = 'fas fa-pause';
        } else {
            audioPlayer.pause();
            playIcon.className = 'fas fa-play';
        }
    });
    
    // Skip backward 10 seconds
    skipBackBtn.addEventListener('click', function() {
        audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 10);
    });
    
    // Skip forward 10 seconds
    skipForwardBtn.addEventListener('click', function() {
        audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 10);
    });
    
    // Volume control
    volumeControl.addEventListener('input', function() {
        audioPlayer.volume = this.value;
        updateVolumeIcon(this.value);
    });
    
    // Mute/unmute
    volumeBtn.addEventListener('click', function() {
        if (audioPlayer.volume > 0) {
            // Store current volume before muting
            volumeBtn.dataset.prevVolume = audioPlayer.volume;
            audioPlayer.volume = 0;
            volumeControl.value = 0;
            volumeIcon.className = 'fas fa-volume-mute';
        } else {
            // Restore previous volume
            const prevVolume = volumeBtn.dataset.prevVolume || 0.7;
            audioPlayer.volume = prevVolume;
            volumeControl.value = prevVolume;
            updateVolumeIcon(prevVolume);
        }
    });
    
    // Update volume icon based on level
    function updateVolumeIcon(volume) {
        if (volume == 0) {
            volumeIcon.className = 'fas fa-volume-mute';
        } else if (volume < 0.5) {
            volumeIcon.className = 'fas fa-volume-down';
        } else {
            volumeIcon.className = 'fas fa-volume-up';
        }
    }
    
    // Update progress bar and time display
    audioPlayer.addEventListener('timeupdate', function() {
        // Update progress bar
        const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.style.width = `${percent}%`;
        
        // Update current time display
        const minutes = Math.floor(audioPlayer.currentTime / 60);
        const seconds = Math.floor(audioPlayer.currentTime % 60).toString().padStart(2, '0');
        currentTimeDisplay.textContent = `${minutes}:${seconds}`;
    });
    
    // When metadata is loaded, update duration display
    audioPlayer.addEventListener('loadedmetadata', function() {
        const minutes = Math.floor(audioPlayer.duration / 60);
        const seconds = Math.floor(audioPlayer.duration % 60).toString().padStart(2, '0');
        durationDisplay.textContent = `${minutes}:${seconds}`;
    });
    
    // When audio ends
    audioPlayer.addEventListener('ended', function() {
        playIcon.className = 'fas fa-play';
        progressBar.style.width = '0%';
    });
    
    // Click on progress bar to seek
    document.querySelector('.progress-bar').addEventListener('click', function(e) {
        const percent = e.offsetX / this.offsetWidth;
        audioPlayer.currentTime = percent * audioPlayer.duration;
    });
    
    // Set initial volume
    audioPlayer.volume = 0.7;
});
