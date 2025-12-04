import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";

// --- פונקציות עזר גלובליות לקידוד/פענוח URL (מתוקנות לטיפול ב-UTF-8 ובטיחות URL) ---

/**
 * ממיר מחרוזת UTF-8 ל-Base64 בטוח ל-URL.
 * שימוש ב-encodeURIComponent/btoa כדי לתמוך בתווים שאינם ASCII (כגון עברית).
 */
const toBase64UrlSafe = (str: any): any => {
  try {
    // שלב 1: קידוד UTF-8
    const encoded = encodeURIComponent(str);

    // שלב 2: Base64 (לאחר טיפול ב-UTF-8)
    const base64 = btoa(encoded);

    // שלב 3: הפיכת Base64 לבטוח ל-URL (החלפת +, /, וקיטום = סופיים)
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  } catch (e: any) {
    console.error("שגיאה בקידוד Base64 URL Safe:", e);
    return "";
  }
};

/**
 * מפענח מחרוזת Base64 בטוחה ל-URL חזרה ל-UTF-8.
 */
const fromBase64UrlSafe = (str: any): any => {
  if (!str) return "";
  try {
    // שלב 1: החזרת תווים URL-Safe למצב Base64 רגיל והוספת = שאולי נקטמו
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }

    // שלב 2: פענוח Base64
    const decoded = atob(base64);

    // שלב 3: פענוח UTF-8
    return decodeURIComponent(decoded);
  } catch (e: any) {
    console.error("שגיאה בפענוח Base64 URL Safe:", e);
    return "[]"; // מחזיר JSON ריק במקרה של שגיאת פענוח
  }
};

/**
 * מקודד את רשימת הפריטים הפעילים למחרוזת URL קומפקטית.
 */
const serializeListToUrl = (items: any): any => {
  // מקודד רק פריטים שטרם נרכשו (אלה שצריך לשמור לקישור שיתוף)
  const activeItems = items.filter((item: any) => !item.purchased);
  if (!activeItems.length) return "";

  // יוצר מבנה קומפקטי
  const compactItems = activeItems.map((item: any) => ({
    n: item.name.trim(), // שם
    q: item.quantity, // כמות
  }));

  try {
    const jsonString = JSON.stringify(compactItems);
    return toBase64UrlSafe(jsonString); // שימוש בפונקציה המתוקנת
  } catch (e: any) {
    console.error("שגיאה בקידוד URL:", e);
    return "";
  }
};

/**
 * מפענח מחרוזת URL קומפקטית לרשימת פריטים.
 */
const deserializeListFromUrl = (encodedString: any): any => {
  if (!encodedString) return [];
  try {
    const jsonString = fromBase64UrlSafe(encodedString); // שימוש בפונקציה המתוקנת

    const compactItems = JSON.parse(jsonString);
    if (!Array.isArray(compactItems)) return [];

    return compactItems.map((item: any) => ({
      id: crypto.randomUUID(),
      name: (item.n || "").trim(),
      quantity: item.q > 0 ? item.q : 1, // ודא כמות חיובית
      purchased: false,
      createdAt: Date.now(),
    }));
  } catch (e: any) {
    console.error("שגיאה בפענוח URL:", e);
    return [];
  }
};

// --- לוגיקת מיון ---

/**
 * ממיין את רשימת הפריטים (פעילים למעלה, לפי זמן יצירה יורד).
 */
const sortItems = (items: any): any => {
  return [...items].sort((a: any, b: any) => {
    if (a.purchased && !b.purchased) return 1;
    if (!a.purchased && b.purchased) return -1;
    // מיון פריטים לא-קנויים/קנויים לפי זמן יצירה (החדש ביותר ראשון)
    return (b.createdAt || 0) - (a.createdAt || 0);
  });
};

// --- לוגיקת טעינת רשימה ראשונית מה-URL ---

const getInitialListFromUrl = (): any => {
  const params: any = new URLSearchParams(window.location.search);
  const encodedList: any = params.get("list");
  // טוען וממיין את הרשימה המפוענחת
  return sortItems(deserializeListFromUrl(encodedList));
};

// --- קומפוננטת Modal (תיבת הודעה/אישור) ---

