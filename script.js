const appDescriptions = {
    ai: {
        title: "FLAT AI - Your Smart Assistant!",
        description: "Chat with our FLAT to get answers, solve problems, and explore ideas in a conversational way."
    },
    carbon: {
        title: "Carbon Calculator - Track Your Impact!",
        description: "Calculate and monitor your carbon footprint from daily activities and discover ways to reduce your environmental impact."
    },
    notes: {
        title: "Smart Notes - Organize Your Thoughts!",
        description: "Create, organize, and manage your notes efficiently with our intuitive note-taking application."
    },
    chat: {
        title: "Person to Person Chat - Connect!",
        description: "Connect and chat with people in real-time through our secure messaging platform."
    },
    weather: {
        title: "Weather Forecast - Stay Informed!",
        description: "Get accurate weather forecasts, real-time updates, and weather alerts for your location."
    },
    news: {
        title: "Latest News - Stay Updated!",
        description: "Stay informed with the latest news from around the world, categorized by your interests."
    }
};

// Smart Audio Manager - Video Always Plays, Audio on User Input
class SmartAudioManager {
    constructor(videoElement) {
        this.video = videoElement;
        this.audioEnabled = false;
        this.userHasInteracted = false;
        this.init();
    }

    init() {
        this.setupVideo();
        this.createAudioControls();
        this.bindUserInteractionEvents();
        this.startVideoPlayback();
    }

    setupVideo() {
        if (!this.video) return;

        // Ensure video plays but starts muted
        this.video.muted = true;
        this.video.loop = true;
        this.video.autoplay = true;
        this.video.volume = 0.8;
        
        console.log('📹 Video setup complete - will play muted');
    }

