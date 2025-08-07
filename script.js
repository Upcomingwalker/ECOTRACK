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

        new EcoCarousel();
        
        new ThemeManager();
        
        updateLiveTime();
        setInterval(updateLiveTime, 1000);
        
        const video = document.querySelector('.video-background');
        video.addEventListener('error', function() {
            document.querySelector('.video-overlay').style.background = 
                'linear-gradient(135deg, #1e3a8a 0%, #059669 50%, #1e40af 100%)';
        });
    }, 4000);
});
