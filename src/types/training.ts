export interface TrainingProtocol {
  id: string;
  name: string;
  description: string;
  type: 'behavioral_modification' | 'basic_training' | 'advanced_skills' | 'problem_solving';
  duration_days: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  target_behaviors: string[];
  issue_addressed: string[];
  created_at: string;
  
  // Protocol structure
  phases: TrainingPhase[];
  daily_sessions: number;
  session_duration: number; // minutes
  
  // AI-generated content
  ai_generated: boolean;
  confidence_score: number;
  personalization_factors: PersonalizationFactor[];
  
  // Success metrics
  success_criteria: SuccessCriteria[];
  expected_outcomes: string[];
  
  // Adaptive features
  adaptive_triggers: AdaptiveTrigger[];
  
  // Resources
  required_equipment: string[];
  difficulty_modifiers: DifficultyModifier[];
}

export interface TrainingPhase {
  id: string;
  name: string;
  description: string;
  phase_number: number;
  duration_days: number;
  
  // Daily activities
  daily_activities: DailyActivity[];
  
  // Success criteria for this phase
  completion_criteria: CompletionCriteria[];
  
  // Progression rules
  progression_rules: ProgressionRule[];
}

export interface DailyActivity {
  id: string;
  name: string;
  description: string;
  instructions: string[];
  duration_minutes: number;
  
  // Difficulty and adaptation
  difficulty_level: number; // 1-10
  prerequisite_skills: string[];
  
  // Measurement
  measurable_outcomes: MeasurableOutcome[];
  
  // Resources
  required_equipment: string[];
  video_demonstrations: VideoResource[];
  
  // AI insights
  success_tips: string[];
  common_mistakes: string[];
  troubleshooting: TroubleshootingTip[];
}

export interface MeasurableOutcome {
  metric: string;
  target_value: number;
  unit: string;
  measurement_method: string;
  frequency: 'daily' | 'weekly' | 'phase_end';
}

export interface SuccessCriteria {
  criteria_name: string;
  metric_type: 'behavioral_frequency' | 'response_time' | 'accuracy' | 'consistency' | 'duration';
  target_value: number;
  unit: string;
  measurement_window: number; // days
  pass_threshold: number; // percentage
}

export interface PersonalizationFactor {
  factor_type: 'pet_age' | 'breed_characteristics' | 'current_behavior' | 'learning_style' | 'environment' | 'owner_experience';
  factor_value: string;
  weight: number; // 0-1, influence on protocol generation
  reasoning: string;
}

export interface AdaptiveTrigger {
  trigger_condition: string;
  adaptation_type: 'increase_difficulty' | 'decrease_difficulty' | 'extend_phase' | 'add_reinforcement' | 'change_approach';
  trigger_threshold: number;
  adaptation_parameters: Record<string, any>;
}

export interface TrainingSession {
  id: string;
  protocol_id: string;
  phase_id: string;
  activity_id: string;
  pet_id: string;
  user_id: string;
  
  // Session info
  session_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  
  // Execution data
  activities_completed: ActivityCompletion[];
  
  // Measurements
  performance_metrics: PerformanceMetric[];
  
  // Media
  video_recordings: VideoRecording[];
  photos: string[];
  
  // Assessment
  session_rating: number; // 1-10
  difficulty_rating: number; // 1-10
  engagement_level: number; // 1-10
  stress_indicators: string[];
  positive_indicators: string[];
  
  // Notes and observations
  trainer_notes: string;
  behavioral_observations: string[];
  improvements_noted: string[];
  challenges_faced: string[];
  
  // AI Analysis
  ai_feedback: AISessionFeedback;
  
  // Next session recommendations
  next_session_adjustments: SessionAdjustment[];
}

export interface ActivityCompletion {
  activity_id: string;
  completed: boolean;
  completion_percentage: number;
  time_spent_minutes: number;
  attempts_made: number;
  success_rate: number;
  notes: string;
}

export interface PerformanceMetric {
  metric_name: string;
  value: number;
  unit: string;
  target_value: number;
  achievement_percentage: number;
  improvement_from_last: number;
}

export interface VideoRecording {
  id: string;
  filename: string;
  url: string;
  duration_seconds: number;
  file_size: number;
  
  // AI Analysis results
  ai_analysis: VideoAnalysisResult;
  
  // Manual annotations
  manual_annotations: VideoAnnotation[];
}

export interface VideoAnalysisResult {
  analyzed_at: string;
  confidence_score: number;
  
  // Behavioral analysis
  behaviors_detected: DetectedBehavior[];
  engagement_score: number; // 1-10
  stress_indicators: StressIndicator[];
  positive_indicators: PositiveIndicator[];
  