    createAudioControls() {
        // Create audio toggle button
        const audioButton = document.createElement('button');
        audioButton.id = 'audioToggle';
        audioButton.className = 'audio-toggle';
        audioButton.innerHTML = '🔇';
        audioButton.title = 'Click to enable audio';
        
        // Create audio indicator
        const audioIndicator = document.createElement('div');
        audioIndicator.id = 'audioIndicator';
        audioIndicator.className = 'audio-indicator';
        audioIndicator.innerHTML = 'Click anywhere to enable audio';
        
        document.body.appendChild(audioButton);
        document.body.appendChild(audioIndicator);

        // Bind audio toggle functionality
        audioButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleAudio();
        });
    }

    bindUserInteractionEvents() {
        // Define interaction events that can enable audio
        const interactionEvents = [
            'click', 'keydown', 'touchstart', 'mousedown'
        ];

        interactionEvents.forEach(eventType => {
            document.addEventListener(eventType, () => {
                if (!this.userHasInteracted) {
                    this.onFirstUserInteraction();
                }
            }, { once: false });
        });

        // Special handling for clicks anywhere on the page
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.audio-toggle')) {
                this.enableAudioOnClick();
            }
        });
    }

    onFirstUserInteraction() {
        this.userHasInteracted = true;
        console.log('🎯 First user interaction detected');
        
        // Update UI to show audio is available
        const indicator = document.getElementById('audioIndicator');
        if (indicator) {
            indicator.style.opacity = '0.7';
            indicator.innerHTML = 'Audio ready - click 🔊 to enable';
        }
    }

    enableAudioOnClick() {
        if (!this.userHasInteracted || this.audioEnabled) return;

        console.log('🔊 Enabling audio via user click');
        this.enableAudio();
    }

    toggleAudio() {
        if (this.audioEnabled) {
            this.disableAudio();
        } else {
            this.enableAudio();
        }
    }

    enableAudio() {
        if (!this.video || this.audioEnabled) return;

        try {
            this.video.muted = false;
            this.audioEnabled = true;
            
            // Update UI
            const button = document.getElementById('audioToggle');
            const indicator = document.getElementById('audioIndicator');
            
            if (button) {
                button.innerHTML = '🔊';
                button.title = 'Click to disable audio';
                button.classList.add('audio-active');
            }
            
            if (indicator) {
                indicator.style.display = 'none';
            }

            console.log('✅ Audio enabled successfully');
            
            // Visual feedback
            this.showAudioFeedback('Audio Enabled', '#4ade80');
            
        } catch (error) {
            console.error('Failed to enable audio:', error);
        }
    }

    disableAudio() {
        if (!this.video || !this.audioEnabled) return;

        this.video.muted = true;
        this.audioEnabled = false;
        
        // Update UI
        const button = document.getElementById('audioToggle');
        const indicator = document.getElementById('audioIndicator');
        
        if (button) {
            button.innerHTML = '🔇';
            button.title = 'Click to enable audio';
            button.classList.remove('audio-active');
        }
        
        if (indicator) {
            indicator.style.display = 'block';
            indicator.innerHTML = 'Audio disabled - click 🔊 to enable';
        }

        console.log('🔇 Audio disabled');
        
        // Visual feedback
        this.showAudioFeedback('Audio Disabled', '#ef4444');
    }

    startVideoPlayback() {
        if (!this.video) return;

        // Ensure video starts playing (muted)
        const playPromise = this.video.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('✅ Video playing successfully (muted)');
            }).catch(error => {
                console.log('❌ Video autoplay failed:', error);
                // Try again after a short delay
                setTimeout(() => {
                    this.video.play().catch(() => {});
                }, 1000);
            });
        }
    }

    showAudioFeedback(message, color) {
        // Create temporary feedback element
        const feedback = document.createElement('div');
        feedback.className = 'audio-feedback';
        feedback.textContent = message;
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${color};
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            font-weight: 600;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
            font-family: 'Inter', sans-serif;
            font-size: 14px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        `;
        
        document.body.appendChild(feedback);
        
        // Animate in
        setTimeout(() => feedback.style.opacity = '1', 10);
        
        // Remove after delay
        setTimeout(() => {
            feedback.style.opacity = '0';
            setTimeout(() => feedback.remove(), 300);
        }, 2000);
    }
}

// Your existing classes remain the same
class EcoCarousel {
    constructor() {
        this.currentIndex = 0;
        this.cards = document.querySelectorAll('.app-card');
        this.totalCards = this.cards.length;
        this.isAnimating = false;
        this.init();
    }

    init() {
        this.updateCarousel();
        this.bindEvents();
        this.updateDescription();
    }

    bindEvents() {
        const carousel = document.querySelector('.app-carousel-container');
        
        carousel.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (this.isAnimating) return;
            
            if (e.deltaY > 0) {
                this.next();
            } else {
                this.prev();
            }
        });

        let startY = 0;
        carousel.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
        });

        carousel.addEventListener('touchend', (e) => {
            if (this.isAnimating) return;
            
            const endY = e.changedTouches[0].clientY;
            const diffY = startY - endY;
            
            if (Math.abs(diffY) > 50) {
                if (diffY > 0) {
                    this.next();
                } else {
                    this.prev();
                }
            }
        });

        this.cards.forEach((card, index) => {
            card.addEventListener('click', () => {
                if (index === this.currentIndex) {
                    const appName = card.getAttribute('data-app');
                    window.location.href = `${appName}.html`;
                } else {
                    this.goToSlide(index);
                }
            });
        });
    }

    updateCarousel() {
        this.isAnimating = true;

        this.cards.forEach((card, index) => {
            card.classList.remove('active', 'prev', 'next');
            
            if (index === this.currentIndex) {
                card.classList.add('active');
            } else if (index === this.getPrevIndex()) {
                card.classList.add('prev');
            } else if (index === this.getNextIndex()) {
                card.classList.add('next');
            }
        });

        gsap.to('.app-card.active', {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out"
        });

        gsap.to('.app-card.prev', {
            scale: 0.7,
            opacity: 0.4,
            y: -150,
            duration: 0.6,
            ease: "power2.out"
        });

        gsap.to('.app-card.next', {
            scale: 0.7,
            opacity: 0.4,
            y: 150,
            duration: 0.6,
            ease: "power2.out"
        });

        setTimeout(() => {
            this.isAnimating = false;
        }, 600);

        this.updateDescription();
    }

    updateDescription() {
        const activeCard = this.cards[this.currentIndex];
        const appName = activeCard.getAttribute('data-app');
        const appData = appDescriptions[appName];
        const descContent = document.getElementById('descriptionContent');

        gsap.to(descContent, {
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
                descContent.innerHTML = `
                    <h3>${appData.title}</h3>
                    <p>${appData.description}</p>
                `;
                gsap.to(descContent, {
                    opacity: 1,
                    duration: 0.3
                });
            }
        });
    }

    getPrevIndex() {
        return this.currentIndex === 0 ? this.totalCards - 1 : this.currentIndex - 1;
    }

    getNextIndex() {
        return this.currentIndex === this.totalCards - 1 ? 0 : this.currentIndex + 1;
    }

    prev() {
        this.currentIndex = this.getPrevIndex();
        this.updateCarousel();
    }

    next() {
        this.currentIndex = this.getNextIndex();
        this.updateCarousel();
    }

    goToSlide(index) {
        this.currentIndex = index;
        this.updateCarousel();
    }
}

class ThemeManager {
    constructor() {
        this.themeSwitch = document.getElementById('theme-switch');
        this.init();
    }

    init() {
        const savedTheme = localStorage.getItem('eco-theme') || 'dark';
        this.applyTheme(savedTheme);

        this.themeSwitch.addEventListener('change', () => {
            const newTheme = this.themeSwitch.checked ? 'light' : 'dark';
            this.applyTheme(newTheme);
            localStorage.setItem('eco-theme', newTheme);
        });
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.themeSwitch.checked = theme === 'light';
    }
}

function updateLiveTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
    document.getElementById('liveTime').textContent = timeString;
}

// Enhanced DOMContentLoaded with audio management
document.addEventListener('DOMContentLoaded', function() {
    const loaderWrapper = document.getElementById('loaderWrapper');
    const mainWrapper = document.querySelector('.main-wrapper');
    const body = document.body;

    body.classList.add('loading');

    setTimeout(() => {
        loaderWrapper.style.opacity = '0';
        loaderWrapper.style.visibility = 'hidden';
        mainWrapper.style.display = 'block';
        
        setTimeout(() => {
            mainWrapper.classList.add('loaded');
            body.classList.remove('loading');
        }, 50);

        // Initialize all components
        new EcoCarousel();
        new ThemeManager();
        updateLiveTime();
        setInterval(updateLiveTime, 1000);

        // Initialize audio management
        const video = document.querySelector('.video-background');
        if (video) {
            const audioManager = new SmartAudioManager(video);
            
            // Handle video errors gracefully
            video.addEventListener('error', function() {
                console.log('Video failed to load, using fallback background');
                document.querySelector('.video-overlay').style.background = 
                    'linear-gradient(135deg, #1e3a8a 0%, #059669 50%, #1e40af 100%)';
            });
        }
    }, 4000);
});
