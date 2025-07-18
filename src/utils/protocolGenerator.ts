import { 
  TrainingProtocol, 
  PersonalizationFactor, 
  TrainingPhase, 
  DailyActivity,
  SuccessCriteria,
  AdaptiveTrigger 
} from '@/types/training';

interface ProtocolGenerationData {
  petData: any;
  behavioralIssues: string[];
  trainingGoals: string[];
  ownerExperience: 'beginner' | 'intermediate' | 'advanced';
  availableTimePerDay: number; // minutes
  environment: 'indoor' | 'outdoor' | 'both';
  previousTrainingHistory?: any[];
  currentBehaviors?: string[];
}

export function generatePersonalizedProtocol(data: ProtocolGenerationData): TrainingProtocol {
  const personalizationFactors = analyzePersonalizationFactors(data);
  const protocolType = determineProtocolType(data.behavioralIssues, data.trainingGoals);
  const difficulty = calculateDifficulty(data.ownerExperience, data.petData);
  
  const baseProtocol = generateBaseProtocol(protocolType, difficulty);
  const personalizedPhases = baseProtocol.phases || [];
  
  return {
    id: generateId(),
    name: generateProtocolName(data.trainingGoals, data.petData.name),
    description: generateProtocolDescription(data),
    type: protocolType,
    duration_days: calculateOptimalDuration(data, personalizationFactors),
    difficulty,
    target_behaviors: data.trainingGoals,
    issue_addressed: data.behavioralIssues,
    created_at: new Date().toISOString(),
    
    phases: personalizedPhases,
    daily_sessions: calculateOptimalSessions(data.availableTimePerDay),
    session_duration: calculateSessionDuration(data.availableTimePerDay, difficulty),
    
    ai_generated: true,
    confidence_score: calculateConfidenceScore(personalizationFactors),
    personalization_factors: personalizationFactors,
    
    success_criteria: generateSuccessCriteria(data.trainingGoals, protocolType),
    expected_outcomes: generateExpectedOutcomes(data.trainingGoals, data.behavioralIssues),
    
    adaptive_triggers: generateAdaptiveTriggers(difficulty, protocolType),
    
    required_equipment: determineRequiredEquipment(protocolType, data.environment),
    difficulty_modifiers: generateDifficultyModifiers(data.petData, data.ownerExperience)
  };
}

function analyzePersonalizationFactors(data: ProtocolGenerationData): PersonalizationFactor[] {
  const factors: PersonalizationFactor[] = [];
  
  // Pet age factor
  factors.push({
    factor_type: 'pet_age',
    factor_value: data.petData.age ? `${data.petData.age} years` : 'unknown',
    weight: 0.8,
    reasoning: data.petData.age < 1 ? 'Puppy/kitten - requires gentler, shorter sessions' :
               data.petData.age > 7 ? 'Senior pet - may need modified physical activities' :
               'Adult pet - standard protocol appropriate'
  });
  
  // Breed characteristics
  if (data.petData.breed) {
    factors.push({
      factor_type: 'breed_characteristics',
      factor_value: data.petData.breed,
      weight: 0.7,
      reasoning: getBreedCharacteristics(data.petData.breed, data.petData.type)
    });
  }
  
  // Current behavior assessment
  if (data.currentBehaviors && data.currentBehaviors.length > 0) {
    factors.push({
      factor_type: 'current_behavior',
      factor_value: data.currentBehaviors.join(', '),
      weight: 0.9,
      reasoning: 'Current behavioral patterns will influence training approach and timeline'
    });
  }
  
  // Learning style (inferred from behavioral issues and goals)
  const learningStyle = inferLearningStyle(data.behavioralIssues, data.trainingGoals);
  factors.push({
    factor_type: 'learning_style',
    factor_value: learningStyle,
    weight: 0.8,
    reasoning: 'Personalized approach based on inferred learning preferences'
  });
  
  // Environment factor
  factors.push({
    factor_type: 'environment',
    factor_value: data.environment,
    weight: 0.6,
    reasoning: data.environment === 'indoor' ? 'Indoor training focus with space-appropriate activities' :
               data.environment === 'outdoor' ? 'Outdoor training emphasis with environmental distractions' :
               'Balanced indoor/outdoor training approach'
  });
  
  // Owner experience
  factors.push({
    factor_type: 'owner_experience',
    factor_value: data.ownerExperience,
    weight: 0.7,
    reasoning: data.ownerExperience === 'beginner' ? 'Simplified instructions with extra guidance needed' :
               data.ownerExperience === 'advanced' ? 'Can handle complex techniques and faster progression' :
               'Standard instruction level appropriate'
  });
  
  return factors;
}

