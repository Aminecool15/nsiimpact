
// ==============================================
// QUIZ MODULE
// ==============================================
const Quiz = (() => {
    // Configuration
    const questions = [
        {
            question: "En quelle année Daesh a-t-il proclamé son « califat » ?",
            choices: ["2006", "2014", "2018"],
            correct: 1,
            explanation: "Daesh a proclamé son califat en juin 2014 après avoir capturé Mossoul."
        },
        {
            question: "Quelle ville a servi de capitale de facto à Daesh ?",
            choices: ["Baghdad", "Damascus", "Mosul", "Raqqa"],
            correct: 3,
            explanation: "Raqqa en Syrie est devenue la capitale de facto du soi-disant califat de Daesh."
        },
        {
            question: "De quelle organisation terroriste Daesh est-il à l'origine ?",
            choices: ["Al-Qaeda", "Taliban", "Hezbollah", "Hamas"],
            correct: 0,
            explanation: "Daesh est issu d'Al-Qaïda en Irak, mais s'est ensuite séparé de l'organisation principale."
        },
        {
            question: "Environ combien de combattants étrangers ont rejoint Daesh à son apogée ?",
            choices: ["5,000", "20,000", "40,000", "100,000"],
            correct: 2,
            explanation: "Les estimations de l'ONU suggèrent qu'environ 40 000 combattants étrangers ont rejoint Daesh en provenance de plus de 100 pays."
        }
    ];

    // State
    let currentQuestionIndex = 0;
    let score = 0;
    let quizCompleted = false;

    // DOM Elements
    const elements = {
        question: document.getElementById('current-question'),
        choices: document.getElementById('quiz-choices'),
        feedback: document.getElementById('quiz-feedback'),
        nextBtn: document.getElementById('next-question')
    };

    // Initialize the quiz
    function init() {
        loadQuestion(currentQuestionIndex);
        elements.nextBtn.addEventListener('click', handleNextQuestion);
    }

    // Load a question
    function loadQuestion(index) {
        resetQuizUI();
        const question = questions[index];
        
        elements.question.textContent = question.question;
        elements.choices.innerHTML = '';
        
        question.choices.forEach((choice, i) => {
            const button = document.createElement('button');
            button.className = 'quiz-btn';
            button.textContent = choice;
            button.dataset.index = i;
            button.addEventListener('click', () => checkAnswer(button, i === question.correct));
            elements.choices.appendChild(button);
        });
    }

    // Check the selected answer
    function checkAnswer(button, isCorrect) {
        const buttons = elements.choices.querySelectorAll('.quiz-btn');
        buttons.forEach(btn => btn.disabled = true);

        if (isCorrect) {
            button.style.backgroundColor = '#19ba67';
            button.style.color = '#fff';
            elements.feedback.textContent = 'Correct! ' + questions[currentQuestionIndex].explanation;
            elements.feedback.style.color = '#19ba67';
            score++;
        } else {
            button.style.backgroundColor = '#ee6872';
            button.style.color = '#fff';
            elements.feedback.textContent = 'Incorrect. ' + questions[currentQuestionIndex].explanation;
            elements.feedback.style.color = '#ee6872';
            
            // Highlight correct answer
            buttons[questions[currentQuestionIndex].correct].style.backgroundColor = '#19ba67';
            buttons[questions[currentQuestionIndex].correct].style.color = '#fff';
        }

        // Show next button or finish quiz
        if (currentQuestionIndex < questions.length - 1) {
            elements.nextBtn.style.display = 'inline-block';
        } else {
            finishQuiz();
        }
    }

    // Handle next question
    function handleNextQuestion() {
        if (quizCompleted) {
            restartQuiz();
            return;
        }
        
        currentQuestionIndex++;
        loadQuestion(currentQuestionIndex);
    }

    // Finish the quiz
    function finishQuiz() {
        quizCompleted = true;
        elements.feedback.textContent += ` Quiz complete! Final score: ${score}/${questions.length}`;
        elements.nextBtn.textContent = 'Restart Quiz';
        elements.nextBtn.style.display = 'inline-block';
    }

    // Restart the quiz
    function restartQuiz() {
        currentQuestionIndex = 0;
        score = 0;
        quizCompleted = false;
        elements.nextBtn.textContent = 'Next Question';
        loadQuestion(currentQuestionIndex);
    }

    // Reset UI elements
    function resetQuizUI() {
        elements.feedback.textContent = '';
        elements.feedback.style.color = '';
        elements.nextBtn.style.display = 'none';
    }

    // Public API
    return {
        init
    };
})();

