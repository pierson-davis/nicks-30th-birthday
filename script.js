// Nick's 30th Birthday Website - Interactive Features
class BirthdayWebsite {
    constructor() {
        this.images = [
            {
                id: 1,
                title: "Anime Gun Girl Nick",
                description: "A wild anime-inspired look with gun girl vibes. Perfect for a bold, edgy costume that will definitely turn heads at the party!",
                color: "#ff0000",
                image: "images/animegungirlpng.png"
            },
            {
                id: 2,
                title: "Demon Child Nick",
                description: "A demonic, otherworldly look that's both creepy and cool. This haunting aesthetic will make for an unforgettable party entrance!",
                color: "#8b0000",
                image: "images/demon child head.png"
            },
            {
                id: 3,
                title: "Face Nick",
                description: "Abstract facial features that are both artistic and unsettling. This minimalist yet striking look is perfect for a mysterious party vibe!",
                color: "#00ff00",
                image: "images/face1.png"
            },
            {
                id: 4,
                title: "Photo Nick 1",
                description: "A real photo that captures Nick's essence. This authentic look will inspire some creative costume interpretations!",
                color: "#0000ff",
                image: "images/IMG_0825.jpeg"
            },
            {
                id: 5,
                title: "Photo Nick 2",
                description: "Another candid shot of Nick that shows his personality. Perfect inspiration for a realistic costume approach!",
                color: "#ff00ff",
                image: "images/IMG-3709.JPG"
            },
            {
                id: 6,
                title: "Lesbian Nick",
                description: "A bold, expressive look that's full of character. This artistic interpretation will inspire some creative costume ideas!",
                color: "#ffff00",
                image: "images/lesbian2.png"
            },
            {
                id: 7,
                title: "Religion Nick",
                description: "A spiritual, contemplative look that's both deep and mysterious. This thoughtful aesthetic will make for an interesting party look!",
                color: "#00ffff",
                image: "images/religion (1).png"
            },
            {
                id: 8,
                title: "TAB Nick",
                description: "A mysterious, abstract look that's open to interpretation. This enigmatic style will inspire some wild costume creativity!",
                color: "#ff8000",
                image: "images/TAB.png"
            }
        ];
        
        this.birthdayDate = new Date('2025-10-18T18:00:00-04:00'); // October 18th, 2025 at 6pm EST
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startCountdown();
        this.setupGallery();
    }

    setupEventListeners() {
        // Modal close
        document.getElementById('close-modal').addEventListener('click', () => {
            this.closeModal();
        });

        // Close modal when clicking outside
        document.getElementById('image-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeModal();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    startCountdown() {
        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = this.birthdayDate.getTime() - now;

            if (distance < 0) {
                // Birthday has passed or is today
                document.getElementById('days').textContent = '00';
                document.getElementById('hours').textContent = '00';
                document.getElementById('minutes').textContent = '00';
                document.getElementById('seconds').textContent = '00';
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            document.getElementById('days').textContent = days.toString().padStart(2, '0');
            document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
            document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
            document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
        };

        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    setupGallery() {
        const galleryItems = document.querySelectorAll('.gallery-item');
        
        galleryItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                this.openModal(index + 1);
            });

            // Add hover effects
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'translateY(-10px) scale(1.05)';
            });

            item.addEventListener('mouseleave', () => {
                if (!this.isDanceMode) {
                    item.style.transform = 'translateY(0) scale(1)';
                }
            });
        });
    }

    openModal(imageId) {
        const image = this.images.find(img => img.id === imageId);
        if (!image) return;

        const modal = document.getElementById('image-modal');
        const modalImage = document.getElementById('modal-image');
        const modalTitle = document.getElementById('modal-title');
        const modalDescription = document.getElementById('modal-description');

        // Use the actual image
        modalImage.src = image.image;
        modalImage.alt = image.title;
        modalTitle.textContent = image.title;
        modalDescription.textContent = image.description;
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    createImagePattern(ctx, width, height, color) {
        // Create a funky pattern for each image
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.5, this.lightenColor(color, 0.3));
        gradient.addColorStop(1, this.darkenColor(color, 0.3));
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Add some funky shapes
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 30 + 10;
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Add some lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 3;
        for (let i = 0; i < 10; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * width, Math.random() * height);
            ctx.lineTo(Math.random() * width, Math.random() * height);
            ctx.stroke();
        }
    }

    closeModal() {
        const modal = document.getElementById('image-modal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }



    // Utility functions
    lightenColor(color, amount) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * amount * 100);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    darkenColor(color, amount) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * amount * 100);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
            (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
            (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
    }
}

// Initialize the website when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BirthdayWebsite();
});