function determineProtocolType(issues: string[], goals: string[]): TrainingProtocol['type'] {
  const behavioralKeywords = ['aggression', 'anxiety', 'fear', 'destructive', 'separation', 'reactivity'];
  const basicKeywords = ['sit', 'stay', 'come', 'heel', 'potty', 'house'];
  const advancedKeywords = ['tricks', 'agility', 'competition', 'advanced', 'complex'];
  const problemKeywords = ['problem', 'issue', 'unwanted', 'problematic', 'correction'];
  
  const allText = [...issues, ...goals].join(' ').toLowerCase();
  
  if (behavioralKeywords.some(keyword => allText.includes(keyword))) {
    return 'behavioral_modification';
  } else if (advancedKeywords.some(keyword => allText.includes(keyword))) {
    return 'advanced_skills';
  } else if (problemKeywords.some(keyword => allText.includes(keyword))) {
    return 'problem_solving';
  } else {
    return 'basic_training';
  }
}

function calculateDifficulty(ownerExperience: string, petData: any): TrainingProtocol['difficulty'] {
  let difficultyScore = 0;
  
  // Owner experience factor
  if (ownerExperience === 'beginner') difficultyScore += 0;
  else if (ownerExperience === 'intermediate') difficultyScore += 1;
  else difficultyScore += 2;
  
  // Pet age factor
  if (petData.age) {
    if (petData.age < 1) difficultyScore += 0; // Puppies are easier to train
    else if (petData.age > 7) difficultyScore += 1; // Seniors may need patience
    else difficultyScore += 0.5;
  }
  
  if (difficultyScore <= 1) return 'beginner';
  else if (difficultyScore <= 2) return 'intermediate';
  else return 'advanced';
}

function generateBaseProtocol(type: TrainingProtocol['type'], difficulty: TrainingProtocol['difficulty']): Partial<TrainingProtocol> {
  const baseProtocols = {
    'behavioral_modification': {
      phases: generateBehavioralModificationPhases(difficulty),
      duration: 21
    },
    'basic_training': {
      phases: generateBasicTrainingPhases(difficulty),
      duration: 14
    },
    'advanced_skills': {
      phases: generateAdvancedSkillsPhases(difficulty),
      duration: 28
    },
    'problem_solving': {
      phases: generateProblemSolvingPhases(difficulty),
      duration: 21
    }
  };
  
  return baseProtocols[type];
}

function generateBehavioralModificationPhases(difficulty: TrainingProtocol['difficulty']): TrainingPhase[] {
  const phases: TrainingPhase[] = [
    {
      id: 'phase-1-foundation',
      name: 'Foundation & Assessment',
      description: 'Establish baseline behavior and build trust',
      phase_number: 1,
      duration_days: 7,
      daily_activities: [
        {
          id: 'activity-observation',
          name: 'Behavioral Observation',
          description: 'Document current behavioral patterns',
          instructions: [
            'Observe and record behavioral incidents',
            'Note triggers and environmental factors',
            'Track frequency and intensity',
            'Identify patterns in timing and context'
          ],
          duration_minutes: 15,
          difficulty_level: difficulty === 'beginner' ? 2 : difficulty === 'intermediate' ? 3 : 4,
          prerequisite_skills: [],
          measurable_outcomes: [
            {
              metric: 'Incidents documented',
              target_value: difficulty === 'beginner' ? 3 : 5,
              unit: 'per day',
              measurement_method: 'Manual logging',
              frequency: 'daily'
            }
          ],
          required_equipment: ['Notebook', 'Timer'],
          video_demonstrations: [
            {
              title: 'How to Document Behavior',
              url: '/videos/behavior-documentation.mp4',
              duration_seconds: 180,
              description: 'Learn effective behavior documentation techniques',
              key_points: ['What to observe', 'How to record', 'Pattern recognition']
            }
          ],
          success_tips: [
            'Be consistent with observation times',
            'Focus on facts, not interpretations',
            'Include environmental context'
          ],
          common_mistakes: [
            'Interpreting behavior instead of describing',
            'Inconsistent observation schedule',
            'Missing environmental triggers'
          ],
          troubleshooting: [
            {
              issue: 'Behavior seems random',
              solution: 'Extend observation period and look for subtle patterns',
              prevention: 'Record more environmental details',
              when_to_seek_help: 'If no patterns emerge after 10 days'
            }
          ]
        },
        {
          id: 'activity-trust-building',
          name: 'Trust Building Exercises',
          description: 'Establish positive relationship foundation',
          instructions: [
            'Practice calm, positive interactions',
            'Use high-value treats for positive associations',
            'Respect pet\'s space and comfort levels',
            'Focus on voluntary engagement'
          ],
          duration_minutes: 20,
          difficulty_level: difficulty === 'beginner' ? 1 : 2,
          prerequisite_skills: [],
          measurable_outcomes: [
            {
              metric: 'Voluntary approach frequency',
              target_value: 5,
              unit: 'times per session',
              measurement_method: 'Count interactions',
              frequency: 'daily'
            }
          ],
          required_equipment: ['High-value treats', 'Comfortable space'],
          video_demonstrations: [],
          success_tips: [
            'Let the pet set the pace',
            'Use calm, gentle voice tones',
            'Reward small positive steps'
          ],
          common_mistakes: [
            'Forcing interactions',
            'Moving too quickly',
            'Using punishment or corrections'
          ],
          troubleshooting: [
            {
              issue: 'Pet avoids interaction',
              solution: 'Increase distance and use higher value rewards',
              prevention: 'Start with the pet\'s preferred interaction style',
              when_to_seek_help: 'If avoidance persists beyond one week'
            }
          ]
        }
      ],
      completion_criteria: [
        {
          criteria_name: 'Baseline Documentation Complete',
          measurement_method: 'Review of behavior logs',
          pass_threshold: 80,
          consecutive_days_required: 7
        },
        {
          criteria_name: 'Trust Indicators Present',
          measurement_method: 'Voluntary approach behavior',
          pass_threshold: 70,
          consecutive_days_required: 3
        }
      ],
      progression_rules: [
        {
          condition: 'All completion criteria met',
          action: 'advance_phase',
          parameters: {}
        },
        {
          condition: 'Trust building below 50% for 5 days',
          action: 'modify_approach',
          parameters: { focus: 'slower_pace', additional_time: 3 }
        }
      ]
    },
    {
      id: 'phase-2-intervention',
      name: 'Active Intervention',
      description: 'Implement behavior modification techniques',
      phase_number: 2,
      duration_days: 10,
      daily_activities: [
        {
          id: 'activity-counter-conditioning',
          name: 'Counter-Conditioning Exercises',
          description: 'Change emotional response to triggers',
          instructions: [
            'Identify primary triggers from observation phase',
            'Present triggers at sub-threshold levels',
            'Pair with highly positive experiences',
            'Gradually increase trigger intensity'
          ],
          duration_minutes: 25,
          difficulty_level: difficulty === 'beginner' ? 4 : difficulty === 'intermediate' ? 5 : 6,
          prerequisite_skills: ['Trust building completed'],
          measurable_outcomes: [
            {
              metric: 'Positive responses to triggers',
              target_value: 70,
              unit: 'percentage',
              measurement_method: 'Success rate tracking',
              frequency: 'daily'
            }
          ],
          required_equipment: ['Trigger stimuli', 'High-value rewards', 'Timer'],
          video_demonstrations: [
            {
              title: 'Counter-Conditioning Techniques',
              url: '/videos/counter-conditioning.mp4',
              duration_seconds: 300,
              description: 'Step-by-step counter-conditioning protocol',
              key_points: ['Threshold management', 'Timing', 'Reward delivery']
            }
          ],
          success_tips: [
            'Keep sessions below stress threshold',
            'End on positive note',
            'Consistency is crucial'
          ],
          common_mistakes: [
            'Starting with triggers too intense',
            'Poor timing of rewards',
            'Sessions too long'
          ],
          troubleshooting: [
            {
              issue: 'Pet becomes stressed during session',
              solution: 'Reduce trigger intensity and shorten sessions',
              prevention: 'Better threshold management',
              when_to_seek_help: 'If stress persists despite modifications'
            }
          ]
        }
      ],
      completion_criteria: [
        {
          criteria_name: 'Trigger Response Improvement',
          measurement_method: 'Behavioral response assessment',
          pass_threshold: 60,
          consecutive_days_required: 5
        }
      ],
      progression_rules: [
        {
          condition: 'Improvement rate above 10% per week',
          action: 'advance_phase',
          parameters: {}
        }
      ]
    },
    {
      id: 'phase-3-consolidation',
      name: 'Consolidation & Maintenance',
      description: 'Solidify new behaviors and prevent regression',
      phase_number: 3,
      duration_days: 4,
      daily_activities: [
        {
          id: 'activity-generalization',
          name: 'Behavior Generalization',
          description: 'Practice new behaviors in various contexts',
          instructions: [
            'Practice in different locations',
            'Vary environmental conditions',
            'Include different family members',
            'Test in mildly challenging situations'
          ],
          duration_minutes: 30,
          difficulty_level: difficulty === 'beginner' ? 3 : difficulty === 'intermediate' ? 4 : 5,
          prerequisite_skills: ['Counter-conditioning success'],
          measurable_outcomes: [
            {
              metric: 'Successful generalization',
              target_value: 80,
              unit: 'percentage',
              measurement_method: 'Context variation testing',
              frequency: 'daily'
            }
          ],
          required_equipment: ['Portable rewards', 'Various environments'],
          video_demonstrations: [],
          success_tips: [
            'Start with small environmental changes',
            'Maintain consistent reward schedule',
            'Be patient with setbacks'
          ],
          common_mistakes: [
            'Changing too many variables at once',
            'Skipping intermediate steps',
            'Inconsistent criteria'
          ],
          troubleshooting: [
            {
              issue: 'Behavior doesn\'t transfer to new contexts',
              solution: 'Reduce environmental changes and add more practice steps',
              prevention: 'Slower, more systematic generalization',
              when_to_seek_help: 'If no transfer after multiple contexts attempted'
            }
          ]
        }
      ],
      completion_criteria: [
        {
          criteria_name: 'Generalization Success',
          measurement_method: 'Multi-context performance',
          pass_threshold: 75,
          consecutive_days_required: 3
        }
      ],
      progression_rules: [
        {
          condition: 'Generalization criteria met',
          action: 'advance_phase',
          parameters: {}
        }
      ]
    }
  ];
  
  return phases;
}

