# SpeakUp: Your AI-Powered Debate Coach

**SpeakUp** is a comprehensive debate app designed to help debaters—especially students—improve their logical reasoning and argumentation skills through fun, interactive AI features.
<img width="960" height="480" alt="Cover (1)" src="https://github.com/user-attachments/assets/2b15df2b-2cf2-4d22-b24d-9831dd62ac02" />


## 🎯 Purpose
- It’s hard to get instant feedback from a spectator or judge unless you carry one
around in your backpack. That’s really only possible through debate tournaments.
Well, now you don’t have to go to debate tournaments to get feedback! Use
SpeakUp and be able to get high quality feedback from AI that explains how you can
improve your argument and logical skills through fun games!
- Learn logical skills to use in real life situations, not just in debate. Logical abilities
can be really important in real life.

---
## 🌟 Features

### 🎙️ Voice-Based Argument Evaluation

- Long-press the mic icon to record your argument.
- AI transcribes your voice using **OpenAI's Whisper API**.
- The app summarizes your argument and gives feedback powered by **GPT-4o**.
<img width="250"  alt="Image_2025-09-08_202836_354" src="https://github.com/user-attachments/assets/255363e0-d3fc-4ca8-bb99-a27ff2d4d61f" />
<img width="250"  alt="Image_2025-09-08_202844_384" src="https://github.com/user-attachments/assets/b6cbe132-b188-4caf-9807-f035f8cee326" />
  

### 🎮 Logic Game Mode

- Play a game where GPT generates silly or funny questions.
- Learn how to identify logical flaws and sharpen reasoning skills.
- Each round includes 5 questions with score tracking.
<img width="250"  alt="b3c1c651-8368-4b45-a852-8d14ee376d12" src="https://github.com/user-attachments/assets/7146d157-9cf9-4c43-8241-082c4f9a16e5" />
<img width="250"  alt="efaaa1c7-fd24-45df-8b53-5c7a797b60f0" src="https://github.com/user-attachments/assets/c56019df-79ba-4fc2-b093-6f7cf284b912" />
<img width="250"  alt="a11206e4-1fae-422b-b3fc-7128cb3457d5" src="https://github.com/user-attachments/assets/88d94c59-47e2-4528-a0e9-b8b99136ee32" />



### 📝 Chat-Based Feedback

- Get real-time feedback from AI in a chat format.
- Each message includes a **copy** button and **refresh** option to regenerate AI responses.
<img width="250" alt="Image_2025-09-08_203242_735" src="https://github.com/user-attachments/assets/03d62553-7921-45ef-871e-ffae88d6ac0a" />
<img width="250" alt="Image_2025-09-08_203255_039" src="https://github.com/user-attachments/assets/df4897e5-bca8-4c2a-abe9-ed06ddbe8a7a" />
<img width="250" alt="06fd5226-ed78-4c24-934e-87cbfe140c20" src="https://github.com/user-attachments/assets/55b0ffcc-2413-4425-b175-54d6e04ec60b" />

---

## 🧠 What Makes SpeakUp Different
- Unlike traditional tools that rely on judges or lectures, SpeakUp gives **personalized**, **real-time**, and **interactive** feedback anytime.
- Kids and teens stay engaged with logic games instead of boring text or videos.
- Built-in recording and feedback means **no more incomplete ballots** or long waits for evaluation.

---

## 📈 Results

- Be more prepared for debate tournaments or real-life arguments.
- Build **confidence**, **clarity**, and **persuasiveness**.
- Improve logic **while having fun**!

---

## 🛠️ Tech Stack

| Component       | Technology                    |
| --------------- | ----------------------------- |
| Frontend        | React Native (Expo)           |
| Voice Recording | `expo-av`, `expo-file-system` |
| AI Integration  | OpenAI Whisper API + GPT-3.5 turbo API   |
| Styling         | React Native StyleSheet       |
| Icons           | `react-native-vector-icons`   |

---

## ⚙️ Setup Instructions

1. Install dependencies

   ```bash
   npm install
   ```
2. Set up your OpenAI API key
Create openai_api_key.ts file in the component folder
Put your key in the file:
   ```
   export const OPENAI_API_KEY ='<Your OpenAI API Key>'
   ```

3. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Project Structure

```
.
├── app
│   ├── _layout.tsx
│   ├── (tabs)
│   ├── +not-found.tsx
│   ├── debate.tsx
│   ├── evaluate_new.tsx
│   ├── evaluate.tsx
│   ├── game.tsx
│   └── gameOLD.tsx
├── app.json
├── assets
│   ├── fonts
│   └── images
├── components
│   └── openai.ts
├── eslint.config.js
├── expo-env.d.ts
├── ios
│   ├── debateapppre
│   ├── debateapppre.xcodeproj
│   ├── Podfile
│   └── Podfile.properties.json
├── package-lock.json
├── package.json
├── README.md
└── tsconfig.json
```
