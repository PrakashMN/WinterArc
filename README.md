# 🦇 Winter Arc: Gotham Edition

> *"It's not who I am underneath, but what I do that defines me."* - Batman

A Batman-themed habit tracker to help you become the hero of your own story during the Winter Arc (October 1 - December 29, 2025).

## 🌟 Live Demo

**🚀 [Try it now: winter-arc-seven.vercel.app](https://winter-arc-seven.vercel.app/)**

## 📖 What is Winter Arc?

Winter Arc is a 90-day self-improvement challenge that runs from October 1st to December 29th. It's about building discipline, consistency, and becoming the best version of yourself during the darker, colder months.

## ✨ Features

### 🦇 **Batman-Themed Experience**
- Dark, cinematic UI inspired by Gotham City
- Batman emoji and references throughout
- Golden accent colors matching Batman's iconic style
- Smooth animations and hover effects

### 📊 **Smart Habit Tracking**
- 8 pre-configured habits for personal development
- Custom wake-up time tracker with validation
- Real-time progress circle and completion percentage
- Instant visual feedback with Batman-themed checkmarks

### 🕛 **Automatic Day Management**
- **Automatic midnight refresh** - App switches to next day at 12:00 AM
- Live countdown timer showing time until next day
- Day counter showing current progress (Day X of 90)
- Backup date detection system for reliability

### 👤 **Multi-User Support**
- User-specific data storage
- Welcome modal for new users
- Switch between different users
- Private data separation per user

### 📈 **Progress Analytics**
- Mission Log with historical data
- Statistics: Total days, perfect days, average completion
- Streak tracking for consecutive perfect days
- Visual progress bars and completion indicators

### 📝 **Journal & Notes**
- Daily reflection textarea
- Notes history with date stamps
- Export functionality for progress reports
- Data backup in JSON format

### ⚙️ **Customization**
- Add/remove custom habits
- Light/dark theme toggle
- Habit editor with emoji selection
- Responsive design for all devices

### 🔒 **Data Management**
- Local storage with error handling
- Data validation and corruption prevention
- Clear history functionality
- Export/backup capabilities

## 🎯 Default Habits

1. **🌆 Rise before dawn @ 6:00** → Like Bruce Wayne
2. **🧾 Master algorithms** → Mental combat training
3. **⚔️ DSA deep dive** → Sharpen your weapons
4. **💻 Build projects** → Forge your legacy
5. **🥷 Physical training** → Body of a vigilante
6. **📱 Social media < 1h** → Focus like Batman
7. **🥗 Clean nutrition** → Fuel for justice
8. **🧠 Mental discipline** → Mind of steel

## 🚀 Getting Started

### Live Version
Simply visit: **[winter-arc-seven.vercel.app](https://winter-arc-seven.vercel.app/)**

### Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/PrakashMN/WinterArc.git
   cd WinterArc
   ```

2. Open `index.html` in your browser or serve it locally:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Or simply open index.html in your browser
   ```

## 🛠️ Tech Stack

- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **Storage**: localStorage API
- **Styling**: CSS Grid, Flexbox, CSS Variables
- **Animations**: CSS Transitions & Keyframes
- **Icons**: Unicode Emojis
- **Deployment**: Vercel

## 📱 Browser Compatibility

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🎨 Design Philosophy

The app follows Batman's aesthetic with:
- **Dark theme** representing Gotham's night atmosphere
- **Golden accents** inspired by Batman's utility belt and logo
- **Smooth animations** for a cinematic feel
- **Clean typography** for readability
- **Responsive design** for all screen sizes

## 📊 Features Breakdown

### Automatic Day Switching
The app uses two mechanisms to ensure reliable day switching:
1. **Precise midnight timer** - Calculates exact milliseconds until midnight
2. **Backup date checker** - Runs every minute to catch any missed transitions

### Data Architecture
```javascript
// User-specific storage pattern
{
  "username_winterArcHistory": {
    "2025-10-01": {
      "habits": { "wakeup": { "completed": true, "time": "06:00" } },
      "notes": "Great start to Winter Arc!",
      "timestamp": "2025-10-01T18:30:00.000Z"
    }
  }
}
```

### Performance Optimizations
- DOM element caching for faster updates
- Debounced save operations
- Efficient event delegation
- Minimal reflows and repaints

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Built by 🦇 Prakash**

- GitHub: [@PrakashMN](https://github.com/PrakashMN)
- Project: [WinterArc Repository](https://github.com/PrakashMN/WinterArc)

## 🙏 Acknowledgments

- Inspired by the Winter Arc self-improvement movement
- Batman theme inspired by DC Comics
- Thanks to the open-source community for inspiration

## 📞 Support

If you find any bugs or have feature requests, please create an issue on GitHub or reach out!

---

**"The night is darkest just before the dawn. And I promise you, the dawn is coming."** 🦇

*Start your Winter Arc journey today and become the hero of your own story!*

## 🎯 Winter Arc Timeline

- **Start Date**: October 1, 2025 (Day 1)
- **Current**: October 2, 2025 (Day 2)
- **End Date**: December 29, 2025 (Day 90)

**May your habits be strong and your discipline unbreakable!** 💪⚡