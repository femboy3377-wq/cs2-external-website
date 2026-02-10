// Система управления пользователями CS2 External

class UserSystem {
    constructor() {
        this.users = this.loadUsers();
        this.stats = this.loadStats();
        this.initializeSystem();
    }

    // Загрузка пользователей из localStorage
    loadUsers() {
        const saved = localStorage.getItem('cs2external_users');
        return saved ? JSON.parse(saved) : [];
    }

    // Загрузка статистики
    loadStats() {
        const saved = localStorage.getItem('cs2external_stats');
        return saved ? JSON.parse(saved) : {
            registeredUsers: 156,
            betaSlots: 47,
            lastUpdate: new Date().toISOString()
        };
    }

    // Инициализация системы
    initializeSystem() {
        this.updateCounters();
        this.startRealTimeUpdates();
    }

    // Регистрация нового пользователя
    registerUser(userData) {
        const newUser = {
            id: this.generateUserId(),
            email: userData.email,
            username: userData.username,
            registrationDate: new Date().toISOString(),
            status: 'beta_tester',
            lastLogin: new Date().toISOString(),
            isActive: true
        };

        this.users.push(newUser);
        this.stats.registeredUsers++;
        this.stats.betaSlots = Math.max(0, this.stats.betaSlots - 1);
        
        this.saveData();
        this.updateCounters();
        
        return newUser;
    }

    // Проверка существования пользователя
    userExists(email) {
        return this.users.some(user => user.email === email);
    }

    // Аутентификация пользователя
    authenticateUser(email, password) {
        // В реальной системе здесь была бы проверка пароля
        const user = this.users.find(user => user.email === email);
        if (user) {
            user.lastLogin = new Date().toISOString();
            this.saveData();
            return user;
        }
        return null;
    }

    // Генерация ID пользователя
    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Генерация кода подтверждения
    generateVerificationCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Отправка email (симуляция)
    async sendVerificationEmail(email, code) {
        // Симуляция отправки email
        console.log(`Отправка кода ${code} на email: ${email}`);
        
        // В реальной системе здесь был бы вызов API для отправки email
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, message: 'Email отправлен' });
            }, 1000);
        });
    }

    // Сохранение данных
    saveData() {
        localStorage.setItem('cs2external_users', JSON.stringify(this.users));
        localStorage.setItem('cs2external_stats', JSON.stringify(this.stats));
    }

    // Обновление счетчиков на странице
    updateCounters() {
        const userCounter = document.getElementById('registeredUsers');
        const slotsCounter = document.getElementById('betaSlots');
        
        if (userCounter) {
            this.animateCounter(userCounter, this.stats.registeredUsers);
        }
        
        if (slotsCounter) {
            slotsCounter.textContent = this.stats.betaSlots;
            if (this.stats.betaSlots < 10) {
                slotsCounter.style.color = 'var(--accent-red)';
                slotsCounter.style.animation = 'pulse 1s infinite';
            }
        }
    }

    // Анимация счетчика
    animateCounter(element, targetValue) {
        const currentValue = parseInt(element.textContent) || 0;
        const increment = Math.ceil((targetValue - currentValue) / 20);
        
        if (currentValue < targetValue) {
            element.textContent = Math.min(currentValue + increment, targetValue);
            element.classList.add('counting');
            
            setTimeout(() => {
                this.animateCounter(element, targetValue);
            }, 50);
        } else {
            element.classList.remove('counting');
        }
    }

    // Запуск обновлений в реальном времени
    startRealTimeUpdates() {
        setInterval(() => {
            // Симуляция новых регистраций
            if (Math.random() > 0.85) {
                const newUsers = Math.floor(Math.random() * 2) + 1;
                this.stats.registeredUsers += newUsers;
                this.stats.betaSlots = Math.max(0, this.stats.betaSlots - newUsers);
                this.stats.lastUpdate = new Date().toISOString();
                
                this.saveData();
                this.updateCounters();
                
                // Показываем уведомление
                if (window.showNotification) {
                    window.showNotification(`+${newUsers} новых пользователей!`, 'info');
                }
            }
        }, 45000); // Каждые 45 секунд
    }

    // Получение статистики
    getStats() {
        return {
            totalUsers: this.users.length,
            activeUsers: this.users.filter(user => user.isActive).length,
            betaSlots: this.stats.betaSlots,
            registeredToday: this.users.filter(user => {
                const today = new Date().toDateString();
                const userDate = new Date(user.registrationDate).toDateString();
                return today === userDate;
            }).length
        };
    }

    // Экспорт данных (для администратора)
    exportData() {
        return {
            users: this.users,
            stats: this.stats,
            exportDate: new Date().toISOString()
        };
    }

    // Очистка старых данных
    cleanupOldData() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        // Удаляем неактивных пользователей старше 30 дней
        this.users = this.users.filter(user => {
            const lastLogin = new Date(user.lastLogin);
            return user.isActive || lastLogin > thirtyDaysAgo;
        });
        
        this.saveData();
    }
}

// Создаем глобальный экземпляр системы пользователей
window.userSystem = new UserSystem();

// Экспортируем для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserSystem;
}