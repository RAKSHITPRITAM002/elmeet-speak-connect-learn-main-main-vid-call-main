import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  UserPlus, 
  Shuffle, 
  Clock, 
  MessageSquare, 
  Trash2, 
  Plus, 
  Save, 
  Download, 
  Upload, 
  Copy, 
  Edit, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Sparkles, 
  BookOpen, 
  Lightbulb, 
  Languages, 
  Mic, 
  Video,
  X,
  ExternalLink
} from 'lucide-react';

// Types
interface RolePlayCharacter {
  id: string;
  name: string;
  description: string;
  goals?: string;
  traits?: string[];
  language?: string;
  proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'native';
  assignedTo?: string; // Participant ID
  imageUrl?: string;
}

interface RolePlayScenario {
  id: string;
  title: string;
  description: string;
  setting: string;
  characters: RolePlayCharacter[];
  duration: number; // In minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  topics: string[];
  instructions?: string;
  isActive: boolean;
  createdAt: number;
  category: string;
  tags?: string[];
}

interface Participant {
  id: string;
  name: string;
}

interface EnhancedRolePlayProps {
  isHost: boolean;
  participants: Participant[];
  onAssignRole?: (participantId: string, characterId: string) => void;
  onStartScenario?: (scenarioId: string) => void;
  onEndScenario?: (scenarioId: string) => void;
  onSaveScenario?: (scenario: RolePlayScenario) => void;
  meetingId?: string;
}