function generateBasicTrainingPhases(difficulty: TrainingProtocol['difficulty']): TrainingPhase[] {
  // Similar structure but focused on basic obedience commands
  return [
    {
      id: 'phase-1-foundation-basic',
      name: 'Foundation Commands',
      description: 'Establish basic communication and commands',
      phase_number: 1,
      duration_days: 7,
      daily_activities: [
        {
          id: 'activity-attention',
          name: 'Attention Training',
          description: 'Teach focus and attention commands',
          instructions: [
            'Use name to get attention',
            'Reward eye contact immediately',
            'Practice in quiet environment first',
            'Gradually add mild distractions'
          ],
          duration_minutes: 15,
          difficulty_level: difficulty === 'beginner' ? 1 : 2,
          prerequisite_skills: [],
          measurable_outcomes: [
            {
              metric: 'Eye contact duration',
              target_value: 3,
              unit: 'seconds',
              measurement_method: 'Timed observation',
              frequency: 'daily'
            }
          ],
          required_equipment: ['Treats', 'Quiet space'],
          video_demonstrations: [
            {
              title: 'Teaching Name Recognition',
              url: '/videos/name-attention.mp4',
              duration_seconds: 240,
              description: 'Build strong name response and attention',
              key_points: ['Timing', 'Reward placement', 'Distraction management']
            }
          ],
          success_tips: [
            'Use happy, encouraging tone',
            'Keep sessions short and positive',
            'Practice throughout the day'
          ],
          common_mistakes: [
            'Repeating name multiple times',
            'Delayed reward timing',
            'Practicing only during training time'
          ],
          troubleshooting: [
            {
              issue: 'Pet doesn\'t respond to name',
              solution: 'Use higher value treats and quieter environment',
              prevention: 'Ensure name has positive associations only',
              when_to_seek_help: 'If no improvement after one week of consistent practice'
            }
          ]
        }
      ],
      completion_criteria: [
        {
          criteria_name: 'Reliable Name Response',
          measurement_method: 'Success rate tracking',
          pass_threshold: 80,
          consecutive_days_required: 3
        }
      ],
      progression_rules: [
        {
          condition: 'Name response criteria met',
          action: 'advance_phase',
          parameters: {}
        }
      ]
    }
  ];
}

