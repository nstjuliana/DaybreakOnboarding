/**
 * @file useInsuranceUpload Hook
 * @description Custom hook for managing insurance card upload and OCR extraction.
 *
 * @see {@link _docs/phases/phase-3-insurance-matching.md}
 */

import { useState, useCallback } from 'react';
import {
  createInsuranceCard,
  uploadInsuranceCard,
  extractInsuranceData,
  updateInsuranceCard,
  verifyInsuranceCard,
} from '@/lib/api/insurance';
import type {
  InsuranceCard,
  PaymentMethod,
  InsuranceFormData,
} from '@/types/insurance';

/**
 * State shape for insurance upload flow
 */
interface InsuranceUploadState {
  /** Current step in the flow */
  step: 'select' | 'upload' | 'manual' | 'verify' | 'complete';
  /** The insurance card record */
  insuranceCard: InsuranceCard | null;
  /** Whether an operation is loading */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
}

/**
 * Return type for useInsuranceUpload hook
 */
interface UseInsuranceUploadReturn extends InsuranceUploadState {
  /** Select payment method and proceed */
  selectPaymentMethod: (method: PaymentMethod) => Promise<void>;
  /** Upload card images for OCR */
  uploadImages: (frontImage: File, backImage?: File) => Promise<void>;
  /** Switch to manual entry mode */
  switchToManual: () => void;
  /** Submit manual entry form */
  submitManualEntry: (data: InsuranceFormData) => Promise<void>;
  /** Verify and confirm extracted data */
  confirmVerification: () => Promise<void>;
  /** Update extracted data with corrections */
  updateData: (data: InsuranceFormData) => Promise<void>;
  /** Reset the flow */
  reset: () => void;
}

/**
 * useInsuranceUpload Hook
 *
 * @description Manages the full insurance card upload flow including
 *              payment method selection, image upload, OCR, and verification.
 *
 * @example
 * ```tsx
 * const {
 *   step,
 *   insuranceCard,
 *   isLoading,
 *   error,
 *   selectPaymentMethod,
 *   uploadImages,
 * } = useInsuranceUpload();
 * ```
 */
/**
 * Props for useInsuranceUpload hook
 */
interface UseInsuranceUploadOptions {
  /** Initial step to start from (default: 'select') */
  initialStep?: InsuranceUploadState['step'];
}

export function useInsuranceUpload(
  options: UseInsuranceUploadOptions = {}
): UseInsuranceUploadReturn {
  const { initialStep = 'select' } = options;
  
  const [state, setState] = useState<InsuranceUploadState>({
    step: initialStep,
    insuranceCard: null,
    isLoading: false,
    error: null,
  });

  /**
   * Handles payment method selection
   */
  const selectPaymentMethod = useCallback(async (method: PaymentMethod) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      if (method === 'insurance') {
        // User wants to use insurance - show upload options
        setState((prev) => ({
          ...prev,
          step: 'upload',
          isLoading: false,
        }));
      } else {
        // Self-pay or no insurance - create record and complete
        const card = await createInsuranceCard(method);
        setState((prev) => ({
          ...prev,
          step: 'complete',
          insuranceCard: card,
          isLoading: false,
        }));
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to save selection',
      }));
    }
  }, []);

  /**
   * Handles image upload and OCR extraction
   */
  const uploadImages = useCallback(
    async (frontImage: File, backImage?: File) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // Upload images and trigger extraction
        const card = await uploadInsuranceCard(frontImage, backImage);

        // Wait a moment for extraction to complete, then fetch result
        // In production, this would use polling or webhooks
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Trigger extraction
        const { insuranceCard: extractedCard } = await extractInsuranceData(
          card.id
        );

        setState((prev) => ({
          ...prev,
          step: 'verify',
          insuranceCard: extractedCard,
          isLoading: false,
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error:
            err instanceof Error ? err.message : 'Failed to process insurance card',
        }));
      }
    },
    []
  );

  /**
   * Switches to manual entry mode
   */
  const switchToManual = useCallback(() => {
    setState((prev) => ({
      ...prev,
      step: 'manual',
      error: null,
    }));
  }, []);

  /**
   * Handles manual form submission
   */
  const submitManualEntry = useCallback(async (data: InsuranceFormData) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Create insurance card with manual data
      const card = await createInsuranceCard('insurance');
      const updatedCard = await updateInsuranceCard(card.id, data);
      await verifyInsuranceCard(updatedCard.id);

      setState((prev) => ({
        ...prev,
        step: 'complete',
        insuranceCard: { ...updatedCard, verified: true },
        isLoading: false,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          err instanceof Error ? err.message : 'Failed to save insurance information',
      }));
    }
  }, []);

  /**
   * Confirms the verified data
   */
  const confirmVerification = useCallback(async () => {
    if (!state.insuranceCard) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const verifiedCard = await verifyInsuranceCard(state.insuranceCard.id);

      setState((prev) => ({
        ...prev,
        step: 'complete',
        insuranceCard: verifiedCard,
        isLoading: false,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to verify insurance',
      }));
    }
  }, [state.insuranceCard]);

  /**
   * Updates insurance data with corrections
   */
  const updateData = useCallback(
    async (data: InsuranceFormData) => {
      if (!state.insuranceCard) return;

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const updatedCard = await updateInsuranceCard(state.insuranceCard.id, data);

        setState((prev) => ({
          ...prev,
          insuranceCard: updatedCard,
          isLoading: false,
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error:
            err instanceof Error ? err.message : 'Failed to update insurance information',
        }));
      }
    },
    [state.insuranceCard]
  );

  /**
   * Resets the flow
   */
  const reset = useCallback(() => {
    setState({
      step: 'select',
      insuranceCard: null,
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    selectPaymentMethod,
    uploadImages,
    switchToManual,
    submitManualEntry,
    confirmVerification,
    updateData,
    reset,
  };
}


