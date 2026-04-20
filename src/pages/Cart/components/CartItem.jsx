import { useState }     from 'react';
import { Link }         from 'react-router-dom';
import { useCart }      from '../../../context/CartContext';
import QuantityControl  from '../../../components/ui/QuantityControl/QuantityControl';
import { formatPrice,
         truncateText } from '../../../utils/formatPrice';
import styles           from './CartItem.module.css';

export default function CartItem({ item }) {
  const { increaseQuantity, decreaseQuantity,
          setQuantity, removeFromCart } = useCart();

  const [removing, setRemoving] = useState(false);
  const [flash,    setFlash]    = useState(null); // 'up' | 'down'

  const { id, title, price, image, category, quantity } = item;

  const triggerFlash = (dir) => {
    setFlash(dir);
    setTimeout(() => setFlash(null), 450);
  };

  const handleIncrease = () => {
    increaseQuantity(id);
    triggerFlash('up');
  };

  const handleDecrease = () => {
    if (quantity === 1) { handleRemove(); return; }
    decreaseQuantity(id);
    triggerFlash('down');
  };

  const handleRemove = () => {
    setRemoving(true);
    setTimeout(() => removeFromCart(id), 310);
  };

  return (
    <div className={`${styles.item} ${removing ? styles.out : ''}`}>
      <div className="d-flex align-items-center gap-3 p-3">

        {/* Image */}
        <Link to={`/products/${id}`}>
          <div className={styles.imgBox}>
            <img src={image} alt={title} className={styles.img} />
          </div>
        </Link>

        {/* Info */}
        <div className="flex-grow-1 min-width-0">
          <div className={styles.cat}>{category}</div>
          <Link to={`/products/${id}`} className="text-decoration-none text-dark">
            <p className={styles.title}>{truncateText(title, 60)}</p>
          </Link>
          <div className="text-muted" style={{ fontSize: '0.78rem' }}>
            {formatPrice(price)} each
          </div>
          <div className="mt-2">
            <QuantityControl
              quantity={quantity}
              onIncrease={handleIncrease}
              onDecrease={handleDecrease}
              onSet={(v) => setQuantity(id, v)}
              onRemove={handleRemove}
              size="sm"
              showTrash
            />
          </div>
        </div>

        {/* Line total */}
        <div className={`text-end ${styles.totalCol}`}>
          <div className={`
            ${styles.lineTotal}
            ${flash === 'up'   ? styles.flashUp   : ''}
            ${flash === 'down' ? styles.flashDown : ''}
          `}>
            {formatPrice(price * quantity)}
          </div>
          {quantity > 1 && (
            <small className="text-muted">
              {quantity} × {formatPrice(price)}
            </small>
          )}
        </div>

      </div>
    </div>
  );
}