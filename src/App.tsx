import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";

// --- ממשקים (Interfaces) ---

/**
 * ייצוג פריט בודד ברשימת הקניות.
 */
interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  purchased: boolean;
  createdAt: number;
}

// --- פונקציות עזר לקידוד/פענוח Base64 (תומך UTF-8) ---

/**
 * ממיר מחרוזת UTF-8 ל-Base64 בטוח ל-URL.
 * @param str - המחרוזת לקידוד
 * @returns מחרוזת Base64 מקודדת
 */
const toBase64 = (str: string): string => {
  try {
    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      )
    );
  } catch (e) {
    console.error("שגיאה בקידוד Base64:", e);
    return "";
  }
};

/**
 * מפענח מחרוזת Base64 חזרה ל-UTF-8.
 * @param str - מחרוזת Base64 מקודדת
 * @returns המחרוזת המקורית
 */
const fromBase64 = (str: string): string => {
  try {
    const latin1String = atob(str);
    const percentEncoded = latin1String
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("");
    return decodeURIComponent(percentEncoded);
  } catch (e) {
    console.error("שגיאה בפענוח Base64:", e);
    return "";
  }
};

/**
 * מקודד את רשימת הפריטים הפעילים למחרוזת URL קומפקטית.
 * מקודד רק פריטים שעדיין לא נקנו.
 * @param items - רשימת הפריטים
 * @returns מחרוזת Base64 מקודדת של הרשימה
 */
const serializeListToUrl = (items: ShoppingItem[]): string => {
  const activeItems = items.filter((item) => !item.purchased);
  if (!activeItems.length) return "";

  const compactItems = activeItems.map((item) => ({
    n: item.name,
    q: item.quantity,
  }));

  try {
    const jsonString = JSON.stringify(compactItems);
    return toBase64(jsonString);
  } catch (e) {
    console.error("שגיאה בקידוד URL:", e);
    return "";
  }
};

/**
 * מפענח מחרוזת URL קומפקטית לרשימת פריטים.
 * @param encodedString - מחרוזת Base64 מקודדת
 * @returns רשימת פריטים
 */
const deserializeListFromUrl = (encodedString: string): ShoppingItem[] => {
  if (!encodedString) return [];
  try {
    const jsonString = fromBase64(encodedString);
    const compactItems = JSON.parse(jsonString) as { n: string; q: number }[];

    return compactItems.map((item) => ({
      id: crypto.randomUUID(),
      name: item.n,
      quantity: item.q || 1,
      purchased: false,
      createdAt: Date.now(),
    }));
  } catch (e) {
    console.error("שגיאה בפענוח URL:", e);
    return [];
  }
};

// --- לוגיקת Local Storage ---
const LOCAL_STORAGE_KEY = "local_shopping_list_react";

/**
 * טוען את הרשימה מ-localStorage.
 * @returns רשימת הפריטים השמורה
 */
const localLoadList = (): ShoppingItem[] => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    const items = data ? JSON.parse(data) : [];
    // מבטיח שכל פריט מכיל createdAt ו-id
    return items.map((item: any) => ({
      ...item,
      id: item.id || crypto.randomUUID(),
      createdAt: item.createdAt || Date.now(),
      quantity: item.quantity || 1,
    }));
  } catch (e) {
    console.error("שגיאה בטעינה מ-localStorage:", e);
    return [];
  }
};

/**
 * ממיין את רשימת הפריטים (פעילים קודם, אח"כ לפי זמן יצירה).
 * @param items - רשימת הפריטים
 * @returns רשימה ממוינת
 */
const sortItems = (items: ShoppingItem[]): ShoppingItem[] => {
  return [...items].sort((a, b) => {
    // 1. פריטים שנקנו באים אחרונים
    if (a.purchased && !b.purchased) return 1;
    if (!a.purchased && b.purchased) return -1;
    // 2. פריטים פעילים ממוינים לפי זמן יצירה (החדשים קודם)
    return (b.createdAt || 0) - (a.createdAt || 0);
  });
};

// --- קומפוננטת כפתור שיתוף ---

interface ShareButtonProps {
  onShare: () => void;
}