const Modal = ({ message, isLoading, isConfirm, onConfirm, onClose }: any) => {
  if (!message) return null; // לא מציג את המודאל אם אין הודעה

  return (
    <div
      className={`modal-backdrop ${message ? "open" : ""}`}
      onClick={isConfirm ? onClose : undefined}
    >
      <div
        className="modal-content"
        onClick={(e: any) => e.stopPropagation()}
        dir="rtl"
      >
        {isLoading ? <div className="modal-loading"></div> : null}

        <p className="modal-message">{message}</p>

        {isConfirm && (
          <div className="modal-actions">
            <button onClick={onClose} className="modal-cancel">
              בטל
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="modal-confirm"
            >
              מחק הכל
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- קומפוננטת פריט רשימה (תומך סווייפ) ---

const SwipeListItem = ({ item, onToggle, onDelete }: any) => {
  const itemRef: any = useRef(null);
  const startX: any = useRef(0);
  const isSwiping: any = useRef(false);
  const swipeThreshold: any = 80;
  const tapThreshold: any = 10;
  const isPurchased: any = item.purchased;

  const handleClick = useCallback((): any => {
    if (!isSwiping.current) {
      onToggle(item.id, isPurchased);
    }
  }, [item.id, isPurchased, onToggle]);

  const handlePointerDown = useCallback((e: any): any => {
    if (!itemRef.current) return;
    startX.current = e.clientX;
    isSwiping.current = false;
    itemRef.current.style.transition = "none";
    itemRef.current.setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: any): any => {
    if (startX.current === 0 || !itemRef.current) return;

    const currentX: any = e.clientX;
    const distance: any = currentX - startX.current;

    if (Math.abs(distance) > tapThreshold) {
      isSwiping.current = true;
    }

    if (isSwiping.current && distance > 0) {
      // סוויפ ימינה (מחיקה ב-RTL)
      const limitedDistance: any = Math.min(
        distance,
        itemRef.current.clientWidth
      );
      itemRef.current.style.transform = `translateX(${limitedDistance}px)`;
    } else if (isSwiping.current && distance < 0) {
      itemRef.current.style.transform = `translateX(0px)`;
    }
  }, []);

  const handlePointerUp = useCallback(
    (e: any): any => {
      if (startX.current === 0 || !itemRef.current) return;

      const endX: any = e.clientX;
      const distance: any = endX - startX.current;

      itemRef.current.style.transition =
        "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s";

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
      className={`list-item ${isPurchased ? "purchased" : ""}`}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      dir="rtl"
    >
      <span className="item-name">{item.name}</span>

      <span className="item-quantity">{item.quantity}</span>
    </div>
  );
};

// --- קומפוננטת האפליקציה הראשית ---

export default function App() {
  // טעינת מצב ראשוני ישירות מה-URL
  const [listItems, setListItems] = useState<any>(getInitialListFromUrl);
  const [inputText, setInputText] = useState<any>("");
  const [modalState, setModalState] = useState<any>({
    message: "",
    isLoading: false,
    isConfirm: false,
    onConfirm: () => {},
  });

  // --- לוגיקת מודאל והודעות ---
  const showModal = useCallback(
    (
      message: any,
      isLoading: any = false,
      duration: any = 0,
      isConfirm: any = false,
      onConfirm: any = () => {}
    ): any => {
      setModalState({ message, isLoading, isConfirm, onConfirm });

      if (!isLoading && !isConfirm && duration > 0) {
        setTimeout(() => {
          setModalState({
            message: "",
            isLoading: false,
            isConfirm: false,
            onConfirm: () => {},
          });
        }, duration);
      }
    },
    []
  );

  const hideModal = useCallback(
    (): any =>
      setModalState({
        message: "",
        isLoading: false,
        isConfirm: false,
        onConfirm: () => {},
      }),
    []
  );

  /**
   * מעדכן את ה-URL של הדפדפן עם מצב הרשימה הנוכחי (לשיתוף).
   */
  const updateUrl = useCallback((items: any): any => {
    const activeItems: any = items.filter((item: any) => !item.purchased);
    const encodedList: any = serializeListToUrl(activeItems);

    if (window.location.protocol === "blob:") return;

    try {
      const url: any = new URL(window.location.href);

      if (encodedList) {
        // מעדכן את הפרמטר 'list' ב-URL
        url.searchParams.set("list", encodedList);
      } else {
        // מסיר את הפרמטר אם הרשימה ריקה
        url.searchParams.delete("list");
      }

      // מחליף את מצב ההיסטוריה ללא טעינה מחדש
      window.history.replaceState({}, "", url.toString());
    } catch (e: any) {
      console.error("שגיאה ב-updateUrl (History API):", e);
    }
  }, []);

  // **אפקט ראשי:** מגיב לכל שינוי ב-listItems ומעדכן את ה-URL
  useEffect((): any => {
    // ממיין את הפריטים לפני עדכון ה-URL כדי לשמור על עקביות
    const sortedItems: any = sortItems(listItems);
    // משתמש בפונקציה ייעודית שמעדכנת את כתובת ה-URL
    updateUrl(sortedItems);
    // הערה: אין צורך לשמור ב-localStorage
  }, [listItems, updateUrl]);

  // --- פונקציות ניהול רשימה ---

  /**
   * מנתח שורת טקסט לפריט וכמות.
   */
  const parseItemLine = (line: any): any => {
    let name: any = line.trim();
    let quantity: any = 1;

    // מנסה להתאים דפוס "מילה כלשהי + מספר בסוף"
    const match: any = name.match(/(\s*\*?\s*\d+)$/);
    if (match) {
      const quantityStr: any = match[1].replace(/[\s*]/g, "");
      quantity = parseInt(quantityStr, 10);
      if (isNaN(quantity) || quantity <= 0) quantity = 1;
      name = name.substring(0, match.index).trim();
    }

    return { name, quantity };
  };

  /**
   * מוסיף פריט חדש או רשימת פריטים מרובת שורות.
   */
  const addItem = useCallback(
    (itemText: any): any => {
      if (!itemText.trim()) return;

      const lines: any = itemText
        .split("\n")
        .filter((line: any) => line.trim() !== "");
      if (lines.length === 0) return;

      // קולט את כל השמות הקיימים (כדי למנוע כפילויות) מהמצב הנוכחי (listItems)
      // פריט שהיה קיים, ונמחק מהרשימה הפעילה בגלל קנייה, ייחשב כ'כפילות' אם מנסים להוסיף אותו שוב.
      const existingNames: any = new Set(
        listItems.map((item: any) => item.name.trim().toLowerCase())
      );

      let newItems: any = [];
      let itemsToProcess = [...lines];

      itemsToProcess.forEach((line: any) => {
        const { name, quantity }: any = parseItemLine(line);
        const normalizedName: any = name.toLowerCase();

        // סינון כפילויות
        if (name && !existingNames.has(normalizedName)) {
          newItems.push({
            id: crypto.randomUUID(),
            name: name,
            quantity: quantity,
            purchased: false,
            createdAt: Date.now(),
          });
          existingNames.add(normalizedName);
        }
      });

      setInputText(""); // מנקה את תיבת הקלט

      if (newItems.length === 0) {
        showModal("לא נוספו פריטים חדשים (ייתכן והם כבר קיימים).", false, 1500);
        return;
      }

      showModal("מוסיף פריטים...", true, 500);

      // עדכון המצב - ה-useEffect יעדכן את ה-URL
      setListItems((prevItems: any) => {
        const updatedItems: any = [...newItems, ...prevItems];
        return updatedItems;
      });

      // מודאל הצלחה לאחר עדכון המצב
      setTimeout(() => {
        showModal(`נוספו ${newItems.length} פריטים חדשים!`, false, 1000);
      }, 550);
    },
    [listItems, showModal]
  );

  /**
   * משנה את סטטוס הקנייה של פריט.
   */
  const togglePurchased = useCallback(
    (itemId: any, currentStatus: any): any => {
      setListItems((prevItems: any) => {
        const updatedItems: any = prevItems.map((item: any) =>
          item.id === itemId ? { ...item, purchased: !currentStatus } : item
        );
        // ה-useEffect יעקוב אחר השינוי הזה ויעדכן את ה-URL
        return updatedItems;
      });
    },
    []
  );

  /**
   * מוחק פריט ספציפי מהרשימה.
   */
  const deleteItem = useCallback((itemId: any): any => {
    setListItems((prevItems: any) => {
      const updatedItems: any = prevItems.filter(
        (item: any) => item.id !== itemId
      );
      // ה-useEffect יעקוב אחר השינוי הזה ויעדכן את ה-URL
      return updatedItems;
    });
  }, []);

  /**
   * מוחק את כל הפריטים ברשימה.
   */
  const clearAllItems = useCallback((): any => {
    showModal("מנקה את כל הרשימה...", true);
    setListItems([]);
    // ה-useEffect יעקוב אחר הריקה ויעדכן את ה-URL
    setTimeout(() => showModal("הרשימה נוקתה בהצלחה!", false, 1500), 500);
  }, []);

  // --- לוגיקת שיתוף (העתקה ללוח) ---
  const copyUrlToClipboard = useCallback((): any => {
    // ה-URL מעודכן אוטומטית ע"י ה-useEffect, כך שאנו רק מעתיקים אותו

    const currentUrl: any = window.location.href;

    const tempInput: any = document.createElement("textarea");
    document.body.appendChild(tempInput);
    tempInput.value = currentUrl;
    tempInput.select();

    try {
      // שימוש ב-document.execCommand('copy') כיוון ש-navigator.clipboard.writeText עלול להיחסם ב-iframe
      document.execCommand("copy");
      showModal(
        "הקישור הועתק! ניתן לשלוח אותו. שימו לב שרק פריטים פעילים נשמרים בקישור.",
        false,
        3000
      );
    } catch (err: any) {
      console.error("שגיאה בהעתקה ללוח:", err);
      showModal("שגיאה בהעתקה. אנא העתק ידנית: " + currentUrl, false);
    }
    document.body.removeChild(tempInput);
  }, [showModal]);

  // --- חישוב פריטים לצפייה ---
  const { activeItems, purchasedItems, showClearButton }: any =
    useMemo((): any => {
      const items: any = sortItems(listItems);
      return {
        activeItems: items.filter((item: any) => !item.purchased),
        purchasedItems: items.filter((item: any) => item.purchased),
        showClearButton: items.length > 0,
      };
    }, [listItems]);

  // --- ניהול גובה תיבת הטקסט ---
  const handleInputChange = (e: any): any => {
    setInputText(e.target.value);
    // התאמת גובה ה-textarea למספר השורות, עד מקסימום 5
    const lines: any = e.target.value.split("\n").length;
    e.target.rows = Math.min(Math.max(1, lines), 5);
  };

  const handleClearConfirmation = (): any => {
    showModal(
      "האם אתה בטוח שברצונך למחוק את כל רשימת הקניות?",
      false,
      0,
      true,
      clearAllItems
    );
  };

  return (
    <div dir="rtl">
      <style>
        {`
                    @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@100..900&display=swap');

                    /* הגדרות בסיסיות וכלליות */
                    body {
                        margin: 0;
                        padding: 0;
                        background-color: #000000; /* רקע שחור לגמרי */
                        color: #FFFFFF; /* טקסט כללי לבן */
                        font-family: 'Heebo', sans-serif;
                        display: flex;
                        justify-content: center;
                        min-height: 100vh;
                    }

                    .AppContainer {
                        width: 100%;
                        max-width: 500px;
                        background-color: #1a1a1a; /* כרטיס ראשי - אפור כהה מאוד */
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.7);
                    }

                    /* כותרת */
                    .header {
                        padding: 20px;
                        background-color: #111111; /* שחור כהה לכותרת */
                        border-bottom: 4px solid #e94560; /* שמירת המבטא האדום */
                        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
                        position: sticky;
                        top: 0;
                        z-index: 10;
                    }

                    .header h1 {
                        font-size: 2rem;
                        font-weight: 900;
                        color: #ffb830; /* שמירת המבטא הזהוב */
                        text-align: center;
                        margin: 0;
                    }

                    .header p {
                        font-size: 0.75rem;
                        color: #aaaaaa;
                        text-align: center;
                        margin-top: 4px;
                    }

                    /* טופס הוספה */
                    .add-form {
                        padding: 15px;
                        background-color: #1a1a1a;
                        border-bottom: 1px solid #333333;
                        position: sticky;
                        top: 92px; /* גובה הכותרת */
                        z-index: 5;
                    }

                    .input-group {
                        display: flex;
                        gap: 10px;
                        align-items: flex-end;
                    }

                    .item-input {
                        flex-grow: 1;
                        padding: 10px;
                        background-color: #2c2c2c; /* אפור בינוני כהה לשדה קלט */
                        color: #FFFFFF; /* טקסט לבן */
                        border: 1px solid #444444;
                        border-radius: 8px;
                        font-size: 1rem;
                        resize: none;
                        transition: border-color 0.2s;
                        overflow: hidden;
                    }

                    .item-input:focus {
                        outline: none;
                        border-color: #e94560;
                    }

                    /* כפתור הוספה */
                    .add-button {
                        background-color: #e94560; /* אדום כמבטא ראשי */
                        color: white;
                        font-weight: bold;
                        padding: 10px 15px;
                        height: 40px;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        transition: background-color 0.2s, box-shadow 0.2s;
                        flex-shrink: 0;
                        font-size: 1.1rem;
                    }

                    .add-button:hover {
                        background-color: #d83c54;
                        box-shadow: 0 2px 8px rgba(233, 69, 96, 0.4);
                    }

                    /* רשימת פריטים */
                    .list-container {
                        padding: 0;
                    }

                    .list-title {
                        font-size: 1.25rem;
                        font-weight: 700;
                        color: #FFFFFF; /* כותרות לבנות */
                        padding: 15px 15px 5px;
                        border-top: 1px solid #333333;
                        margin-top: 20px;
                    }
                    
                    .list-title.active-title {
                        margin-top: 0;
                        border-top: none;
                    }

                    /* בסיס לפריט ברשימה */
                    .list-item {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 15px;
                        border-bottom: 1px solid #222222;
                        cursor: pointer;
                        position: relative;
                        z-index: 1;
                        background-color: #1a1a1a; /* רקע הפריט כהה */
                        color: #FFFFFF; /* טקסט המוצר לבן */
                        transform: translateX(0);
                        transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s, background-color 0.2s;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    }

                    .list-item:hover {
                        background-color: #222222; /* אפור כהה יותר בריחוף */
                    }

                    .item-name {
                        flex-grow: 1;
                        font-size: 1.1rem;
                        font-weight: 500;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }

                    .item-quantity {
                        background-color: #3a3a3a; /* אפור כהה לכמות */
                        color: white;
                        font-weight: bold;
                        padding: 5px 12px;
                        border-radius: 6px;
                        margin-right: 15px;
                        flex-shrink: 0;
                        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
                    }

                    /* סגנון לפריט שנקנה */
                    .list-item.purchased {
                        background-color: #111111; /* כמעט שחור לפריט שנקנה */
                        color: #555555; /* טקסט אפור כהה */
                        text-decoration: line-through;
                        opacity: 0.7;
                    }
                    
                    .list-item.purchased .item-quantity {
                        background-color: #222222;
                        color: #666666;
                    }
                    
                    /* הודעה רשימה ריקה */
                    .empty-message {
                        text-align: center;
                        color: #888888;
                        padding: 30px 15px;
                        font-size: 1.1rem;
                    }

                    /* כפתורי פעולה */
                    .action-buttons {
                        padding: 15px;
                        display: flex;
                        gap: 10px;
                        margin-top: 30px;
                        padding-bottom: 30px;
                    }

                    .action-buttons button {
                        flex-grow: 1;
                        font-size: 1.1rem;
                        font-weight: 700;
                        padding: 12px 15px;
                        border-radius: 8px;
                        border: none;
                        cursor: pointer;
                        transition: all 0.2s;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                    }
                    
                    /* כפתור שיתוף */
                    .share-button {
                        background-color: #444444; /* אפור בינוני-כהה */
                        color: white;
                    }

                    .share-button:hover {
                        background-color: #333333;
                        box-shadow: 0 4px 10px rgba(68, 68, 68, 0.5);
                    }

                    /* כפתור ניקוי */
                    .clear-button {
                        background-color: transparent;
                        border: 2px solid #e94560;
                        color: #e94560;
                    }

                    .clear-button:hover {
                        background-color: #e94560;
                        color: white;
                        box-shadow: 0 4px 10px rgba(233, 69, 96, 0.5);
                    }
                    
                    /* Modal - הודעות ואישורים */
                    .modal-backdrop {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background-color: rgba(0, 0, 0, 0.8);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 1000;
                        opacity: 0;
                        pointer-events: none; /* מונע אינטראקציה כשאינו פתוח */
                        transition: opacity 0.3s ease;
                    }

                    .modal-backdrop.open {
                        opacity: 1;
                        pointer-events: auto;
                    }

                    .modal-content {
                        background-color: #1a1a1a; /* אפור פחם כהה לתוכן המודאל */
                        padding: 20px;
                        border-radius: 10px;
                        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.6);
                        max-width: 80%;
                        width: 300px;
                        text-align: center;
                        color: #FFFFFF;
                    }

                    .modal-loading {
                        border: 4px solid rgba(255, 255, 255, 0.3);
                        border-top: 4px solid #ffb830;
                        border-radius: 50%;
                        width: 30px;
                        height: 30px;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 15px;
                    }

                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }

                    .modal-message {
                        font-size: 1.1rem;
                        font-weight: 500;
                        margin: 0;
                    }
                    
                    .modal-actions {
                        display: flex;
                        justify-content: flex-end;
                        gap: 10px;
                        margin-top: 15px;
                    }
                    
                    .modal-actions button {
                        padding: 8px 15px;
                        border: none;
                        border-radius: 5px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: background-color 0.2s;
                    }
                    
                    .modal-cancel {
                        background-color: #555555; 
                        color: white;
                    }
                    .modal-cancel:hover { background-color: #444444; }
                    
                    .modal-confirm {
                        background-color: #e94560; 
                        color: white;
                    }
                    .modal-confirm:hover { background-color: #d83c54; }

                `}
      </style>

      <div className="AppContainer">
        <header className="header">
          <h1>🛒 רשימת קניות ניידת</h1>
          <p>שמירה ושיתוף מבוסס **URL בלבד** (אין שמירה מקומית)</p>
        </header>

        {/* טופס הוספת פריט */}
        <form
          onSubmit={(e: any) => {
            e.preventDefault();
            addItem(inputText);
          }}
          className="add-form"
        >
          <div className="input-group">
            <textarea
              id="item-input"
              value={inputText}
              onChange={handleInputChange}
              placeholder="הוסף פריטים (אחד בכל שורה)&#10; לדוגמה:&#10;מלפפון * 5&#10;חלב שקדים"
              rows={1}
              className="item-input"
              required
            />
            <button type="submit" className="add-button">
              הוסף
            </button>
          </div>
        </form>

        {/* רשימת הקניות הפעילה */}
        <h2 className="list-title active-title">
          לרכישה ({activeItems.length}):
        </h2>
        <div id="active-shopping-list" className="list-container">
          {activeItems.length === 0 ? (
            <p className="empty-message">
              {listItems.length === 0
                ? "הרשימה ריקה! הגיע הזמן להוסיף משהו..."
                : "כל הכבוד! אין פריטים פעילים כרגע."}
            </p>
          ) : (
            activeItems.map((item: any) => (
              <SwipeListItem
                key={item.id}
                item={item}
                onToggle={togglePurchased}
                onDelete={deleteItem}
              />
            ))
          )}
        </div>

        {/* פריטים שנקנו */}
        {purchasedItems.length > 0 && (
          <React.Fragment>
            <h2 id="purchased-header" className="list-title">
              ✔️ פריטים שנקנו ({purchasedItems.length})
            </h2>

            <div id="purchased-shopping-list" className="list-container">
              {purchasedItems.map((item: any) => (
                <SwipeListItem
                  key={item.id}
                  item={item}
                  onToggle={togglePurchased}
                  onDelete={deleteItem}
                />
              ))}
            </div>
          </React.Fragment>
        )}

        {/* כפתורי פעולה */}
        <div className="action-buttons">
          <button
            onClick={copyUrlToClipboard}
            className="share-button"
            type="button"
          >
            🔗 העתק קישור שיתוף
          </button>

          <button
            onClick={handleClearConfirmation}
            className="clear-button"
            type="button"
            style={{ display: showClearButton ? "block" : "none" }}
          >
            🗑️ נקה הכל
          </button>
        </div>
      </div>

      {/* Modal - הודעות ואישורים מותאמים אישית */}
      <Modal
        message={modalState.message}
        isLoading={modalState.isLoading}
        isConfirm={modalState.isConfirm}
        onConfirm={modalState.onConfirm}
        onClose={hideModal}
      />
    </div>
  );
}
