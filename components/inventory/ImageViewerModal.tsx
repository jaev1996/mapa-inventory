'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel';
import Image from 'next/image';

interface ImageViewerModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    images: string[];
}

export function ImageViewerModal({
    open,
    onOpenChange,
    title,
    images,
}: ImageViewerModalProps) {
    if (!images || images.length === 0) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="flex items-center justify-center p-6">
                    <Carousel className="w-full max-w-md">
                        <CarouselContent>
                            {images.map((src, index) => (
                                <CarouselItem key={index}>
                                    <div className="p-1 relative aspect-square w-full h-[300px] overflow-hidden rounded-lg border bg-gray-100 dark:bg-zinc-800">
                                        <Image
                                            src={src}
                                            alt={`Imagen ${index + 1} de ${title}`}
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        {images.length > 1 && (
                            <>
                                <CarouselPrevious />
                                <CarouselNext />
                            </>
                        )}
                    </Carousel>
                </div>
            </DialogContent>
        </Dialog>
    );
}
