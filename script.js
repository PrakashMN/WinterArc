class WinterArcTracker {
    constructor() {
        this.defaultHabits = [
            'wakeup', 'leetcode', 'dsa', 'dev', 
            'workout', 'insta', 'nojunk', 'selfcontrol'
        ];
        
        // Initialize username system
        this.currentUser = null;
        this.initializeUser();
        
        this.habits = JSON.parse(this.getStorageItem('customHabits')) || this.defaultHabits;
        this.currentView = 'today';
        this.currentMonth = new Date();
        
        // Use a recent date or stored user start date for proper tracking
        const storedStartDate = this.getStorageItem('winterArcStartDate');
        if (storedStartDate) {
            this.startDate = new Date(storedStartDate);
        } else {
            this.startDate = new Date('2025-10-01');
        }
        this.endDate = new Date('2025-12-30');
        this.cachedElements = {};
        
        // Only initialize if user is set
        if (this.currentUser) {
            this.init();
        }
    }
    
    initializeUser() {
        const savedUser = localStorage.getItem('currentWinterArcUser');
        if (savedUser) {
            this.currentUser = savedUser;
            this.updateUserDisplay();
        } else {
            this.showUsernameModal();
        }
    }
    
    showUsernameModal() {
        const modal = document.getElementById('usernameModal');
        const input = document.getElementById('usernameInput');
        const startBtn = document.getElementById('startJourneyBtn');
        
        if (modal) {
            modal.style.display = 'flex';
            
            const handleStart = () => {
                const username = input.value.trim();
                if (username && username.length >= 2) {
                    this.setUser(username);
                    modal.style.display = 'none';
                    this.init();
                } else {
                    this.showNotification('Please enter a name (at least 2 characters)', 'warning');
                    input.focus();
                }
            };
            
            startBtn.addEventListener('click', handleStart);
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') handleStart();
            });
            
            // Focus input after modal is shown
            setTimeout(() => input.focus(), 100);
        }
    }
    
    setUser(username) {
        this.currentUser = username;
        localStorage.setItem('currentWinterArcUser', username);
        this.updateUserDisplay();
        console.log(`🦇 ${username} started their Winter Arc journey!`);
    }
    
    updateUserDisplay() {
        const userDisplay = document.getElementById('currentUser');
        if (userDisplay && this.currentUser) {
            userDisplay.textContent = `🦇 ${this.currentUser}`;
        }
    }
    
    switchUser() {
        if (confirm('🔄 Switch to a different user? This will save current progress.')) {
            localStorage.removeItem('currentWinterArcUser');
            location.reload();
        }
    }
    
    // User-specific storage methods with error handling
    getStorageItem(key) {
        if (!this.currentUser) return null;
        try {
            return localStorage.getItem(`${this.currentUser}_${key}`);
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            this.showNotification('Error loading data. Using defaults.', 'warning');
            return null;
        }
    }
    
    setStorageItem(key, value) {
        if (!this.currentUser) return false;
        try {
            localStorage.setItem(`${this.currentUser}_${key}`, value);
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            if (error.name === 'QuotaExceededError') {
                this.showNotification('Storage is full. Please clear some data.', 'error');
            } else {
                this.showNotification('Error saving data. Changes may not persist.', 'error');
            }
            return false;
        }
    }
    
    removeStorageItem(key) {
        if (!this.currentUser) return false;
        try {
            localStorage.removeItem(`${this.currentUser}_${key}`);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    }
    
    init() {
        this.loadTheme();
        this.updateDate();
        this.checkAndSetStartDate();
        this.updateDayCounter();
        this.renderCustomHabits();
        this.loadData();
        this.bindEvents();
        this.updateProgress();
        this.updateStats();
        this.updateBadges();
        this.showToday();
        this.setupMidnightRefresh();
        this.setupPeriodicUpdate();
    }
    
    setupMidnightRefresh() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0); // Set to midnight
        
        const msUntilMidnight = tomorrow.getTime() - now.getTime();
        
        // Set timeout for midnight refresh
        setTimeout(() => {
            console.log('🌅 Midnight reached - refreshing for new day...');
            location.reload();
        }, msUntilMidnight);
        
        console.log(`🕛 Midnight auto-refresh scheduled in ${Math.round(msUntilMidnight / 1000 / 60)} minutes`);
    }
    
    setupPeriodicUpdate() {
        // Update date display every minute and check for date changes
        setInterval(() => {
            const currentDate = this.getToday();
            if (currentDate !== this.lastKnownDate) {
                console.log('📅 Date changed detected, refreshing page...');
                location.reload();
            }
            this.updateDate(); // Update countdown timer
        }, 60000); // Check every minute
        
        this.lastKnownDate = this.getToday();
    }
    
    

    checkAndSetStartDate() {
        const storedStartDate = this.getStorageItem('winterArcStartDate');
        
        // Check if we have an old problematic date that makes us show Day 90
        if (storedStartDate) {
            const today = new Date();
            const startDate = new Date(storedStartDate);
            const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
            
            // If the stored date results in more than 90 days, reset it
            if (daysDiff > 90) {
                console.log('Detected old start date, resetting...');
                this.removeStorageItem('winterArcStartDate');
            }
        }
        
        if (!this.getStorageItem('winterArcStartDate')) {
            // Use today as default start date for new users
            const today = new Date();
            const defaultDate = today.toISOString().split('T')[0];
            this.setStorageItem('winterArcStartDate', defaultDate);
            this.startDate = new Date(defaultDate);
            this.showNotification(`🦇 Welcome ${this.currentUser}! Your Winter Arc starts today!`, 'success');
        } else {
            // Load the valid stored date
            this.startDate = new Date(this.getStorageItem('winterArcStartDate'));
        }
    }

    isValidDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        
        return date instanceof Date && !isNaN(date) && 
               date <= today && date >= oneYearAgo;
    }
    
    resetStartDate() {
        this.removeStorageItem('winterArcStartDate');
        this.checkAndSetStartDate();
        this.updateDayCounter();
        this.updateDate();
        this.showNotification('Start date updated!', 'success');
    }

    updateDate() {
        const currentDate = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const dateText = currentDate.toLocaleDateString('en-US', options);
        
        // Calculate time until midnight for automatic day switching
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const msUntilMidnight = tomorrow.getTime() - today.getTime();
        const hoursUntilMidnight = Math.floor(msUntilMidnight / (1000 * 60 * 60));
        const minutesUntilMidnight = Math.floor((msUntilMidnight % (1000 * 60 * 60)) / (1000 * 60));
        const timeInfo = `<br><small style="opacity: 0.7; font-size: 0.8rem;">⏰ Next day in: ${hoursUntilMidnight}h ${minutesUntilMidnight}m</small>`;
        
        const dateElement = this.getCachedElement('currentDate');
        if (dateElement) {
            dateElement.innerHTML = `${dateText}${timeInfo}`;
        }
    }

        getToday() {
        return new Date().toISOString().split('T')[0];
    }

    validateWakeupTime(time) {
        const [hours, minutes] = time.split(':').map(Number);
        if (hours < 4 || hours > 10) {
            this.showNotification('Wake up time should be between 4:00 AM and 10:00 AM', 'warning');
            return false;
        }
        return true;
    }

    createHabitData(completed, additionalData = {}) {
        return {
            completed: completed,
            timestamp: new Date().toISOString(),
            ...additionalData
        };
    }

    getCachedElement(id) {
        if (!this.cachedElements[id]) {
            this.cachedElements[id] = document.getElementById(id);
        }
        return this.cachedElements[id];
    }

    getAllData() {
        try {
            return JSON.parse(this.getStorageItem('winterArcHistory') || '{}');
        } catch (error) {
            console.error('Error parsing saved data:', error);
            this.showNotification('Error loading data. Starting fresh.', 'error');
            return {};
        }
    }

    loadData() {
        const today = this.getToday();
        const allData = this.getAllData();
        const todayData = allData[today] || { habits: {}, notes: '' };
        
        // Load data for all habits currently in DOM
        document.querySelectorAll('.habit').forEach(habitEl => {
            const habitId = habitEl.dataset.habit;
            const checkbox = habitEl.querySelector('.checkbox');
            
            if (habitId === 'wakeup' && todayData.habits[habitId]) {
                // Handle both old and new data formats
                let isCompleted, time;
                if (typeof todayData.habits[habitId] === 'object') {
                    isCompleted = todayData.habits[habitId].completed;
                    time = todayData.habits[habitId].time || '06:00';
                } else {
                    isCompleted = todayData.habits[habitId] === true;
                    time = '06:00';
                }
                
                const timeInput = this.getCachedElement('wakeupTime');
                if (timeInput) timeInput.value = time;
                
                if (isCompleted) {
                    habitEl.classList.add('completed');
                    checkbox.classList.add('checked');
                } else {
                    habitEl.classList.remove('completed');
                    checkbox.classList.remove('checked');
                }
                this.updateAriaStates(habitEl);
            } else if (todayData.habits[habitId]) {
                // Handle both old and new data formats
                const isCompleted = typeof todayData.habits[habitId] === 'object' 
                    ? todayData.habits[habitId].completed 
                    : todayData.habits[habitId] === true;
                    
                if (isCompleted) {
                    habitEl.classList.add('completed');
                    checkbox.classList.add('checked');
                } else {
                    habitEl.classList.remove('completed');
                    checkbox.classList.remove('checked');
                }
                this.updateAriaStates(habitEl);
            } else {
                habitEl.classList.remove('completed');
                checkbox.classList.remove('checked');
                this.updateAriaStates(habitEl);
            }
        });

        const notesEl = this.getCachedElement('dailyNotes');
        if (notesEl) notesEl.value = todayData.notes || '';
        this.updateStreak();
    }

    saveData() {
        // Debounce save operations
        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => {
            this.performSave();
        }, 500);
    }

    performSave() {
        const today = this.getToday();
        const allData = this.getAllData();
        const habits = {};
        
        // Save all habits currently in DOM with standardized format
        document.querySelectorAll('.habit').forEach(habitEl => {
            const habitId = habitEl.dataset.habit;
            const isCompleted = habitEl.classList.contains('completed');
            
            if (habitId === 'wakeup') {
                const timeInput = this.getCachedElement('wakeupTime');
                const time = timeInput ? timeInput.value : '06:00';
                
                // Validate time before saving
                if (this.validateWakeupTime(time)) {
                    habits[habitId] = this.createHabitData(isCompleted, { time });
                } else {
                    habits[habitId] = this.createHabitData(isCompleted, { time: '06:00' });
                }
            } else {
                habits[habitId] = this.createHabitData(isCompleted);
            }
        });

        const notesEl = this.getCachedElement('dailyNotes');
        const notes = notesEl ? notesEl.value : '';
        allData[today] = { 
            habits, 
            date: today, 
            notes,
            lastUpdated: new Date().toISOString()
        };
        
        try {
            this.setStorageItem('winterArcHistory', JSON.stringify(allData));
        } catch (error) {
            console.error('Error saving data:', error);
            this.showNotification('Error saving data. Storage might be full.', 'error');
        }
    }

    bindEvents() {
        this.bindHabitEvents();
        this.bindKeyboardEvents();

        const resetBtn = this.getCachedElement('resetDay');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetDay();
            });
        }
        
        const todayBtn = this.getCachedElement('todayBtn');
        if (todayBtn) {
            todayBtn.addEventListener('click', () => {
                this.showToday();
                this.updateNavAriaStates('todayBtn');
            });
        }
        
        const saveTodayBtn = this.getCachedElement('saveTodayBtn');
        if (saveTodayBtn) {
            saveTodayBtn.addEventListener('click', () => {
                this.performSave();
                this.showNotification('Today\'s progress saved!');
            });
        }
        
        const viewHistoryBtn = this.getCachedElement('viewHistoryBtn');
        if (viewHistoryBtn) {
            viewHistoryBtn.addEventListener('click', () => {
                this.showHistory();
            });
        }
        
        const journalBtn = this.getCachedElement('journalBtn');
        if (journalBtn) {
            journalBtn.addEventListener('click', () => {
                this.showJournal();
                this.updateNavAriaStates('journalBtn');
            });
        }
        
        const settingsBtn = this.getCachedElement('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showSettings();
                this.updateNavAriaStates('settingsBtn');
            });
        }
        
        const saveNotesBtn = this.getCachedElement('saveNotesBtn');
        if (saveNotesBtn) {
            saveNotesBtn.addEventListener('click', () => {
                this.performSave();
                this.showNotification('Notes saved!');
            });
        }
        
        const exportBtn = this.getCachedElement('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportPDF();
            });
        }
        
        const themeToggle = this.getCachedElement('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
        
        const wakeupTime = this.getCachedElement('wakeupTime');
        if (wakeupTime) {
            wakeupTime.addEventListener('change', (e) => {
                if (this.validateWakeupTime(e.target.value)) {
                    this.saveData();
                } else {
                    // Reset to valid time
                    e.target.value = '06:00';
                }
            });
        }
        
        const addHabitBtn = document.getElementById('addHabitBtn');
        if (addHabitBtn) {
            addHabitBtn.addEventListener('click', () => {
                this.addNewHabit();
            });
        }
        
        const saveSettingsBtn = document.getElementById('saveSettingsBtn');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => {
                this.saveHabitSettings();
            });
        }
        
        // Refresh button for mission log
        const refreshLogBtn = document.getElementById('refreshLog');
        if (refreshLogBtn) {
            refreshLogBtn.addEventListener('click', () => {
                this.updateMissionLog();
                this.showNotification('Mission log refreshed!', 'info');
            });
        }
        
        // Clear history button
        const clearHistoryBtn = document.getElementById('clearHistoryBtn');
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', () => {
                if (confirm('🧩 Are you sure you want to clear ALL mission history data? This cannot be undone!')) {
                    this.clearAllHistoryData();
                    this.updateMissionLog();
                    this.showNotification('Mission history cleared! Fresh start activated.', 'success');
                }
            });
        }
        // Switch user button
        const switchUserBtn = document.getElementById('switchUserBtn');
        if (switchUserBtn) {
            switchUserBtn.addEventListener('click', () => {
                this.switchUser();
            });
        }


    }
    
    updateNavAriaStates(activeButtonId) {
        const navButtons = ['todayBtn', 'journalBtn', 'settingsBtn'];
        navButtons.forEach(btnId => {
            const btn = this.getCachedElement(btnId);
            if (btn) {
                btn.setAttribute('aria-pressed', (btnId === activeButtonId).toString());
            }
        });
    }
    
    bindKeyboardEvents() {
        // Add keyboard navigation for checkboxes
        document.addEventListener('keydown', (e) => {
            if (e.target.classList.contains('checkbox')) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const habitEl = e.target.closest('.habit');
                    if (habitEl) {
                        this.toggleHabit(habitEl);
                        this.updateAriaStates(habitEl);
                    }
                }
            }
            
            // Quick navigation keys
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 's':
                        e.preventDefault();
                        this.performSave();
                        this.showNotification('Progress saved!', 'success');
                        break;
                    case 'r':
                        if (e.shiftKey) {
                            e.preventDefault();
                            this.resetDay();
                        }
                        break;
                }
            }
        });
    }
    
    updateAriaStates(habitEl) {
        const checkbox = habitEl.querySelector('.checkbox');
        const isCompleted = habitEl.classList.contains('completed');
        if (checkbox) {
            checkbox.setAttribute('aria-checked', isCompleted.toString());
        }
    }
    
    bindHabitEvents() {
        // Use event delegation to avoid memory leaks
        const habitsList = document.querySelector('.habits-list');
        if (habitsList) {
            // Remove old listener if exists
            if (this.habitListListener) {
                habitsList.removeEventListener('click', this.habitListListener);
            }
            
            // Create new listener with proper binding
            this.habitListListener = (e) => {
                const habitEl = e.target.closest('.habit');
                if (habitEl && !e.target.classList.contains('time-input')) {
                    this.toggleHabit(habitEl);
                    this.updateAriaStates(habitEl);
                }
            };
            
            habitsList.addEventListener('click', this.habitListListener);
        }
    }

    toggleHabit(habitEl) {
        const checkbox = habitEl.querySelector('.checkbox');
        
        habitEl.classList.toggle('completed');
        checkbox.classList.toggle('checked');
        
        this.updateProgress();
        this.updateBadges();
        // Immediate save for better user experience
        this.performSave();
    }

    updateProgress() {
        const completed = document.querySelectorAll('.habit.completed').length;
        const total = document.querySelectorAll('.habit').length;
        const progressText = document.getElementById('progressText');
        const progressCircle = document.querySelector('.progress-circle');
        
        if (progressText) progressText.textContent = `${completed}/${total}`;
        
        if (progressCircle) {
            if (completed === total) {
                progressCircle.classList.add('complete');
            } else {
                progressCircle.classList.remove('complete');
            }
        }
    }

    resetDay() {
        if (confirm('⚠️ Reset all habits for today? This cannot be undone.')) {
            document.querySelectorAll('.habit').forEach(habit => {
                habit.classList.remove('completed');
                habit.querySelector('.checkbox').classList.remove('checked');
            });
            
            this.updateProgress();
            this.performSave();
            this.updateStats();
            this.showNotification('Day reset successfully!', 'info');
        }
    }

    updateDayCounter() {
        const today = new Date();
        const daysDiff = Math.floor((today - this.startDate) / (1000 * 60 * 60 * 24)) + 1;
        const totalDays = 90;
        
        // Ensure we show a realistic day number (1-90)
        const dayNum = Math.max(1, Math.min(daysDiff, totalDays));
        
        const dayCounter = this.getCachedElement('dayCounter');
        if (dayCounter) {
            if (dayNum >= totalDays) {
                dayCounter.textContent = `🎉 Completed! Day ${totalDays} of ${totalDays}`;
                dayCounter.style.color = 'var(--accent-gold)';
            } else {
                dayCounter.textContent = `Day ${dayNum} of ${totalDays}`;
                dayCounter.style.color = '';
            }
        }
    }
    
    updateStreak() {
        // Calculate current day of Winter Arc for display
        const today = new Date();
        const daysDiff = Math.floor((today - this.startDate) / (1000 * 60 * 60 * 24)) + 1;
        const totalDays = 90;
        
        // Ensure day number is within valid range
        const currentDay = Math.max(1, Math.min(daysDiff, totalDays));
        
        // Update the streak display to show current day
        const streakEl = this.getCachedElement('streak');
        if (streakEl) {
            streakEl.textContent = currentDay;
        }
        
        // Calculate actual streak for the stats section
        const allData = this.getAllData();
        const dates = Object.keys(allData).sort();
        let actualStreak = 0;
        
        for (let i = dates.length - 1; i >= 0; i--) {
            const dayData = allData[dates[i]];
            let completed = 0;
            const totalHabitsForDay = Object.keys(dayData.habits).length;
            
            Object.values(dayData.habits).forEach(habit => {
                if (typeof habit === 'object' && habit.completed) {
                    completed++;
                } else if (habit === true) {
                    completed++;
                }
            });
            
            if (completed === totalHabitsForDay && totalHabitsForDay > 0) {
                actualStreak++;
            } else {
                break;
            }
        }
        
        // Update streak count in history section
        const streakCountEl = this.getCachedElement('streakCount');
        if (streakCountEl) {
            streakCountEl.textContent = `🔥 ${actualStreak}`;
        }
    }
    
    updateStats() {
        const allData = this.getAllData();
        const dates = Object.keys(allData);
        const currentHabitCount = document.querySelectorAll('.habit').length;
        
        let totalDays = dates.length;
        let perfectDays = 0;
        let totalCompletion = 0;
        
        dates.forEach(date => {
            const dayData = allData[date];
            let completed = 0;
            
            Object.values(dayData.habits).forEach(habit => {
                if (typeof habit === 'object' && habit.completed) {
                    completed++;
                } else if (habit === true) {
                    completed++;
                }
            });
            
            const dayHabitCount = Object.keys(dayData.habits).length;
            if (completed === dayHabitCount && dayHabitCount > 0) perfectDays++;
            totalCompletion += completed;
        });
        
        const totalPossibleCompletions = dates.reduce((sum, date) => {
            const dayData = allData[date];
            return sum + Object.keys(dayData.habits).length;
        }, 0);
        
        const avgCompletion = totalPossibleCompletions > 0 ? Math.round((totalCompletion / totalPossibleCompletions) * 100) : 0;
        
        const totalDaysEl = document.getElementById('totalDays');
        const perfectDaysEl = document.getElementById('perfectDays');
        const avgCompletionEl = document.getElementById('avgCompletion');
        
        if (totalDaysEl) totalDaysEl.textContent = totalDays;
        if (perfectDaysEl) perfectDaysEl.textContent = perfectDays;
        if (avgCompletionEl) avgCompletionEl.textContent = avgCompletion + '%';
        
        this.updateStreak();
        this.renderWeeklyChart();
    }
    
    showToday() {
        this.currentView = 'today';
        document.getElementById('todayBtn')?.classList.add('active');
        document.getElementById('journalBtn')?.classList.remove('active');
        document.getElementById('settingsBtn')?.classList.remove('active');
        
        const habitsList = document.querySelector('.habits-list');
        const progressSection = document.querySelector('.progress-section');
        const actionButtons = document.querySelector('.action-buttons');
        const navButtons = document.querySelector('.nav-buttons');
        const resetDay = document.getElementById('resetDay');
        const newDayBtn = document.getElementById('newDayBtn');
        const historySection = document.getElementById('historySection');
        const journalSection = document.getElementById('journalSection');
        const settingsSection = document.getElementById('settingsSection');
        
        if (habitsList) habitsList.style.display = 'block';
        if (progressSection) progressSection.style.display = 'flex';
        if (actionButtons) actionButtons.style.display = 'flex';
        if (navButtons) navButtons.style.display = 'flex';
        if (resetDay) resetDay.style.display = 'block';
        if (newDayBtn) newDayBtn.style.display = 'block';
        if (historySection) historySection.style.display = 'none';
        if (journalSection) journalSection.style.display = 'none';
        if (settingsSection) settingsSection.style.display = 'none';
        
        // Update navigation ARIA states
        this.updateNavAriaStates('todayBtn');
        
        console.log('🦇 Returned to Today view - mission log hidden');
    }
    
    clearAllHistoryData() {
        console.log('� Clearing all Winter Arc history data...');
        
        // More aggressive clearing - check all possible key patterns
        const keysToRemove = [];
        
        // Get all keys
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                // Remove user-specific winterArc_ prefixed keys except start date
                if (key.startsWith(`${this.currentUser}_winterArc_`) && key !== `${this.currentUser}_winterArcStartDate`) {
                    keysToRemove.push(key);
                }
                // Remove user-specific date pattern keys (YYYY-MM-DD)
                if (key.startsWith(`${this.currentUser}_`) && key.replace(`${this.currentUser}_`, '').match(/^\d{4}-\d{2}-\d{2}$/)) {
                    keysToRemove.push(key);
                }
                // Remove any other user-specific winter arc related keys
                if (key.startsWith(`${this.currentUser}_`) && (key.includes('winter') || key.includes('Winter') || key.includes('arc') || key.includes('Arc'))) {
                    if (key !== `${this.currentUser}_winterArcStartDate`) {
                        keysToRemove.push(key);
                    }
                }
            }
        }
        
        // Remove duplicate keys
        const uniqueKeys = [...new Set(keysToRemove)];
        
        // Remove the keys
        uniqueKeys.forEach(key => {
            console.log('🗑️ Removing:', key);
            localStorage.removeItem(key);
        });
        
        console.log(`� Cleared ${uniqueKeys.length} history entries`);
        
        // Force update mission log
        setTimeout(() => {
            this.updateMissionLog();
        }, 100);
    }
    
    showHistory() {
        this.currentView = 'history';
        
        // Save current progress before viewing history
        this.performSave();
        
        document.getElementById('todayBtn')?.classList.remove('active');
        document.getElementById('journalBtn')?.classList.remove('active');
        document.getElementById('settingsBtn')?.classList.remove('active');
        
        const habitsList = document.querySelector('.habits-list');
        const progressSection = document.querySelector('.progress-section');
        const actionButtons = document.querySelector('.action-buttons');
        const navButtons = document.querySelector('.nav-buttons');
        const resetDay = document.getElementById('resetDay');
        const historySection = document.getElementById('historySection');
        const journalSection = document.getElementById('journalSection');
        const settingsSection = document.getElementById('settingsSection');
        
        if (habitsList) habitsList.style.display = 'none';
        if (progressSection) progressSection.style.display = 'none';
        if (actionButtons) actionButtons.style.display = 'none';
        if (navButtons) navButtons.style.display = 'none';
        if (resetDay) resetDay.style.display = 'none';
        if (historySection) historySection.style.display = 'block';
        if (journalSection) journalSection.style.display = 'none';
        if (settingsSection) settingsSection.style.display = 'none';
        
        this.renderHistoryData();
    }
    
    showJournal() {
        this.currentView = 'journal';
        document.getElementById('todayBtn')?.classList.remove('active');
        document.getElementById('journalBtn')?.classList.add('active');
        document.getElementById('settingsBtn')?.classList.remove('active');
        
        const habitsList = document.querySelector('.habits-list');
        const progressSection = document.querySelector('.progress-section');
        const actionButtons = document.querySelector('.action-buttons');
        const navButtons = document.querySelector('.nav-buttons');
        const resetDay = document.getElementById('resetDay');
        const historySection = document.getElementById('historySection');
        const journalSection = document.getElementById('journalSection');
        const settingsSection = document.getElementById('settingsSection');
        
        if (habitsList) habitsList.style.display = 'none';
        if (progressSection) progressSection.style.display = 'none';
        if (actionButtons) actionButtons.style.display = 'none';
        if (navButtons) navButtons.style.display = 'flex';
        if (resetDay) resetDay.style.display = 'none';
        if (historySection) historySection.style.display = 'none';
        if (journalSection) journalSection.style.display = 'block';
        if (settingsSection) settingsSection.style.display = 'none';
        
        this.loadNotesHistory();
    }
    
    showSettings() {
        this.currentView = 'settings';
        document.getElementById('todayBtn')?.classList.remove('active');
        document.getElementById('journalBtn')?.classList.remove('active');
        document.getElementById('settingsBtn')?.classList.add('active');
        
        const habitsList = document.querySelector('.habits-list');
        const progressSection = document.querySelector('.progress-section');
        const actionButtons = document.querySelector('.action-buttons');
        const navButtons = document.querySelector('.nav-buttons');
        const resetDay = document.getElementById('resetDay');
        const historySection = document.getElementById('historySection');
        const journalSection = document.getElementById('journalSection');
        const settingsSection = document.getElementById('settingsSection');
        
        if (habitsList) habitsList.style.display = 'none';
        if (progressSection) progressSection.style.display = 'none';
        if (actionButtons) actionButtons.style.display = 'none';
        if (navButtons) navButtons.style.display = 'flex';
        if (resetDay) resetDay.style.display = 'none';
        if (historySection) historySection.style.display = 'none';
        if (journalSection) journalSection.style.display = 'none';
        if (settingsSection) settingsSection.style.display = 'block';
        
        this.renderHabitEditor();
    }
    
    loadNotesHistory() {
        const notesHistory = document.getElementById('notesHistory');
        if (!notesHistory) return;
        
        const allData = this.getAllData();
        const dates = Object.keys(allData).sort().reverse();
        
        notesHistory.innerHTML = '';
        
        dates.forEach(date => {
            const dayData = allData[date];
            if (dayData.notes && dayData.notes.trim()) {
                const noteEntry = document.createElement('div');
                noteEntry.className = 'note-entry';
                noteEntry.innerHTML = `
                    <div class="note-date">${new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                    <div class="note-text">${dayData.notes}</div>
                `;
                notesHistory.appendChild(noteEntry);
            }
        });
    }
    
    renderHistoryData() {
        const historySection = document.getElementById('historySection');
        if (!historySection) return;
        
        const allData = this.getAllData();
        const dates = Object.keys(allData).sort().reverse();
        
        console.log('📊 History Data Debug:', { allData, dates, dataKeys: Object.keys(allData) });
        
        let historyHTML = '<h3>🦇 Mission Log</h3>';
        
        if (dates.length === 0) {
            historyHTML += `
                <div class="no-data-message">
                    <p>🦇 No mission data found yet.</p>
                    <p>Complete some habits and save your progress to see your Batman journey!</p>
                </div>
            `;
        } else {
            dates.forEach(date => {
                const dayData = allData[date];
                let completed = 0;
                
                if (dayData && dayData.habits) {
                    Object.values(dayData.habits).forEach(habit => {
                        if (typeof habit === 'object' && habit.completed) {
                            completed++;
                        } else if (habit === true) {
                            completed++;
                        }
                    });
                }
                
                const total = dayData && dayData.habits ? Object.keys(dayData.habits).length : 0;
                const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
                const dateFormatted = new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                });
                
                // Batman-themed completion status
                let statusIcon = '⚫'; // No data
                let statusText = 'No data';
                if (total > 0) {
                    if (percentage === 100) {
                        statusIcon = '🦇';
                        statusText = 'Perfect Mission';
                    } else if (percentage >= 75) {
                        statusIcon = '⚡';
                        statusText = 'Strong Performance';
                    } else if (percentage >= 50) {
                        statusIcon = '🌟';
                        statusText = 'Good Progress';
                    } else {
                        statusIcon = '📈';
                        statusText = 'Building Momentum';
                    }
                }
                
                historyHTML += `
                    <div class="history-day">
                        <div class="history-date">${statusIcon} ${dateFormatted}</div>
                        <div class="history-progress">
                            <span class="progress-bar">
                                <span class="progress-fill" style="width: ${percentage}%"></span>
                            </span>
                            <span class="progress-text">${completed}/${total} (${percentage}%) - ${statusText}</span>
                        </div>
                        ${dayData && dayData.notes ? `<div class="history-notes">📝 ${dayData.notes}</div>` : ''}
                    </div>
                `;
            });
        }
        
        historyHTML += '<button class="back-btn" id="backToTodayBtn">🦇 Back to Today</button>';
        historySection.innerHTML = historyHTML;
        
        // Add event listener for the back button
        const backBtn = document.getElementById('backToTodayBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.showToday();
            });
        }
    }
    
    updateMissionLog() {
        // Just call renderHistoryData to refresh the mission log
        this.renderHistoryData();
    }
    
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        
        let backgroundColor;
        switch (type) {
            case 'error':
                backgroundColor = '#f44336';
                break;
            case 'warning':
                backgroundColor = '#ff9800';
                break;
            case 'info':
                backgroundColor = '#2196f3';
                break;
            default:
                backgroundColor = '#4CAF50';
        }
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${backgroundColor};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }
    
    exportPDF() {
        // First create a backup
        this.createBackup();
        
        const allData = this.getAllData();
        const dates = Object.keys(allData).sort();
        const stats = this.generateStatsForExport();
        
        const reportContent = `WINTER ARC PROGRESS REPORT
Generated: ${new Date().toLocaleDateString()}

` +
            `STATISTICS:
` +
            `Total Days Tracked: ${stats.totalDays}
` +
            `Perfect Days: ${stats.perfectDays}
` +
            `Average Completion: ${stats.avgCompletion}%
` +
            `Current Streak: ${stats.streak}

` +
            `DAILY PROGRESS:
` +
            dates.map(date => {
                const dayData = allData[date];
                const completed = this.countCompletedHabits(dayData.habits);
                const total = Object.keys(dayData.habits).length;
                return `${date}: ${completed}/${total} habits (${Math.round((completed/total)*100)}%)`;
            }).join('\n');
        
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `winter-arc-report-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Report exported successfully!');
    }

    createBackup() {
        const allData = this.getAllData();
        const backup = {
            data: allData,
            timestamp: new Date().toISOString(),
            version: '2.0'
        };
        
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `winter-arc-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    generateStatsForExport() {
        const allData = this.getAllData();
        const dates = Object.keys(allData);
        
        let totalDays = dates.length;
        let perfectDays = 0;
        let totalCompletion = 0;
        
        dates.forEach(date => {
            const dayData = allData[date];
            const completed = this.countCompletedHabits(dayData.habits);
            const total = Object.keys(dayData.habits).length;
            
            if (completed === total && total > 0) perfectDays++;
            totalCompletion += completed;
        });
        
        const totalPossibleCompletions = dates.reduce((sum, date) => {
            return sum + Object.keys(allData[date].habits).length;
        }, 0);
        
        const avgCompletion = totalPossibleCompletions > 0 ? Math.round((totalCompletion / totalPossibleCompletions) * 100) : 0;
        
        return {
            totalDays,
            perfectDays,
            avgCompletion,
            streak: this.calculateCurrentStreak()
        };
    }

    countCompletedHabits(habits) {
        let completed = 0;
        Object.values(habits).forEach(habit => {
            if (typeof habit === 'object' && habit.completed) {
                completed++;
            } else if (habit === true) {
                completed++;
            }
        });
        return completed;
    }

    calculateCurrentStreak() {
        const allData = this.getAllData();
        const dates = Object.keys(allData).sort();
        let streak = 0;
        
        for (let i = dates.length - 1; i >= 0; i--) {
            const dayData = allData[dates[i]];
            const completed = this.countCompletedHabits(dayData.habits);
            const total = Object.keys(dayData.habits).length;
            
            if (completed === total && total > 0) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }
    
    toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.body.setAttribute('data-theme', newTheme);
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.textContent = newTheme === 'light' ? '🌙' : '☀️';
        }
        
        this.setStorageItem('theme', newTheme);
    }
    
    loadTheme() {
        const savedTheme = this.getStorageItem('theme') || 'dark';
        document.body.setAttribute('data-theme', savedTheme);
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.textContent = savedTheme === 'light' ? '🌙' : '☀️';
        }
    }
    
    updateBadges() {
        const badges = [];
        const completed = document.querySelectorAll('.habit.completed').length;
        const total = document.querySelectorAll('.habit').length;
        
        if (completed === 0) {
            // No badges for 0 completion
        } else if (completed >= Math.ceil(total / 2)) {
            badges.push('⭐ Half Way');
        }
        
        if (completed === total && total > 0) {
            badges.push('🔥 Perfect Day');
        }
        
        const badgesContainer = document.getElementById('badges');
        if (badgesContainer) {
            badgesContainer.innerHTML = badges.map(badge => 
                `<span class="badge">${badge}</span>`
            ).join('');
        }
    }
    
    renderWeeklyChart() {
        const canvas = document.getElementById('weeklyChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(50, 50, 100, 100);
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText('Weekly Chart', 60, 110);
    }
    
    renderCustomHabits() {
        // Get saved custom habits
        const savedHabits = JSON.parse(this.getStorageItem('customHabitsData') || '[]');
        
        if (savedHabits.length > 0) {
            // Clear existing habits and render custom ones
            const habitsList = document.querySelector('.habits-list');
            habitsList.innerHTML = '';
            
            savedHabits.forEach(habit => {
                const habitEl = document.createElement('div');
                habitEl.className = 'habit';
                habitEl.dataset.habit = habit.id;
                
                if (habit.id === 'wakeup') {
                    habitEl.innerHTML = `
                        <span class="habit-icon">${habit.icon}</span>
                        <span class="habit-text">${habit.text}</span>
                        <input type="time" class="time-input" id="wakeupTime" value="06:00">
                        <div class="checkbox"></div>
                    `;
                } else {
                    habitEl.innerHTML = `
                        <span class="habit-icon">${habit.icon}</span>
                        <span class="habit-text">${habit.text}</span>
                        <div class="checkbox"></div>
                    `;
                }
                
                habitsList.appendChild(habitEl);
            });
            
            // Update habits array
            this.habits = savedHabits.map(h => h.id);
        }
    }
    
    renderHabitEditor() {
        const editor = document.getElementById('habitEditor');
        if (!editor) return;
        
        editor.innerHTML = '';
        
        // Show all habits currently in DOM with remove buttons
        document.querySelectorAll('.habit').forEach(habitEl => {
            const habitId = habitEl.dataset.habit;
            const habitText = habitEl.querySelector('.habit-text').textContent;
            const habitIcon = habitEl.querySelector('.habit-icon').textContent;
            
            const habitEdit = document.createElement('div');
            habitEdit.className = 'habit-edit';
            habitEdit.innerHTML = `
                <span class="habit-icon">${habitIcon}</span>
                <span class="habit-text">${habitText}</span>
                <button class="remove-habit-btn" onclick="tracker.removeHabit('${habitId}')">Remove</button>
            `;
            editor.appendChild(habitEdit);
        });
    }
    
    addNewHabit() {
        const editor = document.getElementById('habitEditor');
        if (!editor) return;
        
        const newHabitEdit = document.createElement('div');
        newHabitEdit.className = 'habit-edit new-habit';
        newHabitEdit.innerHTML = `
            <select class="habit-icon-select">
                <option value="📝">📝</option>
                <option value="🏃">🏃</option>
                <option value="💧">💧</option>
                <option value="🥗">🥗</option>
                <option value="🎨">🎨</option>
                <option value="🎵">🎵</option>
                <option value="🧘">🧘</option>
                <option value="📖">📖</option>
            </select>
            <input type="text" class="habit-text-input" placeholder="Enter habit description">
            <button class="remove-habit-btn" onclick="this.parentElement.remove()">Cancel</button>
        `;
        editor.appendChild(newHabitEdit);
    }
    
    removeHabit(habitId) {
        if (confirm('Remove this habit? This will delete all its data.')) {
            // Remove from habits array
            this.habits = this.habits.filter(h => h !== habitId);
            
            // Remove from DOM
            const habitEl = document.querySelector(`[data-habit="${habitId}"]`);
            if (habitEl) habitEl.remove();
            
            // Update saved habits data
            const currentHabits = [];
            document.querySelectorAll('.habit').forEach(habitEl => {
                const id = habitEl.dataset.habit;
                const icon = habitEl.querySelector('.habit-icon').textContent;
                const text = habitEl.querySelector('.habit-text').textContent;
                currentHabits.push({ id, icon, text });
            });
            
            // Save changes
            this.setStorageItem('customHabitsData', JSON.stringify(currentHabits));
            this.setStorageItem('customHabits', JSON.stringify(this.habits));
            
            // Rebind habit events and update UI
            this.bindHabitEvents();
            this.updateProgress();
            this.updateBadges();
            this.renderHabitEditor();
            this.showNotification('Habit removed!');
        }
    }
    
    saveHabitSettings() {
        // Get current habits from DOM
        const currentHabits = [];
        document.querySelectorAll('.habit').forEach(habitEl => {
            const id = habitEl.dataset.habit;
            const icon = habitEl.querySelector('.habit-icon').textContent;
            const text = habitEl.querySelector('.habit-text').textContent;
            currentHabits.push({ id, icon, text });
        });
        
        // Add new habits
        const newHabits = document.querySelectorAll('.new-habit');
        newHabits.forEach(habitEdit => {
            const icon = habitEdit.querySelector('.habit-icon-select').value;
            const text = habitEdit.querySelector('.habit-text-input').value.trim();
            
            if (text) {
                const habitId = 'custom_' + Date.now();
                currentHabits.push({ id: habitId, icon, text });
                this.habits.push(habitId);
                
                // Add to DOM
                const habitsList = document.querySelector('.habits-list');
                const newHabitEl = document.createElement('div');
                newHabitEl.className = 'habit';
                newHabitEl.dataset.habit = habitId;
                newHabitEl.innerHTML = `
                    <span class="habit-icon">${icon}</span>
                    <span class="habit-text">${text}</span>
                    <div class="checkbox"></div>
                `;
                habitsList.appendChild(newHabitEl);
                
                // Add to DOM first
                habitsList.appendChild(newHabitEl);
            }
        });
        
        // Save complete habit data to localStorage
        this.setStorageItem('customHabitsData', JSON.stringify(currentHabits));
        this.setStorageItem('customHabits', JSON.stringify(this.habits));
        
        // Rebind habit events to include new habits
        this.bindHabitEvents();
        
        // Update UI
        this.updateProgress();
        this.updateBadges();
        this.showNotification('Habits saved successfully!');
        this.showToday();
    }
}

let tracker;

document.addEventListener('DOMContentLoaded', () => {
    tracker = new WinterArcTracker();
});