  // Performance analysis
  task_completion_analysis: TaskCompletionAnalysis;
  improvement_areas: ImprovementArea[];
  
  // Recommendations
  technique_suggestions: string[];
  timing_recommendations: string[];
  environment_suggestions: string[];
}

export interface DetectedBehavior {
  behavior_type: string;
  confidence: number;
  timestamp_start: number;
  timestamp_end: number;
  context: string;
  significance: 'positive' | 'negative' | 'neutral';
}

export interface AISessionFeedback {
  overall_assessment: string;
  performance_score: number; // 1-100
  
  // Specific feedback areas
  technique_feedback: string[];
  timing_feedback: string[];
  reinforcement_feedback: string[];
  
  // Progress indicators
  progress_indicators: ProgressIndicator[];
  
  // Adaptive recommendations
  difficulty_adjustments: DifficultyAdjustment[];
  approach_modifications: string[];
  
  // Next session preparation
  preparation_tips: string[];
  focus_areas: string[];
}

export interface ProgressIndicator {
  area: string;
  current_level: number;
  target_level: number;
  progress_rate: 'ahead' | 'on_track' | 'behind' | 'concerning';
  trend: 'improving' | 'stable' | 'declining';
  confidence: number;
}

export interface DifficultyAdjustment {
  adjustment_type: 'increase' | 'decrease' | 'maintain';
  justification: string;
  specific_modifications: string[];
  expected_impact: string;
}

export interface SessionAdjustment {
  adjustment_type: 'duration' | 'difficulty' | 'focus_area' | 'technique' | 'environment';
  modification: string;
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ProtocolProgress {
  protocol_id: string;
  pet_id: string;
  
  // Overall progress
  current_phase: number;
  current_day: number;
  completion_percentage: number;
  
  // Performance tracking
  overall_performance_score: number;
  phase_scores: PhaseScore[];
  
  // Metrics tracking
  success_metrics: SuccessMetricProgress[];
  
  // Adaptive history
  adaptations_made: AdaptationRecord[];
  
  // Predictions
  completion_prediction: CompletionPrediction;
  success_probability: number;
  
  // Challenges and successes
  identified_challenges: Challenge[];
  notable_successes: Success[];
}

export interface PhaseScore {
  phase_number: number;
  score: number;
  completion_date: string | null;
  days_taken: number;
  notes: string;
}

export interface SuccessMetricProgress {
  metric_name: string;
  current_value: number;
  target_value: number;
  progress_percentage: number;
  trend: 'improving' | 'stable' | 'declining';
  last_measured: string;
}

export interface CompletionPrediction {
  estimated_completion_date: string;
  confidence_level: number;
  factors_considered: string[];
  risk_factors: string[];
}

export interface Challenge {
  identified_date: string;
  challenge_type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  interventions_applied: string[];
  resolution_status: 'ongoing' | 'resolved' | 'escalated';
}

export interface Success {
  date: string;
  achievement: string;
  significance: 'minor' | 'major' | 'breakthrough';
  metrics_improved: string[];
  celebration_notes: string;
}

// Additional utility types
export interface TroubleshootingTip {
  issue: string;
  solution: string;
  prevention: string;
  when_to_seek_help: string;
}

export interface VideoResource {
  title: string;
  url: string;
  duration_seconds: number;
  description: string;
  key_points: string[];
}

export interface CompletionCriteria {
  criteria_name: string;
  measurement_method: string;
  pass_threshold: number;
  consecutive_days_required: number;
}

export interface ProgressionRule {
  condition: string;
  action: 'advance_phase' | 'repeat_phase' | 'modify_approach';
  parameters: Record<string, any>;
}

export interface DifficultyModifier {
  modifier_type: string;
  description: string;
  adjustment_factor: number; // multiplier for difficulty
}

export interface StressIndicator {
  indicator: string;
  severity: number; // 1-10
  timestamp: number;
  context: string;
}

export interface PositiveIndicator {
  indicator: string;
  intensity: number; // 1-10
  timestamp: number;
  context: string;
}

export interface TaskCompletionAnalysis {
  task_understood: boolean;
  execution_quality: number; // 1-10
  consistency: number; // 1-10
  time_to_completion: number;
  error_patterns: string[];
  success_patterns: string[];
}

export interface ImprovementArea {
  area: string;
  current_score: number;
  target_score: number;
  specific_recommendations: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface VideoAnnotation {
  timestamp: number;
  annotation_type: 'behavior' | 'technique' | 'improvement' | 'concern';
  description: string;
  created_by: string;
  created_at: string;
}

export interface AdaptationRecord {
  date: string;
  trigger: string;
  adaptation_made: string;
  reasoning: string;
  outcome: string;
}