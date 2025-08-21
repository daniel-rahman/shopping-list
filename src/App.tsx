import React, { useState, useMemo, useRef, useEffect } from "react";
interface Item {
  id: number | string;
  name: string;
  category: string;
  quantity: number;
  taken: boolean;
  originalCategory: string;
}

interface SavedList {
  id: string;
  name: string;
  items: Item[];
  createdAt: number;
}

interface ConfirmationModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmationModal({
  message,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm w-full text-center border border-gray-700">
        <p className="text-xl text-gray-100 mb-6">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-red-700 text-white rounded-md hover:bg-red-600 transition-colors duration-200 shadow-md"
          >
            כן, מחק
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors duration-200 shadow-md"
          >
            לא, בטל
          </button>
        </div>
      </div>
    </div>
  );
}

// הגדרת ממשק עבור Props של QuantitySelectionModal
interface QuantitySelectionModalProps {
  productName: string;
  onConfirm: (productName: string, quantity: number) => void;
  onCancel: () => void;
}

// רכיב QuantitySelectionModal להצגת חלונית בחירת כמות
function QuantitySelectionModal({
  productName,
  onConfirm,
  onCancel,
}: QuantitySelectionModalProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const quantityInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (quantityInputRef.current) {
      quantityInputRef.current.focus();
      quantityInputRef.current.select();
    }
  }, []);

  const handleConfirm = (): void => {
    onConfirm(productName, quantity);
  };

  const incrementQuantity = (): void => {
    setQuantity((prevQuantity) => prevQuantity + 1);
  };

  const decrementQuantity = (): void => {
    setQuantity((prevQuantity) => Math.max(1, prevQuantity - 1));
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm w-full text-center border border-gray-700">
        <p className="text-xl text-gray-100 mb-6">
          בחר כמות עבור "{productName}"
        </p>
        <div className="flex items-center justify-center gap-3 mb-6">
          <button
            onClick={decrementQuantity}
            className="p-2 bg-gray-700 text-gray-100 rounded-full hover:bg-gray-600 transition-colors duration-200 shadow-md w-10 h-10 flex items-center justify-center text-2xl font-bold"
            aria-label="הורד כמות"
          >
            -
          </button>
          <input
            ref={quantityInputRef}
            type="number"
            value={quantity}
            onChange={(e) =>
              setQuantity(Math.max(1, parseInt(e.target.value) || 1))
            }
            min={1}
            className="w-24 p-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-700 text-gray-100 text-center text-xl"
            aria-label="בחר כמות"
            onFocus={(e) => e.target.select()}
          />
          <button
            onClick={incrementQuantity}
            className="p-2 bg-gray-700 text-gray-100 rounded-full hover:bg-gray-600 transition-colors duration-200 shadow-md w-10 h-10 flex items-center justify-center text-2xl font-bold"
            aria-label="העלה כמות"
          >
            +
          </button>
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={handleConfirm}
            className="px-6 py-2 bg-purple-700 text-white rounded-md hover:bg-purple-600 transition-colors duration-200 shadow-md"
          >
            הוסף
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors duration-200 shadow-md"
          >
            בטל
          </button>
        </div>
      </div>
    </div>
  );
}

// Global category keywords for auto-categorization and predefined list
const categoryKeywords: Record<string, string[]> = {
  "ירקות ופירות": [
    "אגוזים",
    "אגס",
    "אננס",
    "אספרגוס",
    "אשכולית",
    "אבטיח",
    "ארטישוק",
    "בזיליקום",
    "בננה",
    "בננות",
    "ברוקולי",
    "בצל אדום",
    "בצל ירוק",
    "בצל לבן",
    "גזר",
    "דובדבן",
    "דלורית",
    "דלעת",
    "זוקיני",
    "חסה",
    "חציל",
    "כוסברה",
    "כרוב ירוק",
    "כרוב סגול",
    "כרובית",
    "כרישה",
    "לימון",
    "ליים",
    "מנגולד",
    "מנגו",
    "מלון",
    "מלפפון",
    "מלפפונים",
    "נקטרינה",
    "נענע",
    "ענבים שחורים",
    "פיסטוק",
    "פסיפלורה",
    "פלפל אדום",
    "פלפל ירוק",
    "פלפל כתום",
    "פלפל צהוב",
    "פטרוזיליה",
    "פטריות חומות",
    "פטריות לבנות",
    "קיווי",
    "קולורבי",
    "קוקוס",
    "רימון",
    "רוזמרין",
    "שום",
    "שמיר",
    "שזיף",
    "שומר",
    "תפוז",
    "תפוזים",
    "תפוח עץ ירוק",
    "תפוח אדמה אדום",
    "תפוח עץ אדום",
    "תפוח עץ",
    "כרוב",
    "צנוניות",
    "תפוח אדמה לבן",
    "תפוח ירוק",
    "תמר",
    "תות",
    "תירס",
    "צנונית",
    "קלמנטינה",
    "סלרי",
    "סלק",
    "ענבים ירוקים",
  ],
  "מוצרי מזווה": [
    "שמן",
    "אורז",
    "קמח",
    "סוכר",
    "מלח",
    "פסטה",
    "עדשים",
    "חומוס",
    "שעועית",
    "תבלינים",
    "קפה",
    "תה",
    "ממתק",
    "ממתקים",
    "שוקולד",
    "עוגיה",
    "חטיף",
    "דגני בוקר",
    "שימורים",
    "ריבה",
    "דבש",
    "קטשופ",
    "מיונז",
    "חרדל",
    "טחינה",
    "חמאת בוטנים",
    "קקאו",
    "שמרים",
    "אבקת אפייה",
    "פתיתים",
    "בורגול",
    "סולת",
    "פירורי לחם",
    "פצפוצים",
    "סילאן",
  ],
  "מוצרי חלב": [
    "חלב",
    "יוגורט",
    "גבינה",
    "שמנת",
    "קוטג",
    "מעדן",
    "לבן",
    "אשל",
    "שוקו",
    "חמאה",
    "מרגרינה",
    "ביצים",
    "גבינה צהובה",
    "מוצרלה",
    "ריקוטה",
    "קשקבל",
  ],
  משקאות: [
    "מים",
    "מיץ",
    "קולה",
    "ספרייט",
    "בירה",
    "יין",
    "משקה",
    "נס קפה",
    "תה",
    "סודה",
    "משקה קל",
    "לימונדה",
    "מי טוניק",
    "עראק",
    "וודקה",
    "ויסקי",
  ],
  "בשרים, עופות ודגים": [
    "עוף",
    "בשר",
    "דג",
    "פרגית",
    "חזה עוף",
    "בקר",
    "סלמון",
    "טונה",
    "נקניק",
    "המבורגר",
    "שניצל",
    "טחון",
    "צלי",
    "סטייק",
    "קבב",
    "כרעיים",
    "שוקיים",
    "פילה",
    "סרדינים",
    "הרינג",
  ],
  "פריטים שנלקחו": [], // This category is for moved items, not initial categorization
};

// Global helper function to parse item and category
const parseItemAndCategory = (
  line: string
): { name: string; category: string; quantity: number } => {
  let itemName: string = line.trim();
  let quantity: number = 1;
  let foundQuantity: boolean = false;

  // Attempt to extract quantity from "name * quantity" format
  const regexAsterisk = /(.*)\s*\*\s*(\d+)$/;
  let match = itemName.match(regexAsterisk);
  if (match) {
    itemName = match[1].trim();
    quantity = parseInt(match[2], 10);
    foundQuantity = true;
  }

  // Attempt to extract quantity from "name (quantity)" format if not found above
  if (!foundQuantity) {
    const regexParentheses = /(.*)\s*\(\s*(\d+)\s*\)$/;
    match = itemName.match(regexParentheses);
    if (match) {
      itemName = match[1].trim();
      quantity = parseInt(match[2], 10);
    }
  }

  const lowerCaseItemName: string = itemName.toLowerCase();
  let category: string = "כללי";
  // Do not search in 'פריטים שנלקחו' for initial categorization
  for (const catKey in categoryKeywords) {
    if (
      catKey !== "פריטים שנלקחו" &&
      categoryKeywords[catKey].some((keyword) =>
        lowerCaseItemName.includes(keyword)
      )
    ) {
      category = catKey;
      break;
    }
  }
  return { name: itemName, category, quantity };
};

