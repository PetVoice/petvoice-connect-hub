import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Circle, 
  ChevronRight, 
  ChevronLeft, 
  Lightbulb, 
  AlertTriangle, 
  Target,
  Eye,
  MousePointer,
  Keyboard
} from 'lucide-react';

interface GuideStep {
  id: string;
  title: string;
  description: string;
  content: string;
  tips?: string[];
  warnings?: string[];
  highlight?: {
    selector: string;
    description: string;
  };
  interaction?: {
    type: 'click' | 'type' | 'hover';
    element: string;
    action: string;
  };
  validation?: {
    type: 'element_exists' | 'text_contains' | 'value_equals';
    target: string;
    expected: string;
  };
}

interface InteractiveGuideProps {
  guideId: string;
  title: string;
  description: string;
  estimatedTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  steps: GuideStep[];
  onComplete?: () => void;
}

export const InteractiveGuide: React.FC<InteractiveGuideProps> = ({
  guideId,
  title,
  description,
  estimatedTime,
  difficulty,
  steps,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isHighlighting, setIsHighlighting] = useState(false);

  const handleStepComplete = (stepIndex: number) => {
    setCompletedSteps(prev => new Set(prev).add(stepIndex));
    if (stepIndex === steps.length - 1) {
      onComplete?.();
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleHighlight = () => {
    setIsHighlighting(true);
    // Simulated highlight - in real implementation, this would highlight actual UI elements
    setTimeout(() => setIsHighlighting(false), 3000);
  };

  const progressPercentage = ((completedSteps.size) / steps.length) * 100;
  const currentStepData = steps[currentStep];

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'click': return <MousePointer className="h-4 w-4" />;
      case 'type': return <Keyboard className="h-4 w-4" />;
      case 'hover': return <Eye className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2">{title}</CardTitle>
              <p className="text-muted-foreground mb-4">{description}</p>
              <div className="flex items-center gap-4 text-sm">
                <Badge className={`${getDifficultyColor(difficulty)} text-white`}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </Badge>
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  {completedSteps.size}/{steps.length} completed
                </span>
                <span>{estimatedTime}</span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} />
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Steps Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  index === currentStep 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => setCurrentStep(index)}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  completedSteps.has(index) 
                    ? 'bg-green-500 text-white' 
                    : index === currentStep
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {completedSteps.has(index) ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <span className="text-xs">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-2">{step.title}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Step {currentStep + 1}: {currentStepData.title}
                </CardTitle>
                <Badge variant="outline">
                  {currentStep + 1} of {steps.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-muted-foreground mb-4">{currentStepData.description}</p>
                <div className="prose prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: currentStepData.content }} />
                </div>
              </div>

              {/* Interaction Instructions */}
              {currentStepData.interaction && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {getInteractionIcon(currentStepData.interaction.type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-900 mb-1">Action Required</h4>
                        <p className="text-sm text-blue-700">{currentStepData.interaction.action}</p>
                        <p className="text-xs text-blue-600 mt-1">
                          Target: {currentStepData.interaction.element}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tips */}
              {currentStepData.tips && currentStepData.tips.length > 0 && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-900 mb-2">Tips</h4>
                        <ul className="space-y-1">
                          {currentStepData.tips.map((tip, index) => (
                            <li key={index} className="text-sm text-green-700">
                              • {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Warnings */}
              {currentStepData.warnings && currentStepData.warnings.length > 0 && (
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-900 mb-2">Important</h4>
                        <ul className="space-y-1">
                          {currentStepData.warnings.map((warning, index) => (
                            <li key={index} className="text-sm text-yellow-700">
                              • {warning}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Highlight Element Button */}
              {currentStepData.highlight && (
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={handleHighlight}
                    disabled={isHighlighting}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    {isHighlighting ? 'Highlighting...' : 'Highlight Element'}
                  </Button>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleStepComplete(currentStep)}
                    disabled={completedSteps.has(currentStep)}
                  >
                    {completedSteps.has(currentStep) ? 'Completed' : 'Mark Complete'}
                  </Button>

                  <Button
                    onClick={handleNext}
                    disabled={currentStep === steps.length - 1}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Summary */}
          {progressPercentage === 100 && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Congratulations! Guide Completed
                </h3>
                <p className="text-green-700 mb-4">
                  You've successfully completed all steps in this interactive guide.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button>Continue Learning</Button>
                  <Button variant="outline">Share Achievement</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};