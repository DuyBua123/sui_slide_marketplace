import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

/**
 * Zustand store for managing slide canvas state
 * Handles elements (text, shapes, images) on the canvas
 */
export const useSlideStore = create((set, get) => ({
  // Current slide data
  slides: [],
  currentSlideIndex: 0,
  
  // Canvas elements for current slide
  elements: [],
  
  // Currently selected element ID
  selectedId: null,
  
  // Slide metadata
  title: 'Untitled Slide',
  
  // Actions
  setTitle: (title) => set({ title }),
  
  addElement: (type, props = {}) => {
    const baseProps = {
      id: uuidv4(),
      type,
      x: 100,
      y: 100,
      rotation: 0,
      ...props,
    };
    
    let newElement;
    switch (type) {
      case 'text':
        newElement = {
          ...baseProps,
          text: props.text || 'Double-click to edit',
          fontSize: props.fontSize || 24,
          fontFamily: props.fontFamily || 'Arial',
          fill: props.fill || '#ffffff',
          width: props.width || 200,
          align: props.align || 'left',
        };
        break;
      case 'rect':
        newElement = {
          ...baseProps,
          width: props.width || 150,
          height: props.height || 100,
          fill: props.fill || '#3b82f6',
          stroke: props.stroke || '#1d4ed8',
          strokeWidth: props.strokeWidth || 2,
          cornerRadius: props.cornerRadius || 8,
        };
        break;
      case 'circle':
        newElement = {
          ...baseProps,
          radius: props.radius || 60,
          fill: props.fill || '#10b981',
          stroke: props.stroke || '#059669',
          strokeWidth: props.strokeWidth || 2,
        };
        break;
      case 'line':
        newElement = {
          ...baseProps,
          points: props.points || [0, 0, 200, 0],
          stroke: props.stroke || '#ffffff',
          strokeWidth: props.strokeWidth || 3,
        };
        break;
      case 'image':
        newElement = {
          ...baseProps,
          src: props.src || '',
          width: props.width || 200,
          height: props.height || 150,
        };
        break;
      default:
        newElement = baseProps;
    }
    
    set((state) => ({
      elements: [...state.elements, newElement],
      selectedId: newElement.id,
    }));
    
    return newElement.id;
  },
  
  updateElement: (id, updates) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ),
    }));
  },
  
  deleteElement: (id) => {
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
    }));
  },
  
  selectElement: (id) => set({ selectedId: id }),
  
  clearSelection: () => set({ selectedId: null }),
  
  setElements: (elements) => set({ elements }),
  
  // Get selected element
  getSelectedElement: () => {
    const state = get();
    return state.elements.find((el) => el.id === state.selectedId);
  },
  
  // Z-index operations
  bringToFront: (id) => {
    set((state) => {
      const element = state.elements.find((el) => el.id === id);
      if (!element) return state;
      return {
        elements: [
          ...state.elements.filter((el) => el.id !== id),
          element,
        ],
      };
    });
  },
  
  sendToBack: (id) => {
    set((state) => {
      const element = state.elements.find((el) => el.id === id);
      if (!element) return state;
      return {
        elements: [
          element,
          ...state.elements.filter((el) => el.id !== id),
        ],
      };
    });
  },
  
  // Serialization
  exportToJSON: () => {
    const state = get();
    return {
      title: state.title,
      elements: state.elements,
      version: '1.0',
      createdAt: new Date().toISOString(),
    };
  },
  
  loadFromJSON: (json) => {
    if (json && json.elements) {
      set({
        title: json.title || 'Untitled Slide',
        elements: json.elements,
        selectedId: null,
      });
    }
  },
  
  // Clear canvas
  clearCanvas: () => set({ elements: [], selectedId: null }),
  
  // Duplicate element
  duplicateElement: (id) => {
    const state = get();
    const element = state.elements.find((el) => el.id === id);
    if (element) {
      const newElement = {
        ...element,
        id: uuidv4(),
        x: element.x + 20,
        y: element.y + 20,
      };
      set((state) => ({
        elements: [...state.elements, newElement],
        selectedId: newElement.id,
      }));
    }
  },
}));
