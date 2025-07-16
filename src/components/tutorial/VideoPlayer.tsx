import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings, 
  SkipBack, 
  SkipForward,
  Bookmark,
  Share2,
  Download,
  Clock,
  Users,
  Star,
  ChevronDown
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';

interface VideoPlayerProps {
  videoId: string;
  title: string;
  description: string;
  duration: string;
  instructor: string;
  views: number;
  rating: number;
  chapters?: Array<{
    id: string;
    title: string;
    time: string;
    duration: string;
  }>;
  relatedVideos?: Array<{
    id: string;
    title: string;
    thumbnail: string;
    duration: string;
    views: number;
  }>;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoId,
  title,
  description,
  duration,
  instructor,
  views,
  rating,
  chapters = [],
  relatedVideos = []
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState([80]);
  const [progress, setProgress] = useState(25);
  const [currentTime, setCurrentTime] = useState('2:15');
  const [showChapters, setShowChapters] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState('1x');
  const [quality, setQuality] = useState('1080p');

  return (
    <div className="space-y-6">
      {/* Video Player */}
      <Card className="overflow-hidden">
        <div className="relative aspect-video bg-black">
          {/* Video placeholder with controls overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                {isPlaying ? (
                  <Pause className="h-8 w-8" />
                ) : (
                  <Play className="h-8 w-8 ml-1" />
                )}
              </div>
              <p className="text-sm opacity-90">Video Tutorial Player</p>
            </div>
          </div>
          
          {/* Video Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="space-y-3">
              {/* Progress Bar */}
              <div className="flex items-center gap-2 text-white text-sm">
                <span>{currentTime}</span>
                <Progress value={progress} className="flex-1 h-2" />
                <span>{duration}</span>
              </div>
              
              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>
                  
                  <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  
                  <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                    <SkipForward className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/20"
                      onClick={() => setIsMuted(!isMuted)}
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    <Slider
                      value={volume}
                      onValueChange={setVolume}
                      max={100}
                      step={1}
                      className="w-20"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 text-xs">
                    {playbackSpeed}
                  </Button>
                  <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 text-xs">
                    {quality}
                  </Button>
                  <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Info */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">{title}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{views.toLocaleString()} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-current text-yellow-500" />
                    <span>{rating}/5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{duration}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Bookmark className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-medium">
                  {instructor.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{instructor}</p>
                  <p className="text-sm text-muted-foreground">Pet Behavior Expert</p>
                </div>
              </div>
              <p className="text-sm">{description}</p>
            </div>
          </div>

          {/* Chapters */}
          {chapters.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <Button
                  variant="ghost"
                  className="w-full justify-between p-0 h-auto"
                  onClick={() => setShowChapters(!showChapters)}
                >
                  <span className="font-medium">Chapters ({chapters.length})</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showChapters ? 'rotate-180' : ''}`} />
                </Button>
                
                {showChapters && (
                  <div className="mt-4 space-y-2">
                    {chapters.map((chapter, index) => (
                      <div
                        key={chapter.id}
                        className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors"
                      >
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{chapter.title}</p>
                          <p className="text-xs text-muted-foreground">{chapter.duration}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {chapter.time}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Transcript */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Video Transcript</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>[0:00] Welcome to this comprehensive guide on setting up your pet profile in PetVoice.</p>
                <p>[0:15] Today we'll cover all the essential information you need to provide for optimal analysis results.</p>
                <p>[0:30] First, let's navigate to the Pets section from your dashboard...</p>
                <Button variant="link" className="p-0 h-auto text-sm">
                  Show full transcript
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Related Videos */}
          {relatedVideos.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-4">Related Videos</h3>
                <div className="space-y-3">
                  {relatedVideos.map((video) => (
                    <div key={video.id} className="flex gap-3 p-2 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors">
                      <div className="w-20 h-12 bg-muted rounded flex items-center justify-center shrink-0">
                        <Play className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-2">{video.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>{video.duration}</span>
                          <span>•</span>
                          <span>{video.views} views</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Learning Progress */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-4">Your Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Course Completion</span>
                    <span>6/12 videos</span>
                  </div>
                  <Progress value={50} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Watch Time</span>
                    <span>2h 15m</span>
                  </div>
                  <Progress value={35} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Quiz Score</span>
                    <span>85%</span>
                  </div>
                  <Progress value={85} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <Button className="w-full" size="sm">
                Take Chapter Quiz
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                Download Resources
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                Join Discussion
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};