// ==============================================
// TESTIMONIALS MODULE
// ==============================================
const Testimonials = (() => {
    // Configuration
    const testimonials = [
        {
            id: 1,
            title: "Merah - Enfance troublée",
            audio: "../../son/merah_temoin.MP3",
            duration: "6:15"
        },
        {
            id: 2,
            title: "Sarah - 20 ans, ancienne étudiante",
            audio: "../../son/sarah_temoin.mp3",
            duration: "6:15"
        },
        {
            id: 3,
            title: "Journaliste - Enquête sur les recruteurs",
            audio: "../../son/journaliste_temoin.mp3",
            duration: "8:42"
        }
    ];

    // State
    let currentTestimonial = null;
    let isPlaying = false;

    // DOM Elements
    const elements = {
        audioPlayer: document.getElementById('audio-player'),
        audioSource: document.querySelector('#audio-player source'),
        playBtn: document.getElementById('play-btn'),
        playIcon: document.querySelector('#play-btn i'),
        skipBackBtn: document.getElementById('skip-back'),
        skipForwardBtn: document.getElementById('skip-forward'),
        volumeBtn: document.getElementById('volume-btn'),
        volumeIcon: document.querySelector('#volume-btn i'),
        volumeControl: document.getElementById('volume-control'),
        progressBar: document.getElementById('progress-bar'),
        currentTime: document.getElementById('current-time'),
        duration: document.getElementById('current-testimonial-duration'),
        title: document.getElementById('current-testimonial-title'),
        content: document.getElementById('testimonial-content'),
        noSelection: document.getElementById('no-testimonial-selected')
    };

    // Initialize testimonials
    function init() {
        setupEventListeners();
        setupTestimonialCards();
        elements.audioPlayer.volume = 0.7;
    }

    // Setup event listeners
    function setupEventListeners() {
        elements.playBtn.addEventListener('click', togglePlay);
        elements.skipBackBtn.addEventListener('click', () => seek(-10));
        elements.skipForwardBtn.addEventListener('click', () => seek(10));
        elements.volumeControl.addEventListener('input', updateVolume);
        elements.volumeBtn.addEventListener('click', toggleMute);
        elements.progressBar.parentElement.addEventListener('click', handleProgressBarClick);
        elements.audioPlayer.addEventListener('timeupdate', updateProgress);
        elements.audioPlayer.addEventListener('loadedmetadata', updateDuration);
        elements.audioPlayer.addEventListener('ended', handleAudioEnd);
    }

    // Setup testimonial cards
    function setupTestimonialCards() {
        document.querySelectorAll('.testimonial-card').forEach(card => {
            card.addEventListener('click', () => showTestimonial(parseInt(card.id.split('-')[1])));
        });
    }

    // Show testimonial (public method)
    window.showTestimonial = function(id) {
        const testimonial = testimonials.find(t => t.id === id);
        if (!testimonial) return;

        // Update UI
        document.querySelectorAll('.testimonial-card').forEach(card => {
            card.classList.toggle('active', card.id === `testimonial-${id}`);
        });

        elements.content.classList.remove('hidden');
        elements.noSelection.style.display = 'none';
        document.getElementById(`testimonial-${id}-text`).style.display = 'block';
        
        // Update audio player
        elements.audioSource.src = testimonial.audio;
        elements.audioPlayer.load();
        elements.title.textContent = testimonial.title;
        elements.duration.textContent = testimonial.duration;
        
        // Reset player state
        elements.playIcon.className = 'fas fa-play';
        elements.progressBar.style.width = '0%';
        elements.currentTime.textContent = '0:00';
        
        currentTestimonial = id;
    };

    // Toggle play/pause
    function togglePlay() {
        if (elements.audioPlayer.paused) {
            elements.audioPlayer.play();
            elements.playIcon.className = 'fas fa-pause';
            isPlaying = true;
        } else {
            elements.audioPlayer.pause();
            elements.playIcon.className = 'fas fa-play';
            isPlaying = false;
        }
    }

    // Seek audio
    function seek(seconds) {
        elements.audioPlayer.currentTime += seconds;
    }

    // Update volume
    function updateVolume() {
        elements.audioPlayer.volume = this.value;
        updateVolumeIcon(this.value);
    }

    // Toggle mute
    function toggleMute() {
        if (elements.audioPlayer.volume > 0) {
            elements.volumeBtn.dataset.prevVolume = elements.audioPlayer.volume;
            elements.audioPlayer.volume = 0;
            elements.volumeControl.value = 0;
            elements.volumeIcon.className = 'fas fa-volume-mute';
        } else {
            const prevVolume = elements.volumeBtn.dataset.prevVolume || 0.7;
            elements.audioPlayer.volume = prevVolume;
            elements.volumeControl.value = prevVolume;
            updateVolumeIcon(prevVolume);
        }
    }

    // Update volume icon
    function updateVolumeIcon(volume) {
        if (volume == 0) {
            elements.volumeIcon.className = 'fas fa-volume-mute';
        } else if (volume < 0.5) {
            elements.volumeIcon.className = 'fas fa-volume-down';
        } else {
            elements.volumeIcon.className = 'fas fa-volume-up';
        }
    }

    // Update progress bar
    function updateProgress() {
        const percent = (elements.audioPlayer.currentTime / elements.audioPlayer.duration) * 100;
        elements.progressBar.style.width = `${percent}%`;
        elements.currentTime.textContent = formatTime(elements.audioPlayer.currentTime);
    }

    // Update duration display
    function updateDuration() {
        elements.duration.textContent = formatTime(elements.audioPlayer.duration);
    }

    // Handle audio end
    function handleAudioEnd() {
        elements.playIcon.className = 'fas fa-play';
        isPlaying = false;
    }

    // Handle progress bar click
    function handleProgressBarClick(e) {
        const percent = e.offsetX / this.offsetWidth;
        elements.audioPlayer.currentTime = percent * elements.audioPlayer.duration;
    }

    // Format time (seconds to MM:SS)
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Public API
    return {
        init
    };
})();

// ==============================================
// MYTH OR REALITY MODULE
// ==============================================
const MythOrReality = (() => {
    function init() {
        document.querySelectorAll('.myth-toggle').forEach(toggle => {
            toggle.addEventListener('click', function() {
                const mythId = this.getAttribute('data-myth');
                const answer = document.getElementById(`myth-answer-${mythId}`);
                answer.classList.toggle('show');
            });
        });
    }

    return {
        init
    };
})();

// ==============================================
// SCROLL ANIMATIONS
// ==============================================
const ScrollAnimations = (() => {
    function init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.content-section').forEach(section => {
            observer.observe(section);
        });
    }

    return {
        init
    };
})();

// ==============================================
// MAIN INITIALIZATION
// ==============================================
document.addEventListener('DOMContentLoaded', () => {
    Quiz.init();
    Testimonials.init();
    MythOrReality.init();
    ScrollAnimations.init();
});