function generateAdvancedSkillsPhases(difficulty: TrainingProtocol['difficulty']): TrainingPhase[] {
  // Advanced skills like complex tricks, agility prep, etc.
  return [
    {
      id: 'phase-1-advanced-foundation',
      name: 'Advanced Foundation',
      description: 'Build precise control and complex movement patterns',
      phase_number: 1,
      duration_days: 10,
      daily_activities: [
        {
          id: 'activity-precision-positioning',
          name: 'Precision Positioning',
          description: 'Teach exact positioning and body awareness',
          instructions: [
            'Use target training for precise positioning',
            'Shape exact body positions gradually',
            'Add duration to positions',
            'Practice position changes on cue'
          ],
          duration_minutes: 25,
          difficulty_level: difficulty === 'beginner' ? 5 : difficulty === 'intermediate' ? 6 : 7,
          prerequisite_skills: ['Basic obedience', 'Attention training'],
          measurable_outcomes: [
            {
              metric: 'Position accuracy',
              target_value: 90,
              unit: 'percentage',
              measurement_method: 'Visual assessment',
              frequency: 'daily'
            }
          ],
          required_equipment: ['Target stick', 'Platform', 'High-value treats'],
          video_demonstrations: [
            {
              title: 'Advanced Positioning Techniques',
              url: '/videos/precision-positioning.mp4',
              duration_seconds: 420,
              description: 'Master precise positioning for advanced skills',
              key_points: ['Shaping process', 'Criteria raising', 'Fluency building']
            }
          ],
          success_tips: [
            'Break complex positions into small steps',
            'Use clear criteria for each step',
            'Build duration gradually'
          ],
          common_mistakes: [
            'Rushing through shaping steps',
            'Unclear criteria',
            'Too much duration too quickly'
          ],
          troubleshooting: [
            {
              issue: 'Pet seems confused about criteria',
              solution: 'Simplify criteria and return to previous successful step',
              prevention: 'Smaller shaping increments',
              when_to_seek_help: 'If confusion persists despite simplification'
            }
          ]
        }
      ],
      completion_criteria: [
        {
          criteria_name: 'Positioning Precision',
          measurement_method: 'Accuracy assessment',
          pass_threshold: 85,
          consecutive_days_required: 5
        }
      ],
      progression_rules: [
        {
          condition: 'Precision criteria met',
          action: 'advance_phase',
          parameters: {}
        }
      ]
    }
  ];
}

