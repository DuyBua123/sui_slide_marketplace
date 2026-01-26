import { useSuiClient } from '@mysten/dapp-kit';
import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to fetch all published versions of a SlideObject
 * @param {string} slideId - The object ID of the slide
 * @returns {Object} { versions, isLoading, error, refetch }
 */
export const useSlideVersions = (slideId) => {
    const [versions, setVersions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const client = useSuiClient();

    const fetchVersions = useCallback(async () => {
        if (!slideId) return;
        setIsLoading(true);
        setError(null);

        try {
            const result = await client.getObject({
                id: slideId,
                options: { showContent: true },
            });

            if (result.data?.content?.dataType === 'moveObject') {
                const fields = result.data.content.fields;
                // 'versions' is a vector of SlideVersion { version, content_url, timestamp }
                if (fields.versions) {
                    const mappedVersions = fields.versions.map(v => ({
                        version: v.version,
                        contentUrl: v.content_url,
                        timestamp: parseInt(v.timestamp),
                    }));

                    // Sort by version descending (latest first)
                    setVersions(mappedVersions.sort((a, b) => b.version - a.version));
                }
            }
        } catch (err) {
            console.error('Fetch versions error:', err);
            setError(err.message || 'Failed to fetch slide versions');
        } finally {
            setIsLoading(false);
        }
    }, [slideId, client]);

    useEffect(() => {
        fetchVersions();
    }, [fetchVersions]);

    return { versions, isLoading, error, refetch: fetchVersions };
};