// הגדרת ממשק עבור Props של AddItem
interface AddItemProps {
  onAddItem: (
    itemName: string,
    itemCategory: string,
    itemQuantity: number
  ) => void;
  onAddBulkItems: (bulkText: string) => void;
}

// רכיב AddItem מאפשר הוספת פריטים בודדים או רשימות כתובות
function AddItem({ onAddItem, onAddBulkItems }: AddItemProps) {
  const [itemName, setItemName] = useState<string>(""); // מצב עבור שם פריט בודד
  const [itemQuantity, setItemQuantity] = useState<number>(1); // מצב עבור כמות פריט בודד
  const bulkTextRef = useRef<HTMLTextAreaElement>(null); // Ref for the bulk text area
  const quantityInputRef = useRef<HTMLInputElement>(null); // Ref for single item quantity input

  useEffect(() => {
    // Focus and select the input text when the modal opens for single item quantity
    if (quantityInputRef.current) {
      quantityInputRef.current.focus();
      quantityInputRef.current.select();
    }
  }, []); // Run once on component mount for initial focus, or consider conditional focus

  const handleSingleItemSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ): void => {
    e.preventDefault();
    if (itemName.trim()) {
      const { category } = parseItemAndCategory(itemName); // Get category automatically
      onAddItem(itemName.trim(), category, itemQuantity);
      setItemName("");
      setItemQuantity(1);
    }
  };

  const handleBulkItemSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (bulkTextRef.current && bulkTextRef.current.value.trim()) {
      onAddBulkItems(bulkTextRef.current.value.trim());
      bulkTextRef.current.value = ""; // Clear the textarea using ref
    }
  };

  const incrementQuantity = (): void => {
    setItemQuantity((prevQuantity) => prevQuantity + 1);
  };

  const decrementQuantity = (): void => {
    setItemQuantity((prevQuantity) => Math.max(1, prevQuantity - 1));
  };

  return (
    <div className="add-item-container card">
      <h2 className="section-title">הוסף פריטים</h2>

      {/* טופס להוספת פריט בודד */}
      <form
        onSubmit={handleSingleItemSubmit}
        className="form-section add-single-item-form"
      >
        <h3 className="form-section-title">הוסף פריט בודד</h3>
        <div className="form-row-center">
          <input
            type="text"
            placeholder="שם הפריט"
            value={itemName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setItemName(e.target.value)
            }
            className="input-field flex-grow"
            aria-label="שם הפריט"
          />
          {/* Quantity control with +/- buttons */}
          <div className="quantity-controls-inline">
            <button
              type="button" // Important to prevent form submission
              onClick={decrementQuantity}
              className="quantity-control-btn-small"
              aria-label="הורד כמות"
            >
              -
            </button>
            <input
              ref={quantityInputRef}
              type="number"
              value={itemQuantity}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setItemQuantity(Math.max(1, parseInt(e.target.value) || 1))
              }
              min="1"
              className="input-field quantity-input-small"
              aria-label="כמות הפריט"
              onFocus={(e: React.FocusEvent<HTMLInputElement>) =>
                e.target.select()
              } // Select text on focus
            />
            <button
              type="button" // Important to prevent form submission
              onClick={incrementQuantity}
              className="quantity-control-btn-small"
              aria-label="העלה כמות"
            >
              +
            </button>
          </div>
          <button type="submit" className="btn btn-blue">
            הוסף
          </button>
        </div>
      </form>

      {/* טופס להוספת רשימה כתובה */}
      <form onSubmit={handleBulkItemSubmit} className="form-section">
        <h3 className="form-section-title">הוסף רשימה כתובה (כל שורה פריט)</h3>
        <textarea
          ref={bulkTextRef} // Using ref for textarea
          placeholder="הכנס רשימת פריטים, כל פריט בשורה חדשה.
          ניתן לציין כמות:
          מלפפון * 5
          חלב (2)"
          rows={5}
          className="input-field textarea-bulk"
          aria-label="הכנס רשימת פריטים"
        ></textarea>
        <button type="submit" className="btn btn-green btn-full-width">
          הוסף רשימה
        </button>
      </form>
    </div>
  );
}

// הגדרת ממשק עבור Props של PredefinedProductSelection
interface PredefinedProductSelectionProps {
  categoryKeywords: Record<string, string[]>;
  onAddItem: (
    itemName: string,
    itemCategory: string,
    itemQuantity: number
  ) => void;
  shoppingList: Item[];
  onToggleTaken: (itemId: number | string) => void;
}

