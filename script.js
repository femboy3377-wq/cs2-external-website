// Основной JavaScript файл для CS2 External сайта

// Глобальные переменные
let registeredUsers = 0;
let betaSlots = 47;
let verificationCodeSent = '';
let currentUserEmail = '';
let currentUsername = '';

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация всех компонентов
    initParticles();
    initNavigation();
    initScrollAnimations();
    initCounters();
    initFAQ();
    initContactForm();
    initScrollToTop();
    initSmoothScroll();
    initUserSystem();
    loadUserStats();
});

// Инициализация системы пользователей
function initUserSystem() {
    // Загружаем данные из localStorage
    const savedUsers = localStorage.getItem('cs2external_users');
    const savedStats = localStorage.getItem('cs2external_stats');
    
    if (savedUsers) {
        const users = JSON.parse(savedUsers);
        registeredUsers = users.length;
    } else {
        // Начальное значение для демонстрации
        registeredUsers = Math.floor(Math.random() * 50) + 150;
        saveUserStats();
    }
    
    if (savedStats) {
        const stats = JSON.parse(savedStats);
        betaSlots = stats.betaSlots || 47;
    }
    
    updateUserCounters();
}

// Загрузка статистики пользователей
function loadUserStats() {
    // Симуляция реального времени - обновляем счетчики каждые 30 секунд
    setInterval(() => {
        // Случайное увеличение пользователей (1-3 новых пользователя)
        if (Math.random() > 0.7) {
            const newUsers = Math.floor(Math.random() * 3) + 1;
            registeredUsers += newUsers;
            betaSlots = Math.max(0, betaSlots - newUsers);
            updateUserCounters();
            saveUserStats();
            
            // Показываем уведомление о новых пользователях
            if (newUsers > 0) {
                showNotification(`+${newUsers} новых пользователей присоединились!`, 'info');
            }
        }
    }, 30000); // Каждые 30 секунд
}

// Обновление счетчиков на странице
function updateUserCounters() {
    const userCounter = document.getElementById('registeredUsers');
    const slotsCounter = document.getElementById('betaSlots');
    
    if (userCounter) {
        userCounter.classList.add('counting');
        userCounter.textContent = registeredUsers;
        setTimeout(() => userCounter.classList.remove('counting'), 500);
    }
    
    if (slotsCounter) {
        slotsCounter.textContent = betaSlots;
        if (betaSlots < 10) {
            slotsCounter.style.color = 'var(--accent-red)';
        }
    }
}

// Сохранение статистики
function saveUserStats() {
    const stats = {
        registeredUsers: registeredUsers,
        betaSlots: betaSlots,
        lastUpdate: new Date().toISOString()
    };
    localStorage.setItem('cs2external_stats', JSON.stringify(stats));
}

// Модальные окна
function openRegistrationModal() {
    const modal = document.getElementById('registrationModal');
    modal.classList.add('active');
    resetRegistrationForm();
}

function openLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
}

// Сброс формы регистрации
function resetRegistrationForm() {
    document.getElementById('step1').classList.add('active');
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step3').classList.remove('active');
    document.getElementById('registrationForm').reset();
}

