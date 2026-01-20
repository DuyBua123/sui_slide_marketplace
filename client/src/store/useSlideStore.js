import { create } from 'zustand';
import { temporal } from 'zundo';
import { v4 as uuid } from 'uuid';

/**
 * Multi-Slide Zustand Store with Undo/Redo
 * 
 * Data Structure:
 * - slides: Array of slide objects with elements
 * - currentSlideIndex: Active slide index
 * - Supports temporal history for undo/redo
 */

// Default element properties by type
const defaultProps = {
  rect: {
    width: 150,
    height: 100,
    fill: '#3b82f6',
    stroke: '#1e40af',
    strokeWidth: 2,
    cornerRadius: 8,
  },
  circle: {
    radius: 50,
    fill: '#8b5cf6',
    stroke: '#6d28d9',
    strokeWidth: 2,
  },
  text: {
    text: 'Click to edit',
    fontSize: 24,
    fontFamily: 'Arial',
    fill: '#ffffff',
    width: 200,
    align: 'left',
  },
  line: {
    points: [0, 0, 150, 0],
    stroke: '#f59e0b',
    strokeWidth: 4,
  },
  image: {
    width: 200,
    height: 150,
  },
};

// Create a new empty slide
const createEmptySlide = () => ({
  id: uuid(),
  elements: [],
  background: '#1a1a2e',
  transition: 'fade', // none, fade, pushLeft, pushRight
});

// Initial state
const initialState = {
  slides: [createEmptySlide()],
  currentSlideIndex: 0,
  title: 'Untitled Presentation',
  selectedId: null,
  selectedIds: [], // For multi-select
  clipboard: null, // For copy/paste
};