const EnhancedRolePlay: React.FC<EnhancedRolePlayProps> = ({
  isHost,
  participants,
  onAssignRole,
  onStartScenario,
  onEndScenario,
  onSaveScenario,
  meetingId
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'scenarios' | 'active' | 'create' | 'templates'>('scenarios');
  const [scenarios, setScenarios] = useState<RolePlayScenario[]>([]);
  const [templates, setTemplates] = useState<RolePlayScenario[]>([]);
  const [activeScenario, setActiveScenario] = useState<RolePlayScenario | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [languageFilter, setLanguageFilter] = useState<string | null>(null);
  const [newScenario, setNewScenario] = useState<Omit<RolePlayScenario, 'id' | 'createdAt' | 'isActive'>>({
    title: '',
    description: '',
    setting: '',
    characters: [
      {
        id: `char-${Date.now()}-1`,
        name: '',
        description: '',
        language: 'English',
        proficiency: 'intermediate'
      }
    ],
    duration: 10,
    difficulty: 'intermediate',
    language: 'English',
    topics: [],
    category: 'Conversation'
  });
  const [isImporting, setIsImporting] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [newTopic, setNewTopic] = useState('');
  const [timerActive, setTimerActive] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);

  // Sample categories
  const categories = [
    'Conversation',
    'Business',
    'Travel',
    'Medical',
    'Academic',
    'Daily Life',
    'Interview',
    'Negotiation',
    'Customer Service',
    'Custom'
  ];

  // Sample languages
  const languages = [
    'English',
    'Spanish',
    'French',
    'German',
    'Italian',
    'Chinese',
    'Japanese',
    'Korean',
    'Russian',
    'Arabic',
    'Portuguese',
    'Hindi',
    'Other'
  ];

  // Sample templates
  const sampleTemplates: RolePlayScenario[] = [
    {
      id: 'template-1',
      title: 'Coffee Shop Conversation',
      description: 'A casual conversation between a customer and a barista at a coffee shop.',
      setting: 'A busy coffee shop in the morning.',
      characters: [
        {
          id: 'char-1-1',
          name: 'Customer',
          description: 'A regular customer who visits the coffee shop every morning.',
          goals: 'Order your usual coffee and make small talk with the barista.',
          traits: ['friendly', 'talkative'],
          language: 'English',
          proficiency: 'intermediate'
        },
        {
          id: 'char-1-2',
          name: 'Barista',
          description: 'A friendly barista who knows the regular customers.',
          goals: 'Take the customer\'s order and engage in conversation.',
          traits: ['attentive', 'cheerful'],
          language: 'English',
          proficiency: 'intermediate'
        }
      ],
      duration: 5,
      difficulty: 'beginner',
      language: 'English',
      topics: ['ordering', 'small talk', 'daily routine'],
      instructions: 'Focus on using everyday expressions and asking follow-up questions.',
      isActive: false,
      createdAt: Date.now(),
      category: 'Daily Life',
      tags: ['beginner', 'conversation', 'coffee shop']
    },
    {
      id: 'template-2',
      title: 'Job Interview',
      description: 'A job interview for a marketing position at a tech company.',
      setting: 'A modern office in a tech company.',
      characters: [
        {
          id: 'char-2-1',
          name: 'Interviewer',
          description: 'The marketing director who is looking for a new team member.',
          goals: 'Assess the candidate\'s qualifications and fit for the team.',
          traits: ['professional', 'analytical'],
          language: 'English',
          proficiency: 'advanced'
        },
        {
          id: 'char-2-2',
          name: 'Job Candidate',
          description: 'A marketing professional with 3 years of experience.',
          goals: 'Impress the interviewer and demonstrate your skills and experience.',
          traits: ['confident', 'articulate'],
          language: 'English',
          proficiency: 'advanced'
        }
      ],
      duration: 15,
      difficulty: 'advanced',
      language: 'English',
      topics: ['work experience', 'skills', 'career goals'],
      instructions: 'Use professional vocabulary and prepare to discuss your background and qualifications.',
      isActive: false,
      createdAt: Date.now(),
      category: 'Business',
      tags: ['advanced', 'interview', 'professional']
    },
    {
      id: 'template-3',
      title: 'Restaurant Reservation',
      description: 'Making a reservation at a restaurant over the phone.',
      setting: 'A phone call to a popular restaurant.',
      characters: [
        {
          id: 'char-3-1',
          name: 'Customer',
          description: 'A person who wants to make a dinner reservation for a special occasion.',
          goals: 'Make a reservation for a specific date, time, and number of people.',
          traits: ['polite', 'specific'],
          language: 'English',
          proficiency: 'intermediate'
        },
        {
          id: 'char-3-2',
          name: 'Restaurant Host',
          description: 'The person responsible for taking reservations at the restaurant.',
          goals: 'Take the reservation details and provide information about the restaurant.',
          traits: ['helpful', 'professional'],
          language: 'English',
          proficiency: 'intermediate'
        }
      ],
      duration: 5,
      difficulty: 'beginner',
      language: 'English',
      topics: ['reservations', 'dining', 'special occasions'],
      instructions: 'Practice asking for specific information and confirming details.',
      isActive: false,
      createdAt: Date.now(),
      category: 'Daily Life',
      tags: ['beginner', 'restaurant', 'phone call']
    }
  ];

  // Load templates and scenarios on component mount
  useEffect(() => {
    setTemplates(sampleTemplates);
    
    // Load any saved scenarios from localStorage
    try {
      const savedScenarios = localStorage.getItem('savedRolePlayScenarios');
      if (savedScenarios) {
        setScenarios(JSON.parse(savedScenarios));
      }
    } catch (error) {
      console.error('Error loading saved scenarios:', error);
    }
  }, []);

  // Save scenarios to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('savedRolePlayScenarios', JSON.stringify(scenarios));
    } catch (error) {
      console.error('Error saving scenarios:', error);
    }
  }, [scenarios]);

  // Timer for active scenario
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeScenario && timerActive && remainingTime !== null && remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime(prev => {
          if (prev === null || prev <= 0) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeScenario, timerActive, remainingTime]);

  // Add a new character to the scenario being created
  const addCharacter = () => {
    setNewScenario({
      ...newScenario,
      characters: [
        ...newScenario.characters,
        {
          id: `char-${Date.now()}-${newScenario.characters.length + 1}`,
          name: '',
          description: '',
          language: newScenario.language,
          proficiency: newScenario.difficulty as 'beginner' | 'intermediate' | 'advanced'
        }
      ]
    });
  };

  // Remove a character from the scenario being created
  const removeCharacter = (characterId: string) => {
    if (newScenario.characters.length <= 1) {
      alert('A scenario must have at least one character');
      return;
    }
    
    setNewScenario({
      ...newScenario,
      characters: newScenario.characters.filter(char => char.id !== characterId)
    });
  };

  // Update a character's property
  const updateCharacter = (characterId: string, field: keyof RolePlayCharacter, value: any) => {
    setNewScenario({
      ...newScenario,
      characters: newScenario.characters.map(char => 
        char.id === characterId ? { ...char, [field]: value } : char
      )
    });
  };

  // Add a topic to the scenario being created
  const addTopic = () => {
    if (!newTopic.trim()) return;
    
    if (!newScenario.topics.includes(newTopic)) {
      setNewScenario({
        ...newScenario,
        topics: [...newScenario.topics, newTopic]
      });
    }
    
    setNewTopic('');
  };

  // Remove a topic from the scenario being created
  const removeTopic = (topic: string) => {
    setNewScenario({
      ...newScenario,
      topics: newScenario.topics.filter(t => t !== topic)
    });
  };

  // Create a new scenario
  const createScenario = () => {
    // Validate scenario
    if (!newScenario.title.trim()) {
      alert('Please enter a scenario title');
      return;
    }
    
    if (!newScenario.setting.trim()) {
      alert('Please enter a scenario setting');
      return;
    }
    
    if (newScenario.characters.some(char => !char.name.trim() || !char.description.trim())) {
      alert('Please fill in all character details');
      return;
    }
    
    // Create new scenario object
    const scenario: RolePlayScenario = {
      ...newScenario,
      id: `scenario-${Date.now()}`,
      createdAt: Date.now(),
      isActive: false
    };
    
    // Add to scenarios list
    setScenarios([...scenarios, scenario]);
    
    // Reset form for next scenario
    setNewScenario({
      title: '',
      description: '',
      setting: '',
      characters: [
        {
          id: `char-${Date.now()}-1`,
          name: '',
          description: '',
          language: 'English',
          proficiency: 'intermediate'
        }
      ],
      duration: 10,
      difficulty: 'intermediate',
      language: 'English',
      topics: [],
      category: 'Conversation'
    });
    
    // Switch to scenarios tab
    setActiveTab('scenarios');
    
    // Save callback
    if (onSaveScenario) {
      onSaveScenario(scenario);
    }
  };

  // Start a scenario
  const startScenario = (scenarioId: string) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) return;
    
    // Update scenario status
    const updatedScenarios = scenarios.map(s => 
      s.id === scenarioId ? { ...s, isActive: true } : { ...s, isActive: false }
    );
    
    setScenarios(updatedScenarios);
    setActiveScenario(scenario);
    setRemainingTime(scenario.duration * 60); // Convert minutes to seconds
    setTimerActive(true);
    
    // Switch to active tab
    setActiveTab('active');
    
    // Start callback
    if (onStartScenario) {
      onStartScenario(scenarioId);
    }
  };

  // End a scenario
  const endScenario = () => {
    if (!activeScenario) return;
    
    // Update scenario status
    const updatedScenarios = scenarios.map(s => 
      s.id === activeScenario.id ? { ...s, isActive: false } : s
    );
    
    setScenarios(updatedScenarios);
    setActiveScenario(null);
    setRemainingTime(null);
    setTimerActive(false);
    
    // End callback
    if (onEndScenario && activeScenario) {
      onEndScenario(activeScenario.id);
    }
  };

  // Delete a scenario
  const deleteScenario = (scenarioId: string) => {
    if (confirm('Are you sure you want to delete this scenario?')) {
      setScenarios(scenarios.filter(s => s.id !== scenarioId));
      
      // If the active scenario is being deleted, end it
      if (activeScenario && activeScenario.id === scenarioId) {
        endScenario();
      }
    }
  };

  // Save a scenario as a template
  const saveAsTemplate = (scenarioId: string) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) return;
    
    // Create a new template from the scenario
    const template: RolePlayScenario = {
      ...scenario,
      id: `template-${Date.now()}`,
      isActive: false,
      createdAt: Date.now(),
      characters: scenario.characters.map(char => ({
        ...char,
        assignedTo: undefined
      }))
    };
    
    setTemplates([...templates, template]);
    alert('Scenario saved as template');
  };

  // Use a template to create a new scenario
  const useTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;
    
    setNewScenario({
      title: template.title,
      description: template.description,
      setting: template.setting,
      characters: template.characters.map(char => ({
        ...char,
        id: `char-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        assignedTo: undefined
      })),
      duration: template.duration,
      difficulty: template.difficulty,
      language: template.language,
      topics: [...template.topics],
      instructions: template.instructions,
      category: template.category,
      tags: template.tags ? [...template.tags] : []
    });
    
    setActiveTab('create');
  };

  // Import a scenario from text (JSON)
  const importScenario = () => {
    setImportError(null);
    
    try {
      // Parse JSON
      const parsed = JSON.parse(importText);
      
      // Validate the imported data
      if (!parsed.title || !parsed.setting || !Array.isArray(parsed.characters) || parsed.characters.length < 1) {
        throw new Error('Invalid scenario format');
      }
      
      // Create a new scenario from the imported data
      setNewScenario({
        title: parsed.title,
        description: parsed.description || '',
        setting: parsed.setting,
        characters: parsed.characters.map((char: any, index: number) => ({
          id: `char-${Date.now()}-${index}`,
          name: char.name || '',
          description: char.description || '',
          goals: char.goals,
          traits: char.traits,
          language: char.language || 'English',
          proficiency: char.proficiency || 'intermediate'
        })),
        duration: parsed.duration || 10,
        difficulty: parsed.difficulty || 'intermediate',
        language: parsed.language || 'English',
        topics: parsed.topics || [],
        instructions: parsed.instructions,
        category: parsed.category || 'Conversation',
        tags: parsed.tags
      });
      
      setIsImporting(false);
      setActiveTab('create');
    } catch (error) {
      setImportError('Failed to import scenario. Please check the format and try again.');
    }
  };

  // Export a scenario to JSON
  const exportScenario = (scenarioId: string) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) return;
    
    const exportData = {
      title: scenario.title,
      description: scenario.description,
      setting: scenario.setting,
      characters: scenario.characters.map(char => ({
        name: char.name,
        description: char.description,
        goals: char.goals,
        traits: char.traits,
        language: char.language,
        proficiency: char.proficiency
      })),
      duration: scenario.duration,
      difficulty: scenario.difficulty,
      language: scenario.language,
      topics: scenario.topics,
      instructions: scenario.instructions,
      category: scenario.category,
      tags: scenario.tags
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `scenario-${scenario.title.replace(/\s+/g, '-').toLowerCase()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Assign a character to a participant
  const assignCharacter = (participantId: string, characterId: string) => {
    if (!activeScenario) return;
    
    // Update the active scenario with the assignment
    const updatedScenario = {
      ...activeScenario,
      characters: activeScenario.characters.map(char => 
        char.id === characterId 
          ? { ...char, assignedTo: participantId } 
          : char
      )
    };
    
    // Update scenarios list
    const updatedScenarios = scenarios.map(s => 
      s.id === activeScenario.id ? updatedScenario : s
    );
    
    setScenarios(updatedScenarios);
    setActiveScenario(updatedScenario);
    
    // Close modal
    setShowAssignmentModal(false);
    setSelectedCharacterId(null);
    
    // Assignment callback
    if (onAssignRole) {
      onAssignRole(participantId, characterId);
    }
  };

  // Randomly assign characters to participants
  const randomlyAssignCharacters = () => {
    if (!activeScenario) return;
    
    const availableParticipants = [...participants];
    
    // Shuffle participants
    for (let i = availableParticipants.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableParticipants[i], availableParticipants[j]] = [availableParticipants[j], availableParticipants[i]];
    }
    
    // Assign characters
    const updatedCharacters = activeScenario.characters.map((char, index) => {
      if (index < availableParticipants.length) {
        return { ...char, assignedTo: availableParticipants[index].id };
      }
      return { ...char, assignedTo: undefined };
    });
    
    // Update active scenario
    const updatedScenario = {
      ...activeScenario,
      characters: updatedCharacters
    };
    
    // Update scenarios list
    const updatedScenarios = scenarios.map(s => 
      s.id === activeScenario.id ? updatedScenario : s
    );
    
    setScenarios(updatedScenarios);
    setActiveScenario(updatedScenario);
    
    // Assignment callbacks
    updatedCharacters.forEach(char => {
      if (char.assignedTo && onAssignRole) {
        onAssignRole(char.assignedTo, char.id);
      }
    });
  };

  // Format time (seconds) to MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Filter scenarios based on search query and filters
  const filteredScenarios = scenarios.filter(scenario => {
    const matchesSearch = searchQuery 
      ? scenario.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scenario.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (scenario.tags && scenario.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
      : true;
    
    const matchesCategory = categoryFilter
      ? scenario.category === categoryFilter
      : true;
    
    const matchesDifficulty = difficultyFilter
      ? scenario.difficulty === difficultyFilter
      : true;
    
    const matchesLanguage = languageFilter
      ? scenario.language === languageFilter
      : true;
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesLanguage;
  });

  // Render the scenarios list
  const renderScenarios = () => (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search scenarios..."
          className="w-full sm:w-64"
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
        
        <select
          value={difficultyFilter || ''}
          onChange={(e) => setDifficultyFilter(e.target.value || null)}
          className="p-2 border rounded-md"
        >
          <option value="">All Difficulties</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        
        <select
          value={languageFilter || ''}
          onChange={(e) => setLanguageFilter(e.target.value || null)}
          className="p-2 border rounded-md"
        >
          <option value="">All Languages</option>
          {languages.map(language => (
            <option key={language} value={language}>{language}</option>
          ))}
        </select>
      </div>
      
      {filteredScenarios.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No scenarios found</p>
          {isHost && (
            <Button
              type="button"
              onClick={() => setActiveTab('create')}
              className="mt-4"
            >
              Create a Scenario
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredScenarios.map(scenario => (
            <Card key={scenario.id} className={`overflow-hidden ${scenario.isActive ? 'border-green-500' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{scenario.title}</CardTitle>
                    <CardDescription>{scenario.description}</CardDescription>
                  </div>
                  
                  {scenario.isActive && (
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                      Active
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold">Setting</h4>
                    <p className="text-sm text-gray-600">{scenario.setting}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold">Characters ({scenario.characters.length})</h4>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {scenario.characters.map(char => (
                        <li key={char.id}>{char.name}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                      {scenario.duration} min
                    </Badge>
                    
                    <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                      {scenario.difficulty}
                    </Badge>
                    
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                      {scenario.language}
                    </Badge>
                    
                    <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
                      {scenario.category}
                    </Badge>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                <div className="flex justify-between w-full">
                  {isHost && (
                    <div className="flex space-x-2">
                      {!scenario.isActive ? (
                        <Button
                          type="button"
                          onClick={() => startScenario(scenario.id)}
                        >
                          <Play size={16} className="mr-2" />
                          Start
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={endScenario}
                        >
                          <Pause size={16} className="mr-2" />
                          End
                        </Button>
                      )}
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => deleteScenario(scenario.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  )}
                  {(
                    <div>
                      {scenario.isActive && (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                          In Progress
                        </Badge> 
                      )}
                    </div>
                  )}
                  
                  {isHost && (
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => saveAsTemplate(scenario.id)}
                      >
                        <Save size={16} className="mr-2" />
                        Save as Template
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => exportScenario(scenario.id)}
                      >
                        <Download size={16} />
                      </Button>
                    </div>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // Render the active scenario
  const renderActiveScenario = () => {
    if (!activeScenario) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No active scenario</p>
          <Button
            type="button"
            onClick={() => setActiveTab('scenarios')}
            className="mt-4"
          >
            Select a Scenario
          </Button>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">{activeScenario.title}</h3>
          
          <div className="flex items-center space-x-4">
            {remainingTime !== null && (
              <div className="flex items-center space-x-2">
                <Clock size={20} className={remainingTime < 60 ? 'text-red-500' : ''} />
                <span className={`text-lg font-mono ${remainingTime < 60 ? 'text-red-500' : ''}`}>
                  {formatTime(remainingTime)}
                </span>
              </div>
            )}
            
            {isHost && (
              <div className="flex space-x-2">
                {timerActive ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setTimerActive(false)}
                  >
                    <Pause size={16} className="mr-2" />
                    Pause
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setTimerActive(true)}
                  >
                    <Play size={16} className="mr-2" />
                    Resume
                  </Button>
                )}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRemainingTime(activeScenario.duration * 60)}
                >
                  <RotateCcw size={16} className="mr-2" />
                  Reset
                </Button>
                
                <Button
                  type="button"
                  variant="destructive"
                  onClick={endScenario}
                >
                  End Scenario
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Scenario Details</CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold">Description</h4>
                <p className="text-sm text-gray-600">{activeScenario.description}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold">Setting</h4>
                <p className="text-sm text-gray-600">{activeScenario.setting}</p>
              </div>
              
              {activeScenario.instructions && (
                <div>
                  <h4 className="text-sm font-semibold">Instructions</h4>
                  <p className="text-sm text-gray-600">{activeScenario.instructions}</p>
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-semibold">Topics</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {activeScenario.topics.map(topic => (
                    <Badge key={topic} variant="outline">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                  {activeScenario.duration} min
                </Badge>
                
                <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                  {activeScenario.difficulty}
                </Badge>
                
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  {activeScenario.language}
                </Badge>
                
                <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
                  {activeScenario.category}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Characters</h3>
          
          {isHost && (
            <div className="mb-4">
              <Button
                type="button"
                onClick={randomlyAssignCharacters}
              >
                <Shuffle size={16} className="mr-2" />
                Randomly Assign Characters
              </Button>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeScenario.characters.map(character => {
              const assignedParticipant = participants.find(p => p.id === character.assignedTo);
              
              return (
                <Card key={character.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{character.name}</CardTitle>
                      
                      {assignedParticipant ? (
                        <Badge className="bg-green-100 text-green-800 border-green-300">
                          Assigned to {assignedParticipant.name}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
                          Unassigned
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-semibold">Description</h4>
                        <p className="text-sm text-gray-600">{character.description}</p>
                      </div>
                      
                      {character.goals && (
                        <div>
                          <h4 className="text-sm font-semibold">Goals</h4>
                          <p className="text-sm text-gray-600">{character.goals}</p>
                        </div>
                      )}
                      
                      {character.traits && character.traits.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold">Traits</h4>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {character.traits.map(trait => (
                              <Badge key={trait} variant="outline" className="text-xs">
                                {trait}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                          {character.language || activeScenario.language}
                        </Badge>
                        
                        <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                          {character.proficiency || activeScenario.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    {isHost && (
                      <Button
                        type="button"
                        onClick={() => {
                          setSelectedCharacterId(character.id);
                          setShowAssignmentModal(true);
                        }}
                        className="w-full"
                      >
                        {assignedParticipant ? 'Reassign Character' : 'Assign Character'}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
        
        {/* Character Assignment Modal */}
        {showAssignmentModal && selectedCharacterId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">
                Assign Character: {activeScenario.characters.find(c => c.id === selectedCharacterId)?.name}
              </h3>
              
              <div className="space-y-4">
                {participants.length === 0 ? (
                  <p className="text-gray-500">No participants available</p>
                ) : (
                  <div className="space-y-2">
                    {participants.map(participant => (
                      <Button
                        key={participant.id}
                        type="button"
                        variant="outline"
                        onClick={() => assignCharacter(participant.id, selectedCharacterId)}
                        className="w-full justify-start"
                      >
                        <UserPlus size={16} className="mr-2" />
                        {participant.name}
                      </Button>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAssignmentModal(false);
                      setSelectedCharacterId(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render the scenario creation form
  const renderCreateForm = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="scenario-title">Scenario Title</Label>
          <Input
            id="scenario-title"
            value={newScenario.title}
            onChange={(e) => setNewScenario({ ...newScenario, title: e.target.value })}
            placeholder="Enter scenario title"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="scenario-description">Description</Label>
          <Textarea
            id="scenario-description"
            value={newScenario.description}
            onChange={(e) => setNewScenario({ ...newScenario, description: e.target.value })}
            placeholder="Enter scenario description"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="scenario-setting">Setting</Label>
          <Textarea
            id="scenario-setting"
            value={newScenario.setting}
            onChange={(e) => setNewScenario({ ...newScenario, setting: e.target.value })}
            placeholder="Describe the setting of the scenario"
            className="mt-1"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="scenario-duration">Duration (minutes)</Label>
            <Input
              id="scenario-duration"
              type="number"
              min="1"
              value={newScenario.duration}
              onChange={(e) => setNewScenario({ ...newScenario, duration: parseInt(e.target.value) || 10 })}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="scenario-difficulty">Difficulty</Label>
            <select
              id="scenario-difficulty"
              value={newScenario.difficulty}
              onChange={(e) => setNewScenario({ ...newScenario, difficulty: e.target.value as any })}
              className="w-full mt-1 p-2 border rounded-md"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          
          <div>
            <Label htmlFor="scenario-language">Language</Label>
            <select
              id="scenario-language"
              value={newScenario.language}
              onChange={(e) => setNewScenario({ ...newScenario, language: e.target.value })}
              className="w-full mt-1 p-2 border rounded-md"
            >
              {languages.map(language => (
                <option key={language} value={language}>{language}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div>
          <Label htmlFor="scenario-category">Category</Label>
          <select
            id="scenario-category"
            value={newScenario.category}
            onChange={(e) => setNewScenario({ ...newScenario, category: e.target.value })}
            className="w-full mt-1 p-2 border rounded-md"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <div>
          <Label htmlFor="scenario-instructions">Instructions (Optional)</Label>
          <Textarea
            id="scenario-instructions"
            value={newScenario.instructions || ''}
            onChange={(e) => setNewScenario({ ...newScenario, instructions: e.target.value })}
            placeholder="Provide instructions for participants"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label>Topics</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {newScenario.topics.map(topic => (
              <div key={topic} className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                {topic}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTopic(topic)}
                  className="h-4 w-4 ml-1"
                >
                  <X size={12} />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex mt-2">
            <Input
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="Add a topic"
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTopic();
                }
              }}
            />
            <Button
              type="button"
              onClick={addTopic}
              className="ml-2"
            >
              Add
            </Button>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <div className="flex justify-between items-center mb-4">
            <Label>Characters</Label>
            <Button
              type="button"
              variant="outline"
              onClick={addCharacter}
            >
              <Plus size={16} className="mr-2" />
              Add Character
            </Button>
          </div>
          
          <div className="space-y-6">
            {newScenario.characters.map((character, index) => (
              <Card key={character.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>Character {index + 1}</CardTitle>
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeCharacter(character.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor={`character-name-${character.id}`}>Name</Label>
                      <Input
                        id={`character-name-${character.id}`}
                        value={character.name}
                        onChange={(e) => updateCharacter(character.id, 'name', e.target.value)}
                        placeholder="Character name"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`character-description-${character.id}`}>Description</Label>
                      <Textarea
                        id={`character-description-${character.id}`}
                        value={character.description}
                        onChange={(e) => updateCharacter(character.id, 'description', e.target.value)}
                        placeholder="Describe the character"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`character-goals-${character.id}`}>Goals (Optional)</Label>
                      <Textarea
                        id={`character-goals-${character.id}`}
                        value={character.goals || ''}
                        onChange={(e) => updateCharacter(character.id, 'goals', e.target.value)}
                        placeholder="Character's goals in the scenario"
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`character-language-${character.id}`}>Language</Label>
                        <select
                          id={`character-language-${character.id}`}
                          value={character.language || newScenario.language}
                          onChange={(e) => updateCharacter(character.id, 'language', e.target.value)}
                          className="w-full mt-1 p-2 border rounded-md"
                        >
                          {languages.map(language => (
                            <option key={language} value={language}>{language}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <Label htmlFor={`character-proficiency-${character.id}`}>Proficiency</Label>
                        <select
                          id={`character-proficiency-${character.id}`}
                          value={character.proficiency || newScenario.difficulty}
                          onChange={(e) => updateCharacter(character.id, 'proficiency', e.target.value as any)}
                          className="w-full mt-1 p-2 border rounded-md"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                          <option value="native">Native</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
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
              setNewScenario({
                title: '',
                description: '',
                setting: '',
                characters: [
                  {
                    id: `char-${Date.now()}-1`,
                    name: '',
                    description: '',
                    language: 'English',
                    proficiency: 'intermediate'
                  }
                ],
                duration: 10,
                difficulty: 'intermediate',
                language: 'English',
                topics: [],
                category: 'Conversation'
              });
            }}
          >
            Reset
          </Button>
          
          <Button
            type="button"
            onClick={createScenario}
          >
            Create Scenario
          </Button>
        </div>
      </div>
      
      {/* Import Dialog */}
      {isImporting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Import Scenario</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="import-text">Paste JSON Format</Label>
                <Textarea
                  id="import-text"
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Paste your scenario data here..."
                  className="mt-1 h-40"
                />
                
                {importError && (
                  <p className="text-red-500 text-sm mt-1">{importError}</p>
                )}
                
                <div className="text-sm text-gray-500 mt-2">
                  <p>Format example:</p>
                  <p className="mt-1">{"{ \"title\": \"My Scenario\", \"setting\": \"A coffee shop\", \"characters\": [{ \"name\": \"Customer\", \"description\": \"A regular customer\" }] }"}</p>
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
                  onClick={importScenario}
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

  // Render the templates list
  const renderTemplates = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Scenario Templates</h3>
      
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
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <h4 className="text-sm font-semibold">Setting</h4>
                    <p className="text-sm text-gray-600">{template.setting}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold">Characters ({template.characters.length})</h4>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {template.characters.map(char => (
                        <li key={char.id}>{char.name}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                      {template.duration} min
                    </Badge>
                    
                    <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                      {template.difficulty}
                    </Badge>
                    
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                      {template.language}
                    </Badge>
                    
                    <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
                      {template.category}
                    </Badge>
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
    <div className="role-play">
      <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="w-full">
          <TabsTrigger value="scenarios" className="flex-1">
            <BookOpen size={16} className="mr-2" />
            Scenarios
          </TabsTrigger>
          
          <TabsTrigger value="active" className="flex-1">
            <Play size={16} className="mr-2" />
            Active
            {activeScenario && (
              <span className="ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                1
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
                <Copy size={16} className="mr-2" />
                Templates
              </TabsTrigger>
            </>
          )}
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="scenarios">
            <ScrollArea className="h-[calc(100vh-200px)]">
              {renderScenarios()}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="active">
            <ScrollArea className="h-[calc(100vh-200px)]">
              {renderActiveScenario()}
            </ScrollArea>
          </TabsContent>
          
          {isHost && (
            <>
              <TabsContent value="create">
                <ScrollArea className="h-[calc(100vh-200px)]">
                  {renderCreateForm()}
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

export default EnhancedRolePlay;