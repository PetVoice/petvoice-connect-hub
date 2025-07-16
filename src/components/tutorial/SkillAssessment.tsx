import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Award, 
  Brain, 
  Target,
  RotateCcw,
  Share2,
  Download,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  Star
} from 'lucide-react';

interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'scenario';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  points: number;
}

interface AssessmentResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  categoryScores: Record<string, { correct: number; total: number }>;
  recommendations: string[];
  skillLevel: string;
  badgeEarned?: string;
}

interface SkillAssessmentProps {
  assessmentId: string;
  title: string;
  description: string;
  questions: Question[];
  timeLimit?: number; // in minutes
  passingScore?: number; // percentage
  onComplete?: (result: AssessmentResult) => void;
}

export const SkillAssessment: React.FC<SkillAssessmentProps> = ({
  assessmentId,
  title,
  description,
  questions,
  timeLimit = 30,
  passingScore = 70,
  onComplete
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60); // in seconds
  const [isStarted, setIsStarted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  // Timer effect (simplified)
  React.useEffect(() => {
    if (isStarted && !showResult && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && !showResult) {
      handleFinishAssessment();
    }
  }, [isStarted, showResult, timeRemaining]);

  const handleStart = () => {
    setIsStarted(true);
    setCurrentQuestion(0);
    setAnswers({});
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeRemaining(timeLimit * 60);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer !== null) {
      setAnswers(prev => ({ ...prev, [currentQuestion]: selectedAnswer }));
      setSelectedAnswer(null);
      setShowExplanation(false);
      
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        handleFinishAssessment();
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setSelectedAnswer(answers[currentQuestion - 1] ?? null);
      setCurrentQuestion(currentQuestion - 1);
      setShowExplanation(false);
    }
  };

  const handleFinishAssessment = () => {
    // Calculate results
    let correctAnswers = 0;
    const categoryScores: Record<string, { correct: number; total: number }> = {};
    
    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) correctAnswers++;
      
      if (!categoryScores[question.category]) {
        categoryScores[question.category] = { correct: 0, total: 0 };
      }
      categoryScores[question.category].total++;
      if (isCorrect) categoryScores[question.category].correct++;
    });

    const score = Math.round((correctAnswers / questions.length) * 100);
    const timeSpent = (timeLimit * 60) - timeRemaining;
    
    // Determine skill level
    let skillLevel = 'Beginner';
    if (score >= 90) skillLevel = 'Expert';
    else if (score >= 80) skillLevel = 'Advanced';
    else if (score >= 70) skillLevel = 'Intermediate';

    // Generate recommendations
    const recommendations = [];
    Object.entries(categoryScores).forEach(([category, scores]) => {
      const percentage = (scores.correct / scores.total) * 100;
      if (percentage < 70) {
        recommendations.push(`Focus on improving your ${category} skills`);
      }
    });

    const assessmentResult: AssessmentResult = {
      score,
      totalQuestions: questions.length,
      correctAnswers,
      timeSpent,
      categoryScores,
      recommendations,
      skillLevel,
      badgeEarned: score >= passingScore ? `${title} Certificate` : undefined
    };

    setResult(assessmentResult);
    setShowResult(true);
    onComplete?.(assessmentResult);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (!isStarted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">{title}</CardTitle>
            <p className="text-muted-foreground">{description}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 border rounded-lg">
                <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="font-medium">{timeLimit} Minutes</p>
                <p className="text-sm text-muted-foreground">Time Limit</p>
              </div>
              <div className="p-4 border rounded-lg">
                <Target className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="font-medium">{questions.length} Questions</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
              <div className="p-4 border rounded-lg">
                <Award className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="font-medium">{passingScore}%</p>
                <p className="text-sm text-muted-foreground">Passing Score</p>
              </div>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Assessment Tips
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Read each question carefully before selecting an answer</li>
                <li>• You can navigate between questions using Previous/Next buttons</li>
                <li>• Your progress will be saved automatically</li>
                <li>• Review your answers before submitting</li>
              </ul>
            </div>
            
            <Button onClick={handleStart} className="w-full" size="lg">
              Start Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResult && result) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
              result.score >= passingScore ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {result.score >= passingScore ? (
                <CheckCircle className="h-10 w-10 text-green-600" />
              ) : (
                <XCircle className="h-10 w-10 text-red-600" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {result.score >= passingScore ? 'Congratulations!' : 'Assessment Complete'}
            </CardTitle>
            <p className="text-muted-foreground">
              {result.score >= passingScore 
                ? 'You passed the assessment!' 
                : 'Keep learning and try again!'
              }
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold text-primary">{result.score}%</div>
                <p className="text-sm text-muted-foreground">Score</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold">{result.correctAnswers}/{result.totalQuestions}</div>
                <p className="text-sm text-muted-foreground">Correct</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold">{formatTime(result.timeSpent)}</div>
                <p className="text-sm text-muted-foreground">Time Used</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Badge className="text-lg px-3 py-1">{result.skillLevel}</Badge>
                <p className="text-sm text-muted-foreground mt-1">Skill Level</p>
              </div>
            </div>

            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(result.categoryScores).map(([category, scores]) => {
                    const percentage = Math.round((scores.correct / scores.total) * 100);
                    return (
                      <div key={category}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium">{category}</span>
                          <span>{scores.correct}/{scores.total} ({percentage}%)</span>
                        </div>
                        <Progress value={percentage} />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Badge/Certificate */}
            {result.badgeEarned && (
              <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="p-6 text-center">
                  <Award className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Badge Earned!</h3>
                  <p className="text-muted-foreground mb-4">{result.badgeEarned}</p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download Certificate
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Achievement
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Improvement Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex gap-2 justify-center">
              <Button onClick={handleStart} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake Assessment
              </Button>
              <Button>Continue Learning</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {questions.length}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span className={timeRemaining < 300 ? 'text-red-500 font-medium' : ''}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <Badge>{currentQ.difficulty}</Badge>
            </div>
          </div>
          <Progress value={progress} />
        </CardContent>
      </Card>

      {/* Question */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-xl flex-1">{currentQ.question}</CardTitle>
            <Badge variant="outline">{currentQ.points} pts</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={selectedAnswer?.toString()}
            onValueChange={(value) => handleAnswerSelect(parseInt(value))}
          >
            {currentQ.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {showExplanation && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-medium text-blue-900 mb-2">Explanation</h4>
                <p className="text-sm text-blue-700">{currentQ.explanation}</p>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>

            <div className="flex gap-2">
              {selectedAnswer !== null && (
                <Button
                  variant="outline"
                  onClick={() => setShowExplanation(!showExplanation)}
                >
                  {showExplanation ? 'Hide' : 'Show'} Explanation
                </Button>
              )}

              <Button
                onClick={handleNextQuestion}
                disabled={selectedAnswer === null}
              >
                {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Navigator */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-3">Question Navigator</h3>
          <div className="grid grid-cols-10 gap-2">
            {questions.map((_, index) => (
              <Button
                key={index}
                variant={index === currentQuestion ? 'default' : 'outline'}
                size="sm"
                className={`aspect-square p-0 ${
                  answers[index] !== undefined ? 'bg-green-100 border-green-300' : ''
                }`}
                onClick={() => {
                  setCurrentQuestion(index);
                  setSelectedAnswer(answers[index] ?? null);
                  setShowExplanation(false);
                }}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};