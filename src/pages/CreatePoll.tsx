import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart, 
  PieChart, 
  Clock, 
  Edit, 
  Trash2, 
  Plus, 
  Check, 
  X, 
  Copy, 
  Download, 
  Upload, 
  FileText, 
  Share2, 
  BarChart2, 
  PieChartIcon,
  Award,
  Timer,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Shuffle,
  Layers,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// Types
interface PollOption {
  id: string;
  text: string;
  votes: number;
  isCorrect?: boolean; // For quiz questions
}

interface Poll {
  id: string;
  title: string;
  description?: string;
  options: PollOption[];
  isAnonymous: boolean;
  allowMultipleAnswers: boolean;
  isQuiz: boolean;
  timeLimit?: number; // In seconds
  status: 'draft' | 'active' | 'ended';
  createdAt: number;
  endedAt?: number;
  totalVotes: number;
  showResults: boolean;
  resultsVisibility: 'always' | 'after-vote' | 'after-end' | 'host-only';
  category?: string;
  tags?: string[];
}

const CreatePoll: React.FC = () => {
  const navigate = useNavigate();
  const { meetingId } = useParams<{ meetingId: string }>();
  
  const [newPoll, setNewPoll] = useState<Omit<Poll, 'id' | 'createdAt' | 'totalVotes'>>({
    title: '',
    options: [
      { id: `option-${Date.now()}-1`, text: '', votes: 0 },
      { id: `option-${Date.now()}-2`, text: '', votes: 0 }
    ],
    isAnonymous: true,
    allowMultipleAnswers: false,
    isQuiz: false,
    status: 'draft',
    showResults: true,
    resultsVisibility: 'after-vote',
    category: 'General',
    tags: []
  });
  
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [newTag, setNewTag] = useState('');
  
  // Sample categories
  const categories = [
    'General',
    'Education',
    'Feedback',
    'Decision Making',
    'Ice Breaker',
    'Quiz',
    'Survey',
    'Custom'
  ];
  
  // Add a new option to the poll being created
  const addOption = () => {
    setNewPoll({
      ...newPoll,
      options: [
        ...newPoll.options,
        { id: `option-${Date.now()}`, text: '', votes: 0 }
      ]
    });
  };

  // Remove an option from the poll being created
  const removeOption = (optionId: string) => {
    if (newPoll.options.length <= 2) {
      alert('A poll must have at least 2 options');
      return;
    }
    
    setNewPoll({
      ...newPoll,
      options: newPoll.options.filter(option => option.id !== optionId)
    });
  };

  // Update an option's text
  const updateOptionText = (optionId: string, text: string) => {
    setNewPoll({
      ...newPoll,
      options: newPoll.options.map(option => 
        option.id === optionId ? { ...option, text } : option
      )
    });
  };

  // Toggle whether an option is correct (for quizzes)
  const toggleOptionCorrect = (optionId: string) => {
    setNewPoll({
      ...newPoll,
      options: newPoll.options.map(option => 
        option.id === optionId ? { ...option, isCorrect: !option.isCorrect } : option
      )
    });
  };
  
  // Add a tag to the poll being created
  const addTag = () => {
    if (!newTag.trim()) return;
    
    if (!newPoll.tags) {
      setNewPoll({ ...newPoll, tags: [newTag] });
    } else if (!newPoll.tags.includes(newTag)) {
      setNewPoll({ ...newPoll, tags: [...newPoll.tags, newTag] });
    }
    
    setNewTag('');
  };

  // Remove a tag from the poll being created
  const removeTag = (tag: string) => {
    if (!newPoll.tags) return;
    
    setNewPoll({
      ...newPoll,
      tags: newPoll.tags.filter(t => t !== tag)
    });
  };
  
  // Create a new poll
  const createPoll = () => {
    // Validate poll
    if (!newPoll.title.trim()) {
      alert('Please enter a poll title');
      return;
    }
    
    if (newPoll.options.some(option => !option.text.trim())) {
      alert('Please fill in all options');
      return;
    }
    
    // Create new poll object
    const poll: Poll = {
      ...newPoll,
      id: `poll-${Date.now()}`,
      createdAt: Date.now(),
      totalVotes: 0,
      status: 'active'
    };
    
    // Save to localStorage
    try {
      const savedPolls = localStorage.getItem('savedPolls');
      const polls = savedPolls ? JSON.parse(savedPolls) : [];
      polls.push(poll);
      localStorage.setItem('savedPolls', JSON.stringify(polls));
      
      alert('Poll created successfully!');
      
      // Navigate back to the meeting
      if (meetingId) {
        navigate(`/meeting-enhanced/${meetingId}`);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error saving poll:', error);
      alert('Failed to save poll. Please try again.');
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow p-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate(meetingId ? `/meeting-enhanced/${meetingId}` : '/dashboard')}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Create New Poll</h1>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Poll Details</CardTitle>
              <CardDescription>
                Create a poll to gather feedback from participants
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="poll-title">Poll Title</Label>
                  <Input
                    id="poll-title"
                    placeholder="Enter poll title"
                    value={newPoll.title}
                    onChange={(e) => setNewPoll({ ...newPoll, title: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="poll-description">Description (Optional)</Label>
                  <Textarea
                    id="poll-description"
                    placeholder="Enter poll description"
                    value={newPoll.description || ''}
                    onChange={(e) => setNewPoll({ ...newPoll, description: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label>Poll Type</Label>
                  <div className="flex space-x-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="poll-type-quiz"
                        checked={newPoll.isQuiz}
                        onCheckedChange={(checked) => setNewPoll({ ...newPoll, isQuiz: checked })}
                      />
                      <Label htmlFor="poll-type-quiz">Quiz Mode (with correct answers)</Label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label>Poll Options</Label>
                  <div className="space-y-3 mt-2">
                    {newPoll.options.map((option, index) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <div className="flex-grow">
                          <Input
                            placeholder={`Option ${index + 1}`}
                            value={option.text}
                            onChange={(e) => updateOptionText(option.id, e.target.value)}
                          />
                        </div>
                        
                        {newPoll.isQuiz && (
                          <Button
                            type="button"
                            variant={option.isCorrect ? "default" : "outline"}
                            size="icon"
                            onClick={() => toggleOptionCorrect(option.id)}
                            title={option.isCorrect ? "Correct answer" : "Mark as correct"}
                          >
                            <CheckCircle2 size={16} />
                          </Button>
                        )}
                        
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeOption(option.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    ))}
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addOption}
                      className="w-full"
                    >
                      <Plus size={16} className="mr-2" />
                      Add Option
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Advanced Options Toggle */}
              <div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  className="w-full justify-between"
                >
                  <span>Advanced Options</span>
                  {showAdvancedOptions ? <X size={16} /> : <Plus size={16} />}
                </Button>
              </div>
              
              {/* Advanced Options */}
              {showAdvancedOptions && (
                <div className="space-y-4 border rounded-lg p-4">
                  <div>
                    <Label>Response Settings</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="anonymous-responses"
                          checked={newPoll.isAnonymous}
                          onCheckedChange={(checked) => setNewPoll({ ...newPoll, isAnonymous: checked })}
                        />
                        <Label htmlFor="anonymous-responses">Anonymous Responses</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="multiple-answers"
                          checked={newPoll.allowMultipleAnswers}
                          onCheckedChange={(checked) => setNewPoll({ ...newPoll, allowMultipleAnswers: checked })}
                        />
                        <Label htmlFor="multiple-answers">Allow Multiple Answers</Label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Results Visibility</Label>
                    <RadioGroup
                      value={newPoll.resultsVisibility}
                      onValueChange={(value: 'always' | 'after-vote' | 'after-end' | 'host-only') => 
                        setNewPoll({ ...newPoll, resultsVisibility: value })
                      }
                      className="space-y-2 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="always" id="visibility-always" />
                        <Label htmlFor="visibility-always">Always visible</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="after-vote" id="visibility-after-vote" />
                        <Label htmlFor="visibility-after-vote">After voting</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="after-end" id="visibility-after-end" />
                        <Label htmlFor="visibility-after-end">After poll ends</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="host-only" id="visibility-host-only" />
                        <Label htmlFor="visibility-host-only">Host only</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  {newPoll.isQuiz && (
                    <div>
                      <Label htmlFor="time-limit">Time Limit (seconds)</Label>
                      <Input
                        id="time-limit"
                        type="number"
                        min="0"
                        placeholder="No time limit"
                        value={newPoll.timeLimit || ''}
                        onChange={(e) => setNewPoll({ 
                          ...newPoll, 
                          timeLimit: e.target.value ? parseInt(e.target.value) : undefined 
                        })}
                      />
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={newPoll.category}
                      onChange={(e) => setNewPoll({ ...newPoll, category: e.target.value })}
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <Label>Tags</Label>
                    <div className="flex mt-2">
                      <Input
                        placeholder="Add a tag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        className="flex-grow"
                      />
                      <Button
                        type="button"
                        onClick={addTag}
                        className="ml-2"
                      >
                        Add
                      </Button>
                    </div>
                    
                    {newPoll.tags && newPoll.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {newPoll.tags.map(tag => (
                          <div 
                            key={tag} 
                            className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm flex items-center"
                          >
                            {tag}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 ml-1"
                              onClick={() => removeTag(tag)}
                            >
                              <X size={12} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => navigate(meetingId ? `/meeting-enhanced/${meetingId}` : '/dashboard')}
              >
                Cancel
              </Button>
              <Button onClick={createPoll}>
                Create Poll
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreatePoll;