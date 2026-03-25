/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Sparkles, 
  Image as ImageIcon, 
  Layout, 
  Users, 
  Loader2, 
  ArrowRight,
  Download,
  Maximize2,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface GeneratedImage {
  url: string;
  type: 'product' | 'billboard' | 'magazine' | 'variation';
  id: string;
  label?: string;
}

export default function App() {
  const [productIdea, setProductIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async (prompt: string, type: 'product' | 'billboard' | 'magazine' | 'variation', label?: string): Promise<GeneratedImage> => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: type === 'billboard' ? "16:9" : "1:1",
        }
      }
    });

    let imageUrl = '';
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageUrl) throw new Error(`Failed to generate ${type} image`);

    return {
      url: imageUrl,
      type,
      label,
      id: Math.random().toString(36).substr(2, 9)
    };
  };

  const handleGenerate = async () => {
    if (!productIdea.trim()) return;

    setIsGenerating(true);
    setError(null);
    setImages([]);

    try {
      // Base prompt for product
      const baseProductPrompt = `Professional studio product photography of ${productIdea}. Minimalist aesthetic, clean high-key lighting, sharp focus on industrial design details, luxurious materials, no people, isolated on a neutral background.`;
      
      // Variation prompts
      const variationThemes = [
        { label: 'Midnight Obsidian', prompt: `${baseProductPrompt} Color palette: deep matte black and dark charcoal. Sleek, stealthy appearance.` },
        { label: 'Arctic Porcelain', prompt: `${baseProductPrompt} Color palette: pure white and light silver. Clean, clinical, and bright aesthetic.` },
        { label: 'Sunset Copper', prompt: `${baseProductPrompt} Color palette: warm copper, brushed bronze, and terracotta. Earthy and premium feel.` },
        { label: 'Forest Emerald', prompt: `${baseProductPrompt} Color palette: deep forest green and gold accents. Organic yet luxurious design.` },
        { label: 'Cyber Neon', prompt: `${baseProductPrompt} Color palette: electric blue and vibrant purple accents on a dark base. Modern, high-tech vibe.` }
      ];

      const billboardPrompt = `A high-end outdoor billboard advertisement in a sleek, modern metropolitan area at dusk. The billboard features ${productIdea} with minimalist typography and premium branding. Cinematic lighting, city bokeh background, no people in the frame.`;
      
      const magazinePrompts = [
        `A high-fashion lifestyle magazine editorial photo featuring a diverse young adult using ${productIdea} in a sun-drenched modern apartment. Stylish attire, natural lighting, candid moment.`,
        `An elegant magazine spread photo of a middle-aged professional of Asian descent interacting with ${productIdea} in a sophisticated office environment. High-end editorial style.`,
        `A vibrant lifestyle magazine image showing a group of diverse friends (at least 25% ethnic diversity) laughing and using ${productIdea} at an outdoor garden party. Warm, joyful atmosphere.`
      ];

      // Generate in parallel
      const results = await Promise.all([
        generateImage(baseProductPrompt, 'product', 'Original Concept'),
        generateImage(billboardPrompt, 'billboard'),
        ...variationThemes.map(v => generateImage(v.prompt, 'variation', v.label)),
        ...magazinePrompts.map(p => generateImage(p, 'magazine'))
      ]);

      setImages(results);
    } catch (err) {
      console.error(err);
      setError('Something went wrong during generation. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-white/5 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">Visionary</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-zinc-400 font-medium">
            <a href="#" className="hover:text-white transition-colors">Showcase</a>
            <a href="#" className="hover:text-white transition-colors">Templates</a>
            <a href="#" className="hover:text-white transition-colors">Pricing</a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <section className="mb-20 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-display font-bold mb-6 tracking-tight"
          >
            Concept to <span className="gradient-text">Reality</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-zinc-400 text-lg max-w-2xl mx-auto mb-10"
          >
            Transform your product ideas into professional visual concepts. 
            From studio shots to billboard campaigns and editorial spreads.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-xl mx-auto relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex gap-2 p-2 glass rounded-2xl">
              <input 
                type="text" 
                value={productIdea}
                onChange={(e) => setProductIdea(e.target.value)}
                placeholder="Describe your product idea (e.g., A minimalist wooden smart speaker)"
                className="flex-1 bg-transparent border-none focus:ring-0 px-4 text-white placeholder:text-zinc-500"
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !productIdea.trim()}
                className="bg-white text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                {isGenerating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Generate
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </section>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-center mb-12"
            >
              {error}
            </motion.div>
          )}

          {images.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-24"
            >
              {/* Product Shot */}
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <ImageIcon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-bold">Primary Concept</h2>
                    <p className="text-sm text-zinc-500">The core visual identity</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="aspect-square rounded-3xl overflow-hidden glass group relative">
                    <img 
                      src={images.find(img => img.type === 'product')?.url} 
                      alt="Product Concept" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <button className="p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors">
                        <Maximize2 className="w-5 h-5" />
                      </button>
                      <button className="p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors">
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="p-6 glass rounded-3xl">
                      <h3 className="text-lg font-bold mb-2">Design Philosophy</h3>
                      <p className="text-zinc-400 leading-relaxed">
                        This visualization explores the core aesthetic of your product. 
                        We've highlighted the interplay of form and function, using studio-grade 
                        lighting to emphasize the premium finish and structural integrity.
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1 p-4 glass rounded-2xl text-center">
                        <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Lighting</div>
                        <div className="font-medium">Studio High-Key</div>
                      </div>
                      <div className="flex-1 p-4 glass rounded-2xl text-center">
                        <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Focus</div>
                        <div className="font-medium">Macro Details</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Variations */}
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <RefreshCw className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-bold">Design Variations</h2>
                    <p className="text-sm text-zinc-500">Exploring different colorways and finishes</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {images.filter(img => img.type === 'variation').map((img, idx) => (
                    <motion.div 
                      key={img.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group"
                    >
                      <div className="aspect-square rounded-2xl overflow-hidden glass mb-3 relative">
                        <img 
                          src={img.url} 
                          alt={img.label} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-sm font-medium text-zinc-300">{img.label}</div>
                      <div className="text-xs text-zinc-500">Concept {idx + 1}</div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Billboard */}
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Layout className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-bold">Campaign Vision</h2>
                    <p className="text-sm text-zinc-500">Outdoor billboard in urban environment</p>
                  </div>
                </div>
                <div className="aspect-[21/9] rounded-3xl overflow-hidden glass relative group">
                  <img 
                    src={images.find(img => img.type === 'billboard')?.url} 
                    alt="Billboard Concept" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                    <div className="flex-1">
                      <h3 className="text-2xl font-display font-bold text-white">Urban Presence</h3>
                      <p className="text-zinc-300">Visualizing the product in a premium city context.</p>
                    </div>
                    <button className="p-4 bg-white text-black rounded-full hover:bg-zinc-200 transition-colors">
                      <Download className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </section>

              {/* Magazine Spread */}
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <Users className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-bold">Editorial Spread</h2>
                    <p className="text-sm text-zinc-500">Lifestyle integration with diverse representation</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {images.filter(img => img.type === 'magazine').map((img, idx) => (
                    <motion.div 
                      key={img.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="aspect-[3/4] rounded-3xl overflow-hidden glass group relative"
                    >
                      <img 
                        src={img.url} 
                        alt={`Magazine Concept ${idx + 1}`} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                        <div className="text-xs text-white/60 uppercase tracking-widest mb-1">Editorial {idx + 1}</div>
                        <div className="font-bold text-white">Lifestyle Context</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {isGenerating && images.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-24"
            >
              <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-indigo-500 animate-pulse" />
              </div>
              <h3 className="text-2xl font-display font-bold mb-2">Crafting your vision...</h3>
              <p className="text-zinc-500">Generating studio shots, 5 variations, billboards, and editorial spreads.</p>
            </motion.div>
          )}

          {!isGenerating && images.length === 0 && !error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-32 text-center opacity-40"
            >
              <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                <ImageIcon className="w-10 h-10 text-zinc-700" />
              </div>
              <p className="text-zinc-500 max-w-xs">Enter a product idea above to begin generating your concept gallery.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 mt-24">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-zinc-800 rounded flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-zinc-400" />
            </div>
            <span className="font-display font-bold text-zinc-400">Visionary AI</span>
          </div>
          <div className="flex gap-8 text-sm text-zinc-500">
            <a href="#" className="hover:text-zinc-300">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-300">Terms of Service</a>
            <a href="#" className="hover:text-zinc-300">Contact</a>
          </div>
          <div className="text-sm text-zinc-600">
            &copy; 2026 Visionary Concept Labs. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
