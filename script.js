// Основной JavaScript файл для CS2 External сайта

// Глобальные переменные
let subscribers = 0;
let verificationCodeSent = '';
let currentUserEmail = '';
let resendTimer = null;
let resendCountdown = 60;

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
    initSubscriberSystem();
    loadSubscriberStats();
    initProgressBars();
});

// Инициализация системы подписчиков
function initSubscriberSystem() {
    // Загружаем данные из localStorage
    const savedSubscribers = localStorage.getItem('cs2external_subscribers');
    const savedStats = localStorage.getItem('cs2external_subscriber_stats');
    
    if (savedSubscribers) {
        const subscribersList = JSON.parse(savedSubscribers);
        subscribers = subscribersList.length;
    } else {
        // Начальное значение для демонстрации
        subscribers = Math.floor(Math.random() * 100) + 250;
        saveSubscriberStats();
    }
    
    updateSubscriberCounters();
}

// Загрузка статистики подписчиков
function loadSubscriberStats() {
    // Симуляция реального времени - обновляем счетчики каждые 45 секунд
    setInterval(() => {
        // Случайное увеличение подписчиков (1-2 новых подписчика)
        if (Math.random() > 0.8) {
            const newSubscribers = Math.floor(Math.random() * 2) + 1;
            subscribers += newSubscribers;
            updateSubscriberCounters();
            saveSubscriberStats();
            
            // Показываем уведомление о новых подписчиках
            if (newSubscribers > 0) {
                showNotification(`+${newSubscribers} новых подписчиков!`, 'info');
            }
        }
    }, 45000); // Каждые 45 секунд
}

// Обновление счетчиков на странице
function updateSubscriberCounters() {
    const userCounter = document.getElementById('registeredUsers');
    const subscribersCounter = document.getElementById('subscribersCount');
    
    if (userCounter) {
        userCounter.classList.add('counting');
        userCounter.textContent = subscribers;
        setTimeout(() => userCounter.classList.remove('counting'), 500);
    }
    
    if (subscribersCounter) {
        subscribersCounter.textContent = subscribers;
    }
}

// Сохранение статистики
function saveSubscriberStats() {
    const stats = {
        subscribers: subscribers,
        lastUpdate: new Date().toISOString()
    };
    localStorage.setItem('cs2external_subscriber_stats', JSON.stringify(stats));
}

// Инициализация прогресс баров
function initProgressBars() {
    const progressBars = document.querySelectorAll('.progress-fill');
    
    const progressObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressBar = entry.target;
                const width = progressBar.style.width;
                progressBar.style.width = '0%';
                
                setTimeout(() => {
                    progressBar.style.width = width;
                }, 200);
                
                progressObserver.unobserve(progressBar);
            }
        });
    });
    
    progressBars.forEach(bar => {
        progressObserver.observe(bar);
    });
}

// Плавная прокрутка к секции
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Модальные окна
function openRegistrationModal() {
    const modal = document.getElementById('registrationModal');
    modal.classList.add('active');
    resetRegistrationForm();
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
    
    // Очищаем таймер при закрытии модального окна
    if (resendTimer) {
        clearInterval(resendTimer);
        resendTimer = null;
    }
}

// Сброс формы регистрации
function resetRegistrationForm() {
    document.getElementById('step1').classList.add('active');
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step3').classList.remove('active');
    document.getElementById('registrationForm').reset();
    
    // Сбрасываем состояние кнопок
    resetButtonState('step1');
    resetButtonState('step2');
}

// Сброс состояния кнопки
function resetButtonState(stepId) {
    const step = document.getElementById(stepId);
    const btn = step.querySelector('.btn-primary');
    const btnText = btn.querySelector('.btn-text');
    const btnLoader = btn.querySelector('.btn-loader');
    
    btn.disabled = false;
    btnText.style.display = 'inline';
    btnLoader.style.display = 'none';
}

