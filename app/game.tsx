import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { OPENAI_API_KEY } from '../components/openai_api_key';

interface Question {
  argument: string;
  options: string[];
  answer: string;
}

export default function GameScreen() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(false);

  const [gameStarted, setGameStarted] = useState(false);
  // add logic for scores
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const generateFunnyQuestion = async () => {
    const prompt = `
Generate a logic fallacy quiz question in JSON format. Make it funny and suitable for teens. Include:
- "argument": a humorous statement with a fallacy,
- "options": 3 multiple-choice fallacy names,
- "answer": the correct option.
Return only JSON like this:
{
  "argument": "...",
  "options": ["...", "...", "..."],
  "answer": "..."
}
`;

    try {
      setLoading(true);
      setShowAnswer(false);
      setSelected('');

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.9,
        }),
      });

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content;
      const parsed = JSON.parse(reply);
      setQuestion(parsed);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to get question. Try again.');
      console.error('Error parsing GPT response:', err.message);
    } finally {
      setLoading(false);
    }
  };

  //handle start game
  const handleStartGame = async () => {
    setGameStarted(true);
    setScore(0);
    setQuestionCount(0);
    setGameOver(false);
    await generateFunnyQuestion();
  };

  const handleSelect = (option: string) => {
    if (showAnswer || !question) return;

    setSelected(option);
    setShowAnswer(true);
    if (option === question.answer) {
      setScore((prev) => prev + 1);
    }
  };

  // generate new questions and count
  const handleNext = async () => {
    if (questionCount + 1 === 5) {
      setGameOver(true);
    } else {
      setQuestionCount((prev) => prev + 1);
      await generateFunnyQuestion();
    }
    setSelected('');
    setShowAnswer(false);
  };

  // restart game
  const handleRestart = async () => {
    setGameStarted(false); // restart whith button
    setScore(0);
    setQuestionCount(0);
    setGameOver(false);
    await generateFunnyQuestion();
  };

  useEffect(() => {
    generateFunnyQuestion();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🧠 Funny Logic Fallacy Game</Text>

      
      {!gameStarted && (
        <TouchableOpacity onPress={handleStartGame} style={styles.button}>
          <Text style={styles.buttonText}>
            Start Game
          </Text>
        </TouchableOpacity>
      )}

      {gameStarted && loading && <ActivityIndicator size="large" color="#333" style={{ marginVertical: 20 }} />}

      {gameOver ? (
        <View>
          <Text style={styles.feedback}>🎉 Final Score: {score} / 5</Text>
          <TouchableOpacity style={styles.button} onPress={handleRestart}>
            <Text style={styles.buttonText}>🔁 Play Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        gameStarted &&
        question &&
        !loading && (
          <View style={styles.questionBox}>
            <Text style={styles.counter}>Question {questionCount + 1} of 5</Text>
            <Text style={styles.argument}>{question.argument}</Text>

            {question.options.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.option,
                  showAnswer && opt === selected
                    ? opt === question.answer
                      ? styles.correct
                      : styles.incorrect
                    : null,
                ]}
                onPress={() => handleSelect(opt)}
              >
                <Text style={styles.optionText}>{opt}</Text>
              </TouchableOpacity>
            ))}

            {showAnswer && (
              <>
                <Text style={styles.feedback}>
                  {selected === question.answer
                    ? '✅ Correct!'
                    : `❌ Incorrect. Answer: ${question.answer}`}
                </Text>
                <TouchableOpacity style={styles.button} onPress={handleNext}>
                  <Text style={styles.buttonText}>
                    {questionCount + 1 === 5 ? 'See Score' : 'Next Question'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fffefc',
    minHeight: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  counter: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#ffd33d',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontWeight: '700',
    fontSize: 16,
  },
  questionBox: {
    marginTop: 10,
  },
  argument: {
    fontSize: 18,
    marginBottom: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  option: {
    backgroundColor: '#f2f2f2',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  optionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  correct: {
    backgroundColor: '#c8f7c5',
  },
  incorrect: {
    backgroundColor: '#f7c5c5',
  },
  feedback: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
});