const ShareButton: React.FC<ShareButtonProps> = React.memo(({ onShare }) => (
  <button
    onClick={onShare}
    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-xl transition duration-300 flex items-center justify-center text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
    type="button"
    dir="rtl"
  >
    🔗 שתף רשימה
  </button>
));

// --- קומפוננטת פריט רשימה (תומך סווייפ) ---

interface ListItemProps {
  item: ShoppingItem;
  onToggle: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string) => void;
}

const SwipeListItem: React.FC<ListItemProps> = React.memo(
  ({ item, onToggle, onDelete }) => {
    const itemRef = useRef<HTMLDivElement>(null);
    const startX = useRef(0);
    const isSwiping = useRef(false);
    const swipeThreshold = 80;
    const tapThreshold = 10;
    const isPurchased = item.purchased;

    // הפונקציה המופעלת כאשר הפריט נלחץ (אם לא היה סווייפ)
    const handleClick = useCallback(() => {
      if (!isSwiping.current) {
        onToggle(item.id, isPurchased);
      }
    }, [item.id, isPurchased, onToggle]);

    // פונקציות ניהול אירועי מגע/עכבר
    const handlePointerDown = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (!itemRef.current) return;
        startX.current = e.clientX;
        isSwiping.current = false;
        itemRef.current.style.transition = "none"; // מבטל אנימציות בזמן גרירה
        itemRef.current.setPointerCapture(e.pointerId); // לוכד את האירועים
      },
      []
    );

    const handlePointerMove = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (startX.current === 0 || !itemRef.current) return;

        const currentX = e.clientX;
        const distance = currentX - startX.current;

        if (Math.abs(distance) > tapThreshold) {
          isSwiping.current = true;
        }

        if (isSwiping.current && distance > 0) {
          // סוויפ ימינה (מחיקה ב-RTL)
          const limitedDistance = Math.min(
            distance,
            itemRef.current.clientWidth
          );
          itemRef.current.style.transform = `translateX(${limitedDistance}px)`;
        } else if (isSwiping.current && distance < 0) {
          // מונע משיכה שמאלה (או משיכה מינימלית)
          itemRef.current.style.transform = `translateX(0px)`;
        }
      },
      []
    );

    const handlePointerUp = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (startX.current === 0 || !itemRef.current) return;

        const endX = e.clientX;
        const distance = endX - startX.current;

        itemRef.current.style.transition =
          "transform 0.3s ease-out, opacity 0.3s ease-out";
        itemRef.current.releasePointerCapture(e.pointerId);

        if (distance > swipeThreshold) {
          // מחיקה
          itemRef.current.style.transform = `translateX(${itemRef.current.clientWidth}px)`;
          itemRef.current.style.opacity = "0";

          setTimeout(() => {
            onDelete(item.id);
          }, 300);
        } else {
          // החזרה למקום
          itemRef.current.style.transform = "translateX(0)";
        }

        // איפוס
        startX.current = 0;
        isSwiping.current = false;
      },
      [item.id, onDelete]
    );

    return (
      <div
        ref={itemRef}
        id={`item-${item.id}`}
        className={`list-item flex justify-between items-center p-4 text-gray-100 border-b border-gray-700/50 cursor-pointer relative z-10
                ${
                  isPurchased
                    ? "purchased-item line-through bg-gray-900/70 opacity-60"
                    : "bg-gray-800 hover:bg-gray-700 font-semibold"
                }
            `}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        dir="rtl"
      >
        <span className="text-lg font-medium flex-1 truncate">{item.name}</span>

        <span
          className={`text-base text-white font-bold rounded-md py-1 px-3 flex-shrink-0 mr-3 shadow-md
                ${isPurchased ? "bg-green-700" : "bg-red-700"}
            `}
        >
          {item.quantity}
        </span>
      </div>
    );
  }
);

// --- קומפוננטת האפליקציה הראשית ---

