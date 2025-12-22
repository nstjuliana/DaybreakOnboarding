/**
 * @file InsuranceUpload Component
 * @description Upload interface for insurance card images with preview.
 *              Supports front and back card images for OCR extraction.
 *
 * @see {@link _docs/phases/phase-3-insurance-matching.md}
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Upload, X, Camera, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Props for InsuranceUpload component
 */
interface InsuranceUploadProps {
  /** Callback when images are selected */
  onUpload: (frontImage: File, backImage?: File) => void;
  /** Whether upload is in progress */
  isUploading?: boolean;
  /** Whether to disable the upload */
  disabled?: boolean;
}

/**
 * InsuranceUpload Component
 *
 * @description Provides drag-and-drop and click-to-upload interface
 *              for front and back insurance card images.
 *
 * @example
 * ```tsx
 * <InsuranceUpload
 *   onUpload={(front, back) => handleUpload(front, back)}
 *   isUploading={isUploading}
 * />
 * ```
 */
export function InsuranceUpload({
  onUpload,
  isUploading = false,
  disabled = false,
}: InsuranceUploadProps) {
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handles file selection for a card side
   */
  const handleFileSelect = useCallback(
    (file: File, side: 'front' | 'back') => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert('Image must be less than 10MB');
        return;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);

      if (side === 'front') {
        setFrontImage(file);
        setFrontPreview(previewUrl);
      } else {
        setBackImage(file);
        setBackPreview(previewUrl);
      }
    },
    []
  );

  /**
   * Handles file input change
   */
  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    side: 'front' | 'back'
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file, side);
    }
  };

  /**
   * Handles drag and drop
   */
  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>,
    side: 'front' | 'back'
  ) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file, side);
    }
  };

  /**
   * Removes an uploaded image
   */
  const handleRemove = (side: 'front' | 'back') => {
    if (side === 'front') {
      if (frontPreview) URL.revokeObjectURL(frontPreview);
      setFrontImage(null);
      setFrontPreview(null);
    } else {
      if (backPreview) URL.revokeObjectURL(backPreview);
      setBackImage(null);
      setBackPreview(null);
    }
  };

  /**
   * Triggers the upload with selected images
   */
  const handleUploadClick = () => {
    if (frontImage) {
      onUpload(frontImage, backImage || undefined);
    }
  };

  const isUploadReady = frontImage !== null;

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Upload photos of your insurance card. We&apos;ll automatically extract the
          information.
        </p>
      </div>

      {/* Upload areas */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Front of card */}
        <UploadArea
          label="Front of Card"
          required
          preview={frontPreview}
          inputRef={frontInputRef}
          disabled={disabled || isUploading}
          onInputChange={(e) => handleInputChange(e, 'front')}
          onDrop={(e) => handleDrop(e, 'front')}
          onRemove={() => handleRemove('front')}
        />

        {/* Back of card */}
        <UploadArea
          label="Back of Card"
          required={false}
          preview={backPreview}
          inputRef={backInputRef}
          disabled={disabled || isUploading}
          onInputChange={(e) => handleInputChange(e, 'back')}
          onDrop={(e) => handleDrop(e, 'back')}
          onRemove={() => handleRemove('back')}
        />
      </div>

      {/* Upload button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleUploadClick}
          disabled={!isUploadReady || isUploading || disabled}
          className="gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Extract Information
            </>
          )}
        </Button>
      </div>

      {/* Manual entry link */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Having trouble?{' '}
          <button
            type="button"
            className="text-primary-500 hover:underline font-medium"
            onClick={() => {
              /* Will be handled by parent */
            }}
          >
            Enter information manually
          </button>
        </p>
      </div>
    </div>
  );
}

/**
 * Individual upload area for a card side
 */
interface UploadAreaProps {
  label: string;
  required: boolean;
  preview: string | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  disabled: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onRemove: () => void;
}

function UploadArea({
  label,
  required,
  preview,
  inputRef,
  disabled,
  onInputChange,
  onDrop,
  onRemove,
}: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDropWithState = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(false);
    onDrop(e);
  };

  if (preview) {
    return (
      <div className="relative">
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
        <div className="relative rounded-lg overflow-hidden border border-neutral-200">
          <Image
            src={preview}
            alt={`${label} preview`}
            width={400}
            height={192}
            className="w-full h-48 object-cover"
          />
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className="absolute top-2 right-2 p-1 bg-neutral-900/70 rounded-full text-white hover:bg-neutral-900 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      <div
        role="button"
        tabIndex={0}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDropWithState}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            inputRef.current?.click();
          }
        }}
        className={cn(
          'relative h-48 rounded-lg border-2 border-dashed transition-colors cursor-pointer',
          'flex flex-col items-center justify-center gap-2',
          isDragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-neutral-300 hover:border-primary-400 hover:bg-neutral-50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={onInputChange}
          disabled={disabled}
          className="sr-only"
        />
        <div className="flex items-center gap-3 text-neutral-500">
          <Camera className="h-6 w-6" />
          <ImageIcon className="h-6 w-6" />
        </div>
        <p className="text-sm text-neutral-600 text-center px-4">
          Drag and drop or click to upload
        </p>
        <p className="text-xs text-neutral-400">PNG, JPG up to 10MB</p>
      </div>
    </div>
  );
}


