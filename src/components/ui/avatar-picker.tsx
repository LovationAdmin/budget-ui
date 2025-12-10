import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Camera } from "lucide-react";
import { MemberAvatar } from "../budget/MemberAvatar";

interface AvatarPickerProps {
    currentAvatar: string;
    name: string;
    onSelect: (avatar: string) => void;
}

// Pre-defined colorful gradients matching the app theme
const PRESETS = [
    "linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)",
    "linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)",
    "linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)",
    "linear-gradient(120deg, #f6d365 0%, #fda085 100%)",
    "linear-gradient(to top, #fcc5e4 0%, #fda34b 15%, #ff7882 35%, #c8699e 52%, #7046aa 71%, #0c1db8 87%, #020f75 100%)",
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", // Main theme
];

export function AvatarPicker({ currentAvatar, name, onSelect }: AvatarPickerProps) {
    const [open, setOpen] = useState(false);
    const [preview, setPreview] = useState(currentAvatar);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Resize logic to keep payload small
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 300; 
                const MAX_HEIGHT = 300;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                
                // Convert to Base64 (JPEG 80% quality)
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                setPreview(dataUrl);
                onSelect(dataUrl);
                setOpen(false);
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="relative group cursor-pointer inline-block">
                    <MemberAvatar 
                        name={name} 
                        image={preview} 
                        size="lg" 
                        className="h-24 w-24 ring-4 ring-background shadow-xl transition-transform group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="text-white h-8 w-8" />
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Choisir un avatar</DialogTitle>
                </DialogHeader>
                
                <Tabs defaultValue="presets" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="presets">Couleurs</TabsTrigger>
                        <TabsTrigger value="upload">Photo</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="presets" className="py-4">
                        <div className="grid grid-cols-3 gap-4 place-items-center">
                            {PRESETS.map((preset, idx) => (
                                <button
                                    key={idx}
                                    className="h-16 w-16 rounded-full shadow-sm hover:ring-2 hover:ring-primary hover:scale-110 transition-all"
                                    style={{ background: preset }}
                                    onClick={() => {
                                        setPreview(preset);
                                        onSelect(preset);
                                        setOpen(false);
                                    }}
                                />
                            ))}
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="upload" className="py-4 text-center">
                        <div 
                            className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                            <p className="text-sm font-medium">Cliquez pour importer</p>
                            <p className="text-xs text-muted-foreground mt-1">JPG, PNG (max 5MB)</p>
                            <input 
                                ref={fileInputRef}
                                type="file" 
                                accept="image/*" 
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}