function generateProblemSolvingPhases(difficulty: TrainingProtocol['difficulty']): TrainingPhase[] {
  // Problem-specific intervention phases
  return [
    {
      id: 'phase-1-problem-analysis',
      name: 'Problem Analysis & Management',
      description: 'Understand and manage the specific problem behavior',
      phase_number: 1,
      duration_days: 7,
      daily_activities: [
        {
          id: 'activity-management-setup',
          name: 'Environmental Management',
          description: 'Set up environment to prevent problem behavior',
          instructions: [
            'Identify and eliminate triggers when possible',
            'Create physical barriers to prevent rehearsal',
            'Establish clear management protocols',
            'Train family members on management techniques'
          ],
          duration_minutes: 20,
          difficulty_level: difficulty === 'beginner' ? 2 : 3,
          prerequisite_skills: [],
          measurable_outcomes: [
            {
              metric: 'Problem incidents prevented',
              target_value: 80,
              unit: 'percentage',
              measurement_method: 'Incident tracking',
              frequency: 'daily'
            }
          ],
          required_equipment: ['Management tools', 'Barriers', 'Alternative outlets'],
          video_demonstrations: [
            {
              title: 'Environmental Management Strategies',
              url: '/videos/environmental-management.mp4',
              duration_seconds: 360,
              description: 'Effective prevention and management techniques',
              key_points: ['Trigger identification', 'Physical management', 'Family coordination']
            }
          ],
          success_tips: [
            'Consistency across all family members is crucial',
            'Prevention is easier than correction',
            'Provide appropriate outlets for natural behaviors'
          ],
          common_mistakes: [
            'Inconsistent application of management',
            'Focusing only on stopping behavior without providing alternatives',
            'Waiting for problems to occur instead of preventing them'
          ],
          troubleshooting: [
            {
              issue: 'Management strategies being ignored by family',
              solution: 'Simplify protocols and provide clear written instructions',
              prevention: 'Involve all family members in training plan development',
              when_to_seek_help: 'If family compliance remains below 70% after support'
            }
          ]
        }
      ],
      completion_criteria: [
        {
          criteria_name: 'Effective Management',
          measurement_method: 'Incident reduction tracking',
          pass_threshold: 70,
          consecutive_days_required: 5
        }
      ],
      progression_rules: [
        {
          condition: 'Management effectiveness achieved',
          action: 'advance_phase',
          parameters: {}
        }
      ]
    }
  ];
}

function generateSuccessCriteria(goals: string[], protocolType: TrainingProtocol['type']): SuccessCriteria[] {
  const criteria: SuccessCriteria[] = [];
  
  // Base criteria for all protocols
  criteria.push({
    criteria_name: 'Consistency',
    metric_type: 'consistency',
    target_value: 80,
    unit: 'percentage',
    measurement_window: 7,
    pass_threshold: 75
  });
  
  criteria.push({
    criteria_name: 'Engagement Level',
    metric_type: 'behavioral_frequency',
    target_value: 8,
    unit: 'out of 10',
    measurement_window: 3,
    pass_threshold: 70
  });
  
  // Protocol-specific criteria
  if (protocolType === 'behavioral_modification') {
    criteria.push({
      criteria_name: 'Problem Behavior Reduction',
      metric_type: 'behavioral_frequency',
      target_value: 80,
      unit: 'percentage reduction',
      measurement_window: 14,
      pass_threshold: 60
    });
  } else if (protocolType === 'basic_training') {
    criteria.push({
      criteria_name: 'Command Response Time',
      metric_type: 'response_time',
      target_value: 3,
      unit: 'seconds',
      measurement_window: 5,
      pass_threshold: 80
    });
    
    criteria.push({
      criteria_name: 'Command Accuracy',
      metric_type: 'accuracy',
      target_value: 90,
      unit: 'percentage',
      measurement_window: 5,
      pass_threshold: 85
    });
  }
  
  return criteria;
}

