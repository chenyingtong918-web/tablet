/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Image as ImageIcon,
  X,
  ArrowRight,
  Loader2,
} from 'lucide-react';

type Message = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  imageUrl?: string;
  isProcessing?: boolean;
};

const DEMO_IMAGES: Record<string, string> = {
  'Medium': '/medium.png',
  'Expanded': '/expanded.png',
  'Large': '/large.png',
  'Extra Large': '/extra-large.png',
};

const TABLET_BREAKPOINTS = [
  { 
    category: 'Medium',
    range: '600px ~ 839px',
    devices: 'Amazon Fire HD 8, Galaxy Tab A7 Lite, iPad Air (3rd gen), iPad Mini (5th - 6th gen), iPad Air (4th-5th gen)'
  },
  { 
    category: 'Expanded',
    range: '840px ~ 1199px',
    devices: 'iPad (9th Gen), iPad Pro 11", Galaxy Tab S8'
  },
  { 
    category: 'Large',
    range: '1200px ~ 1599px',
    devices: 'iPad Pro 12.9", Galaxy Tab S8 Ultra'
  },
  { 
    category: 'Extra Large',
    range: '1600px+',
    devices: 'Surface Studio'
  }
];

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [promptValue, setPromptValue] = useState('');
  const [isAdapting, setIsAdapting] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(TABLET_BREAKPOINTS[0].category);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isAdapting]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setSelectedImage(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAdapt = () => {
    if (!selectedImage) return;

    // 1. Add user message
    const userMsgId = Date.now().toString();
    const promptText = promptValue.trim() || 'Please adapt this design to tablets.';
    
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: 'user', text: promptText, imageUrl: selectedImage },
    ]);

    // 2. Clear inputs & prepare transition
    const imageToAdapt = selectedImage;
    setSelectedImage(null);
    setPromptValue('');
    setIsAdapting(true);
    setResultImage(null);

    // 3. Add loading assistant message
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: 'loading', role: 'assistant', text: 'Analyzing layers and recalculating dimensions for target layouts...', isProcessing: true },
      ]);
    }, 400);

    // 4. Simulate adaptation processing (2.5 seconds)
    setTimeout(() => {
      setMessages((prev) => {
        const newArr = [...prev];
        const loadingIdx = newArr.findIndex((m) => m.id === 'loading');
        if (loadingIdx > -1) {
          newArr[loadingIdx] = {
            id: 'done',
            role: 'assistant',
            text: 'Adaptation complete. The canvas has been updated with the responsive layouts.',
            isProcessing: false,
          };
        }
        return newArr;
      });
      setResultImage(imageToAdapt);
      setIsAdapting(false);
    }, 3000);
  };

  return (
    <div className="flex h-screen w-full bg-white text-black font-sans overflow-hidden">
      {/* LEFT PANEL: Dialogue Form */}
      <div className="w-[380px] shrink-0 border-r border-black flex flex-col z-20 bg-gray-50">
        {/* Chat / Input Layout */}
        <main ref={scrollRef} className={`flex-1 overflow-y-auto p-8 flex flex-col gap-8 scroll-smooth bg-gray-50 ${messages.length === 0 ? 'hidden' : ''}`}>
          <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4"
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 shrink-0 flex items-center justify-center border border-black ${
                      msg.role === 'assistant'
                        ? 'bg-white text-black'
                        : 'bg-black text-white'
                    }`}
                  >
                    {msg.role === 'assistant' ? <span className="font-bold font-mono">A</span> : <span className="text-[11px] font-bold font-mono">U</span>}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1 space-y-3">
                    <p className="text-sm leading-relaxed text-black whitespace-pre-wrap">
                      {msg.text}
                    </p>
                    
                    {msg.isProcessing && (
                      <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold tracking-widest uppercase mt-2">
                         <Loader2 size={12} className="animate-spin" />
                         PROCESSING
                      </div>
                    )}

                    {/* Uploaded Image Preview */}
                    {msg.imageUrl && (
                      <div className="mt-3 relative border border-black max-w-[200px] bg-white p-2">
                        <img src={msg.imageUrl} alt="Uploaded draft" className="w-full h-auto object-cover border border-gray-200" />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
        </main>

        {/* Prompt / Upload Input Area */}
        <footer className={messages.length === 0 ? "w-full max-w-[316px] mx-auto my-auto pb-[10vh] shrink-0" : "w-full p-8 pt-0 shrink-0 bg-gray-50"}>
          {messages.length === 0 && (
            <>
              <h1 className="text-3xl font-bold mb-2">Hi,</h1>
              <p className="text-sm leading-relaxed text-black mb-6">
                Upload a mobile design draft, and I will strictly adapt it into four different tablet dimensions.
              </p>
            </>
          )}
          <div className="relative border-2 border-black bg-white shadow-sm focus-within:ring-2 focus-within:ring-black transition-all p-3 flex flex-col">
              
              {/* Inline Attachment Preview */}
              <AnimatePresence>
                {selectedImage && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 12 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="relative self-start group"
                  >
                    <div className="p-1 border border-black bg-gray-50 pb-0 shrink-0">
                      <img src={selectedImage} alt="Draft" className="h-16 w-auto border border-gray-200 object-cover" />
                    </div>
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="absolute -top-2 -right-2 bg-white text-black border border-black p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
                    >
                      <X size={12} strokeWidth={3} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <textarea
                value={promptValue}
                onChange={(e) => setPromptValue(e.target.value)}
                placeholder="ADD AN INSTRUCTION..."
                className="w-full resize-none outline-none text-[12px] bg-transparent placeholder:text-gray-400 min-h-[44px] pb-2 font-mono uppercase tracking-wide"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAdapt();
                  }
                }}
              />

              <div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-1">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-black border border-transparent hover:border-black transition-colors flex items-center justify-center shrink-0 bg-gray-50 text-[10px] font-bold tracking-widest gap-2 uppercase"
                  title="Attach mobile layout image"
                >
                  <div className="border border-black p-1 bg-white">
                    <ImageIcon size={14} strokeWidth={2} />
                  </div>
                  <span>ATTACH TICKET</span>
                </button>

                <button
                  onClick={handleAdapt}
                  disabled={!selectedImage || isAdapting}
                  className="bg-black text-white px-5 py-2 text-[10px] font-bold tracking-[0.2em] uppercase flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-900 transition-colors"
                >
                  ADAPT <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </footer>
      </div>

      {/* RIGHT PANEL: Canvas Area */}
      <div className="flex-1 bg-white relative flex flex-col h-full overflow-hidden transition-all duration-700">
        
        {/* Tablet Breakpoints Top Bar */}
        <AnimatePresence>
          {resultImage && !isAdapting && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-none border-b border-black bg-gray-50 flex overflow-x-auto custom-scrollbar z-30"
            >
              {TABLET_BREAKPOINTS.map((bp) => (
                <button 
                  key={bp.category} 
                  onClick={() => setSelectedCategory(bp.category)}
                  className={`px-8 py-4 border-r border-black transition-colors min-w-[200px] text-left hover:bg-gray-100 ${
                    selectedCategory === bp.category ? 'bg-white shadow-[inset_0_-2px_0_0_black]' : 'text-gray-500'
                  }`}
                >
                  <span className="text-xs font-bold tracking-widest uppercase">{bp.category}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 relative overflow-hidden">
          {/* Placeholder Empty State */}
          <AnimatePresence>
            {!resultImage && !isAdapting && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center z-10 text-gray-500 bg-white"
              >
                <div className="aspect-[9/16] w-[200px] border-2 border-dashed border-black flex flex-col items-center justify-center bg-gray-50 p-4 relative group opacity-50">
                  <div className="text-center">
                    <div className="mb-2 text-2xl font-light">+</div>
                    <p className="text-[10px] font-bold tracking-tight uppercase text-black">AWAITING INPUT DRAFT</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading State */}
          <AnimatePresence>
            {isAdapting && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center z-20 text-black bg-white"
              >
                <Loader2 size={36} strokeWidth={1} className="animate-spin mb-4" />
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase">Synthesizing Layouts</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result Canvas */}
          <AnimatePresence>
            {resultImage && !isAdapting && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 z-30 overflow-y-auto overflow-x-hidden p-8 custom-scrollbar bg-white"
              >
                <div className="flex flex-col items-start mb-6 max-w-7xl mx-auto w-full">
                  <h2 className="text-[13px] font-bold uppercase text-black">
                    {selectedCategory}（{TABLET_BREAKPOINTS.find(b => b.category === selectedCategory)?.range}）
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    {TABLET_BREAKPOINTS.find(b => b.category === selectedCategory)?.devices}
                  </p>
                  <div className="flex items-center gap-3 mt-4">
                    <button className="border border-black bg-white text-black px-4 py-2 text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-gray-50 transition-colors">
                      OPEN GRID
                    </button>
                    <button className="bg-black text-white px-4 py-2 text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-gray-900 transition-colors">
                      CREATE FIGMA
                    </button>
                  </div>
                </div>
                
                <div className="w-full h-full pb-24 flex items-center justify-center pt-8">
                  <motion.div
                    key={selectedCategory}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="w-full max-w-5xl mx-auto border border-black p-4 bg-gray-50 flex items-center justify-center relative min-h-[60vh]"
                  >
                    <img 
                      src={DEMO_IMAGES[selectedCategory] || resultImage!} 
                      alt={`${selectedCategory} layout target`}
                      className="max-h-[70vh] w-auto border border-black shadow-sm object-contain bg-white transition-opacity duration-300"
                    />
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