// Показать загрузку на кнопке
function showButtonLoading(stepId) {
    const step = document.getElementById(stepId);
    const btn = step.querySelector('.btn-primary');
    const btnText = btn.querySelector('.btn-text');
    const btnLoader = btn.querySelector('.btn-loader');
    
    btn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline';
}

// Отправка кода подтверждения
async function sendVerificationCode() {
    const email = document.getElementById('regEmail').value;
    
    if (!email) {
        showNotification('Введите email адрес!', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Введите корректный email адрес!', 'error');
        return;
    }
    
    // Проверяем, не подписан ли уже этот email
    const existingSubscribers = JSON.parse(localStorage.getItem('cs2external_subscribers') || '[]');
    if (existingSubscribers.find(subscriber => subscriber.email === email)) {
        showNotification('Этот email уже подписан на уведомления!', 'error');
        return;
    }
    
    showButtonLoading('step1');
    
    // Симулируем отправку email
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Генерируем код подтверждения
    verificationCodeSent = generateVerificationCode();
    currentUserEmail = email;
    
    // Симулируем отправку email
    showNotification('Код подтверждения отправлен на вашу почту!', 'success');
    
    // Переходим к следующему шагу
    document.getElementById('step1').classList.remove('active');
    document.getElementById('step2').classList.add('active');
    document.getElementById('emailDisplay').textContent = email;
    
    // Для демонстрации показываем код в консоли и уведомлении
    console.log('Код подтверждения:', verificationCodeSent);
    setTimeout(() => {
        showNotification(`Код для демо: ${verificationCodeSent}`, 'info');
    }, 1000);
    
    resetButtonState('step1');
    startResendTimer();
}

// Подтверждение кода
async function verifyCode() {
    const enteredCode = document.getElementById('verificationCode').value;
    
    if (!enteredCode) {
        showNotification('Введите код подтверждения!', 'error');
        return;
    }
    
    if (enteredCode.length !== 6) {
        showNotification('Код должен содержать 6 цифр!', 'error');
        return;
    }
    
    if (enteredCode !== verificationCodeSent) {
        showNotification('Неверный код подтверждения!', 'error');
        // Добавляем эффект тряски для поля ввода
        const codeInput = document.getElementById('verificationCode');
        codeInput.style.animation = 'shake 0.5s';
        setTimeout(() => codeInput.style.animation = '', 500);
        return;
    }
    
    showButtonLoading('step2');
    
    // Симулируем обработку
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Регистрируем подписчика
    registerSubscriber(currentUserEmail);
    
    // Переходим к финальному шагу
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step3').classList.add('active');
    document.getElementById('finalEmail').textContent = currentUserEmail;
    document.getElementById('subscriptionDate').textContent = new Date().toLocaleDateString('ru-RU');
    
    // Очищаем таймер
    if (resendTimer) {
        clearInterval(resendTimer);
        resendTimer = null;
    }
    
    showNotification('Подписка успешно оформлена!', 'success');
    resetButtonState('step2');
}

// Повторная отправка кода
async function resendCode() {
    showButtonLoading('step2');
    
    // Симулируем отправку
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    verificationCodeSent = generateVerificationCode();
    showNotification('Новый код отправлен на вашу почту!', 'success');
    console.log('Новый код подтверждения:', verificationCodeSent);
    
    setTimeout(() => {
        showNotification(`Новый код для демо: ${verificationCodeSent}`, 'info');
    }, 1000);
    
    resetButtonState('step2');
    startResendTimer();
}

// Таймер повторной отправки
function startResendTimer() {
    resendCountdown = 60;
    const timerElement = document.getElementById('resendTimer');
    const countElement = document.getElementById('timerCount');
    const resendBtn = document.querySelector('#step2 .btn-secondary');
    
    timerElement.style.display = 'block';
    resendBtn.disabled = true;
    resendBtn.style.opacity = '0.5';
    
    resendTimer = setInterval(() => {
        resendCountdown--;
        countElement.textContent = resendCountdown;
        
        if (resendCountdown <= 0) {
            clearInterval(resendTimer);
            timerElement.style.display = 'none';
            resendBtn.disabled = false;
            resendBtn.style.opacity = '1';
            resendTimer = null;
        }
    }, 1000);
}

// Регистрация подписчика
function registerSubscriber(email) {
    const subscribersList = JSON.parse(localStorage.getItem('cs2external_subscribers') || '[]');
    const newSubscriber = {
        id: Date.now(),
        email: email,
        subscriptionDate: new Date().toISOString(),
        status: 'active'
    };
    
    subscribersList.push(newSubscriber);
    localStorage.setItem('cs2external_subscribers', JSON.stringify(subscribersList));
    
    // Обновляем счетчики
    subscribers++;
    updateSubscriberCounters();
    saveSubscriberStats();
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

// Анимация тряски
const shakeKeyframes = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
}`;

// Добавляем стили для анимации тряски
if (!document.querySelector('#shake-styles')) {
    const style = document.createElement('style');
    style.id = 'shake-styles';
    style.textContent = shakeKeyframes;
    document.head.appendChild(style);
}

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

    // Специальная обработка для счетчика подписчиков
    const subscriberCounter = document.getElementById('registeredUsers');
    if (subscriberCounter) {
        const subscriberCounterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateSubscriberCounter();
                    subscriberCounterObserver.unobserve(entry.target);
                }
            });
        });
        subscriberCounterObserver.observe(subscriberCounter);
    }
}

// Анимация счетчика подписчиков
function animateSubscriberCounter() {
    const counter = document.getElementById('registeredUsers');
    if (!counter) return;
    
    let current = 0;
    const target = subscribers;
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
// Закрытие модальных окон по клику вне их
window.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.classList.remove('active');
            
            // Очищаем таймер при закрытии модального окна
            if (resendTimer) {
                clearInterval(resendTimer);
                resendTimer = null;
            }
        }
    });
});

// Закрытие модальных окон по Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            activeModal.classList.remove('active');
            
            // Очищаем таймер при закрытии модального окна
            if (resendTimer) {
                clearInterval(resendTimer);
                resendTimer = null;
            }
        }
    }
});

// Автоматическое форматирование кода подтверждения
document.addEventListener('DOMContentLoaded', function() {
    const codeInput = document.getElementById('verificationCode');
    if (codeInput) {
        codeInput.addEventListener('input', function(e) {
            // Оставляем только цифры
            let value = e.target.value.replace(/\D/g, '');
            
            // Ограничиваем до 6 символов
            if (value.length > 6) {
                value = value.slice(0, 6);
            }
            
            e.target.value = value;
            
            // Автоматически переходим к подтверждению при вводе 6 цифр
            if (value.length === 6) {
                setTimeout(() => {
                    const verifyBtn = document.querySelector('#step2 .btn-primary');
                    if (verifyBtn && !verifyBtn.disabled) {
                        verifyBtn.focus();
                    }
                }, 100);
            }
        });
        
        // Обработка вставки из буфера обмена
        codeInput.addEventListener('paste', function(e) {
            e.preventDefault();
            const paste = (e.clipboardData || window.clipboardData).getData('text');
            const code = paste.replace(/\D/g, '').slice(0, 6);
            e.target.value = code;
            
            if (code.length === 6) {
                setTimeout(() => {
                    const verifyBtn = document.querySelector('#step2 .btn-primary');
                    if (verifyBtn && !verifyBtn.disabled) {
                        verifyBtn.focus();
                    }
                }, 100);
            }
        });
    }
});

// Улучшенная анимация частиц с интерактивностью
function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Случайные позиции и размеры
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    const size = Math.random() * 4 + 1;
    const duration = Math.random() * 4 + 4;
    const opacity = Math.random() * 0.8 + 0.2;
    
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.animationDuration = duration + 's';
    particle.style.animationDelay = Math.random() * 2 + 's';
    particle.style.opacity = opacity;
    
    // Случайный цвет из палитры
    const colors = ['#8B5CF6', '#A855F7', '#7C3AED', '#6D28D9'];
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
    
    container.appendChild(particle);
    
    // Интерактивность при наведении мыши
    particle.addEventListener('mouseenter', function() {
        particle.style.transform = 'scale(2)';
        particle.style.opacity = '1';
    });
    
    particle.addEventListener('mouseleave', function() {
        particle.style.transform = 'scale(1)';
        particle.style.opacity = opacity;
    });
    
    // Удаление и пересоздание частицы
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
            createParticle(container);
        }
    }, (duration + 2) * 1000);
}

// Дополнительные эффекты при загрузке страницы
window.addEventListener('load', () => {
    // Добавление класса для запуска анимаций
    document.body.classList.add('loaded');
    
    // Инициализация дополнительных эффектов
    initFloatingElements();
    initPulseEffects();
    initParallaxEffect();
});

// Параллакс эффект для hero секции
function initParallaxEffect() {
    const hero = document.querySelector('.hero');
    const heroVisual = document.querySelector('.hero-visual');
    
    if (hero && heroVisual) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            heroVisual.style.transform = `translateY(${rate}px)`;
        });
    }
}

// Улучшенные плавающие элементы
function initFloatingElements() {
    const floatingElements = document.querySelectorAll('.floating-element');
    
    floatingElements.forEach((element, index) => {
        // Более сложное движение элементов
        let angle = 0;
        const radius = 10 + index * 5;
        const speed = 0.02 + index * 0.01;
        
        setInterval(() => {
            angle += speed;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            element.style.transform = `translate(${x}px, ${y}px)`;
        }, 50);
    });
}

// Улучшенные эффекты пульсации
function initPulseEffects() {
    const pulseButtons = document.querySelectorAll('.pulse');
    
    pulseButtons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.animationPlayState = 'paused';
            button.style.transform = 'scale(1.05)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.animationPlayState = 'running';
            button.style.transform = 'scale(1)';
        });
        
        // Добавляем ripple эффект при клике
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            button.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// CSS для ripple эффекта
const rippleStyles = `
.btn {
    position: relative;
    overflow: hidden;
}

.ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: scale(0);
    animation: ripple-animation 0.6s linear;
    pointer-events: none;
}

