
document.addEventListener('DOMContentLoaded', function () {
    const header = document.querySelector('.project-header');
    const hero = document.querySelector('.project-hero');
    const footer = document.querySelector('.project-footer');

    if (!header || !hero) return;

    // Hero image loading
    const heroBg = hero.querySelector('.hero-bg');
    const heroMedia = heroBg ? heroBg.querySelector('img, video') : null;

    if (heroMedia && heroBg) {
        const handleMediaLoad = () => {
            heroMedia.classList.add('loaded');
            heroBg.classList.add('loaded');
        };

        if (heroMedia.tagName === 'IMG') {
            if (heroMedia.complete) {
                handleMediaLoad();
            } else {
                heroMedia.addEventListener('load', handleMediaLoad);
                heroMedia.addEventListener('error', handleMediaLoad); // Still remove loader on error
            }
        } else if (heroMedia.tagName === 'VIDEO') {
            heroMedia.addEventListener('loadeddata', handleMediaLoad);
            heroMedia.addEventListener('error', handleMediaLoad);
        }
    }

    const observer = new IntersectionObserver(([entry]) => {
        // hero 还占屏幕上方 >40%：认为在 hero 区 → header 用浅色
        if (entry.intersectionRatio > 0.4) {
            header.classList.remove('on-light');
            if (footer) footer.classList.remove('on-light');

            const logoh = header.querySelector('.header-logo');
            const logof = footer ? footer.querySelector('.footer-logo') : null;
            if (logof) logof.classList.remove('dark-mode');
            if (logoh) logoh.classList.remove('dark-mode');
            // header.classList.remove('on-light');
            // footer.querySelector(".project-footer").classList.remove('on-light');
            // header.querySelector('.header-logo').classList.remove('dark-mode');
        } else {
            // hero 基本滚走 → header 在白底上 → 用深色
            header.classList.add('on-light');
            if (footer) footer.classList.add('on-light');

            const logoh = header.querySelector('.header-logo');
            const logof = footer ? footer.querySelector('.footer-logo') : null;
            if (logof) logof.classList.add('dark-mode');
            if (logoh) logoh.classList.add('dark-mode');
            // header.classList.add('on-light');
            // header.querySelector('.header-logo').classList.add('dark-mode');
            // footer.querySelector(".project-footer").classList.add('on-light');
        }
    }, {
        threshold: [0.4]
    });

    observer.observe(hero);

    // Gallery Slider functionality
    initializeGallerySliders();

    // Mobile navigation toggle
    const mobileToggle = document.querySelector('.mobile-nav-toggle');
    const mobileMenu = document.querySelector('.mobile-nav-menu');
    const mobileOverlay = document.querySelector('.mobile-nav-overlay');

    if (mobileToggle && mobileMenu && mobileOverlay) {
        function toggleMobileNav() {
            mobileToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            mobileOverlay.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        }

        mobileToggle.addEventListener('click', toggleMobileNav);
        mobileOverlay.addEventListener('click', toggleMobileNav);

        // Close menu when clicking a link
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', toggleMobileNav);
        });
    }
});

// Gallery Slider Functions
const galleryStates = {};

function initializeGallerySliders() {
    const sliders = document.querySelectorAll('[id^="gallery-slider"]');
    sliders.forEach(slider => {
        const sliderId = slider.id;
        const slides = slider.querySelectorAll('.slide');

        if (slides.length === 0) return;

        // Setup image loading for all slides
        slides.forEach(slide => {
            const img = slide.querySelector('img');
            if (img) {
                if (img.complete) {
                    img.classList.add('loaded');
                } else {
                    img.addEventListener('load', () => {
                        img.classList.add('loaded');
                    });
                    img.addEventListener('error', () => {
                        img.classList.add('loaded'); // Show even on error
                    });
                }
            }
        });

        galleryStates[sliderId] = {
            currentIndex: 0,
            totalSlides: slides.length,
            autoplayTimer: null,
            restartTimeout: null,
            isManualControl: false
        };

        // Add active class to first slide
        if (slides[0]) {
            slides[0].classList.add('active');
        }

        // Show first slide
        showSlide(sliderId, 0);

        // 啟動自動播放（5秒間隔）
        if (slides.length > 1) {
            startAutoplay(sliderId);
        }
    });
}

function changeSlide(sliderId, direction) {
    let state = galleryStates[sliderId];

    // 如果state不存在，先初始化
    if (!state) {
        const slider = document.getElementById(sliderId);
        if (!slider) return;

        const slides = slider.querySelectorAll('.slide');
        if (slides.length === 0) return;

        galleryStates[sliderId] = {
            currentIndex: 0,
            totalSlides: slides.length,
            autoplayTimer: null,
            restartTimeout: null,
            isManualControl: false
        };
        state = galleryStates[sliderId];
    }

    // 標記為手動控制
    state.isManualControl = true;

    // 计算新的 index，但不修改 state
    let newIndex = state.currentIndex + direction;

    // Loop around
    if (newIndex < 0) {
        newIndex = state.totalSlides - 1;
    } else if (newIndex >= state.totalSlides) {
        newIndex = 0;
    }

    // showSlide 会更新 state.currentIndex
    showSlide(sliderId, newIndex);

    // 重新啟動自動播放（從當前位置繼續）
    restartAutoplay(sliderId);
}

function showSlide(sliderId, index) {
    const slider = document.getElementById(sliderId);
    if (!slider) {
        return;
    }

    const track = slider.querySelector('.slider-track');
    const slides = slider.querySelectorAll('.slide');
    const counter = slider.querySelector('.slide-counter');

    if (!track || slides.length === 0) {
        return;
    }

    const state = galleryStates[sliderId];
    if (!state) return;

    // Update state
    const previousIndex = state.currentIndex;
    state.currentIndex = index;

    // Only update DOM if index actually changed
    if (previousIndex !== index) {
        // Remove active class from all slides
        slides.forEach(slide => slide.classList.remove('active'));

        // Add active class to current slide
        if (slides[index]) {
            slides[index].classList.add('active');
        }
    }

    // Move track
    const offset = -index * 100;
    track.style.transform = `translateX(${offset}%)`;
    track.style.transition = 'transform 0.3s ease';

    // Update counter
    if (counter) {
        counter.textContent = `${index + 1} / ${slides.length}`;
    }
}

// 自動播放功能
function startAutoplay(sliderId) {
    const state = galleryStates[sliderId];
    if (!state) return;

    // 清除現有定時器
    if (state.autoplayTimer) {
        clearInterval(state.autoplayTimer);
        state.autoplayTimer = null;
    }

    // 設置新定時器（5秒切換一次）
    state.autoplayTimer = setInterval(() => {
        // 確保 state 還存在
        if (!galleryStates[sliderId]) {
            clearInterval(state.autoplayTimer);
            return;
        }

        const currentState = galleryStates[sliderId];
        const nextIndex = (currentState.currentIndex + 1) % currentState.totalSlides;
        showSlide(sliderId, nextIndex);
    }, 5000);
}

function restartAutoplay(sliderId) {
    const state = galleryStates[sliderId];
    if (!state) return;

    // 清除現有的自動播放間隔定時器
    if (state.autoplayTimer) {
        clearInterval(state.autoplayTimer);
        state.autoplayTimer = null;
    }

    // 清除現有的重啟延遲定時器
    if (state.restartTimeout) {
        clearTimeout(state.restartTimeout);
        state.restartTimeout = null;
    }

    // 3秒後重新啟動（給用戶一點時間觀看手動選擇的圖片）
    state.restartTimeout = setTimeout(() => {
        state.restartTimeout = null;
        startAutoplay(sliderId);
    }, 3000);
}

function stopAutoplay(sliderId) {
    const state = galleryStates[sliderId];
    if (!state) return;

    if (state.autoplayTimer) {
        clearInterval(state.autoplayTimer);
        state.autoplayTimer = null;
    }

    if (state.restartTimeout) {
        clearTimeout(state.restartTimeout);
        state.restartTimeout = null;
    }
}
