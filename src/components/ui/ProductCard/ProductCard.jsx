import { Link }        from 'react-router-dom';
import { FaShoppingCart, FaEye } from 'react-icons/fa';
import { useCart }     from '../../../context/CartContext';
import StarRating      from '../../common/StarRating/StarRating';
import { formatPrice, truncateText } from '../../../utils/formatPrice';
import { toast }       from 'react-toastify';
import styles          from './ProductCard.module.css';

/*
 * Displays a single product in a Bootstrap card.
 * Used in: FeaturedProducts, Products page, RelatedProducts.
 *
 * Props:
 *   product → full product object from FakeStoreAPI
 */
export default function ProductCard({ product }) {
  const { addToCart, isInCart } = useCart();

  const {
    id,
    title,
    price,
    image,
    category,
    rating: { rate, count } = {},
  } = product;

  const alreadyInCart = isInCart(id);

  const handleAddToCart = (e) => {
    e.preventDefault();     // Stop the parent <Link> from navigating
    e.stopPropagation();
    addToCart(product);
    toast.success(`"${truncateText(title, 28)}" added to cart!`);
  };

  return (
    <Link
      to={`/products/${id}`}
      state={{ product }}          // Pass product so detail page renders instantly
      className={`text-decoration-none ${styles.cardLink}`}
    >
      <div className={`card h-100 border-0 shadow-sm ${styles.card}`}>

        {/* Category badge */}
        <span className={styles.categoryBadge}>{category}</span>

        {/* Image + hover overlay */}
        <div className={styles.imgWrap}>
          <img
            src={image}
            alt={title}
            className={styles.img}
            loading="lazy"
          />
          <div className={styles.overlay}>
            <FaEye className="me-2" /> Quick View
          </div>
        </div>

        {/* Card body */}
        <div className="card-body d-flex flex-column p-3">
          <p className={styles.title}>{truncateText(title, 55)}</p>

          <StarRating rating={rate} count={count} />

          <div className="mt-auto pt-3 d-flex align-items-center
                          justify-content-between">
            <span className={styles.price}>{formatPrice(price)}</span>

            <button
              className={`btn btn-sm fw-semibold ${
                alreadyInCart
                  ? 'btn-success'
                  : 'btn-primary'
              } ${styles.cartBtn}`}
              onClick={handleAddToCart}
            >
              <FaShoppingCart size={13} className="me-1" />
              {alreadyInCart ? 'Added' : 'Add'}
            </button>
          </div>
        </div>

      </div>
    </Link>
  );
}