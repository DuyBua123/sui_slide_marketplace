/**
 * Track deleted slides locally since blockchain deletion is async
 */

const DELETED_SLIDES_KEY = 'deleted_slides';

export const deleteLocalSlideRecord = (slideId) => {
    const deleted = getDeletedSlides();
    if (!deleted.includes(slideId)) {
        deleted.push(slideId);
        localStorage.setItem(DELETED_SLIDES_KEY, JSON.stringify(deleted));
        console.log('[DELETE] Marked as deleted locally:', slideId);
    }
};

export const getDeletedSlides = () => {
    try {
        return JSON.parse(localStorage.getItem(DELETED_SLIDES_KEY) || '[]');
    } catch {
        return [];
    }
};

export const isSlideDeleted = (slideId) => {
    return getDeletedSlides().includes(slideId);
};

export const clearDeletedSlides = () => {
    localStorage.removeItem(DELETED_SLIDES_KEY);
};