// רכיב PredefinedProductSelection מציג מוצרים לבחירה מהירה
function PredefinedProductSelection({
  categoryKeywords,
  onAddItem,
  shoppingList,
  onToggleTaken,
}: PredefinedProductSelectionProps) {
  const [showQuantityModal, setShowQuantityModal] = useState<boolean>(false);
  const [productToQuantify, setProductToQuantify] = useState<{
    name: string;
    category: string;
  } | null>(null);
  const [filterPredefinedCategory, setFilterPredefinedCategory] =
    useState<string>("הכל"); // New state for category filter
  const [searchPredefinedTerm, setSearchPredefinedTerm] = useState<string>(""); // New state for search term

  // All categories for filtering in this section
  const allPredefinedCategories = useMemo(() => {
    const categories = Object.keys(categoryKeywords)
      .filter((cat) => cat !== "פריטים שנלקחו") // Exclude 'Taken Items' from filter options
      .sort((a, b) => {
        // Sort categories for display
        const categoryOrder: Record<string, number> = {
          "ירקות ופירות": 1,
          "מוצרי מזווה": 2,
          "מוצרי חלב": 3,
          משקאות: 4,
          "בשרים, עופות ודגים": 5,
          כללי: 99,
        };
        return (categoryOrder[a] || 99) - (categoryOrder[b] || 99);
      });
    return ["הכל", ...categories]; // Add 'All' option
  }, [categoryKeywords]);

  // ממיר ומסנן את categoryKeywords למערך קטגוריות ומוצרים לטובת תצוגה מסודרת
  const filteredAndSortedCategoriesAndProducts = useMemo(() => {
    let currentCategoriesAndProducts = Object.keys(categoryKeywords)
      .filter((cat) => cat !== "פריטים שנלקחו")
      .map((category) => ({
        name: category,
        products: categoryKeywords[category], // Don't sort products yet, will filter below
      }));

    // Filter by category
    if (filterPredefinedCategory !== "הכל") {
      currentCategoriesAndProducts = currentCategoriesAndProducts.filter(
        (cat) => cat.name === filterPredefinedCategory
      );
    }

    // Filter by search term within products
    if (searchPredefinedTerm.trim() !== "") {
      const lowerCaseSearchTerm: string = searchPredefinedTerm.toLowerCase();
      currentCategoriesAndProducts = currentCategoriesAndProducts
        .map((cat) => ({
          ...cat,
          products: cat.products
            .filter((product) =>
              product.toLowerCase().includes(lowerCaseSearchTerm)
            )
            .sort(), // Sort products after filtering by search term
        }))
        .filter((cat) => cat.products.length > 0); // Remove categories with no matching products
    } else {
      // If no search term, just sort products alphabetically within each category
      currentCategoriesAndProducts = currentCategoriesAndProducts.map(
        (cat) => ({
          ...cat,
          products: cat.products.sort(),
        })
      );
    }

    // Sort categories for display
    currentCategoriesAndProducts.sort((a, b) => {
      const categoryOrder: Record<string, number> = {
        "ירקות ופירות": 1,
        "מוצרי מזווה": 2,
        "מוצרי חלב": 3,
        משקאות: 4,
        "בשרים, עופות ודגים": 5,
        כללי: 99,
      };
      return (categoryOrder[a.name] || 99) - (categoryOrder[b.name] || 99);
    });

    return currentCategoriesAndProducts;
  }, [categoryKeywords, filterPredefinedCategory, searchPredefinedTerm]);

  const handleProductClick = (productName: string, category: string): void => {
    // בדוק אם המוצר כבר קיים ברשימה
    const existingItem = shoppingList.find(
      (item) => item.name.toLowerCase() === productName.toLowerCase()
    );

    if (existingItem) {
      if (!existingItem.taken) {
        onToggleTaken(existingItem.id);
      }
    } else {
      setProductToQuantify({ name: productName, category: category });
      setShowQuantityModal(true);
    }
  };

  const handleConfirmQuantity = (
    productName: string,
    quantity: number
  ): void => {
    if (productToQuantify) {
      // Ensure productToQuantify is not null
      onAddItem(productName, productToQuantify.category, quantity);
    }
    setShowQuantityModal(false);
    setProductToQuantify(null);
  };

  const handleCancelQuantity = (): void => {
    setShowQuantityModal(false);
    setProductToQuantify(null);
  };

  return (
    <div className="predefined-products-container card">
      <h2 className="section-title">הוסף פריטים מהירים</h2>

      {/* Filter controls for predefined products */}
      <div className="predefined-filter-controls">
        <label htmlFor="predefined-category-filter" className="filter-label">
          סנן קטגוריה:
        </label>
        <select
          id="predefined-category-filter"
          value={filterPredefinedCategory}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setFilterPredefinedCategory(e.target.value)
          }
          className="input-field filter-select-predefined"
          aria-label="סנן קטגוריה בפריטים מהירים"
        >
          {allPredefinedCategories.map((cat: string) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <label htmlFor="predefined-search-input" className="filter-label">
          חיפוש שם:
        </label>
        <input
          id="predefined-search-input"
          type="text"
          placeholder="חיפוש פריט..."
          value={searchPredefinedTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchPredefinedTerm(e.target.value)
          }
          className="input-field flex-grow"
          aria-label="חיפוש פריט מהיר לפי שם"
        />
      </div>

      {filteredAndSortedCategoriesAndProducts.length === 0 ? (
        <p className="no-items-message">לא נמצאו פריטים תואמים.</p>
      ) : (
        filteredAndSortedCategoriesAndProducts.map((cat) => (
          <div key={cat.name} className="category-section">
            <h3 className="category-title">{cat.name}</h3>
            <div className="product-buttons-container">
              {cat.products.map((product: string) => {
                const isAdded: boolean = shoppingList.some(
                  (item) => item.name.toLowerCase() === product.toLowerCase()
                );
                return (
                  <button
                    key={product}
                    onClick={() => handleProductClick(product, cat.name)}
                    className={`product-btn ${
                      isAdded ? "product-btn-added" : "product-btn-default"
                    }`}
                  >
                    {product}
                  </button>
                );
              })}
            </div>
          </div>
        ))
      )}
      {showQuantityModal && productToQuantify && (
        <QuantitySelectionModal
          productName={productToQuantify.name}
          onConfirm={handleConfirmQuantity}
          onCancel={handleCancelQuantity}
        />
      )}
    </div>
  );
}

// הגדרת ממשק עבור Props של ProductList
interface ProductListProps {
  list: Item[];
  onToggleTaken: (itemId: number | string) => void;
  onDeleteItem: (itemId: number | string) => void;
  onClearAllItems: () => void;
  // New props for the save button and its modal
  onOpenSaveModal: () => void;
  currentShoppingListLength: number;
  saveMessage: string | null;
  messageType: "success" | "error" | null;
}

// רכיב ProductList מציג את רשימת הקניות מקובצת לפי קטגוריות
function ProductList({
  list,
  onToggleTaken,
  onDeleteItem,
  onClearAllItems,
  onOpenSaveModal,
  currentShoppingListLength,
  saveMessage,
  messageType,
}: ProductListProps) {
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: number | string;
    name: string;
  } | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] =
    useState<boolean>(false); // New state for clear all confirmation

  // קיבוץ הפריטים לפי קטגוריה
  const groupedByCategory = list.reduce(
    (groups: Record<string, Item[]>, item: Item) => {
      const category: string = item.category || "כללי"; // אם אין קטגוריה, השתמש ב'כללי'
      if (!groups[category]) {
        groups[category] = []; // צור מערך חדש אם הקטגוריה לא קיימת
      }
      groups[category].push(item); // הוסף את הפריט לקטגוריה
      return groups;
    },
    {}
  );

  // מיון הקטגוריות לפי סדר מוגדר
  const sortedCategories = Object.keys(groupedByCategory).sort(
    (a: string, b: string) => {
      const categoryOrder: Record<string, number> = {
        "ירקות ופירות": 1,
        "מוצרי מזווה": 2,
        "מוצרי חלב": 3,
        משקאות: 4,
        "בשרים, עופות ודגים": 5,
        כללי: 99,
        "פריטים שנלקחו": 100, // קטגוריה חדשה בסוף
      };
      return (categoryOrder[a] || 99) - (categoryOrder[b] || 99);
    }
  );

  const handleOpenConfirm = (
    itemId: number | string,
    itemName: string
  ): void => {
    setItemToDelete({ id: itemId, name: itemName });
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = (): void => {
    if (itemToDelete) {
      onDeleteItem(itemToDelete.id);
      setShowConfirmModal(false);
      setItemToDelete(null);
    }
  };

  const handleCancelDelete = (): void => {
    setShowConfirmModal(false);
    setItemToDelete(null);
  };

  const handleOpenClearAllConfirm = (): void => {
    setShowClearAllConfirm(true);
  };

  const handleConfirmClearAll = (): void => {
    onClearAllItems(); // Call the prop function to clear all
    setShowClearAllConfirm(false);
  };

  const handleCancelClearAll = (): void => {
    setShowClearAllConfirm(false);
  };

  return (
    <div className="product-list-container card">
      <h2 className="product-list-header">
        פריטי הרשימה
        <div className="header-buttons">
          {/* כפתור שמור רשימה נוכחית - עבר לכאן */}
          <button
            onClick={onOpenSaveModal}
            className="icon-btn icon-btn-blue save-current-list-btn"
            aria-label="שמור רשימה נוכחית"
            disabled={currentShoppingListLength === 0} // Disable if list is empty
          >
            {/* Save icon SVG */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="icon-svg"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
              />
            </svg>
          </button>

          <button
            onClick={handleOpenClearAllConfirm}
            className="icon-btn icon-btn-red clear-all-list-btn"
            aria-label="מחק את כל הרשימה"
          >
            {/* Trash icon SVG */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="icon-svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm2 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </h2>
      {saveMessage && (
        <div
          className={`save-message ${
            messageType === "success"
              ? "save-message-success"
              : "save-message-error"
          }`}
        >
          {saveMessage}
        </div>
      )}
      {sortedCategories.length === 0 ? (
        // הצג הודעה אם הרשימה ריקה
        <p className="no-items-message">הרשימה ריקה. הוסף פריטים!</p>
      ) : (
        // עבור על כל קטגוריה והצג את הפריטים שלה
        sortedCategories.map((category: string) => (
          <div
            key={category}
            className="category-section list-category-section"
          >
            <h3 className="category-title list-category-title">{category}</h3>
            <ul>
              {groupedByCategory[category].map((item: Item) => (
                <li
                  key={item.id}
                  className={`list-item ${
                    item.taken ? "list-item-taken" : "list-item-default"
                  }`}
                  onClick={() => onToggleTaken(item.id)} // Moved onClick to the li itself
                >
                  {/* עיצוב חדש: כמות, הפרדה, ואז שם המוצר */}
                  <div className="item-details-flex">
                    {item.quantity >= 1 && (
                      <span className="item-quantity">{item.quantity}</span>
                    )}
                    <span className="item-name">{item.name}</span>
                  </div>
                  <div className="item-actions">
                    <input
                      type="checkbox"
                      checked={item.taken}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        // Add event parameter
                        e.stopPropagation(); // Stop propagation to prevent li's onClick
                        onToggleTaken(item.id);
                      }}
                      className="custom-checkbox"
                    />
                    <button
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        // Add event parameter
                        e.stopPropagation(); // Stop propagation for delete button
                        handleOpenConfirm(item.id, item.name);
                      }}
                      className="item-delete-btn"
                      aria-label={`מחק ${item.name}`}
                    >
                      {/* Trash Icon SVG */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="icon-svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm2 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
      {showConfirmModal && itemToDelete && (
        <ConfirmationModal
          message={`האם אתה בטוח שברצונך למחוק את "${itemToDelete.name}"?`}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
      {showClearAllConfirm && (
        <ConfirmationModal
          message="האם אתה בטוח שברצונך למחוק את כל הפריטים מהרשימה?"
          onConfirm={handleConfirmClearAll}
          onCancel={handleCancelClearAll}
        />
      )}
    </div>
  );
}

// ממשק עבור Props של רכיב SavedLists
interface SavedListsProps {
  savedLists: SavedList[];
  onLoadList: (list: Item[]) => void;
  onDeleteSavedList: (listId: string) => void;
  currentShoppingList: Item[]; // To determine if a saved list is currently loaded
}

// רכיב SavedLists מאפשר ניהול רשימות קבועות מ-Local Storage
function SavedLists({
  savedLists,
  onLoadList,
  onDeleteSavedList,
  currentShoppingList,
}: SavedListsProps) {
  const [isLoading] = useState<boolean>(false); // No async fetching, so usually false
  const [error] = useState<string | null>(null);
  const [listToDelete, setListToDelete] = useState<string | null>(null); // State for ID of list to delete
  const [showConfirmDeleteSavedModal, setShowConfirmDeleteSavedModal] =
    useState<boolean>(false);

  // currentListId is now based on comparing the current shoppingList with saved ones
  const currentListId = useMemo(() => {
    const currentListJSON = JSON.stringify(
      currentShoppingList
        .map((item) => ({
          name: item.name,
          quantity: item.quantity,
          category: item.category,
        }))
        .sort((a, b) => a.name.localeCompare(b.name))
    );
    const matchedList = savedLists.find((savedList) => {
      const savedListItemsJSON = JSON.stringify(
        savedList.items
          .map((item) => ({
            name: item.name,
            quantity: item.quantity,
            category: item.category,
          }))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      return currentListJSON === savedListItemsJSON;
    });
    return matchedList ? matchedList.id : null;
  }, [currentShoppingList, savedLists]);

  const handleOpenDeleteSavedModal = (listId: string): void => {
    setListToDelete(listId);
    setShowConfirmDeleteSavedModal(true);
  };

  const handleConfirmDeleteSavedModal = (): void => {
    if (listToDelete) {
      onDeleteSavedList(listToDelete);
    }
    setShowConfirmDeleteSavedModal(false);
    setListToDelete(null);
  };

  const handleCancelDeleteSavedModal = (): void => {
    setShowConfirmDeleteSavedModal(false);
    setListToDelete(null);
  };

  return (
    <div className="saved-lists-container card">
      <h2 className="section-title">רשימות שמורות</h2>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {isLoading ? (
        <p className="no-items-message">טוען רשימות שמורות...</p>
      ) : savedLists.length === 0 ? (
        <p className="no-items-message">
          אין רשימות שמורות. שמור רשימה כדי לראות אותה כאן!
        </p>
      ) : (
        <ul>
          {savedLists.map((list) => (
            <li key={list.id} className="list-item saved-list-item">
              <span className="item-name">{list.name}</span>
              <div className="item-actions">
                <button
                  onClick={() => onLoadList(list.items)}
                  className={`btn btn-blue btn-small ${
                    currentListId === list.id ? "btn-disabled" : ""
                  }`}
                  disabled={currentListId === list.id} // Disable if this is the currently loaded list
                >
                  {currentListId === list.id ? "נטען" : "טען"}
                </button>
                <button
                  onClick={() => handleOpenDeleteSavedModal(list.id)}
                  className="icon-btn icon-btn-red"
                  aria-label={`מחק רשימה ${list.name}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon-svg-small"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm2 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {showConfirmDeleteSavedModal && listToDelete && (
        <ConfirmationModal
          message="האם אתה בטוח שברצונך למחוק רשימה זו לצמיתות?"
          onConfirm={handleConfirmDeleteSavedModal}
          onCancel={handleCancelDeleteSavedModal}
        />
      )}
    </div>
  );
}

// הרכיב הראשי של האפליקציה
function App() {
  const [shoppingList, setShoppingList] = useState<Item[]>(() => {
    const storedList = localStorage.getItem("shoppingList");
    if (storedList) {
      const parsedList = JSON.parse(storedList);
      return parsedList;
    } else {
      return [];
    }
  }); // מצב הרשימה, מתחיל ריק
  const [nextId, setNextId] = useState<number>(1); // מזהה ייחודי לפריטים חדשים
  const [filterCategory, setFilterCategory] = useState<string>("הכל"); // מצב עבור פילטור קטגוריות
  const [searchTerm, setSearchTerm] = useState<string>(""); // מצב חדש לחיפוש טקסטואלי
  const [showAddItemSection, setShowAddItemSection] = useState<boolean>(false); // מצב חדש להצגה/הסתרת AddItem
  const [showPredefinedSection, setShowPredefinedSection] =
    useState<boolean>(false); // מצב חדש להצגה/הסתרת PredefinedProductSelection
  const [showSavedListsSection, setShowSavedListsSection] =
    useState<boolean>(false); // New state for saved lists section

  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [listNameToSave, setListNameToSave] = useState<string>("");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(
    null
  );

  // State for saved lists from localStorage
  const [savedLists, setSavedLists] = useState<SavedList[]>(() => {
    const storedList = localStorage.getItem("savedShoppingLists");
    if (storedList) {
      const parsedList = JSON.parse(storedList);
      return parsedList;
    } else {
      return [];
    }
  });
  // New state for visual feedback on data load
  const [, setIsDataLoaded] = useState(false);

  // Load active shopping list from localStorage on initial mount
  useEffect(() => {
    try {
      const storedList = localStorage.getItem("shoppingList");
      if (storedList) {
        const parsedList: Item[] = JSON.parse(storedList);
        setShoppingList(parsedList);
        console.log(
          "Loaded active shopping list from localStorage:",
          parsedList.length,
          "items"
        );
        // Find the maximum ID in the loaded list to ensure nextId is unique
        const maxId = parsedList.reduce(
          (max, item) =>
            Math.max(max, typeof item.id === "number" ? item.id : 0),
          0
        );
        setNextId(maxId + 1);
      } else {
        console.log(
          "No active shopping list found in localStorage. Starting with empty list."
        );
      }
    } catch (error) {
      console.error("Failed to load shopping list from localStorage:", error);
      setShoppingList([]);
      setNextId(1);
    }

    // Load saved named lists from localStorage
    try {
      const storedSavedLists = localStorage.getItem("savedShoppingLists");
      if (storedSavedLists) {
        const parsedSavedLists = JSON.parse(storedSavedLists);
        setSavedLists(parsedSavedLists);
        console.log(
          "Loaded saved shopping lists from localStorage:",
          parsedSavedLists.length,
          "lists"
        );
      } else {
        console.log("No saved shopping lists found in localStorage.");
      }
    } catch (error) {
      console.error(
        "Failed to load saved shopping lists from localStorage:",
        error
      );
      setSavedLists([]);
    }
    setIsDataLoaded(true); // Set to true once data is loaded/initialized
  }, []); // Empty dependency array means this runs once on mount

  // Save active shopping list to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("shoppingList", JSON.stringify(shoppingList));
      console.log(
        "Saved active shopping list to localStorage. Current items:",
        shoppingList.length
      );
    } catch (error) {
      console.error("Failed to save shopping list to localStorage:", error);
    }
  }, [shoppingList]); // Runs whenever shoppingList changes

  // Save named lists to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("savedShoppingLists", JSON.stringify(savedLists));
      console.log(
        "Saved named shopping lists to localStorage. Current lists:",
        savedLists.length
      );
    } catch (error) {
      console.error(
        "Failed to save named shopping lists to localStorage:",
        error
      );
    }
  }, [savedLists]);

  // פונקציה לטיפול בהוספת פריט בודד
  const handleAddItem = (
    itemName: string,
    itemCategory: string,
    itemQuantity: number
  ): void => {
    const lowerCaseItemName: string = itemName.toLowerCase();
    // בדוק אם הפריט כבר קיים ברשימה
    const existingItem: Item | undefined = shoppingList.find(
      (item) => item.name.toLowerCase() === lowerCaseItemName
    );

    if (existingItem) {
      // אם קיים, סמן אותו כנלקח (אם לא כבר) והעבר אותו לקטגוריה 'פריטים שנלקחו'
      if (!existingItem.taken) {
        handleToggleTaken(existingItem.id);
      }
      return; // אל תוסיף כפילות
    }

    const newItem: Item = {
      id: nextId, // מזהה ייחודי
      name: itemName,
      category: itemCategory,
      quantity: itemQuantity, // הוספת כמות
      taken: false, // לא נלקח כברירת מחדל
      originalCategory: itemCategory, // שמור את הקטגוריה המקורית
    };
    setShoppingList((prevList: Item[]) => [...prevList, newItem]); // הוסף את הפריט לרשימה
    setNextId((prevId: number) => prevId + 1); // עדכן את המזהה הבא
  };

  // פונקציה לטיפול בהוספת רשימה כתובה
  const handleAddBulkItems = (bulkText: string): void => {
    // פצל את הטקסט לשורות, וסנן שורות ריקות
    const lines: string[] = bulkText
      .split("\n")
      .filter((line) => line.trim() !== "");
    const newItemsToAdd: Item[] = [];
    lines.forEach((line: string) => {
      const { name, category, quantity } = parseItemAndCategory(line); // נתח שם, קטגוריה וכמות
      const lowerCaseItemName: string = name.toLowerCase();

      // בדוק אם הפריט כבר קיים ברשימה
      const existingItem: Item | undefined = shoppingList.find(
        (item) => item.name.toLowerCase() === lowerCaseItemName
      );

      if (existingItem) {
        // אם קיים, סמן אותו כנלקח (אם לא כבר) והעבר אותו לקטגוריה 'פריטים שנלקחו'
        if (!existingItem.taken) {
          handleToggleTaken(existingItem.id);
        }
      } else {
        newItemsToAdd.push({
          id: nextId + Math.random(), // מזהה ייחודי (שימוש ב-Math.random למניעת התנגשויות במקרה של הוספה מהירה)
          name: name,
          category: category,
          quantity: quantity, // הוספת כמות
          taken: false,
          originalCategory: category, // שמור את הקטגוריה המקורית
        });
      }
    });
    setShoppingList((prevList: Item[]) => [...prevList, ...newItemsToAdd]); // הוסף את הפריטים החדשים לרשימה
    setNextId((prevId: number) => prevId + newItemsToAdd.length); // עדכן את המזהה הבא
  };

  // פונקציה לשינוי סטטוס "נלקח" של פריט
  const handleToggleTaken = (itemId: number | string): void => {
    setShoppingList((prevList: Item[]) => {
      return prevList.map((item: Item) => {
        if (item.id === itemId) {
          const newTakenStatus: boolean = !item.taken;
          return {
            ...item,
            taken: newTakenStatus,
            // אם סומן כנלקח, שנה קטגוריה. אם בוטל סימון, החזר לקטגוריה מקורית.
            category: newTakenStatus
              ? "פריטים שנלקחו"
              : item.originalCategory || "כללי",
            // שמור את הקטגוריה המקורית רק כשזה לא פריט שכבר נלקח
            originalCategory: item.originalCategory || item.category,
          };
        }
        return item;
      });
    });
  };

  // פונקציה למחיקת פריט בודד
  const handleDeleteItem = (itemId: number | string): void => {
    setShoppingList(shoppingList.filter((item: Item) => item.id !== itemId));
  };

  // פונקציה לניקוי כל הרשימה
  const handleClearList = (): void => {
    setShoppingList([]);
  };

  // פונקציה לטיפול בשינוי קטגוריית הפילטר
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    setFilterCategory(e.target.value);
  };

  // פונקציה לטיפול בשינוי שדה החיפוש הטקסטואלי
  const handleSearchTermChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setSearchTerm(e.target.value);
  };

  // Save current list to localStorage as a named list
  const handleSaveCurrentList = (listName: string): void => {
    if (shoppingList.length === 0) {
      console.warn("Can't save an empty list.");
      handleSaveCompletion(false);
      return;
    }

    const newSavedList: SavedList = {
      id: crypto.randomUUID(), // Generate a unique ID for the saved list
      name: listName,
      items: shoppingList,
      createdAt: Date.now(), // Use current timestamp
    };

    setSavedLists((prevSavedLists: SavedList[]) => {
      // Check if a list with the same name already exists and replace it
      const existingIndex = prevSavedLists.findIndex(
        (list) => list.name === listName
      );
      if (existingIndex > -1) {
        const updatedLists = [...prevSavedLists];
        updatedLists[existingIndex] = newSavedList;
        return updatedLists;
      }
      return [...prevSavedLists, newSavedList];
    });
    handleSaveCompletion(true);
  };

  // Load a saved list into current shopping list
  const handleLoadSavedList = (listItems: Item[]): void => {
    setShoppingList(listItems);
    // When loading a saved list, ensure nextId is consistent
    const maxId = listItems.reduce(
      (max, item) => Math.max(max, typeof item.id === "number" ? item.id : 0),
      0
    );
    setNextId(maxId + 1);
  };

  // Delete a saved list from localStorage
  const handleDeleteSavedList = (listId: string): void => {
    setSavedLists((prevSavedLists) =>
      prevSavedLists.filter((list) => list.id !== listId)
    );
  };

  // Handlers for the save modal (now in App component)
  const handleOpenSaveModal = (): void => {
    setShowSaveModal(true);
    const date = new Date();
    setListNameToSave(`רשימת קניות ${date.toLocaleDateString("he-IL")}`);
  };

  const handleSaveCompletion = (success: boolean): void => {
    if (success) {
      setSaveMessage("הרשימה נשמרה בהצלחה! ✅");
      setMessageType("success");
    } else {
      setSaveMessage("שגיאה בשמירת הרשימה. ❌");
      setMessageType("error");
    }
    setTimeout(() => {
      setSaveMessage(null);
      setMessageType(null);
    }, 5000); // Clear message after 5 seconds
  };

  const handleConfirmSave = (): void => {
    if (listNameToSave.trim()) {
      handleSaveCurrentList(listNameToSave.trim());
      setShowSaveModal(false);
      setListNameToSave("");
    }
  };

  const handleCancelSave = (): void => {
    setShowSaveModal(false);
    setListNameToSave("");
  };

  // סינון הרשימה בהתאם לקטגוריית הפילטר הנבחרת ולמונח החיפוש
  const filteredShoppingList: Item[] = useMemo(() => {
    let currentList: Item[] = shoppingList;

    // סינון לפי קטגוריה
    if (filterCategory !== "הכל") {
      currentList = currentList.filter(
        (item: Item) => item.category === filterCategory
      );
    }

    // סינון לפי מונח חיפוש
    if (searchTerm.trim() !== "") {
      const lowerCaseSearchTerm: string = searchTerm.toLowerCase();
      currentList = currentList.filter((item: Item) =>
        item.name.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }
    return currentList;
  }, [shoppingList, filterCategory, searchTerm]);

  // רשימת כל הקטגוריות לפילטר, בסדר הרצוי
  const allCategories: string[] = [
    "הכל",
    "ירקות ופירות",
    "מוצרי מזווה",
    "מוצרי חלב",
    "משקאות",
    "בשרים, עופות ודגים",
    "פריטים שנלקחו",
    "כללי",
  ];

  return (
    // עוטף את כל האפליקציה עם עיצוב רקע וריווח
    <div className="app-container">
      <style>
        {`
        /* General styles */
        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
          background-color: #1a202c; /* bg-gray-900 */
          color: #f7fafc; /* Default text color */
        }

        .app-container {
          min-height: 100vh;
          padding: 1rem; /* p-4 */
          text-align: right;
          direction: rtl;
        }

        .main-content-wrapper {
          max-width: 42rem; /* max-w-2xl */
          margin-left: auto;
          margin-right: auto;
        }

        /* Common card/section styles */
        .card {
          background-color: #2d3748; /* bg-gray-800 */
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* shadow-lg */
          border-radius: 0.5rem; /* rounded-lg */
          margin-bottom: 1.5rem; /* mb-6 */
          padding: 1rem; /* p-4 */
        }

        /* Headings */
        .section-title {
          font-size: 1.5rem; /* text-2xl */
          font-weight: 700; /* font-bold */
          color: #f7fafc; /* text-gray-100 */
          margin-bottom: 1rem; /* mb-4 */
        }
        .form-section-title {
            font-size: 1.25rem; /* text-xl */
            font-weight: 600; /* font-semibold */
            color: #e2e8f0; /* text-gray-200 */
            margin-bottom: 0.75rem; /* mb-3 */
        }
        .category-title {
            font-size: 1.25rem; /* text-xl */
            font-weight: 600; /* font-semibold */
            color: #63b3ed; /* text-blue-400 */
            margin-bottom: 0.5rem; /* mb-2 */
        }

        /* Input fields and selects */
        .input-field {
          width: 100%; /* Changed to 100% */
          padding: 0.75rem; /* p-3 */
          border: 1px solid #4a5568; /* border border-gray-600 */
          border-radius: 0.375rem; /* rounded-md */
          outline: none;
          background-color: #4a5568; /* bg-gray-700 */
          color: #f7fafc; /* text-gray-100 */
          transition: box-shadow 0.2s ease-in-out;
          box-sizing: border-box; /* Added box-sizing */
        }
        .input-field:focus {
          box-shadow: 0 0 0 2px #3182ce; /* focus:ring-2 focus:ring-blue-500 */
        }
        .input-field.flex-grow {
            flex-grow: 1;
        }
        .input-field.filter-select-predefined {
            width: auto; /* md:w-auto */
        }
        .input-field.quantity-input-small {
            width: 4rem; /* w-16 */
            padding: 0.5rem; /* p-2 */
            text-align: center;
            font-size: 1.125rem; /* text-lg */
        }
        .input-field.quantity-input {
            width: 6rem; /* w-24 */
            padding: 0.75rem; /* p-3 */
            text-align: center;
            font-size: 1.25rem; /* text-xl */
        }

        .textarea-bulk {
        width:100%; /* Changed to 100% */
            resize: vertical; /* Allow vertical resizing */
            margin-bottom:5px;
            box-sizing: border-box; /* Added box-sizing for consistency */
        }


        /* Buttons */
        .btn {
          padding: 0.75rem 1.5rem; /* px-6 py-2 */
          color: white;
          border: none;
          border-radius: 0.375rem; /* rounded-md */
          transition: background-color 0.2s ease-in-out;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); /* shadow-md */
          cursor: pointer;
        }
        .btn:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5); /* focus:ring-blue-500 equivalent */
        }
        .btn-full-width {
            width: 100%;
        }

        .btn-small {
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
            line-height: 1.25rem;
        }
        .btn-disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .btn-red {
          background-color: #c53030; /* bg-red-700 */
        }
        .btn-red:hover {
          background-color: #e53e3e; /* hover:bg-red-600 */
        }

        .btn-purple {
          background-color: #805ad5; /* bg-purple-700 */
        }
        .btn-purple:hover {
          background-color: #9f7aea; /* hover:bg-purple-600 */
        }

        .btn-blue {
          background-color: #3182ce; /* bg-blue-700 */
        }
        .btn-blue:hover {
          background-color: #4299e1; /* hover:bg-blue-600 */
        }

        .btn-green {
          background-color: #38a169; /* bg-green-700 */
        }
        .btn-green:hover {
          background-color: #48bb78; /* hover:bg-green-600 */
        }

        .btn-gray {
            background-color: #4a5568; /* bg-gray-600 */
            color: white;
        }
        .btn-gray:hover {
            background-color: #2d3748; /* hover:bg-gray-500 */
        }


        /* Specific button for icon in header */
        .icon-btn {
          padding: 0.5rem; /* p-2 */
          border-radius: 9999px; /* rounded-full */
          transition: background-color 0.2s ease-in-out;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none; /* remove default button border */
          background: transparent; /* make background transparent */
          cursor: pointer;
        }
        .icon-btn:hover {
            background-color: #4a5568; /* hover:bg-gray-700 */
        }


        .icon-btn-blue {
            color: #63b3ed; /* text-blue-400 */
        }

        .icon-btn-purple {
            color: #a78bfa; /* text-purple-400 */
        }

        .icon-btn-red {
            color: #fc8181; /* text-red-400 */
        }
        .icon-svg {
            height: 1.75rem; /* h-7 */
            width: 1.75rem; /* w-7 */
            stroke: currentColor;
            stroke-width: 2;
            fill: none; /* Ensure fill is none for stroke icons */
        }
        .icon-svg-small {
            height: 1.25rem; /* h-5 */
            width: 1.25rem; /* w-5 */
            stroke: currentColor;
            stroke-width: 2;
            fill: none;
        }

        /* Quantity controls */
        .quantity-controls-modal {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem; /* gap-3 */
            margin-bottom: 1.5rem; /* mb-6 */
        }
        .quantity-controls-inline {
            display: flex;
            align-items: center;
            gap: 0.5rem; /* gap-2 */
        }

        .quantity-control-btn {
            padding: 0.5rem; /* p-2 */
            background-color: #4a5568; /* bg-gray-700 */
            color: #f7fafc; /* text-gray-100 */
            border-radius: 9999px; /* rounded-full */
            transition: background-color 0.2s ease-in-out;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); /* shadow-md */
            width: 2.5rem; /* w-10 h-10 */
            height: 2.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem; /* text-2xl */
            font-weight: 700; /* font-bold */
            border: none;
            cursor: pointer;
        }
        .quantity-control-btn:hover {
            background-color: #2d3748; /* hover:bg-gray-600 */
        }

        .quantity-control-btn-small {
            padding: 0.5rem; /* p-2 */
            background-color: #4a5568; /* bg-gray-700 */
            color: #f7fafc; /* text-gray-100 */
            border-radius: 9999px; /* rounded-full */
            transition: background-color 0.2s ease-in-out;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); /* shadow-md */
            width: 2.25rem; /* w-9 h-9 */
            height: 2.25rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem; /* text-xl */
            font-weight: 700; /* font-bold */
            border: none;
            cursor: pointer;
        }
        .quantity-control-btn-small:hover {
            background-color: #2d3748; /* hover:bg-gray-600 */
        }

        /* Predefined product buttons */
        .product-buttons-container {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem; /* gap-2 */
        }
        .product-btn {
          padding: 0.5rem 1rem; /* px-4 py-2 */
          border-radius: 9999px; /* rounded-full */
          transition: background-color 0.2s ease-in-out;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
          font-size: 0.875rem; /* text-sm */
          border: none;
          cursor: pointer;
        }
        .product-btn-default {
          background-color: #4a5568; /* bg-gray-700 */
          color: #f7fafc; /* text-gray-100 */
        }
        .product-btn-default:hover {
          background-color: #2d3748; /* hover:bg-gray-600 */
        }
        .product-btn-added {
          background-color: #6b46c1; /* bg-purple-700 */
          color: #d6bcfa; /* text-purple-200 */
        }

        /* List items */
        .list-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem; /* p-3 */
          margin-bottom: 0.5rem; /* mb-2 */
          border-radius: 0.375rem; /* rounded-md */
          transition: all 0.2s ease-in-out;
          cursor: pointer;
        }
        .list-item-default {
          background-color: #4a5568; /* bg-gray-700 */
          color: #f7fafc; /* text-gray-100 */
        }
        .list-item-default:hover {
          background-color: #2d3748; /* hover:bg-gray-600 */
        }
        .list-item-taken {
          background-color: #553c9a; /* bg-purple-900 */
          color: #d6bcfa; /* text-purple-200 */
          text-decoration: line-through;
        }
        .saved-list-item {
            justify-content: space-between;
            align-items: center;
            display: flex;
            background-color: #4a5568;
            color: #f7fafc;
            padding: 0.75rem;
            margin-bottom: 0.5rem;
            border-radius: 0.375rem;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        .saved-list-item:hover {
            background-color: #2d3748;
        }


        .item-details-flex {
            display: flex;
            align-items: center;
            gap: 0.5rem; /* gap-2 */
        }
        .item-quantity {
          font-size: 1.125rem; /* text-lg */
          font-weight: 700; /* font-bold */
          width: 2rem; /* w-8 */
          text-align: center;
          border-left: 2px solid #4a5568; /* border-l-2 border-gray-600 */
          padding-left: 0.75rem; /* pl-3 */
        }
        .item-name {
            font-size: 1.125rem; /* text-lg */
            padding-right: 0.5rem; /* pr-2 */
        }
        .item-actions {
            display: flex;
            align-items: center;
            gap: 0.75rem; /* gap-3 */
        }

        /* Checkbox */
        .custom-checkbox {
          height: 1.25rem; /* h-5 */
          width: 1.25rem; /* w-5 */
          background-color: #4a5568; /* bg-gray-600 */
          border: 1px solid #718096; /* border-gray-500 */
          border-radius: 0.25rem; /* rounded */
          color: #63b3ed; /* text-blue-400 */
          cursor: pointer;
        }
        /* Basic styling for checkbox checkmark */
        .custom-checkbox:checked {
            background-color: #63b3ed;
            border-color: #63b3ed;
        }
        .custom-checkbox:checked::before {
            content: '✓';
            display: block;
            color: white;
            font-size: 0.8rem;
            text-align: center;
            line-height: 1.25rem;
        }


        /* Form structure */
        .form-section {
          padding: 1rem;
          border: 1px solid #4a5568; /* border-gray-700 */
          border-radius: 0.375rem; /* rounded-md */
        }
        .add-single-item-form {
            margin-bottom: 1.5rem; /* mb-6 */
        }
        .form-row-center {
            display: flex;
            flex-direction: column; /* default for mobile */
            gap: 1rem; /* gap-4 */
            margin-bottom: 1rem; /* mb-4 */
            align-items: center;
        }
        @media (min-width: 768px) { /* md breakpoint */
            .form-row-center {
                flex-direction: row;
            }
        }


        /* Category filter in main app */
        .filter-controls {
            display: flex;
            flex-direction: column;
            align-items: stretch; /* items-stretch */
            gap: 1rem; /* gap-4 */
            background-color: #2d3748; /* bg-gray-800 */
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* shadow-lg */
            border-radius: 0.5rem; /* rounded-lg */
            margin-bottom: 1.5rem; /* mb-6 */
            padding: 1rem; /* p-4 */
        }
        .filter-controls > div { /* Apply to direct children divs */
            display: flex;
            flex-direction: column;
            gap: 0.5rem; /* gap-2 */
        }
        .filter-label {
            font-size: 1.25rem; /* text-xl */
            font-weight: 600; /* font-semibold */
            color: #e2e8f0; /* text-gray-200 */
            white-space: nowrap;
        }


        /* Predefined product filter */
        .predefined-filter-controls {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin-bottom: 1rem;
        }
        @media (min-width: 768px) {
          .predefined-filter-controls {
            flex-direction: row;
            align-items: center;
          }
        }


        /* Header for ProductList and its buttons */
        .product-list-header {
            font-size: 1.5rem;
            font-weight: 700;
            color: #f7fafc;
            margin-bottom: 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: relative;
        }
        .header-buttons {
            display: flex;
            gap: 0.5rem; /* Space between buttons */
            align-items: center;
        }

        /* Specific button for list clear/save in header */
        .icon-btn.clear-all-list-btn,
        .icon-btn.save-current-list-btn {
          /* Positioning is handled by parent .product-list-header and .header-buttons */
        }
        
        .item-delete-btn {
            color: #fc8181; /* text-red-400 */
            transition: color 0.2s ease-in-out;
            outline: none;
            border-radius: 9999px; /* rounded-full */
            padding: 0.25rem; /* p-1 */
            border: none;
            background: transparent;
            cursor: pointer;
        }
        .item-delete-btn:hover {
            color: #e53e3e; /* hover:text-red-300 */
        }
        .item-delete-btn:focus {
            box-shadow: 0 0 0 2px #e53e3e; /* focus:ring-2 focus:ring-red-500 */
        }

        /* Modal specific styles */
        .modal-overlay {
            position: fixed;
            inset: 0;
            background-color: rgba(26, 32, 44, 0.75); /* bg-gray-900 bg-opacity-75 */
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 50;
            padding: 1rem;
        }
        .modal-content {
            background-color: #2d3748; /* bg-gray-800 */
            border-radius: 0.5rem; /* rounded-lg */
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* shadow-xl */
            padding: 1.5rem; /* p-6 */
            max-width: 24rem; /* max-w-sm */
            width: 100%;
            text-align: center;
            border: 1px solid #4a5568; /* border border-gray-700 */
        }
        .modal-message {
            font-size: 1.25rem; /* text-xl */
            color: #f7fafc; /* text-gray-100 */
            margin-bottom: 1.5rem; /* mb-6 */
        }
        .modal-actions {
            display: flex;
            justify-content: center;
            gap: 1rem; /* gap-4 */
        }

        /* Category section in product list */
        .category-section {
            margin-bottom: 1.5rem; /* mb-6 */
            border-bottom: 1px solid #4a5568; /* border-b border-gray-700 */
            padding-bottom: 1rem; /* pb-4 */
        }
        .category-section:last-child {
            border-bottom: none; /* last:border-b-0 */
            padding-bottom: 0;
        }

        .no-items-message {
            text-align: center;
            color: #a0aec0; /* text-gray-400 */
        }
        
        /* Save message styling */
        .save-message {
          padding: 0.75rem 1rem;
          margin-top: 1rem;
          border-radius: 0.375rem;
          font-weight: 600;
          text-align: center;
          transition: opacity 0.3s ease-in-out;
        }

        .save-message-success {
          background-color: #38a169; /* bg-green-700 */
          color: white;
        }

        .save-message-error {
          background-color: #c53030; /* bg-red-700 */
          color: white;
        }


        /* --- Responsive Adjustments --- */

        /* App Title responsiveness */
        .app-title {
          font-size: 2rem; /* Smaller on mobile */
          padding: 0.75rem; /* Smaller padding */
          display: flex; /* Added flexbox to the main title */
          align-items: center;
          justify-content: space-between; /* Pushes content and buttons to ends */
          flex-wrap: wrap; /* Allow wrapping on small screens */
          position: relative; /* Establish positioning context for children */
        }

        .app-title-text {
            flex-grow: 1; /* Allow text to take available space */
            text-align: right; /* Keep text right-aligned if it expands */
            padding-right: 0; /* Remove old padding if it causes issues */
            min-width: 0; /* Allow text to shrink */
        }

        .app-title-buttons-container {
            display: flex;
            gap: 0.5rem; /* Space between buttons */
            align-items: center;
            flex-shrink: 0; /* Prevent buttons from shrinking */
        }


        /* Adjust header buttons for smaller screens */
        .icon-btn {
          width: 2rem;
          height: 2rem;
          padding: 0.25rem;
          /* Removed absolute positioning and related overrides */
          position: static;
          top: unset;
          right: unset;
          left: unset;
          transform: none;
          margin: 0;
        }
        .icon-btn .icon-svg {
          width: 1.5rem;
          height: 1.5rem;
        }
        /* No need for .icon-btn.right and .icon-btn.left specific positioning anymore */


        /* General responsive rules for flex containers */
        @media (max-width: 767px) { /* Small screens (like mobile) */
            .app-title {
                flex-direction: column; /* Stack title and buttons vertically */
                justify-content: center; /* Center items if wrapped */
                text-align: center;
                gap: 0.75rem; /* Small gap when wrapped */
                font-size: 1.75rem;
            }
            .app-title-text {
                flex-basis: 100%; /* Text takes full width when wrapped */
                margin-bottom: 0.5rem; /* Add margin below text if wrapped */
                text-align: center;
            }
            .app-title-buttons-container {
                width: 100%; /* Buttons take full width when wrapped */
                justify-content: center; /* Center buttons when wrapped */
            }

            .form-row-center,
            .predefined-filter-controls {
                flex-direction: column;
                align-items: stretch;
                gap: 0.75rem;
            }

            .filter-controls > div {
                flex-direction: column;
                gap: 0.5rem;
            }

            .input-field.filter-select-predefined,
            .input-field.flex-grow {
                width: 100%;
            }

            .btn-full-width,
            .btn {
                width: 100%;
                padding: 0.75rem 1rem;
                font-size: 1rem;
            }

            .section-title { /* General section title, including product list header */
                font-size: 1.75rem;
            }
            .form-section-title, .filter-label {
                font-size: 1.125rem;
            }
            .category-title {
                font-size: 1.125rem;
            }

            .quantity-controls-inline .quantity-control-btn-small {
                width: 2rem;
                height: 2rem;
                font-size: 1rem;
            }
            .quantity-controls-inline .input-field.quantity-input-small {
                width: 3.5rem;
                font-size: 1rem;
            }
        }

        @media (min-width: 768px) { /* Medium screens (like tablets and desktops) */
            .app-title {
                font-size: 2.25rem;
                padding: 1rem;
                flex-direction: row; /* Ensure row direction on larger screens */
                justify-content: space-between;
                text-align: right;
            }
            .app-title-text {
                text-align: right;
                flex-basis: auto; /* Reset flex-basis */
                margin-bottom: 0; /* Remove margin */
            }
            .app-title-buttons-container {
                width: auto; /* Reset width */
                justify-content: flex-start; /* Align to start */
            }

            .icon-btn {
                width: 2.25rem;
                height: 2.25rem;
                padding: 0.5rem;
            }
            .icon-btn .icon-svg {
                width: 1.75rem;
                height: 1.75rem;
            }
            /* No need for icon-btn.right and icon-btn.left specific positioning anymore */

            .form-row-center,
            .predefined-filter-controls {
                flex-direction: row;
                align-items: center;
                gap: 1rem;
            }
            .input-field.filter-select-predefined {
                width: auto;
            }
            .btn-full-width {
                width: auto;
            }
        }

        @media (min-width: 1024px) { /* Large screens (like desktops) */
            .app-title {
                font-size: 2.5rem;
            }
        }
        `}
      </style>
      <div className="main-content-wrapper">
        {/* כותרת האפליקציה */}
        <h1 className="section-title app-title">
          <span className="app-title-text">רשימת קניות חכמה 🛒</span>
          <div className="app-title-buttons-container">
            {/* כפתור להצגה/הסתרה של חלק רשימות שמורות */}
            <button
              onClick={() => setShowSavedListsSection(!showSavedListsSection)}
              className="icon-btn icon-btn-blue"
              aria-label={
                showSavedListsSection
                  ? "הסתר רשימות שמורות"
                  : "הצג רשימות שמורות"
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon-svg"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3-7 3V5z"
                />
              </svg>
            </button>
            {/* כפתור להצגה/הסתרה של חלק הוספה ידנית/בתפזורת */}
            <button
              onClick={() => setShowAddItemSection(!showAddItemSection)}
              className="icon-btn icon-btn-purple"
              aria-label={
                showAddItemSection
                  ? "הסתר הוסף פריטים ידנית"
                  : "הצג הוסף פריטים ידנית"
              }
            >
              {showAddItemSection ? (
                // X icon when section is visible
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="icon-svg"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                // Plus icon when section is hidden
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="icon-svg"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              )}
            </button>
            {/* כפתור להצגה/הסתרה של חלק הוספת פריטים מהירים */}
            <button
              onClick={() => setShowPredefinedSection(!showPredefinedSection)}
              className="icon-btn icon-btn-purple"
              aria-label={
                showPredefinedSection
                  ? "הסתר הוסף פריטים מהירים"
                  : "הצג הוסף פריטים מהירים"
              }
            >
              {showPredefinedSection ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="icon-svg"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="icon-svg"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              )}
            </button>
          </div>
        </h1>

        {/* רכיבי הוספת פריטים - מוצגים רק אם showAddItemSection הוא true */}
        {showAddItemSection && (
          <AddItem
            onAddItem={handleAddItem}
            onAddBulkItems={handleAddBulkItems}
          />
        )}

        {/* רכיב בחירת פריטים מוגדרים מראש - מוצגים רק אם showPredefinedSection הוא true */}
        {showPredefinedSection && (
          <PredefinedProductSelection
            categoryKeywords={categoryKeywords}
            onAddItem={handleAddItem}
            shoppingList={shoppingList}
            onToggleTaken={handleToggleTaken}
          />
        )}

        {/* רכיב רשימות שמורות - מוצג רק אם showSavedListsSection הוא true */}
        {showSavedListsSection && (
          <SavedLists
            savedLists={savedLists}
            onLoadList={handleLoadSavedList}
            onDeleteSavedList={handleDeleteSavedList}
            currentShoppingList={shoppingList}
          />
        )}

        {/* בורר הפילטר, שדה חיפוש וכפתור ניקוי רשימה */}
        <div className="filter-controls">
          {/* Filter by Category */}
          <div className="filter-group">
            <label htmlFor="category-filter" className="filter-label">
              סנן לפי קטגוריה:
            </label>
            <select
              id="category-filter"
              value={filterCategory}
              onChange={handleFilterChange}
              className="input-field"
              aria-label="סנן לפי קטגוריה"
            >
              {allCategories.map((cat: string) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Search by Name */}
          <div className="filter-group">
            <label htmlFor="search-input" className="filter-label">
              חיפוש לפי שם:
            </label>
            <input
              id="search-input"
              type="text"
              placeholder="הקלד לחיפוש..."
              value={searchTerm}
              onChange={handleSearchTermChange}
              className="input-field"
              aria-label="חיפוש פריט לפי שם"
            />
          </div>
        </div>

        {/* רכיב רשימת מוצרים עם הרשימה המסוננת */}
        <ProductList
          list={filteredShoppingList}
          onToggleTaken={handleToggleTaken}
          onDeleteItem={handleDeleteItem}
          onClearAllItems={handleClearList}
          // Props for save button and its modal
          onOpenSaveModal={handleOpenSaveModal}
          currentShoppingListLength={shoppingList.length}
          saveMessage={saveMessage}
          messageType={messageType}
        />
      </div>

      {/* Save modal (now directly in App component) */}
      {showSaveModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p className="modal-message">שמור את הרשימה הנוכחית</p>
            <input
              type="text"
              placeholder="הכנס שם לרשימה"
              value={listNameToSave}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setListNameToSave(e.target.value)
              }
              className="input-field mb-4"
              aria-label="שם הרשימה לשמירה"
            />
            <div className="modal-actions">
              <button
                onClick={handleConfirmSave}
                className="btn btn-blue"
                disabled={!listNameToSave.trim()}
              >
                שמור
              </button>
              <button onClick={handleCancelSave} className="btn btn-gray">
                בטל
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App; // ייצוא הרכיב הראשי
