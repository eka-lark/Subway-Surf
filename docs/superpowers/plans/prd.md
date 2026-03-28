---

# 📄 PRODUCT REQUIREMENT DOCUMENT (PRD)

## 🎮 Project: Endless Runner Game (Subway Surfers Inspired)

---

# 1. 🧭 Product Overview

## 1.1 Objective

Ek **fast-paced endless runner mobile game** banana jisme player:

* Continuously run kare
* Obstacles dodge kare
* Coins collect kare
* High score achieve kare

## 1.2 Target Platform

* Android (priority)
* iOS (secondary)
* Future: Web (optional)

## 1.3 Target Audience

* Age: 10–35
* Casual gamers
* Low attention span users (quick sessions)

---

# 2. 🎯 Core Gameplay Mechanics

## 2.1 Game Loop

![Image](https://miro.medium.com/1%2APUtL3xN47-LXGig6C04Lsw.gif)

![Image](https://static.wixstatic.com/media/0ad64b_98e50d32ae564f7fbcc953a81755f8da~mv2.png/v1/fill/w_980%2Ch_1470%2Cal_c%2Cq_90%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/0ad64b_98e50d32ae564f7fbcc953a81755f8da~mv2.png)

![Image](https://miro.medium.com/v2/resize%3Afit%3A1400/1%2AZAwsBIeqwgpBJrt-YDilpQ.png)

![Image](https://image.slidesharecdn.com/endlessrunnertpptgroup02-210325073924/85/Endless-runner-5-320.jpg)

**Loop:**

1. Start run
2. Collect coins
3. Avoid obstacles
4. Speed increases
5. Player crashes
6. Show score + rewards
7. Restart

---

## 2.2 Player Controls

* Swipe Left → Move lane left
* Swipe Right → Move lane right
* Swipe Up → Jump
* Swipe Down → Slide

👉 Optional:

* Double tap → Activate hoverboard

---

## 2.3 Movement System

* 3-lane system (Left, Center, Right)
* Forward movement automatic
* Speed gradually increases over time

---

## 2.4 Obstacles

Types:

* Static (barriers)
* Dynamic (moving trains)
* Low obstacles (require jump)
* High obstacles (require slide)

Collision:

* Direct hit = Game Over
* With hoverboard = board breaks, player safe

---

# 3. 💰 Economy System

## 3.1 Coins

* Collectable during run
* Usage:

  * Character unlock
  * Power-up upgrades
  * Cosmetic items

## 3.2 Keys

* Rare currency
* Usage:

  * Revive after crash
  * Unlock premium items

## 3.3 Monetization

* In-app purchases:

  * Coins packs
  * Keys packs
* Ads:

  * Rewarded ads (revive / double coins)
  * Interstitial ads (optional)

---

# 4. 🚀 Power-Up System

## 4.1 Types

| Power-up       | Function                |
| -------------- | ----------------------- |
| Jetpack        | Fly + auto coin collect |
| Magnet         | Attract coins           |
| Super Sneakers | High jump               |
| 2x Multiplier  | Double score            |
| Hoverboard     | Temporary shield        |

## 4.2 Upgrade System

* Duration increase
* Effect strength increase

---

# 5. 👤 Characters & Customization

## 5.1 Characters

* Default character
* Unlockable characters (coins / events)

## 5.2 Skins

* Visual customization only
* No gameplay advantage

---

# 6. 🌍 World / Level Design

## 6.1 World Tour System

![Image](https://img.itch.zone/aW1nLzExNjUxMDQ5LnBuZw%3D%3D/original/jT9waV.png)

![Image](https://www.gamespot.com/a/uploads/original/1755/17559665/4008778-subwaysurferstag_keyart.jpg)

![Image](https://images.squarespace-cdn.com/content/v1/5c6dfa0ed74562c46b235264/1556265650314-HOMLWF74HOPYSGPCS5BH/image-asset.jpeg)

![Image](https://img-c.udemycdn.com/course/480x270/5209138_424b_2.jpg)

* Theme changes every update
* Example:

  * India (Holi theme)
  * Japan (Tokyo neon)
  * France (Paris)

## 6.2 Procedural Generation

* Tracks dynamically generate hote hain
* No fixed level

---

# 7. 📊 Scoring System

* Distance traveled
* Coins collected
* Multiplier applied

Formula:

```
Score = Distance × Multiplier
```

---

# 8. 🎯 Missions & Challenges

## 8.1 Daily Missions

* Collect 500 coins
* Jump 50 times

## 8.2 Achievements

* Run 10,000 meters
* Unlock 5 characters

Rewards:

* Coins
* Keys

---

# 9. 🎵 Audio & Visuals

## 9.1 Graphics

* Stylized cartoon
* Bright colors
* Smooth animations

## 9.2 Sound

* Background music
* Coin collection sound
* Crash sound

---

# 10. 🧠 Game Progression

* Speed increases over time
* Difficulty scaling
* New obstacles unlocked gradually

---

# 11. 🔧 Technical Requirements

## 11.1 Game Engine

* Unity (recommended)
* Alternative: Unreal Engine

## 11.2 Backend (Optional)

* Leaderboards
* Cloud save

Tech stack:

* Node.js backend
* Firebase / Supabase

---

# 12. 📡 Multiplayer / Social (Optional)

* Global leaderboard
* Friend leaderboard
* Score sharing

---

# 13. 📱 UI/UX Screens

## Screens list

* Splash screen
* Main menu
* Gameplay screen
* Pause screen
* Game over screen
* Shop screen
* Missions screen

---

# 14. 🔐 Analytics & Tracking

Track:

* Session time
* Retention
* Crash point
* Ad engagement

Tools:

* Firebase Analytics

---

# 15. 🧪 Testing Strategy

* Unit testing
* Device testing (low-end phones)
* Performance testing

---

# 16. 🚀 MVP Scope (First Version)

Include:

* Basic running
* 3 obstacles
* 2 power-ups
* Coin system
* Game over screen

Exclude:

* Multiplayer
* Advanced skins

---

# 17. 📈 Future Enhancements

* PvP mode
* Story mode
* Events system
* Battle pass

---

# 🔥 Final Summary

Aapka game structure:

* Simple controls
* Infinite gameplay
* Reward system
* Addictive loop

---
