import { useEffect, useRef, useState } from 'react';
import { useSlideStore } from '../store/useSlideStore';

/**
 * Auto-save hook - listens to store changes and saves with debounce
 * Also handles loading auto-saved data and recovering from crashes
 */
export const useAutoSave = (projectId, debounceMs = 2000) => {
    const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
    const [lastSavedTime, setLastSavedTime] = useState(null);
    const timeoutRef = useRef(null);
    const lastSavedRef = useRef(null);
    const saveCountRef = useRef(0);
    const statusTimeoutRef = useRef(null);
    const isInitialMount = useRef(true);

    const { slides, title } = useSlideStore();

    // Load auto-saved data if available on mount
    useEffect(() => {
        try {
            const autoSavedProject = localStorage.getItem('current_project');
            if (autoSavedProject) {
                const data = JSON.parse(autoSavedProject);
                // Verify data integrity
                if (data.slides && Array.isArray(data.slides)) {
                    console.log('Auto-save detected - recovering previous session');
                    lastSavedRef.current = JSON.stringify({ slides: data.slides, title: data.title });
                }
            }
        } catch (error) {
            console.warn('Could not recover auto-save:', error);
        }
    }, []);

    // Auto-save on store changes with debounce
    useEffect(() => {
        // Skip if no changes or initial load
        const currentData = JSON.stringify({ slides, title });
        if (currentData === lastSavedRef.current) return;

        // Clear previous timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Show saving status (skip on initial mount)
        if (!isInitialMount.current) {
            setSaveStatus('saving');
        }
        isInitialMount.current = false;

        // Debounced save
        timeoutRef.current = setTimeout(() => {
            try {
                const now = new Date().toISOString();
                const projectData = {
                    id: projectId || 'current_project',
                    title,
                    slides,
                    updatedAt: now,
                    saveCount: saveCountRef.current + 1,
                };

                // Save current project to localStorage
                localStorage.setItem('current_project', JSON.stringify(projectData));
                saveCountRef.current += 1;

                // Also update the slides list if there's a project ID
                if (projectId) {
                    const savedSlides = JSON.parse(localStorage.getItem('slides') || '[]');
                    const existingIndex = savedSlides.findIndex((s) => s.id === projectId);

                    const slideEntry = {
                        id: projectId,
                        title,
                        slideCount: slides.length,
                        data: { title, slides },
                        thumbnail: null, // Will be updated on explicit save
                        createdAt: existingIndex >= 0 ? savedSlides[existingIndex].createdAt : now,
                        updatedAt: now,
                    };

                    if (existingIndex >= 0) {
                        savedSlides[existingIndex] = { ...savedSlides[existingIndex], ...slideEntry };
                    } else {
                        savedSlides.push(slideEntry);
                    }

                    localStorage.setItem('slides', JSON.stringify(savedSlides));
                }

                lastSavedRef.current = currentData;
                setLastSavedTime(now);
                setSaveStatus('saved');

                // Reset to idle after 2 seconds
                if (statusTimeoutRef.current) {
                    clearTimeout(statusTimeoutRef.current);
                }
                statusTimeoutRef.current = setTimeout(() => setSaveStatus('idle'), 2000);
            } catch (error) {
                console.error('Auto-save error:', error);
                setSaveStatus('error');
                if (statusTimeoutRef.current) {
                    clearTimeout(statusTimeoutRef.current);
                }
                statusTimeoutRef.current = setTimeout(() => setSaveStatus('idle'), 3000);
            }
        }, debounceMs);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [slides, title, projectId, debounceMs]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (statusTimeoutRef.current) {
                clearTimeout(statusTimeoutRef.current);
            }
        };
    }, []);

    // Function to force save immediately (for navigation)
    const forceSave = () => {
        try {
            const now = new Date().toISOString();
            
            // Generate ID for new slides if not exists
            const slideId = projectId || crypto.randomUUID();
            
            const projectData = {
                id: slideId,
                title,
                slides,
                updatedAt: now,
                saveCount: saveCountRef.current + 1,
            };

            // Save current project to localStorage
            localStorage.setItem('current_project', JSON.stringify(projectData));
            saveCountRef.current += 1;

            // Always update the slides list (create new entry if no projectId)
            const savedSlides = JSON.parse(localStorage.getItem('slides') || '[]');
            const existingIndex = savedSlides.findIndex((s) => s.id === slideId);

            const slideEntry = {
                id: slideId,
                title,
                slideCount: slides.length,
                data: { title, slides },
                thumbnail: null,
                createdAt: existingIndex >= 0 ? savedSlides[existingIndex].createdAt : now,
                updatedAt: now,
                owner: 'local', // Mark as local slide
            };

            if (existingIndex >= 0) {
                savedSlides[existingIndex] = { ...savedSlides[existingIndex], ...slideEntry };
            } else {
                savedSlides.push(slideEntry);
            }

            localStorage.setItem('slides', JSON.stringify(savedSlides));
            lastSavedRef.current = JSON.stringify({ slides, title });
            setLastSavedTime(now);
            return true;
        } catch (error) {
            console.error('Force save error:', error);
            return false;
        }
    };

    return { 
        saveStatus, 
        lastSavedTime,
        forceSave,
    };
};

export default useAutoSave;