// Отправка кода подтверждения
function sendVerificationCode() {
    const email = document.getElementById('regEmail').value;
    const username = document.getElementById('regUsername').value;
    
    if (!email || !username) {
        showNotification('Заполните все поля!', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Введите корректный email!', 'error');
        return;
    }
    
    // Проверяем, не зарегистрирован ли уже этот email
    const existingUsers = JSON.parse(localStorage.getItem('cs2external_users') || '[]');
    if (existingUsers.find(user => user.email === email)) {
        showNotification('Этот email уже зарегистрирован!', 'error');
        return;
    }
    
    // Генерируем код подтверждения
    verificationCodeSent = generateVerificationCode();
    currentUserEmail = email;
    currentUsername = username;
    
    // Симулируем отправку email
    showNotification('Код подтверждения отправлен на вашу почту!', 'success');
    
    // Переходим к следующему шагу
    document.getElementById('step1').classList.remove('active');
    document.getElementById('step2').classList.add('active');
    document.getElementById('emailDisplay').textContent = email;
    
    // Для демонстрации показываем код в консоли
    console.log('Код подтверждения:', verificationCodeSent);
    showNotification(`Код для демо: ${verificationCodeSent}`, 'info');
}

// Подтверждение кода
function verifyCode() {
    const enteredCode = document.getElementById('verificationCode').value;
    
    if (!enteredCode) {
        showNotification('Введите код подтверждения!', 'error');
        return;
    }
    
    if (enteredCode !== verificationCodeSent) {
        showNotification('Неверный код подтверждения!', 'error');
        return;
    }
    
    // Регистрируем пользователя
    registerUser(currentUserEmail, currentUsername);
    
    // Переходим к финальному шагу
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step3').classList.add('active');
    document.getElementById('finalEmail').textContent = currentUserEmail;
    document.getElementById('finalUsername').textContent = currentUsername;
    
    showNotification('Регистрация успешно завершена!', 'success');
}

// Повторная отправка кода
function resendCode() {
    verificationCodeSent = generateVerificationCode();
    showNotification('Новый код отправлен на вашу почту!', 'success');
    console.log('Новый код подтверждения:', verificationCodeSent);
    showNotification(`Новый код для демо: ${verificationCodeSent}`, 'info');
}

// Регистрация пользователя
function registerUser(email, username) {
    const users = JSON.parse(localStorage.getItem('cs2external_users') || '[]');
    const newUser = {
        id: Date.now(),
        email: email,
        username: username,
        registrationDate: new Date().toISOString(),
        status: 'beta_tester'
    };
    
    users.push(newUser);
    localStorage.setItem('cs2external_users', JSON.stringify(users));
    
    // Обновляем счетчики
    registeredUsers++;
    betaSlots = Math.max(0, betaSlots - 1);
    updateUserCounters();
    saveUserStats();
}

// Генерация кода подтверждения
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Проверка email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Закрытие модальных окон по клику вне их
window.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.classList.remove('active');
        }
    });
});

// Закрытие модальных окон по Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            activeModal.classList.remove('active');
        }
    }
});

// Создание анимированных частиц на фоне
function initParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        createParticle(particlesContainer);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Случайные позиции и размеры
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    const size = Math.random() * 3 + 1;
    const duration = Math.random() * 3 + 3;
    
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.animationDuration = duration + 's';
    particle.style.animationDelay = Math.random() * 2 + 's';
    
    container.appendChild(particle);
    
    // Удаление и пересоздание частицы
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
            createParticle(container);
        }
    }, (duration + 2) * 1000);
}

// Навигация и мобильное меню
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Переключение мобильного меню
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Закрытие меню при клике на ссылку
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Изменение навигации при скролле
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(0, 0, 0, 0.98)';
        } else {
            navbar.style.background = 'rgba(0, 0, 0, 0.95)';
        }
    });
}

// Анимации при скролле (AOS альтернатива)
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
            }
        });
    }, observerOptions);

    // Наблюдение за элементами с data-aos
    document.querySelectorAll('[data-aos]').forEach(el => {
        observer.observe(el);
    });
}

// Анимированные счетчики статистики
function initCounters() {
    const counters = document.querySelectorAll('.stat-number[data-target]');
    const speed = 200; // Скорость анимации

    const countUp = (counter) => {
        const target = +counter.getAttribute('data-target');
        const count = +counter.innerText;
        const increment = target / speed;

        if (count < target) {
            counter.innerText = Math.ceil(count + increment);
            setTimeout(() => countUp(counter), 1);
        } else {
            counter.innerText = target;
        }
    };

    // Запуск счетчиков при появлении в области видимости
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                counter.innerText = '0';
                countUp(counter);
                counterObserver.unobserve(counter);
            }
        });
    });

    counters.forEach(counter => {
        counterObserver.observe(counter);
    });

    // Специальная обработка для счетчика зарегистрированных пользователей
    const userCounter = document.getElementById('registeredUsers');
    if (userCounter) {
        const userCounterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateUserCounter();
                    userCounterObserver.unobserve(entry.target);
                }
            });
        });
        userCounterObserver.observe(userCounter);
    }
}