@keyframes ripple-animation {
    to {
        transform: scale(4);
        opacity: 0;
    }
}
`;

// Добавляем стили для ripple эффекта
if (!document.querySelector('#ripple-styles')) {
    const style = document.createElement('style');
    style.id = 'ripple-styles';
    style.textContent = rippleStyles;
    document.head.appendChild(style);
}

// Утилиты для работы с localStorage (обновленные)
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

// Сохранение предпочтений пользователя (обновленное)
function saveUserPreferences() {
    const preferences = {
        lastVisit: new Date().toISOString(),
        viewedSections: getViewedSections(),
        subscriberCount: subscribers
    };
    
    Storage.set('userPreferences', preferences);
}

// Сохранение предпочтений при уходе со страницы
window.addEventListener('beforeunload', saveUserPreferences);
// Инициализация анимаций для финальных функций
function initFinalFeaturesAnimations() {
    const finalFeatureCards = document.querySelectorAll('.final-feature-card');
    
    finalFeatureCards.forEach((card, index) => {
        // Добавляем интерактивность при наведении
        card.addEventListener('mouseenter', function() {
            // Создаем эффект ripple
            createRippleEffect(card);
            
            // Анимируем highlights
            const highlights = card.querySelectorAll('.highlight');
            highlights.forEach((highlight, i) => {
                setTimeout(() => {
                    highlight.style.transform = 'translateY(-3px) scale(1.05)';
                    highlight.style.boxShadow = '0 4px 15px rgba(139, 92, 246, 0.3)';
                }, i * 100);
            });
        });
        
        card.addEventListener('mouseleave', function() {
            // Возвращаем highlights в исходное состояние
            const highlights = card.querySelectorAll('.highlight');
            highlights.forEach(highlight => {
                highlight.style.transform = 'translateY(0) scale(1)';
                highlight.style.boxShadow = 'none';
            });
        });
        
        // Добавляем случайную анимацию иконок
        const icon = card.querySelector('.feature-icon-large');
        if (icon) {
            setInterval(() => {
                if (Math.random() > 0.7) {
                    icon.style.animation = 'none';
                    setTimeout(() => {
                        icon.style.animation = `float-icon 3s ease-in-out infinite`;
                        icon.style.animationDelay = `${index * 0.5}s`;
                    }, 50);
                }
            }, 5000 + index * 1000);
        }
    });
}

// Создание ripple эффекта для карточек
function createRippleEffect(element) {
    const ripple = document.createElement('div');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = '50%';
    ripple.style.top = '50%';
    ripple.style.transform = 'translate(-50%, -50%) scale(0)';
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(139, 92, 246, 0.1)';
    ripple.style.pointerEvents = 'none';
    ripple.style.zIndex = '1';
    
    element.appendChild(ripple);
    
    // Анимируем ripple
    ripple.animate([
        { transform: 'translate(-50%, -50%) scale(0)', opacity: 1 },
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 0 }
    ], {
        duration: 800,
        easing: 'ease-out'
    });
    
    setTimeout(() => {
        if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple);
        }
    }, 800);
}

// Анимация появления секции финальных функций
function initFinalFeaturesReveal() {
    const finalFeaturesSection = document.querySelector('.final-features');
    
    if (finalFeaturesSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Запускаем каскадную анимацию карточек
                    const cards = entry.target.querySelectorAll('.final-feature-card');
                    cards.forEach((card, index) => {
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0) scale(1)';
                        }, index * 200);
                    });
                    
                    // Анимируем заметку
                    const note = entry.target.querySelector('.final-features-note');
                    if (note) {
                        setTimeout(() => {
                            note.style.opacity = '1';
                            note.style.transform = 'translateY(0)';
                        }, cards.length * 200 + 300);
                    }
                    
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        
        observer.observe(finalFeaturesSection);
        
        // Изначально скрываем элементы
        const cards = finalFeaturesSection.querySelectorAll('.final-feature-card');
        const note = finalFeaturesSection.querySelector('.final-features-note');
        
        cards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(50px) scale(0.9)';
            card.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        });
        
        if (note) {
            note.style.opacity = '0';
            note.style.transform = 'translateY(30px)';
            note.style.transition = 'all 0.6s ease';
        }
    }
}

// Интерактивные эффекты для бейджей "Гарантировано"
function initGuaranteedBadges() {
    const badges = document.querySelectorAll('.feature-status-badge.guaranteed');
    
    badges.forEach(badge => {
        // Добавляем случайные вспышки
        setInterval(() => {
            if (Math.random() > 0.8) {
                badge.style.animation = 'none';
                setTimeout(() => {
                    badge.style.animation = 'pulse-guaranteed 3s infinite';
                    // Добавляем временную вспышку
                    badge.style.boxShadow = '0 6px 30px rgba(16, 185, 129, 0.8)';
                    setTimeout(() => {
                        badge.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
                    }, 300);
                }, 50);
            }
        }, 3000);
        
        // Интерактивность при наведении
        badge.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
            this.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.6)';
        });
        
        badge.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
        });
    });
}

// Обновляем основную инициализацию
document.addEventListener('DOMContentLoaded', function() {
    // Существующие инициализации...
    initParticles();
    initNavigation();
    initScrollAnimations();
    initCounters();
    initFAQ();
    initContactForm();
    initScrollToTop();
    initSmoothScroll();
    initSubscriberSystem();
    loadSubscriberStats();
    initProgressBars();
    
    // Новые инициализации для финальных функций
    initFinalFeaturesAnimations();
    initFinalFeaturesReveal();
    initGuaranteedBadges();
});

// Дополнительные эффекты при загрузке страницы
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    initFloatingElements();
    initPulseEffects();
    initParallaxEffect();
    
    // Запускаем дополнительные анимации для финальных функций
    setTimeout(() => {
        const finalFeatureCards = document.querySelectorAll('.final-feature-card');
        finalFeatureCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('loaded');
            }, index * 100);
        });
    }, 1000);
});
