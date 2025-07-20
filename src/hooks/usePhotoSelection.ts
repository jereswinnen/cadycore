import { useState, useEffect, useCallback } from 'react';
import { PhotoWithAccess, PhotoSelection } from '@/types';
import { calculatePricePerPhoto, calculateTotalAmount, calculateSavings } from '@/lib/pricing';

interface UsePhotoSelectionProps {
  bib: string;
  photos: PhotoWithAccess[];
  initialSelections: PhotoSelection[];
}

export function usePhotoSelection({ bib, photos, initialSelections }: UsePhotoSelectionProps) {
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Initialize selections from props
  useEffect(() => {
    if (initialSelections && initialSelections.length > 0) {
      const selected = initialSelections
        .filter(selection => selection.is_selected)
        .map(selection => selection.photo_id);
      
      // Only update if the selection has actually changed
      setSelectedPhotoIds(prevSelected => {
        const selectedSet = new Set(selected);
        const prevSet = new Set(prevSelected);
        
        if (selectedSet.size !== prevSet.size) return selected;
        
        for (const id of selected) {
          if (!prevSet.has(id)) return selected;
        }
        
        return prevSelected;
      });
    }
  }, [initialSelections?.length, initialSelections?.map(s => `${s.photo_id}:${s.is_selected}`).join(',')]);

  // Calculate pricing information
  const totalSelected = selectedPhotoIds.length;
  const pricePerPhoto = calculatePricePerPhoto(totalSelected);
  const totalPrice = calculateTotalAmount(totalSelected);
  const savings = calculateSavings(totalSelected);

  // Toggle individual photo selection
  const togglePhoto = useCallback(async (photoId: string) => {
    const isCurrentlySelected = selectedPhotoIds.includes(photoId);
    const newSelectedIds = isCurrentlySelected
      ? selectedPhotoIds.filter(id => id !== photoId)
      : [...selectedPhotoIds, photoId];

    // Update server first, then update local state
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/photos/${bib}/selections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photo_id: photoId,
          is_selected: !isCurrentlySelected,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to update photo selection:', errorData);
        throw new Error(errorData.error || 'Failed to update photo selection');
      }

      // Only update local state if server update succeeded
      setSelectedPhotoIds(newSelectedIds);
    } catch (error) {
      console.error('Error updating photo selection:', error);
      // Don't update local state on error
    } finally {
      setIsUpdating(false);
    }
  }, [bib, selectedPhotoIds]);

  // Select all photos
  const selectAll = useCallback(async () => {
    const allPhotoIds = photos.map(photo => photo.id);
    setSelectedPhotoIds(allPhotoIds);

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/photos/${bib}/selections`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selected_photo_ids: allPhotoIds,
        }),
      });

      if (!response.ok) {
        // Revert on error
        setSelectedPhotoIds(selectedPhotoIds);
        console.error('Failed to select all photos');
      }
    } catch (error) {
      // Revert on error
      setSelectedPhotoIds(selectedPhotoIds);
      console.error('Error selecting all photos:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [bib, photos, selectedPhotoIds]);

  // Deselect all photos
  const deselectAll = useCallback(async () => {
    setSelectedPhotoIds([]);

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/photos/${bib}/selections`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selected_photo_ids: [],
        }),
      });

      if (!response.ok) {
        // Revert on error
        setSelectedPhotoIds(selectedPhotoIds);
        console.error('Failed to deselect all photos');
      }
    } catch (error) {
      // Revert on error
      setSelectedPhotoIds(selectedPhotoIds);
      console.error('Error deselecting all photos:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [bib, selectedPhotoIds]);

  // Check if a photo is selected
  const isPhotoSelected = useCallback((photoId: string) => {
    return selectedPhotoIds.includes(photoId);
  }, [selectedPhotoIds]);

  // Check if all photos are selected
  const allSelected = photos.length > 0 && selectedPhotoIds.length === photos.length;

  // Check if no photos are selected
  const noneSelected = selectedPhotoIds.length === 0;

  return {
    selectedPhotoIds,
    totalSelected,
    pricePerPhoto,
    totalPrice,
    savings,
    isUpdating,
    togglePhoto,
    selectAll,
    deselectAll,
    isPhotoSelected,
    allSelected,
    noneSelected,
  };
}