// Анимация счетчика пользователей
function animateUserCounter() {
    const counter = document.getElementById('registeredUsers');
    if (!counter) return;
    
    let current = 0;
    const target = registeredUsers;
    const increment = Math.ceil(target / 100);
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        counter.textContent = current;
    }, 20);
}

// FAQ аккордеон
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Закрыть все другие элементы
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Переключить текущий элемент
            item.classList.toggle('active', !isActive);
        });
    });
}

// Обработка формы обратной связи
function initContactForm() {
    const form = document.getElementById('contactForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Показать индикатор загрузки
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Отправка...';
        submitBtn.disabled = true;
        
        try {
            // Здесь должна быть отправка на сервер
            // Для демонстрации используем setTimeout
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Показать сообщение об успехе
            showNotification('Сообщение отправлено успешно!', 'success');
            form.reset();
            
        } catch (error) {
            showNotification('Ошибка при отправке сообщения', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Показ уведомлений
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Стили для уведомления
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 2rem',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '600',
        zIndex: '10000',
        transform: 'translateX(400px)',
        transition: 'transform 0.3s ease',
        backgroundColor: type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#8B5CF6'
    });
    
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Удаление через 5 секунд
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Кнопка "Наверх"
function initScrollToTop() {
    const scrollBtn = document.getElementById('scrollToTop');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    });
    
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Плавная прокрутка для якорных ссылок
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                const offsetTop = target.offsetTop - 80; // Учитываем высоту навигации
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Дополнительные эффекты при загрузке страницы
window.addEventListener('load', () => {
    // Добавление класса для запуска анимаций
    document.body.classList.add('loaded');
    
    // Инициализация дополнительных эффектов
    initFloatingElements();
    initPulseEffects();
});

// Плавающие элементы в hero секции
function initFloatingElements() {
    const floatingElements = document.querySelectorAll('.floating-element');
    
    floatingElements.forEach((element, index) => {
        // Случайное движение элементов
        setInterval(() => {
            const x = Math.random() * 20 - 10;
            const y = Math.random() * 20 - 10;
            element.style.transform = `translate(${x}px, ${y}px)`;
        }, 2000 + index * 500);
    });
}

// Эффекты пульсации для кнопок
function initPulseEffects() {
    const pulseButtons = document.querySelectorAll('.pulse');
    
    pulseButtons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.animationPlayState = 'paused';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.animationPlayState = 'running';
        });
    });
}

// Обработка покупок (заглушка)
function handlePurchase(plan) {
    showNotification(`Перенаправление на оплату плана "${plan}"...`, 'info');
    
    // Здесь должна быть интеграция с платежной системой
    setTimeout(() => {
        window.open('https://example.com/payment', '_blank');
    }, 2000);
}

// Добавление обработчиков для кнопок покупки
document.addEventListener('DOMContentLoaded', () => {
    const purchaseButtons = document.querySelectorAll('.pricing-card .btn');
    
    purchaseButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            const plans = ['Базовый', 'Премиум', 'Пожизненный'];
            handlePurchase(plans[index] || 'Неизвестный план');
        });
    });
});

// Обработка изменения размера окна
window.addEventListener('resize', () => {
    // Пересоздание частиц при изменении размера
    const particlesContainer = document.getElementById('particles');
    if (particlesContainer) {
        particlesContainer.innerHTML = '';
        initParticles();
    }
});

// Предзагрузка изображений (если будут добавлены)
function preloadImages(urls) {
    urls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

// Утилиты для работы с localStorage
const Storage = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn('LocalStorage недоступен:', e);
        }
    },
    
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn('Ошибка чтения из LocalStorage:', e);
            return defaultValue;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.warn('Ошибка удаления из LocalStorage:', e);
        }
    }
};

// Сохранение предпочтений пользователя
function saveUserPreferences() {
    const preferences = {
        lastVisit: new Date().toISOString(),
        viewedSections: getViewedSections()
    };
    
    Storage.set('userPreferences', preferences);
}

function getViewedSections() {
    const sections = document.querySelectorAll('section[id]');
    const viewed = [];
    
    sections.forEach(section => {
        if (isElementInViewport(section)) {
            viewed.push(section.id);
        }
    });
    
    return viewed;
}

function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Сохранение предпочтений при уходе со страницы
window.addEventListener('beforeunload', saveUserPreferences);