function generateAdaptiveTriggers(difficulty: TrainingProtocol['difficulty'], protocolType: TrainingProtocol['type']): AdaptiveTrigger[] {
  const triggers: AdaptiveTrigger[] = [];
  
  // Performance-based triggers
  triggers.push({
    trigger_condition: 'Success rate below 60% for 3 consecutive days',
    adaptation_type: 'decrease_difficulty',
    trigger_threshold: 60,
    adaptation_parameters: {
      difficulty_reduction: 1,
      additional_practice_time: 5,
      simplify_criteria: true
    }
  });
  
  triggers.push({
    trigger_condition: 'Success rate above 90% for 2 consecutive days',
    adaptation_type: 'increase_difficulty',
    trigger_threshold: 90,
    adaptation_parameters: {
      difficulty_increase: 1,
      add_distractions: true,
      raise_criteria: true
    }
  });
  
  // Stress indicators
  triggers.push({
    trigger_condition: 'Stress indicators present in >30% of sessions',
    adaptation_type: 'change_approach',
    trigger_threshold: 30,
    adaptation_parameters: {
      reduce_session_length: true,
      increase_break_frequency: true,
      modify_reinforcement_schedule: 'higher_rate'
    }
  });
  
  // Progress rate triggers
  triggers.push({
    trigger_condition: 'No improvement for 5 consecutive days',
    adaptation_type: 'add_reinforcement',
    trigger_threshold: 0,
    adaptation_parameters: {
      increase_reward_value: true,
      add_environmental_enrichment: true,
      consult_specialist: true
    }
  });
  
  return triggers;
}

// Utility functions
function generateId(): string {
  return `protocol-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateProtocolName(goals: string[], petName: string): string {
  const mainGoal = goals[0] || 'Training';
  return `${petName}'s ${mainGoal} Protocol`;
}

function generateProtocolDescription(data: ProtocolGenerationData): string {
  const issues = data.behavioralIssues.length > 0 ? ` addressing ${data.behavioralIssues.join(', ')}` : '';
  const goals = data.trainingGoals.length > 0 ? ` focusing on ${data.trainingGoals.join(', ')}` : '';
  
  return `Personalized training protocol for ${data.petData.name}${issues}${goals}. ` +
         `Designed for ${data.ownerExperience} level trainers with ${data.availableTimePerDay} minutes daily.`;
}

function calculateOptimalDuration(data: ProtocolGenerationData, factors: PersonalizationFactor[]): number {
  let baseDuration = 21; // Default 21-day program
  
  // Adjust based on complexity
  if (data.behavioralIssues.length > 2) baseDuration += 7;
  if (data.trainingGoals.length > 3) baseDuration += 7;
  
  // Adjust based on owner experience
  if (data.ownerExperience === 'beginner') baseDuration += 7;
  else if (data.ownerExperience === 'advanced') baseDuration -= 7;
  
  // Adjust based on pet age
  const ageFactor = factors.find(f => f.factor_type === 'pet_age');
  if (ageFactor?.factor_value.includes('years')) {
    const age = parseInt(ageFactor.factor_value);
    if (age < 1) baseDuration -= 7; // Puppies learn faster
    else if (age > 7) baseDuration += 7; // Seniors need more time
  }
  
  return Math.max(14, Math.min(42, baseDuration)); // Keep between 2-6 weeks
}

function calculateOptimalSessions(availableTime: number): number {
  if (availableTime < 20) return 1;
  else if (availableTime < 40) return 2;
  else return 3;
}

