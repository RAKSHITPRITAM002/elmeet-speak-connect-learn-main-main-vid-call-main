import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
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
  PieChart as PieChartIcon,
  Award,
  Timer,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Shuffle,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';

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

interface EnhancedPollsAndQuizzesProps {
  isHost: boolean;
  participants: { id: string; name: string }[];
  onSendPoll?: (poll: Poll) => void;
  onEndPoll?: (pollId: string) => void;
  onVote?: (pollId: string, optionIds: string[]) => void;
  meetingId?: string;
}

const EnhancedPollsAndQuizzes: React.FC<EnhancedPollsAndQuizzesProps> = ({
  isHost,
  participants,
  onSendPoll,
  onEndPoll,
  onVote,
  meetingId
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'create' | 'active' | 'results' | 'templates'>('active');
  const [polls, setPolls] = useState<Poll[]>([]);
  const [templates, setTemplates] = useState<Poll[]>([]);
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
  const [userVotes, setUserVotes] = useState<Record<string, string[]>>({});
  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Poll | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [selectedVote, setSelectedVote] = useState<string[]>([]);

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

  // Sample templates
  const sampleTemplates: Poll[] = [
    {
      id: 'template-1',
      title: 'Meeting Feedback',
      description: 'Please rate this meeting',
      options: [
        { id: 't1-opt1', text: 'Very Useful', votes: 0 },
        { id: 't1-opt2', text: 'Somewhat Useful', votes: 0 },
        { id: 't1-opt3', text: 'Not Very Useful', votes: 0 },
        { id: 't1-opt4', text: 'Not Useful At All', votes: 0 }
      ],
      isAnonymous: true,
      allowMultipleAnswers: false,
      isQuiz: false,
      status: 'draft',
      createdAt: Date.now(),
      totalVotes: 0,
      showResults: true,
      resultsVisibility: 'after-vote',
      category: 'Feedback',
      tags: ['feedback', 'rating', 'meeting']
    },
    {
      id: 'template-2',
      title: 'Language Learning Quiz',
      description: 'Test your vocabulary knowledge',
      options: [
        { id: 't2-opt1', text: 'Option A', votes: 0, isCorrect: false },
        { id: 't2-opt2', text: 'Option B', votes: 0, isCorrect: true },
        { id: 't2-opt3', text: 'Option C', votes: 0, isCorrect: false },
        { id: 't2-opt4', text: 'Option D', votes: 0, isCorrect: false }
      ],
      isAnonymous: false,
      allowMultipleAnswers: false,
      isQuiz: true,
      timeLimit: 30,
      status: 'draft',
      createdAt: Date.now(),
      totalVotes: 0,
      showResults: true,
      resultsVisibility: 'after-end',
      category: 'Quiz',
      tags: ['quiz', 'language', 'vocabulary']
    },
    {
      id: 'template-3',
      title: 'Ice Breaker: Favorite Season',
      description: 'What is your favorite season?',
      options: [
        { id: 't3-opt1', text: 'Spring', votes: 0 },
        { id: 't3-opt2', text: 'Summer', votes: 0 },
        { id: 't3-opt3', text: 'Fall', votes: 0 },
        { id: 't3-opt4', text: 'Winter', votes: 0 }
      ],
      isAnonymous: false,
      allowMultipleAnswers: false,
      isQuiz: false,
      status: 'draft',
      createdAt: Date.now(),
      totalVotes: 0,
      showResults: true,
      resultsVisibility: 'always',
      category: 'Ice Breaker',
      tags: ['ice breaker', 'fun', 'introduction']
    }
  ];

  // Load templates on component mount
  useEffect(() => {
    setTemplates(sampleTemplates);
    
    // Load any saved polls from localStorage
    try {
      const savedPolls = localStorage.getItem('savedPolls');
      if (savedPolls) {
        setPolls(JSON.parse(savedPolls));
      }
    } catch (error) {
      console.error('Error loading saved polls:', error);
    }
  }, []);

  // Save polls to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('savedPolls', JSON.stringify(polls));
    } catch (error) {
      console.error('Error saving polls:', error);
    }
  }, [polls]);

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
    
    // Add to polls list
    setPolls([...polls, poll]);
    
    // Send poll to participants if callback provided
    if (onSendPoll) {
      onSendPoll(poll);
    }
    
    // Reset form for next poll
    setNewPoll({
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
    
    // Switch to active polls tab
    setActiveTab('active');
  };

  // End an active poll
  const endPoll = (pollId: string) => {
    setPolls(polls.map(poll => 
      poll.id === pollId 
        ? { ...poll, status: 'ended', endedAt: Date.now() } 
        : poll
    ));
    
    if (onEndPoll) {
      onEndPoll(pollId);
    }
  };

  // Vote in a poll
  const vote = (pollId: string, optionIds: string[]) => {
    // Find the poll
    const pollIndex = polls.findIndex(p => p.id === pollId);
    if (pollIndex === -1) return;
    
    const poll = polls[pollIndex];
    
    // Check if user has already voted and poll doesn't allow multiple answers
    if (userVotes[pollId] && !poll.allowMultipleAnswers) {
      alert('You have already voted in this poll');
      return;
    }
    
    // Update the poll with the new votes
    const updatedPolls = [...polls];
    const updatedPoll = { ...poll };
    
    updatedPoll.options = updatedPoll.options.map(option => {
      if (optionIds.includes(option.id)) {
        return { ...option, votes: option.votes + 1 };
      }
      return option;
    });
    
    updatedPoll.totalVotes += optionIds.length;
    updatedPolls[pollIndex] = updatedPoll;
    
    // Update state
    setPolls(updatedPolls);
    setUserVotes({ ...userVotes, [pollId]: optionIds });
    
    // Call vote callback if provided
    if (onVote) {
      onVote(pollId, optionIds);
    }
    
    // Clear selected vote
    setSelectedVote([]);
  };

  // Delete a poll
  const deletePoll = (pollId: string) => {
    if (confirm('Are you sure you want to delete this poll?')) {
      setPolls(polls.filter(poll => poll.id !== pollId));
    }
  };

  // Save a poll as a template
  const saveAsTemplate = (pollId: string) => {
    const poll = polls.find(p => p.id === pollId);
    if (!poll) return;
    
    // Create a new template from the poll
    const template: Poll = {
      ...poll,
      id: `template-${Date.now()}`,
      status: 'draft',
      totalVotes: 0,
      options: poll.options.map(option => ({ ...option, votes: 0 })),
      createdAt: Date.now()
    };
    
    setTemplates([...templates, template]);
    alert('Poll saved as template');
  };

  // Use a template to create a new poll
  const useTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;
    
    setNewPoll({
      title: template.title,
      description: template.description,
      options: template.options.map(option => ({ 
        ...option, 
        id: `option-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        votes: 0 
      })),
      isAnonymous: template.isAnonymous,
      allowMultipleAnswers: template.allowMultipleAnswers,
      isQuiz: template.isQuiz,
      timeLimit: template.timeLimit,
      status: 'draft',
      showResults: template.showResults,
      resultsVisibility: template.resultsVisibility,
      category: template.category,
      tags: template.tags ? [...template.tags] : []
    });
    
    setActiveTab('create');
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

  // Import a poll from text (CSV or JSON)
  const importPoll = () => {
    setImportError(null);
    
    try {
      // Try parsing as JSON first
      try {
        const parsed = JSON.parse(importText);
        
        // Validate the imported data
        if (!parsed.title || !Array.isArray(parsed.options) || parsed.options.length < 2) {
          throw new Error('Invalid poll format');
        }
        
        // Create a new poll from the imported data
        setNewPoll({
          title: parsed.title,
          description: parsed.description || '',
          options: parsed.options.map((opt: any, index: number) => ({
            id: `option-${Date.now()}-${index}`,
            text: typeof opt === 'string' ? opt : opt.text || '',
            votes: 0,
            isCorrect: opt.isCorrect || false
          })),
          isAnonymous: parsed.isAnonymous !== undefined ? parsed.isAnonymous : true,
          allowMultipleAnswers: parsed.allowMultipleAnswers || false,
          isQuiz: parsed.isQuiz || false,
          timeLimit: parsed.timeLimit,
          status: 'draft',
          showResults: parsed.showResults !== undefined ? parsed.showResults : true,
          resultsVisibility: parsed.resultsVisibility || 'after-vote',
          category: parsed.category || 'General',
          tags: parsed.tags || []
        });
        
        setIsImporting(false);
        setActiveTab('create');
        return;
      } catch (jsonError) {
        // If JSON parsing fails, try CSV format
        const lines = importText.split('\n').filter(line => line.trim());
        
        if (lines.length < 3) {
          throw new Error('Not enough lines in CSV format');
        }
        
        const title = lines[0];
        const description = lines[1];
        const options = lines.slice(2).map((line, index) => {
          const parts = line.split(',');
          return {
            id: `option-${Date.now()}-${index}`,
            text: parts[0].trim(),
            votes: 0,
            isCorrect: parts.length > 1 && parts[1].trim().toLowerCase() === 'true'
          };
        });
        
        setNewPoll({
          title,
          description,
          options,
          isAnonymous: true,
          allowMultipleAnswers: false,
          isQuiz: options.some(opt => opt.isCorrect !== undefined),
          status: 'draft',
          showResults: true,
          resultsVisibility: 'after-vote',
          category: 'General',
          tags: []
        });
        
        setIsImporting(false);
        setActiveTab('create');
      }
    } catch (error) {
      setImportError('Failed to import poll. Please check the format and try again.');
    }
  };

  // Export a poll to JSON
  const exportPoll = (pollId: string) => {
    const poll = polls.find(p => p.id === pollId);
    if (!poll) return;
    
    const exportData = {
      title: poll.title,
      description: poll.description,
      options: poll.options.map(opt => ({
        text: opt.text,
        isCorrect: opt.isCorrect
      })),
      isAnonymous: poll.isAnonymous,
      allowMultipleAnswers: poll.allowMultipleAnswers,
      isQuiz: poll.isQuiz,
      timeLimit: poll.timeLimit,
      showResults: poll.showResults,
      resultsVisibility: poll.resultsVisibility,
      category: poll.category,
      tags: poll.tags
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `poll-${poll.title.replace(/\s+/g, '-').toLowerCase()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Filter polls based on search query and category
  const filteredPolls = polls.filter(poll => {
    const matchesSearch = searchQuery 
      ? poll.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (poll.description && poll.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (poll.tags && poll.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
      : true;
    
    const matchesCategory = categoryFilter
      ? poll.category === categoryFilter
      : true;
    
    return matchesSearch && matchesCategory;
  });

  // Get active polls
  const activePolls = filteredPolls.filter(poll => poll.status === 'active');
  
  // Get ended polls
  const endedPolls = filteredPolls.filter(poll => poll.status === 'ended');

  // Handle option selection for voting
  const handleOptionSelect = (optionId: string) => {
    const poll = polls.find(p => p.id === selectedPollId);
    if (!poll) return;
    
    if (poll.allowMultipleAnswers) {
      // For multiple selection, toggle the option
      if (selectedVote.includes(optionId)) {
        setSelectedVote(selectedVote.filter(id => id !== optionId));
      } else {
        setSelectedVote([...selectedVote, optionId]);
      }
    } else {
      // For single selection, replace the selection
      setSelectedVote([optionId]);
    }
  };

  // Render the poll creation form
  const renderCreateForm = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="poll-title">Poll Title</Label>
          <Input
            id="poll-title"
            value={newPoll.title}
            onChange={(e) => setNewPoll({ ...newPoll, title: e.target.value })}
            placeholder="Enter poll title"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="poll-description">Description (Optional)</Label>
          <Textarea
            id="poll-description"
            value={newPoll.description || ''}
            onChange={(e) => setNewPoll({ ...newPoll, description: e.target.value })}
            placeholder="Enter poll description"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label>Poll Options</Label>
          <div className="space-y-2 mt-1">
            {newPoll.options.map((option, index) => (
              <div key={option.id} className="flex items-center gap-2">
                <Input
                  value={option.text}
                  onChange={(e) => updateOptionText(option.id, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1"
                />
                
                {newPoll.isQuiz && (
                  <Button
                    type="button"
                    variant={option.isCorrect ? "default" : "outline"}
                    size="icon"
                    onClick={() => toggleOptionCorrect(option.id)}
                    title={option.isCorrect ? "Correct answer" : "Mark as correct"}
                    className="flex-shrink-0"
                  >
                    <CheckCircle2 size={16} />
                  </Button>
                )}
                
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeOption(option.id)}
                  className="flex-shrink-0"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={addOption}
              className="w-full mt-2"
            >
              <Plus size={16} className="mr-2" />
              Add Option
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="anonymous"
              checked={newPoll.isAnonymous}
              onCheckedChange={(checked) => setNewPoll({ ...newPoll, isAnonymous: checked })}
            />
            <Label htmlFor="anonymous">Anonymous Poll</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="multiple-answers"
              checked={newPoll.allowMultipleAnswers}
              onCheckedChange={(checked) => setNewPoll({ ...newPoll, allowMultipleAnswers: checked })}
            />
            <Label htmlFor="multiple-answers">Allow Multiple Answers</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="is-quiz"
              checked={newPoll.isQuiz}
              onCheckedChange={(checked) => setNewPoll({ ...newPoll, isQuiz: checked })}
            />
            <Label htmlFor="is-quiz">Quiz Mode</Label>
          </div>
        </div>
        
        <div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="w-full"
          >
            {showAdvancedOptions ? 'Hide Advanced Options' : 'Show Advanced Options'}
          </Button>
        </div>
        
        {showAdvancedOptions && (
          <div className="space-y-4 p-4 border rounded-md">
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={newPoll.category}
                onChange={(e) => setNewPoll({ ...newPoll, category: e.target.value })}
                className="w-full mt-1 p-2 border rounded-md"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div>
              <Label htmlFor="results-visibility">Results Visibility</Label>
              <select
                id="results-visibility"
                value={newPoll.resultsVisibility}
                onChange={(e) => setNewPoll({ ...newPoll, resultsVisibility: e.target.value as any })}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="always">Always Visible</option>
                <option value="after-vote">After Voting</option>
                <option value="after-end">After Poll Ends</option>
                <option value="host-only">Host Only</option>
              </select>
            </div>
            
            {newPoll.isQuiz && (
              <div>
                <Label htmlFor="time-limit">Time Limit (seconds)</Label>
                <Input
                  id="time-limit"
                  type="number"
                  min="0"
                  value={newPoll.timeLimit || ''}
                  onChange={(e) => setNewPoll({ ...newPoll, timeLimit: parseInt(e.target.value) || undefined })}
                  placeholder="No time limit"
                  className="mt-1"
                />
              </div>
            )}
            
            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {newPoll.tags && newPoll.tags.map(tag => (
                  <div key={tag} className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTag(tag)}
                      className="h-4 w-4 ml-1"
                    >
                      <X size={12} />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex mt-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={addTag}
                  className="ml-2"
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setIsImporting(true);
          }}
        >
          <Upload size={16} className="mr-2" />
          Import
        </Button>
        
        <div className="space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setNewPoll({
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
            }}
          >
            Reset
          </Button>
          
          <Button
            type="button"
            onClick={createPoll}
          >
            Create Poll
          </Button>
        </div>
      </div>
      
      {/* Import Dialog */}
      {isImporting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Import Poll</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="import-text">Paste JSON or CSV Format</Label>
                <Textarea
                  id="import-text"
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Paste your poll data here..."
                  className="mt-1 h-40"
                />
                
                {importError && (
                  <p className="text-red-500 text-sm mt-1">{importError}</p>
                )}
                
                <div className="text-sm text-gray-500 mt-2">
                  <p>Format examples:</p>
                  <p className="mt-1">JSON: {"{ \"title\": \"My Poll\", \"options\": [\"Option 1\", \"Option 2\"] }"}</p>
                  <p className="mt-1">CSV:</p>
                  <p>Poll Title</p>
                  <p>Poll Description</p>
                  <p>Option 1</p>
                  <p>Option 2</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsImporting(false)}
                >
                  Cancel
                </Button>
                
                <Button
                  type="button"
                  onClick={importPoll}
                >
                  Import
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render the active polls list
  const renderActivePolls = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Active Polls</h3>
        
        <div className="flex space-x-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search polls..."
            className="w-40 sm:w-60"
          />
          
          <select
            value={categoryFilter || ''}
            onChange={(e) => setCategoryFilter(e.target.value || null)}
            className="p-2 border rounded-md"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>
      
      {activePolls.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No active polls</p>
          {isHost && (
            <Button
              type="button"
              onClick={() => setActiveTab('create')}
              className="mt-4"
            >
              Create a Poll
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {activePolls.map(poll => (
            <Card key={poll.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{poll.title}</CardTitle>
                    {poll.description && (
                      <CardDescription>{poll.description}</CardDescription>
                    )}
                  </div>
                  
                  {poll.isQuiz && (
                    <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                      Quiz
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                {selectedPollId === poll.id ? (
                  <div className="space-y-4">
                    {poll.allowMultipleAnswers ? (
                      <div className="space-y-2">
                        {poll.options.map(option => (
                          <div key={option.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={option.id}
                              checked={selectedVote.includes(option.id)}
                              onCheckedChange={() => handleOptionSelect(option.id)}
                            />
                            <Label htmlFor={option.id} className="cursor-pointer">
                              {option.text}
                            </Label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <RadioGroup value={selectedVote[0] || ''} className="space-y-2">
                        {poll.options.map(option => (
                          <div key={option.id} className="flex items-center space-x-2">
                            <RadioGroupItem
                              value={option.id}
                              id={option.id}
                              onClick={() => handleOptionSelect(option.id)}
                            />
                            <Label htmlFor={option.id} className="cursor-pointer">
                              {option.text}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                    
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSelectedPollId(null)}
                      >
                        Cancel
                      </Button>
                      
                      <Button
                        type="button"
                        onClick={() => vote(poll.id, selectedVote)}
                        disabled={selectedVote.length === 0}
                      >
                        Submit Vote
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {poll.category && (
                        <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          {poll.category}
                        </div>
                      )}
                      
                      {poll.tags && poll.tags.map(tag => (
                        <div key={tag} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                          {tag}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        {poll.totalVotes} {poll.totalVotes === 1 ? 'vote' : 'votes'}
                      </div>
                      
                      <div className="flex space-x-2">
                        {!userVotes[poll.id] && (
                          <Button
                            type="button"
                            onClick={() => setSelectedPollId(poll.id)}
                          >
                            Vote
                          </Button>
                        )}
                        
                        {isHost && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => endPoll(poll.id)}
                          >
                            End Poll
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // Render the poll results
  const renderPollResults = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Poll Results</h3>
        
        <div className="flex space-x-2">
          <Button
            type="button"
            variant={chartType === 'bar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('bar')}
          >
            <BarChart size={16} className="mr-2" />
            Bar Chart
          </Button>
          
          <Button
            type="button"
            variant={chartType === 'pie' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('pie')}
          >
            <PieChartIcon size={16} className="mr-2" />
            Pie Chart
          </Button>
        </div>
      </div>
      
      {endedPolls.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No completed polls</p>
        </div>
      ) : (
        <div className="space-y-6">
          {endedPolls.map(poll => (
            <Card key={poll.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{poll.title}</CardTitle>
                    {poll.description && (
                      <CardDescription>{poll.description}</CardDescription>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    {isHost && (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => saveAsTemplate(poll.id)}
                        >
                          <Copy size={16} className="mr-2" />
                          Save as Template
                        </Button>
                        
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => exportPoll(poll.id)}
                        >
                          <Download size={16} className="mr-2" />
                          Export
                        </Button>
                        
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => deletePoll(poll.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {chartType === 'bar' ? (
                    <div className="space-y-2">
                      {poll.options.map(option => (
                        <div key={option.id} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center">
                              {option.text}
                              {poll.isQuiz && option.isCorrect && (
                                <CheckCircle2 size={16} className="ml-2 text-green-500" />
                              )}
                            </span>
                            <span>
                              {option.votes} ({poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0}%)
                            </span>
                          </div>
                          <Progress
                            value={poll.totalVotes > 0 ? (option.votes / poll.totalVotes) * 100 : 0}
                            className="h-2"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <div className="w-64 h-64 relative">
                        {/* This is a placeholder for a pie chart - in a real app, you'd use a charting library */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <PieChartIcon size={64} className="mx-auto text-gray-400" />
                            <p className="mt-2 text-sm text-gray-500">Pie chart visualization</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      Total Votes: {poll.totalVotes}
                    </div>
                    
                    {poll.endedAt && (
                      <div className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                        Ended: {new Date(poll.endedAt).toLocaleString()}
                      </div>
                    )}
                    
                    {poll.category && (
                      <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                        {poll.category}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // Render the templates list
  const renderTemplates = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Poll Templates</h3>
      
      {templates.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No templates available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map(template => (
            <Card key={template.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle>{template.title}</CardTitle>
                {template.description && (
                  <CardDescription>{template.description}</CardDescription>
                )}
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-gray-500">
                    {template.options.length} options
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {template.isQuiz && (
                      <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                        Quiz
                      </div>
                    )}
                    
                    {template.category && (
                      <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        {template.category}
                      </div>
                    )}
                    
                    {template.tags && template.tags.map(tag => (
                      <div key={tag} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button
                  type="button"
                  onClick={() => useTemplate(template.id)}
                  className="w-full"
                >
                  Use Template
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="polls-and-quizzes">
      <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="w-full">
          <TabsTrigger value="active" className="flex-1">
            <BarChart size={16} className="mr-2" />
            Active Polls
            {activePolls.length > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                {activePolls.length}
              </span>
            )}
          </TabsTrigger>
          
          <TabsTrigger value="results" className="flex-1">
            <BarChart2 size={16} className="mr-2" />
            Results
            {endedPolls.length > 0 && (
              <span className="ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                {endedPolls.length}
              </span>
            )}
          </TabsTrigger>
          
          {isHost && (
            <>
              <TabsTrigger value="create" className="flex-1">
                <Plus size={16} className="mr-2" />
                Create
              </TabsTrigger>
              
              <TabsTrigger value="templates" className="flex-1">
                <Layers size={16} className="mr-2" />
                Templates
              </TabsTrigger>
            </>
          )}
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="active">
            <ScrollArea className="h-[calc(100vh-200px)]">
              {renderActivePolls()}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="results">
            <ScrollArea className="h-[calc(100vh-200px)]">
              {renderPollResults()}
            </ScrollArea>
          </TabsContent>
          
          {isHost && (
            <>
              <TabsContent value="create">
                <ScrollArea className="h-[calc(100vh-200px)]">
                  <div className="space-y-6">
                    <div className="flex justify-center mb-4">
                      <Button 
                        onClick={() => navigate(meetingId ? `/create-poll/${meetingId}` : '/create-poll')}
                        className="w-full max-w-md"
                      >
                        <ExternalLink size={16} className="mr-2" />
                        Open Full Poll Creator
                      </Button>
                    </div>
                    <Separator className="my-4" />
                    {renderCreateForm()}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="templates">
                <ScrollArea className="h-[calc(100vh-200px)]">
                  {renderTemplates()}
                </ScrollArea>
              </TabsContent>
            </>
          )}
        </div>
      </Tabs>
    </div>
  );
};

export default EnhancedPollsAndQuizzes;