import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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

interface Participant {
  id: string;
  name: string;
}

const RolePlayAssignment: React.FC = () => {
  const navigate = useNavigate();
  const { scenarioId, meetingId } = useParams<{ scenarioId: string, meetingId: string }>();
  
  const [scenario, setScenario] = useState<RolePlayScenario | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([
    { id: 'participant-1', name: 'John Doe' },
    { id: 'participant-2', name: 'Jane Smith' },
    { id: 'participant-3', name: 'Bob Johnson' },
    { id: 'participant-4', name: 'Alice Brown' }
  ]);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  
  // Load scenario from localStorage
  useEffect(() => {
    if (!scenarioId) return;
    
    try {
      const savedScenarios = localStorage.getItem('savedRolePlayScenarios');
      if (savedScenarios) {
        const scenarios = JSON.parse(savedScenarios);
        const foundScenario = scenarios.find((s: RolePlayScenario) => s.id === scenarioId);
        if (foundScenario) {
          setScenario(foundScenario);
        }
      }
    } catch (error) {
      console.error('Error loading scenario:', error);
    }
  }, [scenarioId]);
  
  // Assign a character to a participant
  const assignCharacter = (participantId: string, characterId: string) => {
    if (!scenario) return;
    
    const updatedScenario = {
      ...scenario,
      characters: scenario.characters.map(char => 
        char.id === characterId 
          ? { ...char, assignedTo: participantId } 
          : char
      )
    };
    
    setScenario(updatedScenario);
    setShowAssignmentModal(false);
    setSelectedCharacterId(null);
    
    // Update in localStorage
    try {
      const savedScenarios = localStorage.getItem('savedRolePlayScenarios');
      if (savedScenarios) {
        const scenarios = JSON.parse(savedScenarios);
        const updatedScenarios = scenarios.map((s: RolePlayScenario) => 
          s.id === scenarioId ? updatedScenario : s
        );
        localStorage.setItem('savedRolePlayScenarios', JSON.stringify(updatedScenarios));
      }
    } catch (error) {
      console.error('Error updating scenario:', error);
    }
  };
  
  // Randomly assign characters to participants
  const randomlyAssignCharacters = () => {
    if (!scenario) return;
    
    const availableParticipants = [...participants];
    
    const updatedScenario = {
      ...scenario,
      characters: scenario.characters.map(char => {
        if (availableParticipants.length === 0) {
          return char;
        }
        
        const randomIndex = Math.floor(Math.random() * availableParticipants.length);
        const participant = availableParticipants.splice(randomIndex, 1)[0];
        
        return { ...char, assignedTo: participant.id };
      })
    };
    
    setScenario(updatedScenario);
    
    // Update in localStorage
    try {
      const savedScenarios = localStorage.getItem('savedRolePlayScenarios');
      if (savedScenarios) {
        const scenarios = JSON.parse(savedScenarios);
        const updatedScenarios = scenarios.map((s: RolePlayScenario) => 
          s.id === scenarioId ? updatedScenario : s
        );
        localStorage.setItem('savedRolePlayScenarios', JSON.stringify(updatedScenarios));
      }
    } catch (error) {
      console.error('Error updating scenario:', error);
    }
  };
  
  // Start the scenario
  const startScenario = () => {
    if (!scenario) return;
    
    // Check if all characters are assigned
    const unassignedCharacters = scenario.characters.filter(char => !char.assignedTo);
    if (unassignedCharacters.length > 0) {
      if (!confirm('Some characters are not assigned. Do you want to continue anyway?')) {
        return;
      }
    }
    
    // Update scenario status
    const updatedScenario = {
      ...scenario,
      isActive: true
    };
    
    // Update in localStorage
    try {
      const savedScenarios = localStorage.getItem('savedRolePlayScenarios');
      if (savedScenarios) {
        const scenarios = JSON.parse(savedScenarios);
        const updatedScenarios = scenarios.map((s: RolePlayScenario) => 
          s.id === scenarioId ? updatedScenario : s
        );
        localStorage.setItem('savedRolePlayScenarios', JSON.stringify(updatedScenarios));
      }
    } catch (error) {
      console.error('Error updating scenario:', error);
    }
    
    // Navigate back to the meeting
    if (meetingId) {
      navigate(`/meeting-enhanced/${meetingId}`);
    } else {
      navigate('/dashboard');
    }
  };
  
  if (!scenario) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow p-4 bg-gray-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Scenario Not Found</CardTitle>
              <CardDescription>
                The requested role play scenario could not be found.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button 
                onClick={() => navigate(meetingId ? `/meeting-enhanced/${meetingId}` : '/dashboard')}
                className="w-full"
              >
                Return to Meeting
              </Button>
            </CardFooter>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }
  
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
            <h1 className="text-2xl font-bold">Role Play Assignment</h1>
          </div>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{scenario.title}</CardTitle>
              <CardDescription>
                Assign characters to participants for this role play scenario
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold">Description</h3>
                <p className="text-sm text-gray-600">{scenario.description}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold">Setting</h3>
                <p className="text-sm text-gray-600">{scenario.setting}</p>
              </div>
              
              {scenario.instructions && (
                <div>
                  <h3 className="text-sm font-semibold">Instructions</h3>
                  <p className="text-sm text-gray-600">{scenario.instructions}</p>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-semibold">Topics</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {scenario.topics.map(topic => (
                    <Badge key={topic} variant="outline">
                      {topic}
                    </Badge>
                  ))}
                </div>
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
            </CardContent>
          </Card>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Characters</h2>
              <Button
                type="button"
                onClick={randomlyAssignCharacters}
              >
                <Shuffle size={16} className="mr-2" />
                Randomly Assign Characters
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scenario.characters.map(character => {
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
                            {character.language || scenario.language}
                          </Badge>
                          
                          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                            {character.proficiency || scenario.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter>
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
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
          
          <div className="flex justify-end">
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
              onClick={startScenario}
            >
              Start Role Play
            </Button>
          </div>
        </div>
      </main>
      
      {/* Character Assignment Modal */}
      {showAssignmentModal && selectedCharacterId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              Assign Character: {scenario.characters.find(c => c.id === selectedCharacterId)?.name}
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
      
      <Footer />
    </div>
  );
};

export default RolePlayAssignment;