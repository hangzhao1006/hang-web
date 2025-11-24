
document.addEventListener('DOMContentLoaded', function () {
    const header = document.querySelector('.project-header');
    const hero = document.querySelector('.project-hero');
    const footer = document.querySelector('.project-footer');

    if (!header || !hero) return;

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