function calculateSessionDuration(availableTime: number, difficulty: TrainingProtocol['difficulty']): number {
  const baseTime = Math.min(availableTime / 2, 30); // Max 30 minutes per session
  
  if (difficulty === 'beginner') return Math.max(10, baseTime - 5);
  else if (difficulty === 'advanced') return Math.min(45, baseTime + 10);
  else return baseTime;
}

function calculateConfidenceScore(factors: PersonalizationFactor[]): number {
  const totalWeight = factors.reduce((sum, factor) => sum + factor.weight, 0);
  const averageConfidence = factors.reduce((sum, factor) => sum + (factor.weight * 0.8), 0) / totalWeight;
  
  return Math.round(averageConfidence * 100);
}

function generateExpectedOutcomes(goals: string[], issues: string[]): string[] {
  const outcomes: string[] = [];
  
  // Goal-based outcomes
  goals.forEach(goal => {
    outcomes.push(`Improved ${goal.toLowerCase()} performance`);
  });
  
  // Issue-based outcomes
  issues.forEach(issue => {
    outcomes.push(`Reduced ${issue.toLowerCase()} incidents`);
  });
  
  // General outcomes
  outcomes.push('Enhanced human-pet bond');
  outcomes.push('Increased confidence and well-being');
  outcomes.push('Better communication between pet and owner');
  
  return outcomes;
}

function determineRequiredEquipment(protocolType: TrainingProtocol['type'], environment: string): string[] {
  const baseEquipment = ['High-value treats', 'Training clicker', 'Comfortable collar/harness', 'Lead/leash'];
  
  if (protocolType === 'behavioral_modification') {
    baseEquipment.push('Management tools', 'Calming aids', 'Environmental barriers');
  } else if (protocolType === 'advanced_skills') {
    baseEquipment.push('Target stick', 'Training platforms', 'Agility equipment', 'Props for tricks');
  }
  
  if (environment === 'outdoor' || environment === 'both') {
    baseEquipment.push('Long line', 'Outdoor treats container', 'Weather-appropriate gear');
  }
  
  return baseEquipment;
}

function generateDifficultyModifiers(petData: any, ownerExperience: string): any[] {
  const modifiers: any[] = [];
  
  if (petData.age && petData.age < 1) {
    modifiers.push({
      modifier_type: 'age_adjustment',
      description: 'Puppy/kitten modifications',
      adjustment_factor: 0.8 // Easier
    });
  }
  
  if (ownerExperience === 'beginner') {
    modifiers.push({
      modifier_type: 'experience_adjustment',
      description: 'Beginner-friendly modifications',
      adjustment_factor: 0.7 // Easier
    });
  }
  
  return modifiers;
}

function getBreedCharacteristics(breed: string, petType: string): string {
  // Simplified breed characteristic lookup
  const breedMap: Record<string, string> = {
    'Border Collie': 'High intelligence, needs mental stimulation, quick learner',
    'Labrador': 'Food motivated, eager to please, good for beginners',
    'German Shepherd': 'Intelligent, loyal, needs structured training',
    'Golden Retriever': 'Gentle, patient, excellent for positive reinforcement',
    'Husky': 'Independent, high energy, needs creative motivation',
    'Bulldog': 'Stubborn but gentle, needs patience and short sessions',
    // Add more breed-specific characteristics
  };
  
  return breedMap[breed] || `${petType} with standard training characteristics`;
}

function inferLearningStyle(issues: string[], goals: string[]): string {
  // Simplified learning style inference
  const allText = [...issues, ...goals].join(' ').toLowerCase();
  
  if (allText.includes('food') || allText.includes('treat')) return 'food_motivated';
  else if (allText.includes('play') || allText.includes('toy')) return 'play_motivated';
  else if (allText.includes('praise') || allText.includes('attention')) return 'social_motivated';
  else return 'balanced_motivation';
}

export const create21DayProgram = (protocolData: ProtocolGenerationData) => {
  return generatePersonalizedProtocol({
    ...protocolData,
    trainingGoals: [...protocolData.trainingGoals, '21-day behavioral modification']
  });
};