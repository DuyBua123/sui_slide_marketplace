import { useEffect, useState } from 'react';
import { useSlideStore } from '../store/useSlideStore';

/**
 * Auto-recovery hook - detects crashes and recovers from auto-saved state
 * Provides data recovery UI to user
 */
export const useAutoRecover = () => {
    const [hasRecovery, setHasRecovery] = useState(false);
    const [recoveryData, setRecoveryData] = useState(null);
    const { loadFromJSON } = useSlideStore();

    useEffect(() => {
        // Check if there's a recovery state
        try {
            const autoSaved = localStorage.getItem('current_project');
            
            if (autoSaved) {
                const data = JSON.parse(autoSaved);
                
                // Check if the data is valid and not already loaded
                if (data.slides && Array.isArray(data.slides) && data.slides.length > 0) {
                    // Only show recovery if there's data with recent update
                    const lastUpdate = new Date(data.updatedAt);
                    const now = new Date();
                    const minutesAgo = (now - lastUpdate) / (1000 * 60);
                    
                    // Show recovery for data updated within last hour
                    if (minutesAgo < 60) {
                        setRecoveryData(data);
                        setHasRecovery(true);
                    }
                }
            }
        } catch (error) {
            console.warn('Auto-recovery check failed:', error);
        }
    }, []);

    const recover = () => {
        if (recoveryData) {
            try {
                loadFromJSON(recoveryData);
                setHasRecovery(false);
                console.log('Data recovery successful');
            } catch (error) {
                console.error('Recovery failed:', error);
            }
        }
    };

    const dismiss = () => {
        setHasRecovery(false);
    };

    const clearRecovery = () => {
        try {
            localStorage.removeItem('current_project');
            setHasRecovery(false);
            setRecoveryData(null);
        } catch (error) {
            console.error('Failed to clear recovery data:', error);
        }
    };

    return {
        hasRecovery,
        recoveryData,
        recover,
        dismiss,
        clearRecovery,
    };
};

export default useAutoRecover;
