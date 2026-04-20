import { useState, useEffect, useRef } from 'react';
import { FaMinus, FaPlus, FaTrash }    from 'react-icons/fa';
import styles from './QuantityControl.module.css';

/*
 * Standalone quantity control: [−] [n] [+]
 * Supports keyboard navigation, direct input, and trash-on-min.
 *
 * Props:
 *   quantity    → current quantity value (controlled)
 *   onIncrease  → () => void
 *   onDecrease  → () => void
 *   onSet       → (value: number) => void   (direct input)
 *   onRemove    → () => void                (when trash is clicked)
 *   min         → minimum value (default 1)
 *   max         → maximum value (default 99)
 *   size        → 'sm' | 'md' | 'lg'
 *   showTrash   → replace minus with trash when qty === min
 */
export default function QuantityControl({
  quantity,
  onIncrease,
  onDecrease,
  onSet,
  onRemove,
  min       = 1,
  max       = 99,
  size      = 'md',
  showTrash = true,
}) {
  const [inputVal,  setInputVal]  = useState(String(quantity));
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef(null);

  // Sync external quantity → local input value
  useEffect(() => {
    if (!isEditing) setInputVal(String(quantity));
  }, [quantity, isEditing]);

  const handleChange = (e) => {
    const v = e.target.value;
    if (v === '' || /^\d+$/.test(v)) setInputVal(v);
  };

  const commitValue = () => {
    setIsEditing(false);
    const parsed = parseInt(inputVal, 10);
    if (isNaN(parsed) || parsed < min) {
      setInputVal(String(quantity));
      return;
    }
    const clamped = Math.min(parsed, max);
    setInputVal(String(clamped));
    if (clamped !== quantity) onSet?.(clamped);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter')   inputRef.current?.blur();
    if (e.key === 'Escape') { setInputVal(String(quantity)); inputRef.current?.blur(); }
    if (e.key === 'ArrowUp'   && quantity < max) { e.preventDefault(); onIncrease?.(); }
    if (e.key === 'ArrowDown' && quantity > min) { e.preventDefault(); onDecrease?.(); }
  };

  const isAtMin = quantity <= min;
  const isAtMax = quantity >= max;

  return (
    <div
      className={`${styles.wrap} ${styles[size]}`}
      role="group"
      aria-label="Quantity"
    >
      {/* Decrease / Remove */}
      <button
        className={`${styles.btn} ${
          isAtMin && showTrash ? styles.btnDanger : styles.btnNeutral
        }`}
        onClick={() => (isAtMin && showTrash) ? onRemove?.() : onDecrease?.()}
        disabled={!showTrash && isAtMin}
        aria-label={isAtMin && showTrash ? 'Remove item' : 'Decrease'}
      >
        {isAtMin && showTrash
          ? <FaTrash  size={10} />
          : <FaMinus  size={10} />
        }
      </button>

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        className={styles.input}
        value={inputVal}
        onChange={handleChange}
        onFocus={() => { setIsEditing(true); inputRef.current?.select(); }}
        onBlur={commitValue}
        onKeyDown={handleKeyDown}
        aria-label={`Quantity: ${quantity}`}
      />

      {/* Increase */}
      <button
        className={`${styles.btn} ${styles.btnNeutral}`}
        onClick={onIncrease}
        disabled={isAtMax}
        aria-label="Increase"
      >
        <FaPlus size={10} />
      </button>
    </div>
  );
}