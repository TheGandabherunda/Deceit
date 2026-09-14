import React, { useState, useEffect, useRef } from 'react';
import { useProfile } from '../../context/ProfileContext';
import { BloubAvatar } from '../Bloub/BloubAvatar';
import { SHAPES, COLORS, DEFAULT_SHAPE, DEFAULT_COLOR } from '../Bloub/bloubShapes';

export const ProfileModal = ({ isOpen, onClose }) => {
  const { profile, truncatedId, updateProfile } = useProfile();

  const getActiveName = () => {
    return profile?.name || localStorage.getItem('deceit_name') || '';
  };

  const [name, setName] = useState(getActiveName);
  const [selectedColor, setSelectedColor] = useState(profile?.color || DEFAULT_COLOR);
  const [selectedShape, setSelectedShape] = useState(profile?.shape || DEFAULT_SHAPE);

  // Color row horizontal scroll state & arrows
  const colorScrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollArrows = () => {
    const el = colorScrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  };

  useEffect(() => {
    if (!isOpen) return;
    const el = colorScrollRef.current;
    if (!el) return;

    const t = setTimeout(updateScrollArrows, 60);

    const observer = new ResizeObserver(() => {
      updateScrollArrows();
    });
    observer.observe(el);

    return () => {
      clearTimeout(t);
      observer.disconnect();
    };
  }, [isOpen]);

  const handleScrollLeft = () => {
    if (colorScrollRef.current) {
      colorScrollRef.current.scrollBy({ left: -140, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (colorScrollRef.current) {
      colorScrollRef.current.scrollBy({ left: 140, behavior: 'smooth' });
    }
  };

  // Shape row horizontal scroll state & arrows
  const shapeScrollRef = useRef(null);
  const [canScrollShapeLeft, setCanScrollShapeLeft] = useState(false);
  const [canScrollShapeRight, setCanScrollShapeRight] = useState(false);

  const updateShapeScrollArrows = () => {
    const el = shapeScrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollShapeLeft(scrollLeft > 4);
    setCanScrollShapeRight(scrollLeft + clientWidth < scrollWidth - 4);
  };

  useEffect(() => {
    if (!isOpen) return;
    const el = shapeScrollRef.current;
    if (!el) return;

    const t = setTimeout(updateShapeScrollArrows, 60);

    const observer = new ResizeObserver(() => {
      updateShapeScrollArrows();
    });
    observer.observe(el);

    return () => {
      clearTimeout(t);
      observer.disconnect();
    };
  }, [isOpen]);

  const handleShapeScrollLeft = () => {
    if (shapeScrollRef.current) {
      shapeScrollRef.current.scrollBy({ left: -140, behavior: 'smooth' });
    }
  };

  const handleShapeScrollRight = () => {
    if (shapeScrollRef.current) {
      shapeScrollRef.current.scrollBy({ left: 140, behavior: 'smooth' });
    }
  };

  // Sync state whenever the modal opens or profile changes
  useEffect(() => {
    if (isOpen) {
      const currentName = profile?.name || localStorage.getItem('deceit_name') || '';
      setName(currentName);
      setSelectedColor(profile?.color || DEFAULT_COLOR);
      setSelectedShape(profile?.shape || DEFAULT_SHAPE);
    }
  }, [isOpen, profile?.name, profile?.color, profile?.shape]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleNameChange = (e) => {
      if (e.detail) {
        setName(e.detail);
      }
    };
    window.addEventListener('deceit:name-change', handleNameChange);
    return () => window.removeEventListener('deceit:name-change', handleNameChange);
  }, []);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanName = name.trim() || localStorage.getItem('deceit_name') || 'Player';
    updateProfile({
      name: cleanName,
      color: selectedColor,
      shape: selectedShape
    });
    localStorage.setItem('deceit_name', cleanName);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[300] flex flex-col justify-end md:justify-center items-center p-4 sm:p-6 pb-6 md:pb-6 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full max-w-[440px] max-h-[92vh] overflow-y-auto bg-[#0a0a0a] rounded-[32px] p-6 sm:p-8 shadow-2xl relative border border-white/10 no-scrollbar"
        style={{ animation: 'slideUpModal 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
      >
        {/* Bottom Sheet Handle (Mobile only) */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/10 rounded-full md:hidden" />
        
        {/* Mobile Save Button (Top Left) */}
        <button 
          type="button"
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="md:hidden absolute top-3.5 left-4 z-10 px-3.5 py-1.5 rounded-full bg-white hover:bg-white/90 disabled:opacity-40 text-black text-xs font-bold tracking-tight transition-all active:scale-95 cursor-pointer shadow-md flex items-center justify-center"
        >
          Save
        </button>

        {/* Close button (Top Right) */}
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors z-10 cursor-pointer"
        >
          <span className="material-symbols-rounded text-[20px]">close</span>
        </button>

        {/* Header & Character Preview */}
        <div className="mt-1 mb-5 text-center px-2 flex flex-col items-center">
          <div className="w-36 h-36 flex items-center justify-center mb-2">
            <BloubAvatar 
              shape={selectedShape}
              color={selectedColor}
              expression="idle"
              size={140}
            />
          </div>

          <h3 
            className="text-4xl text-white font-serif" 
            style={{ fontFamily: '"Gloock", serif', letterSpacing: 'normal', fontWeight: 400 }}
          >
            Player Profile
          </h3>
          <p className="text-white/40 text-sm mt-1.5">
            Customize your character and display name.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5 ml-2">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              autoComplete="off"
              maxLength={20}
              className="w-full h-[48px] bg-white/[0.06] rounded-full px-6 text-lg text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors shadow-inner"
            />
          </div>

          {/* Color Selection - Single row with external left & right arrows (no background container) */}
          <div>
            <div className="flex items-center justify-between mb-1.5 ml-1 mr-1">
              <label className="block text-sm font-medium text-white/60">Color</label>
              <span className="text-xs font-mono text-white/40">
                {COLORS.find((c) => c.hex.toLowerCase() === selectedColor.toLowerCase())?.label || ''}
              </span>
            </div>

            <div className="flex items-center w-full min-w-0">
              {/* Left Arrow (only rendered when colors are available to scroll left) */}
              {canScrollLeft && (
                <button
                  type="button"
                  onClick={handleScrollLeft}
                  aria-label="Scroll left to more colors"
                  className="w-8 h-8 shrink-0 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 mr-1"
                >
                  <span className="material-symbols-rounded text-lg leading-none">chevron_left</span>
                </button>
              )}

              {/* Color Scroll Track - min-w-0 and py-3 prevents any clipping or horizontal overflow */}
              <div
                ref={colorScrollRef}
                onScroll={updateScrollArrows}
                className="flex-1 min-w-0 py-3 px-1.5 flex items-center gap-2.5 overflow-x-auto no-scrollbar scroll-smooth"
              >
                {COLORS.map((c) => {
                  const isSelected = selectedColor.toLowerCase() === c.hex.toLowerCase();
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedColor(c.hex)}
                      aria-label={c.label}
                      aria-pressed={isSelected}
                      className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-full border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-white scale-110 shadow-sm'
                          : 'border-transparent hover:border-white/30'
                      }`}
                      title={c.label}
                    >
                      <span
                        className="block w-[76%] h-[76%] rounded-full ring-1 ring-black/20 ring-inset"
                        style={{ backgroundColor: c.hex }}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Right Arrow (only rendered when colors are available to scroll right) */}
              {canScrollRight && (
                <button
                  type="button"
                  onClick={handleScrollRight}
                  aria-label="Scroll right to more colors"
                  className="w-8 h-8 shrink-0 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 ml-1"
                >
                  <span className="material-symbols-rounded text-lg leading-none">chevron_right</span>
                </button>
              )}
            </div>
          </div>

          {/* Shape Selection - Single row with external left & right arrows, just like colors */}
          <div>
            <div className="flex items-center justify-between mb-1.5 ml-1 mr-1">
              <label className="block text-sm font-medium text-white/60">Character Shape</label>
              <span className="text-xs font-mono text-white/40">
                {SHAPES.find((s) => s.id === selectedShape)?.label || ''}
              </span>
            </div>

            <div className="flex items-center w-full min-w-0">
              {/* Left Arrow (only rendered when shapes are available to scroll left) */}
              {canScrollShapeLeft && (
                <button
                  type="button"
                  onClick={handleShapeScrollLeft}
                  aria-label="Scroll left to more shapes"
                  className="w-8 h-8 shrink-0 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 mr-1"
                >
                  <span className="material-symbols-rounded text-lg leading-none">chevron_left</span>
                </button>
              )}

              {/* Shape Scroll Track */}
              <div
                ref={shapeScrollRef}
                onScroll={updateShapeScrollArrows}
                className="flex-1 min-w-0 py-2.5 px-1 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth"
              >
                {SHAPES.map((s) => {
                  const isSelected = selectedShape === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedShape(s.id)}
                      aria-label={s.label}
                      className={`shrink-0 flex flex-col items-center justify-center py-2 px-2 rounded-2xl transition-all cursor-pointer border-2 ${
                        isSelected
                          ? 'border-white bg-white/10 scale-105 shadow-sm'
                          : 'border-transparent hover:border-white/20 text-white/60 hover:bg-white/5'
                      }`}
                      style={{ width: '68px' }}
                    >
                      <div className="w-9 h-9 flex items-center justify-center pointer-events-none">
                        <BloubAvatar
                          shape={s.id}
                          color={selectedColor}
                          expression="idle"
                          size={34}
                        />
                      </div>
                      <span className="text-[10px] font-mono mt-1 text-white/80 truncate max-w-full text-center">
                        {s.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right Arrow (only rendered when shapes are available to scroll right) */}
              {canScrollShapeRight && (
                <button
                  type="button"
                  onClick={handleShapeScrollRight}
                  aria-label="Scroll right to more shapes"
                  className="w-8 h-8 shrink-0 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 ml-1"
                >
                  <span className="material-symbols-rounded text-lg leading-none">chevron_right</span>
                </button>
              )}
            </div>
          </div>
          
          {/* Submit Button (Desktop: visible at bottom; Mobile: top-left) */}
          <div className="mt-8 pt-2 hidden md:block">
            <button 
              type="submit" 
              disabled={!name.trim()}
              className="w-full bg-white hover:bg-white/90 disabled:opacity-50 text-black font-bold rounded-full h-[48px] transition-colors flex items-center justify-center text-lg shadow-xl active:scale-95 cursor-pointer"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes slideUpModal {
          0% { opacity: 0; transform: translateY(40px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};
