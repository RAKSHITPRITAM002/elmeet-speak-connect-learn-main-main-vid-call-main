import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { 
  Pencil, 
  MousePointer, 
  Square, 
  Circle, 
  Type, 
  Eraser, 
  Trash2, 
  ChevronUp, 
  ChevronDown,
  Move,
  X,
  Save,
  ArrowRight,
  Highlighter,
  Undo,
  Redo,
  Download,
  Maximize,
  Minimize,
  PanelLeftClose,
  PanelRightClose
} from 'lucide-react';
import { AnnotationCanvasRef } from './AnnotationCanvas';

interface ZoomStyleAnnotationToolbarProps {
  isVisible: boolean;
  onToolChange: (tool: string) => void;
  onColorChange: (color: string) => void;
  onWidthChange: (width: number) => void;
  onClear: () => void;
  onSave: () => void;
  onClose: () => void;
  currentTool: string;
  currentColor: string;
  currentWidth: number;
  isScreenSharing?: boolean;
  canvasRef?: React.RefObject<AnnotationCanvasRef>;
  onUndo?: () => void;
  onRedo?: () => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
}

const ZoomStyleAnnotationToolbar: React.FC<ZoomStyleAnnotationToolbarProps> = ({
  isVisible,
  onToolChange,
  onColorChange,
  onWidthChange,
  onClear,
  onSave,
  onClose,
  currentTool,
  currentColor,
  currentWidth,
  isScreenSharing = false,
  canvasRef,
  onUndo,
  onRedo,
  onToggleFullscreen,
  isFullscreen = false
}) => {
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isVertical, setIsVertical] = useState(true);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Colors for the color picker
  const colors = [
    '#000000', // Black
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    '#FFFFFF', // White
    '#FFC32B', // Yellow-Orange
    '#EF4444', // Bright Red
    '#10B981', // Green
    '#3B82F6', // Blue
  ];

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    e.preventDefault();
  };

  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Handle window resize to ensure toolbar stays within viewport
  useEffect(() => {
    const handleResize = () => {
      if (toolbarRef.current) {
        const rect = toolbarRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Adjust position if toolbar is outside viewport
        let newX = position.x;
        let newY = position.y;

        if (rect.right > viewportWidth) {
          newX = viewportWidth - rect.width - 10;
        }
        if (rect.bottom > viewportHeight) {
          newY = viewportHeight - rect.height - 10;
        }

        if (newX !== position.x || newY !== position.y) {
          setPosition({ x: newX, y: newY });
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position]);

  // Handle undo action
  const handleUndo = () => {
    // Try to use the canvas ref method first
    if (canvasRef?.current) {
      canvasRef.current.undoAnnotation();
    }

    // Call parent callback if provided
    if (onUndo) {
      onUndo();
    }
  };

  // Handle redo action
  const handleRedo = () => {
    // Try to use the canvas ref method first
    if (canvasRef?.current) {
      canvasRef.current.redoAnnotation();
    }

    // Call parent callback if provided
    if (onRedo) {
      onRedo();
    }
  };

  // Handle save action
  const handleSave = () => {
    // Try to save the canvas content
    if (canvasRef?.current) {
      try {
        const dataUrl = canvasRef.current.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `annotation-${new Date().toISOString().slice(0, 10)}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Error saving annotation:', err);
      }
    }

    // Call parent callback if provided
    if (onSave) {
      onSave();
    }
  };

  // Toggle orientation between vertical and horizontal
  const toggleOrientation = () => {
    setIsVertical(!isVertical);
  };

  if (!isVisible) return null;

  return (
    <div 
      ref={toolbarRef}
      className={`fixed z-50 bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-700 ${
        isCollapsed 
          ? 'w-12 h-12' 
          : isVertical 
            ? 'w-16 h-auto' 
            : 'w-auto h-16'
      }`}
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        transition: isDragging ? 'none' : 'all 0.3s ease',
        opacity: 0.95,
      }}
    >
      {/* Toolbar header with drag handle */}
      <div 
        className={`flex ${isVertical ? 'justify-between p-2' : 'h-full items-center px-2'} cursor-move`}
        onMouseDown={handleMouseDown}
      >
        {isCollapsed ? (
          <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(false)} className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-600/50">
            <Pencil size={16} />
          </Button>
        ) : (
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(true)} className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-600/50">
              <X size={16} />
            </Button>
            
            {/* Toolbar content */}
            <div className={`${isVertical ? 'flex flex-col' : 'flex flex-row'} gap-1 p-1`}>
              {/* Drawing tools */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant={currentTool === 'pointer' ? "default" : "outline"} 
                      size="sm" 
                      className={`h-8 w-8 p-0 ${currentTool === 'pointer' ? 'bg-brand-teal text-white' : 'bg-gray-700/70 text-white hover:bg-gray-600/70'}`}
                      onClick={() => onToolChange('pointer')}
                    >
                      <MousePointer size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side={isVertical ? "right" : "bottom"}>
                    <p>Pointer</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant={currentTool === 'pen' ? "default" : "outline"} 
                      size="sm" 
                      className={`h-8 w-8 p-0 ${currentTool === 'pen' ? 'bg-brand-teal text-white' : 'bg-gray-700/70 text-white hover:bg-gray-600/70'}`}
                      onClick={() => onToolChange('pen')}
                    >
                      <Pencil size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side={isVertical ? "right" : "bottom"}>
                    <p>Pen</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant={currentTool === 'highlighter' ? "default" : "outline"} 
                      size="sm" 
                      className={`h-8 w-8 p-0 ${currentTool === 'highlighter' ? 'bg-brand-teal text-white' : 'bg-gray-700/70 text-white hover:bg-gray-600/70'}`}
                      onClick={() => onToolChange('highlighter')}
                    >
                      <Highlighter size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side={isVertical ? "right" : "bottom"}>
                    <p>Highlighter</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant={currentTool === 'arrow' ? "default" : "outline"} 
                      size="sm" 
                      className={`h-8 w-8 p-0 ${currentTool === 'arrow' ? 'bg-brand-teal text-white' : 'bg-gray-700/70 text-white hover:bg-gray-600/70'}`}
                      onClick={() => onToolChange('arrow')}
                    >
                      <ArrowRight size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side={isVertical ? "right" : "bottom"}>
                    <p>Arrow</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant={currentTool === 'rectangle' ? "default" : "outline"} 
                      size="sm" 
                      className={`h-8 w-8 p-0 ${currentTool === 'rectangle' ? 'bg-brand-teal text-white' : 'bg-gray-700/70 text-white hover:bg-gray-600/70'}`}
                      onClick={() => onToolChange('rectangle')}
                    >
                      <Square size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side={isVertical ? "right" : "bottom"}>
                    <p>Rectangle</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant={currentTool === 'circle' ? "default" : "outline"} 
                      size="sm" 
                      className={`h-8 w-8 p-0 ${currentTool === 'circle' ? 'bg-brand-teal text-white' : 'bg-gray-700/70 text-white hover:bg-gray-600/70'}`}
                      onClick={() => onToolChange('circle')}
                    >
                      <Circle size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side={isVertical ? "right" : "bottom"}>
                    <p>Circle</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant={currentTool === 'text' ? "default" : "outline"} 
                      size="sm" 
                      className={`h-8 w-8 p-0 ${currentTool === 'text' ? 'bg-brand-teal text-white' : 'bg-gray-700/70 text-white hover:bg-gray-600/70'}`}
                      onClick={() => onToolChange('text')}
                    >
                      <Type size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side={isVertical ? "right" : "bottom"}>
                    <p>Text</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant={currentTool === 'eraser' ? "default" : "outline"} 
                      size="sm" 
                      className={`h-8 w-8 p-0 ${currentTool === 'eraser' ? 'bg-brand-teal text-white' : 'bg-gray-700/70 text-white hover:bg-gray-600/70'}`}
                      onClick={() => onToolChange('eraser')}
                    >
                      <Eraser size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side={isVertical ? "right" : "bottom"}>
                    <p>Eraser</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Color picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0 bg-gray-700/70 text-white hover:bg-gray-600/70 relative"
                    style={{ overflow: 'hidden' }}
                  >
                    <div 
                      className="absolute inset-2 rounded-sm" 
                      style={{ backgroundColor: currentColor }}
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2 bg-gray-800 border-gray-700">
                  <div className="grid grid-cols-4 gap-1">
                    {colors.map(color => (
                      <button
                        key={color}
                        className={`w-12 h-12 rounded-md ${color === currentColor ? 'ring-2 ring-white' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => onColorChange(color)}
                      />
                    ))}
                  </div>
                  <div className="mt-2">
                    <label className="text-xs text-gray-400 mb-1 block">Stroke Width</label>
                    <Slider
                      value={[currentWidth]}
                      min={1}
                      max={20}
                      step={1}
                      onValueChange={(value) => onWidthChange(value[0])}
                      className="my-2"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>1px</span>
                      <span>{currentWidth}px</span>
                      <span>20px</span>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Action buttons */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 w-8 p-0 bg-gray-700/70 text-white hover:bg-gray-600/70"
                      onClick={handleUndo}
                    >
                      <Undo size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side={isVertical ? "right" : "bottom"}>
                    <p>Undo</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 w-8 p-0 bg-gray-700/70 text-white hover:bg-gray-600/70"
                      onClick={handleRedo}
                    >
                      <Redo size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side={isVertical ? "right" : "bottom"}>
                    <p>Redo</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 w-8 p-0 bg-gray-700/70 text-white hover:bg-gray-600/70"
                      onClick={onClear}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side={isVertical ? "right" : "bottom"}>
                    <p>Clear All</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 w-8 p-0 bg-gray-700/70 text-white hover:bg-gray-600/70"
                      onClick={handleSave}
                    >
                      <Download size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side={isVertical ? "right" : "bottom"}>
                    <p>Save Annotation</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Layout controls */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 w-8 p-0 bg-gray-700/70 text-white hover:bg-gray-600/70"
                      onClick={toggleOrientation}
                    >
                      {isVertical ? <PanelRightClose size={16} /> : <PanelLeftClose size={16} />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side={isVertical ? "right" : "bottom"}>
                    <p>{isVertical ? "Horizontal Layout" : "Vertical Layout"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {onToggleFullscreen && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 w-8 p-0 bg-gray-700/70 text-white hover:bg-gray-600/70"
                        onClick={onToggleFullscreen}
                      >
                        {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side={isVertical ? "right" : "bottom"}>
                      <p>{isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ZoomStyleAnnotationToolbar;