// Create store with temporal middleware for undo/redo
export const useSlideStore = create(
  temporal(
    (set, get) => ({
      ...initialState,

      // ============ Slide Management ============

      getCurrentSlide: () => {
        const { slides, currentSlideIndex } = get();
        return slides[currentSlideIndex] || slides[0];
      },

      setCurrentSlideIndex: (index) => {
        const { slides } = get();
        if (index >= 0 && index < slides.length) {
          set({ currentSlideIndex: index, selectedId: null, selectedIds: [] });
        }
      },

      addSlide: (afterIndex = null) => {
        const { slides, currentSlideIndex } = get();
        const insertIndex = afterIndex !== null ? afterIndex + 1 : currentSlideIndex + 1;
        const newSlide = createEmptySlide();
        const newSlides = [...slides];
        newSlides.splice(insertIndex, 0, newSlide);
        set({ slides: newSlides, currentSlideIndex: insertIndex, selectedId: null });
      },

      deleteSlide: (index) => {
        const { slides, currentSlideIndex } = get();
        if (slides.length <= 1) return; // Keep at least one slide

        const newSlides = slides.filter((_, i) => i !== index);
        const newIndex = Math.min(currentSlideIndex, newSlides.length - 1);
        set({ slides: newSlides, currentSlideIndex: newIndex, selectedId: null });
      },

      duplicateSlide: (index) => {
        const { slides } = get();
        const slideToDuplicate = slides[index];
        const duplicatedSlide = {
          ...slideToDuplicate,
          id: uuid(),
          elements: slideToDuplicate.elements.map(el => ({ ...el, id: uuid() })),
        };
        const newSlides = [...slides];
        newSlides.splice(index + 1, 0, duplicatedSlide);
        set({ slides: newSlides, currentSlideIndex: index + 1 });
      },

      reorderSlides: (fromIndex, toIndex) => {
        const { slides } = get();
        const newSlides = [...slides];
        const [removed] = newSlides.splice(fromIndex, 1);
        newSlides.splice(toIndex, 0, removed);
        set({ slides: newSlides, currentSlideIndex: toIndex });
      },

      setSlideBackground: (color) => {
        const { slides, currentSlideIndex } = get();
        const newSlides = [...slides];
        newSlides[currentSlideIndex] = {
          ...newSlides[currentSlideIndex],
          background: color,
        };
        set({ slides: newSlides });
      },

      setSlideTransition: (transition) => {
        const { slides, currentSlideIndex } = get();
        const newSlides = [...slides];
        newSlides[currentSlideIndex] = {
          ...newSlides[currentSlideIndex],
          transition,
        };
        set({ slides: newSlides });
      },

      // ============ Element Management ============

      get elements() {
        const state = get();
        return state.slides[state.currentSlideIndex]?.elements || [];
      },

      addElement: (type, customProps = {}) => {
        const { slides, currentSlideIndex } = get();
        const newElement = {
          id: uuid(),
          type,
          x: customProps.x || 100,
          y: customProps.y || 100,
          rotation: 0,
          animation: null, // pulse, spin, wobble, bounce
          ...defaultProps[type],
          ...customProps,
        };

        const newSlides = [...slides];
        newSlides[currentSlideIndex] = {
          ...newSlides[currentSlideIndex],
          elements: [...newSlides[currentSlideIndex].elements, newElement],
        };
        set({ slides: newSlides, selectedId: newElement.id });
        return newElement;
      },

      updateElement: (id, updates) => {
        const { slides, currentSlideIndex } = get();
        const newSlides = [...slides];
        newSlides[currentSlideIndex] = {
          ...newSlides[currentSlideIndex],
          elements: newSlides[currentSlideIndex].elements.map((el) =>
            el.id === id ? { ...el, ...updates } : el
          ),
        };
        set({ slides: newSlides });
      },

      deleteElement: (id) => {
        const { slides, currentSlideIndex, selectedId, selectedIds } = get();
        const newSlides = [...slides];
        newSlides[currentSlideIndex] = {
          ...newSlides[currentSlideIndex],
          elements: newSlides[currentSlideIndex].elements.filter((el) => el.id !== id),
        };
        set({
          slides: newSlides,
          selectedId: selectedId === id ? null : selectedId,
          selectedIds: selectedIds.filter((sid) => sid !== id),
        });
      },

      deleteSelectedElements: () => {
        const { slides, currentSlideIndex, selectedId, selectedIds } = get();
        const idsToDelete = selectedIds.length > 0 ? selectedIds : (selectedId ? [selectedId] : []);
        if (idsToDelete.length === 0) return;

        const newSlides = [...slides];
        newSlides[currentSlideIndex] = {
          ...newSlides[currentSlideIndex],
          elements: newSlides[currentSlideIndex].elements.filter(
            (el) => !idsToDelete.includes(el.id)
          ),
        };
        set({ slides: newSlides, selectedId: null, selectedIds: [] });
      },

      // ============ Selection ============

      selectElement: (id) => set({ selectedId: id, selectedIds: [id] }),

      toggleSelectElement: (id) => {
        const { selectedIds } = get();
        if (selectedIds.includes(id)) {
          const newIds = selectedIds.filter(sid => sid !== id);
          set({ selectedIds: newIds, selectedId: newIds[0] || null });
        } else {
          set({ selectedIds: [...selectedIds, id], selectedId: id });
        }
      },

      selectMultiple: (ids) => set({ selectedIds: ids, selectedId: ids[0] || null }),

      clearSelection: () => set({ selectedId: null, selectedIds: [] }),

      // ============ Copy/Paste ============

      copySelected: () => {
        const { slides, currentSlideIndex, selectedId, selectedIds } = get();
        const elements = slides[currentSlideIndex].elements;
        const idsToCopy = selectedIds.length > 0 ? selectedIds : (selectedId ? [selectedId] : []);
        const elementsToCopy = elements.filter(el => idsToCopy.includes(el.id));
        if (elementsToCopy.length > 0) {
          set({ clipboard: elementsToCopy });
        }
      },

      paste: () => {
        const { slides, currentSlideIndex, clipboard } = get();
        if (!clipboard || clipboard.length === 0) return;

        const newElements = clipboard.map(el => ({
          ...el,
          id: uuid(),
          x: el.x + 20,
          y: el.y + 20,
        }));

        const newSlides = [...slides];
        newSlides[currentSlideIndex] = {
          ...newSlides[currentSlideIndex],
          elements: [...newSlides[currentSlideIndex].elements, ...newElements],
        };
        set({
          slides: newSlides,
          selectedIds: newElements.map(el => el.id),
          selectedId: newElements[0]?.id,
        });
      },

      // ============ Z-Index ============

      bringToFront: (id) => {
        const { slides, currentSlideIndex } = get();
        const elements = slides[currentSlideIndex].elements;
        const element = elements.find((el) => el.id === id);
        if (!element) return;

        const newSlides = [...slides];
        newSlides[currentSlideIndex] = {
          ...newSlides[currentSlideIndex],
          elements: [...elements.filter((el) => el.id !== id), element],
        };
        set({ slides: newSlides });
      },

      sendToBack: (id) => {
        const { slides, currentSlideIndex } = get();
        const elements = slides[currentSlideIndex].elements;
        const element = elements.find((el) => el.id === id);
        if (!element) return;

        const newSlides = [...slides];
        newSlides[currentSlideIndex] = {
          ...newSlides[currentSlideIndex],
          elements: [element, ...elements.filter((el) => el.id !== id)],
        };
        set({ slides: newSlides });
      },

      // ============ Nudge ============

      nudgeSelected: (dx, dy) => {
        const { slides, currentSlideIndex, selectedId, selectedIds } = get();
        const idsToNudge = selectedIds.length > 0 ? selectedIds : (selectedId ? [selectedId] : []);
        if (idsToNudge.length === 0) return;

        const newSlides = [...slides];
        newSlides[currentSlideIndex] = {
          ...newSlides[currentSlideIndex],
          elements: newSlides[currentSlideIndex].elements.map((el) =>
            idsToNudge.includes(el.id) ? { ...el, x: el.x + dx, y: el.y + dy } : el
          ),
        };
        set({ slides: newSlides });
      },

      // ============ Title ============

      setTitle: (title) => set({ title }),

      // ============ Serialization ============

      exportToJSON: () => {
        const { slides, title } = get();
        return { title, slides };
      },

      loadFromJSON: (data) => {
        if (data?.slides) {
          set({
            slides: data.slides,
            title: data.title || 'Untitled Presentation',
            currentSlideIndex: 0,
            selectedId: null,
            selectedIds: [],
          });
        } else if (data?.elements) {
          // Legacy format - single slide
          set({
            slides: [{ id: uuid(), elements: data.elements, background: '#1a1a2e', transition: 'fade' }],
            title: data.title || 'Untitled Slide',
            currentSlideIndex: 0,
            selectedId: null,
            selectedIds: [],
          });
        }
      },

      clearCanvas: () => {
        set({
          ...initialState,
          slides: [createEmptySlide()],
        });
      },
    }),
    {
      // Temporal middleware options
      limit: 50, // Keep 50 states in history
      equality: (a, b) => JSON.stringify(a) === JSON.stringify(b),
    }
  )
);

// Export undo/redo functions
export const useTemporalStore = () => useSlideStore.temporal;
