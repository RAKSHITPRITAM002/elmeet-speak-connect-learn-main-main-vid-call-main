import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Trash2, 
  Plus, 
  ArrowLeft
} from 'lucide-react';
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

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

const CreateRolePlay: React.FC = () => {
  const navigate = useNavigate();
  const { meetingId } = useParams<{ meetingId: string }>();
  
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
  const [newTopic, setNewTopic] = useState('');
  const [newTrait, setNewTrait] = useState('');
  const [selectedCharacterIndex, setSelectedCharacterIndex] = useState(0);
  
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
    
    // Select the new character
    setSelectedCharacterIndex(newScenario.characters.length);
  };

  // Remove a character from the scenario being created
  const removeCharacter = (index: number) => {
    if (newScenario.characters.length <= 1) {
      alert('A scenario must have at least one character');
      return;
    }
    
    const updatedCharacters = newScenario.characters.filter((_, i) => i !== index);
    setNewScenario({
      ...newScenario,
      characters: updatedCharacters
    });
    
    // Adjust selected character index if needed
    if (selectedCharacterIndex >= updatedCharacters.length) {
      setSelectedCharacterIndex(updatedCharacters.length - 1);
    } else if (selectedCharacterIndex === index) {
      setSelectedCharacterIndex(0);
    }
  };

  // Update a character's property
  const updateCharacter = (index: number, field: keyof RolePlayCharacter, value: any) => {
    setNewScenario({
      ...newScenario,
      characters: newScenario.characters.map((char, i) => 
        i === index ? { ...char, [field]: value } : char
      )
    });
  };

  // Add a trait to a character
  const addTrait = (index: number) => {
    if (!newTrait.trim()) return;
    
    const character = newScenario.characters[index];
    if (!character) return;
    
    const traits = character.traits || [];
    if (traits.includes(newTrait)) {
      setNewTrait('');
      return;
    }
    
    updateCharacter(index, 'traits', [...traits, newTrait]);
    setNewTrait('');
  };

  // Remove a trait from a character
  const removeTrait = (index: number, trait: string) => {
    const character = newScenario.characters[index];
    if (!character || !character.traits) return;
    
    updateCharacter(index, 'traits', character.traits.filter(t => t !== trait));
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
    
    // Save to localStorage
    try {
      const savedScenarios = localStorage.getItem('savedRolePlayScenarios');
      const scenarios = savedScenarios ? JSON.parse(savedScenarios) : [];
      scenarios.push(scenario);
      localStorage.setItem('savedRolePlayScenarios', JSON.stringify(scenarios));
      
      alert('Role play scenario created successfully!');
      
      // Navigate to the assignment page
      if (meetingId) {
        navigate(`/role-play-assignment/${scenario.id}/${meetingId}`);
      } else {
        navigate(`/role-play-assignment/${scenario.id}`);
      }
    } catch (error) {
      console.error('Error saving scenario:', error);
      alert('Failed to save scenario. Please try again.');
    }
  };
  
  const selectedCharacter = newScenario.characters[selectedCharacterIndex];
  
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
            <h1 className="text-2xl font-bold">Create Role Play Scenario</h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column - Scenario Details */}
            <div className="md:col-span-2">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Scenario Details</CardTitle>
                  <CardDescription>
                    Create a new role play scenario for language practice
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="scenario-title">Title</Label>
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
                      placeholder="Describe the scenario"
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
                  
                  <div className="grid grid-cols-2 gap-4">
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
                      <Label htmlFor="scenario-category">Category</Label>
                      <select
                        id="scenario-category"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                        value={newScenario.category}
                        onChange={(e) => setNewScenario({ ...newScenario, category: e.target.value })}
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="scenario-difficulty">Difficulty</Label>
                      <select
                        id="scenario-difficulty"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                        value={newScenario.difficulty}
                        onChange={(e) => setNewScenario({ ...newScenario, difficulty: e.target.value as 'beginner' | 'intermediate' | 'advanced' })}
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
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                        value={newScenario.language}
                        onChange={(e) => setNewScenario({ ...newScenario, language: e.target.value })}
                      >
                        {languages.map(language => (
                          <option key={language} value={language}>{language}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Topics</Label>
                    <div className="flex mt-1">
                      <Input
                        placeholder="Add a topic"
                        value={newTopic}
                        onChange={(e) => setNewTopic(e.target.value)}
                        className="flex-grow"
                      />
                      <Button
                        type="button"
                        onClick={addTopic}
                        className="ml-2"
                      >
                        Add
                      </Button>
                    </div>
                    
                    {newScenario.topics.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {newScenario.topics.map(topic => (
                          <div 
                            key={topic} 
                            className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm flex items-center"
                          >
                            {topic}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 ml-1"
                              onClick={() => removeTopic(topic)}
                            >
                              <Trash2 size={12} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Character Details</CardTitle>
                  <CardDescription>
                    Define the character for this role play scenario
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="character-name">Name</Label>
                    <Input
                      id="character-name"
                      value={selectedCharacter.name}
                      onChange={(e) => updateCharacter(selectedCharacterIndex, 'name', e.target.value)}
                      placeholder="Enter character name"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="character-description">Description</Label>
                    <Textarea
                      id="character-description"
                      value={selectedCharacter.description}
                      onChange={(e) => updateCharacter(selectedCharacterIndex, 'description', e.target.value)}
                      placeholder="Describe the character"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="character-goals">Goals (Optional)</Label>
                    <Textarea
                      id="character-goals"
                      value={selectedCharacter.goals || ''}
                      onChange={(e) => updateCharacter(selectedCharacterIndex, 'goals', e.target.value)}
                      placeholder="What are this character's goals in the scenario?"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label>Traits</Label>
                    <div className="flex mt-1">
                      <Input
                        placeholder="Add a trait"
                        value={newTrait}
                        onChange={(e) => setNewTrait(e.target.value)}
                        className="flex-grow"
                      />
                      <Button
                        type="button"
                        onClick={() => addTrait(selectedCharacterIndex)}
                        className="ml-2"
                      >
                        Add
                      </Button>
                    </div>
                    
                    {selectedCharacter.traits && selectedCharacter.traits.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedCharacter.traits.map(trait => (
                          <div 
                            key={trait} 
                            className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm flex items-center"
                          >
                            {trait}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 ml-1"
                              onClick={() => removeTrait(selectedCharacterIndex, trait)}
                            >
                              <Trash2 size={12} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="character-language">Language</Label>
                      <select
                        id="character-language"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                        value={selectedCharacter.language || newScenario.language}
                        onChange={(e) => updateCharacter(selectedCharacterIndex, 'language', e.target.value)}
                      >
                        {languages.map(language => (
                          <option key={language} value={language}>{language}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="character-proficiency">Proficiency</Label>
                      <select
                        id="character-proficiency"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                        value={selectedCharacter.proficiency || newScenario.difficulty}
                        onChange={(e) => updateCharacter(selectedCharacterIndex, 'proficiency', e.target.value as 'beginner' | 'intermediate' | 'advanced' | 'native')}
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="native">Native</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Right Column - Character List */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Characters</CardTitle>
                  <CardDescription>
                    Manage characters for this scenario
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <Button
                    type="button"
                    onClick={addCharacter}
                    className="w-full"
                  >
                    <Plus size={16} className="mr-2" />
                    Add Character
                  </Button>
                  
                  <div className="space-y-2">
                    {newScenario.characters.map((character, index) => (
                      <div 
                        key={character.id} 
                        className={`p-3 rounded-md flex justify-between items-center cursor-pointer ${
                          index === selectedCharacterIndex 
                            ? 'bg-blue-100 border border-blue-300' 
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                        onClick={() => setSelectedCharacterIndex(index)}
                      >
                        <div>
                          <div className="font-medium">
                            {character.name || `Character ${index + 1}`}
                          </div>
                          {character.language && character.proficiency && (
                            <div className="text-xs text-gray-500">
                              {character.language} ({character.proficiency})
                            </div>
                          )}
                        </div>
                        
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCharacter(index);
                          }}
                          className="h-8 w-8"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
                
                <CardFooter>
                  <div className="text-sm text-gray-500">
                    {newScenario.characters.length} character(s)
                  </div>
                </CardFooter>
              </Card>
              
              <div className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(meetingId ? `/meeting-enhanced/${meetingId}` : '/dashboard')}
                  className="mr-2"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={createScenario}
                >
                  Create Scenario
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreateRolePlay;