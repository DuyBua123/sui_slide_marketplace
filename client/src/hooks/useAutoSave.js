import { useEffect, useRef, useState } from 'react';
import { useSlideStore } from '../store/useSlideStore';

/**
 * Auto-save hook - listens to store changes and saves with debounce
 */
export const useAutoSave = (projectId, debounceMs = 2000) => {
    const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
    const [lastSavedAt, setLastSavedAt] = useState(null);
    const timeoutRef = useRef(null);
    const resetTimerRef = useRef(null);
    const lastSavedRef = useRef(null);

    const { slides, title } = useSlideStore();

    useEffect(() => {
        // Skip if no changes or initial load
        const currentData = JSON.stringify({ slides, title });
        if (currentData === lastSavedRef.current) return;

        // Set saving status
        setSaveStatus('saving');

        // Clear previous timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Debounced save
        timeoutRef.current = setTimeout(() => {
            try {
                const projectData = {
                    id: projectId || 'current_project',
                    title,
                    slides,
                    updatedAt: new Date().toISOString(),
                };

                // Save to localStorage
                localStorage.setItem('current_project', JSON.stringify(projectData));

                // Also update the slides list if there's a project ID
                if (projectId) {
                    const savedSlides = JSON.parse(localStorage.getItem('slides') || '[]');
                    const existingIndex = savedSlides.findIndex((s) => s.id === projectId);
                    const existingSlide = existingIndex >= 0 ? savedSlides[existingIndex] : null;

                    const slideEntry = {
                        id: projectId,
                        title,
                        slideCount: slides.length,
                        data: { title, slides },
                        thumbnail: existingSlide?.thumbnail || null, // Preserve existing thumbnail
                        createdAt: existingSlide ? existingSlide.createdAt : new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        // Preserve ownership fields
                        owner: existingSlide?.owner || 'local',
                        isOwner: existingSlide?.isOwner ?? true
                    };

                    if (existingIndex >= 0) {
                        savedSlides[existingIndex] = { ...existingSlide, ...slideEntry };
                    } else {
                        savedSlides.push(slideEntry);
                    }

                    localStorage.setItem('slides', JSON.stringify(savedSlides));
                }

                lastSavedRef.current = currentData;
                const now = new Date();
                setSaveStatus('saved');
                setLastSavedAt(now);

                // Reset to idle after 3 seconds
                if (resetTimerRef.current) {
                    clearTimeout(resetTimerRef.current);
                }
                resetTimerRef.current = setTimeout(() => {
                    setSaveStatus('idle');
                }, 3000);
            } catch (error) {
                console.error('Auto-save error:', error);
                setSaveStatus('error');
            }
        }, debounceMs);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (resetTimerRef.current) {
                clearTimeout(resetTimerRef.current);
            }
        };
    }, [slides, title, projectId, debounceMs]);

    return { saveStatus, lastSavedAt };
};

export default useAutoSave;