const App: React.FC = () => {
  const [listItems, setListItems] = useState<ShoppingItem[]>(() =>
    sortItems(localLoadList())
  );
  const [inputText, setInputText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    message: "",
    isLoading: false,
    isConfirm: false,
    onConfirm: () => {},
  });

  // פונקציית שמירה ל-localStorage ועדכון URL
  const localSaveList = useCallback((items: ShoppingItem[]) => {
    const sortedItems = sortItems(items);
    setListItems(sortedItems);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sortedItems));
    } catch (e) {
      console.error("שגיאה בשמירה ל-localStorage:", e);
    }
  }, []);

  /**
   * מעדכן את ה-URL של הדפדפן עם מצב הרשימה הנוכחי (לשיתוף).
   * @param items - הרשימה הנוכחית
   */
  const updateUrl = useCallback((items: ShoppingItem[]) => {
    const activeItems = items.filter((item) => !item.purchased);
    const encodedList = serializeListToUrl(activeItems);

    // **תיקון שגיאת אבטחה ב-iFrame/Blob URL**
    // אם הפרוטוקול הוא blob:, אין אפשרות לשנות את ה-URL באמצעות replaceState.
    if (window.location.protocol === "blob:") {
      return;
    }

    try {
      const url = new URL(window.location.href);

      if (encodedList) {
        url.searchParams.set("list", encodedList);
      } else {
        url.searchParams.delete("list");
      }

      window.history.replaceState({}, "", url.toString());
    } catch (e) {
      console.error("שגיאה ב-updateUrl (History API):", e);
    }
  }, []);

  // הפעלת עדכון URL בכל פעם שהרשימה משתנה
  useEffect(() => {
    updateUrl(listItems);
  }, [listItems, updateUrl]);

  // --- לוגיקת אתחול וטעינה מ-URL ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encodedList = params.get("list");

    if (encodedList) {
      showModal("טוען רשימה משותפת...", true);
      const urlItems = deserializeListFromUrl(encodedList);

      if (urlItems.length > 0) {
        const currentItems = localLoadList();
        // מוסיף את הפריטים החדשים לתחילת הרשימה הקיימת
        localSaveList([...urlItems, ...currentItems]);

        setTimeout(() => showModal("הרשימה נטענה בהצלחה!", false, 1500), 500);

        // ניקוי הפרמטר מה-URL
        if (window.location.protocol !== "blob:") {
          const url = new URL(window.location.href);
          url.searchParams.delete("list");
          window.history.replaceState({}, "", url.toString());
        }
      } else {
        showModal("שגיאה בטעינת הרשימה מהקישור.", false, 1500);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // מופעל רק בהרצה הראשונה

  // --- פונקציות ניהול רשימה ---

  /**
   * מנתח שורת טקסט לפריט וכמות.
   * @param line - שורת טקסט (כגון "חלב * 2")
   * @returns {name: string, quantity: number}
   */
  const parseItemLine = (line: string): { name: string; quantity: number } => {
    let name = line.trim();
    let quantity = 1;
    // מתאים למבנה: "שם * 2" או "שם 2"
    const match = name.match(/(\s*\*?\s*\d+)$/);
    if (match) {
      const quantityStr = match[1].replace(/[\s*]/g, "");
      quantity = parseInt(quantityStr, 10);
      if (isNaN(quantity) || quantity <= 0) quantity = 1;
      name = name.substring(0, match.index).trim();
    }
    return { name, quantity };
  };

  /**
   * מוסיף פריט חדש או רשימת פריטים.
   * @param itemText - טקסט הפריט (יכול להיות מרובה שורות)
   */
  const addItem = useCallback(
    (itemText: string) => {
      if (!itemText.trim()) return;

      const lines = itemText.split("\n").filter((line) => line.trim() !== "");
      if (lines.length === 0) return;

      showModal("מוסיף פריטים...", true);

      setListItems((prevItems) => {
        let newItems: ShoppingItem[] = [];
        lines.forEach((line) => {
          const { name, quantity } = parseItemLine(line);
          if (name) {
            newItems.push({
              id: crypto.randomUUID(),
              name: name,
              quantity: quantity,
              purchased: false,
              createdAt: Date.now(),
            });
          }
        });
        // מוסיף את הפריטים החדשים בראש הרשימה
        const updatedItems = [...newItems, ...prevItems];
        localSaveList(updatedItems);
        showModal("הפריטים נוספו בהצלחה!", false, 1000);
        return updatedItems;
      });

      setInputText("");
    },
    [localSaveList]
  );

  /**
   * משנה את סטטוס הקנייה של פריט (פעיל / נקנה).
   * @param itemId - ID הפריט
   * @param currentStatus - הסטטוס הנוכחי (purchased)
   */
  const togglePurchased = useCallback(
    (itemId: string, currentStatus: boolean) => {
      setListItems((prevItems) => {
        const updatedItems = prevItems.map((item) =>
          item.id === itemId ? { ...item, purchased: !currentStatus } : item
        );
        localSaveList(updatedItems);
        return updatedItems;
      });
    },
    [localSaveList]
  );

  /**
   * מוחק פריט ספציפי מהרשימה.
   * @param itemId - ID הפריט למחיקה
   */
  const deleteItem = useCallback(
    (itemId: string) => {
      setListItems((prevItems) => {
        const updatedItems = prevItems.filter((item) => item.id !== itemId);
        localSaveList(updatedItems);
        return updatedItems;
      });
    },
    [localSaveList]
  );

  /**
   * מוחק את כל הפריטים ברשימה.
   */
  const clearAllItems = useCallback(() => {
    showModal("מנקה את כל הרשימה...", true);
    setListItems([]);
    localSaveList([]); // שמירה של מערך ריק
    setTimeout(() => showModal("הרשימה נוקתה בהצלחה!", false, 1500), 500);
  }, [localSaveList]);

  // --- לוגיקת מודאל והודעות ---
  const showModal = useCallback(
    (
      message: string,
      isLoading: boolean = false,
      duration: number = 0,
      isConfirm: boolean = false,
      onConfirm: () => void = () => {}
    ) => {
      setModalContent({ message, isLoading, isConfirm, onConfirm });
      setIsModalOpen(true);

      if (!isLoading && !isConfirm && duration > 0) {
        setTimeout(() => {
          setIsModalOpen(false);
        }, duration);
      }
    },
    []
  );

  const hideModal = useCallback(() => setIsModalOpen(false), []);

  // --- לוגיקת שיתוף ---
  const copyUrlToClipboard = useCallback(() => {
    // לוודא שה-URL הנוכחי מעודכן לפני ההעתקה
    updateUrl(listItems);

    const currentUrl = window.location.href;

    const tempInput = document.createElement("textarea");
    document.body.appendChild(tempInput);
    tempInput.value = currentUrl;
    tempInput.select();

    try {
      // שימוש ב-execCommand כיוון ש-navigator.clipboard עלול להיכשל ב-iFrame
      document.execCommand("copy");
      showModal("הקישור הועתק! ניתן לשלוח אותו.", false, 2000);
    } catch (err) {
      console.error("שגיאה בהעתקה ללוח:", err);
      showModal("שגיאה בהעתקה. אנא העתק ידנית: " + currentUrl, false);
    }
    document.body.removeChild(tempInput);
  }, [updateUrl, listItems, showModal]);

  // --- חישוב פריטים לצפייה ---
  const { activeItems, purchasedItems, showClearButton } = useMemo(() => {
    const items = sortItems(listItems);
    return {
      activeItems: items.filter((item) => !item.purchased),
      purchasedItems: items.filter((item) => item.purchased),
      showClearButton: items.length > 0,
    };
  }, [listItems]);

  // --- ניהול גובה תיבת הטקסט ---
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    // התאמת גובה התיבה לפי מספר השורות (מינימום 1, מקסימום 5)
    const lines = e.target.value.split("\n").length;
    e.target.rows = Math.min(Math.max(1, lines), 5);
  };

  const handleClearConfirmation = () => {
    showModal(
      "האם אתה בטוח שברצונך למחוק את כל רשימת הקניות?",
      false,
      0,
      true,
      clearAllItems
    );
  };

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen">
      {/* מיכל מרכזי מוגבל רוחב למובייל */}
      <div
        className="mobile-container max-w-4xl min-h-screen mx-auto shadow-2xl bg-gray-900"
        dir="rtl"
      >
        {/* כותרת עליונה */}
        <header className="p-4 bg-gray-800 border-b-4 border-red-700 shadow-lg sticky top-0 z-20">
          <h1 className="text-3xl font-black text-red-400 text-center">
            🛒 רשימת קניות ניידת
          </h1>
          <p className="text-xs text-gray-400 text-center mt-1">
            מצב מקומי (Local Storage) עם קישור שיתוף
          </p>
        </header>

        {/* טופס הוספת פריט */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addItem(inputText);
          }}
          className="p-4 bg-gray-800 sticky top-[92px] z-10 border-b border-gray-700 shadow-md"
        >
          <div className="flex gap-2 items-end">
            <textarea
              id="item-input"
              value={inputText}
              onChange={handleInputChange}
              placeholder="הוסף פריטים (אחד בכל שורה)&#10; לדוגמה:&#10;מלפפון * 5&#10;חלב שקדים"
              rows={1}
              className="flex-1 p-3 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:outline-none focus:border-red-500 placeholder-gray-400 text-right resize-none overflow-hidden transition-all duration-100"
              required
            />
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white font-bold p-3 h-10 rounded-lg shadow-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 flex items-center justify-center whitespace-nowrap text-lg"
            >
              הוסף
            </button>
          </div>
        </form>

        {/* כותרת רשימה פעילה */}
        <h2 className="text-xl font-bold text-gray-200 pt-4 px-4 pb-2">
          לרכישה ({activeItems.length}):
        </h2>

        {/* רשימת הקניות הפעילה */}
        <div
          id="active-shopping-list"
          className="mt-0 divide-y divide-gray-700/50"
        >
          {activeItems.length === 0 ? (
            <p className="text-gray-500 text-center p-6 text-lg">
              {listItems.length === 0
                ? "הרשימה ריקה! הגיע הזמן להוסיף משהו..."
                : "כל הכבוד! אין פריטים פעילים כרגע."}
            </p>
          ) : (
            activeItems.map((item) => (
              <SwipeListItem
                key={item.id}
                item={item}
                onToggle={togglePurchased}
                onDelete={deleteItem}
              />
            ))
          )}
        </div>

        {/* כותרת פריטים שנקנו */}
        {purchasedItems.length > 0 && (
          <>
            <h2
              id="purchased-header"
              className="text-xl font-bold text-gray-400 pt-8 px-4 pb-2 border-t border-gray-700 mt-4"
            >
              ✔️ פריטים שנקנו ({purchasedItems.length})
            </h2>

            {/* רשימת הפריטים שנקנו */}
            <div
              id="purchased-shopping-list"
              className="mt-0 divide-y divide-gray-800/50"
            >
              {purchasedItems.map((item) => (
                <SwipeListItem
                  key={item.id}
                  item={item}
                  onToggle={togglePurchased}
                  onDelete={deleteItem}
                />
              ))}
            </div>
          </>
        )}

        {/* כפתורי פעולה (שיתוף ומחיקה) */}
        <div className="p-4 mt-8 flex gap-3 pb-8">
          <ShareButton onShare={copyUrlToClipboard} />

          <button
            onClick={handleClearConfirmation}
            className={`flex-1 bg-transparent border border-red-700 text-red-400 hover:bg-red-700 hover:text-white font-bold py-3 rounded-lg shadow-xl transition duration-300 text-lg
                            ${showClearButton ? "" : "hidden"}
                        `}
            type="button"
          >
            🗑️ נקה הכל
          </button>
        </div>
      </div>

      {/* Modal - הודעות ואישורים מותאמים אישית */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center transition-opacity duration-300 z-50 opacity-100"
          onClick={modalContent.isConfirm ? hideModal : undefined} // סגירה רק אם זה לא מודאל אישור
        >
          <div
            className="bg-gray-800 text-white rounded-xl shadow-2xl max-w-xs mx-4 text-center"
            onClick={(e) => e.stopPropagation()} // מונע סגירה בלחיצה על המודאל עצמו
          >
            <div className="flex flex-col items-center p-6">
              {modalContent.isLoading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
              ) : null}

              <p className="text-lg font-semibold mb-4">
                {modalContent.message}
              </p>

              {modalContent.isConfirm && (
                <div className="flex justify-end gap-3 w-full mt-2">
                  <button
                    onClick={hideModal}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                  >
                    בטל
                  </button>
                  <button
                    onClick={() => {
                      modalContent.onConfirm();
                      hideModal();
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                  >
                    מחק הכל
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
